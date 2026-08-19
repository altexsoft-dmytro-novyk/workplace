# AC-M-S07-01 · S7 — unflagged note invisible to the employee (DoD negative)

**Trace:** §3.2 S7 / Self · §3.3.2 (*visible for employee* off by default) · §9 DoD
**Preconditions:** [fixture](../../README.md); Bob created a note about Alice, both flags off

## Test 1 — section

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200` with an empty record list **or** `404` — either way zero trace: no id, no count, no author, no fragment

## Test 2 — direct object probe

- **inputURL:** `GET /users/alice/notes/{noteId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `404`; no note data
