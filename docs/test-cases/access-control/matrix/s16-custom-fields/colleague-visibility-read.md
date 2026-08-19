# AC-M-S16-07 · S16 — *colleague* visibility: visible to everyone

**Trace:** §3.3.5 (*colleague* — also visible to everyone) · §4.1
**Preconditions:** [fixture](../../README.md); custom field `office-floor`, visibility *colleague*, value set on Alice

## Test 1 — profile

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; `office-floor` with value appears in the colleague view

## Test 2 — list column

- **inputURL:** `GET /users?columns=office-floor`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; column populated — a colleague-visible field works as a list column
