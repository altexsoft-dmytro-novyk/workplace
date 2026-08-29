# AC-M-S13-SE-R · self read s13

**Trace:** §3.2 S13 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Mentorship section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Mentorship data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `mentorship` present; `openToMentoring` flag present
