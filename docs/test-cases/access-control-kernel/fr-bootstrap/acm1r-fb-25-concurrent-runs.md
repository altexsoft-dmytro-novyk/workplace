# ACM1R-FB-25 · Concurrent runs converge on one bootstrap set, and conflicting runs fail atomically

> **Amended 2026-09-06 — PLAT-E4-S4.2a.** The canonical ACM-1 `hr-admin` set
> grew from three keys to **six**: the three original `user-management:*` keys
> plus `org:relationships:write`, `employee:departure:record`, and
> `profile:timeline:write` — the last a **known, deliberately accepted deviation
> from a NORMATIVE invariant** (AF-2, Dmytro Novyk, Product Owner, 2026-09-06).
> The full record, the live consumer of every key, and the dated AF-4 note that
> the ratified architecture text still says *"exactly three"* and contradicts
> this file, are in
> [`ACM1-FB-01`](./acm1-fb-01-three-canonical-permissions-seeded.md).
>
> **This file's numbers change:** the converged set `Permissions` `3` → **`6`** and `PolicyPermissions` `3` →
> **`6`**. The advisory lock, the serialization and the single-coherent-set
> outcome are unchanged.

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "Concurrent identical seeds converge to one bootstrap set with no partial state; conflicting execution fails atomically", named in `ACM-1-scenarios.invoke_dev_with` as "first-run/differing-root concurrency".
- SPEC Constraints — "Concurrent identical seeds must converge to one bootstrap set with no partial state; conflicting execution fails atomically with actionable diagnostics."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — the advisory lock "is acquired before any bootstrap-state inspection and covers first creation when no row exists".

## Scenario A — two identical first runs race

**Given** a freshly migrated database with the CAP-8 root User active and every
bootstrap-owned table empty.

**When** two `npm run db:bootstrap:access-control` processes start
concurrently against it with identical configuration.

**Then** both processes exit zero and the database converges to exactly **one**
bootstrap set: six permissions, one FR policy, six grants, one attachment,
one singleton. The advisory lock serializes them, so the second run observes the
first's committed state and takes its ordinary idempotent no-op path — the same
path `ACM1-FB-05` describes for a sequential rerun. No duplicate row, no
partial set, and no unique-violation crash surfaces to either caller.

The empty starting state is again what makes this contract meaningful: there is
no singleton row to lock, so only the advisory lock can serialize the two first
runs. Without it both would read "empty", both would insert, and one would die
on the partial FR unique index having already written permissions.

## Scenario B — two runs with different configured roots race

**Given** the same fresh state, and two concurrent processes configured with
**different** `ROOT_WORK_EMAIL` values, each matching exactly one distinct
active User.

**Then** the run that acquires the lock first completes normally and writes the
singleton for its root. The second, on acquiring the lock, revalidates against
the now-present singleton, finds the recorded `normalizedRootEmail` disagrees
with its own configuration, and **fails atomically** with the actionable
diagnostic of ACM1R-FB-23 — no transfer, no second root attachment, no partial
state. The database holds exactly one bootstrap set, belonging to whichever run
won the lock, and the loser's exit is nonzero.

Which process wins is not asserted; that a coherent single set exists, and that
the loser fails rather than corrupting it, is.

**Preconditions:** freshly migrated database; CAP-8 root User active (Scenario B
additionally requires a second distinct active User); all five bootstrap-owned
tables empty; both processes launched concurrently.

## Test — two concurrent runs, one coherent outcome

- **entrypoint:** two concurrent `npm run db:bootstrap:access-control`
  processes
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Permissions";            -- 0
  SELECT count(*) FROM "Policies";               -- 0
  SELECT count(*) FROM "PolicyPermissions";      -- 0
  SELECT count(*) FROM "UserPolicies";           -- 0
  SELECT count(*) FROM "AccessControlBootstrap"; -- 0
  ```
- **expectedDatabaseState:**
  - **A:** both exit zero;
    ```sql
    SELECT count(*) FROM "Permissions";            -- 6
    SELECT count(*) FROM "Policies" WHERE type='FR'; -- 1
    SELECT count(*) FROM "PolicyPermissions";      -- 6
    SELECT count(*) FROM "UserPolicies";           -- 1
    SELECT count(*) FROM "AccessControlBootstrap"; -- 1
    ```
  - **B:** exactly one process exits zero and one exits nonzero with the
    conflicting-drift diagnostic; the five counts above are identical to A, and
    the single `UserPolicies` row's `userId` equals the singleton's
    `rootUserId`
