# AC-SL-05 · Link viewer sees exactly the enabled sections

**Trace:** §4.8 bullet 1 · §3.3.1 (strictness across surfaces)

## Scenario

**Given** Bob shared Alice's profile with only S1 and S4 enabled, and Dave holds the token.

**When** Dave opens the link and also probes a non-enabled section directly.

**Then** he sees exactly the two enabled sections; the direct probe returns an empty 404 — the link is a whitelist.

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

- **inputURL:** `GET /share/{token}/risks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `404`; no S6 data in the body
