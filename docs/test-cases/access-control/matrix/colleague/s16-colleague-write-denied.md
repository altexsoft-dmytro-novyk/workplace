# AC-M-S16-CO-W-DEN · colleague write s16 denied (read-only)

**Trace:** §3.2 S16 · AD-10

## Scenario

**Given** Colin may **read** but not **write** Alice's Custom fields (§3.2 cell is `R`).

**When** Colin attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Custom fields data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
