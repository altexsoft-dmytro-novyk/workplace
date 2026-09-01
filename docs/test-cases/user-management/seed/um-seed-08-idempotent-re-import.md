# UM-SEED-08 · Re-importing the same file is idempotent; only import-owned columns refresh

**Trace:** requirements §4.17 · [decisions §6](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (keyed by normalized `Email`; re-run upserts; `Department` deduped by `externalId`) · [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) (`trim` + `toLowerCase` at write, compare, lookup) · [DEC-UM-009](../../../architecture/user-management-test-decisions.md#dec-um-009--rehire-identity-oq4--kept-reframed-to-the-seedimport-writer) · [seed README](README.md#column--user-field-mapping-resolved--per-the-2026-09-01-decisions) in-scenario decision 12 (owned-fields-only refresh) · epics.md Story 1.1

## Scenario

**Given** the deployment order has completed through
`db:bootstrap:access-control`, and Root has already imported
[`seed-basic.csv`](README.md#fixture-convention) once (→ `{ created: 5,
departmentsCreated: 3 }`, per `um-seed-01`).

**When** Root `POST`s `/users/import` with **the exact same file a second time**,
with — between the two runs — a `photo`, a `customFields` key, and a `ttId` set
on one of the imported rows by an out-of-band write (representing a later
authorized edit / future TT sync).

**Then**:

- the second run's summary is
  `{ "created": 0, "updated": 5, "departmentsCreated": 0, "skipped": 0, "errors": [] }`.
- **no duplicate rows anywhere**: still 5 imported `User` rows, 3 `Department`
  rows, 5 `department_membership` rows, 5 `employment_status` rows, and **exactly
  one** `joined_company` `user_events` row per user (the event is not re-emitted
  on an update).
- matching is by **normalized `Email`**: row 4's `  Katherine@X.Example ` matches
  the already-stored `katherine@x.example` and counts as `updated`, not a new
  row.
- **owned-fields-only refresh (decision 12):** the re-import may rewrite
  `firstName`, `lastName`, `workEmail`, `birthDay` / `birthMonth`,
  `companyJoinDate`, `position`, `country`, plus the row's `EmploymentStatus` and
  its single `DepartmentMembership`. It **must not** touch the out-of-band
  `photo`, `customFields`, or `ttId` on the existing row — those survive the
  second import unchanged.
- a row that normalizes to `ROOT_WORK_EMAIL` (if present) is `updated` in place
  again, never forked (`um-seed-03`).

**Preconditions:** [fixture](../README.md#canonical-personas); DB has the result
of one prior `seed-basic.csv` import; Root holds the `hr-admin` FR grant chain;
between the runs one imported row has a non-null `photo`, a `customFields`
key `{ "note": "x" }`, and a non-null `ttId` set out of band.

## Test

- **Test 1 — baseline (state before the second run)**
  - **stateChange:** confirm 5 imported `User` rows, 3 `Department` rows, 5
    `joined_company` events; then set `photo` / `customFields.note` / `ttId` on
    one imported row out of band.
- **Test 2 — second import of the identical file**
  - **inputURL:** `POST /users/import`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>", "content-type": "multipart/form-data" },
      "body": "<multipart; file part = seed-basic.csv (byte-identical to the first run)>"
    }
    ```
  - **expectedResult:** `200`; body exactly
    `{ "created": 0, "updated": 5, "departmentsCreated": 0, "skipped": 0, "errors": [] }`.
- **Test 3 — observe post-state**
  - **expectedResult (database state):**
    - `SELECT count(*) FROM users WHERE "createdBy" = <ACM-0 root id>` unchanged
      from after run 1; `department` still 3 rows; `department_membership` still
      5 rows; `employment_status` still 5 rows.
    - `SELECT "userId", count(*) FROM user_events WHERE type='joined_company' GROUP BY 1 HAVING count(*) > 1`
      returns zero rows.
    - the out-of-band row still has its `photo`, `customFields.note = "x"`, and
      `ttId` — none cleared or overwritten by the re-import.
