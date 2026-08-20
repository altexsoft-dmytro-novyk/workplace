# AC-M-S03-08 · S3 Emergency contacts — Colleague: no write path (negative)

**Trace:** §3.2 S3 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin cannot even see Alice's emergency contacts.

**When** he tries to write them.

**Then** 404 — for him the section does not exist.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s03`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "phone": "+1-555-0100"
    }
  }
  ```
- **expectedResult:** `404`; unchanged
