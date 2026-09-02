const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { collectSyncEntries, syncClickUp } = require('../scripts/sync-clickup.cjs');

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

async function createFixture({ config, status = 'in-progress' } = {}) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clickup-sync-'));
  temporaryDirectories.push(rootDir);
  const sourcePath = path.join(rootDir, 'status', 'sprint-status.yaml');
  const configPath = path.join(rootDir, 'clickup-sync.yaml');
  await fs.mkdir(path.dirname(sourcePath), { recursive: true });
  await fs.writeFile(sourcePath, `development_status:\n  story-1: ${status}\n`);
  await fs.writeFile(configPath, config ?? [
    'workspace_id: "90122019689"',
    'status_map:',
    '  in-progress: "in progress"',
    'tasks:',
    '  "status/sprint-status.yaml#story-1":',
    '    task_id: "task-123"',
    '    git_branch: feature/story-1',
    '    validation_status: passed',
  ].join('\n'));
  return { configPath, rootDir, sourcePath };
}

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

test('collectSyncEntries maps configured BMad development status entries', async () => {
  const fixture = await createFixture();

  const entries = await collectSyncEntries({ ...fixture, sprintStatusPaths: [fixture.sourcePath] });

  assert.deepEqual(entries, [{
    sourceKey: 'status/sprint-status.yaml#story-1',
    taskId: 'task-123',
    status: 'in progress',
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

test('syncClickUp does not write tasks when every BMad entry is unmapped', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'status_map:',
    '  in-progress: "in progress"',
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
      return url.endsWith('/team')
        ? jsonResponse(200, { teams: [{ id: '90122019689' }] })
        : jsonResponse(200, {});
    },
  });

  assert.deepEqual(requests[0], {
    url: 'https://api.clickup.com/api/v2/team',
    init: {
      headers: {
        Authorization: 'secret-token',
        'Content-Type': 'application/json',
      },
    },
  });
  assert.deepEqual(requests[1], {
    url: 'https://api.clickup.com/api/v2/task/task-123',
    init: {
      method: 'PUT',
      headers: {
        Authorization: 'secret-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'in progress' }),
    },
  });
});

test('syncClickUp reports API failures without revealing the token', async () => {
  const fixture = await createFixture();

  await assert.rejects(
    syncClickUp({
      ...fixture,
      sprintStatusPaths: [fixture.sourcePath],
      token: 'secret-token',
      fetchImpl: async (url) => url.endsWith('/team')
        ? jsonResponse(200, { teams: [{ id: '90122019689' }] })
        : jsonResponse(500, {}),
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

test('collectSyncEntries rejects a configured task mapping without an ID even when its source key is absent', async () => {
  const fixture = await createFixture({ config: [
    'workspace_id: "90122019689"',
    'status_map:',
    '  in-progress: "in progress"',
    'tasks:',
    '  "status/sprint-status.yaml#story-1":',
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
    '  in-progress: "in progress"',
    'tasks:',
    '  "status/sprint-status.yaml#story-1":',
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
      '  "status/sprint-status.yaml#story-1":',
      '    task_id: "task-123"',
    ].join('\n'),
  });
  await assert.rejects(
    collectSyncEntries({ ...unknownStatus, sprintStatusPaths: [unknownStatus.sourcePath] }),
    /status\/sprint-status\.yaml#story-1/,
  );

  const missingTaskId = await createFixture({
    config: [
      'workspace_id: "90122019689"',
      'status_map:',
      '  in-progress: "in progress"',
      'tasks:',
      '  "status/sprint-status.yaml#story-1": {}',
    ].join('\n'),
  });
  await assert.rejects(
    collectSyncEntries({ ...missingTaskId, sprintStatusPaths: [missingTaskId.sourcePath] }),
    /status\/sprint-status\.yaml#story-1/,
  );
});
