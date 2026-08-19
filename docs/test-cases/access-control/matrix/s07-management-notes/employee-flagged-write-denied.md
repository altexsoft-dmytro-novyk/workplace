# AC-M-S07-03 · S7 — the employee flag grants read, never write

**Trace:** §3.2 S7 / Self `R`
**Preconditions:** [fixture](../../README.md); N1 flagged *visible for employee*

## Test

- **inputURL:** `PATCH /users/alice/notes/{n1}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "body": "I disagree"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
