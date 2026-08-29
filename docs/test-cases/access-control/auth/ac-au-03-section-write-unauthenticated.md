# AC-AU-03 · Section write rejects missing token

**Trace:** §3.3.4 · AD-1 global 401 rule

## Scenario

**Given** no valid session.

**When** an unauthenticated client attempts a section mutation.

**Then** `401` before tier or feature checks.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **inputURL:** `PATCH /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "grade": "L5" }
  }
  ```
- **expectedResult:** `401`
