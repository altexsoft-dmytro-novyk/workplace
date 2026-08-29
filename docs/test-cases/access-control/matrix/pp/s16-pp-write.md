# AC-M-S16-PP-W · pp write s16

**Trace:** §3.2 S16 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner with §3.2 write on Custom fields.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Custom fields data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "managementOnlyField": "updated"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
