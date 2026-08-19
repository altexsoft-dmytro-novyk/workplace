# AC-M-S02-04 · S2 Personal contacts — Manager line: write denied

**Trace:** §3.2 S2 / Manager line `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    },
    "body": {
      "personalPhone": "+1-555-0100"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
