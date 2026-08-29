# AC-M-S9-SE-R · self read s9

**Trace:** §3.2 S9 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Career timeline section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Career timeline data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/events`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `careertimeline` present; at least one timeline event with `type` and `occurredAt`
