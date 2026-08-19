# AC-SL-08 · Expiry is configurable at creation

**Trace:** §4.8 bullet 3 (configurable at creation)
**Preconditions:** [fixture](../README.md); Bob created the link at time T with `expiresIn: 72h`; Dave holds the token; test clock controllable

## Test 1 — outlives the 24h default

- **stateChange:** test clock set to T+48h
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

## Test 2 — expires at the configured time

- **stateChange:** test clock set to T+72h01m
- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `4xx` expired; no section data in the body
