# AC-FP-02 · Feature permission does not grant data access

**Trace:** §2.3 · facade-contract.md (FR is not audience)

## Scenario

**Given** Ida holds a functional permission (e.g. *create form campaigns*) but **no** audience over Alice.

**When** Ida requests Alice's employment section.

**Then** `isAllowed` may be true for her feature, but the hidden section remains leak-free `404` — FR never widens data access.

**Preconditions:** [fixture](../README.md#canonical-personas); Ida custom FR only; Colin-level relationship to Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Ida>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; employment absent — FR is not audience
