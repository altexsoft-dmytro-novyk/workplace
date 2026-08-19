# AC-M-S01-05 · S1 Identity card — Manager line: write

**Trace:** §3.2 S1 / Manager line `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "position": "Senior Engineer"
    }
  }
  ```
- **expectedResult:** `200`; persisted
