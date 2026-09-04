# User Management — `relationships/` (v1.5 Epic 4: Organisational Relationships; Epic 6: read)

Stage-1 scenario documents (AD-1) for **Epic 4 — Organizational Relationships**:
the four organisational facts that alter access — manager, People Partner,
employee department, department manager. Every change requires the single
dedicated *change organisational relationships* permission, rejects
self-assignment, and writes the §3.4 `AccessJournal` entry in the same
transaction as the fact change.

**Status:** unapproved draft (v1.5 refresh, 2026-09-01; Story 4.1 journal
reconciliation 2026-09-03; Story 4.2 reconciliation 2026-09-03; **Story 4.3
split-gate reconciliation 2026-09-03** — the department membership + manager
**writes** + their `department_change` event + `department_membership` /
`department_manager` journal rows are first-class stage-2; only the
department-derived **access resolution** stays deferred as `it.todo`, gated on
an Access-Control-kernel increment). Files retraced or authored this pass
require fresh per-file human approval; no `approvals.yaml` records any of them.

## Contents

| File(s) | Story | State | Trace |
| --- | --- | --- | --- |
| `um-rel-01`, `um-rel-02`, `um-rel-03`, `um-rel-08`, `um-rel-15` | 4.1 Change an Employee's Manager (+ the `AccessJournal` foundation) | retraced / authored; DEC-UM-005 (explicit `DELETE` then `POST`, 2nd `POST` → `409`) applies; **the same-transaction `AccessJournal` write is a first-class assertion** — PM/AD-29 design ratified 2026-09-02 ("closes CC-07 design") | FR-10 · DEC-UM-005 · AD-11 · PM/AD-29 · §3.4 |
| `um-rel-07` | 4.1 / 4.2 / 4.3 common | retraced — denial for a session lacking *change organisational relationships* (no-target facade `isAllowed`, never a role-name check); Test 1 (4.1) and Test 2 (4.2 PP, reconciled 2026-09-03) are live; Test 3 (4.3 department) is a stub. See `um-rel-16` T3 for the fuller PP `PUT`/`DELETE` denial pair. | FR-10 · DEC-UM-002 · §3.3 |
| `um-rel-09`, `um-rel-10`, `um-rel-11`, `um-rel-16` | 4.2 Change an Employee's People Partner | **reconciled 2026-09-03 — first-class stage-2** (`PUT /users/:id/relationships/people-partner` atomic create-or-replace + `DELETE`, self-assignment `400`, stale/omitted `expectedCurrentTargetId` `409`, `@concurrency` variant, unauthorized `403`, new-PP audience on next request; **the same-transaction `people_partner` `AccessJournal` write is a first-class assertion**, reusing Story 4.1's table/enum/writer). CC-07/PM/AD-29 done via 4.1; CC-04 design-resolved (`P2`, "Not a design blocker on PM/AD-19"). **Deferred:** HR-line propagation above the directly assigned PP (fail-closed — AD-19 Department-boundary gate). | FR-10 · AD-19 · PM/AD-19 · PM/AD-29 · DEC-UM-010 |
| `um-rel-12`, `um-rel-13`, `um-rel-14`, `um-rel-17` | 4.3 Change Employee Department or Department Manager | **SPLIT-GATE — reconciled 2026-09-03.** The department **membership** write (add / atomic named-source move / remove; ≥1-department floor → `DELETE` of the last → `409`), the department-**manager** write (an AR `Policies` row `targetType:'department'` `targetRole:'unit-manager'` + `UserPolicies` link), the same-transaction `department_change` `UserEvents` row, the same-transaction `AccessJournal` rows (`department_membership` / `department_manager`), and self-assignment `400` (`um-rel-14`) are **first-class stage-2**. CC-07/PM/AD-29 done via 4.1; the Epic 3 `department_change` mechanism done via Story 3.1; `Department.parentId` + `DepartmentMembership` schema present (Story 1.1). **Deferred `it.todo`:** the department-derived **access resolution** — `um-rel-12` T3 (a dept manager gains/loses Reporting-line access) and **all of `um-rel-13`'s access half** (Nina gains access to Dept B + nested C — the recursive walk). Gated on the AC `resolveAudiences` `targetType:'department'` + `Department.parentId` walk. | FR-10 · §4.17 · AD-10 · AD-19 · PM/AD-29 |
| `um-rel-18`…`um-rel-26` | 6.1 Read the current reporting-line manager and People Partner | **authored 2026-09-04 — reconciliation, Stage-2 landed first.** `GET /users/:id/relationships` read-only projection over the two current person edges. Read gate is the 2026-09-04 "Option B" decision: `resolveAudiences(v,[t]) ∩ { reporting, pp } ≠ ∅` **OR** `isAllowed(v,'org:relationships:write')` ("edit implies read") — **Self is not a reader**. Envelope `{ data }`, no `canEdit`, `direct` before `people_partner`. Denials follow PM/AD-24: `401` before subject lookup, `404` (unknown **or** inactive `:id`) before the gate, `403` leak-free after it. Projection excludes `project` edges and edges whose target is deactivated. | FR-10 · DEC-UM-002 · DEC-UM-005 · AD-11 · PM/AD-24 · spec-6-1 |
| `um-rel-04`, `um-rel-05`, `um-rel-06` | — | **RETIRED (v1.5)** — mentorship pair lifecycle moved to the dedicated **Mentorship** context (AD-17), now planned at `_bmad-output/planning-artifacts/mentorship/epics.md` + `prd-mentorship-2026-09-01/`, with scenarios at **`docs/test-cases/mentorship/`**. `mentorship_start`/`mentorship_end` reach UM only as career events via an application boundary (Epic 3 Story 3.1). Retained as history; superseded header on each. | — |

**File count:** 23 live (`um-rel-01..03`, `-07..17` Epic 4; `-18..26` Epic 6)
+ 3 retired history (`um-rel-04..06`). `um-rel-17` (department membership add /
remove / last → `409`) is new this pass (Story 4.3 split-gate); `um-rel-18..26`
are new for Story 6.1 (read).

### Story 6.1 — authored after its Stage-2 suite (AD-1 inversion), approved 2026-09-04

`test/user-management/epic-4/relationships-read.e2e-spec.ts` was written and is
green; these nine scenario documents were authored from it on 2026-09-04 to
close the gap, **not** the other way round. Recorded rather than hidden:
approving these files ratifies behaviour that already ships. The suite now names
each id in its test titles, so traceability resolves without the coverage
matrix. The unit suite for the same action
(`src/user-management/application/actions/__tests__/get-relationships.action.spec.ts`)
names `um-rel-18/20/21/23`.

**Stage-1 approval is recorded** for all nine files in
[`_bmad-output/specs/spec-user-management-test-cases/approvals.yaml`](../../../../_bmad-output/specs/spec-user-management-test-cases/approvals.yaml)
(author: agent, approver: Anna Pikula, 2026-09-04) — a new ledger for this spec,
following the same append-only schema as the access-control-adoption one.

## Blocked = prose only

**Stories 4.1 and 4.2 are no longer in this section.** PM/AD-29 (`AccessJournal`)
was ratified 2026-09-02 ("closes CC-07 design"), so the immutable schema,
snapshot payload, reader authorization, and same-transaction enrolment are
defined (`database-schema.md` §AccessJournal; access-control.md §3.4). Story
4.1's scenarios (`um-rel-01/02/03/08/15`) carry first-class journal assertions
and Story 4.1 **built** the table, `AccessJournalKind` enum (`people_partner`
included), the same-transaction writer, and `GET /users/:id/access-journal`
(migration `20260903011657_story_4_1_access_journal`). **Story 4.2**
(`um-rel-09/10/11/16`) reuses that infrastructure: CC-04 is design-resolved
(`P2`, "Not a design blocker on PM/AD-19" — ratification §7), its remaining work
is the `PUT/DELETE .../people-partner` routes + AccessJournal enrolment. The
**direct assigned-PP edge** is translatable to stage-2 E2E and production. What
stays deferred is **transitive PP HR-line propagation above the directly
assigned PP** — fail-closed to the direct PP until the Department contract binds
the HR boundary (AD-19 Department-boundary gate).

**Story 4.3's write half is also out of this section (2026-09-03).** The
department membership write, the department-manager write, self-assignment `400`,
and every same-transaction `department_change` event / `AccessJournal` row are
first-class stage-2 (`um-rel-12` T1–T2, `um-rel-13` T1–T2, `um-rel-14`,
`um-rel-17`). `Department.parentId` + `DepartmentMembership` are in the schema
(Story 1.1); CC-07/PM/AD-29 done via Story 4.1; the `department_change` mechanism
done via Epic 3 Story 3.1.

Still blocked (scenario prose / `it.todo` only, **no stage-2 E2E, no production
code** for the blocked clause):

- **Story 4.3's department-derived access-resolution slice only** — the
  `AudienceResolverService` walk for `targetType:'department'` `Policies` rows +
  `Department.parentId` recursion. This is an **Access-Control-kernel increment**
  (`spec-access-control-kernel-mvp`, approver Anna Pikula), **not**
  User-Management work. It gates exactly: `um-rel-12` Test 3 (a department
  manager gains/loses Reporting-line access after a membership move), **all of
  `um-rel-13`'s access half** (`um-rel-13` Test 3 — Nina gains access to Dept B
  **and its nested Dept C**: the recursive walk), and `um-rel-17`'s deferred
  `it.todo`. The **writes** in `um-rel-12/13/14/17` are **not** blocked. Single
  documented unblock trigger: *"the AC `resolveAudiences` walk for
  `targetType:'department'` + `Department.parentId` recursion reaches
  stage-3-production (`spec-access-control-kernel-mvp`)."*
- **Story 4.2's HR-line propagation slice only** — the HR chain above the
  directly assigned PP; deferred pending the same Department contract. The
  direct assigned-PP edge (`um-rel-09/10/11/16`) is **not** blocked.

`UserEvents` is not a journal substitute (different owner PM/AD-30, no
before/after, different reader authorization).

## What blocks stage-2

| Blocker | Blocks | Does NOT block |
| --- | --- | --- |
| **AC `resolveAudiences` department-tree walk** — `targetType:'department'` `Policies` leg + `Department.parentId` recursion; an Access-Control-kernel increment (`spec-access-control-kernel-mvp`, Anna Pikula). Unblock trigger: *"reaches stage-3-production (`spec-access-control-kernel-mvp`)."* | `um-rel-12` T3 (`it.todo`), **all of `um-rel-13`'s access half** (T3 `it.todo` — the recursive walk over nested Dept C), `um-rel-17` deferred `it.todo` | The department **membership** write + move + `409`-floor, the department-**manager** `Policies`/`UserPolicies` write, self-assignment `400`, and every same-transaction `department_change` event / `AccessJournal` row — `um-rel-12` T1–T2, `um-rel-13` T1–T2, `um-rel-14`, `um-rel-17` T1–T4 |
| Department contract / PM/AD-35 (HR-boundary binding) | Story 4.2's HR-line-propagation slice (the HR chain above the directly assigned PP) | the direct assigned-PP edge (`um-rel-09/10/11/16`) |
