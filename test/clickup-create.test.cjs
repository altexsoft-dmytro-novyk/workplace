const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createMissingClickUpTasks } = require('../scripts/create-clickup-task.cjs');
const { UNMAPPED_PREFIX_ACTION, request } = require('../scripts/clickup-lib.cjs');

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
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
    '  backlog: "to do"',
    'custom_fields:',
    '  bmad_key: "d2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b"',
    'tasks: {}',
  ].join('\n'));
  return { configPath, rootDir, sourcePath };
}

test('createMissingClickUpTasks logs HTTP 400 response bodies from lookup failures', async () => {
  const fixture = await createFixture();
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => { errors.push(args.join(' ')); };

  try {
    const summary = await createMissingClickUpTasks({
      ...fixture,
      keyFilter: new Set(['1-99-test-auto-create']),
      token: 'secret-token',
      sleepImpl: async () => {},
      fetchImpl: async (url, init = {}) => {
        if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
        if (url.includes('/list/901221186877/task?')) {
          return {
            ok: false,
            status: 400,
            text: async () => JSON.stringify({ err: 'Invalid custom field filter' }),
          };
        }
        return jsonResponse(200, {});
      },
    });

    assert.equal(summary.failed, 1);
    assert.ok(errors.some((message) => message.includes('HTTP 400')));
    assert.ok(errors.some((message) => message.includes('Invalid custom field filter')));
    assert.ok(errors.every((message) => !message.includes('secret-token')));
  } finally {
    console.error = originalError;
  }
});

test('request redacts token from error URLs and bodies', async () => {
  await assert.rejects(
    request(
      async () => ({
        ok: false,
        status: 400,
        text: async () => 'secret-token leaked',
      }),
      'https://api.clickup.com/api/v2/list/123/task?token=secret-token',
      {},
      'lookup',
      'secret-token',
    ),
    (error) => /HTTP 400/.test(error.message)
      && /\[REDACTED\]/.test(error.message)
      && !error.message.includes('secret-token'),
  );
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
    fetchImpl: async (url, init = {}) => {
      requests.push({ url, init });
      if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
      if (url.includes('/list/901221186877/task?')) {
        const query = JSON.parse(new URL(url).searchParams.get('custom_fields'));
        assert.equal(query[0].operator, '==');
        return jsonResponse(200, { tasks: [] });
      }
      if (url.endsWith('/list/901221186877/task') && init.method === 'POST') {
        return jsonResponse(200, { id: 'new-task-123' });
      }
      return jsonResponse(200, {});
    },
  });

  assert.equal(summary.created, 1);
  assert.equal(summary.existing, 0);
  assert.equal(summary.failed, 0);

  const createRequest = requests.find(({ init }) => init.method === 'POST');
  assert.ok(createRequest);
  assert.deepEqual(JSON.parse(createRequest.init.body), {
    name: '1-99-test-auto-create',
    parent: '869eupgh3',
    status: 'to do',
    custom_fields: [{ id: 'd2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b', value: '1-99-test-auto-create' }],
  });
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
      fetchImpl: async (url) => {
        if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
        return jsonResponse(200, { tasks: [] });
      },
    });

    assert.equal(summary.created, 0);
    assert.equal(summary.skipped, 1);
    assert.ok(warnings.some((message) => message.includes('9-9-smoke-test-create')));
    assert.ok(warnings.some((message) => message.includes(UNMAPPED_PREFIX_ACTION)));
  } finally {
    console.warn = originalWarn;
  }
});

test('createMissingClickUpTasks is idempotent when the task already exists', async () => {
  const fixture = await createFixture();
  let postCount = 0;

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl: async (url, init = {}) => {
      if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
      if (url.includes('/list/901221186877/task?')) {
        return jsonResponse(200, { tasks: [{ id: 'existing-task-456' }] });
      }
      if (init.method === 'POST') {
        postCount += 1;
        return jsonResponse(200, { id: 'should-not-happen' });
      }
      return jsonResponse(200, {});
    },
  });

  assert.equal(summary.existing, 1);
  assert.equal(summary.created, 0);
  assert.equal(postCount, 0);
});

test('createMissingClickUpTasks exits successfully when an individual create fails', async () => {
  const fixture = await createFixture();

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl: async (url, init = {}) => {
      if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
      if (url.includes('/list/901221186877/task?')) {
        return jsonResponse(200, { tasks: [] });
      }
      if (init.method === 'POST') return jsonResponse(500, {});
      return jsonResponse(200, {});
    },
  });

  assert.equal(summary.created, 0);
  assert.equal(summary.failed, 1);
});
