# AC-PG-04 · Reports-to manager of DM gets no Project reach

**Trace:** §3.2 · AD-10 · facade-contract.md Phase 1 gate

## Scenario

**Given** Frank is authenticated and Frank reports to Dave (DM) but holds no project-management relation to Alice's project.

**When** Frank requests Alice's section via `GET /users/<alice-id>/risks`.

**Then** No cross-kind inheritance · facade-contract.md; response is leak-free `404` with the section absent.

**Preconditions:** [fixture](../../README.md#canonical-personas); Alice, Pete, and Dave share project membership; Frank reports to Dave.

## Test

- **inputURL:** `GET /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Frank>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; section key absent; leak-free body
