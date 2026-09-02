# UM-SEED-13 · Each new `User` gets a `joined_company` `UserEvents` row in the same transaction

**Trace:** AD-11 (career events are written in the same transaction via `user-management`'s exported career-event boundary — mentorship / other contexts never write `UserEvents` directly) · [database-schema.md](../../../architecture/database-schema.md) §UserEvents (immutable-fact model; `type` includes `joined_company`; `source` `'system' | 'manual'`) and §Mentorship note ("`UserEvents` in the **same transaction**") · [seed README](README.md#seam-table) seam row "Import writer" (owns `User` + `DepartmentMembership` + `EmploymentStatus` + `joined_company` `UserEvents`) and "Malformed-row behavior" (the row's writes "commit together, or the row is skipped whole") · Epic 3 seam (Story 1.1 writes **only** `joined_company` — no `department_change` / `employment_type_change`; decision 9) · career-timeline `um-ct-01` (traces this scenario, not registration) · epics.md Story 1.1

## Scenario

**Given** the deployment order has completed through
`db:bootstrap:access-control`.

**When** Root imports a multi-row fixture (via either entrypoint).

**Then** for **every newly created `User`**:

- exactly one `user_events` row is written with `type = 'joined_company'`,
  `source = 'system'`, `eventDate = <that row's companyJoinDate>` (=
  `RegistrationDate`), `createdBy = <ACM-0 root id>`, `deletedAt IS NULL`.
- that event row is committed in the **same transaction** as the `User` insert
  (and the row's `DepartmentMembership` + `EmploymentStatus`) — **all commit
  together or none do.** If the event write is made to fail for one row, that
  row's `User`, `DepartmentMembership`, and `EmploymentStatus` are **also absent**
  after the import, and the row appears in `errors[]` / `skipped` — while every
  other row in the file still imports (per-row transaction boundary,
  `um-seed-09`).
- the import writes **no other `UserEvents` type** — no `department_change` for
  the first department assignment, no `employment_type_change`, nothing from the
  dismissed-status mapping (decision 9). Those belong to Epic 3 / later stories.
- a **re-import** does not emit a second `joined_company` row for an existing
  user (`um-seed-08`); an `updated` row keeps its single original event.
- the event is never written through an HTTP create — there is no `POST /users`
  (`um-seed-02`); it is a byproduct of the import writer only.

**Preconditions:** [fixture](../README.md#canonical-personas); fresh DB through
bootstrap; Root holds the `hr-admin` FR grant chain; a ≥3-row well-formed fixture
is the upload; a fault-injection hook can force the `joined_company` insert to
fail for a single named row (stage-2 mechanism).

## Test

- **Test 1 — clean import**
  - **stateChange:** Root imports the ≥3-row fixture.
  - **expectedResult (database state):**
    - `SELECT "userId", count(*) FROM user_events WHERE type = 'joined_company' GROUP BY 1` returns exactly one row per newly created `User`, count `1` each.
    - every such row: `source = 'system'`, `eventDate = companyJoinDate` of the same user, `createdBy = <ACM-0 root id>`, `deletedAt IS NULL`.
    - `SELECT DISTINCT type FROM user_events WHERE "createdBy" = <ACM-0 root id> AND "createdAt" >= <import start>` returns only `joined_company`.
- **Test 2 — event write fails for one row (atomicity)**
  - **stateChange:** import the same fixture with the `joined_company` insert forced to fail for exactly one row (say `ok2@x.example`).
  - **expectedResult:** the summary reports that row in `errors[]` and `skipped`;
    after the import there is **no** `users`, `department_membership`,
    `employment_status`, or `user_events` row for `ok2@x.example`; every other
    row of the fixture imported normally with its `joined_company` event.
