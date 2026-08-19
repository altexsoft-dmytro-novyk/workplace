# AC-M-S07-12 · S7 — PP creates and edits notes

**Trace:** §3.2 S7 / PP `RW` · §3.3.2
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/notes`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "body": "coaching plan discussed"
    }
  }
  ```
- **expectedResult:** `201`
