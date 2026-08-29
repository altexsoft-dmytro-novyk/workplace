# AC-M-S2-CO-R-DEN · colleague read s2 denied

**Trace:** §3.2 S2 · AD-10

## Scenario

**Given** Colin is an authenticated employee with **no** applicable audience for Alice's Personal contacts section (§3.2 cell is `—` for colleague).

**When** Colin requests Alice's Personal contacts data.

**Then** the API returns leak-free `404` and the section key is **absent** from the body — the viewer must not learn the section exists.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Personal contacts data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; response body contains no section payload and no field names from that section
