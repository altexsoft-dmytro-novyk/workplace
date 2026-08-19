# AC-M-S14-05 · S14 Action items — Manager line: create within access scope

**Trace:** §3.2 S14 / Manager line `RW` · §4.5
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /action-items`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "assignee": "alice",
      "title": "Complete security training",
      "dueDate": "2026-09-15"
    }
  }
  ```
- **expectedResult:** `201`
