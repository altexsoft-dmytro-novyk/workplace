# AC-M-S10-01 · S10 Leaves — Self: read

**Trace:** §3.2 S10 / Self `R` · §4.3 (managing them happens in the timetracker)
**Preconditions:** [fixture](../../README.md); leave records synced (vacation, sick leave)

## Test

- **inputURL:** `GET /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; dates and types of all her leave records
