# AC-M-S03-04 · S3 Emergency contacts — Manager line: write denied

**Trace:** §3.2 S3 / Manager line `R`
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
