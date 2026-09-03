const fs = require('node:fs/promises');
const path = require('node:path');
const yaml = require('js-yaml');

const EXPECTED_WORKSPACE_ID = '90122019689';
const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const IMPLEMENTATION_ARTIFACTS_DIR = '_bmad-output/implementation-artifacts';
const INCLUDED_TRACKS = ['platform', 'user-management'];
const CREATE_DELAY_MS = 700;

const EPIC_BY_PREFIX = [
  { prefix: '0-', epicId: '869euphpm' },
  { prefix: '1-', epicId: '869eupgh3' },
  { prefix: '2-', epicId: '869euphdh' },
  { prefix: '3-', epicId: '869euphgj' },
];

const UNMAPPED_PREFIX_ACTION =
  'Add epic parent ID to EPIC_BY_PREFIX in scripts/clickup-lib.cjs and create the Epic task in ClickUp before the next sync.';

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

function relativeSourceKey(rootDir, sourcePath, developmentStatusKey) {
  return `${path.relative(rootDir, sourcePath).split(path.sep).join('/')}#${developmentStatusKey}`;
}

function shouldSkipStoryKey(key) {
  if (/^epic-/.test(key)) return true;
  if (/-retrospective$/.test(key)) return true;
  return false;
}

function resolveEpicParentId(key) {
  const match = EPIC_BY_PREFIX.find((entry) => key.startsWith(entry.prefix));
  return match?.epicId ?? null;
}

function warnUnmappedPrefix(key) {
  console.warn(
    `No epic mapping for BMad key "${key}". Skipping. Action: ${UNMAPPED_PREFIX_ACTION}`,
  );
}

function buildBmadKeyFilterUrl(listId, fieldId, bmadKey) {
  const customFields = JSON.stringify([{ field_id: fieldId, operator: '=', value: bmadKey }]);
  return `${CLICKUP_API_BASE}/list/${encodeURIComponent(listId)}/task?custom_fields=${encodeURIComponent(customFields)}`;
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
    throw new Error(`ClickUp ${context} request failed with HTTP ${response.status}`);
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

async function findTaskByBmadKey(fetchImpl, { listId, fieldId, bmadKey, token }) {
  const url = buildBmadKeyFilterUrl(listId, fieldId, bmadKey);
  const response = await request(
    fetchImpl,
    url,
    { headers: { Authorization: token } },
    `bmad_key lookup for ${bmadKey}`,
    token,
  );
  const payload = await readResponseJson(response, `bmad_key lookup for ${bmadKey}`, token);
  if (!Array.isArray(payload.tasks) || payload.tasks.length === 0) return null;
  return String(payload.tasks[0].id);
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
  EPIC_BY_PREFIX,
  UNMAPPED_PREFIX_ACTION,
  asObject,
  authorizeWorkspace,
  bmadKeyLookupEnabled,
  buildBmadKeyFilterUrl,
  findSprintStatusPaths,
  findTaskByBmadKey,
  readYaml,
  readResponseJson,
  relativeSourceKey,
  request,
  resolveEpicParentId,
  shouldSkipStoryKey,
  sleep,
  warnUnmappedPrefix,
};
