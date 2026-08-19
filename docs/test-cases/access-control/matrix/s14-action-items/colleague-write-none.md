# AC-M-S14-11 · S14 Action items — Colleague: no write path (negative)

**Trace:** §3.2 S14 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md)

## Test 1 — creating for Alice

- **inputURL:** `POST /action-items`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "assignee": "alice",
      "title": "X",
      "dueDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created

## Test 2 — completing Alice's item

- **inputURL:** `POST /action-items/{aliceItemId}/complete`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; unchanged — only the assignee (or Manager/PP) touches the item
