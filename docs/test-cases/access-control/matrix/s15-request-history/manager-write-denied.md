# AC-M-S15-03 · S15 Request history — Manager line: write denied

**Trace:** §3.2 S15 / Manager line `R` (history is written by the resourcing flow, not edited here)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s15`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    },
    "body": {
      "status": "approved"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
