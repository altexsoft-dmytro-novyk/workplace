# AC-SL-07 · Link expires, default 24 hours

**Trace:** §4.8 bullet 3
**Preconditions:** [fixture](../README.md); Bob created the link at time T with no expiry given; Dave holds the token; test clock controllable

## Test 1 — just before expiry

- **stateChange:** test clock set to T+23h59m
- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; enabled sections returned

## Test 2 — just after expiry

- **stateChange:** test clock set to T+24h01m
- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `4xx` expired; **no section data** in the body
