# AC-M-AU-01 · Profile read without authorization

**Trace:** global auth rule (README) · §3.3.4
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; no section data in the body
