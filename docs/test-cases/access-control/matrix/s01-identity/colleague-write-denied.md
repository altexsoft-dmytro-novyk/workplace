# AC-M-S01-10 · S1 Identity card — Colleague: write denied

**Trace:** §3.2 S1 / Colleague `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "position": "X"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
