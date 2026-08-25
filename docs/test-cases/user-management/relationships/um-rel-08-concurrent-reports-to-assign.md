# UM-REL-08 · Concurrent reports-to assign resolves to one edge

**Trace:** epics.md Story 4.1 · AD-11 · [DEC-UM-010](../../../architecture/user-management-test-decisions.md)

**Tag:** `@concurrency`

## Scenario

**Given** Alice has no active reports-to edge.

**When** two concurrent `POST /users/<aliceId>/relationships` requests assign different managers in parallel inside one isolated test.

**Then** exactly one edge succeeds and the other receives `409` (or equivalent conflict), leaving a single active direct edge.

**Preconditions:** [fixture](../README.md#canonical-personas); run with parallel HTTP (`Promise.all`) inside one test; one Playwright worker (DEC-UM-010).

## Test

- **inputURL:** `POST /users/<aliceId>/relationships` (two parallel requests)
- **inputRequest:** two bodies targeting different `targetId` values with `type: "direct"`.
- **expectedResult:** One `201`, one `409`; final state has exactly one active direct edge for Alice.
