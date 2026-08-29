# AC-M-S6-PP-W · pp write s6

**Trace:** §3.2 S6 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner with §3.2 write on Risks.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Risks data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "level": "medium",
  "description": "Delivery slip"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
