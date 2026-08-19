# AC-M-S04-04 · S4 Employment — Manager line: write

**Trace:** §3.2 S4 / Manager line `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "englishLevel": "C1"
    }
  }
  ```
- **expectedResult:** `200`; persisted
