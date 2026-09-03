# ClickUp merge gate (run before PR merge)

Branch: `fix/clickup-safety-validation`

## Rules

1. Use a **new disposable** `1-99-*` key (example: `1-99-merge-gate-test`).
2. **Do not** use `9-9-clickup-sync-smoke-test` for live create. It already maps to task `869euv7rn`.
3. Do **not** merge to `main` until this gate passes locally.

## Setup

Add to `platform/sprint-status.yaml` (temporary):

```yaml
  1-99-merge-gate-test: backlog
```

```bash
export CLICKUP_API_TOKEN="<your-token>"
export CLICKUP_BMAD_KEYS=1-99-merge-gate-test
cd /path/to/workplace
git checkout fix/clickup-safety-validation
```

## Gate sequence

```bash
npm run test:clickup
npm run preflight:clickup
CLICKUP_DRY_RUN=true npm run create:clickup
npm run debug:clickup-lookup          # expect NOT FOUND
npm run create:clickup                  # expect 1 created
npm run create:clickup                  # expect 0 created, 1 existing
npm run sync:clickup                    # expect 1 updated, 0 skipped
```

## Preflight pass criteria

- `PASS list 901221186877 in workspace 90122019689`
- Each Epic: `PASS epic … list 901221186877`
- `PASS dry-run completed with zero POST/PUT requests`
- HTTP summary: `{"GET":N}` only

## Cleanup

1. Delete the test subtask in ClickUp.
2. Remove `1-99-merge-gate-test` from `sprint-status.yaml`.
3. Do not commit the temporary key.
