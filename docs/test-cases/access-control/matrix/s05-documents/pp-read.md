# AC-M-S05-07 · S5 Documents — PP: read

**Trace:** §3.2 S5 / PP `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s05`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; document list
