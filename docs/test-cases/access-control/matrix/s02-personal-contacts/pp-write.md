# AC-M-S02-06 · S2 Personal contacts — PP: write

**Trace:** §3.2 S2 / PP `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "personalEmail": "alice@example.com"
    }
  }
  ```
- **expectedResult:** `200`; persisted
