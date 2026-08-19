# AC-SF-06 · Direct request for a forbidden section leaks nothing, not even in the error

**Trace:** §3.3.1 (not an error message) · §3.3.4
**Preconditions:** [fixture](../README.md); Alice has a populated S6 (high risk)

## Test 1 — forbidden section

- **inputURL:** `GET /users/alice/sections/s06`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; body carries no field names, record counts, or data fragments

## Test 2 — nonexistent section, same shape

- **inputURL:** `GET /users/alice/sections/s99`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; status and body **indistinguishable** from Test 1 — hidden data cannot be probed for existence

## Test 3 — validation must not precede authorization

- **inputURL:** `PATCH /users/alice/sections/s06`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "level": 12345
    }
  }
  ```
- **expectedResult:** `404`, not a validation error — the access decision runs before payload validation
