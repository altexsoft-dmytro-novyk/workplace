# AC-M-S14-CO-R-DEN · colleague read s14 denied

**Trace:** §3.2 S14 · AD-10

## Scenario

**Given** Colin is an authenticated employee with **no** applicable audience for Alice's Action items section (§3.2 cell is `—` for colleague).

**When** Colin requests Alice's Action items data.

**Then** the API returns leak-free `404` and the section key is **absent** from the body — the viewer must not learn the section exists.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Action items data for Alice.

## Test

- **inputURL:** `GET /action-items?assigneeId=<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; response body contains no section payload and no field names from that section
