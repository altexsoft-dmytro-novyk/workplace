# AC-M-S14-09 · S14 Action items — PP: create

**Trace:** §3.2 S14 / PP `RW` · §4.5

## Scenario

**Given** Paula noticed Alice's emergency contacts are stale.

**When** she creates an action item asking Alice to update them.

**Then** it is created — PP creates items for the people she partners.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /action-items`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "assignee": "alice",
      "title": "Update emergency contacts",
      "dueDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `201`
