# AC-M-S07-EMP · Employee sees only employee-flagged notes

**Trace:** §3.2 S7 · §3.3 fn 3 · §9 DoD

## Scenario

**Given** Alice is the target and a management note exists **without** *visible for employee* flag.

**When** Alice reads management notes.

**Then** the unflagged note is **absent** from the payload — not null, not empty list with placeholder.

**Preconditions:** [fixture](../README.md#canonical-personas); seeded unflagged note on Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; unflagged note id **absent** from items
