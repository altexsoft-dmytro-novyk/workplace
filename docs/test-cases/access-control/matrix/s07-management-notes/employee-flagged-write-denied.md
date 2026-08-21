# AC-M-S07-03 · S7 — the employee flag grants read, never write

**Trace:** §3.2 S7 / Self `R`

## Scenario

**Given** Alice can read note N1, which was flagged visible for her.

**When** she tries to edit it.

**Then** 403 — the flag grants read only.

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
