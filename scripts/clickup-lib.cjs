const fs = require('node:fs/promises');
const path = require('node:path');
const yaml = require('js-yaml');

const EXPECTED_WORKSPACE_ID = '90122019689';
const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const IMPLEMENTATION_ARTIFACTS_DIR = '_bmad-output/implementation-artifacts';
const INCLUDED_TRACKS = ['platform', 'user-management'];
const CREATE_DELAY_MS = 700;

const EPIC_BY_TRACK = {
  platform: [
    { prefix: '1-', epicId: '869eupgh3' },
    { prefix: '2-', epicId: '869euphdh' },
    { prefix: '3-', epicId: '869euphgj' },
  ],
  'user-management': [
    { prefix: '0-', epicId: '869euphpm' },
  ],
};

const UNMAPPED_PREFIX_ACTION =
  'Add epic parent ID to EPIC_BY_TRACK in scripts/clickup-lib.cjs and create the Epic task in ClickUp before the next sync.';

function asObject(value, context) {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`${context} must be a YAML mapping`);
  }
  return value;
}

async function readYaml(filePath, label) {
  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read ${label} at ${filePath}: ${error.message}`);
  }
  try {
    return asObject(yaml.load(content), `${label} at ${filePath}`);
  } catch (error) {
    if (error.message.includes(`${label} at ${filePath}`)) throw error;
    throw new Error(`Unable to parse ${label} at ${filePath}: ${error.message}`);
  }
}

async function findSprintStatusPaths(rootDir) {
  const results = [];
  for (const track of INCLUDED_TRACKS) {
    const filePath = path.join(rootDir, IMPLEMENTATION_ARTIFACTS_DIR, track, 'sprint-status.yaml');
    try {
      await fs.access(filePath);
      results.push(filePath);
    } catch {
      // Track file not present — skip.
    }
  }
  return results;
}

function trackFromSourcePath(sourcePath) {
  const normalized = sourcePath.split(path.sep).join('/');
  const match = normalized.match(/\/implementation-artifacts\/([^/]+)\/sprint-status\.yaml$/);
  if (!match) {
    throw new Error(`Unable to determine track for sprint status file: ${sourcePath}`);
  }
  return match[1];
}

function relativeSourceKey(rootDir, sourcePath, developmentStatusKey) {
  return `${path.relative(rootDir, sourcePath).split(path.sep).join('/')}#${developmentStatusKey}`;
}

function shouldSkipStoryKey(key) {
  if (/^epic-/.test(key)) return true;
  if (/-retrospective$/.test(key)) return true;
  return false;
}

function shouldSkipDevelopmentStatus(key, sourceStatus) {
  if (shouldSkipStoryKey(key)) return true;
  if (sourceStatus === 'optional') return true;
  return false;
}

function resolveEpicParentId(key, track) {
  const mappings = EPIC_BY_TRACK[track] || [];
  const match = mappings.find((entry) => key.startsWith(entry.prefix));
  return match?.epicId ?? null;
}

function warnUnmappedPrefix(key, track) {
  console.warn(
    `No epic mapping for BMad key "${key}" in track "${track}". Skipping. Action: ${UNMAPPED_PREFIX_ACTION}`,
  );
}

function dryRunEnabled(options = {}) {
  if (options.dryRun === true) return true;
  const raw = options.dryRun ?? process.env.CLICKUP_DRY_RUN;
  return raw === 'true' || raw === '1';
}

function collectEpicIdsFromTrackMap(trackMap = EPIC_BY_TRACK) {
  const epicIds = new Set();
  for (const mappings of Object.values(trackMap)) {
    for (const entry of mappings) {
      epicIds.add(entry.epicId);
    }
  }
  return [...epicIds];
}

async function fetchListDetails(fetchImpl, listId, token) {
  const response = await request(
    fetchImpl,
    `${CLICKUP_API_BASE}/list/${encodeURIComponent(listId)}`,
    { headers: { Authorization: token } },
    `list validation for ${listId}`,
    token,
  );
  return readResponseJson(response, `list validation for ${listId}`, token);
}

function taskListId(task) {
  return task?.list?.id ? String(task.list.id) : null;
}

function listSpaceId(listPayload) {
  return listPayload?.space?.id ? String(listPayload.space.id) : null;
}

function taskWorkspaceId(task) {
  if (task?.team_id !== undefined && task?.team_id !== null) return String(task.team_id);
  if (task?.workspace_id !== undefined && task?.workspace_id !== null) return String(task.workspace_id);
  return null;
}

async function fetchSpacesForWorkspace(fetchImpl, workspaceId, token, archived = false) {
  const response = await request(
    fetchImpl,
    `${CLICKUP_API_BASE}/team/${encodeURIComponent(workspaceId)}/space?archived=${archived ? 'true' : 'false'}`,
    { headers: { Authorization: token } },
    `spaces in workspace ${workspaceId}`,
    token,
  );
  return readResponseJson(response, `spaces in workspace ${workspaceId}`, token);
}

async function fetchFolderDetails(fetchImpl, folderId, token) {
  const response = await request(
    fetchImpl,
    `${CLICKUP_API_BASE}/folder/${encodeURIComponent(folderId)}`,
    { headers: { Authorization: token } },
    `folder validation for ${folderId}`,
    token,
  );
  return readResponseJson(response, `folder validation for ${folderId}`, token);
}

function spaceIdFromPayload(payload) {
  if (!payload) return null;
  if (payload?.space?.id !== undefined && payload?.space?.id !== null) {
    return String(payload.space.id);
  }
  if (payload?.space_id !== undefined && payload?.space_id !== null) {
    return String(payload.space_id);
  }
  return null;
}

async function spaceIdForList(fetchImpl, listPayload, token) {
  const directSpaceId = spaceIdFromPayload(listPayload);
  if (directSpaceId) return directSpaceId;

  const folderId = listPayload?.folder?.id;
  if (!folderId) return null;

  const folderPayload = await fetchFolderDetails(fetchImpl, String(folderId), token);
  return spaceIdFromPayload(folderPayload);
}

async function listSpaceBelongsToWorkspace(fetchImpl, spaceId, expectedWorkspaceId, token) {
  for (const archived of [false, true]) {
    const spacesPayload = await fetchSpacesForWorkspace(fetchImpl, expectedWorkspaceId, token, archived);
    const spaces = Array.isArray(spacesPayload.spaces) ? spacesPayload.spaces : [];
    if (spaces.some((space) => String(space.id) === spaceId)) {
      return true;
    }
  }
  return false;
}

async function resolveListWorkspaceId(fetchImpl, listPayload, expectedWorkspaceId, token) {
  const directWorkspaceId = taskWorkspaceId(listPayload);
  if (directWorkspaceId) return directWorkspaceId;

  const spaceId = await spaceIdForList(fetchImpl, listPayload, token);
  if (!spaceId) return null;

  const belongsToExpectedWorkspace = await listSpaceBelongsToWorkspace(
    fetchImpl,
    spaceId,
    expectedWorkspaceId,
    token,
  );
  return belongsToExpectedWorkspace ? String(expectedWorkspaceId) : null;
}

async function validateClickUpTargets(fetchImpl, { listId, workspaceId, epicIds, token }) {
  const expectedWorkspaceId = String(workspaceId);
  const expectedListId = String(listId);
  const listPayload = await fetchListDetails(fetchImpl, expectedListId, token);

  for (const epicId of epicIds) {
    const epic = await fetchTaskDetails(fetchImpl, epicId, token);
    const epicWorkspaceId = taskWorkspaceId(epic);
    if (epicWorkspaceId !== expectedWorkspaceId) {
      throw new Error(
        `ClickUp epic ${epicId} belongs to workspace ${epicWorkspaceId ?? 'unknown'}, expected ${expectedWorkspaceId}`,
      );
    }
    const epicListId = taskListId(epic);
    if (epicListId !== expectedListId) {
      throw new Error(
        `ClickUp epic ${epicId} belongs to list ${epicListId ?? 'unknown'}, expected ${expectedListId}`,
      );
    }
  }

  const listWorkspaceId = await resolveListWorkspaceId(
    fetchImpl,
    listPayload,
    expectedWorkspaceId,
    token,
  );
  if (listWorkspaceId === null) {
    console.warn(
      `ClickUp list ${expectedListId} workspace confirmed via epic parents (list API returned no workspace ID).`,
    );
  } else if (listWorkspaceId !== expectedWorkspaceId) {
    const spaceId = await spaceIdForList(fetchImpl, listPayload, token);
    throw new Error(
      `ClickUp list ${expectedListId} belongs to workspace ${listWorkspaceId}`
      + `${spaceId ? ` (space ${spaceId})` : ''}, expected ${expectedWorkspaceId}`,
    );
  }

  return {
    listId: expectedListId,
    workspaceId: expectedWorkspaceId,
    epicIds: [...epicIds],
  };
}

function buildListTasksUrl(listId, page = 0) {
  const params = new URLSearchParams({
    subtasks: 'true',
    page: String(page),
  });
  return `${CLICKUP_API_BASE}/list/${encodeURIComponent(listId)}/task?${params.toString()}`;
}

function readCustomFieldValue(task, fieldId) {
  if (!task || !Array.isArray(task.custom_fields)) return null;
  const field = task.custom_fields.find((entry) => String(entry.id) === String(fieldId));
  if (!field || field.value === undefined || field.value === null || field.value === '') return null;
  return String(field.value);
}

function findTaskIdByBmadKeyInTasks(tasks, fieldId, bmadKey) {
  for (const task of tasks) {
    if (readCustomFieldValue(task, fieldId) === bmadKey) {
      return String(task.id);
    }
  }
  return null;
}

async function fetchTaskDetails(fetchImpl, taskId, token) {
  const response = await request(
    fetchImpl,
    `${CLICKUP_API_BASE}/task/${encodeURIComponent(taskId)}`,
    { headers: { Authorization: token } },
    `task details for ${taskId}`,
    token,
  );
  return readResponseJson(response, `task details for ${taskId}`, token);
}

async function buildBmadKeyTaskIndex(fetchImpl, { listId, fieldId, token }) {
  const headers = { Authorization: token };
  const index = new Map();
  let page = 0;
  let lastPage = false;

  while (!lastPage) {
    const response = await request(
      fetchImpl,
      buildListTasksUrl(listId, page),
      { headers },
      `list tasks page ${page}`,
      token,
    );
    const payload = await readResponseJson(response, `list tasks page ${page}`, token);
    const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];

    for (const listTask of tasks) {
      const taskId = String(listTask.id);
      let bmadKeyValue = readCustomFieldValue(listTask, fieldId);
      if (bmadKeyValue === null) {
        const fullTask = await fetchTaskDetails(fetchImpl, taskId, token);
        bmadKeyValue = readCustomFieldValue(fullTask, fieldId);
      }
      if (bmadKeyValue === null) continue;
      if (index.has(bmadKeyValue)) {
        console.warn(
          `Duplicate bmad_key "${bmadKeyValue}" on tasks ${index.get(bmadKeyValue)} and ${taskId}; using ${index.get(bmadKeyValue)}.`,
        );
        continue;
      }
      index.set(bmadKeyValue, taskId);
    }

    lastPage = Boolean(payload.last_page);
    page += 1;
    if (tasks.length === 0) break;
  }

  return index;
}

async function setBmadKeyOnTask(fetchImpl, { taskId, fieldId, bmadKey, token, headers }) {
  await request(
    fetchImpl,
    `${CLICKUP_API_BASE}/task/${encodeURIComponent(taskId)}/field/${encodeURIComponent(fieldId)}`,
    {
      method: 'POST',
      headers: headers || { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: bmadKey }),
    },
    `bmad_key update for ${bmadKey}`,
    token,
  );
}

async function verifyBmadKeyOnTask(fetchImpl, { taskId, fieldId, bmadKey, token }) {
  const task = await fetchTaskDetails(fetchImpl, taskId, token);
  const value = readCustomFieldValue(task, fieldId);
  if (value !== bmadKey) {
    throw new Error(`ClickUp task ${taskId} bmad_key is "${value ?? ''}", expected "${bmadKey}"`);
  }
}

function findDuplicateStoryKeys(records) {
  const sourcesByKey = new Map();
  for (const record of records) {
    if (!sourcesByKey.has(record.developmentStatusKey)) {
      sourcesByKey.set(record.developmentStatusKey, []);
    }
    sourcesByKey.get(record.developmentStatusKey).push(record.sourceKey);
  }
  return [...sourcesByKey.entries()].filter(([, sourceKeys]) => sourceKeys.length > 1);
}

function formatDuplicateStoryKeys(duplicates) {
  return duplicates
    .map(([key, sourceKeys]) => `${key} (${sourceKeys.join(', ')})`)
    .join('; ');
}

function parseKeyFilter(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return null;
  const keys = rawValue.split(',').map((value) => value.trim()).filter(Boolean);
  return keys.length > 0 ? new Set(keys) : null;
}

function keyFilterFromOptions(options = {}) {
  if (options.keyFilter instanceof Set) return options.keyFilter;
  return parseKeyFilter(options.keyFilter || process.env.CLICKUP_BMAD_KEYS);
}

function matchesKeyFilter(developmentStatusKey, keyFilter) {
  return !keyFilter || keyFilter.has(developmentStatusKey);
}

async function collectDevelopmentStatusRecords(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const sourcePaths = options.sprintStatusPaths || await findSprintStatusPaths(rootDir);
  const keyFilter = keyFilterFromOptions(options);
  const records = [];

  for (const sourcePath of sourcePaths) {
    const resolvedSourcePath = path.resolve(sourcePath);
    const track = trackFromSourcePath(resolvedSourcePath);
    const sprintStatus = await readYaml(resolvedSourcePath, 'BMad sprint status');
    const developmentStatus = asObject(
      sprintStatus.development_status,
      `development_status in ${resolvedSourcePath}`,
    );

    for (const [developmentStatusKey, sourceStatus] of Object.entries(developmentStatus)) {
      if (shouldSkipDevelopmentStatus(developmentStatusKey, sourceStatus)) continue;
      if (!matchesKeyFilter(developmentStatusKey, keyFilter)) continue;
      records.push({
        sourcePath: resolvedSourcePath,
        track,
        sourceKey: relativeSourceKey(rootDir, resolvedSourcePath, developmentStatusKey),
        developmentStatusKey,
        sourceStatus,
        bmadKey: developmentStatusKey,
      });
    }
  }

  const duplicates = findDuplicateStoryKeys(records);
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate BMad story keys across sprint-status files: ${formatDuplicateStoryKeys(duplicates)}`,
    );
  }

  return records;
}

function redactToken(message, token) {
  return String(message).split(token).join('[REDACTED]');
}

async function request(fetchImpl, url, init, context, token) {
  let response;
  try {
    response = await fetchImpl(url, init);
  } catch (error) {
    throw new Error(`ClickUp ${context} request failed: ${redactToken(error.message, token)}`);
  }
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.text();
      if (body) detail = ` body: ${redactToken(body, token)}`;
    } catch {
      // Ignore unreadable error bodies.
    }
    throw new Error(
      `ClickUp ${context} request failed with HTTP ${response.status} url: ${redactToken(url, token)}${detail}`,
    );
  }
  return response;
}

async function readResponseJson(response, context, token) {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`ClickUp ${context} response was not valid JSON: ${redactToken(error.message, token)}`);
  }
}

async function authorizeWorkspace(fetchImpl, token) {
  const headers = { Authorization: token, 'Content-Type': 'application/json' };
  const teamsResponse = await request(fetchImpl, `${CLICKUP_API_BASE}/team`, { headers }, 'team authorization', token);
  const teamPayload = await readResponseJson(teamsResponse, 'team authorization', token);
  const authorized = Array.isArray(teamPayload.teams)
    && teamPayload.teams.some((team) => String(team.id) === EXPECTED_WORKSPACE_ID);
  if (!authorized) {
    throw new Error(`Authorized ClickUp teams do not include required Workspace ${EXPECTED_WORKSPACE_ID}`);
  }
  return headers;
}

async function findTaskByBmadKey(fetchImpl, { listId, fieldId, bmadKey, token, listTaskIndex = {} }) {
  if (!listTaskIndex.byBmadKey) {
    listTaskIndex.byBmadKey = await buildBmadKeyTaskIndex(fetchImpl, { listId, fieldId, token });
  }
  return listTaskIndex.byBmadKey.get(bmadKey) ?? null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bmadKeyLookupEnabled(config) {
  const customFields = config.custom_fields === undefined
    ? {}
    : asObject(config.custom_fields, 'custom_fields');
  return Boolean(config.list_id && customFields.bmad_key);
}

module.exports = {
  EXPECTED_WORKSPACE_ID,
  CLICKUP_API_BASE,
  CREATE_DELAY_MS,
  EPIC_BY_TRACK,
  UNMAPPED_PREFIX_ACTION,
  asObject,
  authorizeWorkspace,
  bmadKeyLookupEnabled,
  buildBmadKeyTaskIndex,
  buildListTasksUrl,
  collectDevelopmentStatusRecords,
  collectEpicIdsFromTrackMap,
  dryRunEnabled,
  findDuplicateStoryKeys,
  findSprintStatusPaths,
  findTaskByBmadKey,
  findTaskIdByBmadKeyInTasks,
  fetchListDetails,
  fetchTaskDetails,
  formatDuplicateStoryKeys,
  keyFilterFromOptions,
  matchesKeyFilter,
  listSpaceId,
  parseKeyFilter,
  readCustomFieldValue,
  readYaml,
  readResponseJson,
  relativeSourceKey,
  request,
  resolveEpicParentId,
  resolveListWorkspaceId,
  setBmadKeyOnTask,
  shouldSkipDevelopmentStatus,
  shouldSkipStoryKey,
  sleep,
  taskListId,
  taskWorkspaceId,
  trackFromSourcePath,
  validateClickUpTargets,
  verifyBmadKeyOnTask,
  warnUnmappedPrefix,
};
