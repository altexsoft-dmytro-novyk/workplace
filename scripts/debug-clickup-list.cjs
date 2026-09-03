const path = require('node:path');
const {
  authorizeWorkspace,
  fetchListDetails,
  listSpaceId,
  readYaml,
  taskListId,
  taskWorkspaceId,
  fetchTaskDetails,
  collectEpicIdsFromTrackMap,
} = require('./clickup-lib.cjs');

async function debugClickUpList(options = {}) {
  const token = options.token || process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN is required');

  const rootDir = path.resolve(options.rootDir || process.cwd());
  const configPath = path.resolve(options.configPath || path.join(rootDir, 'clickup-sync.yaml'));
  const config = await readYaml(configPath, 'ClickUp sync configuration');
  const listId = config.list_id;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  await authorizeWorkspace(fetchImpl, token);
  const listPayload = await fetchListDetails(fetchImpl, listId, token);

  console.log(`List ID: ${listPayload.id ?? listId}`);
  console.log(`List name: ${listPayload.name ?? 'unknown'}`);
  console.log(`list.space.id: ${listSpaceId(listPayload) ?? 'missing'}`);
  console.log(`list.folder.id: ${listPayload?.folder?.id ?? 'missing'}`);
  console.log(`list.team_id: ${taskWorkspaceId(listPayload) ?? 'missing'}`);

  const spacesResponse = await fetchImpl(
    `https://api.clickup.com/api/v2/team/${encodeURIComponent(config.workspace_id)}/space?archived=false`,
    { headers: { Authorization: token } },
  );
  const spacesPayload = await spacesResponse.json();
  const spaceIds = Array.isArray(spacesPayload.spaces)
    ? spacesPayload.spaces.map((space) => String(space.id))
    : [];
  console.log(`Workspace ${config.workspace_id} spaces (${spaceIds.length}): ${spaceIds.join(', ') || 'none'}`);

  console.log('\nEpic parents:');
  for (const epicId of collectEpicIdsFromTrackMap()) {
    const epic = await fetchTaskDetails(fetchImpl, epicId, token);
    console.log(
      `  ${epicId}: team=${taskWorkspaceId(epic) ?? 'missing'} list=${taskListId(epic) ?? 'missing'}`,
    );
  }
}

module.exports = { debugClickUpList };

if (require.main === module) {
  debugClickUpList().catch((error) => {
    console.error(`List diagnostic failed: ${error.message}`);
    process.exitCode = 1;
  });
}
