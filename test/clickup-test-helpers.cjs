const WORKSPACE_ID = '90122019689';
const DEFAULT_LIST_ID = '901221186877';
const DEFAULT_SPACE_ID = '90122019689-space';
// Derived rather than listed, so adding an epic mapping does not silently
// invalidate every fixture that validates epic parents.
const { collectEpicIdsFromTrackMap } = require('../scripts/clickup-lib.cjs');

const EPIC_IDS = collectEpicIdsFromTrackMap();

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

function listTasksResponse(tasks, lastPage = true) {
  return jsonResponse(200, { tasks, last_page: lastPage });
}

function validationResponse(url, init, options = {}) {
  if (init.method) return null;
  const listId = options.listId || DEFAULT_LIST_ID;
  const workspaceId = options.workspaceId || WORKSPACE_ID;
  const epicListId = options.epicListId || listId;

  if (url.match(new RegExp(`/list/${listId}$`))) {
    return jsonResponse(200, {
      id: listId,
      space: { id: options.spaceId || DEFAULT_SPACE_ID },
    });
  }

  if (url.match(new RegExp(`/team/${workspaceId}/space`))) {
    return jsonResponse(200, {
      spaces: [{ id: options.spaceId || DEFAULT_SPACE_ID }],
    });
  }

  if (url.match(/\/folder\//)) {
    return jsonResponse(200, {
      id: 'mock-folder',
      space: { id: options.spaceId || DEFAULT_SPACE_ID },
    });
  }

  const taskMatch = url.match(/\/task\/([^/?]+)$/);
  if (taskMatch && !url.includes('/field/')) {
    const taskId = taskMatch[1];
    if (EPIC_IDS.includes(taskId)) {
      return jsonResponse(200, {
        id: taskId,
        team_id: workspaceId,
        list: { id: epicListId },
      });
    }
  }

  return null;
}

function withClickUpValidation(innerFetch, options = {}) {
  return async (url, init = {}) => {
    const validation = validationResponse(url, init, options);
    if (validation) return validation;
    return innerFetch(url, init);
  };
}

module.exports = {
  WORKSPACE_ID,
  DEFAULT_LIST_ID,
  DEFAULT_SPACE_ID,
  EPIC_IDS,
  jsonResponse,
  listTasksResponse,
  withClickUpValidation,
};
