# ClickUp Sprint-Status Synchronization Design

## Goal

Synchronize tracked BMad story statuses from repository YAML files to their already-created ClickUp tasks without allowing ClickUp to alter repository state. Every API write is restricted to ClickUp Workspace `90122019689`.

## Scope

The integration is a GitHub Actions workflow and a small Node.js command-line tool. It reads the existing BMad `development_status` mapping from changed `_bmad-output/implementation-artifacts/**/sprint-status.yaml` files. It will not create ClickUp tasks, Lists, folders, or custom fields, and it will not modify any `sprint-status.yaml` file. Repository YAML is authoritative.

## Configuration

`clickup-sync.yaml` at the repository root holds `workspace_id: "90122019689"`, a BMad-to-ClickUp `status_map`, optional Custom Field UUIDs, and task entries keyed as `<relative-sprint-status-path>#<development_status-key>`. Each task entry has `task_id` and optional `git_branch` / `validation_status` values. An unmapped key causes no API write.

## Safety model

The command requires `CLICKUP_API_TOKEN`. Before resolving a mapped task, it calls `GET https://api.clickup.com/api/v2/team` and confirms the response contains Workspace ID `90122019689`. Otherwise it stops before any task or field endpoint is called.

It uses only `PUT /api/v2/task/{task_id}` with a status body and optional `POST /api/v2/task/{task_id}/field/{field_id}` requests for configured non-empty custom-field values. Errors identify the source key, task ID, HTTP status, and ClickUp error body without logging the token.

## Workflow and testing

GitHub Actions runs when a relevant status, config, workflow, or sync script changes; Node 20 installs the lockfile with `npm ci` and takes the token only from `secrets.CLICKUP_API_TOKEN`. Tests use a fake `fetch` and prove successful writes, the no-write workspace guard, unmapped entry behavior, and API/config errors.

## References

ClickUp documents [Get Authorized Workspaces](https://developer.clickup.com/reference/getauthorizedteams), [Update Task](https://developer.clickup.com/reference/updatetask), and [Set Custom Field Value](https://developer.clickup.com/reference/setcustomfieldvalue).
