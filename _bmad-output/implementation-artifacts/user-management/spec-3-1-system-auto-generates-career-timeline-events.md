---
title: 'Story 3.1: System Auto-Generates Career Timeline Events'
type: 'feature'
status: draft
created: 2026-08-24
regenerated: 2026-09-01
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-3-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — **NOT an AD-1 approval.** Pre-v1.5
> `<frozen-after-approval>` block re-opened. `baseline_commit` dropped.

## Intent

**Problem:** No `UserEvents` model or write path exists. Tracked changes happen
with no trace: import creates a `User` (Story 1.1) and an actor edits `position`
(Story 1.2). Neither leaves a career-timeline record.

**Approach:** Add the `UserEvents` Prisma model + migration (per
`database-schema.md`), an entity, a repository port + Prisma implementation, and
one `write-user-event.service.ts` operation stamping `source: "system"`. Wire it
as an **explicit synchronous same-transaction call** (AD-11) from Story 1.1's
import path (`joined_company`) and Story 1.2's `PATCH /users/:id` handler
(`position_change`, only when `position` actually changes). Add
`GET /users/:id/events` so this story's own tests can observe writes.

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-ct-01`, `um-ct-02` scenario docs → red E2E → implementation.
- **AD-11 binding constraint:** synchronous, same transaction, explicit call —
  no event bus, no generic table-change listener, no `EventEmitterModule`-style
  pub/sub. Story 3.1 establishes this pattern; every later hook follows it.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- `UserEvents` rows are immutable once written except `deletedAt` (`null` →
  timestamp).
- Story 3.1 owns the model + migration; Stories 3.2/3.3 do not re-derive or
  alter it.

**Never:**
- Don't build system hooks for the six event types whose owning contexts don't
  exist yet (`grade_change`, `department_change` [Epic 4 Story 4.3 wires this],
  `employment_type_change`, `extended_leave`, `mentorship_start`,
  `mentorship_end`).
- No departure/left-company event — employment status is the sole source (FR-11).
- No `PATCH` on a single event.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Joined at import | Nina imported (Story 1.1) | `UserEvents` row `type: "joined_company"`, `source: "system"`, `eventDate` = `companyJoinDate`, written at import in the same transaction (`um-ct-01`) |
| Position edit | Bob `PATCH /users/<aliceId>` `position` Engineer → Senior Engineer | `UserEvents` row `type: "position_change"`, `source: "system"`, `details: { from, to }` (`um-ct-02`) |
| Owning-context transition | Grade/dept/employment-type/leave/mentorship commit | Exactly one corresponding event appended through the UM application boundary |
| Departure effective | Employee's departure applied | No departure event exists |

## v1.5 Cutover Notes

- The hooks attach to Story 1.1's **import** path (not a `POST /users` handler —
  that route is retired) and Story 1.2's `PATCH /users/:id` handler. Those must
  exist as real code first — Epic 3 is not parallelizable with Epic 1.
- Existing stage-2 E2E (`test/user-management/career-timeline.e2e-spec.ts`,
  backend branch `user-management`) — reconcile/extend, don't recreate.

## Open Questions / Gates

- `um-ct-01`'s import hook depends on Story 1.1's import path being mergeable.
- The cross-context application-boundary shape for owning contexts to append
  events — architect / api-conventions follow-up (the port interface should be
  small enough that Epic 4 Story 4.3's `department_change` call site wires
  against it without a guess).
