# AC-M-S3-CO-W-DEN · colleague write s3 denied (no access)

**Trace:** §3.2 S3 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Emergency contacts (`—` cell).

**When** Colin attempts to mutate Alice's Emergency contacts.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Emergency contacts data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
