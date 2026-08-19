# AC-M-S03-08 · S3 Emergency contacts — Colleague: no write path (negative)

**Trace:** §3.2 S3 / Colleague `—` · §9 DoD
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
