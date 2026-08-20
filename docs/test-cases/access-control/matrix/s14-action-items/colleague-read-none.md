# AC-M-S14-10 · S14 Action items — Colleague: no read path (negative)

**Trace:** §3.2 S14 / Colleague `—` · §9 DoD

## Scenario

**Given** Alice has action items, and Colin is a plain colleague.

**When** Colin fetches her profile and probes the section.

**Then** no trace of her tasks on any surface.

**Preconditions:** [fixture](../../README.md); Alice has items

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
- **expectedResult:** `200`; no `s14` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s14`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no item data
