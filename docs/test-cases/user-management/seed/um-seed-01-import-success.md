# UM-SEED-01 · Population import creates one canonical `User` row per seeded employee

**Trace:** PRD FR-1, FR-4, FR-5a, FR-7 · requirements §4.17 · [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) (canonical at write) · [DEC-UM-003](../../../architecture/user-management-test-decisions.md#dec-um-003--customfields-at-seedimport-b-05--a-03--reframed-v15--no-post-users) (`customFields` DB default) · AD-11 (same-transaction system event) · epics.md Story 1.1

## Scenario

**Given** a freshly migrated, empty database on which `npm run db:seed` (ACM-0)
and `npm run db:bootstrap:access-control` (ACM-1) have already run, so exactly
one active root `User` and its `hr-admin` FR attachment exist.

**When** the population import runs against the delivered seeded timetracker list
(§4.17) — a pseudonymised fixture list, never real employee data (NFR-1).

**Then** one `User` row exists per seeded employee, each with its S1 identity-card
fields populated from the list (`firstName`, `lastName`, `position`, `country`,
`city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`,
`photo`, `ttId`); `workEmail` is **stored trimmed and lowercased** (DEC-UM-007 —
the writer stores the normalized value, not the raw list value); `workEmail` is
unique across imported rows and `ttId` is unique across the rows that carry one;
each imported row's `customFields` persists as `{}` (DB default, writer omits it —
DEC-UM-003); and each imported row has exactly one system `UserEvents` row with
`type: "joined_company"`, `source: "system"`, `eventDate` equal to that row's
`companyJoinDate`, written in the **same transaction** as the row insert (AD-11 /
Epic 3 pattern) — never via an HTTP create.

**Preconditions:** [fixture](../README.md#canonical-personas); fresh DB; `db:deploy` → `db:seed` → `db:bootstrap:access-control` completed; the seeded timetracker list is the only import source.

## Test

Story 1.1's writer has no HTTP surface — assertions are against database row-level
state after the import completes (stage 2 runs the import script's production
entrypoint against migrated PostgreSQL).

- **stateChange:** the population import runs to completion against the seeded list.
- **expectedResult (database state):**
  - `users` contains one row per seeded-list employee (plus the pre-existing ACM-0 root row).
  - every imported row's stored `workEmail` equals `trim(lowercase(source workEmail))`; no stored value carries outer whitespace or uppercase.
  - `SELECT workEmail, count(*) ... GROUP BY workEmail HAVING count(*) > 1` returns zero rows; same for non-null `ttId`.
  - every imported row has `customFields = {}`.
  - `user_events` contains exactly one `{ type: "joined_company", source: "system" }` row per imported `User`, `eventDate = companyJoinDate`, in the same committed transaction as the insert (asserted by both existing when the import completes and neither existing if the import is made to fail mid-row).
