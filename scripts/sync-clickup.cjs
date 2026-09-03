const path = require('node:path');
const {
  CLICKUP_API_BASE,
  EXPECTED_WORKSPACE_ID,
  asObject,
  authorizeWorkspace,
  bmadKeyLookupEnabled,
  findSprintStatusPaths,
  findTaskByBmadKey,
  readYaml,
  readResponseJson,
  relativeSourceKey,
  request,
  shouldSkipStoryKey,
} = require('./clickup-lib.cjs');

async function collectSyncEntries(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  const tasks = asObject(config.tasks, `tasks in ${configPath}`);
  const statusMap = asObject(config.status_map, `status_map in ${configPath}`);
  const sourcePaths = options.sprintStatusPaths || await findSprintStatusPaths(rootDir);
  const entries = [];
  const discoveredSourceKeys = new Set();
  const lookupByBmadKey = bmadKeyLookupEnabled(config);

  for (const [sourceKey, taskMapping] of Object.entries(tasks)) {
    const task = asObject(taskMapping, `task mapping for ${sourceKey}`);
    if (!task.task_id || typeof task.task_id !== 'string') {
      throw new Error(`Task mapping for ${sourceKey} must include task_id`);
    }
  }

  for (const sourcePath of sourcePaths) {
    const resolvedSourcePath = path.resolve(sourcePath);
    const sprintStatus = await readYaml(resolvedSourcePath, 'BMad sprint status');
    const developmentStatus = asObject(sprintStatus.development_status, `development_status in ${resolvedSourcePath}`);
    for (const [developmentStatusKey, sourceStatus] of Object.entries(developmentStatus)) {
      const sourceKey = relativeSourceKey(rootDir, resolvedSourcePath, developmentStatusKey);
      discoveredSourceKeys.add(sourceKey);

      if (!Object.hasOwn(statusMap, sourceStatus)) {
        if (Object.hasOwn(tasks, sourceKey) || lookupByBmadKey) {
          throw new Error(`No ClickUp status mapping for ${sourceKey} with BMad status ${String(sourceStatus)}`);
        }
        continue;
      }

      if (Object.hasOwn(tasks, sourceKey)) {
        const task = tasks[sourceKey];
        entries.push({
          sourceKey,
          taskId: task.task_id,
          status: statusMap[sourceStatus],
          ...(task.git_branch ? { gitBranch: task.git_branch } : {}),
          ...(task.validation_status ? { validationStatus: task.validation_status } : {}),
        });
        continue;
      }

      if (lookupByBmadKey && !shouldSkipStoryKey(developmentStatusKey)) {
        entries.push({
          sourceKey,
          bmadKey: developmentStatusKey,
          taskId: null,
          status: statusMap[sourceStatus],
          resolveViaBmadKey: true,
        });
      }
    }
  }

  for (const sourceKey of Object.keys(tasks)) {
    if (!discoveredSourceKeys.has(sourceKey)) {
      throw new Error(`Configured task mapping source was not found: ${sourceKey}`);
    }
  }

  return entries;
}

async function syncClickUp(options = {}) {
  const token = options.token || process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN is required');
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required');
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  if (config.workspace_id !== EXPECTED_WORKSPACE_ID) {
    throw new Error(`ClickUp sync configuration must use Workspace ${EXPECTED_WORKSPACE_ID}`);
  }
  const customFields = config.custom_fields === undefined
    ? {}
    : asObject(config.custom_fields, `custom_fields in ${configPath}`);
  const listId = config.list_id;
  const bmadKeyFieldId = customFields.bmad_key;
  const entries = await collectSyncEntries({ ...options, rootDir, configPath });
  const headers = await authorizeWorkspace(fetchImpl, token);

  for (const entry of entries) {
    let taskId = entry.taskId;
    if (!taskId && entry.resolveViaBmadKey) {
      if (!listId || !bmadKeyFieldId) {
        console.warn(`No ClickUp task mapping for ${entry.sourceKey} and bmad_key lookup is not configured. Skipping.`);
        continue;
      }
      taskId = await findTaskByBmadKey(fetchImpl, {
        listId,
        fieldId: bmadKeyFieldId,
        bmadKey: entry.bmadKey,
        token,
      });
      if (!taskId) {
        console.warn(`No ClickUp task found for ${entry.sourceKey} via bmad_key "${entry.bmadKey}". Skipping status update.`);
        continue;
      }
    }

    const taskUrl = `${CLICKUP_API_BASE}/task/${encodeURIComponent(taskId)}`;
    const taskResponse = await request(fetchImpl, taskUrl, { headers }, `workspace validation for task ${taskId}`, token);
    const taskPayload = await readResponseJson(taskResponse, `workspace validation for task ${taskId}`, token);
    if (taskPayload.team_id !== EXPECTED_WORKSPACE_ID) {
      throw new Error(`ClickUp task ${taskId} does not belong to required Workspace ${EXPECTED_WORKSPACE_ID}`);
    }
    await request(fetchImpl, taskUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: entry.status }),
    }, `status update for task ${taskId}`, token);
    const fieldUpdates = [
      { fieldId: customFields.git_branch, value: entry.gitBranch, name: 'Git Branch' },
      { fieldId: customFields.validation_status, value: entry.validationStatus, name: 'Validation Status' },
    ];
    for (const fieldUpdate of fieldUpdates) {
      if (!fieldUpdate.fieldId || !fieldUpdate.value) continue;
      await request(fetchImpl, `${CLICKUP_API_BASE}/task/${encodeURIComponent(taskId)}/field/${encodeURIComponent(fieldUpdate.fieldId)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ value: fieldUpdate.value }),
      }, `${fieldUpdate.name} update for task ${taskId}`, token);
    }
  }

  return entries;
}

module.exports = { collectSyncEntries, syncClickUp };

if (require.main === module) {
  syncClickUp()
    .then((entries) => console.log(`Synchronized ${entries.length} ClickUp task status update(s).`))
    .catch((error) => {
      console.error(`ClickUp synchronization failed: ${error.message}`);
      process.exitCode = 1;
    });
}
