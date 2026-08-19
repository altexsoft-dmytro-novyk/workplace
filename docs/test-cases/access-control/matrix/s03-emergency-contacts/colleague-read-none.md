# AC-M-S03-07 · S3 Emergency contacts — Colleague: no read path (negative)

**Trace:** §3.2 S3 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md); Alice's S3 populated

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
- **expectedResult:** `200`; no `s03` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s03`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no S3 data in the body
