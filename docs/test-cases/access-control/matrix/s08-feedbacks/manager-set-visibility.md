# AC-M-S08-06 · S8 Feedbacks — Manager line: change record visibility

**Trace:** §3.2 S8 / Manager line `RW` · §4.15
**Preconditions:** [fixture](../../README.md); feedback record F2 about Alice exists with default visibility (*management only*)

## Test 1 — baseline: Alice cannot see F2

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; F2 absent (AC-M-S08-01)

## Test 2 — manager shares the record

- **inputURL:** `PATCH /users/alice/feedbacks/{f2}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "visibility": "shared with employee"
    }
  }
  ```
- **expectedResult:** `200`; visibility persisted

## Test 3 — Alice now sees exactly that record

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; F2 present — the flag change is observable to its audience on the next request
