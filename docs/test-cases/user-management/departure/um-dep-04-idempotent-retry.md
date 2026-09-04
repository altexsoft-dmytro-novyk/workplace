# UM-DEP-04 · Retrying a partially-failed departure is idempotent

**Trace:** PRD FR-6 · requirements §4.16 · epics.md Story 5.2 (second AC) ·
api-conventions.md `POST /users/:id/departures/:departureId/retry` (AD-20) ·
[database-schema.md](../../../architecture/database-schema.md) §Departure
(state machine, `leaseToken` fencing, `attempts` / `nextAttemptAt` capped
backoff, "no terminal abandoned state") ·
ARCHITECTURE-RATIFICATION 2026-09-02 (**CC-06 design approved**; PM/AD-23) ·
[DEC-UM-010](../../../architecture/user-management-test-decisions.md) (one worker; `@concurrency` = parallel HTTP in one test)

> **SPLIT-GATE — reconciled 2026-09-03 (AD-1 Stage 1).** The *"BLOCKED — CC-06;
> scenario prose only"* box is **removed**. Claim/fencing, the `retry_wait`
> state, the capped-backoff retry, and the `POST …/retry` endpoint are
> **CC-06 design approved** and **first-class stage-2** here.
>
> **LIVE clauses:** no duplicate `dismissed` transition, no duplicate
> account-deactivate, no duplicate `AccessJournal` (access-revoke) row.
> **DEFERRED `it.todo` clauses:** "no Action Item cancelled twice" / "no
> mentorship pair closed twice" — the participant contexts are unbuilt
> (`PM/AD-23`). Each `it.todo` is titled with its unblock trigger.

## Scenario-stage decisions (for the human gate)

- **Failure → `retry_wait`, never a terminal state.** A failed or
  uncertain-commit apply rolls the whole `prisma.$transaction` back and moves
  the row `processing → retry_wait` with `attempts++`, `lastError` sanitised,
  and `nextAttemptAt` = capped exponential backoff. There is **no `abandoned`
  state** (`database-schema.md` §Departure).
- **The `leaseToken` is the fence.** Every `apply` / `fail` / `reclaim` write
  is `… WHERE id = :id AND leaseToken = :myToken`; a stale executor matches 0
  rows, reports ownership-lost, and writes **no** retry state
  (`um-dep-08`).
- **Every local effect is predicated on `Departure.id` / a `unique` /
  a state guard** so a resume after partial or uncertain failure cannot
  duplicate it:
  - `dismissed` — `EmploymentStatus.sourceDepartureId` is a `unique` FK to
    `Departure`; the insert is a no-op on retry;
  - account-deactivate — `UPDATE … SET isActive = false WHERE id = :userId AND
    isActive = true` (or unconditional, since idempotent);
  - access-revoke journal — `AccessJournal.idempotencyKey` derived from
    `departure.id` (+ the grant id) → the second write conflicts and is skipped;
  - `applied` mark — the state guard (`WHERE state IN ('processing','retry_wait')`).
- **`retry` endpoint auth** — `employee:departure:record` (no-target
  `isAllowed`), per `api-conventions.md`; no distinct retry permission
  (`um-dep-03` decision 5).
- **`POST …/retry` makes the row eligible without bypassing claim/fencing** —
  it clears `nextAttemptAt` (or sets it to `now()`) so the next worker tick
  claims it; it does **not** itself run the apply transaction.

## Scenario

**Given** Alice's departure apply partially completed then failed or timed out
— some local effects applied, the row is in `retry_wait` with `attempts >= 1`
and `nextAttemptAt` in the past (the E2E fixture seeds this state directly and
back-dates `nextAttemptAt`).

**When** the worker resumes (`DepartureWorkerService.processDueDepartures()` is
invoked) **or** an actor holding `employee:departure:record` calls
`POST /users/<aliceId>/departures/<departureId>/retry`.

**Then** processing completes the remaining local effects and the overall
local outcome is **idempotent**: no duplicate `dismissed` row, no duplicate
account-deactivate, no duplicate `AccessJournal` row. `processing`, `applied`,
and `scheduled` reject `POST …/retry` with `409`; only `retry_wait` is
accepted, returning `202`.

**Preconditions:** [fixture](../README.md#canonical-personas); a `Departure`
row in `retry_wait` with a known set of already-applied and not-yet-applied
local effects; `DEPARTURE_WORKER_ENABLED=false`; one worker (DEC-UM-010).

## Test

- **Test 1 — retry a `retry_wait` departure via the endpoint (LIVE)**
  - **inputURL:** `POST /users/<aliceId>/departures/<departureId>/retry`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `202`. Then `DepartureWorkerService.processDueDepartures()`
    is invoked; on completion the row is `applied` and each LIVE effect from
    `um-dep-03` is present **exactly once** — one `dismissed` row
    (`sourceDepartureId = <departureId>`), `isActive === false`, the
    access-revoke journal set unchanged (zero or one row, not doubled).
- **Test 2 — retry a non-retryable state (LIVE)**
  - **inputURL:** same, when the row is `applied`
  - **expectedResult:** `409`; no additional effect; `appliedAt` unchanged.
  - Repeat for `state = 'processing'` → `409`; for `state = 'scheduled'` →
    `409` (retry accelerates only `retry_wait`).
- **Test 3 — `@concurrency`: two `POST …/retry` in parallel (LIVE)**
  - Two parallel `POST /users/<aliceId>/departures/<departureId>/retry` while
    the row is `retry_wait`.
  - **expectedResult:** the row is applied **exactly once**; the final LIVE
    effect set is applied exactly once (one `dismissed`, one deactivate, the
    journal set not doubled). Both calls return `202`, or one `202` and one
    `409` on the state transition — never a double apply.
- **Test 4 — worker resume without the endpoint (LIVE)**
  - **stateChange:** the row is `retry_wait`, `nextAttemptAt` back-dated; the
    worker method is invoked.
  - **expectedResult:** the row reaches `applied`; the LIVE effect set is
    applied exactly once.
- **`it.todo` — DEFERRED: the Action Items context implements `applyDepartureEffects`**
  - When `action-items` exists: a resume after partial failure cancels **no**
    Action Item twice — the cancellation is predicated on `Departure.id` and the
    item's open state; items assigned to Alice end at `cancelled — departed`
    once, items she authored for active assignees stay open (PM/AD-5).
- **`it.todo` — DEFERRED: the Mentorship context implements `applyDepartureEffects`**
  - When `mentorship` (`MentorshipPair`, AD-17) exists: a resume closes **no**
    mentorship pair twice — the `status='active'` UPDATE predicate is the
    idempotency key; a retry updates 0 rows and emits no second
    `mentorship_end` event or closure note.
