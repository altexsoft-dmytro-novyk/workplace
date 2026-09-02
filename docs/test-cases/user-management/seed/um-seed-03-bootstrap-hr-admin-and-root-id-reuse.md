# UM-SEED-03 · A CSV row for the root person updates the ACM-0 root `User` in place

**Trace:** ACM-0 (`services/backend/prisma/seed.ts`, `npm run db:seed` — the single normalized active root `User`) · ACM-1 (`npm run db:bootstrap:access-control` — the `hr-admin` FR attachment) · [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) (canonical-at-write makes the normalized match reliable) · [DEC-UM-009](../../../architecture/user-management-test-decisions.md#dec-um-009--rehire-identity-oq4--kept-reframed-to-the-seedimport-writer) (no writer inserts a second row for an existing normalized email) · [seed README](README.md#column--user-field-mapping-resolved--per-the-2026-09-01-decisions) "Root-row reuse" · PRD FR-1 · AD-12 · epics.md Story 1.1

## Scenario

**Given** deployment order `db:deploy` → `db:seed` → `db:bootstrap:access-control`
has completed: ACM-0 created exactly one active root `User` whose stored
`workEmail` is the normalized `ROOT_WORK_EMAIL`, and ACM-1 attached the single
seeded `hr-admin` FR policy (`user-management:create` / `:deactivate` / `:list`)
to that one row.

**When** Story 1.1's population import runs (either entrypoint — `POST /users/import`
or the deploy script, `um-seed-12`) against a CSV that contains a row whose
`Email` **normalizes to `ROOT_WORK_EMAIL`** (equal after `trim()` +
`toLowerCase()`). *(The shipped `docs/Accounts_template.csv` sample row
`email+boot@provider.domain` is a normal employee row and does not by itself
imply this — the match is on `ROOT_WORK_EMAIL`.)*

**Then** the import **updates the existing ACM-0 root `User` in place** for that
row — same `id`, `createdAt`, `createdBy` — and never inserts a second `users`
row for a normalized email that already exists, active or inactive (DEC-UM-009).
The row counts in the summary as **`updated`**, never `created`. The
`hr-admin` FR attachment is **untouched**: the import neither detaches,
re-attaches, nor duplicates the `user_policies` row, and after import exactly one
`User` — the ACM-0 root id — holds the `hr-admin` policy.

> **Not duplicated here.** That the bootstrap HR Admin is an *ordinary* user
> whose power is an explicitly seeded, delegable, revocable FR policy — no
> superuser derived from data shape — is Access Control's
> [`ac-fc-03`](../../access-control/fail-closed/ac-fc-03-bootstrap-admin-revocable.md).
> This scenario asserts only the seed/import side: the root row and its single
> attachment survive the import unchanged, and the import does not fork the root
> into a second row.

**Preconditions:** [fixture](../README.md#canonical-personas); ACM-0 + ACM-1
completed; the import CSV contains exactly one row whose `Email` normalizes to
`ROOT_WORK_EMAIL` (with, say, an updated `PositionName` and `RegistrationDate`
differing from the seeded root values, so the in-place update is observable).

## Test

- **stateChange:** the population import runs against a CSV whose first data row
  normalizes to `ROOT_WORK_EMAIL` and carries a `PositionName` /
  `RegistrationDate` / `DepartmentId` that differ from the seeded root row.
- **expectedResult (summary):** the summary's `updated` count includes this row
  (`created` does not); `errors` is `[]` for it.
- **expectedResult (database state):**
  - `SELECT count(*) FROM users WHERE lower(trim("workEmail")) = <normalized ROOT_WORK_EMAIL>`
    returns `1`.
  - that row's `id`, `createdAt`, `createdBy` are byte-identical to what ACM-0
    wrote (updated in place, not replaced); `position` / `companyJoinDate` now
    reflect the CSV row (import-owned columns are refreshed — decision 12).
  - exactly one `user_policies` row attaches an `hr-admin` `type='FR'` policy and
    its `userId` is that same root id; the row's own `id` / `createdAt` are
    unchanged.
  - `user_events` contains **no** `joined_company` row attributable to this
    import for the root user (the root row was updated, not inserted — it does
    not double-count against `um-seed-01`'s "one per new user").
  - if the CSV row carried a new `DepartmentId`, the root user's single
    `department_membership` row is set/updated to it; no second membership row.
