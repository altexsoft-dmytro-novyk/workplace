# AC-M-S09-02 · S9 Career timeline — Self: write denied

**Trace:** §3.2 S9 / Self `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/timeline-events`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "type": "grade-change",
      "date": "2026-01-01"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created
