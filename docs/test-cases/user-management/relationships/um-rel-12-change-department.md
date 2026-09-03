# UM-REL-12 · Change an employee's department (membership move)

**Trace:** epics.md Story 4.3 (Change Employee Department or Department Manager) · PRD FR-10 · requirements §4.17 (an employee holds **one or more** current `DepartmentMembership` rows; amended 2026-09-02) · access-control.md §2.1 (Department management is a Reporting-line relation), §3.4 (Relationship and access journal) · api-conventions.md shape 4 · [database-schema.md](../../../architecture/database-schema.md) §Project/Department, §AccessJournal · AD-11 (same-tx event) · AD-19 · PM/AD-29 `AccessJournal`

> **Split-gate (2026-09-03). The BLOCKED box is removed.** The department
> **membership write**, the same-transaction `department_change` `UserEvents`
> row, and the same-transaction `department_membership` `AccessJournal` row are
> **first-class stage-2 assertions**. Schema is present on `dn-um-implementation`:
> `Department.parentId` (self-relation `DeptTree`, `onDelete: Restrict`),
> `DepartmentMembership` (temporal `validFrom`/`validTo`, partial `UNIQUE
> (userId, departmentId) WHERE validTo IS NULL`), `AccessJournalKind` includes
> `department_membership`, and Story 4.1 built the `AccessJournal` table + the
> same-transaction writer + `GET /users/:id/access-journal` (migration
> `20260903011657_story_4_1_access_journal`). CC-07 / PM/AD-29 is **done**.
>
> **Still deferred — one clause only, as an `it.todo`:** Test 3's *"Department
> B's manager gains Reporting-line access to Alice on the next request /
> Department A's manager loses it"* — the access **resolution** consequence.
> Today `department`-targeted policy rows contribute **nothing** to tier
> resolution (fail-closed, AD-12): `AudienceResolverService` walks `reporting`
> and `pp` from `Relationship` rows only, with no `targetType:'department'`
> policy leg and no `Department.parentId` recursion. That walk is an
> **Access-Control-kernel increment** (`spec-access-control-kernel-mvp`, approver
> Anna Pikula), **not** User-Management work. **Single documented unblock
> trigger:** *"the AC `resolveAudiences` walk for `targetType:'department'` +
> `Department.parentId` recursion reaches stage-3-production
> (`spec-access-control-kernel-mvp`)."*

## Scenario-stage decisions (for the human gate)

- **Multi-membership "move" semantics.** §4.17 (amended 2026-09-02): an employee
  holds **one or more** current memberships. A **move** = **end the named source
  membership** (`validTo = today` on that current row) **+ add the target**
  (insert `{ validFrom: today, validTo: null }`), atomically in one transaction.
  It is **not** "replace the sole membership" — the source is named explicitly
  (`fromDepartmentId` in the request body), because the employee may hold
  several. A plain **add** and a plain **remove** are first-class too
  (`um-rel-17`). **Recommendation: named-source atomic move.**
- **Route shape (membership).** `POST /users/:id/departments { departmentId,
  fromDepartmentId? }` to add or move; `DELETE /users/:id/departments/:departmentId`
  to remove. `DepartmentMembership` is its own temporal table — a **set**, not a
  `Relationship` row and not a fixed-cardinality edge — so it is an owned
  collection (`/users/:id/events`, `/users/:id/departures` family), **not**
  `/users/:id/relationships/department`. When `fromDepartmentId` is present the
  `POST` is the atomic move (end source + add target); when absent it is a plain
  add. **Flag:** this differs from DEC-UM-005's explicit `DELETE`-then-`POST` for
  the `direct` edge — justified because the ≥1-department floor (decision below)
  makes `DELETE`-then-`POST` impossible when the employee has only one
  department. The Department-edge contract ratifies the final shape.
- **≥1 department floor.** §4.17 says "one or more". **Recommendation: ≥1
  enforced** — `DELETE` of an employee's **last** current membership → `409`
  (leak-safe body: "employee must belong to at least one department; assign
  another before removing this one"). A move never passes through zero.
  Flagged alternative: allow a transient zero-membership state — rejected
  (resourcing routing and §4.17 assume ≥1).
- **`department_change` event `details`.** New-value-only, mirroring
  `position_change` (Dmytro, Epic 3): an **add** (and the target side of a
  **move**) → `{ "department": <departmentId> }` (the uuid; the name is a
  render-time lookup). A **remove** → `{ "department": <departmentId>,
  "removed": true }` (`removed: true` is the discriminator — there is no "new
  value" for a removal). A **move** emits **one** `department_change` event in
  the add form `{ "department": <targetDepartmentId> }` (a move is semantically
  "changed to B", exactly like a position change); the source-membership end is
  carried in the journal `before`. Flagged alternative: symmetric
  `"change": "added" | "removed"` on every event with a move emitting two events
  — rejected for `position_change` consistency.
- **`department_membership` journal `before`/`after`.** Dept-id snapshots:
  `{ departmentId: <id> }` or `null`. **Move** → `before: { departmentId:
  <sourceId> }`, `after: { departmentId: <targetId> }` (one row). Plain **add**
  → `before: null`, `after: { departmentId: <newId> }`. Plain **remove** →
  `before: { departmentId: <id> }`, `after: null`.
- **`idempotencyKey` derivation** extends Story 4.1 / `um-rel-15`:
  `hash(actorUserId, subjectUserId, 'department_membership',
  after.membershipId ?? before.membershipId, operation)`,
  `operation ∈ {'add','remove','move'}`. Same expiry trigger.

## Scenario

**Given** Alice holds exactly one current `DepartmentMembership` — Department A —
Departments A and B each have a manager, and Root holds the *change
organisational relationships* permission (`org:relationships:write`).

**When** Root moves Alice from Department A to Department B from the dedicated
organisational-relationship screen —
`POST /users/<aliceId>/departments { departmentId: <deptBId>,
fromDepartmentId: <deptAId> }`.

**Then** the response is `200` and, **in one transaction**:

- Alice's Department A membership row is closed (`validTo = today`) and a new
  Department B membership row is created (`validFrom = today`, `validTo = null`);
  a subsequent read shows Alice with a current membership in B and not in A;
- **one `department_change` `UserEvents` row** is appended synchronously in the
  same transaction (AD-11 / Epic 3 mechanism): `type: 'department_change'`,
  `source: 'system'`, `eventDate` = today's UTC date, `details: { "department":
  "<deptBId>" }`, `createdBy: <rootId>`;
- **one `AccessJournal` row commits in the same transaction** (PM/AD-29, AD-19):
  `kind: 'department_membership'`, `actorUserId: <rootId>`, `subjectUserId:
  <aliceId>`, `before: { departmentId: "<deptAId>" }`, `after: { departmentId:
  "<deptBId>" }`, `occurredAt` set, `idempotencyKey` derived per the note above.
  The row is append-only (`um-rel-15`).

**Deferred (`it.todo`):** on the next request after the move commits, Department
B's manager resolves Reporting-line access to Alice and Department A's manager
loses it. Gated on the AC `resolveAudiences` `targetType:'department'` +
`Department.parentId` walk reaching stage-3-production.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has exactly
one current membership (Department A); Departments A and B each have a manager;
Root holds *change organisational relationships*.

## Test

- **Test 1 — baseline** — Alice has one current `DepartmentMembership` for
  Department A and none for Department B.
- **Test 2 — the move**
  - **inputURL:** `POST /users/<aliceId>/departments`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "departmentId": "<deptBId>", "fromDepartmentId": "<deptAId>" }
    }
    ```
  - **expectedResult:** `200`; body reflects the new Department B membership.
  - **stateChange:** stage 2 asserts, in one committed transaction:
    - `DepartmentMembership`: the Department A row for Alice has `validTo = today`; exactly one current (`validTo IS NULL`) row for Alice, `departmentId: <deptBId>`.
    - `UserEvent`: exactly one new row — `type: 'department_change'`, `source: 'system'`, `details: { "department": "<deptBId>" }`, `createdBy: <rootId>`, `eventDate` = today's UTC date.
    - `AccessJournal`: exactly one new row — `kind: 'department_membership'`, `actorUserId: <rootId>`, `subjectUserId: <aliceId>`, `before.departmentId: <deptAId>`, `after.departmentId: <deptBId>`, `occurredAt` non-null, `idempotencyKey` non-null and unique.
- **Test 3 — deferred `it.todo`: department-derived access follows the move** —
  `it.todo('Department B\'s manager resolves Reporting-line access to Alice on the next request, Department A\'s manager loses it — needs the AC resolveAudiences targetType:\'department\' + Department.parentId walk (spec-access-control-kernel-mvp)')`.
  Target end-state prose retained above; not translatable to a green stage-2
  assertion until the unblock trigger fires.
