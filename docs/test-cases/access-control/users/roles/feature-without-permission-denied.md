# AC-UR-08 · Feature without the permission is denied

**Trace:** §2.2 (functional roles gate features)
**Preconditions:** [fixture](../../README.md); Eve holds no functional role

## Test

- **inputURL:** `POST /campaigns`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:eve>"
    },
    "body": {
      "title": "X",
      "link": "https://forms.example/x",
      "dueDate": "2026-09-15"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created
