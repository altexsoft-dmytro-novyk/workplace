# UM-SEED-03 · Bootstrap HR Admin present; import reuses the ACM-0 root id

**Trace:** ACM-0 (`services/backend/prisma/seed.ts`, `npm run db:seed`) · ACM-1 (`npm run db:bootstrap:access-control`) · [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) · [DEC-UM-009](../../../architecture/user-management-test-decisions.md#dec-um-009--rehire-identity-oq4--kept-reframed-to-the-seedimport-writer) · PRD FR-1 · AD-12 · epics.md Story 1.1

## Scenario

**Given** deployment order `db:deploy` → `db:seed` → `db:bootstrap:access-control`
has completed: ACM-0 created exactly one active root `User` whose stored
`workEmail` is the normalized `ROOT_WORK_EMAIL`, and ACM-1 attached the single
seeded `hr-admin` FR policy (permissions `user-management:create` /
`:deactivate` / `:list`) to that one row.

**When** Story 1.1's population import runs against `docs/Accounts_template.csv`,
and a CSV row's `Email` **normalizes to the same value as the root's stored
`workEmail`** (i.e. the CSV's `Email` matches `ROOT_WORK_EMAIL` after trim +
lowercase — note the file's own sample row `dmytro.novyk+boot@altexsoft.com` is a
normal employee row and does **not** by itself imply this; the match is on
`ROOT_WORK_EMAIL`).

**Then** the import **reuses the existing ACM-0 root `User` id** for that row —
it **updates** the existing root row rather than inserting a second `users` row
for a normalized email that already exists (active or inactive) (DEC-UM-009). The
exact-one match is reliable because DEC-UM-007 makes both the stored root value
and the import writer's value canonical. After import there is still exactly one
`User` holding the `hr-admin` FR attachment, and it is the ACM-0 root id.

> **Not duplicated here.** That the bootstrap HR Admin is an *ordinary* user whose
> power is an explicitly seeded, delegable, revocable FR policy — no superuser
> derived from data shape — is Access Control's
> [`ac-fc-03`](../../access-control/fail-closed/ac-fc-03-bootstrap-admin-revocable.md).
> This scenario asserts only the seed/import side: the row and its single
> attachment exist, and the import does not fork the root into a second row.

**Preconditions:** [fixture](../README.md#canonical-personas); ACM-0 + ACM-1 completed; the seeded import list contains a row that normalizes to `ROOT_WORK_EMAIL`.

## Test

No HTTP surface — assertions are database row-level state after import.

- **stateChange:** population import runs against a CSV that contains a row whose `Email` normalizes to `ROOT_WORK_EMAIL`.
- **expectedResult (database state):**
  - `SELECT count(*) FROM users WHERE lower(trim("workEmail")) = <normalized ROOT_WORK_EMAIL>` returns `1`.
  - that row's `id`, `createdAt`, `createdBy` are unchanged from what ACM-0 created (the row was updated in place, not replaced).
  - exactly one `user_policies` row attaches an `hr-admin` `type='FR'` policy, and its `userId` is that same root id.
  - the import created no `joined_company` event that would double-count the root person against `um-seed-01`'s "one per imported row" (the root row was not inserted by the import).
