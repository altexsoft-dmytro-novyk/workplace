# AC-SF-07 · Employee list without authorization

**Trace:** global auth rule (README)

## Scenario

**Given** a request arrives without credentials.

**When** it asks for the employee list.

**Then** 401; no rows are returned.

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
