# AC-M-S02-01 · S2 Personal contacts — Self: read

**Trace:** §3.2 S2 / Self `RW` · §4.3
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; body contains personal phone, personal email, messengers, residential address, current place of stay
