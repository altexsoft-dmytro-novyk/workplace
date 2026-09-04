# UM-REL-13 · Change a department's manager

**Trace:** epics.md Story 4.3 · PRD FR-10 · access-control.md §2.1 (Department management → Reporting line), §3.3 (rejects self-assignment), §3.4 · [database-schema.md](../../../architecture/database-schema.md) §Policies (line 203 — the Unit-Manager attachment is `targetType:'department'`, `targetRole:'unit-manager'`), §AccessJournal · api-conventions.md shape 4 (`POST /users/:id/policies {type:'AR', targetType, targetId, targetRole}`) · AD-10 · AD-19 · PM/AD-29 `AccessJournal`

> **Split-gate (2026-09-03). The BLOCKED box is removed.** The department-manager
> **edge write** (an AR `Policies` row + `UserPolicies` link) and its
> same-transaction `department_manager` `AccessJournal` row are **first-class
> stage-2 assertions**. `AccessJournalKind` includes `department_manager`; Story
> 4.1 built the table + writer + read endpoint. The `Policies` polymorphic
> `targetType` column stores `'department'` rows today (schema-accepted).
>
> **Deferred — `um-rel-13` in its entirety, as `it.todo`:** *"Nina gains
> Reporting-line access to every member of Department B **and its nested
> departments** (Alice, plus Department C's members) on the next request; Bob
> loses it."* This is the **recursive department-tree walk** —
> `AudienceResolverService` has no `targetType:'department'` policy leg and no
> `Department.parentId` recursion (fail-closed, AD-12). It is an
> **Access-Control-kernel increment** (`spec-access-control-kernel-mvp`, approver
> Anna Pikula), not User-Management work. **Single documented unblock trigger:**
> *"the AC `resolveAudiences` walk for `targetType:'department'` +
> `Department.parentId` recursion reaches stage-3-production
> (`spec-access-control-kernel-mvp`)."* The manager-edge **write** + journal row
> do **not** wait on it.

## Scenario-stage decisions (for the human gate)

- **Route shape (department-manager).** **Recommendation:**
  `PUT /departments/:deptId/manager { managerUserId, expectedCurrentManagerId? }`
  and `DELETE /departments/:deptId/manager` — a fixed-cardinality fact (0-or-1
  manager per department), mirroring the PP atomic shape (`um-rel-09`), reading
  as *"the department's manager"* rather than *"a user's policy"*. **Flag:**
  there is **no `/departments` resource root today** (departments are
  import-created — `seed/`, no CRUD surface); the Department-edge contract must
  ratify `/departments/:deptId/manager` as the first `/departments` route. The
  **fallback already in `api-conventions.md` shape 4** is
  `POST /users/:managerId/policies { type: 'AR', targetType: 'department',
  targetId: <deptId>, targetRole: 'unit-manager' }` + `DELETE
  /users/:managerId/policies/:policyId`. **The storage is identical either way**
  (an AR `Policies` row + a `UserPolicies` link); only the URL differs. This test
  asserts against the `PUT /departments/:deptId/manager` shape as the
  recommendation; stage-2 authors rebind the placeholder if the contract picks
  the `/policies` form.
- **`Policies` row exact shape** (confirmed: `database-schema.md` line 203 + the
  `Policies_row_shape_check` CHECK in migration
  `20260831070000_access_control_functional_roles`):
  ```
  Policies { operator: '==', targetType: 'department', targetId: <deptId>,
             targetRole: 'unit-manager', type: 'AR', managedBy: 'admin' }
  ```
  plus `UserPolicies { userId: <managerUserId>, policyId }`. The AR row-shape
  CHECK (`type='AR' AND targetType IS NOT NULL AND targetId IS NOT NULL`) is
  satisfied; `targetRole` is legal on an AR row (the role-key partial unique
  index is `WHERE type='FR'` only). `managedBy: 'admin'` — a platform-screen
  assignment, not TimeTracker `'sync'`.
- **`department_manager` journal `before`/`after`.** Manager user-id snapshots.
  **Assign over an existing manager** → `before: { managerUserId: <bobId>,
  policyId: <oldPolicyId> }`, `after: { managerUserId: <ninaId>, policyId:
  <newPolicyId> }`. **First assignment** → `before: null`, `after: {
  managerUserId: <ninaId>, policyId }`. **Removal** → `before: { managerUserId:
  <ninaId>, policyId }`, `after: null`.
- **Reassignment mechanics.** A `PUT` that names a new manager while a
  `unit-manager` AR policy for that department already exists: hard-delete the
  old `Policies` row + its `UserPolicies` link, insert the new pair, write one
  `department_manager` journal row — all one transaction. `expectedCurrentManagerId`,
  when supplied and not matching the current manager → `409` (optimistic
  concurrency, same pattern as `um-rel-11`).
- **`idempotencyKey`** extends Story 4.1 / `um-rel-15`:
  `hash(actorUserId, <deptId>, 'department_manager',
  after.policyId ?? before.policyId, operation)`,
  `operation ∈ {'assign','remove'}`.

## Scenario

**Given** Department B's manager is Bob (an AR `Policies` row `targetType:
'department'`, `targetId: <deptBId>`, `targetRole: 'unit-manager'`, linked to Bob
via `UserPolicies`), Department B contains Alice and a nested Department C, and
Root holds the *change organisational relationships* permission
(`org:relationships:write`).

**When** Root changes Department B's manager to Nina —
`PUT /departments/<deptBId>/manager { managerUserId: <ninaId>,
expectedCurrentManagerId: <bobId> }`.

**Then** the response is `200` and, **in one transaction**:

- Bob's `unit-manager` AR `Policies` row for Department B (and its `UserPolicies`
  link) is hard-deleted; a new `unit-manager` AR `Policies` row for Department B
  is created and linked to Nina;
- **one `AccessJournal` row commits in the same transaction** (PM/AD-29, AD-19):
  `kind: 'department_manager'`, `actorUserId: <rootId>`, `subjectUserId:
  <deptBId>` *(the department is the subject of a manager-edge change —
  flagged below)*, `before: { managerUserId: "<bobId>" }`, `after: {
  managerUserId: "<ninaId>" }`, `occurredAt` set, `idempotencyKey` derived per
  the note above. Append-only (`um-rel-15`).

> **Flag — `subjectUserId` on a `department_manager` journal row.** The
> `AccessJournal.subjectUserId` FK is to `User`. A department-manager change has
> no single `User` subject — its subject is the **department**. Options: (a) a
> `subjectDepartmentId` column added to `AccessJournal` (schema change, the
> cleanest); (b) store the new manager's user id as `subjectUserId` and the
> `targetId` (deptId) in `before`/`after`; (c) store the actor twice. This test
> asserts option (b) as the interim (no schema change) and flags the
> `subjectDepartmentId` column for the architect + the Department-edge contract.

**Deferred (`it.todo`):** on the next request after the change commits, Nina
resolves Reporting-line access to every member of Department B **and its nested
departments** (Alice, plus Department C's members); Bob does not. Gated on the AC
`resolveAudiences` `targetType:'department'` + `Department.parentId` recursion
reaching stage-3-production.

**Preconditions:** [fixture](../README.md#canonical-personas); Department B has
manager Bob and contains Alice + nested Department C; Nina is an active `User`;
Root holds *change organisational relationships*.

## Test

- **Test 1 — baseline: Bob's `unit-manager` AR policy for Department B exists** —
  exactly one `Policies` row `type: 'AR'`, `targetType: 'department'`, `targetId:
  <deptBId>`, `targetRole: 'unit-manager'`, linked to Bob via `UserPolicies`.
- **Test 2 — the change**
  - **inputURL:** `PUT /departments/<deptBId>/manager`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "managerUserId": "<ninaId>", "expectedCurrentManagerId": "<bobId>" }
    }
    ```
  - **expectedResult:** `200`.
  - **stateChange:** stage 2 asserts, in one committed transaction:
    - `Policies` + `UserPolicies`: exactly one `unit-manager` AR row for `targetId: <deptBId>`, linked to Nina; Bob's prior row and link are gone.
    - `AccessJournal`: exactly one new row — `kind: 'department_manager'`, `actorUserId: <rootId>`, `before.managerUserId: <bobId>`, `after.managerUserId: <ninaId>`, `occurredAt` non-null, `idempotencyKey` non-null and unique.
- **Test 3 — deferred `it.todo`: recursive department-tree access follows the
  manager change** —
  `it.todo('Nina resolves Reporting-line access to Alice and every member of Department B and its nested Department C on the next request, Bob does not — needs the AC recursive resolveAudiences targetType:\'department\' + Department.parentId walk (spec-access-control-kernel-mvp)')`.
  Target end-state prose retained above.
