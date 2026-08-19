# AC-M-S10-03 · S10 Leaves — Manager line: read

**Trace:** §3.2 S10 / Manager line `R` (Frank: compound path)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:frank>"
    }
  }
  ```
- **expectedResult:** `200`; dates and types
