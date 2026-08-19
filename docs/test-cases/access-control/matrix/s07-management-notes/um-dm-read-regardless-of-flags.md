# AC-M-S07-08 · S7 — UM/DM read all notes regardless of flags

**Trace:** §3.3.2 (UM, DM and PP … regardless of flags); DM parity via project path per AC-TD-05
**Preconditions:** [fixture](../../README.md); notes about Alice exist with all flag combinations

## Test

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; all notes, flagged or not, with both flag values visible
