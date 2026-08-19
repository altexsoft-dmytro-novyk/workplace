# AC-M-S14-06 · S14 Action items — creation bounded by access scope

**Trace:** §4.5 (for any person they hold Manager or PP access over)
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
      "assignee": "eve",
      "title": "X",
      "dueDate": "2026-09-15"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created — Bob is colleague-tier to Eve
