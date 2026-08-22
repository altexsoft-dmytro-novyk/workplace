# AC-M-S09-05 · S9 Career timeline — UM: delete a wrongly inferred event

**Trace:** §4.9 (correct events the system inferred wrongly) — UM actor, see spec OQ5

## Scenario

**Given** the system wrote a timeline event that is factually wrong.

**When** Bob deletes it.

**Then** the event is gone — manual override exists exactly for correcting bad inferences.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `DELETE /users/alice/events/{wrongInferredId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; event removed from the timeline
