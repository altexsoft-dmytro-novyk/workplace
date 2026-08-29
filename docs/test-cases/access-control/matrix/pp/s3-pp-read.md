# AC-M-S3-PP-R · pp read s3

**Trace:** §3.2 S3 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner.

**When** Paula reads Alice's Emergency contacts section.

**Then** the request succeeds and the section data is present in the response — the §3.2 pp cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Emergency contacts data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `emergencycontacts` present; at least one emergency contact with `name` and `phone`
