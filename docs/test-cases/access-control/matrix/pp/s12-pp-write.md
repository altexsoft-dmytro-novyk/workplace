# AC-M-S12-PP-W · pp write s12

**Trace:** §3.2 S12 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner with §3.2 write on CDS.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded CDS data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/assessments`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "cycle": "2026-H1"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
