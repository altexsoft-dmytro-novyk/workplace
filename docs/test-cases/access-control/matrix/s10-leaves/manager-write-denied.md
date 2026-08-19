# AC-M-S10-04 · S10 Leaves — Manager line: write denied

**Trace:** §3.2 S10 / Manager line `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:frank>"
    },
    "body": {
      "type": "vacation"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
