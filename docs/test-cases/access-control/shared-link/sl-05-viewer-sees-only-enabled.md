# AC-SL-05 · Link viewer sees exactly the enabled sections

**Trace:** §4.8 bullet 1 · §3.3.1 (strictness across surfaces)
**Preconditions:** [fixture](../README.md); Bob created a link for Alice with sections [s01, s04]; Dave holds no Manager/PP relation to Alice

## Test 1 — whole view

- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; body contains `s01` and `s04` **only** — no other section key, whatever exists on the profile

## Test 2 — direct probe of a non-enabled section

- **inputURL:** `GET /share/{token}/sections/s06`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `404`; no S6 data in the body
