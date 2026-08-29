# AC-M-S9-PP-W · pp write s9

**Trace:** §3.2 S9 · AD-10

## Scenario

**Given** Paula is Alice's assigned PP with §3.2 write on Career timeline.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Career timeline data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/events`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "type": "manual_backfill",
  "title": "Prior role",
  "occurredAt": "2019-06-01"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
