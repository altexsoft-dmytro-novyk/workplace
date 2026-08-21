# AC-M-S15-06 · S15 Request history — Colleague: no access (negative)

**Trace:** §3.2 S15 / Colleague `—` · §9 DoD

## Scenario

**Given** Alice has request history, and Colin is a plain colleague.

**When** Colin fetches her profile and probes the section.

**Then** no trace on any surface.

**Preconditions:** [fixture](../../README.md); Alice has request history

## Test 1 — profile assembly

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; no `s15` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s15`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no request data
