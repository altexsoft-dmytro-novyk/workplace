# AC-SL-12 · Create link without authorization

**Trace:** §4.8 · global auth rule (README)
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `POST /share-links`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    },
    "body": {
      "employee": "alice"
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; no link created (whether **opening** a link requires auth is spec OQ2 — no scenario until answered)
