# AC-M-S14-SE-W-WRITECOMPLETE · self mark own action item complete

**Trace:** §3.2 S14 · §4.3 · AD-10

## Scenario

**Given** Alice is Self on Action items (§3.2 `R` plus §4.3 mark-complete).

**When** Alice marks her own assigned action item complete.

**Then** completion succeeds — Self cannot create action items for others.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Action items data for Alice.

## Test

- **inputURL:** `PATCH /action-items/<alice-action-item-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "status": "completed"
}
  }
  ```
- **expectedResult:** `200`; item `status: completed` with `completedAt` recorded
