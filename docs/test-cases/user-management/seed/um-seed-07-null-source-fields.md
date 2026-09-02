# UM-SEED-07 · Fields with no CSV source persist as `null`; `createdBy` is the ACM-0 root id

**Trace:** AD-13 (`ttId` timetracker external identity — carried from day one, but no source column in this file) · [decisions §5](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (`ttId` / `workPhone` / `photo` no source → `null`; `city` no source column → `null`; `createdBy` = the ACM-0 root `User` id) · [DEC-UM-003](../../../architecture/user-management-test-decisions.md#dec-um-003--customfields-at-seedimport-b-05--a-03--reframed-v15--no-post-users) (`customFields` = `{}` DB default, writer omits it) · [database-schema.md](../../../architecture/database-schema.md) §User (`ttId` unique, nullable — `null` ≠ `null`) · epics.md Story 1.1

## Scenario

**Given** the deployment order has completed through
`db:bootstrap:access-control`; the ACM-0 root `User` id is known.

**When** Root `POST`s `/users/import` with any well-formed multi-row fixture (the
delivered header has **no** `ttId`, `WorkPhone`, `City`, or `Photo` column).

**Then** on every imported row:

- `ttId IS NULL`, `workPhone IS NULL`, `city IS NULL`, `photo IS NULL` — assert
  these are SQL `NULL`, and (where the value surfaces through a projection) that
  the key is **absent**, never an empty string. The writer does not invent a
  placeholder.
- multiple imported rows all carrying `ttId IS NULL` **coexist** — the `ttId`
  unique index is not violated (`null` is not equal to `null`).
- `createdBy` = the ACM-0 root `User` id on every imported row (the import runs
  as the root operator — there is no per-row author in the CSV).
- `customFields = '{}'::jsonb` on every imported row (DB default; the writer omits
  the column — DEC-UM-003).
- `TimeZone`, `EmployeeType`, `PositionId`, `CountryCode` / `CountryId` /
  `CountryStateId` / `CountryStateName` are present in the file but **not stored**
  on any `User` column or in `customFields` (decisions §5).

**Preconditions:** [fixture](../README.md#canonical-personas); fresh DB through
bootstrap; Root holds the `hr-admin` FR grant chain; a ≥3-row well-formed fixture
is the upload (so the `ttId`-null coexistence assertion has multiple rows).

## Test

- **inputURL:** `POST /users/import`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<root-uuid>>", "content-type": "multipart/form-data" },
    "body": "<multipart; file part = a well-formed ≥3-row fixture (delivered header verbatim)>"
  }
  ```
- **expectedResult:** `200`; summary `errors: []`, `skipped: 0`.
- **expectedResult (database state):**
  - for every imported row: `ttId IS NULL`, `workPhone IS NULL`, `city IS NULL`,
    `photo IS NULL`, `customFields = '{}'::jsonb`, `createdBy = <ACM-0 root id>`.
  - `SELECT count(*) FROM users WHERE "ttId" IS NULL` ≥ the number of imported
    rows and the import did not error on `ttId` uniqueness.
  - no imported `User` column and no `customFields` key holds the CSV's
    `TimeZone`, `EmployeeType`, `PositionId`, or any `Country*` id/code value.
