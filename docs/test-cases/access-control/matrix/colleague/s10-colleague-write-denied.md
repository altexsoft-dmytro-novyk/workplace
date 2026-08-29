# AC-M-S10-CO-W-DEN · colleague write s10 denied (read-only)

**Trace:** §3.2 S10 · AD-10

## Scenario

**Given** Colin may **read** but not **write** Alice's Leaves (§3.2 cell is `R`).

**When** Colin attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Leaves data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/leaves`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
