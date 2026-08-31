# ACM1R-FB-19 · Identity is revalidated before any write and again before commit

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "Lock-and-revalidate of singleton, User, and attachment before writes **and again before commit**".
- SPEC Constraints — "ACM-1 locks and revalidates the root User and seed-owned attachment inside its transaction before writes and before commit."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "ACM-1 begins one database transaction, locks the common bootstrap serialization point, candidate User, bootstrap record, and recorded `hr-admin` attachment, and revalidates normalization, exact-one active eligibility, and attachment identity **before any bootstrap write and again before commit**."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — same requirement, stated as the seed contract.

## Scenario

**Given** a migrated database with the CAP-8 root User active and no bootstrap
state, and a concurrent session that deactivates the root User —
`UPDATE "users" SET "isActive" = false` — after the bootstrap has passed its
first eligibility check but before it commits.

**When** `npm run db:bootstrap:access-control` runs and reaches its
pre-commit revalidation.

**Then** the pre-commit check observes that exact-one **active** eligibility no
longer holds, and the transaction rolls back rather than committing. The
database ends with no permission, no policy, no grant, no attachment, and no
singleton — the bootstrap does not attach a functional role to a User who was
deactivated while it worked.

Two checks are required, not one, and they fail differently. The **first**
check, before any write, is what makes a doomed run cheap and keeps the failure
diagnostic precise. The **second**, before commit, is the one that is actually
load-bearing for correctness: without it, everything between the first check and
commit is a window in which the root identity can change underneath a
transaction that is about to grant it three permissions. Locking the candidate
User row is what makes the second check meaningful — an unlocked re-read can be
invalidated again before commit lands.

Whether the concurrent update blocks on the row lock or succeeds before the
bootstrap takes it, the required outcome is identical: the bootstrap either
holds the lock and the writer waits — in which case the pre-commit read still
sees an active root and the run commits legitimately — or the writer got there
first and the pre-commit check fails the run. What must never happen is a commit
whose own final read would have seen an ineligible root.

**Preconditions:** migrated database; CAP-8 root User active; all
bootstrap-owned tables empty; a concurrent session able to deactivate the root
User inside the bootstrap's transaction window.

## Test — deactivation inside the transaction window rolls the run back

- **entrypoint:** `npm run db:bootstrap:access-control`, with the concurrent
  `UPDATE` landing after the first eligibility check
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "users" WHERE "workEmail" = 'root@company.com' AND "isActive"; -- 1
  SELECT count(*) FROM "AccessControlBootstrap"; -- 0
  SELECT count(*) FROM "UserPolicies";           -- 0
  ```
- **expectedDatabaseState:** the run exits nonzero with a diagnostic naming the
  root identity as no longer eligible, and afterwards
  ```sql
  SELECT count(*) FROM "Permissions";            -- 0
  SELECT count(*) FROM "Policies";               -- 0
  SELECT count(*) FROM "PolicyPermissions";      -- 0
  SELECT count(*) FROM "UserPolicies";           -- 0
  SELECT count(*) FROM "AccessControlBootstrap"; -- 0
  ```
  — no partial bootstrap set survives the rollback
