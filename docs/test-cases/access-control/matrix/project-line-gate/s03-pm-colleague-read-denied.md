# AC-PG-02 · PM project gate — S3 denied as Colleague

**Trace:** §3.2 · AD-10 · facade-contract.md Phase 1 gate

## Scenario

**Given** Pete is authenticated and same Phase 1 withhold.

**When** Pete requests Alice's section via `GET /users/<alice-id>/emergency-contacts`.

**Then** Project withheld · facade-contract.md; response is leak-free `404` with the section absent.

**Preconditions:** [fixture](../../README.md#canonical-personas); Alice, Pete, and Dave share project membership; Frank reports to Dave.

## Test

- **inputURL:** `GET /users/<alice-id>/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Pete>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; section key absent; leak-free body
