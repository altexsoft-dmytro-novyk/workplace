const path = require('node:path');
const {
  CLICKUP_API_BASE,
  CREATE_DELAY_MS,
  EXPECTED_WORKSPACE_ID,
  asObject,
  authorizeWorkspace,
  buildBmadKeyTaskIndex,
  collectDevelopmentStatusRecords,
  collectEpicIdsFromTrackMap,
  collectStoryDescriptions,
  descriptionsConfig,
  dryRunEnabled,
  readYaml,
  readResponseJson,
  request,
  resolveEpicParentId,
  setBmadKeyOnTask,
  sleep,
  validateClickUpTargets,
  verifyBmadKeyOnTask,
  warnUnmappedPrefix,
} = require('./clickup-lib.cjs');

async function createMissingClickUpTasks(options = {}) {
  const token = options.token || process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN is required');
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required');
  const isDryRun = dryRunEnabled(options);

  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  if (config.workspace_id !== EXPECTED_WORKSPACE_ID) {
    throw new Error(`ClickUp sync configuration must use Workspace ${EXPECTED_WORKSPACE_ID}`);
  }
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
  const validation = await validateClickUpTargets(fetchImpl, {
    listId,
    workspaceId: config.workspace_id,
    epicIds: collectEpicIdsFromTrackMap(),
    token,
  });

  if (isDryRun) {
    console.log('DRY RUN');
    console.log(`workspace validated: ${validation.workspaceId}`);
    console.log(`list validated: ${validation.listId}`);
  }

  const descriptionSettings = descriptionsConfig(config);
  const storyDescriptions = descriptionSettings.enabled
    ? await collectStoryDescriptions({ rootDir })
    : new Map();

  const records = await collectDevelopmentStatusRecords({ ...options, rootDir });
  const listTaskIndex = options.listTaskIndex || {};
  if (!listTaskIndex.byBmadKey) {
    listTaskIndex.byBmadKey = await buildBmadKeyTaskIndex(fetchImpl, {
      listId,
      fieldId: bmadKeyFieldId,
      token,
    });
  }

  const summary = {
    created: 0,
    existing: 0,
    skipped: 0,
    failed: 0,
    wouldCreate: 0,
    wouldSkip: 0,
  };
  const seenKeys = new Set();

  for (const record of records) {
    const { developmentStatusKey, sourceStatus, track } = record;

    if (seenKeys.has(developmentStatusKey)) {
      console.warn(`Duplicate BMad key "${developmentStatusKey}" in the same run. Skipping.`);
      summary.skipped += 1;
      continue;
    }
    seenKeys.add(developmentStatusKey);

    const epicParentId = resolveEpicParentId(developmentStatusKey, track);
    if (!epicParentId) {
      warnUnmappedPrefix(developmentStatusKey, track);
      if (isDryRun) {
        console.log(`${developmentStatusKey}: would skip (unknown prefix)`);
        summary.wouldSkip += 1;
      } else {
        summary.skipped += 1;
      }
      continue;
    }

    if (!Object.hasOwn(statusMap, sourceStatus)) {
      console.warn(
        `No ClickUp status mapping for ${record.sourceKey} with BMad status ${String(sourceStatus)}. Skipping create.`,
      );
      if (isDryRun) {
        console.log(`${developmentStatusKey}: would skip (unknown status)`);
        summary.wouldSkip += 1;
      } else {
        summary.skipped += 1;
      }
      continue;
    }

    const existingTaskId = listTaskIndex.byBmadKey?.get(developmentStatusKey) ?? null;
    if (existingTaskId) {
      console.log(`${developmentStatusKey} already exists: ${existingTaskId}`);
      summary.existing += 1;
      if (!isDryRun) {
        if (options.sleepImpl) await options.sleepImpl(CREATE_DELAY_MS);
        else await sleep(CREATE_DELAY_MS);
      }
      continue;
    }

    const story = storyDescriptions.get(developmentStatusKey) ?? null;
    if (descriptionSettings.enabled && !story) {
      console.warn(`No epic story found for BMad key "${developmentStatusKey}". Creating without a description.`);
    }

    if (isDryRun) {
      console.log(
        `${developmentStatusKey}: would create subtask under epic ${epicParentId}${story ? ' with description' : ''}`,
      );
      summary.wouldCreate += 1;
      continue;
    }

    try {
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
            ...(story ? { markdown_description: story.markdown } : {}),
            custom_fields: [{ id: bmadKeyFieldId, value: developmentStatusKey }],
          }),
        },
        `task create for ${developmentStatusKey}`,
        token,
      );
      const createdTask = await readResponseJson(createResponse, `task create for ${developmentStatusKey}`, token);
      const createdTaskId = String(createdTask.id);
      await setBmadKeyOnTask(fetchImpl, {
        taskId: createdTaskId,
        fieldId: bmadKeyFieldId,
        bmadKey: developmentStatusKey,
        token,
        headers,
      });
      await verifyBmadKeyOnTask(fetchImpl, {
        taskId: createdTaskId,
        fieldId: bmadKeyFieldId,
        bmadKey: developmentStatusKey,
        token,
      });
      listTaskIndex.byBmadKey.set(developmentStatusKey, createdTaskId);
      console.log(`Created task ${createdTaskId} for ${developmentStatusKey}`);
      summary.created += 1;
    } catch (error) {
      console.error(`Failed to create ClickUp task for ${developmentStatusKey}: ${error.message}`);
      summary.failed += 1;
    }

    if (options.sleepImpl) await options.sleepImpl(CREATE_DELAY_MS);
    else await sleep(CREATE_DELAY_MS);
  }

  if (isDryRun) {
    console.log('No ClickUp changes made.');
  }

  return summary;
}

module.exports = { createMissingClickUpTasks };

if (require.main === module) {
  createMissingClickUpTasks()
    .then((summary) => {
      if (dryRunEnabled()) {
        console.log(
          `Dry-run finished: ${summary.wouldCreate} would create, ${summary.existing} existing, ${summary.wouldSkip} would skip, ${summary.skipped} skipped.`,
        );
        return;
      }
      console.log(
        `Create-if-missing finished: ${summary.created} created, ${summary.existing} existing, ${summary.skipped} skipped, ${summary.failed} failed.`,
      );
      if (summary.failed > 0) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(`ClickUp create-if-missing failed: ${error.message}`);
      process.exitCode = 1;
    });
}
