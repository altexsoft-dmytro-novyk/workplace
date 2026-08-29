# AC-M-S1-CO-W-DEN · colleague write s1 denied (read-only)

**Trace:** §3.2 S1 · AD-10

## Scenario

**Given** Colin may **read** but not **write** Alice's Identity (§3.2 cell is `R`).

**When** Colin attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Identity data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
