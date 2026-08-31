---
title: 'Story 1.1: Import Seeded Population'
type: 'feature'
status: draft
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-1-1-hr-admin-registers-a-new-hire.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-1-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — supersedes the pre-v1.5 version
> ("HR Admin Registers a New Hire"); **NOT an AD-1 approval.** Compiled planning
> context for a future story-authoring / dev pass, not a stage-1 scenario doc.

## Intent

**Problem:** The employee population is a fixed, delivered seeded list imported
into the timetracker test environment (§4.17, changelog). There is **no
employee-creation flow** — no `POST /users`, no AD, no SSO. The pre-v1.5
backend has a `POST /users` registration endpoint, `RegisterUserAction`, and
`um-reg-*` tests; these are **retired**, not extended (AD-21 brownfield cutover).

**Approach (v1.5):** An idempotent administrative import keyed by external
timetracker identity (`ttId`) populates `User` rows with S1 identity-card fields
from the delivered list. The exact batch transport / operator endpoint is an
explicit AD-1 follow-up contract (`api-conventions.md` "Seeded-population
import") — fix it in a scenario before implementation. Existing local test data
is re-imported through this path, never migrated from the old routes.

## Boundaries & Constraints

The pre-v1.5 `<frozen-after-approval>` Intent/Boundaries block is **re-opened for
v1.5 renegotiation** — its content (a `POST /users` endpoint gated by session +
entitlement ports, interim adapters) does not survive v1.5 and is not restated.

**Always:**
- AD-1 gate: approved scenario docs under `docs/test-cases/user-management/seed/`
  (`um-seed-*`) → committed-red E2E → implementation. Each stage its own
  dispatch, `author != approver`.
- **DEC-UM-007 canonical at write:** the import writer trims + lowercases
  `workEmail` and **stores the normalized value**. Normalized uniqueness is a
  writer-side guarantee (the DB `users_workEmail_key` index is on the raw
  value); a DB-enforced functional unique index is deferred work.
- **DEC-UM-009 / ACM-0:** `npm run db:seed` has already created the single
  active root `User` (normalized `workEmail`) before import runs. An import
  covering the root person **reuses the ACM-0 root `User` id**; no writer
  inserts a second row for a normalized email that already exists (active or
  inactive). Deployment order: `db:deploy` → `db:seed` →
  `db:bootstrap:access-control` → `start:prod`.
- `ttId` unique where present; `workEmail` unique (normalized).
- Each imported `User` gets a system `joined_company` `UserEvents` row written
  **synchronously in the same transaction** as the row insert (AD-11 / Epic 3
  pattern) — not via HTTP.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Re-running the import is non-destructive and idempotent (keyed by `ttId`):
  no duplicate rows, no clobber of authorized later edits beyond what the
  import owns.

**Never:**
- No `POST /users`, no generic `DELETE`/deactivate route (AD-14/AD-16).
- No password/credential field; no `updatedAt`/`updatedBy`; no
  manager/project/department/mentor columns on `User`.
- Import does **not** establish a session and does **not** dispatch a magic link
  (FR-3; DEC-UM-008 retired).
- Do not import real employee data beyond the delivered list (NFR-1).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Import success | Fresh DB (post `db:seed`), delivered seeded list | One `User` row per seeded employee, S1 fields populated, `workEmail`/`ttId` unique (normalized), each row has a system `joined_company` event dated from seed data |
| Root person in the list | List includes the ACM-0 root person's normalized `workEmail` | The existing root `User` id is reused; no second row (DEC-UM-009) |
| No `POST /users` | App running after import; client calls `POST /users` | Route absent or permanently rejected — no create capability |
| Bootstrap role | After `db:bootstrap:access-control` | Exactly one `User` holds the seeded `hr-admin` FR policy (FR-1, AD-12); the entitlement proof itself is access-control's `fc-03`, not duplicated here |
| Re-run | Import run twice | Idempotent — no duplicate rows, keyed by `ttId` |
| Ambiguous normalized match | Pre-existing non-normalized rows collide on normalized `workEmail` | Fail closed with actionable diagnostics; never silently pick one |

## v1.5 Cutover Notes

- **Retire** `services/backend/src/user-management/application/actions/register-user.action.ts`,
  the `POST /users` handler in `users.controller.ts`, `create-user.dto.ts`'s
  create semantics, and `test/user-management/registration.e2e-spec.ts`
  (`um-reg-01..15`) — in the same change that introduces the import path (AD-21).
- The `User` Prisma model already exists and is largely correct; the import
  writer is new. `prisma/seed.ts` is the ACM-0 root-User entrypoint and already
  normalizes `ROOT_WORK_EMAIL` on write (Kernel MVP R7).
- `interim-session-resolver.adapter.ts` stays (Epic 2 retires it);
  `interim-access-control.adapter.ts` is retired by **Epic 0**, not this story.

## Open Questions / Gates

- The batch transport + operator endpoint shape (AD-14/AD-16 follow-up) — fix in
  the `um-seed-*` scenario before implementation.
- Whether the import runs as a script, an authorized operator HTTP command, or
  both — architect call.
