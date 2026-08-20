# AC-M-S11-05 · S11 Projects — PP: read

**Trace:** §3.2 S11 / PP `R`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's projects section.

**Then** she sees project, PM, DM and period.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; project, PM, DM, period
