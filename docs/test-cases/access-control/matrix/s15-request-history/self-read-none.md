# AC-M-S15-01 · S15 Request history — Self: no access (negative)

**Trace:** §3.2 S15 / Self `—` · §9 DoD
**Preconditions:** [fixture](../../README.md); Alice was proposed for a request and rejected with feedback

## Test 1 — profile assembly

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; **no `s15` key** — she never learns she was proposed or rejected

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s15`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `404`; no request, status, or feedback data
