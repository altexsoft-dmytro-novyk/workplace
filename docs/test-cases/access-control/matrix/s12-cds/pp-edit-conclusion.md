# AC-M-S12-08 · S12 CDS — PP: edit assessment conclusion

**Trace:** §3.2 S12 / PP `RW` · §4.10

## Scenario

**Given** an assessment conclusion needs a correction.

**When** Paula edits it.

**Then** the change persists — PP holds RW on S12.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/assessments/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "conclusion": "updated conclusion"
    }
  }
  ```
- **expectedResult:** `200`; persisted
