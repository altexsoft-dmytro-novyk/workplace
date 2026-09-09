const path = require('node:path');
const { assertNoAmbiguousEpicIds } = require('./epic-id-guard.cjs');
const {
  CLICKUP_API_BASE,
  EXPECTED_WORKSPACE_ID,
  SYNC_DELAY_MS,
  asObject,
  authorizeWorkspace,
  bmadKeyLookupEnabled,
  collectDevelopmentStatusRecords,
  collectEpicDescriptions,
  collectEpicIdsFromTrackMap,
  collectEpicStatusRecords,
  collectStoryDescriptions,
  descriptionsConfig,
  dryRunEnabled,
  epicDescriptionKey,
  findSprintStatusPaths,
  findTaskByBmadKey,
  readDescriptionFingerprint,
  readResponseJson,
  readTaskDescription,
  readYaml,
  relativeSourceKey,
  reportUnmappedPrefixes,
  request,
  sleep,
  validateClickUpTargets,
} = require('./clickup-lib.cjs');

async function collectDiscoveredSourceKeys(rootDir, sourcePaths) {
  const discoveredSourceKeys = new Set();
  for (const sourcePath of sourcePaths) {
    const resolvedSourcePath = path.resolve(sourcePath);
    const sprintStatus = await readYaml(resolvedSourcePath, 'BMad sprint status');
    const developmentStatus = asObject(
      sprintStatus.development_status,
      `development_status in ${resolvedSourcePath}`,
    );
    for (const developmentStatusKey of Object.keys(developmentStatus)) {
      discoveredSourceKeys.add(relativeSourceKey(rootDir, resolvedSourcePath, developmentStatusKey));
    }
  }
  return discoveredSourceKeys;
}

async function collectSyncEntries(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  const tasks = asObject(config.tasks, `tasks in ${configPath}`);
  const statusMap = asObject(config.status_map, `status_map in ${configPath}`);
  const lookupByBmadKey = bmadKeyLookupEnabled(config);
  const sourcePaths = options.sprintStatusPaths || await findSprintStatusPaths(rootDir);
  const records = await collectDevelopmentStatusRecords({ ...options, rootDir, sprintStatusPaths: sourcePaths });
  const discoveredSourceKeys = await collectDiscoveredSourceKeys(rootDir, sourcePaths);
  const entries = [];

  for (const [sourceKey, taskMapping] of Object.entries(tasks)) {
    const task = asObject(taskMapping, `task mapping for ${sourceKey}`);
    if (!task.task_id || typeof task.task_id !== 'string') {
      throw new Error(`Task mapping for ${sourceKey} must include task_id`);
    }
  }

  for (const record of records) {
    const { sourceKey, sourceStatus, bmadKey } = record;

    if (!Object.hasOwn(statusMap, sourceStatus)) {
      throw new Error(`No ClickUp status mapping for ${sourceKey} with BMad status ${String(sourceStatus)}`);
    }

    if (Object.hasOwn(tasks, sourceKey)) {
      const task = tasks[sourceKey];
      entries.push({
        sourceKey,
        bmadKey,
        descriptionKey: bmadKey,
        taskId: task.task_id,
        status: statusMap[sourceStatus],
        ...(task.git_branch ? { gitBranch: task.git_branch } : {}),
        ...(task.validation_status ? { validationStatus: task.validation_status } : {}),
      });
      continue;
    }

    if (lookupByBmadKey) {
      entries.push({
        sourceKey,
        bmadKey,
        descriptionKey: bmadKey,
        taskId: null,
        status: statusMap[sourceStatus],
        resolveViaBmadKey: true,
      });
    }
  }

  // Epics are entries too: their task IDs come from EPIC_BY_TRACK rather than
  // the tasks map, so they need no per-epic configuration.
  const unmappedEpics = [];
  for (const epic of await collectEpicStatusRecords({ ...options, rootDir, sprintStatusPaths: sourcePaths })) {
    if (!epic.taskId) {
      console.warn(`Skipped ${epic.sourceKey}: no ClickUp epic task is mapped for ${epic.track} ${epic.epicKey}.`);
      unmappedEpics.push({ key: epic.epicKey, track: epic.track });
      continue;
    }
    if (!Object.hasOwn(statusMap, epic.sourceStatus)) {
      console.warn(
        `No ClickUp status mapping for ${epic.sourceKey} with BMad status ${String(epic.sourceStatus)}. Skipping.`,
      );
      continue;
    }
    entries.push({
      sourceKey: epic.sourceKey,
      bmadKey: epic.epicKey,
      descriptionKey: epicDescriptionKey(epic.track, epic.epicNumber),
      taskId: epic.taskId,
      status: statusMap[epic.sourceStatus],
    });
  }

  await reportUnmappedPrefixes(unmappedEpics, options.annotationOptions);

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

  // Same contract as create: the entire run is validated before the first PUT.
  // A status written onto a task whose identity is ambiguous is worse than an
  // unsynced status, because the board then looks authoritative.
  await assertNoAmbiguousEpicIds({
    rootDir,
    checkClickUpMappings: true,
    ...(options.guardOptions || {}),
  });

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
  const isDryRun = dryRunEnabled(options);

  if (listId) {
    await validateClickUpTargets(fetchImpl, {
      listId,
      workspaceId: config.workspace_id,
      epicIds: collectEpicIdsFromTrackMap(),
      token,
    });
  }

  if (isDryRun) {
    console.log('DRY RUN');
    console.log(`workspace validated: ${config.workspace_id}`);
    console.log(`list validated: ${listId}`);
  }

  const descriptionSettings = descriptionsConfig(config);
  const storyDescriptions = descriptionSettings.enabled
    ? new Map([
      ...await collectStoryDescriptions({ rootDir }),
      ...await collectEpicDescriptions({ rootDir }),
    ])
    : new Map();

  const listTaskIndex = options.listTaskIndex || {};
  const summary = {
    updated: 0,
    skipped: 0,
    wouldUpdate: 0,
    descriptionsUpdated: 0,
    descriptionsFailed: 0,
    wouldUpdateDescriptions: 0,
  };
  const pause = async () => {
    if (isDryRun) return;
    if (options.sleepImpl) await options.sleepImpl(SYNC_DELAY_MS);
    else await sleep(SYNC_DELAY_MS);
  };

  for (const [index, entry] of entries.entries()) {
    let taskId = entry.taskId;
    if (!taskId && entry.resolveViaBmadKey) {
      if (!listId || !bmadKeyFieldId) {
        console.warn(`No ClickUp task mapping for ${entry.sourceKey} and bmad_key lookup is not configured. Skipping.`);
        summary.skipped += 1;
        continue;
      }
      taskId = await findTaskByBmadKey(fetchImpl, {
        listId,
        fieldId: bmadKeyFieldId,
        bmadKey: entry.bmadKey,
        token,
        listTaskIndex,
      });
      if (!taskId) {
        console.warn(`Skipped ${entry.sourceKey}: no ClickUp task found via bmad_key "${entry.bmadKey}".`);
        summary.skipped += 1;
        continue;
      }
    }

    const taskUrl = `${CLICKUP_API_BASE}/task/${encodeURIComponent(taskId)}`;
    const taskResponse = await request(fetchImpl, taskUrl, { headers }, `workspace validation for task ${taskId}`, token);
    const taskPayload = await readResponseJson(taskResponse, `workspace validation for task ${taskId}`, token);
    if (taskPayload.team_id !== EXPECTED_WORKSPACE_ID) {
      throw new Error(`ClickUp task ${taskId} does not belong to required Workspace ${EXPECTED_WORKSPACE_ID}`);
    }

    const story = descriptionSettings.enabled ? storyDescriptions.get(entry.descriptionKey) : undefined;
    const existingDescription = readTaskDescription(taskPayload).trim();
    const shouldWriteDescription = Boolean(story) && (
      descriptionSettings.overwrite
        ? readDescriptionFingerprint(existingDescription) !== story.fingerprint
        : existingDescription === ''
    );

    if (isDryRun) {
      console.log(`${entry.sourceKey}: would update task ${taskId} to status "${entry.status}"`);
      summary.wouldUpdate += 1;
      if (shouldWriteDescription) {
        console.log(`${entry.sourceKey}: would ${existingDescription === '' ? 'set' : 'replace'} the description of task ${taskId}`);
        summary.wouldUpdateDescriptions += 1;
      }
      continue;
    }

    await request(fetchImpl, taskUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: entry.status }),
    }, `status update for task ${taskId}`, token);

    if (shouldWriteDescription) {
      try {
        await request(fetchImpl, taskUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ markdown_description: story.markdown }),
        }, `description update for task ${taskId}`, token);
        summary.descriptionsUpdated += 1;
      } catch (error) {
        // A rejected description must not strand the custom-field writes below,
        // nor abandon every entry still queued behind this one.
        console.error(`Failed to write the description of task ${taskId}: ${error.message}`);
        summary.descriptionsFailed += 1;
      }
    }
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
    summary.updated += 1;
    if (index < entries.length - 1) await pause();
  }

  if (isDryRun) {
    console.log('No ClickUp changes made.');
  }

  return summary;
}

module.exports = { collectSyncEntries, syncClickUp };

if (require.main === module) {
  syncClickUp()
    .then((summary) => {
      if (dryRunEnabled()) {
        console.log(
          `Dry-run finished: ${summary.wouldUpdate} would update, ${summary.wouldUpdateDescriptions} descriptions would change, ${summary.skipped} skipped.`,
        );
        return;
      }
      console.log(
        `Sync finished: ${summary.updated} updated, ${summary.descriptionsUpdated} descriptions written, ${summary.skipped} skipped, ${summary.descriptionsFailed} descriptions failed.`,
      );
      if (summary.descriptionsFailed > 0) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(`ClickUp synchronization failed: ${error.message}`);
      process.exitCode = 1;
    });
}
