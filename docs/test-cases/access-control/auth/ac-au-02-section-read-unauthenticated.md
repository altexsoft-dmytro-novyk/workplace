# AC-AU-02 · Section read rejects missing token

**Trace:** §3.3.4 · AD-1 global 401 rule

## Scenario

**Given** no valid session.

**When** an unauthenticated client reads a owned-collection section.

**Then** `401` before tier resolution.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": {}
  }
  ```
- **expectedResult:** `401`
