# AC-M-S08-03 · S8 — the shared flag grants read, never write

**Trace:** §3.2 S8 / Self `R`

## Scenario

**Given** Alice can read feedback F1, which was shared with her.

**When** she tries to edit it.

**Then** 403 — sharing grants read only.

**Preconditions:** [fixture](../../README.md); F1 flagged *shared with employee*

## Test

- **inputURL:** `PATCH /users/alice/feedbacks/{f1}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "body": "…"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
