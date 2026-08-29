# AC-M-S3-RE-W-DEN · reporting-line write s3 denied (read-only)

**Trace:** §3.2 S3 · AD-10

## Scenario

**Given** Bob may **read** but not **write** Alice's Emergency contacts (§3.2 cell is `R`).

**When** Bob attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Emergency contacts data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
