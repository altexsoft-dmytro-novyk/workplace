# AC-M-S04-07 · S4 Employment — Colleague: no read path (negative)

**Trace:** §3.2 S4 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md); Alice's S4 populated

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
- **expectedResult:** `200`; no `s04` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no S4 data in the body
