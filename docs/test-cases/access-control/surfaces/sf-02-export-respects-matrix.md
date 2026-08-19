# AC-SF-02 · xlsx export contains only entitled columns

**Trace:** §4.1 Export · §3.3.1 (not an export)
**Preconditions:** [fixture](../README.md)

## Test 1 — manager exports mixed scope

- **inputURL:** `GET /users/export?columns=name,grade`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; xlsx rows for Bob's subordinates carry grade values; rows for people he holds only Colleague tier over carry **no value** in that column

## Test 2 — colleague export drops the column

- **inputURL:** `GET /users/export?columns=name,grade`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; the grade column is not in the sheet at all — whitelist columns only
