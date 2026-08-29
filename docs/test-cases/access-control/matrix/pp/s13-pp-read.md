# AC-M-S13-PP-R · pp read s13

**Trace:** §3.2 S13 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner.

**When** Paula reads Alice's Mentorship section.

**Then** the request succeeds and the section data is present in the response — the §3.2 pp cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Mentorship data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `mentorship` present; `openToMentoring` flag present
