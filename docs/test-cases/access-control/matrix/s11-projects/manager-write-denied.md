# AC-M-S11-04 · S11 Projects — Manager line: write denied

**Trace:** §3.2 S11 / Manager line `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "project": "Atlas"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
