---
title: 'Story 1.2: View and Edit an Employee''s Identity-Card Fields'
type: 'feature'
created: '2026-08-24'
status: 'in-review'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-1-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Once a `User` row exists (Story 1.1), there is no way yet for an entitled actor (Self / Manager-line / PP) to read one employee's S1 identity-card fields or correct them as roles, locations, and contact details change. `src/user-management/application/controllers/users.controller.ts` currently wires only `POST /users`; neither `GET /users/:id` nor `PATCH /users/:id` exists. Duplicate `workEmail`/`ttId` must be rejected on edit the same way it already is on create (`epic-1-context.md` Requirements & Constraints) — the whole write rejected, the target record left untouched.

**Approach:** Reuse Story 1.1's `src/user-management/{domain,application,infrastructure}` hexagonal skeleton as-is — it currently exists only in the stashed, not-yet-merged premature implementation (`git stash show stash@{0}`) and conceptually in its own story file; this story is blocked on that skeleton landing, and does not recreate it. Add a `PATCH /users/:id` handler (new `UpdateUserDto`, a new domain edit operation, an extended repository) plus the `GET /users/:id` read it needs to verify persistence. Extend `AccessControlPort` with a target-scoped check — Manager-line access is scoped to a specific employee, not a blanket capability (`epic-1-context.md` Technical Decisions: "no-target capability check or a target-scoped tier check") — and extend Story 1.1's fixture-backed fake to grant it. Entitlement resolution itself stays out of scope: this story assumes an already-entitled actor and never inlines role logic.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `um-pf-01`, `um-pf-03`, `um-pf-04` approved (currently draft, pending), then reconcile the existing E2E file to a faithful, human-reviewed translation, then implement to green — never code before that stage-2 checkpoint is real.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- A conflicting `workEmail`/`ttId` write is rejected wholesale (`409`), never a partial update — the existing target record is left completely unchanged (`epic-1-context.md`).
- `ttId` null-vs-null is not a duplicate — the uniqueness check only fires when the incoming value is non-null and collides with another row's non-null value.
- Every entitlement check routes through the `AccessControlPort` facade seam — never inline role/tier logic in the controller or action (`epic-1-context.md`, AD-9).
- Reuse Story 1.1's fake access-control port (extended, not replaced) rather than building a second fake or testing entitlement itself here.
- Design the edit code path so a later epic's automatic change-logging can hook into it without rework (`epic-1-context.md` Cross-Story Dependencies) — one domain operation that produces the new state, not field-by-field mutation scattered across the action.

**Resolved 2026-08-26 (this session, superseding the "Ask First" items below as originally written):**
- `GET /users/:id` is in scope for this story — confirmed by the actually-committed `profile.e2e-spec.ts`, where all four scenarios (including Story 1.3's `um-pf-02`) depend on it.
- `UpdateUserDto`: all S1 fields except `photo`/`isActive`/`id`/`createdAt`/`createdBy`, as originally assumed.
- Target-scoped `AccessControlPort` addition: additive `isAllowedForTarget(userId, feature, targetUserId): Promise<boolean>` alongside Story 1.1's `isAllowed`.
- `profile.e2e-spec.ts` is implemented as-is (shared `createUser`/`beforeAll`, `um-pf-01/03/04` this story, `um-pf-02` Story 1.3) — both stories land in the same session, no coordination gap.
- The Story 1.1 skeleton it assumed (`DuplicateUserFieldError`, `mapKnownErrors`, `fake-access-control.adapter.ts`) was never actually merged from that stash — Story 1.1 was rebuilt fresh with a simpler shape (P2002 → `ConflictException` thrown directly in `UserRepository`; interim adapters named `InterimSessionResolverAdapter`/`InterimAccessControlAdapter`). This story extends *that* real code, not the stash's design — see Code Map below.
- Per epic-1-context.md ("this suite covers workflow/data correctness only, not who is entitled") and confirmed by `profile.e2e-spec.ts` itself (no 401/403 case anywhere in `um-pf-01/03/04`), `isAllowedForTarget`'s interim implementation is permissive (any resolved session) — target-scoped denial is access-control's own suite's job, consistent with Story 1.1's renegotiation.

**Never:**
- No `updatedAt`/`updatedBy` column — omitted deliberately, no named consumer yet, don't add speculatively (`epic-1-context.md`).
- No manager/project/department/mentor fields, on read or write.
- Don't let `PATCH /users/:id` touch `photo` or `isActive` — those are Story 1.3's and Story 1.4's dedicated endpoints.
- Don't implement real entitlement/tier resolution — fixture fake only, per Story 1.1's pattern.
- Don't duplicate entitlement-boundary scenarios (401/403, tier resolution) in this story's own tests — that's access-control's own suite's job (`epic-1-context.md`'s explicit division of labor).

## I/O & Edge-Case Matrix

Source: `epics.md` lines 174-189 (Story 1.2 acceptance criteria, traces `um-pf-01`/`03`/`04`).

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Success | Entitled actor (e.g. Bob, Manager-line to Alice), `PATCH /users/:id` with a subset of editable S1 fields (e.g. `position`, `city`) | `200`, body reflects the new values; a subsequent `GET /users/:id` reflects the same (`um-pf-01`) | N/A |
| Duplicate workEmail | `PATCH` sets `workEmail` to a value another `User` already holds | N/A | `409`; target record's `workEmail` unchanged on a follow-up read (`um-pf-03`) |
| Duplicate ttId | `PATCH` sets `ttId` to a value another `User`'s non-null `ttId` already holds | N/A | `409`; target record's `ttId` unchanged on a follow-up read (`um-pf-04`) |
| ttId null-vs-null | Target's `ttId` is `null`; PATCH doesn't set it to a colliding non-null value (omitted, or another row is also `null`) | Not treated as a duplicate — no `409` on this basis | N/A |

Entitlement-boundary scenarios (unauthenticated, unauthorized, non-entitled actor) are deliberately out of this matrix — they belong to access-control's own suite, not this story's.

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/profile/um-pf-01-manager-update-identity-fields.md`, `um-pf-03-update-work-email-duplicate-denied.md`, `um-pf-04-update-tt-id-duplicate-denied.md` -- EXIST (status: draft, pending approval) -- get approved as AD-1 stage 1; do not rewrite unless approval feedback requires changes. (`um-pf-02` in the same folder belongs to Story 1.3, not this story.)
- `services/backend/test/user-management/profile.e2e-spec.ts` -- EXISTS on backend branch `user-management` (commit `865df5f243a88b43836996cfee909a8e1c37fd68`) -- reconcile/extend, do not recreate. Shared with Story 1.3: this one file covers `um-pf-01..04`, and this story owns only the `um-pf-01`/`03`/`04` describe blocks. Note for stage-2 reconciliation: as currently written, `beforeAll` compiles `AppModule` with no provider overrides — no persona token (`Bearer <token:Bob>` etc.) is ever registered on `FakeSessionResolverAdapter`, and no grant is registered on `FakeAccessControlAdapter`. Both fakes fail closed by default (Story 1.1 Design Notes), so every request in this file would currently `401`/`403` regardless of the PATCH/GET logic under test — flagging this here rather than quietly implementing around it, since closing that gap is properly part of the AD-1 stage-2 human review.
- `services/backend/src/user-management/{domain,application,infrastructure}/**` -- REUSE Story 1.1's hexagonal skeleton (`UserEntity`, `UserRepositoryPort` + Prisma `UserRepository`, `SessionResolverPort`, `AccessControlPort`, and their fakes). Currently only present in stash `story-1.1-premature-implementation`, not yet merged to this branch -- this story is blocked on that skeleton landing; do not recreate it.
- `services/backend/src/user-management/domain/entities/user.entity.ts` -- EXTEND: add an `applyEdit(patch)` method returning a new `UserEntity` instance (keeps the class's existing immutable-instance pattern from `register`/`fromPersistence`; one call site a later change-logging hook can wrap, per Cross-Story Dependencies).
- `services/backend/src/user-management/domain/interfaces/user-repository.port.ts` -- EXTEND: add `findById(id): Promise<UserEntity | null>` and `update(id, patch): Promise<UserEntity>`, throwing the same `DuplicateUserFieldError` contract `create` already uses.
- `services/backend/src/user-management/infrastructure/user.repository.ts` -- EXTEND: implement `findById`/`update`; reuse the existing `mapKnownErrors` P2002 → `DuplicateUserFieldError` mapping (already branches on `workEmail`/`ttId`).
- `services/backend/src/user-management/domain/services/edit-user.service.ts` -- NEW: sibling to `register-user.service.ts`, owns the same "reject wholesale, existing record untouched" invariant for edits.
- `services/backend/src/user-management/domain/interfaces/access-control.port.ts` -- EXTEND: add a target-scoped check (e.g. `isAllowedForTarget(feature, session, targetUserId): boolean`) alongside the existing no-target `isAllowed`, plus an `EDIT_USER_FEATURE` constant.
- `services/backend/src/user-management/infrastructure/fakes/fake-access-control.adapter.ts` -- EXTEND: add a target-scoped grant (e.g. `allowForTarget(userId, targetUserId)`), fail-closed by default like the existing `allow`.
- `services/backend/src/user-management/application/dtos/update-user.dto.ts` -- NEW: partial S1-field DTO, excludes `photo`, `isActive`, `id`, `createdAt`, `createdBy`.
- `services/backend/src/user-management/application/actions/edit-user.action.ts` -- NEW: session-resolver → target-scoped AccessControl check → `edit-user.service.ts`, mirrors `register-user.action.ts`'s shape.
- `services/backend/src/user-management/application/actions/get-user.action.ts` -- NEW (only if `GET /users/:id` is confirmed in-scope, see Ask First above).
- `services/backend/src/user-management/application/controllers/users.controller.ts` -- EXTEND (do not recreate): add `GET /users/:id` (`findOne`) and `PATCH /users/:id` (`update`) handlers alongside the existing `POST /users` handler, same session-resolver → access-control → action sequence.
- `services/backend/src/user-management/user-management.module.ts` -- EXTEND: wire the new action(s)/service/DTO providers; no new DI tokens for session-resolver/repository, only the `AccessControlPort` extension's existing binding is reused.

## Tasks & Acceptance

**Execution:**
- [x] `um-pf-01`, `um-pf-03`, `um-pf-04` -- AD-1 stage 1 approved baseline (2026-08-25), stage 2 E2E blocks committed and verified against scenario docs
- [x] `domain/interfaces/user.repository.port.ts` + `infrastructure/user.repository.ts` -- extended with `findById`/`update` (shared `mapKnownError` for P2002 on both create and update)
- [x] **Removed 2026-08-26 (human-flagged):** `domain/services/edit-user.service.ts` was a pure identity pass-through (`applyEdit(patch) { return patch; }`) — no actual invariant to hold, same dead-abstraction problem already caught and fixed for `deactivate-user.service.ts`. `edit-user.action.ts` now calls `userRepository.update()` directly. `register-user.service.ts`/`NewUser` (Story 1.1) had the identical problem and were removed the same way. The future change-logging hook this was meant to anchor still has one clear call site — `userRepository.update()` itself — so nothing is lost.
- [x] `domain/interfaces/access-control.port.ts` + `infrastructure/interim-access-control.adapter.ts` -- added `isAllowedForTarget`, interim-permissive (any resolved session) per the Resolved note above
- [x] `application/dtos/update-user.dto.ts` -- NEW
- [x] `application/actions/edit-user.action.ts` + `get-user.action.ts` -- NEW
- [x] `application/controllers/users.controller.ts` -- added `GET /users/:id`, `PATCH /users/:id`
- [x] `user-management.module.ts` -- wired new providers
- [x] Run `npm run test:e2e -- profile` -- **3/3 green** for this story's scenarios (`um-pf-01/03/04`); `um-pf-02` (Story 1.3's photo upload) pending that story
- [x] Fixed a real cross-file bug surfaced here: the interim session resolver's "Root" lookup only worked when a file created its own HR-Admin bootstrap row (registration.e2e-spec.ts does; profile.e2e-spec.ts doesn't) -- `interim-session-resolver.adapter.ts` now lazily provisions a stand-in HR-Admin row when none exists, preferring any real one first so `um-reg-01`'s exact-`createdBy` assertion still holds

**Acceptance Criteria:**
- Given the 3 E2E scenarios owned by this story (`um-pf-01/03/04`), when `npm run test:e2e` runs, then all pass with no real network calls -- **met**
- Given a duplicate `workEmail`/`ttId` PATCH, when the write is rejected, then the target record is provably unchanged on a follow-up `GET` -- **met**
- Given `ttId: null` on both the target and another row, when a PATCH omits or doesn't change `ttId`, then no `409` is raised on that basis -- **met** (Postgres unique index treats nulls as distinct; no app-level special-casing needed)

## Design Notes

The `applyEdit`-on-entity + single `edit-user.service.ts` shape is deliberate: it keeps "produce the new state" as one call site the future change-logging hook (`epic-1-context.md` Cross-Story Dependencies) can wrap later, instead of the action mutating fields ad hoc across multiple sites.

The access-control extension adds a second method to the existing port rather than a parallel port, since it's the same facade, just a different check shape — a no-target capability check (Story 1.1's `isAllowed`, used by `POST /users`) vs. a target-scoped tier check (this story's addition, used by `PATCH`/`GET /users/:id`) — matching `epic-1-context.md`'s Technical Decisions wording exactly.

`photo` and `isActive` are structurally excluded from `UpdateUserDto` (the DTO has no such properties) rather than merely ignored at runtime, so a client can't smuggle either through the general edit endpoint even if `ValidationPipe`'s `whitelist` were ever misconfigured.

Entitlement is deliberately not re-tested here: `epic-1-context.md` assigns "who is entitled to do it" to access-control's own suite. This story's own E2E coverage stays scoped to the workflow claims in `um-pf-01/03/04`: the write persists (or is rejected wholesale on a uniqueness conflict), and a subsequent read reflects the correct state.

## Verification

**Commands:**
- `npm run test:e2e` -- `user-management/profile` specs, `um-pf-01/03/04` portion, pass; `um-pf-02` (Story 1.3) unaffected
- `npm run build` -- no TS errors
- `npm run lint` -- clean
