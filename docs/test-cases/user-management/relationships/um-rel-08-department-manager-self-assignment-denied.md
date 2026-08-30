# UM-REL-08 · Self-assignment as department manager is rejected

**Trace:** epics.md Story 4.3 · spine AD-8

## Scenario

**Given** Department B has no manager, and Root holds the *change organisational relationships* permission.

**When** Root submits `POST /departments/<deptBId>/manager` with `{ value: <rootId> }` (Root naming themselves).

**Then** self-assignment is rejected and Department B's manager remains unset.

**Preconditions:** [fixture](../README.md#canonical-personas); Department B exists with no manager.

## Test

- **inputURL:** `POST /departments/<deptBId>/manager`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "value": "<rootId>" }
  }
  ```
- **expectedResult:** `403`; no `Department.managerId` change and no journal row committed.
