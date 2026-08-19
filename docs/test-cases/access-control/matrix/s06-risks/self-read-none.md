# AC-M-S06-01 · S6 Risks — Self: no read path, ever (critical negative)

**Trace:** §3.2 S6 / Self `—` · §4.3 · §4.6 (never visible to the employee) · §9 DoD
**Preconditions:** [fixture](../../README.md); Alice's S6 holds a `high` risk with history

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
- **expectedResult:** `200`; **no `s06` key** anywhere in the body

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s06`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `404`; no level, trend, description, or history

## Test 3 — list surface

- **inputURL:** `GET /users?columns=name,riskLevel`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; her own row carries no `riskLevel` key — own risk leaks through no surface
