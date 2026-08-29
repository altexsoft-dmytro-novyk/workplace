# AC-M-S9-SE-W-DEN · self write s9 denied (read-only)

**Trace:** §3.2 S9 · AD-10

## Scenario

**Given** Alice may **read** but not **write** Alice's Career timeline (§3.2 cell is `R`).

**When** Alice attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Career timeline data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/events`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
