const path = require('node:path');
const {
  authorizeWorkspace,
  buildBmadKeyTaskIndex,
  collectEpicIdsFromTrackMap,
  dryRunEnabled,
  keyFilterFromOptions,
  readYaml,
  asObject,
  validateClickUpTargets,
} = require('./clickup-lib.cjs');

async function debugClickUpLookup(options = {}) {
  const token = options.token || process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN is required');
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  const customFields = asObject(config.custom_fields || {}, `custom_fields in ${configPath}`);
  const listId = config.list_id;
  const fieldId = customFields.bmad_key;
  const keyFilter = keyFilterFromOptions(options);
  const isDryRun = dryRunEnabled(options);

  if (!listId || !fieldId) {
    throw new Error('clickup-sync.yaml must define list_id and custom_fields.bmad_key');
  }

  await authorizeWorkspace(fetchImpl, token);
  const validation = await validateClickUpTargets(fetchImpl, {
    listId,
    workspaceId: config.workspace_id,
    epicIds: collectEpicIdsFromTrackMap(),
    token,
  });

  if (isDryRun) {
    console.log('DRY RUN');
  }
  console.log(`workspace validated: ${validation.workspaceId}`);
  console.log(`list validated: ${validation.listId}`);

  const index = await buildBmadKeyTaskIndex(fetchImpl, { listId, fieldId, token });
  if (keyFilter) {
    for (const key of keyFilter) {
      console.log(`${key}: ${index.get(key) ?? 'NOT FOUND'}`);
    }
  } else {
    console.log(`Indexed ${index.size} bmad_key value(s) from list ${listId}:`);
    for (const [bmadKey, taskId] of index.entries()) {
      console.log(`  ${bmadKey} -> ${taskId}`);
    }
  }

  if (isDryRun) {
    console.log('No ClickUp changes made.');
  }

  return index;
}

module.exports = { debugClickUpLookup };

if (require.main === module) {
  debugClickUpLookup()
    .catch((error) => {
      console.error(`ClickUp lookup diagnostic failed: ${error.message}`);
      process.exitCode = 1;
    });
}
