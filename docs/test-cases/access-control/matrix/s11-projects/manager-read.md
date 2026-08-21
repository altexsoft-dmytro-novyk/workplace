# AC-M-S11-03 · S11 Projects — Manager line: read

**Trace:** §3.2 S11 / Manager line `R`

## Scenario

**Given** Bob is Alice's unit manager.

**When** he requests her projects section.

**Then** he sees project, PM, DM and period.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; project, PM, DM, period
