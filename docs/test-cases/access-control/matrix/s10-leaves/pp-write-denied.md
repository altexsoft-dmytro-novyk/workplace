# AC-M-S10-06 · S10 Leaves — PP: write denied

**Trace:** §3.2 S10 / PP `R`

## Scenario

**Given** Paula can read Alice's leave records.

**When** she tries to change one.

**Then** 403 — even the PP cannot write timetracker-owned data.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/leaves`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "type": "sick"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
