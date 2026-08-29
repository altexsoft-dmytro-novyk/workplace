# AC-AD-12 · Empty bulk resolution

**Trace:** AD-10 · facade-contract.md (Empty bulk)

## Scenario

**Given** Bob is authenticated.

**When** bulk audience resolution runs with an **empty** target id list via `GET /users?ids=`.

**Then** the resolver returns an empty result immediately with **zero graph queries** — no fail-open defaults.

**Preconditions:** [fixture](../README.md#canonical-personas); empty `ids` query parameter.

## Test

- **inputURL:** `GET /users?ids=`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; body exactly `{ "items": [] }`; stage 2 asserts zero resolver queries via query-count hook
