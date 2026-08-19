# AC-M-S05-08 · S5 Documents — PP: write

**Trace:** §3.2 S5 / PP `RW`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/documents`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "type": "cooperation-form",
      "file": "<multipart>"
    }
  }
  ```
- **expectedResult:** `201`; appears in S5
