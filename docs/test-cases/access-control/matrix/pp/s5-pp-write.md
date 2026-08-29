# AC-M-S5-PP-W · pp write s5

**Trace:** §3.2 S5 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner with §3.2 write on Documents.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Documents data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "type": "certificate",
  "title": "AWS SA"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
