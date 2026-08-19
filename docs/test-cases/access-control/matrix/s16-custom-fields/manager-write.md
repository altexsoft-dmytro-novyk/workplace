# AC-M-S16-09 · S16 Custom fields — Manager line: write any field

**Trace:** §3.2 S16 / Manager line `RW` · §4.1
**Preconditions:** [fixture](../../README.md); fields at all three visibility levels exist on Alice

## Test

- **inputURL:** `PATCH /users/alice/sections/s16`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "visa-status": "valid"
    }
  }
  ```
- **expectedResult:** `200`; persisted
