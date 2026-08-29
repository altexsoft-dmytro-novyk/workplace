# AC-M-S10-SE-W-DEN · self write s10 denied (read-only)

**Trace:** §3.2 S10 · AD-10

## Scenario

**Given** Alice may **read** but not **write** Alice's Leaves (§3.2 cell is `R`).

**When** Alice attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Leaves data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/leaves`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
