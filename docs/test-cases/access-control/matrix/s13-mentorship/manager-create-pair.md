# AC-M-S13-05 · S13 Mentorship — Manager line: create a pair

**Trace:** §3.2 S13 / Manager line `RW` · §4.11 (mentee from the employees available to that manager)

## Scenario

**Given** Alice flagged herself open to mentoring.

**When** Bob pairs her with a mentee picked from the employees available to him.

**Then** the pair is created and Alice's mentorship status flips to *mentor*.

**Preconditions:** [fixture](../../README.md); Alice flagged open-to-mentor

## Test

- **inputURL:** `POST /users/<employee available to Bob>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "type": "mentorship",
      "targetId": "alice"
    }
  }
  ```
- **expectedResult:** `201`; Alice's mentorship status becomes *mentor*
