# AC-M-S1-SE-R · self read s1

**Trace:** §3.2 S1 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Identity section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Identity data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `identity` present; `firstName`, `lastName`, and `workEmail` present
