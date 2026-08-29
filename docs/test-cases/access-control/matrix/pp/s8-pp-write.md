# AC-M-S8-PP-W · pp write s8

**Trace:** §3.2 S8 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner with §3.2 write on Feedbacks.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Feedbacks data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "body": "Strong collaborator",
  "sharedWithEmployee": false
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
