# UM-REL-17 · Department membership — add a second, remove one, remove the last

**Trace:** epics.md Story 4.3 (Change Employee Department or Department Manager) · PRD FR-10 · requirements §4.17 (an employee holds **one or more** current `DepartmentMembership` rows; amended 2026-09-02) · access-control.md §2.1, §3.4 · [database-schema.md](../../../architecture/database-schema.md) §Project/Department (partial `UNIQUE (userId, departmentId) WHERE validTo IS NULL`), §AccessJournal · AD-11 (same-tx event) · AD-19 · PM/AD-29 `AccessJournal`

> **First-class stage-2 (2026-09-03).** This file pins the multi-membership
> cases that §4.17's 2026-09-02 amendment created and that the Story 1.1
> decisions explicitly left open. The **membership writes**, the
> same-transaction `department_change` `UserEvents` rows, and the
> same-transaction `department_membership` `AccessJournal` rows are all
> first-class. The **access-resolution** consequence of a membership set change
> (which department managers can see the employee) is the **deferred `it.todo`**
> tracked in `um-rel-12` Test 3 — gated on the AC `resolveAudiences`
> `targetType:'department'` + `Department.parentId` walk reaching
> stage-3-production (`spec-access-control-kernel-mvp`). No access assertion in
> this file.

## Scenario-stage decisions (for the human gate)

- **`add` / `remove` are first-class, alongside `move` (`um-rel-12`).** A plain
  **add** (`POST /users/:id/departments { departmentId }`, no `fromDepartmentId`)
  inserts a new current membership — the employee now holds **both** the existing
  one(s) **and** the new one. A **remove** (`DELETE
  /users/:id/departments/:departmentId`) closes that one current row (`validTo =
  today`) and leaves the others.
- **≥1 department floor — `DELETE` of the last current membership → `409`.**
  §4.17 says "one or more". **Recommendation: ≥1 enforced.** A `DELETE` that
  would leave the employee with **zero** current memberships is rejected `409`
  with a leak-safe body ("employee must belong to at least one department;
  assign another before removing this one"). To change a sole department, use the
  atomic **move** (`um-rel-12`). Flagged alternative: permit a transient
  zero-membership state — rejected (resourcing routing + §4.17 assume ≥1).
- **`DELETE` of a department the employee is not currently a member of → `404`**
  (leak-free — no membership sub-resource to remove). Also covers a
  `departmentId` that exists but has only a **closed** (`validTo` set) membership
  row for this employee.
- **`department_change` event `details`** (per `um-rel-12` decision): **add** →
  `{ "department": "<departmentId>" }` (new value only, `position_change`
  precedent); **remove** → `{ "department": "<departmentId>", "removed": true }`.
- **`department_membership` journal `before`/`after`** (per `um-rel-12`): **add**
  → `before: null`, `after: { departmentId: "<id>" }`; **remove** → `before: {
  departmentId: "<id>" }`, `after: null`.
- **`idempotencyKey`**: `hash(actorUserId, subjectUserId,
  'department_membership', after.membershipId ?? before.membershipId,
  operation)`, `operation ∈ {'add','remove','move'}`.

## Scenario — Test 1: add a second membership (employee now in A and B)

**Given** Alice holds exactly one current `DepartmentMembership` — Department A —
and Root holds *change organisational relationships*.

**When** Root submits `POST /users/<aliceId>/departments { departmentId:
<deptBId> }` (no `fromDepartmentId`).

**Then** the response is `200` and, **in one transaction**: a new
`DepartmentMembership` row is created (`departmentId: <deptBId>`, `validFrom =
today`, `validTo = null`); Alice's Department A membership is **untouched** —
Alice now holds **two** current memberships (A and B); **one `department_change`
`UserEvents` row** — `details: { "department": "<deptBId>" }`, `source:
'system'`, `createdBy: <rootId>` — and **one `AccessJournal` row** — `kind:
'department_membership'`, `before: null`, `after: { departmentId: "<deptBId>" }`,
`actorUserId: <rootId>`, `subjectUserId: <aliceId>` — commit in that same
transaction.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has one
current membership (Department A); Department B exists; Root holds *change
organisational relationships*.

### Test

- **inputURL:** `POST /users/<aliceId>/departments`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "departmentId": "<deptBId>" }
  }
  ```
- **expectedResult:** `200`; body reflects the new Department B membership.
- **stateChange:** stage 2 asserts, in one committed transaction: Alice has
  **two** current (`validTo IS NULL`) `DepartmentMembership` rows — `<deptAId>`
  and `<deptBId>`; exactly one new `UserEvent` (`type: 'department_change'`,
  `details.department: <deptBId>`); exactly one new `AccessJournal` row
  (`kind: 'department_membership'`, `before: null`, `after.departmentId:
  <deptBId>`, `idempotencyKey` non-null and unique).

## Scenario — Test 2: remove one of two (employee still in the other)

**Given** Alice holds two current memberships — Department A and Department B
(Test 1 end-state) — and Root holds *change organisational relationships*.

**When** Root submits `DELETE /users/<aliceId>/departments/<deptBId>`.

**Then** the response is `200` and, **in one transaction**: Alice's Department B
membership row is closed (`validTo = today`); Alice still holds a current
membership in Department A; **one `department_change` `UserEvents` row** —
`details: { "department": "<deptBId>", "removed": true }` — and **one
`AccessJournal` row** — `kind: 'department_membership'`, `before: {
departmentId: "<deptBId>" }`, `after: null` — commit in that transaction.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice holds
current memberships in Departments A and B; Root holds *change organisational
relationships*.

### Test

- **inputURL:** `DELETE /users/<aliceId>/departments/<deptBId>`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `200`; empty body.
- **stateChange:** stage 2 asserts: exactly one current `DepartmentMembership`
  row for Alice (`<deptAId>`); the `<deptBId>` row has `validTo = today`; one new
  `UserEvent` (`details: { "department": "<deptBId>", "removed": true }`); one
  new `AccessJournal` row (`before.departmentId: <deptBId>`, `after: null`).

## Scenario — Test 3: remove the last membership → 409

**Given** Alice holds exactly one current membership — Department A (Test 2
end-state) — and Root holds *change organisational relationships*.

**When** Root submits `DELETE /users/<aliceId>/departments/<deptAId>`.

**Then** the response is **`409`** — an employee must belong to at least one
department (§4.17); the request is refused with a leak-safe body. No membership
row changes, **no `UserEvents` row**, **no `AccessJournal` row**.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice holds
exactly one current membership (Department A); Root holds *change organisational
relationships*.

### Test

- **inputURL:** `DELETE /users/<aliceId>/departments/<deptAId>`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `409`; leak-free body.
- **stateChange:** none. Stage 2 asserts Alice's Department A membership is still
  current (`validTo IS NULL`); no new `UserEvent`; no new `AccessJournal` row for
  `subjectUserId: <aliceId>`.

## Scenario — Test 4: DELETE of a non-membership → 404

**Given** Alice holds a current membership in Department A only, is **not** a
member of Department C, and Root holds *change organisational relationships*.

**When** Root submits `DELETE /users/<aliceId>/departments/<deptCId>`.

**Then** the response is **`404`** (leak-free — there is no membership
sub-resource to remove). No state change, no event, no journal row. Same `404`
if Alice has only a **closed** (`validTo` set) historical membership row for
Department C.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice is not a
current member of Department C; Root holds *change organisational relationships*.

### Test

- **inputURL:** `DELETE /users/<aliceId>/departments/<deptCId>`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `404`; leak-free body.
- **stateChange:** none.

## Deferred (`it.todo`) — department-derived access follows the membership set

`it.todo('adding/removing a DepartmentMembership changes which department managers resolve Reporting-line access to the employee on the next request — needs the AC resolveAudiences targetType:\'department\' + Department.parentId walk (spec-access-control-kernel-mvp)')`
— see `um-rel-12` Test 3 for the single documented unblock trigger.
