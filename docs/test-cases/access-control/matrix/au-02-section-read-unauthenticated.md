# AC-M-AU-02 · Section read without authorization

**Trace:** global auth rule (README)

## Scenario

**Given** a request arrives with an empty authorization header.

**When** it asks for Alice's identity card — the most public section.

**Then** 401; even S1 requires a valid session.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; no section data — even for S1, the most public section
