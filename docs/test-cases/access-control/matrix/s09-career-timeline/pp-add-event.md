# AC-M-S09-07 · S9 Career timeline — PP: manually add an event

**Trace:** §3.2 S9 / PP `RW` · §4.9
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/timeline-events`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "type": "department-change",
      "date": "2025-06-01"
    }
  }
  ```
- **expectedResult:** `201`
