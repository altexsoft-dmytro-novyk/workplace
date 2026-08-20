# AC-M-S06-05 · S6 Risks — PP: read

**Trace:** §3.2 S6 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner, and risk records about Alice exist including history.

**When** Paula requests Alice's risk section (S6).

**Then** she gets the full section — current level, trend, description, details, date and the complete history — because the S6/PP cell is RW.

**Preconditions:** [fixture](../../README.md); risk records about Alice exist, incl. older history

## Test

- **inputURL:** `GET /users/alice/sections/s06`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; full risk section incl. history
