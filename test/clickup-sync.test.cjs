const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const yaml = require('js-yaml');

const { collectSyncEntries, syncClickUp } = require('../scripts/sync-clickup.cjs');
const { jsonResponse, withClickUpValidation } = require('./clickup-test-helpers.cjs');

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

test('workflow creates missing tasks before syncing sprint status', async () => {
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'sync-clickup.yml');
  const workflow = yaml.load(await fs.readFile(workflowPath, 'utf8'));

  assert.ok(workflow.on.workflow_dispatch);
  assert.deepEqual(workflow.on.push.paths, [
    '_bmad-output/implementation-artifacts/**/sprint-status.yaml',
    'clickup-sync.yaml',
    'scripts/clickup-lib.cjs',
    'scripts/create-clickup-task.cjs',
    'scripts/sync-clickup.cjs',
    '.github/workflows/sync-clickup.yml',
  ]);
  assert.deepEqual(workflow.on.push.branches, ['main']);
  assert.equal(workflow.permissions.contents, 'read');
  assert.equal(workflow.jobs.sync.needs, 'create-if-missing');
  assert.deepEqual(workflow.concurrency, { group: 'clickup-sync-main', 'cancel-in-progress': false });

  const createSteps = workflow.jobs['create-if-missing'].steps;
  assert.ok(createSteps.some((step) => step.run === 'npm run create:clickup'));

  const syncSteps = workflow.jobs.sync.steps;
  assert.ok(syncSteps.some((step) => step.uses === 'actions/setup-node@v4' && step.with?.['node-version'] === '20'));
  assert.ok(syncSteps.some((step) => step.run === 'npm ci'));
  assert.deepEqual(syncSteps.find((step) => step.run === 'npm run sync:clickup'), {
    run: 'npm run sync:clickup',
    env: { CLICKUP_API_TOKEN: '${{ secrets.CLICKUP_API_TOKEN }}' },
  });
});

async function createFixture({ config, status = 'in-progress', storyKey = '1-99-test-story' } = {}) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clickup-sync-'));
  temporaryDirectories.push(rootDir);
  const sourcePath = path.join(rootDir, '_bmad-output/implementation-artifacts/platform/sprint-status.yaml');
  const configPath = path.join(rootDir, 'clickup-sync.yaml');
  const sourceKey = `_bmad-output/implementation-artifacts/platform/sprint-status.yaml#${storyKey}`;
  await fs.mkdir(path.dirname(sourcePath), { recursive: true });
  await fs.writeFile(sourcePath, `development_status:\n  ${storyKey}: ${status}\n`);
  await fs.writeFile(configPath, config ?? [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'tasks:',
    `  "${sourceKey}":`,
    '    task_id: "task-123"',
    '    git_branch: feature/story-1',
    '    validation_status: passed',
  ].join('\n'));
  return { configPath, rootDir, sourcePath, sourceKey, storyKey };
}

function successfulClickUpResponse(url, init = {}, validationOptions = {}) {
  const inner = (url, init = {}) => {
    if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
    if (url.includes('/task/') && !init.method && !url.includes('/field/')) {
      return jsonResponse(200, { team_id: '90122019689' });
    }
    return jsonResponse(200, {});
  };
  return withClickUpValidation(inner, validationOptions)(url, init);
}

test('collectSyncEntries maps configured BMad development status entries', async () => {
  const fixture = await createFixture();

  const entries = await collectSyncEntries({ ...fixture, sprintStatusPaths: [fixture.sourcePath] });

  assert.deepEqual(entries, [{
    sourceKey: '_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story',
    taskId: 'task-123',
    status: 'IN PROGRESS',
    gitBranch: 'feature/story-1',
    validationStatus: 'passed',
  }]);
});

test('syncClickUp stops after team authorization when expected workspace is absent', async () => {
  const fixture = await createFixture();
  const requests = [];
  const fetchImpl = async (url, init) => {
    requests.push({ url, init });
    return jsonResponse(200, { teams: [{ id: 'different-workspace' }] });
  };

  await assert.rejects(
    syncClickUp({ ...fixture, sprintStatusPaths: [fixture.sourcePath], token: 'secret-token', fetchImpl }),
    /90122019689/,
  );

  assert.deepEqual(requests.map(({ url }) => url), ['https://api.clickup.com/api/v2/team']);
});

test('syncClickUp rejects a task from another workspace before any task write', async () => {
  const fixture = await createFixture();
  const requests = [];
  const fetchImpl = withClickUpValidation(async (url, init = {}) => {
    requests.push({ url, init });
    if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
    if (url.endsWith('/task/task-123')) return jsonResponse(200, { team_id: 'different-workspace' });
    return jsonResponse(200, {});
  });

  await assert.rejects(
    syncClickUp({ ...fixture, sprintStatusPaths: [fixture.sourcePath], token: 'secret-token', fetchImpl }),
    /task-123.*90122019689/,
  );

  assert.ok(!requests.some(({ init }) => init.method === 'PUT' || init.method === 'POST'));
});

test('syncClickUp compares the task workspace ID without type coercion before writing', async () => {
  const fixture = await createFixture();
  const requests = [];

  await assert.rejects(
    syncClickUp({
      ...fixture,
      sprintStatusPaths: [fixture.sourcePath],
      token: 'secret-token',
      fetchImpl: withClickUpValidation(async (url, init = {}) => {
        requests.push({ url, init });
        if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
        if (url.endsWith('/task/task-123')) return jsonResponse(200, { team_id: 90122019689 });
        return jsonResponse(200, {});
      }),
    }),
    /task-123.*90122019689/,
  );

  assert.ok(!requests.some(({ init }) => init.method === 'PUT' || init.method === 'POST'));
});

test('syncClickUp does not write tasks when every BMad entry is unmapped', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'tasks: {}',
  ].join('\n') });
  const requests = [];

  await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return jsonResponse(200, { teams: [{ id: '90122019689' }] });
    },
  });

  assert.deepEqual(requests.map(({ url }) => url), ['https://api.clickup.com/api/v2/team']);
});

test('syncClickUp sends the mapped status with the expected request boundary', async () => {
  const fixture = await createFixture();
  const requests = [];

  await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: async (url, init = {}) => {
      requests.push({ url, init });
      return successfulClickUpResponse(url, init);
    },
  });

  const writeRequests = requests.filter(({ init }) => init.method === 'PUT' || init.method === 'POST');
  assert.deepEqual(writeRequests, [{
    url: 'https://api.clickup.com/api/v2/task/task-123',
    init: {
      method: 'PUT',
      headers: {
        Authorization: 'secret-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'IN PROGRESS' }),
    },
  }]);
});

test('syncClickUp writes mapped custom fields after the successful status update', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'custom_fields:',
    '  git_branch: "git-branch-field"',
    '  validation_status: "validation-status-field"',
    'tasks:',
    '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
    '    task_id: "task-123"',
    '    git_branch: "feature/story-1"',
    '    validation_status: "passed"',
  ].join('\n') });
  const requests = [];

  await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: async (url, init = {}) => {
      requests.push({ url, init });
      return successfulClickUpResponse(url, init);
    },
  });

  assert.deepEqual(requests.filter(({ init }) => init.method === 'PUT' || init.method === 'POST'), [
    {
      url: 'https://api.clickup.com/api/v2/task/task-123',
      init: {
        method: 'PUT',
        headers: { Authorization: 'secret-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN PROGRESS' }),
      },
    },
    {
      url: 'https://api.clickup.com/api/v2/task/task-123/field/git-branch-field',
      init: {
        method: 'POST',
        headers: { Authorization: 'secret-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'feature/story-1' }),
      },
    },
    {
      url: 'https://api.clickup.com/api/v2/task/task-123/field/validation-status-field',
      init: {
        method: 'POST',
        headers: { Authorization: 'secret-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'passed' }),
      },
    },
  ]);
});

test('syncClickUp writes custom fields only with both a configured ID and mapped value', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'custom_fields:',
    '  git_branch: "git-branch-field"',
    '  validation_status: ""',
    'tasks:',
    '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
    '    task_id: "task-123"',
    '    git_branch: "feature/story-1"',
    '    validation_status: "passed"',
  ].join('\n') });
  const requests = [];

  await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: async (url, init = {}) => {
      requests.push({ url, init });
      return successfulClickUpResponse(url, init);
    },
  });

  assert.deepEqual(requests.filter(({ init }) => init.method === 'PUT' || init.method === 'POST').map(({ url }) => url), [
    'https://api.clickup.com/api/v2/task/task-123',
    'https://api.clickup.com/api/v2/task/task-123/field/git-branch-field',
  ]);
});

test('syncClickUp skips a configured custom field when its mapped value is empty', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'custom_fields:',
    '  git_branch: "git-branch-field"',
    '  validation_status: "validation-status-field"',
    'tasks:',
    '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
    '    task_id: "task-123"',
    '    git_branch: ""',
    '    validation_status: "passed"',
  ].join('\n') });
  const requests = [];

  await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: async (url, init = {}) => {
      requests.push({ url, init });
      return successfulClickUpResponse(url, init);
    },
  });

  assert.deepEqual(requests.filter(({ init }) => init.method === 'PUT' || init.method === 'POST').map(({ url }) => url), [
    'https://api.clickup.com/api/v2/task/task-123',
    'https://api.clickup.com/api/v2/task/task-123/field/validation-status-field',
  ]);
});

test('syncClickUp reports custom field failures without revealing the token', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'custom_fields:',
    '  git_branch: "git-branch-field"',
    'tasks:',
    '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
    '    task_id: "task-123"',
    '    git_branch: "feature/story-1"',
  ].join('\n') });

  await assert.rejects(
    syncClickUp({
      ...fixture,
      sprintStatusPaths: [fixture.sourcePath],
      token: 'secret-token',
      fetchImpl: withClickUpValidation(async (url, init = {}) => {
        if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
        if (!init.method) return jsonResponse(200, { team_id: '90122019689' });
        if (url.includes('/field/')) return jsonResponse(422, {});
        return jsonResponse(200, {});
      }),
    }),
    (error) => /Git Branch/.test(error.message) && /task-123/.test(error.message) && /422/.test(error.message)
      && !error.message.includes('secret-token'),
  );
});

test('syncClickUp URL-encodes task and custom field IDs', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'custom_fields:',
    '  git_branch: "field/id"',
    'tasks:',
    '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
    '    task_id: "task/id"',
    '    git_branch: "feature/story-1"',
  ].join('\n') });
  const requests = [];

  await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: async (url, init = {}) => {
      requests.push({ url, init });
      return successfulClickUpResponse(url, init);
    },
  });

  assert.deepEqual(requests.filter(({ init }) => init.method === 'PUT' || init.method === 'POST').map(({ url }) => url), [
    'https://api.clickup.com/api/v2/task/task%2Fid',
    'https://api.clickup.com/api/v2/task/task%2Fid/field/field%2Fid',
  ]);
});

test('syncClickUp reports API failures without revealing the token', async () => {
  const fixture = await createFixture();

  await assert.rejects(
    syncClickUp({
      ...fixture,
      sprintStatusPaths: [fixture.sourcePath],
      token: 'secret-token',
      fetchImpl: withClickUpValidation(async (url, init = {}) => {
        if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
        if (!init.method) return jsonResponse(200, { team_id: '90122019689' });
        return jsonResponse(500, {});
      }),
    }),
    (error) => /task-123/.test(error.message) && /500/.test(error.message) && !error.message.includes('secret-token'),
  );
});

test('syncClickUp redacts the token when a transport error includes it', async () => {
  const fixture = await createFixture();

  await assert.rejects(
    syncClickUp({
      ...fixture,
      sprintStatusPaths: [fixture.sourcePath],
      token: 'secret-token',
      fetchImpl: async () => { throw new Error('authorization secret-token rejected'); },
    }),
    (error) => /team authorization/.test(error.message) && !error.message.includes('secret-token'),
  );
});

test('syncClickUp redacts malformed team response errors before any task write', async () => {
  const fixture = await createFixture();
  const requests = [];

  await assert.rejects(
    syncClickUp({
      ...fixture,
      sprintStatusPaths: [fixture.sourcePath],
      token: 'secret-token',
      fetchImpl: async (url, init) => {
        requests.push({ url, init });
        return { ok: true, status: 200, json: async () => { throw new Error('invalid team payload secret-token'); } };
      },
    }),
    (error) => /team authorization/.test(error.message) && !error.message.includes('secret-token'),
  );

  assert.deepEqual(requests.map(({ url }) => url), ['https://api.clickup.com/api/v2/team']);
});

test('syncClickUp resolves task ID via bmad_key when no YAML mapping exists', async () => {
  const fixture = await createFixture({
    config: [
      'workspace_id: "90122019689"',
      'list_id: "list-123"',
      'status_map:',
      '  in-progress: "IN PROGRESS"',
      'custom_fields:',
      '  bmad_key: "bmad-key-field"',
      'tasks: {}',
    ].join('\n'),
  });
  const requests = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: withClickUpValidation(async (url, init = {}) => {
      requests.push({ url, init });
      if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
      if (url.includes('/list/list-123/task?')) {
        const parsedUrl = new URL(url);
        assert.equal(parsedUrl.searchParams.get('subtasks'), 'true');
        assert.equal(parsedUrl.searchParams.get('custom_fields'), null);
        return jsonResponse(200, {
          tasks: [{
            id: 'task-from-bmad-key',
            custom_fields: [{ id: 'bmad-key-field', value: '1-99-test-story' }],
          }],
          last_page: true,
        });
      }
      return successfulClickUpResponse(url, init, { listId: 'list-123' });
    }, { listId: 'list-123' }),
  });

  assert.deepEqual(summary, { updated: 1, skipped: 0, wouldUpdate: 0 });
  assert.ok(requests.some(({ url }) => url.includes('/list/list-123/task?')));
  assert.ok(requests.some(({ url, init }) => url === 'https://api.clickup.com/api/v2/task/task-from-bmad-key' && init.method === 'PUT'));
});

test('syncClickUp counts skipped entries when bmad_key lookup finds no task', async () => {
  const fixture = await createFixture({
    config: [
      'workspace_id: "90122019689"',
      'list_id: "list-123"',
      'status_map:',
      '  in-progress: "IN PROGRESS"',
      'custom_fields:',
      '  bmad_key: "bmad-key-field"',
      'tasks: {}',
    ].join('\n'),
  });

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: withClickUpValidation(async (url, init = {}) => {
      if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
      if (url.includes('/list/list-123/task?')) return jsonResponse(200, { tasks: [], last_page: true });
      return successfulClickUpResponse(url, init, { listId: 'list-123' });
    }, { listId: 'list-123' }),
  });

  assert.deepEqual(summary, { updated: 0, skipped: 1, wouldUpdate: 0 });
});

test('collectSyncEntries rejects a configured task mapping without an ID even when its source key is absent', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'tasks:',
    '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
    '    task_id: "task-123"',
    '  "status/missing.yaml#story-2": {}',
  ].join('\n') });

  await assert.rejects(
    collectSyncEntries({ ...fixture, sprintStatusPaths: [fixture.sourcePath] }),
    /status\/missing\.yaml#story-2/,
  );
});

test('collectSyncEntries rejects configured task mappings for source keys it did not discover', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'tasks:',
    '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
    '    task_id: "task-123"',
    '  "status/missing.yaml#story-2":',
    '    task_id: "task-456"',
  ].join('\n') });

  await assert.rejects(
    collectSyncEntries({ ...fixture, sprintStatusPaths: [fixture.sourcePath] }),
    /status\/missing\.yaml#story-2/,
  );
});

test('collectSyncEntries rejects malformed configuration, missing source, unknown status, and task mappings without IDs', async () => {
  const malformed = await createFixture({ config: 'tasks: [' });
  await assert.rejects(
    collectSyncEntries({ ...malformed, sprintStatusPaths: [malformed.sourcePath] }),
    /clickup-sync\.yaml/,
  );

  const missing = await createFixture();
  await assert.rejects(
    collectSyncEntries({ ...missing, sprintStatusPaths: [path.join(missing.rootDir, 'missing.yaml')] }),
    /missing\.yaml/,
  );

  const unknownStatus = await createFixture({
    status: 'blocked',
    config: [
      'workspace_id: "90122019689"',
      'status_map: {}',
      'tasks:',
      '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
      '    task_id: "task-123"',
    ].join('\n'),
  });
  await assert.rejects(
    collectSyncEntries({ ...unknownStatus, sprintStatusPaths: [unknownStatus.sourcePath] }),
    /1-99-test-story/,
  );

  const missingTaskId = await createFixture({
    config: [
      'workspace_id: "90122019689"',
      'status_map:',
      '  in-progress: "IN PROGRESS"',
      'tasks:',
      '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story": {}',
    ].join('\n'),
  });
  await assert.rejects(
    collectSyncEntries({ ...missingTaskId, sprintStatusPaths: [missingTaskId.sourcePath] }),
    /1-99-test-story/,
  );
});
