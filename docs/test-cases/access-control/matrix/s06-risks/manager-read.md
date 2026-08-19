# AC-M-S06-03 · S6 Risks — Manager line: read

**Trace:** §3.2 S6 / Manager line `RW` · §4.6 (Dave: project path grants same S6 access as a UM)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s06`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; current level, trend arrow, description, details, date, full history
