# ACM1R-FB-27 · A failure part-way through leaves no partial bootstrap state

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "Atomic rollback on any conflicting drift or failure".
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Any conflicting drift, lock timeout, or failure rolls back the transaction."
- SPEC Constraints — "Concurrent identical seeds must converge to one bootstrap set with no partial state; conflicting execution fails atomically with actionable diagnostics."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "ACM-1 begins **one** database transaction"; "Missing, blank, unmatched, ambiguous, inactive, or drifted root identity fails clearly and atomically."

## Scenario

**Given** a freshly migrated database with the CAP-8 root User active and every
bootstrap-owned table empty, and an injected failure that fires **after** the
bootstrap has written some of its rows but **before** it commits — for example
after the three permissions are inserted and before the attachment is written.

**When** `npm run db:bootstrap:access-control` runs.

**Then** the process exits nonzero and the database is byte-identical to its
pre-run state: zero permissions, zero policies, zero grants, zero attachments,
zero singletons. Nothing the run wrote before the failure survives.

This is the contract that makes every other failure case in this suite
trustworthy. ACM1R-FB-18, FB-19, FB-23, FB-25B, and FB-26's F cases all assert
"nothing written" after a nonzero exit; each of those assertions rests on the
whole bootstrap being one transaction, and none of them proves it, because in
each of those cases the failure happens to be detected before the first write.
Here the failure is deliberately placed **after** writes have occurred, which is
the only arrangement that can distinguish a genuine single transaction from a
sequence of autocommitted statements that happened to fail early elsewhere.

A partial bootstrap is specifically dangerous rather than merely untidy: three
permissions and an FR policy with no grants and no attachment is a state in
which `isAllowed` returns `false` for a root who appears, to an operator
reading the tables, to have been provisioned.

**Preconditions:** freshly migrated database; CAP-8 root User present and
active; all five bootstrap-owned tables empty; a mid-transaction failure
injected after at least one bootstrap write and before commit.

## Test — an injected mid-transaction failure rolls everything back

- **entrypoint:** `npm run db:bootstrap:access-control` with the failure
  injected post-write, pre-commit
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Permissions";            -- 0
  SELECT count(*) FROM "Policies";               -- 0
  SELECT count(*) FROM "PolicyPermissions";      -- 0
  SELECT count(*) FROM "UserPolicies";           -- 0
  SELECT count(*) FROM "AccessControlBootstrap"; -- 0
  ```
- **expectedDatabaseState:** nonzero exit with a diagnostic, and every one of the
  five counts above is still `0`; a subsequent clean run of the same command
  then produces the complete canonical set, proving the rollback left no
  poisoned state behind
