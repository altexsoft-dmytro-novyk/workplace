const fs = require('node:fs/promises');
const path = require('node:path');
const yaml = require('js-yaml');

const EXPECTED_WORKSPACE_ID = '90122019689';
const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

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
  async function visit(directory) {
    const children = await fs.readdir(directory, { withFileTypes: true });
    for (const child of children) {
      if (child.name === '.git' || child.name === 'node_modules') continue;
      const childPath = path.join(directory, child.name);
      if (child.isDirectory()) await visit(childPath);
      else if (child.isFile() && child.name === 'sprint-status.yaml') results.push(childPath);
    }
  }
  await visit(rootDir);
  return results.sort();
}

function relativeSourceKey(rootDir, sourcePath, developmentStatusKey) {
  return `${path.relative(rootDir, sourcePath).split(path.sep).join('/')}#${developmentStatusKey}`;
}

async function collectSyncEntries(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  const tasks = asObject(config.tasks, `tasks in ${configPath}`);
  const statusMap = asObject(config.status_map, `status_map in ${configPath}`);
  const sourcePaths = options.sprintStatusPaths || await findSprintStatusPaths(rootDir);
  const entries = [];
  const discoveredSourceKeys = new Set();

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
      if (!Object.hasOwn(tasks, sourceKey)) continue;
      const task = tasks[sourceKey];
      if (!Object.hasOwn(statusMap, sourceStatus)) {
        throw new Error(`No ClickUp status mapping for ${sourceKey} with BMad status ${String(sourceStatus)}`);
      }
      entries.push({
        sourceKey,
        taskId: task.task_id,
        status: statusMap[sourceStatus],
        ...(task.git_branch ? { gitBranch: task.git_branch } : {}),
        ...(task.validation_status ? { validationStatus: task.validation_status } : {}),
      });
    }
  }
  for (const sourceKey of Object.keys(tasks)) {
    if (!discoveredSourceKeys.has(sourceKey)) {
      throw new Error(`Configured task mapping source was not found: ${sourceKey}`);
    }
  }
  return entries;
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
  if (!response.ok) throw new Error(`ClickUp ${context} request failed with HTTP ${response.status}`);
  return response;
}

async function readResponseJson(response, context, token) {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`ClickUp ${context} response was not valid JSON: ${redactToken(error.message, token)}`);
  }
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
  const entries = await collectSyncEntries({ ...options, rootDir, configPath });
  const headers = { Authorization: token, 'Content-Type': 'application/json' };
  const teamsResponse = await request(fetchImpl, `${CLICKUP_API_BASE}/team`, { headers }, 'team authorization', token);
  const teamPayload = await readResponseJson(teamsResponse, 'team authorization', token);
  const authorized = Array.isArray(teamPayload.teams)
    && teamPayload.teams.some((team) => String(team.id) === EXPECTED_WORKSPACE_ID);
  if (!authorized) throw new Error(`Authorized ClickUp teams do not include required Workspace ${EXPECTED_WORKSPACE_ID}`);
  for (const entry of entries) {
    await request(fetchImpl, `${CLICKUP_API_BASE}/task/${encodeURIComponent(entry.taskId)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: entry.status }),
    }, `status update for task ${entry.taskId}`, token);
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
