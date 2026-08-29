# AC-M-S11-RE-W-DEN · reporting-line write s11 denied (read-only)

**Trace:** §3.2 S11 · AD-10

## Scenario

**Given** Bob may **read** but not **write** Alice's Projects (§3.2 cell is `R`).

**When** Bob attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Projects data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
