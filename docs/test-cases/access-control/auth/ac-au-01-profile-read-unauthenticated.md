# AC-AU-01 · Profile read rejects missing token

**Trace:** §3.3.4 · AD-1 global 401 rule

## Scenario

**Given** no valid session.

**When** an unauthenticated client reads a user profile.

**Then** the API returns `401` before any audience reasoning.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": {}
  }
  ```
- **expectedResult:** `401`; no profile body
