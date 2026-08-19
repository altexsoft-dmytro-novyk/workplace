# AC-M-S09-05 · S9 Career timeline — UM: delete a wrongly inferred event

**Trace:** §4.9 (correct events the system inferred wrongly) — UM actor, see spec OQ5
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `DELETE /users/alice/timeline-events/{wrongInferredId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; event removed from the timeline
