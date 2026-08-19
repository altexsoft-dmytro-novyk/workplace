# AC-M-S01-02 · S1 Identity card — Self: write denied (photo excepted)

**Trace:** §3.2 S1 / Self `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "position": "CTO"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged — Self writes nothing in S1 except the photo (AC-M-S01-03)
