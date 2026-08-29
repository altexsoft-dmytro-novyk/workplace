# AC-M-S7-SE-W-DEN · self write s7 denied (read-only)

**Trace:** §3.2 S7 · AD-10

## Scenario

**Given** Alice may **read** but not **write** Alice's Management notes (§3.2 cell is `R`).

**When** Alice attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Management notes data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
