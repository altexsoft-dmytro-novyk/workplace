# AC-M-S03-01 · S3 Emergency contacts — Self: read

**Trace:** §3.2 S3 / Self `RW` · §4.3
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s03`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; body contains contact person, relationship, phone
