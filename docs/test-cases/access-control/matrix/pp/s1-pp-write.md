# AC-M-S1-PP-W · pp write s1

**Trace:** §3.2 S1 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner with §3.2 write on Identity.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Identity data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "position": "Engineer II"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
