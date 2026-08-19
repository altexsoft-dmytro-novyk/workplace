# AC-M-S02-02 · S2 Personal contacts — Self: write (no HR involved)

**Trace:** §3.2 S2 / Self `RW` · §4.3
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "currentPlaceOfStay": "Lviv"
    }
  }
  ```
- **expectedResult:** `200`; persisted
