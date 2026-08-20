# AC-SF-08 · Export without authorization

**Trace:** global auth rule (README)

## Scenario

**Given** a request arrives without credentials.

**When** it asks for an xlsx export.

**Then** 401; no file is returned.

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
