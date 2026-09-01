---
title: 'Story 3.3: Authorized Actor Edits or Deletes an Event'
type: 'feature'
status: draft
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-3-3-pp-manager-line-corrects-or-deletes-an-event.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-3-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — supersedes "PP/Manager-Line
> Corrects or Deletes an Event"; **NOT an AD-1 approval.**

## Intent

**Problem:** Stories 3.1/3.2 write events; nothing lets an authorized actor fix
a wrongly-inferred one or remove a manually-added one that needs no replacement.
The domain rule is explicit: a correction is **never** an in-place edit.

**Approach:** Add `DELETE /users/:id/events/:eventId` (soft-delete: sets
`deletedAt`, never removes the row), behind the same DEC-UM-001 dual gate as
Story 3.2. Make Story 3.1's `GET /users/:id/events` exclude
`deletedAt IS NOT NULL` at the repository level. A "correction" is two sequential
client calls — this `DELETE` then Story 3.2's `POST` — no separate "correct"
endpoint.

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-ct-05`, `um-ct-06`, `um-ct-07` scenario docs → red E2E →
  implementation.
- Same gate as Story 3.2: *edit the career timeline* permission **and** narrowed
  S9 write audience (assigned PP + direct Unit Manager), through the facade.
- Soft-delete only — the row persists; `deletedAt` is never exposed to the
  caller ("absence is absence").
- Reuse Story 3.2's manual-add write path for the "append the corrected entry"
  step — 3.3 adds only the soft-delete path.

**Never:**
- No `PATCH` on a single event, no in-place field mutation (except `deletedAt`).
- Don't invent a "correct" endpoint.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Correct via replace | Alice has a system `position_change` with a wrong `details.to` | Authorized actor soft-deletes it, appends the corrected one; a subsequent read shows only the corrected event (`um-ct-05`) |
| Delete, no replacement | A manually-added event needs no replacement | Authorized actor deletes it; absent from subsequent normal reads (`um-ct-06`, `um-ct-07`) |
| Missing either half of the gate | Actor lacks the permission or the S9 write audience | Denied; timeline unchanged |

## v1.5 Cutover Notes

- `um-ct-05`'s wrongly-inferred-entry precondition has no HTTP-observable way to
  manufacture — the existing E2E seeds an equivalent wrong entry through the
  manual-add endpoint with an in-file comment; preserve that.
- Route through the **real** facade (Epic 0's adapter), not a fixture fake.

## Open Questions / Gates

- S9 `canAccessSection` support is a pending access-control increment (same as
  Story 3.2).
