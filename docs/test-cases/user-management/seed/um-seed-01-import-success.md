# UM-SEED-01 · Population import creates one canonical `User` row per seeded employee

**Trace:** PRD FR-1, FR-4, FR-5a, FR-7 · requirements §4.17 (the population is a delivered import, no employee-creation flow) · [decisions §5](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (column mapping) · [spec-1-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-1-1-import-seeded-population.md) I/O matrix "Import success" · [seed README](README.md#the-import-operator-endpoint-settled-in-scenario--confirm-at-approval) (`POST /users/import`, synchronous summary) · [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) (writer stores the normalized `workEmail`) · [DEC-UM-003](../../../architecture/user-management-test-decisions.md#dec-um-003--customfields-at-seedimport-b-05--a-03--reframed-v15--no-post-users) (`customFields` DB default) · AD-11 (system `joined_company` event in the row transaction — atomicity is `um-seed-13`) · epics.md Story 1.1

## Scenario

**Given** a freshly migrated database on which the binding deployment order has
run up to but not past the import: `npm run db:seed` created the single active
ACM-0 root `User` (stored `workEmail` = normalized `ROOT_WORK_EMAIL`) and
`npm run db:bootstrap:access-control` attached the one seeded `hr-admin` FR policy
(permissions `user-management:create` / `:deactivate` / `:list`) to that root row.
**Root** is the operator persona holding that grant chain.

**When** Root `POST`s `/users/import` with the pseudonymised fixture
[`seed-basic.csv`](README.md#fixture-convention) as the multipart `file` part — a
5-row semicolon-delimited file with the delivered header, verbatim (NFR-1: never
real employee data). None of its rows normalize to `ROOT_WORK_EMAIL`.

**Then** the response is `200` with the synchronous summary

```json
{ "created": 5, "updated": 0, "departmentsCreated": 3, "skipped": 0, "errors": [] }
```

and after the import commits, one `User` row exists per CSV data row, each with
the fields the [column → `User` field mapping](README.md#column--user-field-mapping-resolved--per-the-2026-09-01-decisions)
provides:

- `FirstName`→`firstName`, `LastName`→`lastName` verbatim;
- `Email`→`workEmail` — **the natural key** (the file carries no employee-id
  column) — stored **trimmed and lowercased** (DEC-UM-007: the writer stores the
  normalized value, not the raw CSV value), so row 4's `  Katherine@X.Example `
  persists as `katherine@x.example`;
- `RegistrationDate`→`companyJoinDate`, `PositionName`→`position` (free-text S1),
  `CountryName`→`country` verbatim;
- `Birthday`→`birthDay`/`birthMonth` (year dropped; `NULL`→both `null`) — the
  detail is `um-seed-06`;
- `isActive` is `true` on every imported row, dismissed employees included — the
  import never sets it from `IsDismissed` (decisions §4; detail in `um-seed-05`);
- `customFields` persists as `{}` (DB default, writer omits it — DEC-UM-003);
- `createdBy` = the ACM-0 root `User` id on every imported row (the import runs
  as the root operator);
- fields with **no source column** persist as `null`, asserted explicitly:
  `workPhone`, `city`, `photo`, `ttId` — detail in `um-seed-07`.

Each imported user gets exactly one `Department` membership — the CSV carries one
`DepartmentId` per row; the schema permits an employee to hold more than one
current membership, but this import never creates a second one (detail:
`um-seed-04`) — and each new `DepartmentId` one `Department` row; exactly one
`EmploymentStatus` row (detail: `um-seed-05`); and exactly one system
`UserEvents` row `{ type: "joined_company", source: "system" }` with
`eventDate = companyJoinDate`, written in the same transaction as the row insert
(atomicity: `um-seed-13`) — never through an HTTP create (`um-seed-02`).

**Preconditions:** [fixture](../README.md#canonical-personas); fresh migrated DB;
`db:deploy` → `db:seed` → `db:bootstrap:access-control` completed and nothing
imported yet; Root holds the live `hr-admin` FR grant chain; `seed-basic.csv` is
the upload. Real-session cases use `Bearer <token:<root-uuid>>`.

## Test

- **inputURL:** `POST /users/import`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:<root-uuid>>",
      "content-type": "multipart/form-data"
    },
    "body": "<multipart form-data; one file part: file=seed-basic.csv (semicolon-delimited, delivered header verbatim, 5 data rows)>"
  }
  ```
- **expectedResult:** `200`. Body is exactly
  `{ "created": 5, "updated": 0, "departmentsCreated": 3, "skipped": 0, "errors": [] }`.
- **expectedResult (database state after the import commits):**
  - `users` gains 5 rows (plus the untouched pre-existing ACM-0 root row).
  - every new row's stored `workEmail` equals `trim(lower(<CSV Email>))`; no
    stored value carries outer whitespace or an uppercase character;
    `SELECT "workEmail", count(*) FROM users GROUP BY "workEmail" HAVING count(*) > 1`
    returns zero rows.
  - for every new row: `workPhone IS NULL`, `city IS NULL`, `photo IS NULL`,
    `ttId IS NULL`, `customFields = '{}'::jsonb`, `isActive = true`,
    `createdBy = <ACM-0 root id>`.
  - `firstName` / `lastName` / `position` / `country` / `companyJoinDate` hold
    the mapped CSV values verbatim.
  - `department` has 3 rows (`externalId` `"1"` / `"2"` / `"3"`, `name` `JS` /
    `QA` / `Infra`, `parentId IS NULL` on each); `department_membership` has 5
    rows, exactly one current row per new user.
  - `employment_status` has 5 rows, exactly one per new user.
  - `user_events` has exactly one `{ type: "joined_company", source: "system" }`
    row per new user with `eventDate = companyJoinDate`, `createdBy = <ACM-0 root
    id>`, `deletedAt IS NULL`.
  - the ACM-0 root row's `id` / `createdAt` / `createdBy` and its single
    `hr-admin` FR attachment are unchanged.
