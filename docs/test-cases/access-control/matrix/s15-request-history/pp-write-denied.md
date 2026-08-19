# AC-M-S15-05 · S15 Request history — PP: write denied

**Trace:** §3.2 S15 / PP `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s15`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "status": "approved"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
