# AC-M-S13-06 · S13 Mentorship — Manager line: end a pair (feedback required)

**Trace:** §3.2 S13 / Manager line `RW` · §4.11

## Scenario

**Given** an active mentorship pair has run its course.

**When** Bob tries to end it without feedback, then again with final feedback.

**Then** the first attempt is rejected — a pair cannot close without final feedback; the second succeeds, records the end date, keeps the pair in history and writes an end event to the career timeline.

**Preconditions:** [fixture](../../README.md)

**[Route note — not fully resolved]** This scenario's feedback-gated ending and "kept in history on both profiles" go beyond the bare `Relationship.type='mentorship'` fact (spine AD-11), which today is hard-deleted with no history of its own — history for the *fact* lives only in `UserEvents.mentorship_end` (career timeline), not a queryable pairs-with-feedback list. That richer workflow is explicitly the future `mentorship` context (spine Deferred), not decided yet. `DELETE /users/alice/relationships/{id}` below is the fact-level revoke; whether the feedback-validation gate lives in that same call or a richer `mentorship` endpoint is an open question for when that context is confirmed.

## Test 1 — without feedback

- **inputURL:** `DELETE /users/alice/relationships/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `4xx` rejected — a pair cannot be ended without final feedback

## Test 2 — with feedback

- **inputURL:** `DELETE /users/alice/relationships/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "finalFeedback": "goals met"
    }
  }
  ```
- **expectedResult:** `200`; end date recorded; pair visible in history on both profiles; end event written to S9
