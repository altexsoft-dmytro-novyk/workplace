# UM-REL-07 · Holder of the dedicated permission changes a department's manager

**Trace:** epics.md Story 4.3 · FR-10 · spine AD-6, AD-7, AD-25

## Scenario

**Given** Department B has no manager, and Root holds the *change organisational relationships* permission.

**When** Root submits `POST /departments/<deptBId>/manager` with `{ value: <ninaId> }`.

**Then** the response is `200`, `Department.managerId` is now Nina, and the journal records `fieldType: 'department_manager'`, `beforeValue: null`, `afterValue: <ninaId>`.

**Preconditions:** [fixture](../README.md#canonical-personas); Department B exists with no manager; Alice belongs to Department B.

## Test

- **Test 1 — the change**
  - **inputURL:** `POST /departments/<deptBId>/manager`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "value": "<ninaId>" }
    }
    ```
  - **expectedResult:** `201`; body `{ departmentId: "<deptBId>", managerId: "<ninaId>" }`.
- **Test 2 — Nina receives Reporting-line access to Department B's members on the next request**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Nina>" } }`
  - **expectedResult:** `200` — Nina, now Department B's manager, has S9 read access to Alice (a Department B member) through the Reporting-line audience.
