# AC-M-S08-01 · S8 — unshared feedback invisible to the employee (negative)

**Trace:** §3.2 S8 / Self (only records flagged *shared with employee*) · §4.15 (default: management only)
**Preconditions:** [fixture](../../README.md); a feedback record about Alice with default visibility (*management only*)

## Test 1 — section

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200` empty list or `404` — no trace of the record

## Test 2 — direct object probe

- **inputURL:** `GET /users/alice/feedbacks/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `404`
