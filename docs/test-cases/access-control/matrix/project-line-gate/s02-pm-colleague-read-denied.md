# AC-PG-01 · PM project gate — S2 denied as Colleague

**Trace:** §3.2 · AD-10 · facade-contract.md Phase 1 gate

## Scenario

**Given** Pete is authenticated and PM on Alice's project with no Reporting, PP, or Project-line audience in Phase 1.

**When** Pete requests Alice's section via `GET /users/<alice-id>/personal-contacts`.

**Then** Project withheld · facade-contract.md; response is leak-free `404` with the section absent.

**Preconditions:** [fixture](../../README.md#canonical-personas); Alice, Pete, and Dave share project membership; Frank reports to Dave.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Pete>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; section key absent; leak-free body
