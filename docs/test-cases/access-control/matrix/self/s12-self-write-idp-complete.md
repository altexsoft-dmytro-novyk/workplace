# AC-M-S12-SE-W-WRITEIDPCOMPLETE · self complete own IDP

**Trace:** §3.2 S12 · §4.3 · AD-10

## Scenario

**Given** Alice is Self on CDS (§3.2 `R` plus §4.3 IDP completion).

**When** Alice marks her own IDP complete.

**Then** the completion succeeds — Self may complete own IDP only, not create assessments.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded CDS data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/assessments/<alice-idp-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "complete": true
}
  }
  ```
- **expectedResult:** `200`; IDP `complete: true` with `completedAt` recorded
