# AC-FP-03 · HR Admin has no default profile data access

**Trace:** §2.2 · §3.1 · access-control.md

## Scenario

**Given** Root holds HR Admin configuration FR only and no relationship-derived audience over Alice.

**When** Root reads Alice's employment.

**Then** access is denied like any unrelated employee — HR Admin is **not** a matrix audience.

**Preconditions:** [fixture](../README.md#canonical-personas); Root unrelated to Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; employment absent — configuration FR does not imply data access
