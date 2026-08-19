# AC-M-S10-02 · S10 Leaves — Self: write denied

**Trace:** §3.2 S10 / Self `R` (**assumption**: R for every audience — timetracker owns the data)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "type": "vacation"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
