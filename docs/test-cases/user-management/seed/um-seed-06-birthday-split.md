# UM-SEED-06 · `Birthday` splits to `birthDay` + `birthMonth`, year dropped; `NULL` → both null

**Trace:** requirements §3.2 (S1 content is literally "birthday (day and month)" — no year is ever captured or stored, for any audience) · [database-schema.md](../../../architecture/database-schema.md) §User (`birthDay` 1-31 / `birthMonth` 1-12 — "both null together or both set together") · [decisions §5](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (`Birthday` `NULL` → both `null`; a date → split day/month, drop year) · [DEC — incomplete birthday pair](../../../architecture/user-management-test-decisions.md) (a *deliberate* `NULL` is accepted; it is distinct from the rejected half-pair) · epics.md Story 1.1

## Scenario

**Given** the deployment order has completed through
`db:bootstrap:access-control`. The delivered file's date columns are ISO
`YYYY-MM-DD` (the shipped `Accounts_template.csv` `RegistrationDate` is
`2026-08-17`; its `Birthday` is `NULL`).

**When** Root `POST`s `/users/import` with a fixture holding one dated and one
`NULL` `Birthday`:

| line | `Email` | `Birthday` |
| --- | --- | --- |
| 1 | `dated@x.example` | `1990-12-10` |
| 2 | `unknown@x.example` | `NULL` |

**Then**:

- line 1 → `birthDay = 10`, `birthMonth = 12`. **The year `1990` is not stored
  anywhere** — not on `User`, not in `customFields`, not in any event payload.
  Never a half-pair (one set, one null).
- line 2 → `birthDay IS NULL` **and** `birthMonth IS NULL` — a deliberate `NULL`
  source is accepted as "unknown", **not** rejected. This is distinct from the
  incomplete-pair rejection (a row that supplies a day without a month, or a
  syntactically broken date — that path is `um-seed-09`, a skipped row with an
  `errors[]` entry).

**Preconditions:** [fixture](../README.md#canonical-personas); fresh DB through
bootstrap; Root holds the `hr-admin` FR grant chain; the 2-row birthday fixture
above is the upload.

## Test

- **inputURL:** `POST /users/import`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<root-uuid>>", "content-type": "multipart/form-data" },
    "body": "<multipart; file part = the 2-row birthday fixture (delivered header verbatim)>"
  }
  ```
- **expectedResult:** `200`; summary `{ "created": 2, "updated": 0, "departmentsCreated": <D>, "skipped": 0, "errors": [] }`.
- **expectedResult (database state):**
  - row `dated@x.example`: `birthDay = 10`, `birthMonth = 12`.
  - no column, `customFields` key, or `user_events.details` field on either row
    holds `1990` or any 4-digit year derived from `Birthday`.
  - row `unknown@x.example`: `birthDay IS NULL AND birthMonth IS NULL`.
  - `SELECT count(*) FROM users WHERE ("birthDay" IS NULL) <> ("birthMonth" IS NULL)`
    returns `0` (no half-pair among imported rows).
