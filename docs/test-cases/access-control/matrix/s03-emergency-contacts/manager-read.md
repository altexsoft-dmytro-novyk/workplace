# AC-M-S03-03 · S3 Emergency contacts — Manager line: read

**Trace:** §3.2 S3 / Manager line `R` (Carol: transitive path)

## Scenario

**Given** Carol is Alice's manager two levels up, via the reporting chain.

**When** she requests Alice's emergency contacts.

**Then** she can read them — Manager line holds R on S3.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:carol>"
    }
  }
  ```
- **expectedResult:** `200`; body contains contact person, relationship, phone
