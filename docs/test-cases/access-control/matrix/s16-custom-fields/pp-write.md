# AC-M-S16-10 · S16 Custom fields — PP: write any field

**Trace:** §3.2 S16 / PP `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s16`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "t-shirt-size": "M"
    }
  }
  ```
- **expectedResult:** `200`; persisted
