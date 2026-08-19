# AC-M-S10-05 · S10 Leaves — PP: read

**Trace:** §3.2 S10 / PP `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; dates and types
