# workspace

This workspace repository ties together the `services/backend` and `services/frontend` projects as git submodules.

## ClickUp sprint-status synchronization

`npm run sync:clickup` is a one-way synchronization from BMad `sprint-status.yaml`
files to existing ClickUp tasks. It never creates ClickUp tasks, Lists, folders, or
Custom Fields. The synchronizer requires a `CLICKUP_API_TOKEN` and refuses to write
unless that token is authorized for Workspace `90122019689` and each mapped task's
`team_id` identifies that same Workspace; this Workspace ID is mandatory. Configure
only existing ClickUp task IDs in `clickup-sync.yaml`.

Run its focused tests with:

```
npm run test:clickup
```

### GitHub Actions setup and mappings

The repository workflow runs this one-way synchronization only on pushes to the
trusted default branch, `main`, when a BMad `sprint-status.yaml`,
`clickup-sync.yaml`, or the synchronization script changes. It reads BMad status
values and updates existing ClickUp tasks; it does not pull ClickUp data back into
BMad or create ClickUp resources. The destination is always Workspace
`90122019689`.

To enable it in GitHub, add a repository Actions secret named
`CLICKUP_API_TOKEN`. Give that secret access only to the existing ClickUp tasks it
needs to update. Keep the token out of tracked files (including `.env`).

Copy each existing ClickUp task ID into an explicit `clickup-sync.yaml` mapping.
The mapping key is the BMad sprint-status file path relative to the repository,
followed by `#` and its `development_status` key. The values written to ClickUp
Custom Fields come from each mapping entry's `git_branch` and `validation_status`
values, not from Git history or task discovery.

```yaml
workspace_id: "90122019689"
status_map:
  in-progress: "in progress"
  review: "code review"
custom_fields:
  git_branch: "YOUR_GIT_BRANCH_FIELD_UUID"
  validation_status: "YOUR_VALIDATION_STATUS_FIELD_UUID"
tasks:
  "_bmad-output/implementation-artifacts/example/sprint-status.yaml#example-story":
    task_id: "EXISTING_CLICKUP_TASK_ID"
    git_branch: "feature/example-story"
    validation_status: "passed"
```

Replace the two `custom_fields` placeholder values with the UUIDs of existing
ClickUp Custom Fields. Omit a field UUID, or omit that entry's value, to skip its
update. Customize `status_map` to translate each BMad status used by a mapped
entry into the matching existing ClickUp status. Keep every task mapping explicit:
the synchronizer does not search for, infer, or create tasks.

## Getting started

Clone the workspace and its submodules in one step:

```
git clone --recurse-submodules git@github.com:altexsoft-dmytro-novyk/workplace.git
cd workplace
```

If you already cloned without `--recurse-submodules`, initialize them afterwards:

```
npm run services:init
```

### Service submodule scripts

| Script | Description |
| --- | --- |
| `npm run services:init` | Initialize and clone submodules (`git submodule update --init --recursive`) |
| `npm run services:status` | Show submodule status (`git submodule status`) |
| `npm run services:sync` | Update submodules to their remote branch tip (`git submodule update --remote`) |
| `npm run services:install` | Install dependencies for both services (`npm install` in `services/backend` and `services/frontend`) |
| `npm run services:build` | Build both services |
| `npm run services:lint` | Lint both services |
| `npm run services:test` | Run tests for both services |
| `npm run services:db:up` | Start the backend's Postgres container (`docker compose up -d` in `services/backend`) |
| `npm run services:db:down` | Stop the backend's Postgres container |
| `npm run services:dev:backend` | Run only the backend dev server (port 3001) |
| `npm run services:dev:frontend` | Run only the frontend dev server (port 4200) |


### Running both services

To run the backend and frontend together, open two terminal tabs (or windows):

**Terminal 1** — install dependencies, start the database, and run the backend:

```
npm run services:install && npm run services:db:up && npm run services:dev:backend
```

**Terminal 2** — run the frontend:

```
npm run services:dev:frontend
```



### Remotes

| Repository | Path | Remote |
| --- | --- | --- |
| workspace (this repo) | `.` | `git@github.com:altexsoft-dmytro-novyk/workplace.git` |
| backend | `services/backend` | `git@github.com:altexsoft-dmytro-novyk/backend.git` |
| frontend | `services/frontend` | `git@github.com:altexsoft-dmytro-novyk/frontend.git` |
