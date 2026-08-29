# AC-AD-08 · Broken reports-to edge stops walk

**Trace:** AD-11 · facade-contract.md (Broken reports-to edge)

## Scenario

**Given** Alice's `reportsToUserId` points at a **deleted or missing** user (orphan edge).

**When** Carol (above the break) attempts to read Alice's employment via Reporting line recursion.

**Then** the walk stops at the orphan — neither the broken endpoint nor ancestors through it grant access (fail-closed).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice's direct manager edge is broken (deleted endpoint user).

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Carol>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; employment absent — transitive Reporting line does not bridge the orphan
