# AC-M-S04-03 · S4 Employment — Manager line: read

**Trace:** §3.2 S4 / Manager line `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; body contains employee type, grade, seniority, position history, English level, probation status, employment status, contract type
