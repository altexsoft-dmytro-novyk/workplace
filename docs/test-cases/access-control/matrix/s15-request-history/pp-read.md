# AC-M-S15-04 · S15 Request history — PP: read

**Trace:** §3.2 S15 / PP `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s15`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; full attempt history with feedback
