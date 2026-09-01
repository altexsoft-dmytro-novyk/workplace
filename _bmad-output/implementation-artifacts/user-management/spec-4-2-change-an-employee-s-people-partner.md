---
title: "Story 4.2: Change an Employee's People Partner"
type: 'feature'
status: draft
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-4-2-hr-admin-pairs-or-unpairs-a-mentor-and-mentee.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-4-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5. The pre-v1.5 Story 4.2 ("HR Admin
> Pairs or Unpairs a Mentor and Mentee") is retired — mentorship is handed to a
> future dedicated Mentorship context (AD-17). This slot is reused for the v1.5
> People Partner operation. **NOT an AD-1 approval.**

## Intent

**Problem:** People Partner assignment drives the PP audience and the HR-line
chain, but there is no mechanism to set or replace it. PP is **not** a `User`
column and **not** a policy — it is the organisational fact
`Relationship type='people_partner'` (AD-19).

**Approach:** Implement the atomic fixed-cardinality command
`PUT /users/:employeeId/relationships/people-partner {targetId,
expectedCurrentTargetId}` (AD-14 shape 4, AD-19), invoked from the dedicated
organisational-relationship screen. `DELETE` carries the expected current PP in
`If-Match`. Each employee has zero or one PP; one PP may partner many employees.

## Boundaries & Constraints — GATES

- **CC-04:** People Partner persistence, cardinality, and the write contract are
  **not resolved** — business behaviour is fixed, storage is not. No stage-2 or
  production work until CC-04 is approved.
- **CC-07 (AD-19 Journal gate):** the edge and one old→new journal record commit
  in the same transaction. Journal-writing stages blocked until CC-07 is
  approved. `UserEvents` is not a substitute.
- **AD-19 Department-boundary gate:** the direct assigned-PP edge resolves the
  direct PP audience immediately, but **transitive HR-line propagation stays
  fail-closed to the directly assigned PP** until the Department contract binds
  the HR boundary. Stage 2 for HR-line inheritance is blocked on that contract
  and its boundary-negative scenarios.

Story 4.2 is blocked on **CC-04 AND CC-07**. Scenario prose (AD-1 stage 1) may
proceed.

## Boundaries & Constraints — behaviour

**Always:**
- The write requires the `change organisational relationships` permission
  (through the facade), **rejects self-assignment**, and PP access changes on
  the **next request**.
- `PUT` creates or **atomically replaces** the edge; an existing-row update
  predicates on employee/type/`expectedCurrentTargetId`; concurrent absent-row
  creation is serialized by the partial unique index. A stale predicate or
  losing unique conflict → `409`. `DELETE` journals old→none atomically.
- `Relationship` rows are hard-deleted.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.

**Never:**
- No PP column on `User`, no PP-as-policy modelling.
- No mentorship handling (retired to the Mentorship context).
- Don't traverse an unrestricted `direct` chain and call it "inside HR" (AD-19).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Replace | CC-04 approved; Alice assigned to Paula; authorized actor changes to Nina | Paula's PP access ends and Nina's PP/HR-line access begins on the next request; journal records before/after atomically |
| Self-assignment | Actor tries to assign themselves as Alice's PP | Rejected; current assignment remains |
| Stale expected target | `expectedCurrentTargetId` no longer matches | `409`; state unchanged |
| Unauthorized | Actor lacks the permission | `403`; state unchanged |

## v1.5 Cutover Notes

- Add the `people_partner` partial unique index to Story 4.1's hand-authored
  migration if not already present — no second migration.
- `Relationship.type` v1.5 value set includes `people_partner`; `reportsToUserId`
  is the directional PP pointer for this edge.

## Open Questions / Gates

- **CC-04** (persistence/cardinality/write contract) — hard blocker.
- **CC-07** (journal schema) — hard blocker for the journal stage.
- Department contract — blocks HR-line inheritance stage 2 (AD-19).
