# AC-M-S05-09 · S5 Documents — Colleague: no read path (negative)

**Trace:** §3.2 S5 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md); Alice's S5 populated

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
- **expectedResult:** `200`; no `s05` key

## Test 2 — direct section request

- **inputURL:** `GET /users/alice/sections/s05`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no document names, types, or counts

## Test 3 — direct object probe

- **inputURL:** `GET /users/alice/documents/{knownId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no file content
