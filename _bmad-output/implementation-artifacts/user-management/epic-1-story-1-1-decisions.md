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

- **`Department` is created during import if one with the same `externalId`
  (CSV `DepartmentId`) does not exist yet.** `Department { id uuidv7 PK, name,
  externalId (unique), parentId uuid? }`. Departments nest via `parentId`
  (`project-requirements.md:516`); the CSV has no parent column, so `parentId`
  is `null` on import — hierarchy is assigned later.
- Membership: **`DepartmentMembership { id, userId, departmentId, validFrom
  date }`** — "every employee belongs to exactly one current department"
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
