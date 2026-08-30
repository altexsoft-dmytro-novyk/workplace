# AC-M-S13-CO-R-DEN · colleague read s13 denied

**Trace:** §3.2 S13 · AD-10

## Scenario

**Given** Colin is an authenticated employee with **no** applicable audience for Alice's Mentorship section (§3.2 cell is `—` for colleague).

**When** Colin requests Alice's Mentorship data.

**Then** the API returns leak-free `404` and the section key is **absent** from the body — the viewer must not learn the section exists.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Mentorship data for Alice.

**Corrected 2026-08-30:** the original inputURL (`GET /users/<alice-id>`) was wrong for this scenario's own intent — S1 is `read` for every audience including Colleague (§3.2 has no `—` cell for S1), so that aggregate route is always `200` for any authenticated relation to an existing user, correctly, per the same matrix this scenario is trying to test a denial from. S13's dedicated read route (`GET /mentorship-pairs?userId=`) is the actual section-specific surface that can 404.

## Test

- **inputURL:** `GET /mentorship-pairs?userId=<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; response body contains no `pairs` key and no field names from that section
