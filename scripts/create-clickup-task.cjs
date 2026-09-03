const path = require('node:path');
const {
  CLICKUP_API_BASE,
  CREATE_DELAY_MS,
  asObject,
  authorizeWorkspace,
  collectDevelopmentStatusRecords,
  findTaskByBmadKey,
  readYaml,
  readResponseJson,
  request,
  resolveEpicParentId,
  setBmadKeyOnTask,
  sleep,
  warnUnmappedPrefix,
} = require('./clickup-lib.cjs');

async function createMissingClickUpTasks(options = {}) {
  const token = options.token || process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN is required');
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required');

  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  const statusMap = asObject(config.status_map, `status_map in ${configPath}`);
  const customFields = asObject(config.custom_fields || {}, `custom_fields in ${configPath}`);
  const listId = config.list_id;
  const bmadKeyFieldId = customFields.bmad_key;

  if (!listId || typeof listId !== 'string') {
    throw new Error(`list_id is required in ${configPath}`);
  }
  if (!bmadKeyFieldId || typeof bmadKeyFieldId !== 'string') {
    throw new Error(`custom_fields.bmad_key is required in ${configPath}`);
  }

  const headers = await authorizeWorkspace(fetchImpl, token);
  const records = await collectDevelopmentStatusRecords({ ...options, rootDir });
  const listTaskIndex = options.listTaskIndex || {};
  const summary = { created: 0, existing: 0, skipped: 0, failed: 0 };

  for (const record of records) {
    const { developmentStatusKey, sourceStatus, track } = record;
    const epicParentId = resolveEpicParentId(developmentStatusKey, track);
    if (!epicParentId) {
      warnUnmappedPrefix(developmentStatusKey, track);
      summary.skipped += 1;
      continue;
    }

    if (!Object.hasOwn(statusMap, sourceStatus)) {
      console.warn(
        `No ClickUp status mapping for ${record.sourceKey} with BMad status ${String(sourceStatus)}. Skipping create.`,
      );
      summary.skipped += 1;
      continue;
    }

    try {
      const existingTaskId = await findTaskByBmadKey(fetchImpl, {
        listId,
        fieldId: bmadKeyFieldId,
        bmadKey: developmentStatusKey,
        token,
        listTaskIndex,
      });
      if (existingTaskId) {
        console.log(`${developmentStatusKey} already exists: ${existingTaskId}`);
        summary.existing += 1;
        if (options.sleepImpl) await options.sleepImpl(CREATE_DELAY_MS);
        else await sleep(CREATE_DELAY_MS);
        continue;
      }

      const createResponse = await request(
        fetchImpl,
        `${CLICKUP_API_BASE}/list/${encodeURIComponent(listId)}/task`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: developmentStatusKey,
            parent: epicParentId,
            status: statusMap[sourceStatus],
            custom_fields: [{ id: bmadKeyFieldId, value: developmentStatusKey }],
          }),
        },
        `task create for ${developmentStatusKey}`,
        token,
      );
      const createdTask = await readResponseJson(createResponse, `task create for ${developmentStatusKey}`, token);
      await setBmadKeyOnTask(fetchImpl, {
        taskId: String(createdTask.id),
        fieldId: bmadKeyFieldId,
        bmadKey: developmentStatusKey,
        token,
        headers,
      });
      if (listTaskIndex.byBmadKey instanceof Map) {
        listTaskIndex.byBmadKey.set(developmentStatusKey, String(createdTask.id));
      }
      console.log(`Created task ${createdTask.id} for ${developmentStatusKey}`);
      summary.created += 1;
    } catch (error) {
      console.error(`Failed to create ClickUp task for ${developmentStatusKey}: ${error.message}`);
      summary.failed += 1;
    }

    if (options.sleepImpl) await options.sleepImpl(CREATE_DELAY_MS);
    else await sleep(CREATE_DELAY_MS);
  }

  return summary;
}

module.exports = { createMissingClickUpTasks };

if (require.main === module) {
  createMissingClickUpTasks()
    .then((summary) => {
      console.log(
        `Create-if-missing finished: ${summary.created} created, ${summary.existing} existing, ${summary.skipped} skipped, ${summary.failed} failed.`,
      );
    })
    .catch((error) => {
      console.error(`ClickUp create-if-missing failed: ${error.message}`);
      process.exitCode = 1;
    });
}
