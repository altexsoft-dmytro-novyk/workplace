# UM-SEED-01 · Population import creates one canonical `User` row per seeded employee

**Trace:** PRD FR-1, FR-4, FR-5a, FR-7 · requirements §4.17 · [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) (canonical at write) · [DEC-UM-003](../../../architecture/user-management-test-decisions.md#dec-um-003--customfields-at-seedimport-b-05--a-03--reframed-v15--no-post-users) (`customFields` DB default) · AD-11 (same-transaction system event) · epics.md Story 1.1

## Scenario

**Given** a freshly migrated, empty database on which `npm run db:seed` (ACM-0)
and `npm run db:bootstrap:access-control` (ACM-1) have already run, so exactly
one active root `User` and its `hr-admin` FR attachment exist.

**When** the population import runs against the delivered semicolon-delimited
timetracker export `docs/Accounts_template.csv` (§4.17) — a pseudonymised fixture
file, never real employee data (NFR-1).

**Then** one `User` row exists per CSV row, each with the fields the
[column → `User` field mapping](README.md#column---user-field-mapping) provides:
`FirstName`→`firstName`, `LastName`→`lastName`, `Email`→`workEmail` (**the natural
key** — no employee-id column in the file), `Birthday`→`birthDay`/`birthMonth`
(year dropped; `NULL`→both `null`), `RegistrationDate`→`companyJoinDate`,
`PositionName`→`position`, `CountryName`→`country`. Fields with **no source
column** come back `null`: **`workPhone`, `city`, `photo`, `ttId`** — assert this
explicitly rather than asserting they are populated. `workEmail` is **stored
trimmed and lowercased** (DEC-UM-007 — the writer stores the normalized value,
not the raw CSV value) and is unique across imported rows; each imported row's
`customFields` persists as `{}` (DB default, writer omits it — DEC-UM-003); and
each imported row has exactly one system `UserEvents` row with
`type: "joined_company"`, `source: "system"`, `eventDate` equal to that row's
`companyJoinDate`, written in the **same transaction** as the row insert (AD-11 /
Epic 3 pattern) — never via an HTTP create.

**OPEN (do not assert either way — see the mapping table):** `PositionId`
(positions dictionary?), `DepartmentName`/`DepartmentId` (Department edge
contract deferred), `CountryCode`/`CountryStateName`, `EmployeeType` (S4 — not on
the `User` row), `IsDismissed`/`DismissedDate` (employment status §4.16, not
`User.isActive` directly — interim `isActive=false` for a dismissed row until the
`EmploymentStatus` aggregate lands), `TimeZone` (not an S1 field).

**Preconditions:** [fixture](../README.md#canonical-personas); fresh DB; `db:deploy` → `db:seed` → `db:bootstrap:access-control` completed; `docs/Accounts_template.csv` is the only import source.

## Test

Story 1.1's writer has no HTTP surface — assertions are against database row-level
state after the import completes (stage 2 runs the import script's production
entrypoint against migrated PostgreSQL).

- **stateChange:** the population import runs to completion against `docs/Accounts_template.csv`.
- **expectedResult (database state):**
  - `users` contains one row per CSV data row (plus the pre-existing ACM-0 root row; minus any CSV row whose normalized `Email` equals the normalized `ROOT_WORK_EMAIL` — that one **updates** the root row, DEC-UM-009).
  - every imported row's stored `workEmail` equals `trim(lowercase(CSV Email))`; no stored value carries outer whitespace or uppercase.
  - `SELECT "workEmail", count(*) ... GROUP BY "workEmail" HAVING count(*) > 1` returns zero rows.
  - for every imported row: `workPhone IS NULL`, `city IS NULL`, `photo IS NULL`, `ttId IS NULL` (no source column in the CSV).
  - `birthDay` / `birthMonth` are both `NULL` for a row whose `Birthday` is `NULL`; for a dated `Birthday` they hold the day/month with **no year retained anywhere**.
  - every imported row has `customFields = {}`.
  - `user_events` contains exactly one `{ type: "joined_company", source: "system" }` row per imported `User`, `eventDate = companyJoinDate`, in the same committed transaction as the insert (asserted by both existing when the import completes and neither existing if the import is made to fail mid-row).
