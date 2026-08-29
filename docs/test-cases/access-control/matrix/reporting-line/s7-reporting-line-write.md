# AC-M-S7-RE-W · reporting-line write s7

**Trace:** §3.2 S7 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager) with §3.2 write on Management notes.

**When** Bob performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Management notes data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {
  "body": "Check-in note",
  "visibleForEmployee": false
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
