# AC-M-S11-06 · S11 Projects — PP: write denied

**Trace:** §3.2 S11 / PP `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "period": "2026"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
