# AC-M-S12-CO-W-DEN · colleague write s12 denied (no access)

**Trace:** §3.2 S12 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's CDS (`—` cell).

**When** Colin attempts to mutate Alice's CDS.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded CDS data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/assessments`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
