# AC-M-S06-04 · S6 Risks — Manager line: write

**Trace:** §3.2 S6 / Manager line `RW` · §4.6

## Scenario

**Given** Dave is worried about Alice's workload.

**When** he records a medium risk with a description.

**Then** it becomes the current record and the trend is recalculated against the previous one.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/risks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    },
    "body": {
      "level": "medium",
      "description": "workload concerns",
      "details": "…",
      "date": "2026-08-19"
    }
  }
  ```
- **expectedResult:** `201`; becomes the current record; trend recalculated
