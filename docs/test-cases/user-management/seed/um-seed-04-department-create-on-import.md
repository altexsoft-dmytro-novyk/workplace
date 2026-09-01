# UM-SEED-04 · Department create-on-import: one `Department` per `DepartmentId`, one membership per user

**Trace:** requirements §4.17 · [decisions §2 / §2b](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (Department created on import if `externalId` is new; `parentId` null; `DepartmentMembership`; **no** Unit-Manager assignment; **no** department-tree walk; the CSV carries **one** `DepartmentId` per row → **one** membership per person) · [database-schema.md](../../../architecture/database-schema.md) §Project/Department "Multi-department membership (2026-09-02)" (an employee belongs to **one or more** current departments; `UNIQUE (userId, departmentId) WHERE validTo IS NULL`; `User` carries no `departmentId`) · [seed README](README.md#seam-table) seam row "`Department` create-on-import" · epics.md Story 1.1

## Scenario

**Given** the deployment order has completed through
`db:bootstrap:access-control` and no `Department` rows exist yet.

**When** Root `POST`s `/users/import` with a fixture whose rows reference three
distinct `DepartmentId` values, one of them **repeated** across two rows and one
of those repeats carrying a **different `DepartmentName`** than its first
occurrence — e.g.:

| line | `Email` | `DepartmentId` | `DepartmentName` |
| --- | --- | --- | --- |
| 1 | `a@x.example` | `10` | `Platform` |
| 2 | `b@x.example` | `10` | `Platform Engineering` |
| 3 | `c@x.example` | `20` | `Design` |
| 4 | `d@x.example` | `30` | `Data` |

**Then**:

- **exactly one `Department` row per distinct `externalId`** — 3 rows
  (`"10"`, `"20"`, `"30"`), created on first sight. `externalId` is stored as a
  **string** (`"10"`), consistent with `ttId` being a string external id
  (decision 6).
- every created `Department` has `parentId IS NULL` — the CSV carries no parent
  column and Story 1.1 assigns no hierarchy (decisions §2).
- **`name` is first-write-wins**: `Department "10"` keeps `Platform` (line 1);
  line 2 **reuses** the row and does **not** rename it, and the divergence is
  **not** an `errors[]` entry (decision 7). Line 2's user still imports normally.
- **`departmentsCreated` counts only the new rows** → `3` for this fixture; a
  later re-import of the same file adds `0` (`um-seed-08`).
- each imported user gets **exactly one** `department_membership` row
  `{ id, userId, departmentId, validFrom, validTo? }` with `validFrom` = that
  row's `RegistrationDate` (decision 8 — the CSV has no separate membership date)
  and `validTo IS NULL` (current).
- **Multi-department is a schema capability, not an import behavior.** The schema
  now permits an employee to hold **more than one** current
  `department_membership` — `UNIQUE (userId, departmentId) WHERE validTo IS NULL`
  bounds it to one *current* row per (user, department) pair, not one per user
  (`database-schema.md` §Project/Department "Multi-department membership
  (2026-09-02)"; `project-requirements.md` §4.17 "one or more departments").
  Story 1.1's import still writes **exactly one** membership per imported person
  because the CSV carries **one** `DepartmentId` per row; it never creates a
  second membership from a duplicate row in the same file. Additional current
  memberships are added later — a subsequent import, a manual assignment screen,
  or the timetracker API — outside this story.
- **not written by this story:** any
  `Policies { type:'AR', targetType:'department', targetRole:'unit-manager' }`
  row (no source column); any `parentId`; any `department_change` `UserEvents`
  row (initial import writes only `joined_company` — decision 9).

**Preconditions:** [fixture](../README.md#canonical-personas); fresh DB through
bootstrap; no `Department` rows; Root holds the `hr-admin` FR grant chain; the
4-row department fixture above is the upload.

## Test

- **inputURL:** `POST /users/import`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<root-uuid>>", "content-type": "multipart/form-data" },
    "body": "<multipart; file part = the 4-row department fixture (delivered header verbatim)>"
  }
  ```
- **expectedResult:** `200`; summary `{ "created": 4, "updated": 0, "departmentsCreated": 3, "skipped": 0, "errors": [] }`.
- **expectedResult (database state):**
  - `department` has 3 rows; `SELECT "externalId" FROM department ORDER BY 1` → `"10"`, `"20"`, `"30"`; every row `parentId IS NULL`.
  - `department` row with `externalId = "10"` has `name = 'Platform'` (not `'Platform Engineering'`).
  - `department_membership` has 4 rows, exactly one **current** (`validTo IS NULL`) row per imported user; each row's `validFrom` equals its user's `companyJoinDate` and `validTo IS NULL`.
  - `SELECT "userId", count(*) FROM department_membership WHERE "validTo" IS NULL GROUP BY 1 HAVING count(*) > 1` returns zero rows — **for this import** (the CSV carries one `DepartmentId` per row); the schema's `UNIQUE (userId, departmentId) WHERE validTo IS NULL` would still permit a second current membership for a *different* department added by a later step.
  - no `policies` row with `targetType = 'department'`; no `user_events` row with `type = 'department_change'`.
