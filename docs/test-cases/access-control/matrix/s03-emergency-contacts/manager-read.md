# AC-M-S03-03 · S3 Emergency contacts — Manager line: read

**Trace:** §3.2 S3 / Manager line `R` (Carol: transitive path)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s03`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:carol>"
    }
  }
  ```
- **expectedResult:** `200`; body contains contact person, relationship, phone
