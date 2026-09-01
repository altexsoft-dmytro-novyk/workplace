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

**Problem:** The employee population is a fixed, delivered set — a
semicolon-delimited timetracker export (`docs/Accounts_template.csv`) imported
into the timetracker test environment (§4.17, changelog). There is **no
employee-creation flow** — no `POST /users`, no AD, no SSO. The pre-v1.5
backend has a `POST /users` registration endpoint, `RegisterUserAction`, and
`um-reg-*` tests; these are **retired**, not extended (AD-21 brownfield cutover).

**Approach (v1.5):** An idempotent administrative import reads the delivered
semicolon-delimited timetracker export **`docs/Accounts_template.csv`** and
populates `User` rows with the mapped S1 identity-card fields. The file carries
**no employee-id column**, so the import is **keyed by the normalized `Email`**
(trim + lowercase, DEC-UM-007) — `ttId` (AD-13) has **no source column** and is
left `null`. The exact batch transport / operator endpoint is an explicit AD-1
follow-up contract (`api-conventions.md` "Seeded-population import") — fix it in a
scenario before implementation. Existing local test data is re-imported through
this path, never migrated from the old routes.

**Column → `User` field mapping (from `docs/Accounts_template.csv`).** Header:
`FirstName;LastName;Email;Birthday;PositionId;PositionName;RegistrationDate;DepartmentId;DepartmentName;DismissedDate;IsDismissed;EmployeeType;TimeZone;CountryId;CountryCode;CountryName;CountryStateId;CountryStateName`

| CSV column | → `User` field | Notes / **OPEN** |
| --- | --- | --- |
| `Email` | `workEmail` | normalized (trim + lowercase, DEC-UM-007); **natural key**. |
| `FirstName` / `LastName` | `firstName` / `lastName` | |
| `Birthday` | `birthDay` + `birthMonth` | `NULL` or a date; date → split day/month, **drop the year** (§3.2); `NULL` → both `null` (deliberate `NULL` ≠ the "incomplete pair rejected" DEC). |
| `RegistrationDate` | `companyJoinDate` (`date`) | |
| `PositionName` | `position` (free-text S1) | |
| `PositionId` | — | **OPEN:** positions dictionary? Not stored now. |
| `DepartmentName` / `DepartmentId` | department **org fact** (§4.17), **not** a free-text S1 field | **OPEN:** Department edge contract deferred (spine Deferred) — store the name transiently or defer department assignment. Do **not** invent the Department schema. |
| `CountryName` | `country` | |
| `CountryCode` / `CountryStateId` / `CountryStateName` / `CountryId` | — | **OPEN** whether stored. `city` has **no source column** → `null`. **OPEN.** |
| `IsDismissed` (`0`/`1`) + `DismissedDate` | **employment status** (§4.16 `active`/`dismissed`), **not** `User.isActive` directly | **Interim:** `User.isActive` may be set `false` for a dismissed row until the `EmploymentStatus` aggregate lands (Epic 5, CC-06). Flag it. |
| `EmployeeType` (`Employee`/…) | S4 employee type (FTE/Subcontractor) | **S4 not on `User`** (PRD: `User` is S1-only) → **OPEN / not imported yet.** |
| `TimeZone` | — | not an S1 field. Distinct from AD-20's `BUSINESS_TIME_ZONE`. |
| *(none)* | `workPhone`, `photo` | **no source column** → `null`. |
| *(writer)* | `createdBy` | the ACM-0 root `User` id (import runs as the root operator). |
| *(DB default)* | `customFields` | `{}` (writer omits it — DEC-UM-003). |

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
  active root `User` (normalized `workEmail`) before import runs. A CSV row
  whose normalized `Email` matches the normalized `ROOT_WORK_EMAIL`
  **updates the existing ACM-0 root `User`** (same `id`/`createdAt`/`createdBy`);
  no writer inserts a second row for a normalized email that already exists
  (active or inactive). The file's own sample row
  `dmytro.novyk+boot@altexsoft.com` is a normal employee row unless it matches
  `ROOT_WORK_EMAIL`. Deployment order: `db:deploy` → `db:seed` →
  `db:bootstrap:access-control` → `start:prod`.
- `workEmail` unique (normalized). `ttId` is `null` for every imported row
  (no source column) — the `ttId` unique index still holds (null ≠ null).
- Each imported `User` gets a system `joined_company` `UserEvents` row written
  **synchronously in the same transaction** as the row insert (AD-11 / Epic 3
  pattern) — not via HTTP.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Re-running the import is non-destructive and idempotent (**keyed by the
  normalized `Email`** — the file has no id column): no duplicate rows, no
  clobber of authorized later edits beyond what the import owns.

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
| Import success | Fresh DB (post `db:seed`), `docs/Accounts_template.csv` | One `User` row per CSV row, mapped S1 fields populated, `workEmail` unique (normalized), `workPhone`/`city`/`photo`/`ttId` `null` (no source column), each row has a system `joined_company` event dated from `RegistrationDate` |
| Root row in the CSV | A CSV `Email` normalizes to `ROOT_WORK_EMAIL` | The existing root `User` row is **updated** in place; no second row (DEC-UM-009) |
| No `POST /users` | App running after import; client calls `POST /users` | Route absent or permanently rejected — no create capability |
| Bootstrap role | After `db:bootstrap:access-control` | Exactly one `User` holds the seeded `hr-admin` FR policy (FR-1, AD-12); the entitlement proof itself is access-control's `fc-03`, not duplicated here |
| Re-run | Import run twice | Idempotent — no duplicate rows, keyed by the normalized `Email` |
| Ambiguous normalized match | Pre-existing non-normalized rows collide on normalized `workEmail` | Fail closed with actionable diagnostics; never silently pick one |
| `Birthday` is `NULL` | CSV row with `Birthday=NULL` | `birthDay` and `birthMonth` both `null` — a deliberate `NULL` is accepted, not the incomplete-pair rejection |

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
- **OPEN mapping items (do not guess — see the mapping table):** `PositionId`
  (positions dictionary?); `DepartmentName`/`DepartmentId` (Department edge
  contract deferred — store transiently or defer assignment; do not invent the
  schema); `CountryCode`/`CountryStateName` storage and the missing `city`
  source; `EmployeeType` → S4 (not on the `User` row); `IsDismissed`/
  `DismissedDate` → `EmploymentStatus` §4.16 vs the interim `User.isActive=false`
  stopgap (Epic 5, CC-06); `TimeZone` (not imported); whether a later TT sync
  populates `ttId`.
