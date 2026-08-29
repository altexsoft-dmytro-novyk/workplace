# AC-M-S13-CO-R-DEN · colleague read s13 denied

**Trace:** §3.2 S13 · AD-10

## Scenario

**Given** Colin is an authenticated employee with **no** applicable audience for Alice's Mentorship section (§3.2 cell is `—` for colleague).

**When** Colin requests Alice's Mentorship data.

**Then** the API returns leak-free `404` and the section key is **absent** from the body — the viewer must not learn the section exists.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Mentorship data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; response body contains no section payload and no field names from that section
