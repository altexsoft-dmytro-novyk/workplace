# AC-M-S07-07 · S7 — PM cannot author notes

**Trace:** §3.3.2 (authors are UM, DM, PP)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/notes`
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
- **expectedResult:** `403 Forbidden`; nothing created
