# AC-M-S2-SE-W · self write s2

**Trace:** §3.2 S2 · AD-10

## Scenario

**Given** Alice is Alice's Self with §3.2 write on Personal contacts.

**When** Alice performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Personal contacts data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "personalPhone": "+10000000001"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
