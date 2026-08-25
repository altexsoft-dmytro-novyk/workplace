---
title: 'Story 4.2: HR Admin Pairs or Unpairs a Mentor and Mentee'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No mechanism exists to record mentor/mentee pairings. FR-14 requires both the pairing fact and that attach/detach fire the right career-timeline events (`mentorship_start`/`mentorship_end`) so downstream consumers (career timeline, dashboards) see mentorship history. Status tracking beyond active/ended and notifications stay out of scope — that belongs to a future, separately-scoped `mentorship` bounded context.

**Approach:** Extend the generic `POST/DELETE /users/:id/relationships` endpoint (scaffolded by Story 4.1, reusing its `Relationship` model and migration unchanged) with a `type: 'mentorship'` branch. On attach, synchronously write a `UserEvents` row (`type: 'mentorship_start'`, `source: 'system'`) in the same transaction as the `Relationship` insert; on detach, the same for `mentorship_end`. This must use Epic 3's existing synchronous, same-transaction write-hook pattern (AD-11) rather than invent a second mechanism.

## Boundaries & Constraints

**Always:**
- AD-1 gate, blank page (epic-4-context.md): no scenario doc exists yet for mentorship pairing, and no E2E test exists anywhere (confirmed against the backend submodule's `user-management` branch, read-only). Draft and get scenario docs approved (stage 1), then write failing E2E tests (stage 2), then implement (stage 3). This story's Tasks below list stage 1 and stage 2 as the first, unchecked items.
- Reuses Story 4.1's `Relationship` Prisma model and hand-authored migration as-is — no schema changes, no second migration. Depends on Story 4.1 having landed the model on the branch this story builds from.
- Genuinely blocked on Epic 3's write path (epics.md Epic Sequencing, lines 117-125: *"Epic 4 is a genuine sequence point on Epic 3 — mentorship attach/detach fires `UserEvents` rows, so it needs Epic 3's write path first"*). The `UserEvents` write this story fires must go through whatever synchronous call mechanism Epic 3's Story 3.1 establishes — not a new one.
- `UserEvents` write happens synchronously, in the same DB transaction as the `Relationship` insert/delete, via an explicit call from this use-case's code (AD-11 binding constraint) — no event bus, no generic table-change listener, no `EventEmitterModule`-style pub/sub.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Every entitlement check is a single AccessControl-facade call (AD-9) — HR Admin functional role, same shape as Story 4.1's reports-to check.
- Mentorship carries no one-at-a-time uniqueness constraint — do not add a `UNIQUE` index or an application-level check preventing a second concurrent mentorship edge for the same user.
- `Relationship` rows are hard-deleted only, same as Story 4.1 — no soft delete.

**Ask First:**
- Whether the mentorship write capability reuses Story 4.1's HR-Admin capability constant for the relationships endpoint, or needs its own named one — confirm before implementing (mirrors spec-1-4's identical open question about the deactivation capability's naming).
- Confirm Story 4.1's `Relationship` model and migration have actually landed on the branch this story builds on before extending it — do not assume it's merged.
- The exact call site/interface for Epic 3's synchronous `UserEvents` write mechanism (Story 3.1) is not yet spec'd as of this story's authoring — confirm its shape with a human (or with Story 3.1's own spec, once it exists) before wiring the mentorship attach/detach handlers.

**Never:**
- No status tracking beyond active/ended, no notifications — future `mentorship` bounded context, explicitly out of scope.
- Don't add a test case asserting "a mentorship edge grants no access tier" — that negative assertion belongs to access-control's own suite (epics.md line 417), not duplicated here.
- Don't add a one-mentor-at-a-time `UNIQUE` constraint — AD-11 explicitly leaves mentorship unconstrained.
- Don't build a second `UserEvents` write mechanism, event bus, or listener — reuse Epic 3's synchronous same-transaction pattern exactly.
- Don't re-author or modify Story 4.1's migration.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Success | Alice has no active mentorship edge; Root submits `POST /users/<aliceId>/relationships` with `{ type: 'mentorship', targetId: <paulaId> }` | `201`, a `Relationship` row created (`type: 'mentorship'`, `userId: aliceId` as mentee, `reportsToUserId: paulaId` as mentor) AND a `UserEvents` row written for Alice (`type: 'mentorship_start'`, `source: 'system'`) | N/A |
| No uniqueness — second concurrent pairing | Alice already has an active mentorship edge to Paula; Root submits a second `POST` with a different mentor | `201` — unlike reports-to, mentorship carries no one-at-a-time uniqueness constraint (AD-11, explicitly left unconstrained) | N/A |
| Unpair | Alice has an active mentorship edge to Paula; Root submits `DELETE /users/<aliceId>/relationships/<relationshipId>` | `200`, the row is hard-deleted, AND a `UserEvents` row written for Alice (`type: 'mentorship_end'`, `source: 'system'`) | N/A |
| Unauthorized | Colin holds no HR Admin functional role; Colin submits `POST /users/<aliceId>/relationships` with `type: 'mentorship'` | N/A | `403`, no row created, no `UserEvents` row written |

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/relationships/` -- SHARED folder with Story 4.1 (naming/subfolder convention TBD, confirm alongside Story 4.1): needs mentorship scenario docs -- AD-1 stage 1, blank page, **not yet started**
- `test/user-management/relationships.e2e-spec.ts` -- EXTEND Story 4.1's file with mentorship cases (or a sibling file, naming TBD) -- confirmed no relationships E2E spec exists anywhere yet, including the backend submodule's `user-management` branch -- AD-1 stage 2, **not yet started**
- `services/backend/prisma/schema.prisma`, `services/backend/prisma/migrations/` -- REUSE Story 4.1's `Relationship` model and hand-authored migration unchanged -- no schema changes for this story
- `services/backend/src/user-management/domain/services/pair-mentorship.service.ts` -- NEW: `type:'mentorship'` pair/unpair invariants; calls the shared `UserEvents` write mechanism Epic 3's Story 3.1 establishes (exact interface TBD, see Ask First) rather than writing to `UserEvents` directly
- `services/backend/src/user-management/application/controllers/relationships.controller.ts` -- EXTEND Story 4.1's handler: same `POST/DELETE /users/:id/relationships` endpoint, add the `type:'mentorship'` branch
- `services/backend/src/user-management/application/actions/assign-relationship.action.ts`, `revoke-relationship.action.ts` -- EXTEND Story 4.1's actions to dispatch on `type:'mentorship'`, invoking the `UserEvents` write synchronously in the same transaction as the `Relationship` write
- `services/backend/src/user-management/infrastructure/relationship.repository.ts` -- REUSE Story 4.1's repository as-is
- Epic 3's `UserEvents` write mechanism (exact file/interface not yet fixed — Epic 3's stories are not yet spec'd as implementation artifacts as of this writing) -- this story's mentorship write path must call into it, not duplicate it

## Tasks & Acceptance

**Execution:**
- [ ] Write mentorship scenario docs under `docs/test-cases/user-management/relationships/` and get them approved -- AD-1 stage 1, not yet started
- [ ] `test/user-management/relationships.e2e-spec.ts` (or sibling file) -- write failing E2E tests for the 4 mentorship I/O scenarios above -- AD-1 stage 2, not yet started
- [ ] Confirm Story 4.1's `Relationship` model/migration/endpoint have landed before extending them
- [ ] Resolve the "Ask First" items (capability naming, Epic 3 write-mechanism interface) with a human before wiring code
- [ ] `domain/**` -- pair/unpair mentorship service, calling Epic 3's synchronous same-transaction `UserEvents` write hook
- [ ] `application/**` -- extend the shared controller/actions to branch on `type:'mentorship'`
- [ ] `infrastructure/**` -- confirm repository reuse; no new migration

**Acceptance Criteria:**
- Given the 4 E2E scenarios above, when `npm run test:e2e` runs, then all pass with no real network calls, including the `UserEvents` row assertions in the success and unpair scenarios
- Given a mentorship attach or detach, when the transaction commits, then the `Relationship` write and the `UserEvents` write are atomic — both succeed or both roll back, with no separate follow-up write

## Design Notes

This story deliberately adds no new write mechanism: the `UserEvents.mentorship_start`/`mentorship_end` rows must be produced by the same synchronous, same-transaction call pattern Epic 3's Story 3.1 establishes for `joined_company`/`position_change` (AD-11) — an explicit call from this use-case's code, not a bus or listener. Since Epic 3's exact interface isn't fixed as of this story's authoring, the domain service should be written against a small port/interface for "write a career-timeline event" so the concrete call site can be wired once Epic 3's shape is confirmed, rather than hard-coding a guess now.

The controller/action files are shared with Story 4.1: this story adds a `type:'mentorship'` branch alongside Story 4.1's `type:'direct'` branch in the same handler, consistent with AD-14's one-endpoint-per-fact-family shape. No access-tier test case is added here for "mentorship grants no tier" — that's access-control's suite's responsibility, per epics.md's explicit note not to duplicate it.

## Verification

**Commands:**
- `npm run test:e2e` -- `user-management/relationships` mentorship specs pass
- `npm run build` -- no TS errors
- `npm run lint` -- clean
