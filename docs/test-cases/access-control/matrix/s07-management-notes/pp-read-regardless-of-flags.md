# AC-M-S07-11 · S7 — PP reads all notes regardless of flags

**Trace:** §3.2 S7 / PP `RW` · §3.3.2

## Scenario

**Given** notes about Alice exist in every flag combination.

**When** Paula, her assigned PP, requests the section.

**Then** she sees every note — flags never gate the PP.

**Preconditions:** [fixture](../../README.md); notes about Alice exist with all flag combinations

## Test

- **inputURL:** `GET /users/alice/notes`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; all notes regardless of flags
