# AC-M-S10-CO-R · colleague read s10

**Trace:** §3.2 S10 · AD-10

## Scenario

**Given** Colin is Alice's unrelated colleague.

**When** Colin reads Alice's Leaves section.

**Then** the request succeeds and the section data is present in the response — the §3.2 colleague cell grants read. Colleague projection shows dates only, type hidden (§3.3.4); Reporting/PP/Self see full leave type.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Leaves data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/leaves`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `leaves` present; each leave includes `startDate` and `endDate`; `type` key **absent** on every item
