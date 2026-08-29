# AC-M-S12-RE-R · reporting-line read s12

**Trace:** §3.2 S12 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager).

**When** Bob reads Alice's CDS section.

**Then** the request succeeds and the section data is present in the response — the §3.2 reporting line cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded CDS data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/assessments`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `cds` present; assessment log with `cycle` present
