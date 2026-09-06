---
title: 'Restore the db:bootstrap:access-control npm script'
type: 'bugfix'
created: '2026-09-06'
status: 'done'
route: 'one-shot'
---

# Restore the db:bootstrap:access-control npm script

## Intent

**Problem:** Commit `37a339aabc74193da5e371276a933d1afe7956a6` ("User management implementation (#8)") deleted the `db:bootstrap:access-control` line from `services/backend/package.json` while adding `db:dev:grant-root` in the same slot, leaving the intact wrapper `scripts/bootstrap-access-control.ts` unreachable via npm. This turned the whole ACM-1 CAP-3 suite red (the key-existence assertion failed outright; every other case shelled out to `npm run db:bootstrap:access-control` and got exit 1) and made the documented production deploy order `db:deploy -> db:seed -> db:bootstrap:access-control -> start:prod` unexecutable.

**Approach:** Restore the single deleted line verbatim, in its original position between `db:seed` and the scripts that replaced it. No redesign, no test changes, no rename — the wrapper, the bootstrap module and the deploy order were all already correct and only the npm entrypoint was missing.

## Suggested Review Order

1. [`services/backend/package.json`](../../../services/backend/package.json) — the entire change: one restored line. Confirm the command string matches `37a339a~1` verbatim and that `db:dev:grant-root` / `create:root` are untouched.
2. [`services/backend/scripts/bootstrap-access-control.ts`](../../../services/backend/scripts/bootstrap-access-control.ts) — the now-reachable wrapper. Unmodified; read only to confirm the restored command targets it.
3. [`deferred-work.md`](./deferred-work.md) — four findings recorded, not fixed. The load-bearing one: `tsx` is a devDependency, so this production entrypoint is unproven under `npm ci --omit=dev`.
