# AC-PG-03 · PM does not receive Project-line S5 subset in Phase 1

**Trace:** §3.2 · AD-10 · facade-contract.md Phase 1 gate

## Scenario

**Given** Pete is authenticated and PM shares project with Alice but Project line is withheld.

**When** Pete requests Alice's section via `GET /users/<alice-id>/documents`.

**Then** Project withheld — narrower Project S5 belongs to future gate; Colleague has —; response is leak-free `404` with the section absent.

**Preconditions:** [fixture](../../README.md#canonical-personas); Alice, Pete, and Dave share project membership; Frank reports to Dave.

## Test

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Pete>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; section key absent; leak-free body
