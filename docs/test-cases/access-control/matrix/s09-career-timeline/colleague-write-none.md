# AC-M-S09-09 · S9 Career timeline — Colleague: no write path (negative)

**Trace:** §3.2 S9 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin has no standing over Alice.

**When** he tries to add an event to her timeline.

**Then** 404 — for him the section does not exist.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/timeline-events`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "type": "grade-change",
      "date": "2026-01-01"
    }
  }
  ```
- **expectedResult:** `404`; nothing created
