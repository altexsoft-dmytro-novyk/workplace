# AC-M-S14-05 · S14 Action items — Manager line: create within access scope

**Trace:** §3.2 S14 / Manager line `RW` · §4.5

## Scenario

**Given** Bob wants Alice to complete a security training.

**When** he creates an action item for her with a due date.

**Then** it is created — she is within his Manager access scope.

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
