# AC-M-S16-07 · S16 — *colleague* visibility: visible to everyone

**Trace:** §3.3.5 (*colleague* — also visible to everyone) · §4.1

## Scenario

**Given** the custom field `office-floor` carries *colleague* visibility and Alice has a value.

**When** Colin opens her profile and also puts the field on the employee list as a column.

**Then** he sees the value in both places — colleague visibility makes a field public to every authenticated user, list included.

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
- **expectedResult:** `200`; column populated
