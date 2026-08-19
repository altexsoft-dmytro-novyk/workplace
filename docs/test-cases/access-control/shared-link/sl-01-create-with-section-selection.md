# AC-SL-01 · Manager creates a link with per-section selection

**Trace:** §4.8 bullet 1 (per section, per the cfg column of §3.2)
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `POST /share-links`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "employee": "alice",
      "sections": [
        "s01",
        "s04",
        "s09"
      ]
    }
  }
  ```
- **expectedResult:** `201`; returns token; stored link carries exactly `s01, s04, s09`
