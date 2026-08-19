# AC-M-S09-08 · S9 Career timeline — Colleague: no read path (negative)

**Trace:** §3.2 S9 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md); Alice's timeline populated

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
- **expectedResult:** `200`; no `s09` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s09`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no events in body
