# AC-M-S12-07 · S12 CDS — PP: read

**Trace:** §3.2 S12 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's CDS section.

**Then** she sees the full section.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s12`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; full CDS section
