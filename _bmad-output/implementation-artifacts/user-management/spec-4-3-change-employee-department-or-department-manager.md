---
title: 'Story 4.3: Change Employee Department or Department Manager'
type: 'feature'
status: done
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-4-context.md']
---

> Compiled 2026-09-01 from epics.md v1.5 — **NEW story** (added by the 2026-08-29
> v1.5 correct course; no pre-v1.5 spec). **NOT an AD-1 approval.**
>
> **Reconciled 2026-09-03 to a split-gate.** Schema recheck on
> `dn-um-implementation`: `Department.parentId` (self-relation `DeptTree`,
> `onDelete: Restrict`), `DepartmentMembership` (temporal, partial `UNIQUE`),
> `Policies.targetType` polymorphic `String?` (stores `'department'` rows),
> `AccessJournalKind` includes `department_membership` **and**
> `department_manager` — all present. CC-07 / PM/AD-29 (`AccessJournal`) is
> **done** via Story 4.1 (table + `AccessJournalKind` enum + same-transaction
> writer + `GET /users/:id/access-journal`, migration
> `20260903011657_story_4_1_access_journal`). The Epic 3 `department_change`
> `UserEvents` mechanism is **done** (Story 3.1, `AddManualUserEventAction` +
> the same-tx write pattern). The `relationships` write area + the
> `org:relationships:write` gate + the same-tx edge+journal co-write pattern are
> built by Stories 4.1/4.2 (`org-relationship.repository.ts`).
>
> **The one hard blocker that remains** is the `AccessControlFacade` /
> `AudienceResolverService` **walk for `targetType:'department'` policy rows +
> `Department.parentId` recursion**. Today `department`-targeted policy rows
> contribute **nothing** to tier resolution (fail-closed, AD-12). That is an
> **Access-Control-kernel increment** (`spec-access-control-kernel-mvp`, approver
> Anna Pikula), **not** User-Management work. So Story 4.3 **splits**: the
> write + fact + journal + event are LIVE; the department-derived **access
> resolution** is a deferred `it.todo`.
>
> `status:` stays `draft` — per-file human approval still required.

## Intent

> **§4.17 amended 2026-09-02:** an employee belongs to **one or more**
> departments (`DepartmentMembership`; `database-schema.md` §Project/Department).
> `department_change` events are **add/remove** events. **This story fixes the
> multi-membership semantics** — the Story 1.1 decisions imported exactly one
> membership per person and explicitly left the rest to this story.

**Problem:** Every employee belongs to **one or more** departments; departments
nest (§4.17, `Department.parentId`). A department change alters Reporting-line
access, routes resourcing requests, emits a career-timeline event, and re-keys
the CDS skills matrix. A department-manager change grants Manager (Reporting
line) access to everyone in that department **and its sub-departments** (§2.1
relation 2). Neither has a write mechanism, and the multi-membership add/remove
semantics are undefined.

**Approach:** Extend the dedicated organisational-relationship screen with
department **membership** assignment and department-**manager** assignment.

- **Membership** — `POST /users/:id/departments { departmentId, fromDepartmentId? }`
  (add, or — with `fromDepartmentId` — an **atomic move**: end the named source
  membership + add the target) and `DELETE /users/:id/departments/:departmentId`
  (remove; a `DELETE` of the employee's **last** current membership → `409`).
  `DepartmentMembership` is a temporal **set** (partial `UNIQUE (userId,
  departmentId) WHERE validTo IS NULL`), so it is an owned collection, **not** a
  `Relationship` row.
- **Manager** — `PUT /departments/:deptId/manager { managerUserId,
  expectedCurrentManagerId? }` + `DELETE /departments/:deptId/manager`
  (recommended shape; `POST /users/:managerId/policies { type:'AR',
  targetType:'department', targetId:<deptId>, targetRole:'unit-manager' }` is the
  `api-conventions.md` fallback — identical storage: an AR `Policies` row + a
  `UserPolicies` link).

Every write goes through `@RequireFeature('org:relationships:write')` (a
no-target `isAllowed` facade check, never a role-name check), **rejects
self-assignment with `400`**, appends a `department_change` `UserEvents` row
**synchronously in the same transaction** (AD-11 / Epic 3), and writes one
`AccessJournal` row in the **same transaction** — `kind: 'department_membership'`
for a membership change, `kind: 'department_manager'` for a manager change.

## Boundaries & Constraints — GATES

- **CC-07 / PM/AD-29 (`AccessJournal`) — DONE (via Story 4.1).** Ratified
  2026-09-02 ("closes CC-07 design"). Story 4.1 built the table, the
  `AccessJournalKind` enum (`department_membership` + `department_manager`
  included), the same-transaction writer, and `GET /users/:id/access-journal`.
  Story 4.3 adds no journal schema; it enrols the two new `kind` values.
  `UserEvents` is **not** a journal substitute.
- **`department_change` `UserEvents` mechanism — DONE (via Epic 3 Story 3.1).**
  The `UserEvent` model has a `department_change` `type` slot; the
  synchronous same-transaction append pattern exists. Story 4.3 emits the fact.
- **Department edge *schema* — PRESENT.** `Department.parentId` (self-relation
  `DeptTree`, `onDelete: Restrict`) and `DepartmentMembership` are in the schema
  (Story 1.1, migration `20260902001941_story_1_1_import_population`). The
  department tree **is** modelled.
- **AC department-resolver walk — STILL DEFERRED (the one hard blocker).**
  `AudienceResolverService` resolves `reporting` and `pp` from `Relationship`
  rows only. There is **no `targetType:'department'` policy leg** and **no
  `Department.parentId` recursion**, so `department`-targeted `Policies` rows
  contribute nothing to tier resolution (fail-closed, AD-12). This walk is an
  **Access-Control-kernel increment** (`spec-access-control-kernel-mvp`,
  approver Anna Pikula), **not this story**. **Single documented unblock
  trigger:** *"the AC `resolveAudiences` walk for `targetType:'department'` +
  `Department.parentId` recursion reaches stage-3-production
  (`spec-access-control-kernel-mvp`)."* It gates exactly the assertions listed
  under I/O DEFERRED below — nothing else in this story.

## Boundaries & Constraints — behaviour

**Always:**
- AD-1 gate: `um-rel-12/13/14/17` scenario docs → red E2E → implementation. The
  `relationships/` folder exists; this is reconciliation, not a blank page.
- The write requires `org:relationships:write` (through the facade), **rejects
  self-assignment with `400`**, and platform-owned access changes on the **next
  request**.
- An employee belongs to **one or more** departments after any change (§4.17
  amended). A `DELETE` that would leave zero current memberships → `409`. A
  **move** never passes through zero.
- A `department_change` `UserEvents` row is appended **synchronously in the same
  transaction** (AD-11 / Epic 3). `details` = the **new value only**, consistent
  with `position_change` (Dmytro, Epic 3): `{ "department": "<departmentId>" }`
  for an add (and for the target side of a move); `{ "department":
  "<departmentId>", "removed": true }` for a remove (`removed: true` is the
  discriminator — a removal has no "new value").
- One `AccessJournal` row per change, **same transaction** — `kind:
  'department_membership'` (`before`/`after` = `{ departmentId }` snapshots or
  `null`), `kind: 'department_manager'` (`before`/`after` = `{ managerUserId }`
  snapshots or `null`).
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP; Actions
  never `@Inject` a port (only `domain/services/`).

**Never:**
- Don't build the department-manager **access walk** / the recursive
  `Department.parentId` traversal against `targetType:'department'` — that is the
  AC-kernel increment (`api-conventions.md`, AD-10).
- Don't model department as a free-text S1 field.
- Don't hard-delete a `DepartmentMembership` row on a remove — close it
  (`validTo = today`); the table is temporal (contrast `Relationship`, which is
  hard-deleted).

## I/O & Edge-Case Matrix

### LIVE — write + fact + event + journal (first-class stage-2)

| Scenario | Input / State | Expected Output / Behavior | Trace |
|---|---|---|---|
| Move | Alice in Dept A (sole membership); actor `POST /users/:id/departments { departmentId: B, fromDepartmentId: A }` | `200`; A membership closed (`validTo = today`), B membership created; **one** `department_change` event `details: { department: B }`; **one** `AccessJournal` row `kind: 'department_membership'`, `before: { departmentId: A }`, `after: { departmentId: B }` — same transaction | `um-rel-12` |
| Add 2nd membership | Alice in Dept A; actor `POST { departmentId: B }` (no `fromDepartmentId`) | `200`; Alice now in **A and B**; event `details: { department: B }`; journal `before: null`, `after: { departmentId: B }` | `um-rel-17` T1 |
| Remove one of two | Alice in A and B; actor `DELETE /users/:id/departments/B` | `200`; B membership closed, Alice still in A; event `details: { department: B, removed: true }`; journal `before: { departmentId: B }`, `after: null` | `um-rel-17` T2 |
| Remove the last | Alice in A only; actor `DELETE /users/:id/departments/A` | `409` — employee must belong to ≥1 department (§4.17); no state change, no event, no journal row | `um-rel-17` T3 |
| Remove a non-membership | Alice not a current member of Dept C; `DELETE /users/:id/departments/C` | `404` leak-free; no state change | `um-rel-17` T4 |
| Change dept manager | Dept B manager is Bob; actor `PUT /departments/B/manager { managerUserId: Nina, expectedCurrentManagerId: Bob }` | `200`; Bob's `unit-manager` AR `Policies` row + `UserPolicies` link hard-deleted, Nina's created; **one** `AccessJournal` row `kind: 'department_manager'`, `before: { managerUserId: Bob }`, `after: { managerUserId: Nina }` — same transaction | `um-rel-13` T1–T2 |
| Stale expected manager | `expectedCurrentManagerId` ≠ current manager | `409`; state unchanged; no journal row | `um-rel-13` (concurrency) |
| Self-assignment (manager) | actor `PUT /departments/B/manager { managerUserId: <self> }` | `400` (app-level pre-check, before the transaction); no `Policies` row, no `UserPolicies` link, no journal row | `um-rel-14` |
| Unauthorized | actor lacks `org:relationships:write` (Ida) | `403` before any write; no membership/policy change, no event, no journal row | `um-rel-07` T3 |

### DEFERRED — department-derived access resolution (`it.todo`; gated on the AC department-walk increment)

| Assertion | Gated by | Trace |
|---|---|---|
| After a move, Dept B's manager resolves Reporting-line access to Alice on the next request; Dept A's manager loses it | AC `resolveAudiences` `targetType:'department'` walk | `um-rel-12` T3 (`it.todo`) |
| After a manager change, Nina resolves Reporting-line access to every member of Dept B **and its nested Dept C**; Bob does not | AC **recursive** `resolveAudiences` `targetType:'department'` + `Department.parentId` walk | `um-rel-13` T3 (`it.todo`) — entire access half of `um-rel-13` |
| Adding/removing a `DepartmentMembership` changes which department managers can see the employee | same AC walk | `um-rel-17` deferred `it.todo` |

**Single documented unblock trigger** for every DEFERRED row: *"the AC
`resolveAudiences` walk for `targetType:'department'` + `Department.parentId`
recursion reaches stage-3-production (`spec-access-control-kernel-mvp`)."*

## v1.5 Cutover Notes

- **No new schema.** `Department` (+ `parentId`), `DepartmentMembership` (+ the
  partial `UNIQUE` in reviewed raw SQL), the `Policies` polymorphic `targetType`
  column, the `AccessJournal` table + `AccessJournalKind` enum
  (`department_membership`, `department_manager`), and the `UserEvent`
  `department_change` `type` slot **all already exist**. Story 4.3 adds routes,
  actions, and the two `kind` enrolments — no migration.
- Build on the `relationships` area of `user-management`:
  `relationships.controller.ts`, `org-relationship.repository.ts` (the
  `$transaction` edge+journal co-write pattern), the `idempotencyKey` util,
  Epic 3's `AddManualUserEventAction` / same-tx event-append helper.
- Department-manager storage = an AR `Policies` row
  `{ operator: '==', targetType: 'department', targetId: <deptId>, targetRole:
  'unit-manager', type: 'AR', managedBy: 'admin' }` + `UserPolicies { userId:
  <managerUserId>, policyId }`. Satisfies the `Policies_row_shape_check` CHECK
  (`type='AR' AND targetType IS NOT NULL AND targetId IS NOT NULL`); `targetRole`
  on an AR row is legal (role-key partial unique index is `WHERE type='FR'`).

## Open Questions / Gates

- **CC-07 / PM/AD-29** — **RESOLVED** (Story 4.1). Not a blocker.
- **`department_change` `UserEvents` mechanism** — **RESOLVED** (Epic 3
  Story 3.1). Not a blocker.
- **AC department-resolver walk** (`targetType:'department'` policy leg +
  `Department.parentId` recursion) — **still the one hard blocker**, and it is
  an **AC-kernel increment** (`spec-access-control-kernel-mvp`, Anna Pikula),
  not this story. Gates only the DEFERRED I/O rows above.
- Resourcing-routing and CDS-key wiring are consumers in other contexts — out of
  scope beyond emitting the fact + event.

### Scenario-stage decisions carried to the human gate

1. **Multi-membership "move" semantics.** Recommend **named-source atomic move**
   — `POST /users/:id/departments { departmentId, fromDepartmentId }` ends the
   named source membership + adds the target, one transaction. Not
   "replace-the-sole-membership". Plain add and plain remove are first-class
   (`um-rel-17`). Differs from DEC-UM-005's explicit two-step for the `direct`
   edge — justified by the ≥1 floor.
2. **Can an employee hold zero department memberships?** Recommend **no — ≥1
   enforced.** `DELETE` of the last current membership → **`409`**. Change a sole
   department via the atomic move. (§4.17 "one or more".)
3. **Route shapes.** Membership: `POST/DELETE /users/:id/departments`
   (owned collection — `DepartmentMembership` is a temporal set, not a
   `Relationship` row). Department-manager: recommend `PUT/DELETE
   /departments/:deptId/manager` (fixed-cardinality fact, mirrors the PP atomic
   shape) — **flag:** no `/departments` root exists today; the fallback
   `POST/DELETE /users/:managerId/policies` (already in `api-conventions.md`
   shape 4) has identical storage. The Department-edge contract ratifies the
   final shape.
4. **`department_change` `details` payload.** Add → `{ "department":
   "<departmentId>" }` (new value only, `position_change` precedent). Remove →
   `{ "department": "<departmentId>", "removed": true }`. Move → **one** event in
   the add form. Flagged alternative (symmetric `"change": "added"|"removed"`,
   move emits two events) — rejected for `position_change` consistency.
5. **Department-manager `Policies` row exact shape.** `{ operator: '==',
   targetType: 'department', targetId: <deptId>, targetRole: 'unit-manager',
   type: 'AR', managedBy: 'admin' }` + `UserPolicies` link (confirmed:
   `database-schema.md` line 203 + `Policies_row_shape_check`).
6. **Flag — `AccessJournal.subjectUserId` on a `department_manager` row.** The FK
   is to `User`; a manager change has a **department** subject, not a user.
   Interim (asserted in `um-rel-13`): store the new manager's user id in
   `subjectUserId` and the `deptId` in `before`/`after`. Recommend the architect
   + Department-edge contract add a `subjectDepartmentId` column.
