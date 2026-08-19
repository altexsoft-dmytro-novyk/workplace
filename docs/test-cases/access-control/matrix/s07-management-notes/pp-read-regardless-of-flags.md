# AC-M-S07-11 · S7 — PP reads all notes regardless of flags

**Trace:** §3.2 S7 / PP `RW` · §3.3.2
**Preconditions:** [fixture](../../README.md); notes about Alice exist with all flag combinations

## Test

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; all notes regardless of flags
