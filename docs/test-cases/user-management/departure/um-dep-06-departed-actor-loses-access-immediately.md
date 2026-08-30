# UM-DEP-06 · A departed actor loses derived access immediately, before the executor runs

**Trace:** spine AD-17 ("authorization checks treat an actor... as departed once `Departure.effectiveDate <= now()`, independent of whether `appliedAt` has landed yet")

## Scenario

**Given** Bob is Alice's direct manager, and a `Departure` row for Bob exists with `effectiveDate` already in the past but `appliedAt` still `null` (the executor has not run yet).

**When** Bob attempts `GET /users/<aliceId>/events` (an access his direct-manager Reporting-line audience would otherwise grant).

**Then** the request is denied — `AccessControlService.isDeparted` reads `Departure.effectiveDate <= now()` live, independent of `appliedAt` — proving the access loss does not wait for the executor's sweep. `SessionAuthGuard` already checks a due actor globally (AC-AD-14), before any controller/audience resolution runs, so the denial is `403`, not `404`: Bob's token is otherwise valid, this is `isDeparted` rejecting him at the guard, not a leak-safe "no such resource" response.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice reports to Bob; Bob has an unapplied, past-effective-date `Departure` row.

## Test

- **inputURL:** `GET /users/<aliceId>/events`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
- **expectedResult:** `403`.
