# AC-M-S3-SE-W · self write s3

**Trace:** §3.2 S3 · AD-10

## Scenario

**Given** Alice is Alice's Self with §3.2 write on Emergency contacts.

**When** Alice performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Emergency contacts data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "contactPhone": "+10000000002"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
