# AC-SF-05 · Inline list editing writes through the same matrix

**Trace:** §4.1 inline editing (subject to the access matrix) · §3.3.1
**Preconditions:** [fixture](../README.md)

## Test 1 — manager writes through

- **inputURL:** `PATCH /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "grade": "M2"
    }
  }
  ```
- **expectedResult:** `200`; profile S4 reflects the change — same write path as the profile

## Test 2 — colleague-tier target

- **inputURL:** `PATCH /users/eve/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "grade": "M2"
    }
  }
  ```
- **expectedResult:** `404`; unchanged — the cell is `—` for Bob w.r.t. Eve

## Test 3 — self R cell

- **inputURL:** `PATCH /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "grade": "M9"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged — Self is R on S4 regardless of surface
