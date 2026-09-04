# UM-REL-08 · Concurrent reports-to assign resolves to one edge

**Trace:** epics.md Story 4.1 (Change an Employee's Manager) · PRD FR-10 · AD-11 · access-control.md §3.4 · PM/AD-29 `AccessJournal` · [DEC-UM-010](../../../architecture/user-management-test-decisions.md)

**Tag:** `@concurrency`

## Scenario

**Given** Alice has no active reports-to edge.

**When** two concurrent `POST /users/<aliceId>/relationships` requests assign different managers in parallel inside one isolated test.

**Then** exactly one request commits — `201`, one `Relationship` row, **and
exactly one `AccessJournal` row** (`kind: 'manager'`, `before: null`, `after` =
the winning edge) written in that same transaction. The other request receives
`409` (the DB partial `UNIQUE` on `type='direct'` is the arbiter) and its
transaction rolls back whole, so it writes **no** `Relationship` row and **no**
`AccessJournal` row. Final state: a single active direct edge for Alice and
exactly one `manager` journal row for the assignment.

**Preconditions:** [fixture](../README.md#canonical-personas); run with parallel HTTP (`Promise.all`) inside one test; one Playwright worker (DEC-UM-010).

## Test

- **inputURL:** `POST /users/<aliceId>/relationships` (two parallel requests)
- **inputRequest:** two bodies targeting different `targetId` values with `type: "direct"`.
- **expectedResult:** one `201`, one `409`.
- **stateChange:** final state has exactly one active direct edge for Alice, and exactly one `AccessJournal` row with `subjectUserId: aliceId` and `kind: 'manager'` whose `after` snapshot matches the surviving edge.
