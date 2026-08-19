# AC-M-S13-09 · S13 Mentorship — Colleague: no read path (negative)

**Trace:** §3.2 S13 / Colleague `—` · §4.11 (header mentor is for Manager line and PP) · §9 DoD
**Preconditions:** [fixture](../../README.md); Alice's S13 populated

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
- **expectedResult:** `200`; no `s13` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s13`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no flag, pair, or history data
