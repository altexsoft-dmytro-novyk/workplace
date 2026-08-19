# AC-M-AU-02 · Section read without authorization

**Trace:** global auth rule (README)
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; no section data — even for S1, the most public section
