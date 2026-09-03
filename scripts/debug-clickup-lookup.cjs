const path = require('node:path');
const {
  buildBmadKeyTaskIndex,
  keyFilterFromOptions,
  readYaml,
  asObject,
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

  if (!listId || !fieldId) {
    throw new Error('clickup-sync.yaml must define list_id and custom_fields.bmad_key');
  }

  const index = await buildBmadKeyTaskIndex(fetchImpl, { listId, fieldId, token });
  const rows = [...index.entries()].map(([bmadKey, taskId]) => ({ bmadKey, taskId }));
  if (keyFilter) {
    for (const key of keyFilter) {
      console.log(`${key}: ${index.get(key) ?? 'NOT FOUND'}`);
    }
  } else {
    console.log(`Indexed ${rows.length} bmad_key value(s) from list ${listId}:`);
    for (const row of rows) {
      console.log(`  ${row.bmadKey} -> ${row.taskId}`);
    }
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
