---
title: 'Story 4.1: HR Admin Assigns or Revokes Reports-To'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No mechanism exists to record or query who reports to whom. `User` deliberately carries no manager pointer (Epic 1); the org-structure fact access-control's tier resolution and dashboards need has nowhere to live yet, and no external system (timetracker/HRIS) supplies it (FR-15) — an HR Admin must assign it by hand.

**Approach:** Add the `Relationship` Prisma model (per AD-11) with its hand-authored `CHECK`/partial-`UNIQUE` migration, and implement the `type: 'direct'` half of the generic `POST/DELETE /users/:id/relationships` endpoint (AD-14 shape 4). This story owns standing up the model and migration for the whole epic; Story 4.2 reuses both without changes and adds the `type: 'mentorship'` branch to the same endpoint.

## Boundaries & Constraints

**Always:**
- AD-1 gate, blank page (epic-4-context.md): no scenario doc exists yet under `docs/test-cases/user-management/` for reports-to, and no E2E test exists anywhere (confirmed against the backend submodule's `user-management` branch, read-only). Draft and get scenario docs approved (stage 1), then write failing E2E tests (stage 2), then implement (stage 3) — never code before a red E2E test exists. This story's Tasks below list stage 1 and stage 2 as the first, unchecked items.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Every entitlement check is a single AccessControl-facade call (AD-9) — HR Admin functional role, no target scope (by symmetry with registration's `um-reg-03`/`um-deact-03` shape) — never inline role logic in the controller.
- `Relationship` rows are hard-deleted only — no `deletedAt`/`isActive` column, unlike `User`/`UserEvents`.
- At most one active reports-to edge per user, enforced at the DB level by the partial `UNIQUE` index (`type='direct'` only) — not by an application-level pre-check.
- Router: implement `type: 'direct'` on the shared generic `POST/DELETE /users/:id/relationships` endpoint (AD-14) — not a bespoke `/users/:id/manager`-style endpoint.
- This story owns hand-authoring the `Relationship` migration (3-armed `CHECK` + partial `UNIQUE` as raw SQL, per epic-4-context.md's Technical Decisions) — document the manual-SQL step in the migration itself; do not rediscover this mid-implementation.

**Ask First:**
- **Design call, not directly sourced** (epics.md line 370): reassigning an employee who already has an active reports-to edge is treated as reject-then-retry — the DB-level `UNIQUE` constraint rejects a second concurrent edge with `409` — rather than an implicit replace-on-`POST`. HR Admin must `DELETE` the existing edge before `POST`-ing a new one. This is flagged because no scenario doc exists yet to confirm it; **confirm with a human before the stage-2 E2E test is drafted**, since the `409` acceptance criterion below and the scenario doc built from it both depend on this call.
- Folder/naming convention for the new `docs/test-cases/user-management/relationships/` scenario docs (e.g. `um-rel-*`) isn't established yet — no prior story created this folder. Confirm naming before drafting stage-1 docs.

**Never:**
- Don't implement `type: 'mentorship'` handling in this story, even though it shares the same endpoint file — that's Story 4.2's scope.
- Don't implement `type: 'project'` — separately owned, out of scope for this epic.
- No soft delete, `deletedAt`, or `isActive` column on `Relationship`.
- No `manager_change` `UserEvents` type — no named consumer exists today (AD-11); don't add one speculatively. A revoked reports-to edge simply loses that history, by design.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Success | Alice has no active reports-to edge; Root submits `POST /users/<aliceId>/relationships` with `{ type: 'direct', targetId: <bobId> }` | `201`, a `Relationship` row created (`type: 'direct'`, `userId: aliceId`, `reportsToUserId: bobId`) | N/A |
| Conflict — reassign without revoke | Alice already has an active reports-to edge to Bob; Root submits a second `POST` with a different `targetId`, without first deleting the existing edge | N/A | `409` — reports-to is a tree, not a graph (AD-11); existing edge unchanged |
| Revoke | Alice has an active reports-to edge to Bob; Root submits `DELETE /users/<aliceId>/relationships/<relationshipId>` | `200`, the row is hard-deleted; a subsequent read shows Alice with no manager | N/A |
| Unauthorized | Colin holds no HR Admin functional role; Colin submits `POST /users/<aliceId>/relationships` with `type: 'direct'` | N/A | `403`, no row created |

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/relationships/` -- NEW folder, does not exist yet: needs reports-to scenario docs (naming TBD, e.g. `um-rel-01..04`) -- AD-1 stage 1, blank page, **not yet started**
- `test/user-management/relationships.e2e-spec.ts` -- NEW, does not exist yet anywhere -- confirmed absent from the current working tree and from the backend submodule's `user-management` branch (`git -C services/backend ls-tree -r user-management --name-only | grep -i relation` returns nothing) -- AD-1 stage 2, **not yet started**
- `services/backend/prisma/schema.prisma` -- ADD `Relationship` model: `id` uuidv7, `userId` FK, `type` (`'direct'|'project'|'mentorship'`), `reportsToUserId` FK nullable, `projectId` FK nullable -- plain-field-only representation; the `CHECK`/partial-`UNIQUE` cannot be expressed here (see epic-4-context.md Technical Decisions)
- `services/backend/prisma/migrations/` -- NEW migration: `prisma migrate dev --create-only`, then hand-edit the generated `migration.sql` to add the 3-armed `CHECK` constraint and `CREATE UNIQUE INDEX ... WHERE type = 'direct'` as raw SQL -- this story owns authoring it once for the whole epic
- `services/backend/src/user-management/domain/entities/relationship.entity.ts` -- NEW
- `services/backend/src/user-management/domain/services/assign-reports-to.service.ts` -- NEW: `type:'direct'` assign/revoke invariants (uniqueness enforcement delegated to the DB constraint, not re-checked here)
- `services/backend/src/user-management/application/dtos/create-relationship.dto.ts` -- NEW: `{ type, targetId }` shape, shared with Story 4.2's `type:'mentorship'` variant
- `services/backend/src/user-management/application/controllers/relationships.controller.ts` -- NEW: `POST/DELETE /users/:id/relationships`, calls session-resolver then access-control port before the action (reuse Story 1.1's port interfaces)
- `services/backend/src/user-management/application/actions/assign-relationship.action.ts`, `revoke-relationship.action.ts` -- NEW: this story wires the `type:'direct'` path only
- `services/backend/src/user-management/infrastructure/relationship.repository.ts` -- NEW: Prisma-backed; translates the DB `UNIQUE`-violation into a `409` at the repository/action boundary
- `services/backend/src/user-management/infrastructure/fakes/access-control.adapter.ts` -- EXTEND: recognize the reports-to write capability in the fixture-backed fake

## Tasks & Acceptance

**Execution:**
- [ ] Write `docs/test-cases/user-management/relationships/` scenario docs for reports-to (confirm naming/folder convention first) and get them approved -- AD-1 stage 1, not yet started
- [ ] `test/user-management/relationships.e2e-spec.ts` -- write failing E2E tests for the 4 I/O scenarios above -- AD-1 stage 2, not yet started
- [ ] Resolve the reject-then-retry "Ask First" item with a human before the stage-2 E2E test is drafted
- [ ] `prisma/schema.prisma` -- add the `Relationship` model (plain fields only)
- [ ] `prisma migrate dev --create-only` + hand-edit `migration.sql` -- add the 3-armed `CHECK` and the partial `UNIQUE` (`type='direct'`) as raw SQL
- [ ] `domain/**` -- entity + service for `type:'direct'` assign/revoke
- [ ] `infrastructure/**` -- Prisma repository (unique-violation → `409` translation), extend the access-control fake
- [ ] `application/**` + router wiring -- `POST/DELETE /users/:id/relationships` handler, DTO, actions

**Acceptance Criteria:**
- Given the 4 E2E scenarios above, when `npm run test:e2e` runs, then all pass with no real network calls
- Given the new migration, when `npm run db:migrate` runs, then the `CHECK` and partial `UNIQUE` constraints are present and enforced at the DB level (a second concurrent `type='direct'` edge for the same `userId` is rejected)

## Design Notes

Reject-then-retry relies on the DB-level partial `UNIQUE` constraint surfacing a conflict, rather than an application-level "does Alice already have an edge?" pre-check — a pre-check has a race window between the check and the write under concurrent requests, while the DB constraint is atomic. The repository/action layer catches the resulting unique-violation and maps it to `409`, keeping the invariant enforced in exactly one place (the schema), matching the DB-authority framing of AD-11 already used for `Relationship`'s uniqueness rule.

This story's controller/action files are shared with Story 4.2, which adds a `type:'mentorship'` branch alongside this story's `type:'direct'` branch — keep the DTO and handler shaped to make that extension additive (a `type` discriminant dispatch) rather than something Story 4.2 has to refactor around.

## Verification

**Commands:**
- `npm run db:migrate` -- new migration applies cleanly, `CHECK`/partial-`UNIQUE` present
- `npm run test:e2e` -- `user-management/relationships` reports-to specs pass
- `npm run build` -- no TS errors
- `npm run lint` -- clean
