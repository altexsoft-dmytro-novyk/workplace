# AC-M-S14-SE-R · self read s14

**Trace:** §3.2 S14 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Action items section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Action items data for Alice.

## Test

- **inputURL:** `GET /action-items?assigneeId=<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `actionitems` present; at least one action item with `title` and `status`
