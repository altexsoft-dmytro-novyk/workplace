# AC-M-S02-07 · S2 Personal contacts — Colleague: no read path (negative)

**Trace:** §3.2 S2 / Colleague `—` · §3.3.1 · §9 DoD

## Scenario

**Given** Alice's personal contacts are filled in, and Colin is a plain colleague.

**When** Colin fetches her profile and then probes the section directly.

**Then** no surface returns a trace of S2 — the profile has no such key and the direct request is an empty 404.

**Preconditions:** [fixture](../../README.md); Alice's S2 populated

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
- **expectedResult:** `200`; **no `s02` key** in the body

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no S2 data or field names in the body
