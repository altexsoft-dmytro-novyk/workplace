# AC-M-S05-03 · S5 Documents — Self: certificate upload allowed

**Trace:** §3.2 S5 / Self `+ upload certificates` · §4.3
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/documents`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "type": "certificate",
      "file": "<multipart>"
    }
  }
  ```
- **expectedResult:** `201`; appears in her S5
