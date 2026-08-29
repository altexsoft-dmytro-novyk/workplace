# AC-AD-06 · Project line withheld in Phase 1

**Trace:** facade-contract.md (Project withheld) · AD-10

## Scenario

**Given** Pete is PM on a project shared with Alice and has **no** Reporting, PP, or other relation to Alice.

**When** Pete requests S2 (Project line would be `—`; Colleague is also `—` for S2).

**Then** Phase 1 resolves **no Project audience**; Pete falls back to Colleague and is denied leak-free `404`.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice, Pete, Dave on same project; Pete unrelated otherwise.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Pete>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; personal-contacts absent — Project withheld, Colleague `—`
