# UM-REL-02 · HR Admin revokes reports-to (hard delete)

**Trace:** epics.md Story 4.1 · FR-15 · AD-11

## Scenario

**Given** Alice has an active reports-to edge to Bob (`um-rel-01`).

**When** Root submits `DELETE /users/<aliceId>/relationships/<relationshipId>`.

**Then** the response is `200`, the row is hard-deleted, and Alice has no manager on a subsequent read.

**Preconditions:** [fixture](../README.md#canonical-personas); active direct edge from Alice to Bob created via `um-rel-01`, whose response `id` is `<relationshipId>` here.

## Test

- **inputURL:** `DELETE /users/<aliceId>/relationships/<relationshipId>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; subsequent read shows Alice with no active `direct` edge.
