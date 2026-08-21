# AC-M-S03-04 · S3 Emergency contacts — Manager line: write denied

**Trace:** §3.2 S3 / Manager line `R`

## Scenario

**Given** Carol can read Alice's emergency contacts.

**When** she tries to change the phone.

**Then** 403 — only Alice herself and her PP write S3.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s03`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:carol>"
    },
    "body": {
      "phone": "+1-555-0100"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
