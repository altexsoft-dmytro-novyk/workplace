# AC-M-S4-PP-W · pp write s4

**Trace:** §3.2 S4 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner with §3.2 write on Employment.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Employment data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "grade": "L4"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
