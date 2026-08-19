# AC-M-S10-06 · S10 Leaves — PP: write denied

**Trace:** §3.2 S10 / PP `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "type": "sick"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
