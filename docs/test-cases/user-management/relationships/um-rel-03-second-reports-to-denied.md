# UM-REL-03 · Second reports-to POST without DELETE returns 409

**Trace:** epics.md Story 4.1 (Change an Employee's Manager) · PRD FR-10 · [DEC-UM-005](../../../architecture/user-management-test-decisions.md) · AD-11 · access-control.md §3.4 · PM/AD-29 `AccessJournal`

## Scenario

**Given** Alice already has an active reports-to edge to Bob.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'direct', targetId: <paulaId> }` **without** first revoking the existing edge.

**Then** the response is `409` — reports-to is a tree, not a graph; reassignment
requires explicit `DELETE` then `POST`. The `409` is raised by the DB partial
`UNIQUE` (`type='direct'`) inside the transaction, **not** an app-level pre-check
(DEC-UM-005). The whole transaction rolls back: the existing Alice→Bob edge is
unchanged **and no `AccessJournal` row is written** — the journal INSERT is part
of the same aborted transaction as the failed `Relationship` INSERT, so there is
no partial commit.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Bob direct edge exists.

## Test

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "type": "direct", "targetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `409`; Alice's existing edge to Bob remains unchanged.
- **stateChange:** none. Stage 2 asserts the `AccessJournal` row count for Alice as subject is unchanged from before the request (the rolled-back transaction wrote nothing).
