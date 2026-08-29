# AC-M-S8-RE-R · reporting-line read s8

**Trace:** §3.2 S8 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager).

**When** Bob reads Alice's Feedbacks section.

**Then** the request succeeds and the section data is present in the response — the §3.2 reporting line cell grants read. Record-flag projection applies within the allowed section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Feedbacks data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `feedbacks` present; `feedbacks` section data present
