# AC-M-S04-06 · S4 Employment — PP: write

**Trace:** §3.2 S4 / PP `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "probationStatus": "passed"
    }
  }
  ```
- **expectedResult:** `200`; persisted
