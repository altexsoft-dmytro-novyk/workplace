# AC-M-S07-06 · S7 — PM never edits a note, flagged or not

**Trace:** §3.2 S7 PM exception `R`
**Preconditions:** [fixture](../../README.md); N1 flagged *visible for PM*

## Test

- **inputURL:** `PATCH /users/alice/notes/{n1}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    },
    "body": {
      "body": "…"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
