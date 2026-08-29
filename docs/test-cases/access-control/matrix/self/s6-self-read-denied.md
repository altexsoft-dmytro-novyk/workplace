# AC-M-S6-SE-R-DEN · self read s6 denied

**Trace:** §3.2 S6 · AD-10

## Scenario

**Given** Alice is an authenticated employee with **no** applicable audience for Alice's Risks section (§3.2 cell is `—` for self).

**When** Alice requests Alice's Risks data.

**Then** the API returns leak-free `404` and the section key is **absent** from the body — the viewer must not learn the section exists.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Risks data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; response body contains no section payload and no field names from that section
