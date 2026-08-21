# AC-M-S01-03 · S1 Identity card — Self: photo is writable

**Trace:** §3.2 S1 / Self `(photo RW)` · §4.3

## Scenario

**Given** Alice owns her profile photo.

**When** she uploads a new one.

**Then** it succeeds — the photo is the single Self-writable part of S1.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PUT /users/alice/photo`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "file": "<multipart image>"
    }
  }
  ```
- **expectedResult:** `200`; subsequent S1 read returns the new photo
