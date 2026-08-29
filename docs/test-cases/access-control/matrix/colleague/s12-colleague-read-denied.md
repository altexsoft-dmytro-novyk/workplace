# AC-M-S12-CO-R-DEN · colleague read s12 denied

**Trace:** §3.2 S12 · AD-10

## Scenario

**Given** Colin is an authenticated employee with **no** applicable audience for Alice's CDS section (§3.2 cell is `—` for colleague).

**When** Colin requests Alice's CDS data.

**Then** the API returns leak-free `404` and the section key is **absent** from the body — the viewer must not learn the section exists.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded CDS data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/assessments`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; response body contains no section payload and no field names from that section
