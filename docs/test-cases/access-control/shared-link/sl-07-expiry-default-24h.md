# AC-SL-07 · Link expires, default 24 hours

**Trace:** §4.8 bullet 3

## Scenario

**Given** Bob created a link at time T without setting an expiry.

**When** Dave opens it just before and just after the 24-hour mark.

**Then** it works at 23h59 and is dead at 24h01 — the default lifetime is 24 hours.

**Preconditions:** [fixture](../README.md); Bob created the link at time T with no expiry given; test clock controllable

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
