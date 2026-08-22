# AC-M-S03-05 · S3 Emergency contacts — PP: read

**Trace:** §3.2 S3 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's emergency contacts.

**Then** she gets them — PP holds RW on S3.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; body contains contact person, relationship, phone
