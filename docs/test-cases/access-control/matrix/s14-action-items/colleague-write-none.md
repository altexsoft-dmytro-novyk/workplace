# AC-M-S14-11 · S14 Action items — Colleague: no write path (negative)

**Trace:** §3.2 S14 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin has no standing over Alice.

**When** he tries to create an item for her, then to complete one of hers.

**Then** both are denied — creation is scope-bounded (403) and her items do not exist for him (404).

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
- **expectedResult:** `404`; unchanged
