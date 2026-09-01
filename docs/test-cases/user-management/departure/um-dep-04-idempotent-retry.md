# UM-DEP-04 · Retrying a partially-failed departure is idempotent

**Trace:** PRD FR-6 · epics.md Story 5.2 (second AC) · api-conventions.md `POST /users/:id/departures/:departureId/retry` (AD-20) · [DEC-UM-010](../../../architecture/user-management-test-decisions.md)

> **BLOCKED — CC-06; scenario prose only.** Claim/fencing, the `retry_wait`
> state, and the idempotency key semantics are the CC-06 contract. Not
> translatable to stage-2 or production until CC-06 is approved.

## Scenario

**Given** Alice's departure application partially completed then failed or timed
out — some effects applied, the row is in `retry_wait`.

**When** the executor resumes (or an authorized actor calls
`POST /users/<aliceId>/departures/<departureId>/retry`).

**Then** processing completes the remaining effects and the overall outcome is
**idempotent**: no duplicate `dismissed` transition, no action item cancelled
twice, no mentorship pair closed twice, no duplicate journal or system-note
effect. `processing` or `applied` states reject a retry with `409`; only
`retry_wait` is accepted; the retry returns `202`.

**Preconditions:** [fixture](../README.md#canonical-personas); a departure row in `retry_wait` with a known set of already-applied and not-yet-applied effects; one worker (DEC-UM-010).

## Test

- **Test 1 — retry a `retry_wait` departure**
  - **inputURL:** `POST /users/<aliceId>/departures/<departureId>/retry`
  - **expectedResult:** `202`; on completion, each effect from `um-dep-03` is present exactly once.
- **Test 2 — retry a non-retryable state**
  - **inputURL:** same, when the row is `applied`
  - **expectedResult:** `409`; no additional effect.
- **Test 3 — `@concurrency`: two retries in parallel** → exactly one proceeds; the final effect set is applied exactly once.
