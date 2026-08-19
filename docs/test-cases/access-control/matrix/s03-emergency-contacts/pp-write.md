# AC-M-S03-06 · S3 Emergency contacts — PP: write

**Trace:** §3.2 S3 / PP `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s03`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "contactPerson": "Maria K."
    }
  }
  ```
- **expectedResult:** `200`; persisted
