# AC-SL-04 · S1 identity card is on by default

**Trace:** §3.2 S1 shared-link cell (on by default)

## Scenario

**Given** Bob created a default link for Eve without picking any sections.

**When** Dave — who has no access relationship to Eve — opens it.

**Then** the identity card is there: S1 is included by default.

**Preconditions:** [fixture](../README.md); Bob created a link for Eve with defaults (`POST /share-links {employee: eve}`); Dave holds no Manager/PP relation to Eve

## Test

- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; body contains `s01` although Bob selected nothing at creation
