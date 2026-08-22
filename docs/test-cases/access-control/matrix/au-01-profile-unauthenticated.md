# AC-M-AU-01 · Profile read without authorization

**Trace:** global auth rule (README) · §3.3.4

## Scenario

**Given** a request arrives with an empty authorization header.

**When** it asks for Alice's profile.

**Then** 401 before any tier resolution; no section data is returned.

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
- **expectedResult:** `401 Unauthorized`; no section data in the body
