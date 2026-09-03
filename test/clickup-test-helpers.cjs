const WORKSPACE_ID = '90122019689';
const DEFAULT_LIST_ID = '901221186877';
const EPIC_IDS = ['869euphpm', '869eupgh3', '869euphdh', '869euphgj'];

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
    return jsonResponse(200, { id: listId, team_id: workspaceId });
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
  EPIC_IDS,
  jsonResponse,
  listTasksResponse,
  withClickUpValidation,
};
