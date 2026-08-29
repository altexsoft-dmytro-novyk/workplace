# AC-M-S15-RE-W-DEN · reporting-line write s15 denied (read-only)

**Trace:** §3.2 S15 · AD-10

## Scenario

**Given** Bob may **read** but not **write** Alice's Request history (§3.2 cell is `R`).

**When** Bob attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Request history data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/request-history`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
