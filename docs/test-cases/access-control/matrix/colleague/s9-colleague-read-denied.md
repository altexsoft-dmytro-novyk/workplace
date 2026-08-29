# AC-M-S9-CO-R-DEN · colleague read s9 denied

**Trace:** §3.2 S9 · AD-10

## Scenario

**Given** Colin is an authenticated employee with **no** applicable audience for Alice's Career timeline section (§3.2 cell is `—` for colleague).

**When** Colin requests Alice's Career timeline data.

**Then** the API returns leak-free `404` and the section key is **absent** from the body — the viewer must not learn the section exists.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Career timeline data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/events`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; response body contains no section payload and no field names from that section
