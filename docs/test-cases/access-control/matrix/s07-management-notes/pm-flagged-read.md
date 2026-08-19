# AC-M-S07-05 · S7 — *visible for PM* flag: PM reads that record only

**Trace:** §3.2 S7 (PM exception: R, only records flagged *visible for PM*)
**Preconditions:** [fixture](../../README.md); two notes about Alice: N1 flagged *visible for PM*, N2 unflagged

## Test

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    }
  }
  ```
- **expectedResult:** `200`; exactly N1; N2 absent
