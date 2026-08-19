# AC-TD-10 · One viewer, different tier per target, one session

**Trace:** §2.1 consequence 4 (access is evaluated relationship-by-relationship)
**Preconditions:** [fixture](../README.md); Bob is additionally the assigned PP of Colin; same session token for all three requests

## Test 1 — Manager tier over report

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; Manager-line view (reports-to)

## Test 2 — PP tier over assignee

- **inputURL:** `GET /users/colin/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; PP view (assignment)

## Test 3 — Colleague tier over unrelated

- **inputURL:** `GET /users/eve/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; Colleague view — only `s01`, `s10`, `s11` (name only)
