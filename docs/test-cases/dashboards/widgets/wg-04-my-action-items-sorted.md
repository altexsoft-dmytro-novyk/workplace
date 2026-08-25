# DB-WG-04 · My action items widget sorted by due date

**Trace:** §4.4.1 · §4.5 · AD-17

## Scenario

**Given** Bob has open action items assigned to him with various due dates, some of which are past today's date.

**When** Bob fetches data for `my-action-items` widget.

**Then** the returned list contains only Bob's assigned action items, ordered ascending by `dueDate`, with overdue items having `isOverdue: true`.

**Preconditions:** [fixture](../README.md); Bob has 2 action items assigned: Item 1 due yesterday, Item 2 due next week.

## Test

- **inputURL:** `GET /api/widgets/my-action-items/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200 OK`; array of action items sorted by due date:
  ```json
  [
    {
      "id": "<uuid:item-1>",
      "title": "Review Alice CDS",
      "dueDate": "2026-08-24",
      "isOverdue": true,
      "status": "open"
    },
    {
      "id": "<uuid:item-2>",
      "title": "Submit Quarterly Plan",
      "dueDate": "2026-09-01",
      "isOverdue": false,
      "status": "open"
    }
  ]
  ```
