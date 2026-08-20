# AC-M-S04-05 · S4 Employment — PP: read

**Trace:** §3.2 S4 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's employment section.

**Then** she gets it in full — PP holds RW on S4.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; body contains employee type, grade, seniority, position history, English level, probation status, employment status, contract type
