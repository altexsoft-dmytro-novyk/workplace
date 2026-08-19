# AC-M-S08-07 · S8 Feedbacks — PP: read all, regardless of flag

**Trace:** §3.2 S8 / PP `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; all records at both visibility levels
