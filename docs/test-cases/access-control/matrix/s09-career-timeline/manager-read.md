# AC-M-S09-03 · S9 Career timeline — Manager line: read

**Trace:** §3.2 S9 / Manager line `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s09`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; full timeline
