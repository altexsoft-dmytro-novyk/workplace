# UM-DEP-07 · Request-time cutoff holds even when the worker has not run

**Trace:** PRD FR-6 · requirements §4.16 ·
[access-control.md](../../../architecture/access-control.md) §"Effective-departure cutoff (AD-20)"
("*Worker failure can delay materialized cleanup but can never restore access*") ·
[database-schema.md](../../../architecture/database-schema.md) §Departure ·
epics.md Story 5.2 · cross-ref `auth/um-auth-06` ·
ARCHITECTURE-RATIFICATION 2026-09-02 (CC-06 design approved)

> **NEW — reconciled 2026-09-03 (AD-1 Stage 1). LIVE stage-2.** Proves the
> request-time cutoff is **`dueAt`-vs-PostgreSQL-time**, not worker-state
> dependent. Uses only Story 5.1's `Departure` row + the session-resolver
> extension (`um-dep-03` decision 3); does **not** need the apply transaction
> or any cross-context participant.

## Scenario

**Given** Alice has a `scheduled` `Departure` whose `dueAt` is now in the past
(the E2E fixture back-dates `dueAt`), **and the worker has not run** — the row
is still `state: 'scheduled'`, `appliedAt` is null, her `EmploymentStatus` is
still `active`, and `User.isActive` is still `true`.

**When** Alice (or anyone using her session) makes an authenticated request
at/after `dueAt`.

**Then** the session resolver / `SessionGuard` denies the request **before any
feature or audience resolution**, by comparing the stored `dueAt` with
PostgreSQL `now()` — independent of the worker. Worker lag can delay the
materialised `dismissed` / `isActive` cleanup but can **never** leave a usable
session for a due person.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has a
`scheduled` `Departure`, `dueAt` back-dated to the past; the worker has **not**
processed it (`DEPARTURE_WORKER_ENABLED=false`, worker method never invoked in
this test); Alice still has a valid pre-cutoff session token.

## Test

- **Test 1 — a request Alice could previously make → denied immediately**
  - **inputURL:** any authenticated endpoint Alice was entitled to before the
    cutoff (e.g. `GET /users/<aliceId>`).
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }`
  - **expectedResult:** `401` — no usable session (matching `um-auth-06`); the
    response is indistinguishable from an ordinary auth failure (no leak of
    departure state). Denied before feature/audience resolution.
- **Test 2 — the row is still `scheduled` and employment still `active`**
  - **expectedResult:** stage 2 asserts, directly against the DB, that the
    `Departure` row is still `state: 'scheduled'`, `appliedAt` null, Alice's
    current `EmploymentStatus` is still `active`, and `User.isActive` is still
    `true` — i.e. the denial in Test 1 came purely from the `dueAt`-vs-`now()`
    comparison, not from materialised state.
- **Test 3 — just before `dueAt` the session still works**
  - **Given** a sibling fixture where `dueAt` is a few seconds in the **future**.
  - **expectedResult:** the same request → `200`. The cutoff is the stored
    `dueAt` instant, resolved once at creation from `00:00` in
    `effectiveTimeZone`.
- **Test 4 — health signal reflects the un-processed due row**
  - **expectedResult:** `GET /health/departures` → `oldestDueLagSeconds > 0`
    (the back-dated row is due and unprocessed) while the request-time cutoff is
    already denying Alice; `requestTimeCutoffDenialsTotal` increments on each
    denied request.
