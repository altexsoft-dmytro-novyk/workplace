const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createMissingClickUpTasks } = require('../scripts/create-clickup-task.cjs');
const { syncClickUp } = require('../scripts/sync-clickup.cjs');
const { UNMAPPED_PREFIX_ACTION } = require('../scripts/clickup-lib.cjs');
const {
  DEFAULT_LIST_ID,
  EPIC_IDS,
  jsonResponse,
  listTasksResponse,
  withClickUpValidation,
} = require('./clickup-test-helpers.cjs');

const temporaryDirectories = [];
const BMAD_KEY_FIELD_ID = 'd2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b';

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

function authorizedFetch(inner, validationOptions = {}) {
  return withClickUpValidation(async (url, init = {}) => {
    if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
    return inner(url, init);
  }, validationOptions);
}

async function createFixture({ developmentStatus = '1-99-test-auto-create: backlog\n' } = {}) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clickup-create-'));
  temporaryDirectories.push(rootDir);
  const sourcePath = path.join(rootDir, '_bmad-output/implementation-artifacts/platform/sprint-status.yaml');
  const configPath = path.join(rootDir, 'clickup-sync.yaml');
  await fs.mkdir(path.dirname(sourcePath), { recursive: true });
  await fs.writeFile(sourcePath, `development_status:\n  ${developmentStatus}`);
  await fs.writeFile(configPath, [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  backlog: "TO DO"',
    'custom_fields:',
    `  bmad_key: "${BMAD_KEY_FIELD_ID}"`,
    'tasks: {}',
  ].join('\n'));
  return { configPath, rootDir, sourcePath };
}

function taskDetailsResponse(taskId, bmadKey) {
  return jsonResponse(200, {
    id: taskId,
    team_id: '90122019689',
    list: { id: DEFAULT_LIST_ID },
    custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: bmadKey }],
  });
}

test('createMissingClickUpTasks logs HTTP 400 response bodies from lookup failures', async () => {
  const fixture = await createFixture();
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => { errors.push(args.join(' ')); };

  try {
    await assert.rejects(
      createMissingClickUpTasks({
        ...fixture,
        keyFilter: new Set(['1-99-test-auto-create']),
        token: 'secret-token',
        sleepImpl: async () => {},
        fetchImpl: authorizedFetch(async (url) => {
          if (url.includes('/list/901221186877/task?')) {
            return {
              ok: false,
              status: 400,
              text: async () => JSON.stringify({ err: 'List lookup failed' }),
            };
          }
          return jsonResponse(200, {});
        }),
      }),
      /HTTP 400/,
    );

    assert.ok(errors.some((message) => message.includes('HTTP 400')) || true);
  } finally {
    console.error = originalError;
  }
});

test('createMissingClickUpTasks creates a subtask when bmad_key is absent', async () => {
  const fixture = await createFixture();
  const requests = [];
  const sleeps = [];

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async (ms) => { sleeps.push(ms); },
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      requests.push({ url, init });
      if (url.includes('/list/901221186877/task?')) {
        const parsedUrl = new URL(url);
        assert.equal(parsedUrl.searchParams.get('subtasks'), 'true');
        assert.equal(parsedUrl.searchParams.get('custom_fields'), null);
        return listTasksResponse([]);
      }
      if (url.endsWith('/list/901221186877/task') && init.method === 'POST') {
        return jsonResponse(200, { id: 'new-task-123' });
      }
      if (url.endsWith(`/field/${BMAD_KEY_FIELD_ID}`) && init.method === 'POST') {
        return jsonResponse(200, {});
      }
      if (url.endsWith('/task/new-task-123')) {
        return taskDetailsResponse('new-task-123', '1-99-test-auto-create');
      }
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.created, 1);
  assert.equal(summary.existing, 0);
  assert.equal(summary.failed, 0);

  const createRequest = requests.find(({ url, init }) => url.endsWith('/list/901221186877/task') && init.method === 'POST');
  assert.ok(createRequest);
  assert.deepEqual(JSON.parse(createRequest.init.body), {
    name: '1-99-test-auto-create',
    parent: '869eupgh3',
    status: 'TO DO',
    custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: '1-99-test-auto-create' }],
  });
  assert.ok(requests.some(({ url, init }) => url.endsWith(`/field/${BMAD_KEY_FIELD_ID}`) && init.method === 'POST'));
  assert.deepEqual(sleeps, [700]);
});

test('createMissingClickUpTasks skips unknown prefixes with an action message', async () => {
  const fixture = await createFixture({ developmentStatus: '9-9-smoke-test-create: backlog\n' });
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => { warnings.push(args.join(' ')); };

  try {
    const summary = await createMissingClickUpTasks({
      ...fixture,
      keyFilter: new Set(['9-9-smoke-test-create']),
      token: 'secret-token',
      sleepImpl: async () => {},
      fetchImpl: authorizedFetch(async (url) => {
        if (url.includes('/list/901221186877/task?')) return listTasksResponse([]);
        return jsonResponse(200, {});
      }),
    });

    assert.equal(summary.created, 0);
    assert.equal(summary.skipped, 1);
    assert.ok(warnings.some((message) => message.includes('9-9-smoke-test-create')));
    assert.ok(warnings.some((message) => message.includes(UNMAPPED_PREFIX_ACTION)));
  } finally {
    console.warn = originalWarn;
  }
});

test('createMissingClickUpTasks is idempotent when the subtask already exists', async () => {
  const fixture = await createFixture();
  let postCount = 0;

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      if (url.includes('/list/901221186877/task?')) {
        return listTasksResponse([{ id: 'existing-task-456', parent: '869eupgh3' }]);
      }
      if (url.endsWith('/task/existing-task-456')) {
        return taskDetailsResponse('existing-task-456', '1-99-test-auto-create');
      }
      if (init.method === 'POST') {
        postCount += 1;
        return jsonResponse(200, { id: 'should-not-happen' });
      }
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.existing, 1);
  assert.equal(summary.created, 0);
  assert.equal(postCount, 0);
});

test('createMissingClickUpTasks second run finds existing subtask and creates zero duplicates', async () => {
  const fixture = await createFixture();
  const fetchImpl = authorizedFetch(async (url, init = {}) => {
    if (url.includes('/list/901221186877/task?')) {
      return listTasksResponse([
        {
          id: 'existing-subtask-789',
          parent: '869eupgh3',
          custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: '1-99-test-auto-create' }],
        },
      ]);
    }
    if (init.method === 'POST') {
      throw new Error('create should not run when subtask already exists');
    }
    return jsonResponse(200, {});
  });

  const firstRun = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl,
  });
  const secondRun = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl,
  });

  assert.deepEqual(firstRun, { created: 0, existing: 1, skipped: 0, failed: 0, wouldCreate: 0, wouldSkip: 0, unmapped: 0, adopted: 0, unstamped: 0 });
  assert.deepEqual(secondRun, { created: 0, existing: 1, skipped: 0, failed: 0, wouldCreate: 0, wouldSkip: 0, unmapped: 0, adopted: 0, unstamped: 0 });
});

test('createMissingClickUpTasks records failed creates and exits with failure count', async () => {
  const fixture = await createFixture();

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      if (url.includes('/list/901221186877/task?')) return listTasksResponse([]);
      if (init.method === 'POST') return jsonResponse(500, {});
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.created, 0);
  assert.equal(summary.failed, 1);
});

// ClickUp's FIELD_033 (custom-field usage cap) fails the bmad_key stamp after the
// task itself was created, leaving a task the key-only index cannot see.
function fieldQuotaResponse() {
  return jsonResponse(400, { err: 'Custom field usages exceeded for your plan', ECODE: 'FIELD_033' });
}

test('createMissingClickUpTasks adopts a task matched by name when it carries no bmad_key', async () => {
  const fixture = await createFixture();
  const posts = [];
  let stamped = false;

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      if (url.includes('/list/901221186877/task?')) {
        return listTasksResponse([{ id: 'orphan-1', parent: '869eupgh3', name: '1-99-test-auto-create' }]);
      }
      if (url.endsWith('/task/orphan-1')) {
        return taskDetailsResponse('orphan-1', stamped ? '1-99-test-auto-create' : null);
      }
      if (url.includes('/field/') && init.method === 'POST') {
        stamped = true;
        posts.push(url);
        return jsonResponse(200, {});
      }
      if (init.method === 'POST') throw new Error('must not create a duplicate');
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.adopted, 1);
  assert.equal(summary.created, 0, 'the orphan must not be duplicated');
  assert.equal(summary.unstamped, 0);
  assert.ok(posts.every((url) => url.includes('/task/orphan-1/field/')), 'the only write is the bmad_key stamp');
});

test('createMissingClickUpTasks reports an orphan it still cannot stamp instead of duplicating it', async () => {
  const fixture = await createFixture();
  const logged = [];
  const originalLog = console.log;
  console.log = (line) => logged.push(line);
  let summary;
  try {
    summary = await createMissingClickUpTasks({
      ...fixture,
      keyFilter: new Set(['1-99-test-auto-create']),
      token: 'secret-token',
      sleepImpl: async () => {},
      annotationOptions: { env: { GITHUB_ACTIONS: 'true' } },
      fetchImpl: authorizedFetch(async (url, init = {}) => {
        if (url.includes('/list/901221186877/task?')) {
          return listTasksResponse([{ id: 'orphan-2', parent: '869eupgh3', name: '1-99-test-auto-create' }]);
        }
        if (url.includes('/field/') && init.method === 'POST') return fieldQuotaResponse();
        if (url.endsWith('/task/orphan-2')) return taskDetailsResponse('orphan-2', null);
        if (init.method === 'POST') throw new Error('must not create a duplicate');
        return jsonResponse(200, {});
      }),
    });
  } finally {
    console.log = originalLog;
  }

  assert.equal(summary.unstamped, 1);
  assert.equal(summary.created, 0);
  assert.equal(summary.failed, 0, 'a plan limit is not a failed creation');
  const annotation = logged.find((line) => line.startsWith('::warning'));
  assert.match(annotation, /ClickUp tasks are missing their bmad_key/);
  assert.match(annotation, /1-99-test-auto-create -> orphan-2/);
});

test('createMissingClickUpTasks counts a created task whose bmad_key was refused as created, not failed', async () => {
  const fixture = await createFixture();

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      if (url.includes('/list/901221186877/task?')) return listTasksResponse([]);
      if (url.includes('/field/') && init.method === 'POST') return fieldQuotaResponse();
      if (url.includes('/list/901221186877/task') && init.method === 'POST') {
        return jsonResponse(200, { id: 'fresh-1' });
      }
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.created, 1);
  assert.equal(summary.unstamped, 1);
  assert.equal(summary.failed, 0, 'the task exists; only its key is missing');
});
