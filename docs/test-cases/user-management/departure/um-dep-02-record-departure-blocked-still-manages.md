# UM-DEP-02 · Recording a departure is blocked while the subject still manages relations

**Trace:** epics.md Story 5.1 · spine AD-15 ("Recording is blocked while the subject still manages anyone/any department or is anyone's PP, §4.16")

## Scenario

**Given** Bob is Alice's direct manager (Bob holds a `direct` `Relationship` edge over Alice), and Root holds the *record a departure* permission.

**When** Root submits `POST /users/<bobId>/departure` with a future effective date and reason.

**Then** the operation is blocked — Bob still manages at least one person — and no `Departure` row is written.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice reports to Bob.

## Test

- **inputURL:** `POST /users/<bobId>/departure`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "effectiveDate": "2099-01-01", "reason": "resignation" }
  }
  ```
- **expectedResult:** `409`; no `Departure` row created for Bob.
