---
title: 'Story 6.1 — Read the current reporting-line manager and People Partner'
type: 'feature'
created: '2026-09-04'
status: 'done'
review_loop_iteration: 0
gate_decision: 'Option B (2026-09-04, Dmytro): {reporting,pp} audience OR isAllowed(org:relationships:write)'
baseline_commit: 'bc6fd9ed9ac0cc81fc02731e342bf7932f4935db'
epic: 6
story_num: 1
story_key: '6-1-read-current-manager-and-people-partner'
baseline_revision: '2df94247ce2777e80afe33a4a20c45439e00a7c7'
baseline_revision_backend: 'bc6fd9ed9ac0cc81fc02731e342bf7932f4935db'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/user-management/epic-6-context.md'
  - '{project-root}/docs/architecture/api-conventions.md'
  - '{project-root}/docs/architecture/domain-driven-design.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Epic 4 shipped the write paths for an employee's manager and People
Partner but no way to read them. The landed G4 frontend cannot show the current
manager/PP, cannot obtain the `relationshipId` that a reports-to reassignment
needs (DEC-UM-005 makes it an explicit DELETE-then-POST), and cannot seed the PP
`expectedCurrentTargetId` optimistic-concurrency token.

**Approach:** Add `GET /users/:id/relationships` — a read-only projection over
`Relationship` returning the employee's current `direct` (manager) and
`people_partner` edges, each as `{ relationshipId, type, target: { id,
firstName, lastName } }`. No writes, no journal row.

## Boundaries & Constraints

**Always:**
- Hexagonal layout (`domain-driven-design.md`): `domain/` imports nothing from
  Prisma / NestJS transport / HTTP; only a domain service may `@Inject` a port;
  the action calls the service. A **new** reader port + service + adapter trio —
  do not add a read method to the write-only `OrgRelationshipWriterPort`.
- "Current" = the row exists. `Relationship` is hard-deleted (no `validTo`, no
  flag); partial UNIQUE indexes guarantee ≤1 `direct` and ≤1 `people_partner`
  row per `userId`. One query, no N+1: `findMany({ where: { userId, type: { in:
  ['direct','people_partner'] } }, include: { reportsTo: { select: { id,
  firstName, lastName } } } })` (pattern: `departure.repository.ts`).
- Bare `{ data: CurrentEdgeView[] }` collection, **no `canEdit`** (mirrors
  `GET /users/:id/access-journal`). `data: []` when the employee has neither
  edge — never `404` for an active target with no edges.
- Denial oracle = PM/AD-24 five-clause (`access-control.md` §2.2): `401`
  unresolved/inactive session; `404` leak-free when `:id` is not an active
  `User`, decided **before** the gate check; `403` leak-free when the target
  is visible but the viewer is not entitled to read the section.
- **Access gate — DECIDED 2026-09-04 (Dmytro), Option B: audience OR the
  `org:relationships:write` capability.** The viewer may read iff
  `resolveAudiences(viewer, [target]) ∩ {reporting, pp} ≠ ∅` **OR**
  `isAllowed(viewer, 'org:relationships:write')` (the no-target HR capability
  that performs reassignments — "edit implies read"). Implement as an in-action
  gate (no `@RequireFeature` on the route): a **new** reader-access port +
  service + adapter (`OrgSectionReadAccessPort` / `...Service` /
  `...FacadeAdapter`), modelled on the `AccessJournalAccess*` trio but with the
  added `isAllowed('org:relationships:write')` OR-leg. This is a conscious
  divergence from the journal-read gate, which deliberately omits any
  functional-permission leg — recorded in `api-conventions.md` in this change.
- `docs/architecture/api-conventions.md` gains the route entry (Shape 4, beside
  the `POST .../relationships` / `.../people-partner` lines) in this same change,
  including the gate divergence note.
- E2E is written first and committed red (AD-1 Stage-2), then made green.

**Never:**
- Rolling manager/PP onto `GET /users/:id` (that is the Access-Control-owned
  `{ data, canEdit }` derived-fields roll-out, a separate item).
- Returning historical/closed edges, `type='project'` edges (sync-owned), a
  `canEdit` hint, pagination, or a new `canAccessSection` section string.
- A batch `UserService` method (use the `reportsTo` relation `include`).
- Any `AccessJournal` / `UserEvents` write.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Manager + PP both set | viewer is target's reporting-line manager; target has a `direct` edge → M and a `people_partner` edge → P | `200` `{ data: [ { relationshipId, type: 'direct', target: {id,firstName,lastName of M} }, { relationshipId, type: 'people_partner', target: {…P} } ] }` | N/A |
| PP only | viewer is target's assigned PP; target has a `people_partner` edge, no manager | `200` `{ data: [ { type: 'people_partner', … } ] }` | N/A |
| No edges | target active, no `direct` and no `people_partner` row; viewer entitled | `200` `{ data: [] }` | not a `404` |
| Visible but not entitled | target active; viewer resolves only `self`/`colleague` **and** does not hold `org:relationships:write` | `403` | leak-free body — nothing about the edges or the target |
| Entitled by capability | target active; viewer holds `org:relationships:write` but has no `reporting`/`pp` audience over the target | `200` with the current edges | N/A |
| Target missing / inactive | `:id` is not an active `User` | `404` | leak-free; decided before the audience check |
| No / unresolved session | no `Authorization`, or `Bearer <token:Persona>` resolving to nobody | `401` | — |

</frozen-after-approval>

## Code Map

- `services/backend/src/user-management/application/controllers/relationships.controller.ts` — add `@Get(':id/relationships')` immediately after `@Post(':id/relationships')` (~L69); **no** `@RequireFeature` (in-action gate), `@CurrentSession() session` + `@Param('id') id`. Mirrors `@Get(':id/access-journal')` (L151). Class already `@UseGuards(SessionGuard, AccessControlGuard)`.
- `services/backend/src/user-management/application/actions/get-relationships.action.ts` — **new**. Model on `get-access-journal.action.ts`: (1) `userService.findById(id)` → `NotFoundException` if absent/inactive; (2) reader-gate check → `ForbiddenException`; (3) `readerService.listCurrentEdges(id)` → `{ data: rows.map(toCurrentEdgeView) }`.
- `services/backend/src/user-management/domain/interfaces/org-relationship-reader.port.ts` — **new**. `OrgRelationshipReaderPort { listCurrentEdges(subjectId): Promise<CurrentEdge[]> }` + `ORG_RELATIONSHIP_READER_PORT = Symbol(...)`. `CurrentEdge = { id; type: 'direct' | 'people_partner'; target: { id; firstName; lastName } }`.
- `services/backend/src/user-management/domain/services/org-relationship-read.service.ts` — **new**. Thin; `@Inject(ORG_RELATIONSHIP_READER_PORT)`; one `listCurrentEdges` pass-through.
- `services/backend/src/user-management/infrastructure/org-relationship-reader.repository.ts` — **new**. Implements the port; the `findMany` + `include: { reportsTo: { select } }` query. Pattern: `departure.repository.ts` L236-247.
- **Gate trio (new, Gate B)** — `src/user-management/domain/interfaces/org-section-read-access.port.ts` + `domain/services/org-section-read-access.service.ts` + `infrastructure/org-section-read-access-facade.adapter.ts`. Model exactly on the `AccessJournalAccess*` trio (`access-journal-access.port.ts` / `.service.ts` / `access-journal-access-facade.adapter.ts`, `JOURNAL_READ_AUDIENCES = new Set(['reporting','pp'])`). The adapter's `canRead(viewerId, subjectId)` = `resolveAudiences(viewerId,[subjectId]) ∩ {reporting,pp} ≠ ∅` **OR** `facade.isAllowed(viewerId, 'org:relationships:write')`. An empty/unknown subject audience + no capability → denied.
- `services/backend/src/user-management/domain/services/user.service.ts` (L29 `findById`) — the 404-on-missing-target check.
- `services/backend/src/user-management/application/dtos/relationships-view.response.ts` — **new**. `CurrentEdgeView`, `RelationshipsEnvelope { data: CurrentEdgeView[] }`, `toCurrentEdgeView(edge)`. Distinct from the bare-edge `relationship.response.ts`.
- `services/backend/src/user-management/user-management.module.ts` — register the new action (providers ~L106), the read service, and `{ provide: ORG_RELATIONSHIP_READER_PORT, useClass: OrgRelationshipReaderRepository }` (~L164).
- `services/backend/prisma/schema.prisma` (L292-308) — `Relationship { id, userId, type, reportsToUserId }`, `reportsTo` relation, `@@index([userId, type])`. **Read-only** reference — no schema change.
- `services/backend/test/user-management/epic-4/relationships-read.e2e-spec.ts` — **new**. `bootstrapTestApp`, `RunFixtures` (`fx.user`, `fx.reportsTo`, `fx.peoplePartnerOf`, `fx.grantFunctionalRole`), `bearer`. Model on `epic-4/access-journal.e2e-spec.ts` (incl. the no-bearer `401` case and `expectLeakFreeBody`).
- `docs/architecture/api-conventions.md` (L28-32, Shape 4) — add the read route contract.

## Tasks & Acceptance

**Execution:**
- [x] `services/backend/test/user-management/epic-4/relationships-read.e2e-spec.ts` -- write every I/O-matrix row as a real-consumer E2E (`bootstrapTestApp`, seeded `User`/`Relationship` fixtures, `bearer`), committed **red** -- AD-1 Stage-2 evidence before code.
- [x] `services/backend/src/user-management/domain/interfaces/org-relationship-reader.port.ts` -- new reader port + symbol + `CurrentEdge` type -- keep reads off the write-only port (feedback: dead abstractions / port ownership).
- [x] `services/backend/src/user-management/infrastructure/org-relationship-reader.repository.ts` -- implement the port with the single `findMany` + `reportsTo` include -- hard-delete "current" model, no N+1.
- [x] `services/backend/src/user-management/domain/services/org-relationship-read.service.ts` -- thin domain service injecting the reader port -- action never `@Inject`s a port (feedback).
- [x] `services/backend/src/user-management/domain/interfaces/org-section-read-access.port.ts` + `domain/services/org-section-read-access.service.ts` + `infrastructure/org-section-read-access-facade.adapter.ts` -- new Gate-B trio ({reporting,pp} audience OR `isAllowed('org:relationships:write')`) -- modelled on `AccessJournalAccess*`.
- [x] `services/backend/src/user-management/application/dtos/relationships-view.response.ts` -- `CurrentEdgeView` + `RelationshipsEnvelope` + `toCurrentEdgeView` -- new shape, not the bare-edge one.
- [x] `services/backend/src/user-management/application/actions/get-relationships.action.ts` -- new action: 404-on-missing → reader-gate 403 → list -- ordering matters (404 precedes the audience check).
- [x] `services/backend/src/user-management/application/controllers/relationships.controller.ts` -- add `@Get(':id/relationships')` after the POST sibling, no `@RequireFeature` -- route ordering + in-action gate parity with access-journal.
- [x] `services/backend/src/user-management/user-management.module.ts` -- wire the action, the read service, the gate service, and the two new port providers (`ORG_RELATIONSHIP_READER_PORT` -> repository, `ORG_SECTION_READ_ACCESS_PORT` -> facade adapter).
- [x] `services/backend/src/user-management/application/actions/__tests__/get-relationships.action.spec.ts` -- unit-test the matrix branches (missing→404, not-entitled→403, empty→`{data:[]}`, both-edges shape) with the ports faked.
- [x] `docs/architecture/api-conventions.md` -- document `GET /users/:id/relationships` (response shape, bare `{ data }`, in-action reader gate, denial oracle) beside Shape 4.

**Acceptance Criteria:**
- Given a target with a `direct` and a `people_partner` edge and a viewer on the target's reporting line, when the viewer calls `GET /users/:id/relationships`, then the response is `200` with both current edges, each carrying `relationshipId`, `type`, and the target user's `{ id, firstName, lastName }`, and no closed/`project` edge appears.
- Given an active target with no relationship rows, when an entitled viewer reads, then `200 { data: [] }` — not `404`.
- Given `:id` that is not an active `User`, when any authenticated viewer reads, then `404` with a leak-free body, returned before any audience resolution.
- Given a viewer who resolves only `self`/`colleague` over an active target **and** does not hold `org:relationships:write`, when they read, then `403` with a body that reveals nothing about the target or its edges.
- Given a viewer who holds `org:relationships:write` but has no reporting/PP audience over an active target, when they read, then `200` with the target's current edges (Gate B OR-leg).
- Given no `Authorization` header (or an unresolvable persona token), when the route is called, then `401`.
- Given the implementation is complete, when `npm run build`, `npm run lint`, `npm test`, and `npm run test:e2e -- --testPathPatterns relationships-read` run, then all pass and the previously-red E2E is green.

## Design Notes

- **Gate: Option B, decided 2026-09-04.** `{reporting, pp}` audience **OR**
  `isAllowed('org:relationships:write')`. Everything else follows existing
  precedent: the route/guard shape from `GET /users/:id/access-journal`, the
  query+include from `departure.repository.ts`, the DTO envelope from
  `access-journal.response.ts`, the gate trio from `AccessJournalAccess*`.
- **Why a new reader port, not a method on `OrgRelationshipWriterPort`:** the
  writer port is transactional and journal-aware; a read has neither concern and
  a different adapter (`this.prisma`, not `tx`). Mixing them invites a read that
  accidentally participates in a write transaction.
- **404 precedes 403 by design** (PM/AD-24): the action must resolve target
  existence/activity *before* calling the audience gate, so a hidden target is
  never distinguishable from an un-permitted one via timing or code.
- Shape sketch:
  ```ts
  // relationships-view.response.ts
  export interface CurrentEdgeView {
    relationshipId: string;
    type: 'direct' | 'people_partner';
    target: { id: string; firstName: string; lastName: string };
  }
  export interface RelationshipsEnvelope { data: CurrentEdgeView[] }
  ```

## Verification

**Commands:**
- `cd services/backend && npm run build` -- expected: no new TS errors (3 pre-existing epic-4 errors may remain).
- `cd services/backend && npm run lint` -- expected: clean on all new/changed files.
- `cd services/backend && npm test -- get-relationships` -- expected: the new unit spec passes.
- `cd services/backend && npm run test:e2e -- --testPathPatterns relationships-read` -- expected: red before implementation, all green after (needs `npm run db:up`).

## Suggested Review Order

**Design intent — the gate**

- Entry point: the route is guardless because the read gate is in the action; 404 before the gate (PM/AD-24).
  [`get-relationships.action.ts:36`](../../../services/backend/src/user-management/application/actions/get-relationships.action.ts#L36)

- Gate B: `{reporting,pp}` audience OR the `org:relationships:write` capability — the conscious divergence from the journal gate.
  [`org-relationships-read-access-facade.adapter.ts:26`](../../../services/backend/src/user-management/infrastructure/org-relationships-read-access-facade.adapter.ts#L26)

- The route slot: `@Get(':id/relationships')` after its POST sibling, no `@RequireFeature`.
  [`relationships.controller.ts:81`](../../../services/backend/src/user-management/application/controllers/relationships.controller.ts#L81)

**The read + shape**

- "Current" = row exists; `type IN (direct, people_partner)`, `reportsTo.isActive`, explicit `TYPE_RANK` sort (not enum order).
  [`org-relationship-reader.repository.ts:27`](../../../services/backend/src/user-management/infrastructure/org-relationship-reader.repository.ts#L27)

- The response projection: `id` → `relationshipId`, inlined target identity (§3.3.4 always-visible minimum), bare `{ data }`, no `canEdit`.
  [`relationships-view.response.ts:14`](../../../services/backend/src/user-management/application/dtos/relationships-view.response.ts#L14)

**Wiring**

- Two new port bindings + the action registration.
  [`user-management.module.ts:178`](../../../services/backend/src/user-management/user-management.module.ts#L178)

**Peripherals**

- 12 real-consumer E2E rows (one per matrix row + project-exclusion + deactivated-target); verified red→green.
  [`relationships-read.e2e-spec.ts:37`](../../../services/backend/test/user-management/epic-4/relationships-read.e2e-spec.ts#L37)

- 6 action unit tests with ports faked.
  [`get-relationships.action.spec.ts:1`](../../../services/backend/src/user-management/application/actions/__tests__/get-relationships.action.spec.ts#L1)

- The route contract + gate-divergence + ordering note.
  [`api-conventions.md`](../../../docs/architecture/api-conventions.md)
