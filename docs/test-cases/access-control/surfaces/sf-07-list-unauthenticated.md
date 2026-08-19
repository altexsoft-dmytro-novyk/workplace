# AC-SF-07 · Employee list without authorization

**Trace:** global auth rule (README)
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users?columns=name`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; no rows returned
