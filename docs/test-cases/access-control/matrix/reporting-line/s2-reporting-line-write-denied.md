# AC-M-S2-RE-W-DEN · reporting-line write s2 denied (read-only)

**Trace:** §3.2 S2 · AD-10

## Scenario

**Given** Bob may **read** but not **write** Alice's Personal contacts (§3.2 cell is `R`).

**When** Bob attempts a write.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Personal contacts data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no persisted change
