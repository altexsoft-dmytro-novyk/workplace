# AC-M-S3-SE-R · self read s3

**Trace:** §3.2 S3 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Emergency contacts section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Emergency contacts data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `emergencycontacts` present; at least one emergency contact with `name` and `phone`
