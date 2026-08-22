# AC-M-S10-04 · S10 Leaves — Manager line: write denied

**Trace:** §3.2 S10 / Manager line `R`

## Scenario

**Given** Frank can read Alice's leave records.

**When** he tries to change one.

**Then** 403 — nobody writes leave data here.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/leaves`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:frank>"
    },
    "body": {
      "type": "vacation"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
