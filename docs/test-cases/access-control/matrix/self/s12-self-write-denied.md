# AC-M-S12-SE-W-DEN · self write s12 denied (narrower rule)

**Trace:** §3.2 S12 · §4.3 · AD-10

## Scenario

**Given** Alice is Self on CDS with a narrower §3.3/§4.3 write exception.

**When** Alice attempts a mutation outside that exception.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded CDS data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/assessments`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "cycle": "2026-H1"
}
  }
  ```
- **expectedResult:** `403`; Self cannot create or edit assessment records
