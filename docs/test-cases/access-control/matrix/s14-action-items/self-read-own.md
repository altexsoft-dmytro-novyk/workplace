# AC-M-S14-01 · S14 Action items — Self: read own items

**Trace:** §3.2 S14 / Self `R (own)` · §4.3 · §4.5
**Preconditions:** [fixture](../../README.md); Alice has a manual item (author Bob) and a campaign-generated item

## Test

- **inputURL:** `GET /users/alice/sections/s14`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; both items with title, description, author, due date, link, status, source (manual/campaign)
