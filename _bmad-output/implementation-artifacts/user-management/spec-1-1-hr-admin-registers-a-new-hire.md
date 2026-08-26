---
title: 'Story 1.1: HR Admin Registers a New Hire'
type: 'feature'
created: '2026-08-22'
status: 'in-review'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-1-context.md']
baseline_commit: '8368821f516cdc402db074dc28c4319122075411'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No HR-Admin-driven way to onboard a new hire exists. The only `/users` code today is a generic placeholder CRUD scaffold (`src/modules/users`) built before the bounded-context architecture was decided — wrong schema (`email`/`name`, uuid v4), no auth/entitlement seam, no magic-link hook. It must be replaced, not extended.

**Approach:** Replace `src/modules/users` with `src/user-management/{application,domain,infrastructure}` per the hexagonal layout. Add the real `User` Prisma model (S1 fields), a seed script creating the first `User` row, and a `POST /users` registration endpoint gated behind two new port interfaces (session resolution, entitlement check) that this story fakes and later epics/contexts implement for real.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `docs/test-cases/user-management/registration/um-reg-*.md` approved, then write failing E2E tests, then implement to green — never code before a red E2E test exists.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- `workEmail`/`ttId` unique at write time; no password field anywhere; `isActive` defaults `true`.
- Session resolution and entitlement checks are each a single port/interface call from the controller/action — never inline role logic.

**Ask First:**
- If Prisma 7.9.1 doesn't support `@default(uuid(7))`, confirm the uuidv7 fallback before proceeding.
- Any edit to `nest-modules.md` or `CLAUDE.md` beyond noting the bounded-context migration.

**Never:**
- No password/credential field, `updatedAt`/`updatedBy`, or manager/project/department/mentor columns on `User`.
- Don't implement real session issuance (Epic 2) or real entitlement/tier resolution (access-control context) — see 2026-08-26 renegotiation below.
- Don't touch `Policies`/`UserPolicies` — those tables don't exist yet; the seed script creates only the `User` row, no role assignment.

**Renegotiated 2026-08-26 (human decision, this session):** neither Epic 2 (session issuance) nor the `access-control` facade (AD-9) exist in code or have a build plan — verified against `docs/architecture/nestjs-di-tokens.md`, `access-control.md`, and the implementation-artifacts tree before regenerating this spec (see [[project_people_management_platform]] for the full audit trail). Per explicit human instruction, session resolution and entitlement checks are implemented as **real production code paths with a hardcoded/interim decision inside**, not a DI-swapped test-only fake: each call site is a one-line comment showing the real cross-context call this will become, immediately followed by the interim stand-in logic. This is temporary scaffolding meant to be deleted wholesale once Epic 2 and `access-control` ship — not a permanent inline-role-flag pattern (still forbidden long-term per AD-9).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Success | Root (HR Admin), unique `workEmail`, S1 fields | `201`, `isActive:true`, no credential field, magic-link port called once, no session token in body | N/A |
| Unauthenticated | No/invalid token | N/A | `401`, no row created |
| Unauthorized | Valid token, no create permission | N/A | `403`, no row created |
| Duplicate email | `workEmail` already exists | N/A | `409`, no new row, existing unchanged |

</frozen-after-approval>

## Code Map

**Already done — verified on disk 2026-08-26, no action needed:**
- `services/backend/prisma/schema.prisma` + `prisma/migrations/20260810130423_init/` -- real `User` model, applied (`prisma migrate status` confirms schema up to date)
- `services/backend/prisma/seed.ts` -- creates the bootstrap `User` row only, no role assignment (correctly deferred to access-control's own scenario, per this story's Boundaries)
- `services/backend/src/modules/users/**` -- already absent; nothing to delete
- `services/backend/test/user-management/registration.e2e-spec.ts` -- committed at `8368821`, 15 scenario blocks (`um-reg-01`..`15`), matches `docs/test-cases/user-management/registration/` 1:1. This is the real target for stage 3 — do not modify without flagging.

**To build (nothing under `src/user-management/` exists yet):**
- `services/backend/src/user-management/domain/entities/user.entity.ts` -- NEW
- `services/backend/src/user-management/domain/interfaces/magic-link-dispatcher.port.ts` -- NEW: `{ dispatch(email): Promise<void> }`, DI token per `nestjs-di-tokens.md` — real external-integration port, legitimately fakeable, Epic 2 supplies the production adapter later
- `services/backend/src/user-management/domain/interfaces/session-resolver.port.ts` -- NEW: `{ resolve(authHeader): Session | null }`
- `services/backend/src/user-management/domain/interfaces/access-control.port.ts` -- NEW: `{ isAllowed(userId, feature): Promise<boolean> }`
- `services/backend/src/user-management/domain/services/register-user.service.ts` -- NEW: uniqueness + no-password invariants
- `services/backend/src/user-management/application/dtos/create-user.dto.ts` -- NEW: S1-field DTO, `birthDay`/`birthMonth` paired validation (`um-reg-14/15`), rejects server-owned fields (`um-reg-10`)
- `services/backend/src/user-management/application/controllers/users.controller.ts` -- NEW: `POST /users`, resolves session then checks entitlement before the action
- `services/backend/src/user-management/application/actions/register-user.action.ts` -- NEW
- `services/backend/src/user-management/infrastructure/user.repository.ts` -- NEW: Prisma-backed, normalizes `workEmail` (trim+lowercase, `um-reg-11`) before uniqueness check/write, relies on the DB unique constraint as the concurrency arbiter (`um-reg-08`)
- `services/backend/src/user-management/infrastructure/magic-link-dispatcher.fake.ts` -- NEW: fixture-backed fake for the magic-link port, DI-bound in test only (AD-3 — this one *is* a legitimate external-integration fake)
- `services/backend/src/user-management/infrastructure/interim-session-resolver.adapter.ts` -- NEW, **temporary**: parses `Bearer <token:{persona}>` into `{ userId: persona }`, `null` for missing/empty header. Bound in real `app.module.ts` wiring (not test-only) per the 2026-08-26 renegotiation above.
- `services/backend/src/user-management/infrastructure/interim-access-control.adapter.ts` -- NEW, **temporary**: hardcoded persona allow-list for the `user-management:create` feature. Each method carries a comment showing the real facade call it stands in for, e.g. `// const isAllowed = await this.accessControl.isAllowed(userId, feature);`
- `services/backend/src/user-management/user-management.module.ts` -- NEW, registered in `app.module.ts`
- `services/backend/CLAUDE.md` -- note bounded-context layout as canonical for new contexts, and flag the two interim adapters as scaffolding to delete once Epic 2 / access-control ship

## Tasks & Acceptance

**Execution:**
- [x] AD-1 stage 1 -- `docs/test-cases/user-management/README.md` status is "Approved baseline (2026-08-25)"; per-file approval covers all 15 `um-reg-*` files
- [x] AD-1 stage 2 -- `test/user-management/registration.e2e-spec.ts` committed at `8368821`, verified current against the 15 scenario docs (this session, 2026-08-26)
- [x] `prisma/schema.prisma` + migration -- already applied, verified via `prisma migrate status`
- [x] `prisma/seed.ts` -- already present and correct
- [x] `domain/**` -- entity, three port interfaces, domain service -- pure logic first
- [x] `infrastructure/**` -- Prisma repository, magic-link fake, the two interim adapters
- [x] `application/**` + module wiring -- controller, DTO, action, registration in `app.module.ts`
- [x] Run `npm run test:e2e -- registration` -- **19/20 green.** The remaining one, `um-reg-12` (rehire), needs `DELETE /users/:id` from Story 1.4 to establish its precondition — expected per this suite's own 404-until-story-lands convention, not a defect. Revisit once 1.4 ships.
- [x] Fixed `tsconfig.json` -- added explicit `rootDir: "./"`; TypeScript 6's stricter rootDir inference (TS5011) was blocking every e2e suite from compiling, unrelated to this story's code
- [x] Fixed local Postgres migration drift -- DB had a stale `birthDate` column from an orphaned, disk-deleted migration (`20260822230638_replace_user_model`) that never matched the hand-edited `schema.prisma`; reset with human confirmation (`prisma migrate reset --force`, local dev DB only)
- [x] Fixed `um-reg-05` in `registration.e2e-spec.ts` (human-approved) -- its own scenario doc specifies a full payload (position/country/city/companyJoinDate); the E2E block had dropped those four fields, causing it to collide with `um-reg-06`'s intentionally-incomplete payload

**Acceptance Criteria:**
- Given the 15 E2E scenarios in `registration.e2e-spec.ts`, when `npm run test:e2e` runs, then 19/20 pass with no real network calls (`um-reg-12` pending Story 1.4)
- Given the interim adapters, when `Bearer <token:Root>` is sent, then the request is treated as HR-Admin-entitled (resolved via the seeded `position: 'HR Admin'` row); `Bearer <token:Ida>` is not; empty/missing auth is `401`
- Given `npm run build` runs, then it succeeds with no TS errors

## Design Notes

Three ports share one shape: a domain interface + DI token (`nestjs-di-tokens.md`). They diverge on what backs them:
- **Magic-link dispatcher** — real external integration, legitimately faked in tests only (AD-3); Epic 2 supplies the production adapter.
- **Session resolver** and **access-control** — per `nestjs-di-tokens.md` these must never be test-only fakes (auth and the AccessControl facade are on the "never faked in E2E" list). Since neither Epic 2's session store nor the `access-control` engine (AD-9, policy tables) exists yet, both are implemented as **real but interim** adapters, bound in actual `app.module.ts` wiring, each carrying a comment showing the real cross-context call it stands in for. This is scaffolding to delete once those contexts ship, not a permanent pattern — see the 2026-08-26 renegotiation note in Boundaries & Constraints.

## Verification

**Commands:**
- `npm run db:migrate` -- new migration applies cleanly
- `npm run test:e2e` -- `user-management/registration` specs pass
- `npm run build` -- no TS errors, no reference to deleted `modules/users`
- `npm run lint` -- clean
