---
title: 'Story 1.1 (Import Seeded Population) — product/schema decisions'
type: 'decisions'
created: 2026-09-01
decided_by: 'Dmytro Novyk (Product Owner / Architect)'
context:
  - './spec-1-1-import-seeded-population.md'
  - './epic-1-context.md'
  - '{project-root}/docs/architecture/database-schema.md'
  - '{project-root}/docs/project-requirements.md'
---

# Story 1.1 — decisions taken 2026-09-01

These resolve the `OPEN` items in `spec-1-1-import-seeded-population.md`. The
compiled spec stays the detailed contract; this file is the delta.

## 1. Import source

- The canonical source is the delivered file **`docs/Accounts_template.csv`**
  (semicolon-delimited timetracker export). The operator endpoint accepts that
  file (multipart upload) OR reads it from the known path.
- A **timetracker API pull** is a second, future source path (same normalization
  + idempotent-upsert contract). Not built in Story 1.1; the import service is
  shaped so the API path plugs in later without reworking the writer.

## 2. Departments — create-on-import

- **`Department` is created during import if one with the same
  (`externalId`, `name`) pair does not exist yet** (see §2c — `externalId`
  alone is NOT unique). `Department { id uuidv7 PK, name, externalId string
  nullable, parentId uuid? }`, `UNIQUE (externalId, name)`. Departments nest
  via `parentId` (`project-requirements.md`); the CSV has no parent column, so
  `parentId` is `null` on import — hierarchy is assigned later.
- Membership: **`DepartmentMembership { id, userId, departmentId, validFrom
  date }`** — an employee belongs to one or more current departments (§4.17, amended 2026-09-02)
  (`database-schema.md` §Project/Department). `User` does **not** carry a
  `departmentId` column (it never carries derived/access fields —
  `database-schema.md:35`).
- **Unit Manager = the manager of a department** (`project-requirements.md:101,
  516` — there is no separate "unit" entity). Managing a department grants
  Reporting-line access to everyone in it and its sub-departments. Represented
  as a `Policies { type:'AR', targetType:'department', targetId, targetRole:
  'unit-manager' }` row. **No source column in the CSV → NOT populated by
  Story 1.1.** The Access-Control walk honoring `targetType:'department'` +
  department-tree recursion is a **separate kernel increment** (own AD-1
  sequence), same class as the S13 increment; department-derived access stays
  fail-closed until it lands.

## 3. Projects

- The `Project` table already exists. The CSV has **no project columns** →
  Story 1.1 does not touch projects. Project assignment comes from the future
  timetracker path.

## 2b. Multi-department membership + import decisions (2026-09-02)

- **An employee belongs to one or more departments** (amended — was "exactly
  one"). `docs/project-requirements.md` §4.17 and `database-schema.md`
  §Project/Department updated. Derived S1 "department" is a set. Unit-Manager
  access composes over any of the person's departments.
- **The CSV carries one `DepartmentId` per row** → the import creates exactly
  **one** `DepartmentMembership` per person. More memberships are added later
  (second import / manual / timetracker API), never via duplicate rows in the
  same file.
- `DepartmentMembership { id, userId, departmentId, validFrom, validTo? }`,
  `UNIQUE (userId, departmentId) WHERE validTo IS NULL`.
- **Duplicate normalized `Email` → per-row skip** (revised 2026-09-02). The
  offending row is skipped with an `errors[]` entry
  `{ line, email, reason: "email already exists" }`; the rest of the import
  commits (`200`). Within a file, the first occurrence is processed
  (create/update) and each later duplicate row is the skipped one. All row
  errors (missing field, unparseable date, duplicate email) are uniformly
  per-row skip — there is **no** whole-import `400` branch. (An email matching
  an existing active `User` from a prior run is the normal idempotent
  `updated` case, not an error.)
- **`EmploymentStatus` CHECK relaxed** (no `source` discriminator column — per
  Dmytro): a `dismissed` row no longer requires `sourceDepartureId` /
  `departureReason`. `database-schema.md` §EmploymentStatus updated. Import
  `dismissed` row = `{status:'dismissed', validFrom: DismissedDate, validTo:
  null, sourceDepartureId: null, departureReason: null}`.
- **Import is HR-Admin-only**, authorized by the existing `user-management:create`
  permission (seeded by ACM-1, held only by the HR-Admin root — the key the
  retired `POST /users` required). No new `user-management:import` key, no new
  kernel seed sequence. The import is v1.5's population-creation path, so it
  reuses the create capability.

## 2c. Final refinements (2026-09-02)

- **Response code — file-level vs row-level (revises "always 200"):**
  - **File-level failure → `400`, nothing written:** no multipart `file` part,
    unreadable / non-CSV / wrong content-type, header row missing or not
    matching the expected columns, the file is structurally unparseable, or a
    file-wide precondition fails. Body identifies the failure; zero rows
    touched.
  - **Row-level problems → `200`** with the summary + `errors[]`: individual
    rows in an otherwise-valid file that fail (missing required field,
    unparseable date, duplicate email) are per-row skipped; every good row
    commits.
- **`isActive` vs `EmploymentStatus` — kept SEPARATE, distinct meanings
  (neither is redundant):**
  - `User.isActive` — the **account/row-retention** flag. `isActive=false` is
    effectively **user deletion / hard retirement** of the record (as
    originally designed — `database-schema.md` §User, PRD Data Model). Not
    driven by employment. The import sets `isActive=true` for **every** row,
    dismissed included.
  - `EmploymentStatus.status ('active'|'dismissed')` — whether the person
    **currently works here**. Drives directory-list visibility (a `dismissed`
    employee drops from the default `GET /users` list, findable via an
    authorized employment-status filter). Does NOT touch `isActive`.
  - The Access Control kernel keeps joining `User.isActive` unchanged. No
    kernel rework.
- **`Department` identity = (`externalId`, `name`) — `externalId` alone is NOT
  unique (revises #7).** The same timetracker `DepartmentId` arriving with a
  different `DepartmentName` creates a **second** `Department` row. Dedup key
  for create-on-import is the (`externalId`, `name`) pair.

## 4. Employment status — replaces the `isActive` overload

- New aggregate **`EmploymentStatus { id, userId, status: 'active' |
  'dismissed', validFrom date, validTo date?, departureReason string? }`**
  (already specified — `database-schema.md` §EmploymentStatus, AD-16).
- CSV `IsDismissed` (`0`/`1`) + `DismissedDate` → an `EmploymentStatus` row:
  `IsDismissed=1` → `status:'dismissed'`, `validFrom = DismissedDate`;
  `IsDismissed=0` → `status:'active'`, `validFrom = RegistrationDate`.
- **`User.isActive` stays the internal account/row-retention flag only** — the
  import does NOT set it from `IsDismissed`. A dismissed employee is a real
  active `User` row with an `EmploymentStatus` of `dismissed`.

## 5. Column mapping — resolutions to the compiled spec's OPEN rows

| CSV column | Decision |
| --- | --- |
| `PositionId` | not stored — `position` is free-text S1 (`PositionName`) |
| `DepartmentId` / `DepartmentName` | → `Department.externalId` / `.name` (create-on-import), + `DepartmentMembership` |
| `CountryName` | → `User.country` |
| `CountryCode` / `CountryId` / `CountryStateId` / `CountryStateName` | not stored |
| `city` | no source column → `null` |
| `TimeZone` | not stored (not an S1 field) |
| `EmployeeType` | not stored in Story 1.1 (S4 not on `User`; a later story) |
| `Birthday` | `NULL` → both `birthDay`/`birthMonth` `null`; a date → split day/month, drop year (§3.2) |
| `ttId` (AD-13) | no source column → `null` |
| `workPhone`, `photo` | no source column → `null` |
| `createdBy` | the ACM-0 root `User` id (import runs as the root operator) |

## 6. Idempotency + re-import

- Keyed by **normalized `Email`** (`trim().toLowerCase()`, DEC-UM-007) — the CSV
  has no id column.
- Re-running the import upserts: existing rows are updated in place (matched by
  normalized email), new rows inserted, `Department` rows deduped by
  `externalId`. A row that matches `ROOT_WORK_EMAIL` updates the ACM-0 root
  `User` in place (DEC-UM-009).
- Existing local test data is re-imported through this path, never migrated
  from the retired `POST /users` route.

## Still owned elsewhere (not Story 1.1)

- The Access-Control department-tree walk increment (unblocks department access).
- `user-management:edit` kernel seed (unblocks Story 1.2 PATCH + UMAC-2).
- Department hierarchy (`parentId`) + Unit-Manager assignment — no CSV source;
  a later manual/timetracker step.
- `EmployeeType` / S4 import — a later story.
