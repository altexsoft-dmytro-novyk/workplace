# AC-M-S09-04 · S9 Career timeline — UM: manually add an event (historical backfill)

**Trace:** §3.2 S9 / Manager line `RW` · §4.9 (PP and UM can edit, delete, add) — **actor is a UM; DM/PM write scope is spec OQ5**
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/timeline-events`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "type": "grade-change",
      "date": "2024-03-01",
      "details": "backfill from headcount Excel"
    }
  }
  ```
- **expectedResult:** `201`; appears in the timeline as a manual entry
