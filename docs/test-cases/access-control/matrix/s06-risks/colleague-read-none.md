# AC-M-S06-07 · S6 Risks — Colleague: no read path (negative)

**Trace:** §3.2 S6 / Colleague `—` · §9 DoD
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
