# AC-M-S03-06 · S3 Emergency contacts — PP: write

**Trace:** §3.2 S3 / PP `RW`

## Scenario

**Given** Paula maintains emergency data for the people she partners.

**When** she updates Alice's contact person.

**Then** the change persists.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "contactPerson": "Maria K."
    }
  }
  ```
- **expectedResult:** `200`; persisted
