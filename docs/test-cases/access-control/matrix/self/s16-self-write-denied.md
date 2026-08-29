# AC-M-S16-SE-W-DEN · self write s16 denied (read-only)

**Trace:** §3.2 S16 · AD-10

## Scenario

**Given** Alice may **read** but not **write** Alice's Custom fields (§3.2 cell is `R`).

**When** Alice attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Custom fields data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
