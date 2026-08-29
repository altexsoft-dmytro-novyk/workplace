# AC-M-S10-RE-R · reporting-line read s10

**Trace:** §3.2 S10 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager).

**When** Bob reads Alice's Leaves section.

**Then** the request succeeds and the section data is present in the response — the §3.2 reporting line cell grants read. Colleague projection shows dates only, type hidden (§3.3.4); Reporting/PP/Self see full leave type.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Leaves data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/leaves`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `leaves` present; at least one leave with `startDate` and `endDate`
