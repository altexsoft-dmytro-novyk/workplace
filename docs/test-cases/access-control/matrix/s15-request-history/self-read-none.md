# AC-M-S15-01 · S15 Request history — Self: no access (negative)

**Trace:** §3.2 S15 / Self `—` · §9 DoD

## Scenario

**Given** Alice was proposed for a resourcing request and rejected with written feedback.

**When** she checks her own profile and probes the section directly.

**Then** no trace — an employee never learns they were proposed or rejected.

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
- **expectedResult:** `200`; **no `s15` key**

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
