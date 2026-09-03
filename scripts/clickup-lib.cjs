const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const yaml = require('js-yaml');

const EXPECTED_WORKSPACE_ID = '90122019689';
const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const IMPLEMENTATION_ARTIFACTS_DIR = '_bmad-output/implementation-artifacts';
const PLANNING_ARTIFACTS_DIR = '_bmad-output/planning-artifacts';
const INCLUDED_TRACKS = ['platform', 'user-management'];
const CREATE_DELAY_MS = 700;
const SYNC_DELAY_MS = 350;

const EPIC_BY_TRACK = {
  platform: [
    { prefix: '1-', epicId: '869eupgh3' },
    { prefix: '2-', epicId: '869euphdh' },
    { prefix: '3-', epicId: '869euphgj' },
  ],
  'user-management': [
    { prefix: '0-', epicId: '869euphpm' },
    { prefix: '1-', epicId: '869evaraf' },
    { prefix: '2-', epicId: '869evarr8' },
    { prefix: '3-', epicId: '869evatht' },
    { prefix: '4-', epicId: '869evau1q' },
    { prefix: '5-', epicId: '869evau97' },
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

// A skipped story used to be a console.warn inside a green job, which is how 14
// of them went unnoticed. On GitHub the same fact goes to the Annotations panel
// and the job summary, without failing the run — sync depends on this job, and
// one unmapped epic must not stop the tasks that are mapped from syncing.
function reportUnmappedPrefixes(unmapped, { env = process.env, appendFile } = {}) {
  if (unmapped.length === 0) return;

  const lines = unmapped.map(({ key, track }) => `${track}: ${key}`);
  if (env.GITHUB_ACTIONS === 'true') {
    const body = [
      `${unmapped.length} BMad ${unmapped.length === 1 ? 'story has' : 'stories have'} no ClickUp epic parent and were skipped:`,
      ...lines,
      UNMAPPED_PREFIX_ACTION,
    ].join('%0A');
    console.log(`::warning title=ClickUp epic mapping incomplete::${body}`);
  }

  const summaryPath = env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  const markdown = [
    '### ClickUp epic mapping incomplete',
    '',
    `${unmapped.length} story key(s) resolved to no epic parent and were skipped:`,
    '',
    ...lines.map((line) => `- \`${line}\``),
    '',
    UNMAPPED_PREFIX_ACTION,
    '',
  ].join('\n');
  return (appendFile || fs.appendFile)(summaryPath, markdown);
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

const STORY_HEADING = /^###\s+Story\s+(\d+)\.(\d+):\s*(.+?)\s*$/;
const SPRINT_KEY_FIELD = /\*\*Sprint key:\*\*\s*`([^`]+)`/;

function slugifyStoryTitle(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function finalizeEpicStory(story) {
  const body = story.bodyLines.join('\n').trim();
  const declared = body.match(SPRINT_KEY_FIELD);
  return {
    sprintKey: declared ? declared[1] : `${story.epicNumber}-${story.storyNumber}-${slugifyStoryTitle(story.title)}`,
    sprintKeySource: declared ? 'declared' : 'derived',
    title: story.title,
    body,
  };
}

// Stories carry an explicit "**Sprint key:** `...`" field in the newer epics;
// the older ones do not, and their sprint-status key is the heading number and
// title slugified. Both shapes resolve to the same key space.
function parseEpicStories(markdown) {
  const stories = [];
  let current = null;
  const flush = () => {
    if (current) stories.push(finalizeEpicStory(current));
    current = null;
  };

  for (const line of String(markdown).split('\n')) {
    const heading = line.match(STORY_HEADING);
    if (heading) {
      flush();
      current = { epicNumber: heading[1], storyNumber: heading[2], title: heading[3], bodyLines: [] };
      continue;
    }
    if (/^#{1,3}\s/.test(line)) {
      flush();
      continue;
    }
    if (current) current.bodyLines.push(line);
  }
  flush();

  return stories;
}

// ClickUp's GET /task does not return `markdown_description` unless asked, and
// what it does return is a plain-text rendering that never compares equal to the
// markdown we sent. So freshness is decided on a fingerprint we embed in the
// footer instead: it survives the plain-text rendering as literal characters.
const DESCRIPTION_FINGERPRINT = /bmad-sync:([0-9a-f]{12})/;

function storyFingerprint(story, sourcePath) {
  return crypto
    .createHash('sha1')
    .update([sourcePath, story.sprintKey ?? story.epicKey, story.title, story.body].join('\u0000'))
    .digest('hex')
    .slice(0, 12);
}

function readDescriptionFingerprint(text) {
  const match = String(text ?? '').match(DESCRIPTION_FINGERPRINT);
  return match ? match[1] : null;
}

const EPIC_HEADING = /^##\s+Epic\s+(\d+):\s*(.+?)\s*$/;

function finalizeEpicOverview(epic) {
  return {
    epicKey: `epic-${epic.epicNumber}`,
    epicNumber: epic.epicNumber,
    title: epic.title,
    body: epic.bodyLines.join('\n').trim(),
  };
}

// An epic's own prose is everything between its "## Epic N:" heading and the
// first "### Story" under it — subsections such as blocking gates belong to the
// epic and are kept. The "### Epic N:" entries under "## Epic List" are
// summaries, not headings, and do not match.
function parseEpicOverviews(markdown) {
  const epics = [];
  let current = null;
  const flush = () => {
    if (current) epics.push(finalizeEpicOverview(current));
    current = null;
  };

  for (const line of String(markdown).split('\n')) {
    const heading = line.match(EPIC_HEADING);
    if (heading) {
      flush();
      current = { epicNumber: heading[1], title: heading[2], bodyLines: [] };
      continue;
    }
    if (STORY_HEADING.test(line) || /^##\s/.test(line)) {
      flush();
      continue;
    }
    if (current) current.bodyLines.push(line);
  }
  flush();

  return epics;
}

function epicDescriptionKey(track, epicNumber) {
  return `${track}:epic-${epicNumber}`;
}

function buildStoryDescription(story, sourcePath) {
  const key = story.sprintKey ?? story.epicKey;
  return [
    `**${story.title}**`,
    '',
    story.body,
    '',
    '---',
    '',
    `_Generated from \`${sourcePath}\` for BMad key \`${key}\`. The epic file is the source of truth. bmad-sync:${storyFingerprint(story, sourcePath)}_`,
  ].join('\n');
}

async function collectStoryDescriptions(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const tracks = options.tracks || INCLUDED_TRACKS;
  const descriptions = new Map();

  for (const track of tracks) {
    const relativePath = `${PLANNING_ARTIFACTS_DIR}/${track}/epics.md`;
    let markdown;
    try {
      markdown = await fs.readFile(path.join(rootDir, PLANNING_ARTIFACTS_DIR, track, 'epics.md'), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw new Error(`Unable to read epic stories at ${relativePath}: ${error.message}`);
    }

    for (const story of parseEpicStories(markdown)) {
      if (descriptions.has(story.sprintKey)) {
        console.warn(`Duplicate story sprint key "${story.sprintKey}" in ${relativePath}. Keeping the first.`);
        continue;
      }
      descriptions.set(story.sprintKey, {
        ...story,
        track,
        sourcePath: relativePath,
        fingerprint: storyFingerprint(story, relativePath),
        markdown: buildStoryDescription(story, relativePath),
      });
    }
  }

  return descriptions;
}

async function collectEpicDescriptions(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const tracks = options.tracks || INCLUDED_TRACKS;
  const descriptions = new Map();

  for (const track of tracks) {
    const relativePath = `${PLANNING_ARTIFACTS_DIR}/${track}/epics.md`;
    let markdown;
    try {
      markdown = await fs.readFile(path.join(rootDir, PLANNING_ARTIFACTS_DIR, track, 'epics.md'), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw new Error(`Unable to read epic overviews at ${relativePath}: ${error.message}`);
    }

    for (const epic of parseEpicOverviews(markdown)) {
      descriptions.set(epicDescriptionKey(track, epic.epicNumber), {
        ...epic,
        track,
        sourcePath: relativePath,
        fingerprint: storyFingerprint(epic, relativePath),
        markdown: buildStoryDescription(epic, relativePath),
      });
    }
  }

  return descriptions;
}

const EPIC_STATUS_KEY = /^epic-(\d+)$/;

async function collectEpicStatusRecords(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const sourcePaths = options.sprintStatusPaths || await findSprintStatusPaths(rootDir);
  const records = [];

  for (const sourcePath of sourcePaths) {
    const resolvedSourcePath = path.resolve(sourcePath);
    const track = trackFromSourcePath(resolvedSourcePath);
    const sprintStatus = await readYaml(resolvedSourcePath, 'BMad sprint status');
    const developmentStatus = asObject(
      sprintStatus.development_status,
      `development_status in ${resolvedSourcePath}`,
    );

    for (const [key, sourceStatus] of Object.entries(developmentStatus)) {
      const match = key.match(EPIC_STATUS_KEY);
      if (!match) continue;
      records.push({
        track,
        epicKey: key,
        epicNumber: match[1],
        sourceStatus,
        sourceKey: relativeSourceKey(rootDir, resolvedSourcePath, key),
        taskId: resolveEpicParentId(`${match[1]}-`, track),
      });
    }
  }

  return records;
}

function descriptionsConfig(config = {}) {
  const raw = config.descriptions;
  if (raw === undefined || raw === null) return { enabled: true, overwrite: false };
  if (raw === false) return { enabled: false, overwrite: false };
  const section = asObject(raw, 'descriptions in ClickUp sync configuration');
  return { enabled: section.enabled !== false, overwrite: section.overwrite === true };
}

function readTaskDescription(task) {
  const markdown = task?.markdown_description;
  if (typeof markdown === 'string' && markdown.trim() !== '') return markdown;
  const plain = task?.description;
  return typeof plain === 'string' ? plain : '';
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
  SYNC_DELAY_MS,
  EPIC_BY_TRACK,
  UNMAPPED_PREFIX_ACTION,
  asObject,
  authorizeWorkspace,
  bmadKeyLookupEnabled,
  buildBmadKeyTaskIndex,
  buildListTasksUrl,
  buildStoryDescription,
  collectDevelopmentStatusRecords,
  collectEpicDescriptions,
  collectEpicIdsFromTrackMap,
  collectEpicStatusRecords,
  collectStoryDescriptions,
  descriptionsConfig,
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
  epicDescriptionKey,
  parseEpicOverviews,
  parseEpicStories,
  parseKeyFilter,
  readCustomFieldValue,
  readDescriptionFingerprint,
  readTaskDescription,
  readYaml,
  readResponseJson,
  relativeSourceKey,
  reportUnmappedPrefixes,
  request,
  resolveEpicParentId,
  resolveListWorkspaceId,
  setBmadKeyOnTask,
  shouldSkipDevelopmentStatus,
  shouldSkipStoryKey,
  sleep,
  slugifyStoryTitle,
  storyFingerprint,
  taskListId,
  taskWorkspaceId,
  trackFromSourcePath,
  validateClickUpTargets,
  verifyBmadKeyOnTask,
  warnUnmappedPrefix,
};
