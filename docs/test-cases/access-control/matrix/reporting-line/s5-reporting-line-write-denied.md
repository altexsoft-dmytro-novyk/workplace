# AC-M-S5-RE-W-DEN · reporting-line write s5 denied (read-only)

**Trace:** §3.2 S5 · AD-10

## Scenario

**Given** Bob may **read** but not **write** Alice's Documents (§3.2 cell is `R`).

**When** Bob attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Documents data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
