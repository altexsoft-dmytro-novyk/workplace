# AC-M-S8-PP-R · pp read s8

**Trace:** §3.2 S8 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner.

**When** Paula reads Alice's Feedbacks section.

**Then** the request succeeds and the section data is present in the response — the §3.2 pp cell grants read. Record-flag projection applies within the allowed section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Feedbacks data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `feedbacks` present; `feedbacks` section data present
