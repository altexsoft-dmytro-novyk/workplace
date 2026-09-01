# UM-REL-03 · Second reports-to POST without DELETE returns 409

**Trace:** epics.md Story 4.1 (Change an Employee's Manager) · PRD FR-10 · [DEC-UM-005](../../../architecture/user-management-test-decisions.md) · AD-11

## Scenario

**Given** Alice already has an active reports-to edge to Bob.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'direct', targetId: <paulaId> }` **without** first revoking the existing edge.

**Then** the response is `409` — reports-to is a tree, not a graph. Reassignment requires explicit DELETE then POST.

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
