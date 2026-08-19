# AC-M-S13-06 · S13 Mentorship — Manager line: end a pair (feedback required)

**Trace:** §3.2 S13 / Manager line `RW` · §4.11
**Preconditions:** [fixture](../../README.md)

## Test 1 — without feedback

- **inputURL:** `DELETE /mentorship-pairs/{id}`
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

- **inputURL:** `DELETE /mentorship-pairs/{id}`
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
