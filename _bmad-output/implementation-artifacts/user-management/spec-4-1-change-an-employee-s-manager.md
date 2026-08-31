---
title: "Story 4.1: Change an Employee's Manager"
type: 'feature'
status: draft
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-4-1-hr-admin-assigns-or-revokes-reports-to.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-4-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — supersedes "HR Admin Assigns or
> Revokes Reports-To"; **NOT an AD-1 approval.**

## Intent

**Problem:** No mechanism records or queries who reports to whom. `User` carries
no manager pointer (Epic 1); the org-structure fact access-control's Reporting
line and dashboards need has nowhere to live, and no external system supplies it.

**Approach:** Add the `Relationship` Prisma model (AD-11) with its hand-authored
`CHECK` / partial-`UNIQUE` migration, and implement the `type: 'direct'` half of
the generic `POST/DELETE /users/:id/relationships` endpoint (AD-14 shape 4) —
invoked only from the dedicated organisational-relationship screen. This story
stands up the model + migration for the epic; 4.2/4.3 reuse it.

## Boundaries & Constraints — GATES

- **AD-19 Journal gate (CC-07):** the change writes the §3.4 journal (actor,
  subject, before/after, timestamp) in the same transaction as the fact change.
  **Stage-2 E2E and production (journal-writing) are blocked until CC-07 is an
  approved architecture decision.** Scenario prose and the reports-to
  fact-change design may proceed. `UserEvents` is not a journal substitute.

## Boundaries & Constraints — behaviour

**Always:**
- AD-1 gate, blank page: `docs/test-cases/user-management/relationships/`
  (`um-rel-*`) doesn't exist yet — confirm folder/naming, draft, approve, then
  red E2E, then implementation.
- The write requires the dedicated **`change organisational relationships`**
  permission (through the facade — not "HR Admin", not inline role logic),
  **rejects self-assignment**, and affects Reporting-line access on the **next
  request**.
- `Relationship` rows are **hard-deleted** — no `deletedAt`/`isActive`.
- At most one active `direct` edge per employee, enforced by the DB partial
  `UNIQUE` (`type='direct'`), not an app-level pre-check.
- **DEC-UM-005:** reassignment is explicit `DELETE` then `POST`; a second `POST`
  while a `direct` edge exists → `409` (accepted residual: a failed `POST` after
  a successful `DELETE` can briefly leave the employee manager-less).
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.

**Never:**
- No bespoke `/users/:id/manager` endpoint — use the generic
  `relationships` endpoint.
- No `type: 'mentorship'`/`type: 'people_partner'` handling here (4.2's scope).
- No `manager_change` `UserEvents` type — no named consumer (AD-11).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Success | Alice reports to Bob; Root holds the permission, changes Alice's manager to Nina | Relationship replaced atomically; Alice's Reporting-line access resolves through Nina on the next request; journal records actor/subject/before-after/timestamp (journal stage gated on CC-07) |
| Self-assignment | Actor tries to make themselves the manager without prior entitlement | Rejected; no relationship or journal entry committed |
| Reassign without revoke | Alice has a `direct` edge; second `POST` with a different target | `409` (DEC-UM-005); existing edge unchanged |
| Unauthorized | Actor lacks the permission | `403`; existing manager remains |

## v1.5 Cutover Notes

- **AD-11 schema hazard:** the `Relationship` multi-armed `CHECK` and partial
  `UNIQUE` have no plain `schema.prisma` representation in Prisma 7.x —
  hand-author as raw SQL in the migration (`--create-only` then edit
  `migration.sql`). This story owns writing it once for the epic.
- v1.5 `Relationship.type` is `'direct' | 'project' | 'people_partner'` — the
  pre-v1.5 `'mentorship'` arm is replaced (AD-17: mentorship is a durable
  `MentorshipPair` in its own context).

## Open Questions / Gates

- **CC-07** for the journal-writing stage.
- Folder/naming convention for `relationships/` scenario docs.
