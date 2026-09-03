const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createMissingClickUpTasks } = require('../scripts/create-clickup-task.cjs');
const { syncClickUp } = require('../scripts/sync-clickup.cjs');
const {
  DEFAULT_LIST_ID,
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

async function createFixture({ developmentStatus = '1-99-test-auto-create: backlog\n', withTaskMapping = false } = {}) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clickup-safety-'));
  temporaryDirectories.push(rootDir);
  const sourcePath = path.join(rootDir, '_bmad-output/implementation-artifacts/platform/sprint-status.yaml');
  const configPath = path.join(rootDir, 'clickup-sync.yaml');
  const sourceKey = '_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-auto-create';
  await fs.mkdir(path.dirname(sourcePath), { recursive: true });
  await fs.writeFile(sourcePath, `development_status:\n  ${developmentStatus}`);
  const taskLines = withTaskMapping
    ? [
      'tasks:',
      `  "${sourceKey}":`,
      '    task_id: "task-123"',
    ]
    : ['tasks: {}'];
  await fs.writeFile(configPath, [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  backlog: "TO DO"',
    '  in-progress: "IN PROGRESS"',
    'custom_fields:',
    `  bmad_key: "${BMAD_KEY_FIELD_ID}"`,
    ...taskLines,
  ].join('\n'));
  return { configPath, rootDir, sourcePath, sourceKey };
}

test('dry-run create performs validation and lookup without POST or PUT', async () => {
  const fixture = await createFixture();
  const writes = [];

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    dryRun: true,
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      if (init.method === 'POST' || init.method === 'PUT') writes.push({ url, init });
      if (url.includes('/list/901221186877/task?')) return listTasksResponse([]);
      return jsonResponse(200, {});
    }),
  });

  assert.equal(writes.length, 0);
  assert.equal(summary.wouldCreate, 1);
  assert.equal(summary.created, 0);
});

test('dry-run sync performs validation without PUT or field POST', async () => {
  const fixture = await createFixture({
    developmentStatus: '1-99-test-auto-create: in-progress\n',
    withTaskMapping: true,
  });
  const writes = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    dryRun: true,
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      if (init.method === 'POST' || init.method === 'PUT') writes.push({ url, init });
      if (url.endsWith('/task/task-123')) return jsonResponse(200, { team_id: '90122019689' });
      return jsonResponse(200, {});
    }),
  });

  assert.equal(writes.length, 0);
  assert.equal(summary.wouldUpdate, 1);
  assert.equal(summary.updated, 0);
});

test('validation stops before POST when epic belongs to another list', async () => {
  const fixture = await createFixture();
  const writes = [];

  await assert.rejects(
    createMissingClickUpTasks({
      ...fixture,
      keyFilter: new Set(['1-99-test-auto-create']),
      token: 'secret-token',
      fetchImpl: async (url, init = {}) => {
        if (init.method === 'POST' || init.method === 'PUT') writes.push({ url, init });
        if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
        if (url.match(new RegExp(`/list/${DEFAULT_LIST_ID}$`))) {
          return jsonResponse(200, { id: DEFAULT_LIST_ID, team_id: '90122019689' });
        }
        if (url.endsWith('/task/869eupgh3')) {
          return jsonResponse(200, { id: '869eupgh3', team_id: '90122019689', list: { id: 'wrong-list' } });
        }
        const epicMatch = url.match(/\/task\/([^/?]+)$/);
        if (epicMatch) {
          return jsonResponse(200, {
            id: epicMatch[1],
            team_id: '90122019689',
            list: { id: DEFAULT_LIST_ID },
          });
        }
        return jsonResponse(200, {});
      },
    }),
    /869eupgh3 belongs to list wrong-list/,
  );

  assert.equal(writes.length, 0);
});

test('validation stops before POST when list belongs to another workspace', async () => {
  const fixture = await createFixture();

  await assert.rejects(
    createMissingClickUpTasks({
      ...fixture,
      keyFilter: new Set(['1-99-test-auto-create']),
      token: 'secret-token',
      fetchImpl: async (url) => {
        if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
        if (url.match(new RegExp(`/list/${DEFAULT_LIST_ID}$`))) {
          return jsonResponse(200, { id: DEFAULT_LIST_ID, team_id: '99999999999' });
        }
        const epicMatch = url.match(/\/task\/([^/?]+)$/);
        if (epicMatch) {
          return jsonResponse(200, {
            id: epicMatch[1],
            team_id: '90122019689',
            list: { id: DEFAULT_LIST_ID },
          });
        }
        return jsonResponse(200, {});
      },
    }),
    /belongs to workspace 99999999999/,
  );
});

test('duplicate bmad_key in the same run creates only one task', async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clickup-dup-run-'));
  temporaryDirectories.push(rootDir);
  const platformPath = path.join(rootDir, '_bmad-output/implementation-artifacts/platform/sprint-status.yaml');
  const userPath = path.join(rootDir, '_bmad-output/implementation-artifacts/user-management/sprint-status.yaml');
  const configPath = path.join(rootDir, 'clickup-sync.yaml');
  await fs.mkdir(path.dirname(platformPath), { recursive: true });
  await fs.mkdir(path.dirname(userPath), { recursive: true });
  await fs.writeFile(platformPath, 'development_status:\n  1-99-dup-key: backlog\n');
  await fs.writeFile(userPath, 'development_status:\n  1-99-dup-key: backlog\n');
  await fs.writeFile(configPath, [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  backlog: "TO DO"',
    'custom_fields:',
    `  bmad_key: "${BMAD_KEY_FIELD_ID}"`,
    'tasks: {}',
  ].join('\n'));

  let createCount = 0;

  await assert.rejects(
    createMissingClickUpTasks({
      rootDir,
      configPath,
      token: 'secret-token',
      sleepImpl: async () => {},
      fetchImpl: authorizedFetch(async (url, init = {}) => {
        if (url.includes('/list/901221186877/task?')) return listTasksResponse([]);
        if (url.endsWith('/list/901221186877/task') && init.method === 'POST') {
          createCount += 1;
          return jsonResponse(200, { id: 'created-once' });
        }
        if (url.endsWith('/task/created-once')) {
          return jsonResponse(200, {
            id: 'created-once',
            custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: '1-99-dup-key' }],
          });
        }
        if (url.endsWith(`/field/${BMAD_KEY_FIELD_ID}`) && init.method === 'POST') return jsonResponse(200, {});
        return jsonResponse(200, {});
      }),
    }),
    /Duplicate BMad story keys/,
  );

  assert.equal(createCount, 0);
});

test('list scan paginates until last_page is true', async () => {
  const fixture = await createFixture({
    developmentStatus: '1-99-page-two: backlog\n',
  });
  const pages = [];

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-page-two']),
    token: 'secret-token',
    dryRun: true,
    fetchImpl: authorizedFetch(async (url) => {
      if (url.includes('/list/901221186877/task?')) {
        const page = new URL(url).searchParams.get('page');
        pages.push(page);
        if (page === '0') {
          return listTasksResponse([{ id: 'page-one-task', custom_fields: [] }], false);
        }
        return listTasksResponse([
          { id: 'found-task', custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: '1-99-page-two' }] },
        ], true);
      }
      return jsonResponse(200, {});
    }),
  });

  assert.deepEqual(pages, ['0', '1']);
  assert.equal(summary.existing, 1);
  assert.equal(summary.wouldCreate, 0);
});

test('existing bmad_key reports existing without POST', async () => {
  const fixture = await createFixture();
  const writes = [];

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['1-99-test-auto-create']),
    token: 'secret-token',
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      if (init.method === 'POST' || init.method === 'PUT') writes.push({ url, init });
      if (url.includes('/list/901221186877/task?')) {
        return listTasksResponse([
          { id: 'existing-task', custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: '1-99-test-auto-create' }] },
        ]);
      }
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.existing, 1);
  assert.equal(summary.created, 0);
  assert.equal(writes.length, 0);
});

test('unknown epic prefix is skipped safely in dry-run', async () => {
  const fixture = await createFixture({ developmentStatus: '9-9-unknown-prefix: backlog\n' });
  const writes = [];

  const summary = await createMissingClickUpTasks({
    ...fixture,
    keyFilter: new Set(['9-9-unknown-prefix']),
    token: 'secret-token',
    dryRun: true,
    fetchImpl: authorizedFetch(async (url, init = {}) => {
      if (init.method === 'POST' || init.method === 'PUT') writes.push({ url, init });
      if (url.includes('/list/901221186877/task?')) return listTasksResponse([]);
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.wouldSkip, 1);
  assert.equal(summary.wouldCreate, 0);
  assert.equal(writes.length, 0);
});
