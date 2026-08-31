---
title: 'Story 3.2: Authorized Actor Manually Adds a Backfill Entry'
type: 'feature'
status: draft
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-3-2-pp-manager-line-manually-adds-a-backfill-entry.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-3-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — supersedes "PP/Manager-Line
> Manually Adds a Backfill Entry"; **NOT an AD-1 approval.**

## Intent

**Problem:** Story 3.1 auto-writes events, but nothing lets an authorized actor
backfill history that predates the system (the legacy Excel headcount record).

**Approach:** Add `POST /users/:id/events`, gated behind the **dual gate**: the
runtime *edit the career timeline* permission **and** the narrowed **S9 write
audience** — the assigned People Partner or the employee's direct Unit Manager
(DEC-UM-001). Add a `CreateUserEventDto` and a domain
`add-manual-user-event.service.ts` that stamps `source: "manual"` server-side
and persists via Story 3.1's repository.

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-ct-03`, `um-ct-04` scenario docs → red E2E → implementation.
- **§2.2 dual gate + §3.3 matrix exception (DEC-UM-001):** both the
  *edit the career timeline* functional permission (`isAllowed`) **and**
  `canAccessSection(actor, 'S9', target) === 'write'` — where write is limited
  to assigned PP + direct Unit Manager, not the broader reporting/project line.
  Both halves through the `ACCESS_CONTROL_PORT` facade — never inline role logic.
  *(Note: the base kernel `canAccessSection` covers S1/S10/S11 today; S9 section
  evaluation is a later access-control increment. Until it exists, this story's
  code stage is blocked on that increment or on an interim narrower rule — flag
  in the scenario stage; do not hardcode a role name.)*
- Every manual entry is stamped `source: "manual"` server-side.
- Reuse Story 3.1's `UserEventRepositoryPort` and model as-is — no schema change.
- A new row is always created active (`deletedAt: null`); this endpoint never
  touches an existing row.

**Never:**
- Don't accept `deletedAt` or `id` in the request body.
- Don't widen the entitled-actor set beyond assigned PP + direct Unit Manager
  (§4.9).
- Don't modify or soft-delete an existing row — that's Story 3.3.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| PP adds backfill | Paula (Alice's PP), `POST /users/<aliceId>/events` with a `mentorship_end` entry pre-dating the system | `201`, `source: "manual"`; appears on `GET /users/<aliceId>/events` (`um-ct-03`) |
| Unit Manager adds backfill | Bob (Alice's direct Unit Manager) | `201`, `source: "manual"` — proving both sourced actors, not the full line (`um-ct-04`) |
| Has S9 write, lacks permission | Actor with the audience but not the *edit the career timeline* permission | Denied, no event written |
| Has permission, lacks S9 write | Actor with the permission but not assigned PP / direct Unit Manager | Denied, no event written |

## v1.5 Cutover Notes

- The pre-v1.5 spec framed the actor as "PP or Manager-line (unit manager)";
  v1.5 keeps exactly that scope but names it via DEC-UM-001 + the *edit the
  career timeline* permission, and routes it through the **real** facade
  (Epic 0's adapter), not a fixture fake.

## Open Questions / Gates

- Whether `CreateUserEventDto` accepts an incoming `source` at all (rejected by
  `whitelist` vs accepted-and-overridden) — Story 3.2 scenario stage.
- S9 `canAccessSection` support is a pending access-control increment — the code
  stage depends on it (or an approved interim narrower rule).
