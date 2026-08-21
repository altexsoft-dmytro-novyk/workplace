# AC-M-S06-07 · S6 Risks — Colleague: no read path (negative)

**Trace:** §3.2 S6 / Colleague `—` · §9 DoD

## Scenario

**Given** risk records about Alice exist, and Colin is a plain colleague.

**When** Colin fetches her profile and probes the section directly.

**Then** no surface returns a trace of them.

**Preconditions:** [fixture](../../README.md); Alice's S6 populated

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
- **expectedResult:** `200`; no `s06` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s06`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no risk data
