# AC-M-S07-13 · S7 Management notes — Colleague: no read path (negative)

**Trace:** §3.2 S7 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md); notes about Alice exist, incl. one flagged *visible for employee*

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
- **expectedResult:** `200`; no `s07` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no note data — flags never widen access beyond the audiences they name
