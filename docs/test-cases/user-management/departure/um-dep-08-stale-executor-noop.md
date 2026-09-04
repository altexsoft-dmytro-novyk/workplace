# UM-DEP-08 · A stale executor no-ops; the current-token executor owns the row

**Trace:** PRD FR-6 · requirements §4.16 ·
[database-schema.md](../../../architecture/database-schema.md) §Departure
("*apply/fail/reclaim locks the row and predicates on that token, so an
expired/reclaimed worker cannot commit stale work*"; "*no terminal abandoned
state*") ·
[domain-driven-design.md](../../../architecture/domain-driven-design.md)
("*A stale executor returns ownership-lost/no-op and cannot update retry
state*") ·
[mentorship.md](../../../architecture/mentorship.md) §5.2 (stale executor token) ·
epics.md Story 5.2 · ARCHITECTURE-RATIFICATION 2026-09-02 (CC-06 design approved) ·
[DEC-UM-010](../../../architecture/user-management-test-decisions.md) (`@concurrency`)

> **NEW — reconciled 2026-09-03 (AD-1 Stage 1). LIVE stage-2.** Fencing-token
> behaviour is CC-06 design approved. This exercises the UM-owned worker's
> claim/lease/reclaim path only; no cross-context participant is involved.

## Scenario-stage decisions (for the human gate)

- **Lease claim.** A worker claims a due row with
  `SELECT … FOR UPDATE SKIP LOCKED` in `effectiveDate, id` order and sets a
  fresh `leaseToken` (uuid) + `leaseUntil = now() + <lease TTL>`, transitioning
  `scheduled → processing` (or re-claiming a `processing`/`retry_wait` row whose
  `leaseUntil < now()`).
- **Reclaim.** When a worker finds a `processing` row with `leaseUntil < now()`,
  it **reclaims** it: new `leaseToken`, new `leaseUntil`, `reclaimedLeaseCount++`
  (health signal). The prior executor's token is now stale.
- **Fence.** Every subsequent `apply` / `fail` / `mark-applied` write is
  `UPDATE "Departure" SET … WHERE id = :id AND leaseToken = :myToken`. The
  apply transaction's first statement re-locks the row `FOR UPDATE` and
  re-checks `leaseToken` before any effect. A stale executor's write matches
  **0 rows** → it returns ownership-lost, performs **no** effect, and writes
  **no** retry state (`attempts`, `lastError`, `nextAttemptAt` untouched).
- **No terminal abandoned state** — a lost lease is not a failure; the row
  stays claimable.

## Scenario

**Given** executor **A** claimed Alice's due `Departure` (`leaseToken = tokenA`,
`state = processing`) and then stalled past `leaseUntil`; executor **B** then
reclaimed the row (`leaseToken = tokenB`), and B is now applying it (or has
applied it).

**When** executor **A** wakes and attempts to apply / mark-applied / fail the
row using `tokenA`.

**Then** A's writes match 0 rows (`WHERE … leaseToken = tokenA`), A returns
ownership-lost and no-ops — no employment change, no account-deactivate, no
`AccessJournal` row, no `attempts`/`lastError` mutation. B — the current-token
executor — owns the row and its apply outcome stands exactly once.

**Preconditions:** [fixture](../README.md#canonical-personas); a `Departure`
row seeded `state = 'processing'`, `leaseToken = tokenA`, `leaseUntil` in the
past; the test simulates B's reclaim (set `leaseToken = tokenB`, fresh
`leaseUntil`) and then drives A's apply attempt with the stale `tokenA`;
`DEPARTURE_WORKER_ENABLED=false`.

## Test

- **Test 1 — stale-token apply attempt is a no-op**
  - **stateChange:** `leaseToken` is `tokenB` (B reclaimed); executor A's
    `applyDeparture(departureId, tokenA)` path is invoked.
  - **expectedResult:** A's transaction commits **no** effect — stage 2 asserts
    no `dismissed` row was written by A, `isActive` unchanged by A, zero
    `AccessJournal` rows from A; the `Departure` row's `attempts` / `lastError`
    / `nextAttemptAt` are unchanged; `state` is whatever B set it to.
- **Test 2 — the current-token executor applies exactly once**
  - **stateChange:** executor B's `applyDeparture(departureId, tokenB)` runs.
  - **expectedResult:** the row reaches `applied` with the full LIVE effect set
    from `um-dep-03` present exactly once; a subsequent stale-A retry still
    no-ops (Test 1).
- **Test 3 — `@concurrency`: A and B apply in parallel**
  - Parallel `applyDeparture(departureId, tokenA)` and
    `applyDeparture(departureId, tokenB)` (DEC-UM-010 — parallel calls in one
    test).
  - **expectedResult:** exactly one (B, the current token) commits; A no-ops on
    the fence; the LIVE effect set is applied exactly once; the row ends
    `applied`.
- **Test 4 — reclaim bumps the health counter**
  - **expectedResult:** after B reclaims A's expired lease,
    `GET /health/departures` → `reclaimedLeaseCount` incremented by 1;
    `processingCount` reflects the single in-flight lease, not two.
