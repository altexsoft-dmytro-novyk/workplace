---
title: 'Story 1.4: HR Admin Deactivates an Employee'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no way to mark an employee who has left as inactive. `User.isActive` exists as a seeded field (Story 1.1), but nothing ever flips it, and no `DELETE /users/:id` handler exists on the `user-management` module.

**Approach:** Add a `DELETE /users/:id` soft-delete handler to the `user-management` module built in Story 1.1 — one new controller action plus one domain-service method that flips `isActive` to `false` via the existing repository. Gate it behind the same session-resolver and access-control ports Story 1.1 already defined (an FR capability check, no target employee scope, by symmetry with registration's `um-reg-03`). This story does not touch `GET /users` list filtering or any exclusion-of-inactive-users behavior — that is Story 1.5's `um-deact-02`.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `docs/test-cases/user-management/deactivation/um-deact-01-hr-admin-deactivate-success.md` and `um-deact-03-deactivate-without-permission.md` approved (both already drafted, pending approval), then reconcile the E2E test, then implement to green — never code before both scenario docs are approved and the E2E assertions for this story's two cases are confirmed red against current code.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Soft delete only: the handler flips `isActive` to `false` and nothing else; the row is never physically deleted; `GET /users/:id` must keep returning the full record afterward — never a `404`.
- The authorization check is a single AccessControl-facade call (AD-9), an FR capability check with no target — never inline role logic in the controller. Reuse Story 1.1's `access-control.port.ts` / `session-resolver.port.ts` interfaces rather than defining new ones.
- Reuse Story 1.1's `src/user-management/{domain,application,infrastructure}` hexagonal skeleton (entity, repository, ports, fake adapters) — this story extends it, it does not rebuild it.

**Ask First:**
- Story 1.1's hexagonal skeleton currently exists only as `stash@{0}` ("story-1.1-premature-implementation") on a detached HEAD, not committed to any branch — confirm with the human how/when it lands on a real branch before this story's code stage starts building on top of it.
- `GET /users/:id` does not exist yet anywhere in the codebase (verified: absent from both the current working tree and the stashed Story 1.1 controller, which only wires `POST /users`). Both this story's own acceptance criteria and its already-written E2E test depend on `GET /users/<id>` returning `200` with the full record after deactivation. Story 1.2 ("View and Edit an Employee's Identity-Card Fields") is the conceptual owner of read-by-id but is still `backlog` with no story file yet. Confirm with the human whether this story also builds a minimal `GET /users/:id` handler, or whether Story 1.2 must land first — do not assume either resolution without sign-off.
- Whether the access-control fake adapter needs a new named capability constant (e.g. a `DEACTIVATE_USER_FEATURE` sibling to Story 1.1's `CREATE_USER_FEATURE`) or reuses an existing one — confirm naming before implementing.

**Never:**
- No real row deletion.
- No `updatedAt`/`updatedBy` field — no named consumer, don't add speculatively.
- Don't implement or claim `um-deact-02` ("deactivated user excluded from the active-only list") as this story's acceptance criterion — it belongs to Story 1.5's `GET /users?isActive=` filter, even though its scenario doc lives in the same `deactivation/` folder and its E2E case lives in the same spec file.
- Don't modify `GET /users` list behavior in this story.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Success | Root (HR Admin), Colin seeded `isActive: true` | `DELETE /users/<colinId>` → `200`, body `isActive: false`; follow-up `GET /users/<colinId>` → `200`, full record, `isActive: false`, never `404` (um-deact-01) | N/A |
| Unauthorized | Bob, holds no HR Admin functional role, Alice seeded `isActive: true` | `DELETE /users/<aliceId>` | `403`; follow-up `GET /users/<aliceId>` → `200`, `isActive: true`, unchanged (um-deact-03) |

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/deactivation/um-deact-01-hr-admin-deactivate-success.md`, `um-deact-03-deactivate-without-permission.md` -- EXIST (status: draft, pending approval) -- this story's two scenarios; get approved, do not rewrite
- `docs/test-cases/user-management/deactivation/um-deact-02-deactivated-user-excluded-from-active-list.md` -- EXISTS, same folder, but OUT OF SCOPE for this story -- belongs to Story 1.5
- `test/user-management/deactivation.e2e-spec.ts` -- EXISTS on backend branch `user-management` (commit 865df5f), not in the current working tree -- reconcile/extend, do not recreate. Covers `um-deact-01`, `um-deact-02`, and `um-deact-03` together in one suite (`um-deact-02` reuses the Colin deactivated by `um-deact-01` via a closure variable). This story's implementation turns 2 of its 3 cases green (`um-deact-01`, `um-deact-03`); the third (`um-deact-02`) only goes green once Story 1.5 lands `GET /users` with an `isActive` filter.
- `src/user-management/{domain,application,infrastructure}/**` -- REUSE Story 1.1's hexagonal skeleton (entity, repository, `session-resolver.port.ts`, `access-control.port.ts`, fake adapters) -- currently only in `stash@{0}`, not on a branch (see Ask First)
- `src/user-management/application/controllers/users.controller.ts` -- EXTEND: add `DELETE :id` handler, calling `sessionResolver.resolve` then `accessControl.isAllowed` before the action, mirroring the existing `POST` handler's gating shape
- `src/user-management/application/actions/deactivate-user.action.ts` -- NEW
- `src/user-management/domain/services/deactivate-user.service.ts` -- NEW: flips `isActive` to `false` only, no other field writes
- `src/user-management/infrastructure/user.repository.ts` -- EXTEND: add a method to persist the `isActive: false` update by id
- `src/user-management/infrastructure/fakes/access-control.adapter.ts` -- EXTEND: recognize the deactivation capability in the fixture-backed fake bound in the test module (see Ask First on naming)
- `GET /users/:id` handler -- NOT YET BUILT anywhere in the codebase; this story's own AC depends on it (see Ask First) -- do not build silently, confirm ownership first

## Tasks & Acceptance

**Execution:**
- [ ] Get `um-deact-01`, `um-deact-03` approved -- AD-1 stage 1 (note: `um-deact-02` stays out of this story's approval scope)
- [ ] Resolve the "Ask First" items above (skeleton branch landing, `GET /users/:id` ownership, capability naming) with the human before extending code
- [ ] Reconcile `test/user-management/deactivation.e2e-spec.ts` (branch `user-management`, commit 865df5f) against the approved scenario docs; confirm `um-deact-01` and `um-deact-03` are red against current code -- AD-1 stage 2
- [ ] `domain/services/deactivate-user.service.ts` -- pure logic first
- [ ] `infrastructure/user.repository.ts` -- extend with the `isActive`-flip persistence method
- [ ] `application/actions/deactivate-user.action.ts` + `application/controllers/users.controller.ts` -- wire `DELETE :id`, gated by the existing ports
- [ ] `infrastructure/fakes/access-control.adapter.ts` -- extend fake for the deactivation capability
- [ ] Confirm `GET /users/<id>` returns the full record post-deactivation per the resolved Ask-First decision

**Acceptance Criteria:**
- Given `um-deact-01` and `um-deact-03`, when `npm run test:e2e` runs the reconciled `deactivation.e2e-spec.ts`, then both pass
- Given `um-deact-02` in the same spec file, when `npm run test:e2e` runs, then it is understood to remain red/pending until Story 1.5 lands `GET /users` filtering -- not this story's responsibility to turn green
- Given `src/user-management` after this story's changes, when `npm run build` runs, then it succeeds with no dangling imports

## Design Notes

This story is a small, additive extension of Story 1.1's skeleton rather than new module scaffolding: one controller handler, one action, one domain-service method, one repository method. The access-control gating repeats Story 1.1's `POST /users` shape exactly (resolve session, then a single no-target `isAllowed` call) so the two handlers stay symmetric, per the scenario doc's own stated assumption ("by symmetry with registration's `um-reg-03`").

The shared E2E spec file (`deactivation.e2e-spec.ts`) is a three-case suite split across two stories: this story owns making `um-deact-01`/`um-deact-03` pass, Story 1.5 owns making `um-deact-02` pass. Whoever implements this story should not "fix" `um-deact-02` opportunistically — that pulls `GET /users` filtering work forward out of sequence and duplicates Story 1.5's own AD-1 gate.

The `GET /users/:id` gap is the biggest open risk for this story: both the scenario docs and the existing E2E test assume it already works, but it isn't built anywhere yet, and its conceptual owner (Story 1.2) hasn't started. This needs a human decision before code starts, not a silent scope grab in either direction.

## Verification

**Commands:**
- `npm run test:e2e` -- `user-management/deactivation` spec: `um-deact-01` and `um-deact-03` pass; `um-deact-02` expected to remain red pending Story 1.5
- `npm run build` -- no TS errors, no dangling imports
- `npm run lint` -- clean
