# AC-M-AU-03 · Section write without authorization

**Trace:** global auth rule (README)
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    },
    "body": {
      "personalPhone": "+1-555-0100"
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; value unchanged
