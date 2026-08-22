# AC-M-S13-08 · S13 Mentorship — PP: create a pair

**Trace:** §3.2 S13 / PP `RW` · §4.11

## Scenario

**Given** Alice flagged herself open to mentoring.

**When** Paula pairs her with a mentee from the employees available to her.

**Then** the pair is created — PP runs the assignment flow exactly like a manager.

**Preconditions:** [fixture](../../README.md); Alice flagged open-to-mentor

## Test

- **inputURL:** `POST /users/<employee available to Paula>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "type": "mentorship",
      "targetId": "alice"
    }
  }
  ```
- **expectedResult:** `201`
