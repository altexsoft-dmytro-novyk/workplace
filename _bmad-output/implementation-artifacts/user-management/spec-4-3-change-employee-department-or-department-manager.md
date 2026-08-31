---
title: 'Story 4.3: Change Employee Department or Department Manager'
type: 'feature'
status: draft
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-4-context.md']
---

> Compiled 2026-09-01 from epics.md v1.5 — **NEW story** (added by the 2026-08-29
> v1.5 correct course; no pre-v1.5 spec). **NOT an AD-1 approval.**

## Intent

**Problem:** Every employee belongs to exactly one department; departments nest
(§4.17). A department change alters Reporting-line access, routes resourcing
requests, emits a career-timeline event, and re-keys the CDS skills matrix. A
department-manager change grants Manager access to everyone in that department
and its sub-departments (§2.1 relation 2). Neither has a mechanism.

**Approach:** Extend the dedicated organisational-relationship screen with
department assignment and department-manager assignment, using the AD-14
attachment operations (`POST/DELETE /users/:id/policies` with
`targetType:'department'` for department management; a department-membership
write for the employee's department). Append a `department_change` `UserEvents`
row through Epic 3's synchronous same-transaction mechanism (AD-11).

## Boundaries & Constraints — GATES

- **CC-07 (AD-19 Journal gate):** every change writes the §3.4 journal in the
  same transaction. Journal-writing stages blocked until CC-07 is approved.
- **Department edge contract (spine Deferred):** the nested-department entity,
  exactly-one membership, department-manager access walk, resourcing routing,
  and CDS key are fixed by §2.1/§4.7/§4.9/§4.10/§4.17 + AD-18, but the **indexed
  edge schema is not**. Until it lands, `department`-targeted policy rows
  contribute **nothing** to tier resolution (fail-closed, AD-12), so the
  department-manager access half of this story cannot go green. Scenario prose
  may proceed.

## Boundaries & Constraints — behaviour

**Always:**
- AD-1 gate, blank page: `um-rel-*` department scenarios → red E2E →
  implementation.
- The write requires the `change organisational relationships` permission
  (through the facade), **rejects self-assignment**, and access changes on the
  **next request**.
- An employee belongs to **exactly one** department after any change.
- A `department_change` `UserEvents` row is appended synchronously in the same
  transaction (AD-11 / Epic 3 pattern).
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.

**Never:**
- Don't build the department-manager access walk against
  `targetType:'department'` until the Department edge contract lands
  (`api-conventions.md`, AD-10).
- Don't model department as a free-text S1 field.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Move employee | Alice in Dept A; authorized actor moves her to Dept B | Alice belongs to exactly one department (B); Reporting-line access changes on the next request; a `department_change` event is appended; journal records before/after (journal stage gated on CC-07) |
| Change dept manager | Authorized actor changes Dept B's manager | The new manager gets Reporting-line access to Dept B and its nested departments on the next request (gated on the Department edge contract); journal records before/after |
| Self-assignment | Actor tries to make themselves manager of a department they don't already manage | Rejected; no access changes |

## v1.5 Cutover Notes

- Reuse Story 4.1's `Relationship` model + hand-authored migration; department
  membership representation follows the Department edge contract when it lands —
  do not hand-author a guessed schema now.

## Open Questions / Gates

- **CC-07** (journal) — hard blocker for the journal stage.
- **Department edge contract** (spine Deferred) — hard blocker for
  department-derived access and the department-manager walk.
- Resourcing-routing and CDS-key wiring are consumers in other contexts —
  out of this story's scope beyond emitting the fact + event.
