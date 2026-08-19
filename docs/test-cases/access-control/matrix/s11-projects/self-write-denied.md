# AC-M-S11-02 · S11 Projects — Self: write denied

**Trace:** §3.2 S11 / Self `R` (assignments come from the timetracker)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "project": "Atlas"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
