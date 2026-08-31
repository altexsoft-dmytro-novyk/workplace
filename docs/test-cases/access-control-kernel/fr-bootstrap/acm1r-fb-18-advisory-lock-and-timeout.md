# ACM1R-FB-18 · The bootstrap serializes on a common advisory lock and fails atomically on timeout

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral rows "Common transaction advisory lock derived from `access-control:bootstrap:root-hr-admin`, and lock timeout failing atomically".
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "ACM-1 normalizes `ROOT_WORK_EMAIL`, begins one transaction, acquires the common bootstrap advisory lock, and locks/revalidates the `AccessControlBootstrap` `root-hr-admin` singleton, User, and recorded attachment."
- SPEC Constraints — "It first takes one common transaction advisory lock and uses the unique `AccessControlBootstrap` singleton as durable provenance, including when no attachment exists yet."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "The common serialization point is a transaction-scoped PostgreSQL advisory lock derived from `access-control:bootstrap:root-hr-admin`; it is acquired **before any bootstrap-state inspection** and covers first creation when no row exists. Lock timeout fails the transaction with actionable diagnostics."

## Scenario

**Given** a freshly migrated database with the CAP-8 root User present and no
bootstrap state at all — no singleton, no policy, no attachment — and a
separate session that has opened a transaction, taken the transaction-scoped
advisory lock derived from `access-control:bootstrap:root-hr-admin`, and is
holding it open.

**When** `npm run db:bootstrap:access-control` runs against that database with
a bounded lock timeout configured.

**Then** the bootstrap blocks on the advisory lock rather than proceeding, and
on timeout it fails with a nonzero exit and an actionable diagnostic naming the
bootstrap lock as the contended resource. Its transaction rolls back whole: the
database still holds no permission, no FR policy, no grant, no attachment, and
no singleton.

The **empty** starting state is the point of this contract. An implementation
that locks the singleton row would acquire nothing here, because no row exists
yet, and two concurrent first runs would race straight past each other. The
advisory lock is what covers first creation, and it must be taken before any
bootstrap-state inspection — including the read that discovers the state is
empty.

**Preconditions:** freshly migrated database; CAP-8 root User present and
active; all five bootstrap-owned tables empty; a concurrent session holding the
advisory lock for the duration of the run; a bounded lock timeout set so the
run terminates rather than hanging.

## Test — a held lock blocks first creation and times out cleanly

- **entrypoint:** `npm run db:bootstrap:access-control`, run while a second
  session holds the advisory lock
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Permissions";            -- 0
  SELECT count(*) FROM "Policies";               -- 0
  SELECT count(*) FROM "PolicyPermissions";      -- 0
  SELECT count(*) FROM "UserPolicies";           -- 0
  SELECT count(*) FROM "AccessControlBootstrap"; -- 0
  -- the holding session appears in pg_locks with locktype = 'advisory'
  ```
- **expectedDatabaseState:** the run exits nonzero with a diagnostic naming the
  bootstrap advisory lock, and every count above is still `0`; after the
  holding session commits or rolls back, a fresh run of the same command
  completes normally and produces the full canonical set
