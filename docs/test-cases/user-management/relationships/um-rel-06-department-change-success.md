# UM-REL-06 · Holder of the dedicated permission moves an employee to a different department

**Trace:** epics.md Story 4.3 · FR-10 · spine AD-6, AD-7, AD-19

## Scenario

**Given** Alice belongs to Department A, and Root holds the *change organisational relationships* permission.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ field: 'department', value: <deptBId> }`.

**Then** the response is `200`, Alice belongs to exactly Department B afterward, the journal records `fieldType: 'department'`, `beforeValue: <deptAId>`, `afterValue: <deptBId>`, and a synchronous `department_change` `UserEvents` row is appended to Alice's career timeline in the same transaction (AD-19).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice belongs to Department A; Department B exists.

## Test

- **Test 1 — the change**
  - **inputURL:** `POST /users/<aliceId>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "field": "department", "value": "<deptBId>" }
    }
    ```
  - **expectedResult:** `201`; body `{ field: "department", value: "<deptBId>" }`.
- **Test 2 — observing the department_change career event**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; list includes an entry with `type: "department_change"`, `source: "system"`, `details: { from: <deptAId>, to: <deptBId> }`.
