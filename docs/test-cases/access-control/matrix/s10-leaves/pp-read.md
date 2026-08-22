# AC-M-S10-05 · S10 Leaves — PP: read

**Trace:** §3.2 S10 / PP `R`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's leaves.

**Then** she can read dates and types.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/leaves`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; dates and types
