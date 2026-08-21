# AC-M-S14-06 · S14 Action items — creation bounded by access scope

**Trace:** §4.5 (for any person they hold Manager or PP access over)

## Scenario

**Given** Eve is outside Bob's management scope — he is a mere colleague to her.

**When** he tries to create an action item for her.

**Then** 403 — creating items is bounded by the author's Manager/PP scope.

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
- **expectedResult:** `403 Forbidden`; nothing created
