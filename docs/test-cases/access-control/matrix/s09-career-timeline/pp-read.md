# AC-M-S09-06 · S9 Career timeline — PP: read

**Trace:** §3.2 S9 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's career timeline.

**Then** she sees the full timeline.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s09`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; full timeline
