# AC-M-AU-03 · Section write without authorization

**Trace:** global auth rule (README)

## Scenario

**Given** a request arrives with an empty authorization header.

**When** it tries to write Alice's personal contacts.

**Then** 401; the value is unchanged.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `PATCH /users/alice/personal-contacts`
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
