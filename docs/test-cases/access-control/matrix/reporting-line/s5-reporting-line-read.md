# AC-M-S5-RE-R · reporting-line read s5

**Trace:** §3.2 S5 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager).

**When** Bob reads Alice's Documents section.

**Then** the request succeeds and the section data is present in the response — the §3.2 reporting line cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Documents data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `documents` present; at least one document item with `type` and `title`
