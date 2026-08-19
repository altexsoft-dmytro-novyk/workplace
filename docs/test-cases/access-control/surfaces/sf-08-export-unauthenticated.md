# AC-SF-08 · Export without authorization

**Trace:** global auth rule (README)
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users/export?columns=name`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; no file returned
