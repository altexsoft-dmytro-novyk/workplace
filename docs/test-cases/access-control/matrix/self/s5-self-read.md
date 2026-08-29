# AC-M-S5-SE-R · self read s5

**Trace:** §3.2 S5 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Documents section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Documents data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `documents` present; at least one document item with `type` and `title`
