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
>
> **OPEN items resolved 2026-09-02 — see
> [`epic-1-story-1-1-decisions.md`](./epic-1-story-1-1-decisions.md) (the binding
> delta).** Summary of what changed below: the operator endpoint is
> **`POST /users/import`** (multipart, upload-only, HR-Admin via the existing
> `user-management:create` key — no new permission or kernel seed) plus a
> deploy-script entrypoint; a structurally invalid file → `400` nothing written,
> row errors → `200` with a `skipped`/`errors[]` summary; `Department` is created
> on import, identity = the `(externalId, name)` pair, plus one
> `DepartmentMembership` per person; `IsDismissed` → an `EmploymentStatus` row and
> **`User.isActive` is `true` for every imported row** (the interim
> `isActive=false` stopgap below is **withdrawn**); `PositionId` / `CountryCode` /
> `CountryStateName` / `EmployeeType` / `TimeZone` are not stored; `city` → `null`.

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
left `null`. The operator endpoint is **`POST /users/import`** (multipart
`file` part, upload-only; `api-conventions.md` "Seeded-population import"), with a
deploy/operator script reading `docs/Accounts_template.csv` from the repo path as
the second entrypoint on the same writer (resolved 2026-09-02). Existing local
test data is re-imported through this path, never migrated from the old routes.

**Column → `User` field mapping (from `docs/Accounts_template.csv`).** Header:
`FirstName;LastName;Email;Birthday;PositionId;PositionName;RegistrationDate;DepartmentId;DepartmentName;DismissedDate;IsDismissed;EmployeeType;TimeZone;CountryId;CountryCode;CountryName;CountryStateId;CountryStateName`

| CSV column | → `User` field | Notes / **OPEN** |
| --- | --- | --- |
| `Email` | `workEmail` | normalized (trim + lowercase, DEC-UM-007); **natural key**. |
| `FirstName` / `LastName` | `firstName` / `lastName` | |
| `Birthday` | `birthDay` + `birthMonth` | `NULL` or a date; date → split day/month, **drop the year** (§3.2); `NULL` → both `null` (deliberate `NULL` ≠ the "incomplete pair rejected" DEC). |
| `RegistrationDate` | `companyJoinDate` (`date`) | |
| `PositionName` | `position` (free-text S1) | |
| `PositionId` | — | **not stored** in Story 1.1 — `position` is free-text S1 (`PositionName`); no positions dictionary (resolved 2026-09-02). |
| `DepartmentName` + `DepartmentId` | `Department.name` + `Department.externalId` (`database-schema.md` §Project/Department) + `DepartmentMembership` | **resolved 2026-09-02.** Create-on-import; identity is the **`(externalId, name)` pair** (`UNIQUE (externalId, name)` — `externalId` alone **not** unique; a divergent name for a known `DepartmentId` is a **second** `Department` row). `parentId` = `null`. One `DepartmentMembership { userId, departmentId, validFrom=RegistrationDate, validTo=null }` per person; the CSV carries one `DepartmentId` per row. Department-manager attachment / tree walk stay deferred + fail-closed. |
| `CountryName` | `country` | |
| `CountryCode` / `CountryStateId` / `CountryStateName` / `CountryId` | — | **not stored** (resolved 2026-09-02). `city` has **no source column** → `null`. |
| `IsDismissed` (`0`/`1`) + `DismissedDate` | an **`EmploymentStatus`** row (§4.16 `active`/`dismissed`) | **resolved 2026-09-02.** `1` → `{ status:'dismissed', validFrom: DismissedDate }`; `0` → `{ status:'active', validFrom: RegistrationDate }`; `validTo`/`departureReason`/`sourceDepartureId` = `null` (CHECK relaxed for import-origin dismissals — `database-schema.md` §EmploymentStatus). **`User.isActive` is `true` for every imported row, dismissed included** — the import never sets it from `IsDismissed` (the interim `isActive=false` stopgap is withdrawn). |
| `EmployeeType` (`Employee`/…) | — | **not stored in Story 1.1** — S4 employee type is not on the `User` row; a later story (resolved 2026-09-02). |
| `TimeZone` | — | not stored — not an S1 field. Distinct from AD-20's `BUSINESS_TIME_ZONE`. |
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
  `email+boot@provider.domain` is a normal employee row unless it matches
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
| File-level failure | No `file` part / non-CSV / wrong content-type / header row missing or not matching the expected columns / structurally unparseable | **`400`, nothing written** — zero rows touched, no summary counters |
| Row-level problem | Structurally valid file; a row is missing a required field / has an unparseable date / duplicates an earlier row's normalized `Email` | **`200`** with `{created,updated,departmentsCreated,skipped,errors[]}`; that row per-row skipped (`errors[]` entry `{line,email,reason}`), every good row commits. First occurrence of a duplicated email is processed; each later duplicate is skipped (`reason: "email already exists"`) |
| Department create-on-import | CSV rows referencing new + repeated `DepartmentId`, one repeat with a divergent `DepartmentName` | One `Department` row per `(externalId, name)` pair (divergent name → a second row); `parentId` null; one `DepartmentMembership` per user; no Unit-Manager policy row |
| `EmploymentStatus` mapping | `IsDismissed=0` row; `IsDismissed=1` row | One `active` (`validFrom=RegistrationDate`) resp. one `dismissed` (`validFrom=DismissedDate`) row; `sourceDepartureId`/`departureReason` null; `User.isActive=true` on both |

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

**Resolved 2026-09-02** (`epic-1-story-1-1-decisions.md`):

- Operator endpoint shape → **`POST /users/import`** (multipart, upload-only) plus
  a deploy/operator script entrypoint on the same writer. It runs as **both**.
- Response codes → structurally invalid file `400` (nothing written); row-level
  errors `200` with a per-row `skipped`/`errors[]` summary.
- Mapping → `PositionId` / `CountryCode` / `CountryStateName` / `EmployeeType` /
  `TimeZone` **not stored**; `city` → `null`; `DepartmentName`+`DepartmentId` → a
  `Department` (identity `(externalId, name)`) + one `DepartmentMembership` per
  person; `IsDismissed`+`DismissedDate` → an `EmploymentStatus` row, **not**
  `User.isActive` (which is `true` for every imported row).

**Still open:**

- Exact stage-3 name / package wiring of the deploy-script entrypoint
  (`npm run db:import:population` vel sim.) — an implementation choice.
- Whether a later timetracker sync populates `ttId` (out of Story 1.1).
- The Access-Control department-tree walk increment (unblocks department-derived
  access) — a separate kernel increment.
