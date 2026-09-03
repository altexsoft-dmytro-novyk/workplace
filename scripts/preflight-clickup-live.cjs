const path = require('node:path');
const {
  CLICKUP_API_BASE,
  asObject,
  authorizeWorkspace,
  buildBmadKeyTaskIndex,
  collectEpicIdsFromTrackMap,
  dryRunEnabled,
  fetchTaskDetails,
  readCustomFieldValue,
  readYaml,
  taskListId,
  taskWorkspaceId,
  validateClickUpTargets,
} = require('./clickup-lib.cjs');
const { createMissingClickUpTasks } = require('./create-clickup-task.cjs');

const EXPECTED_WORKSPACE = '90122019689';
const BMAD_KEY_FIELD = 'd2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b';

function storyKeyFromSourceKey(sourceKey) {
  const hash = sourceKey.lastIndexOf('#');
  return hash >= 0 ? sourceKey.slice(hash + 1) : sourceKey;
}

function instrumentReadOnlyFetch(fetchImpl) {
  const calls = [];
  const wrapped = async (url, init = {}) => {
    const method = init.method || 'GET';
    calls.push({ method, url });
    if (method !== 'GET') {
      throw new Error(`Preflight is read-only but ${method} was attempted: ${url}`);
    }
    return fetchImpl(url, init);
  };
  return { wrapped, calls };
}

async function preflightClickUpLive(options = {}) {
  const token = options.token || process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN is required');

  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  const customFields = asObject(config.custom_fields || {}, `custom_fields in ${configPath}`);
  const listId = config.list_id;
  const fieldId = customFields.bmad_key;
  const baseFetch = options.fetchImpl || globalThis.fetch;
  const { wrapped, calls } = instrumentReadOnlyFetch(baseFetch);

  console.log('ClickUp live preflight (read-only GET only)');
  console.log(`Expected workspace: ${EXPECTED_WORKSPACE}`);
  console.log(`Configured list_id: ${listId}`);

  await authorizeWorkspace(wrapped, token);
  const validation = await validateClickUpTargets(wrapped, {
    listId,
    workspaceId: config.workspace_id,
    epicIds: collectEpicIdsFromTrackMap(),
    token,
  });

  console.log('\n[1] List and Epic validation');
  console.log(`PASS list ${validation.listId} in workspace ${validation.workspaceId}`);
  for (const epicId of validation.epicIds) {
    const epic = await fetchTaskDetails(wrapped, epicId, token);
    console.log(
      `PASS epic ${epicId} in workspace ${taskWorkspaceId(epic)} list ${taskListId(epic)}`,
    );
  }

  console.log('\n[2] Pagination scan');
  let pageCount = 0;
  const countingFetch = async (url, init = {}) => {
    if ((init.method || 'GET') !== 'GET') {
      throw new Error(`Pagination scan is read-only but ${init.method || 'GET'} was attempted`);
    }
    if (url.includes('/list/') && url.includes('/task?')) {
      pageCount += 1;
      const parsed = new URL(url);
      console.log(
        `  page=${parsed.searchParams.get('page')} subtasks=${parsed.searchParams.get('subtasks')}`,
      );
    }
    return wrapped(url, init);
  };

  const index = await buildBmadKeyTaskIndex(countingFetch, { listId, fieldId, token });
  console.log(`PASS scanned ${pageCount} page(s), indexed ${index.size} bmad_key value(s)`);

  console.log('\n[3] Configured story tasks and bmad_key field');
  const tasks = asObject(config.tasks || {}, `tasks in ${configPath}`);
  for (const [sourceKey, mapping] of Object.entries(tasks)) {
    const storyKey = storyKeyFromSourceKey(sourceKey);
    if (/^epic-/.test(storyKey)) {
      console.log(`SKIP epic mapping ${storyKey} -> ${mapping.task_id}`);
      continue;
    }
    const task = await fetchTaskDetails(wrapped, mapping.task_id, token);
    const bmadKey = readCustomFieldValue(task, fieldId);
    const status = bmadKey === storyKey ? 'PASS' : 'FAIL';
    console.log(
      `${status} task ${mapping.task_id} key "${storyKey}" bmad_key="${bmadKey ?? ''}"`,
    );
  }

  console.log('\n[4] Dry-run create (must not POST or PUT)');
  const dryRunWrites = [];
  const dryRunFetch = async (url, init = {}) => {
    const method = init.method || 'GET';
    if (method === 'POST' || method === 'PUT') {
      dryRunWrites.push({ method, url });
    }
    return baseFetch(url, init);
  };

  const keyFilter = options.keyFilter || process.env.CLICKUP_BMAD_KEYS;
  await createMissingClickUpTasks({
    rootDir,
    configPath,
    token,
    dryRun: true,
    keyFilter: keyFilter ? new Set(String(keyFilter).split(',').map((v) => v.trim()).filter(Boolean)) : undefined,
    fetchImpl: dryRunFetch,
    sleepImpl: async () => {},
  });

  if (dryRunWrites.length > 0) {
    throw new Error(`Dry-run attempted writes: ${JSON.stringify(dryRunWrites)}`);
  }
  console.log('PASS dry-run completed with zero POST/PUT requests');

  console.log('\n[5] HTTP summary');
  const methods = calls.reduce((acc, call) => {
    acc[call.method] = (acc[call.method] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify(methods));

  if (dryRunEnabled(options)) {
    console.log('\nNo ClickUp changes made.');
  }

  return { validation, indexedKeys: index.size, pagesScanned: pageCount, httpMethods: methods };
}

module.exports = { preflightClickUpLive };

if (require.main === module) {
  preflightClickUpLive()
    .then(() => {
      console.log('\nPreflight complete.');
    })
    .catch((error) => {
      console.error(`Preflight failed: ${error.message}`);
      process.exitCode = 1;
    });
}
