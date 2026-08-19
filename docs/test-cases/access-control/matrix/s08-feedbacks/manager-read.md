# AC-M-S08-04 · S8 Feedbacks — Manager line: read all, regardless of flag

**Trace:** §3.2 S8 / Manager line `RW` · §4.15
**Preconditions:** [fixture](../../README.md); records exist at both visibility levels

## Test

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; all records at both visibility levels, with author, date, context, body
