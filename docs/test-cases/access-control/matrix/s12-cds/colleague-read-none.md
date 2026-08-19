# AC-M-S12-09 · S12 CDS — Colleague: no read path (negative)

**Trace:** §3.2 S12 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md); Alice's S12 populated

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
- **expectedResult:** `200`; no `s12` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s12`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no matrix link, assessments, or IDP data
