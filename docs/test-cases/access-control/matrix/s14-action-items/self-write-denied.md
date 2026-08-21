# AC-M-S14-02 · S14 Action items — Self: no edits beyond completion

**Trace:** §3.2 S14 / Self `R (own)` · §4.5 (cancel is the author's act)

## Scenario

**Given** Alice has an open action item.

**When** she tries to move its due date, then to cancel it.

**Then** both fail 403 — her only write is marking it complete (AC-M-S14-03); cancelling belongs to the author.

**Preconditions:** [fixture](../../README.md)

## Test 1 — editing

- **inputURL:** `PATCH /action-items/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "dueDate": "2027-01-01"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged

## Test 2 — cancelling

- **inputURL:** `POST /action-items/{id}/cancel`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "reason": "…"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; item remains open
