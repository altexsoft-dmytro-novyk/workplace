# AC-M-S06-03 · S6 Risks — Manager line: read

**Trace:** §3.2 S6 / Manager line `RW` · §4.6 (Dave: project path grants same S6 access as a UM)

## Scenario

**Given** Dave is a Manager of Alice via his DM role on her project.

**When** he requests her risk section.

**Then** he sees the current level with its trend arrow and the full history — the project path grants the same S6 access as a unit manager.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s06`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; current level, trend arrow, description, details, date, full history
