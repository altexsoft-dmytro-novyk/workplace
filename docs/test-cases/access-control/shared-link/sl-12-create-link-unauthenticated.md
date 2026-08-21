# AC-SL-12 · Create link without authorization

**Trace:** §4.8 · global auth rule (README)

## Scenario

**Given** a request arrives with no credentials.

**When** it tries to create a share link.

**Then** 401 before anything else; no link is created (whether **opening** a link needs auth is spec OQ2 — undecided).

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
- **expectedResult:** `401 Unauthorized`; no link created
