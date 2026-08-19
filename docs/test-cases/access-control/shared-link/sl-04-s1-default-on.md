# AC-SL-04 · S1 identity card is on by default

**Trace:** §3.2 S1 shared-link cell (on by default)
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
