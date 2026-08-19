# AC-M-S01-08 · S1 Identity card — PP: write

**Trace:** §3.2 S1 / PP `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "workPhone": "+380-44-000-0000"
    }
  }
  ```
- **expectedResult:** `200`; persisted
