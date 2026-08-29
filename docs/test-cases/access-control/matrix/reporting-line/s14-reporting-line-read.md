# AC-M-S14-RE-R · reporting-line read s14

**Trace:** §3.2 S14 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager).

**When** Bob reads Alice's Action items section.

**Then** the request succeeds and the section data is present in the response — the §3.2 reporting line cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Action items data for Alice.

## Test

- **inputURL:** `GET /action-items?assigneeId=<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `actionitems` present; at least one action item with `title` and `status`
