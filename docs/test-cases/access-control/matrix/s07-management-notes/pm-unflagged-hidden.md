# AC-M-S07-04 · S7 — unflagged note invisible to a PM (DoD negative)

**Trace:** §3.2 S7 PM exception · §3.3.2 · §2.1 (the one documented exception) · §9 DoD
**Preconditions:** [fixture](../../README.md); a note about Alice with *visible for PM* off

## Test 1 — section

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    }
  }
  ```
- **expectedResult:** `200` empty list or `404` — absent without trace, though Pete is full Manager line for every other section

## Test 2 — direct object probe

- **inputURL:** `GET /users/alice/notes/{noteId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    }
  }
  ```
- **expectedResult:** `404`
