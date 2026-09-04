# Epic 4 Context: Organizational Relationships

<!-- Regenerated 2026-09-01 from epics.md v1.5 — supersedes the pre-v1.5 version; NOT an AD-1 approval. -->
<!-- Compiled planning context for a future story-authoring / dev pass. NOT an AD-1 stage-1 scenario doc. -->

## Goal

Holders of the dedicated **`change organisational relationships`** permission
change the **four** organisational facts that alter access — a person's manager,
their People Partner, their department, and a department's manager — on a
**dedicated screen**, never through S1 `PATCH` (§2.1, §3.2 fn 1). Every change
**rejects self-assignment**, is **journaled atomically** (§3.4), and affects
platform-owned access **on the next request**. **Mentorship is not an
organisational access edge** (AD-17) — the pre-v1.5 mentorship Story 4.2 is
retired to a future Mentorship context. **FRs covered:** FR-10.

## Stories

- Story 4.1: Change an Employee's Manager
- Story 4.2: Change an Employee's People Partner
- Story 4.3: Change Employee Department or Department Manager

*(v1.5 story set. Retired: "HR Admin Assigns or Revokes Reports-To" → regenerated
as 4.1; "HR Admin Pairs or Unpairs a Mentor and Mentee" → SUPERSEDED pointer,
handed to Mentorship. New: 4.3.)*

## Requirements & Constraints — GATES FIRST

- **AD-19 Journal gate (CC-07 / PM/AD-29) — DESIGN RATIFIED 2026-09-02.** Every
  story writes the §3.4 journal in the same transaction as the fact change. The
  immutable `AccessJournal` schema, snapshot payload, reader authorization, and
  transaction-enrolment contract are defined (`database-schema.md` §AccessJournal;
  `access-control.md` §3.4). **The journal-writing stage-2 E2E and production
  stages now PROCEED — no longer design-blocked.** The table, writer, and read
  endpoint are implementation-absent; **Story 4.1 builds them** for the epic
  (4.2/4.3 reuse). `kind` enum (ratified binding shape, `database-schema.md`):
  `manager`, `people_partner`, `department_membership`, `department_manager`,
  `full_profile_grant`, `full_profile_revoke`, `shared_link_access` — this
  supersedes the `_change`-suffixed spellings used elsewhere in this doc.
  `UserEvents` is **not** a journal substitute (PM/AD-30, different owner/reader,
  no before/after).
  - Interim journal-read gate: `resolveAudiences(viewer,[subject]) ∩ {reporting,
    pp}` (Self and HR-Admin-by-FR are NOT readers, per §3.4). The §2.4
    full-profile-holder reader leg is deferred behind the `full`-audience
    resolver (`deferred-work.md`).
  - Still under-specified in AD-29 (PO/architect, non-blocking for stage 2):
    retention/purge policy; `before`/`after` for non-state kinds; read-endpoint
    pagination; per-`kind` snapshot schema; `api-conventions.md` route-table entry.
- **CC-04** (Story 4.2 only, additional): People Partner persistence, cardinality
  (zero-or-one per employee, `Relationship type='people_partner'`), and the
  atomic `PUT /users/:employeeId/relationships/people-partner` write contract
  (AD-19). Story 4.2 is blocked on **CC-04 AND CC-07**.
- **AD-19 Department-boundary gate.** Assigned-PP resolution may use the edge
  immediately, but transitive HR-line propagation stays **fail-closed to the
  directly assigned PP** until the Department contract identifies the HR
  root/membership and binds the recursive boundary predicate. Stage 2 for
  HR-line inheritance is blocked until that contract and its boundary-negative
  scenarios are approved.
- **Department edge contract** (Story 4.3) — **split-gate, reconciled
  2026-09-03.** The nested-department entity, **one-or-more** membership (§4.17
  amended 2026-09-02), department-manager access, resourcing routing, timeline
  event, and CDS key are fixed by §2.1/§4.7/§4.9/§4.10/§4.17 and AD-18. The
  **schema is present** on `dn-um-implementation`: `Department.parentId`
  (self-relation `DeptTree`, `onDelete: Restrict`), `DepartmentMembership`
  (temporal, partial `UNIQUE (userId, departmentId) WHERE validTo IS NULL`),
  `Policies.targetType` polymorphic `String?` (stores `'department'` rows), and
  `AccessJournalKind` with `department_membership` **and** `department_manager`
  (Story 1.1 + Story 4.1). So the department **membership** write, the
  department-**manager** write (an AR `Policies` row `targetType:'department'`
  `targetRole:'unit-manager'` + `UserPolicies` link), self-assignment `400`, the
  same-transaction `department_change` `UserEvents` row (Epic 3 Story 3.1
  mechanism — done), and the same-transaction `AccessJournal` rows are **LIVE
  for Story 4.3**. **The one hard blocker that remains** is the
  `AudienceResolverService` walk for `targetType:'department'` `Policies` rows +
  `Department.parentId` recursion — today `department`-targeted policy rows
  contribute nothing to tier resolution (fail-closed, AD-12). That walk is an
  **Access-Control-kernel increment** (`spec-access-control-kernel-mvp`,
  approver Anna Pikula), **not** User-Management work, and it gates only the
  department-derived **access-resolution** `it.todo`s in `um-rel-12`/`um-rel-13`/
  `um-rel-17`. `department_change` events are add/remove events (`details` =
  new value only for an add; `{ department, removed: true }` for a remove).
  Single documented unblock trigger: *"the AC `resolveAudiences` walk for
  `targetType:'department'` + `Department.parentId` recursion reaches
  stage-3-production (`spec-access-control-kernel-mvp`)."*

## Requirements & Constraints — behaviour

- One dedicated screen invoking the approved attachment/fixed-cardinality
  relationship commands (AD-14 shape 4): generic `POST/DELETE
  /users/:id/relationships` for `direct`; atomic `PUT/DELETE
  /users/:id/relationships/people-partner` for the zero-or-one PP edge (AD-19);
  department **membership** via `POST/DELETE /users/:id/departments` (an owned
  collection — `DepartmentMembership` is a temporal set, one-or-more current
  rows; `POST` with `fromDepartmentId` is the atomic named-source move); the
  department **manager** via `PUT/DELETE /departments/:deptId/manager`
  (recommended) or the `POST/DELETE /users/:managerId/policies`
  `targetType:'department'` fallback (identical storage — an AR `Policies` row +
  `UserPolicies` link). Final department route shapes are the Department-edge
  contract's call to ratify (Story 4.3 recommends; `spec-4-3` decision 3).
  **No bespoke `/users/:id/manager` endpoint.**
- Every action requires the `change organisational relationships` permission
  (through the facade — never inline role logic), rejects self-assignment, and
  journals in the same transaction as the fact write.
- `Relationship` rows are **hard-deleted**, never soft-deleted — no
  `deletedAt`/`isActive` column (AD-11). At most one active `direct` and at most
  one `people_partner` edge per employee, enforced by separate partial unique
  indexes; self-targeting edges rejected.
- **DEC-UM-005** (Story 4.1): reports-to reassignment is explicit `DELETE` then
  `POST`; a second `POST` while a `direct` edge exists returns `409`, not
  implicit replace. Enforced by the DB partial `UNIQUE` (`type='direct'`), not
  an app-level pre-check.
- Story 4.3 department change appends a `department_change` `UserEvents` row
  through Epic 3's synchronous same-transaction mechanism (AD-11).
- Access changes on the **next request** for platform-owned relations; the
  15-minute window is project-derived only.
- NFR-1 pseudonymised data only.

## Technical Decisions

- **AD-11 schema migration hazard.** `Relationship`'s multi-armed `CHECK`
  constraint and its partial `UNIQUE` indexes have **no plain `schema.prisma`
  representation** in Prisma 7.x — hand-author them as raw SQL in the migration
  (`prisma migrate dev --create-only`, then edit `migration.sql`). Story 4.1
  owns writing the `Relationship` model + migration for the epic; 4.2/4.3 reuse
  it (4.2 adds the `people_partner` partial unique index if not already
  present).
- `Relationship` fields (`database-schema.md`, AD-11): `id` (uuidv7 PK),
  `userId` (FK → `User`), `type` (`'direct' | 'project' | 'people_partner'`),
  `reportsToUserId` (FK → `User`, nullable, set for `direct`/`people_partner`),
  `projectId` (FK → `Project`, nullable, `project` only). No
  `createdAt`/`createdBy`/`deletedAt`. *(Note: v1.5 replaces the pre-v1.5
  `'mentorship'` arm with `'people_partner'` — mentorship is a durable
  `MentorshipPair` in its own context, AD-17.)*
- `PUT /users/:employeeId/relationships/people-partner {targetId,
  expectedCurrentTargetId}` creates or atomically replaces the edge and writes
  one old→new journal record in the same transaction; a stale predicate or
  losing unique conflict → `409` (AD-19).
- Standard hexagonal layout; domain imports nothing from Prisma/NestJS/HTTP.
- A `mentorship` edge grants no access tier — that negative assertion belongs to
  access-control's own suite, not here.

## Cross-Story / Cross-Epic Dependencies

- Story 4.1 stands up the `Relationship` model + migration; 4.2/4.3 build on it.
- Story 4.3's `department_change` event → Epic 3 Story 3.1's write mechanism.
- The `docs/test-cases/user-management/relationships/` folder EXISTS
  (`um-rel-01..17` + README); the `um-rel-*` naming convention is settled. Stage 1
  is reconciliation, not blank-page. Story 4.1 = `um-rel-01/02/03/07/08/15`;
  Story 4.2 = `um-rel-09/10/11/16`; Story 4.3 = `um-rel-12/13/14/17` (+ the
  `um-rel-07` T3 department stub).
- Whole epic's journal-writing stages waited on CC-07 — **resolved** (PM/AD-29
  ratified 2026-09-02, built by Story 4.1). Story 4.2 also on CC-04
  (design-resolved, `P2`). **Story 4.3's writes are unblocked**; only its
  department-derived **access resolution** waits on the AC `resolveAudiences`
  `targetType:'department'` + `Department.parentId` walk — an
  Access-Control-kernel increment (`spec-access-control-kernel-mvp`, Anna
  Pikula), not this epic's work.
- The `um-ct-06` direct-Unit-Manager soft-delete leg and every `um-rel-12/13/17`
  department-access `it.todo` share **the same** AC department-tree-walk
  increment as their unblock trigger.
