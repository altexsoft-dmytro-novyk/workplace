# AC-M-S09-08 · S9 Career timeline — Colleague: no read path (negative)

**Trace:** §3.2 S9 / Colleague `—` · §9 DoD

## Scenario

**Given** Alice's timeline is populated, and Colin is a plain colleague.

**When** Colin fetches her profile and probes the section.

**Then** no surface returns a trace of her career history.

**Preconditions:** [fixture](../../README.md); Alice's timeline populated

## Test 1 — profile assembly

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; no `s09` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/events`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no events in body
