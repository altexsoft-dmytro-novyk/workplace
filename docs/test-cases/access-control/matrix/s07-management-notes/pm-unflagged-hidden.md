# AC-M-S07-04 · S7 — unflagged note invisible to a PM (DoD negative)

**Trace:** §3.2 S7 PM exception · §3.3.2 · §2.1 (the one documented exception) · §9 DoD

## Scenario

**Given** Pete is Alice's PM — a full Manager for every section except this one — and an unflagged note about her exists.

**When** he requests her notes section and probes the note directly.

**Then** he gets zero trace of it: a PM reads only notes explicitly flagged for PMs.

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
- **expectedResult:** `200` empty list or `404` — absent without trace

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
