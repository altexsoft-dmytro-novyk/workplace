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

- **AD-19 Journal gate (CC-07).** Every story writes the §3.4 journal in the same
  transaction as the fact change. CC-07 owns the immutable journal schema,
  snapshot payload, reader authorization, and transaction-enrolment contract.
  **Scenario prose (AD-1 stage 1) may proceed; the stage-2 E2E and production
  (journal-writing) stages of Stories 4.1, 4.2, and 4.3 are blocked until CC-07
  is an approved architecture decision.** `UserEvents` is **not** a journal
  substitute.
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
- **Department edge contract** (Story 4.3): the nested-department entity,
  **one-or-more** membership (§4.17 amended 2026-09-02), department-manager
  access, resourcing routing, timeline event, and CDS key are fixed by
  §2.1/§4.7/§4.9/§4.10/§4.17 and AD-18, and the `Department` /
  `DepartmentMembership` shapes are now fixed in `database-schema.md`
  §Project/Department, but the indexed parent/manager edge schema and the
  recursive walk remain pending (spine Deferred). Until they land,
  `department`-targeted policy rows contribute nothing to tier resolution
  (fail-closed, AD-12). `department_change` events are add/remove events.

## Requirements & Constraints — behaviour

- One dedicated screen invoking the approved attachment/fixed-cardinality
  relationship commands (AD-14 shape 4): generic `POST/DELETE
  /users/:id/relationships` for `direct`; atomic `PUT/DELETE
  /users/:id/relationships/people-partner` for the zero-or-one PP edge (AD-19);
  `POST/DELETE /users/:id/policies` and department attachment for department
  management. **No bespoke `/users/:id/manager` endpoint.**
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
- This epic starts stage 1 from a blank page — no
  `docs/test-cases/user-management/relationships/` folder exists yet; confirm
  the folder/naming convention (`um-rel-*`) before drafting.
- Whole epic's journal-writing stages wait on CC-07; Story 4.2 also on CC-04;
  Story 4.3 department access also on the Department edge contract.
