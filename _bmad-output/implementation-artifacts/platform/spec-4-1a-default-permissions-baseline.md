---
title: 'PLAT-E4-S4.1a — DEFAULT_PERMISSIONS baseline + isAllowed union rule'
type: 'feature'
created: '2026-09-05'
status: 'in-progress'
review_loop_iteration: 0
baseline_commit: '827ff3d443fce7a8bf0752bc93c034be0c8a144f'
context: ['{project-root}/docs/architecture/access-control.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every future per-person section-write permission (`profile:identity:write`, ...) would otherwise need its own `Policies`/`PolicyPermissions`/`UserPolicies` seed row just so every active employee holds it by default — a schema/seed change per section. SCP `sprint-change-proposal-2026-09-04-section-access-consolidation.md` D2 already decided against that.

**Approach:** Give `FunctionalRoleEvaluatorService.isAllowed` a code-defined baseline set, `DEFAULT_PERMISSIONS`, that every **active** user implicitly holds. `isAllowed(user, key)` = `key ∈ DEFAULT_PERMISSIONS` (active user) **∪** the existing data-driven grant chain. This story only adds the primitive — no route calls it with a baseline key yet, so no existing behavior changes.

## Boundaries & Constraints

**Always:**
- FR-tier only: no relationship-graph read, no new query when `permissionKey` is not in `DEFAULT_PERMISSIONS` (the existing grant-chain path is unchanged for every other key).
- `DEFAULT_PERMISSIONS` starts with exactly one key, `'profile:identity:write'` — the only per-person section-write key with a real consumer today. Do not pre-populate keys for sections with no route (`profile:employment`, etc.) — add them when their story lands.
- An inactive user never gets a baseline key. No `employee` `Policies` row, no `PolicyPermissions`, no `UserPolicies` attachment, no seed/bootstrap/migration change.
- Engine stays allow-only: no per-individual subtraction from the baseline.
- This is Kernel/Access-Control-owned code (`domain/`, `infrastructure/` under `access-control/`) — no change to `user-management/` in this story (no adapter call site is wired to the new key yet; that is 4.1c).
- Follow this project's AD-1 discipline: a human-approved scenario doc precedes the E2E test, and an approved *red* E2E precedes any implementation code. Stop for explicit approval between each of those three stages — do not let one dispatch cover more than one stage.

**Ask First:**
- Whether `isActiveUser` (see Code Map) belongs on `FunctionalRoleRepositoryPort` vs. some other seam, if the investigation below turns out stale by the time this runs.

**Never:**
- Never wire any existing controller/adapter to `'profile:identity:write'` — that migration is story 4.1c, tracked separately.
- Never add a `DEFAULT_PERMISSIONS` entry without a route that consumes it.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Active user, baseline key | Active user, `key = 'profile:identity:write'`, no `UserPolicies` row | `isAllowed` → `true` | N/A |
| Inactive user, baseline key | `isActive = false`, same key | `isAllowed` → `false` (falls through to grant-chain, which is also `false`) | N/A |
| Missing user id, baseline key | `userId` not found in `users` | `isAllowed` → `false` | Treat as inactive, not an error |
| Active user, non-baseline key with explicit grant | Active user, `key = 'user-management:list'`, real `UserPolicies` attachment | `isAllowed` → `true` via unchanged grant-chain path, no new query for baseline check | N/A |
| Active user, non-baseline key, no grant | Active user, arbitrary unseeded key | `isAllowed` → `false` | N/A |

</frozen-after-approval>

## Code Map

- `services/backend/src/access-control/domain/constants/default-permissions.ts` -- NEW. Exports `DEFAULT_PERMISSIONS: ReadonlySet<string>` = `{'profile:identity:write'}`. Empty sibling dir already exists, unused until now.
- `services/backend/src/access-control/domain/interfaces/functional-role.repository.port.ts` -- add `isActiveUser(userId: string): Promise<boolean>` to `FunctionalRoleRepositoryPort`.
- `services/backend/src/access-control/infrastructure/prisma-functional-role.repository.ts` -- implement `isActiveUser` as a point lookup (`prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } })`, `false` if row missing). Existing `isAllowed` SQL (already filters `u."isActive" = TRUE`) is untouched.
- `services/backend/src/access-control/domain/services/functional-role-evaluator.service.ts` -- `isAllowed`: if `DEFAULT_PERMISSIONS.has(permissionKey)` and `repository.isActiveUser(userId)`, return `true`; otherwise delegate to `repository.isAllowed(userId, permissionKey)` unchanged (the union's second half, already active-gated).
- `docs/architecture/access-control.md:51-68` -- decision entry already recorded (2026-09-04, D2); no edit needed unless review finds wording now stale.
- New unit spec next to source (this context's convention — see `audience-resolver.service.spec.ts`): `functional-role-evaluator.service.spec.ts`, covering the I/O matrix above with a stubbed repository port.
- New e2e spec `services/backend/test/access-control/` (name TBD at scenario-doc stage, sibling to `acm2-is-allowed.e2e-spec.ts`) + scenario docs under `docs/test-cases/access-control-kernel/is-allowed/` per this project's AD-1 convention.

## Tasks & Acceptance

**Execution:**
- [ ] Write the human-approved scenario doc (AD-1 stage 1) covering the I/O matrix rows against real Postgres — STOP for approval before writing any test.
- [ ] `services/backend/test/access-control/*.e2e-spec.ts` -- write the red E2E from the approved scenario doc -- STOP for approval before writing implementation code.
- [ ] `services/backend/src/access-control/domain/constants/default-permissions.ts` -- add `DEFAULT_PERMISSIONS`.
- [ ] `.../domain/interfaces/functional-role.repository.port.ts` -- add `isActiveUser`.
- [ ] `.../infrastructure/prisma-functional-role.repository.ts` -- implement `isActiveUser`.
- [ ] `.../domain/services/functional-role-evaluator.service.ts` -- implement the union rule.
- [ ] `functional-role-evaluator.service.spec.ts` -- unit-test the I/O matrix with a stubbed port.

**Acceptance Criteria:**
- Given an active user with no `UserPolicies` row, when `isAllowed(user, 'profile:identity:write')` is called, then it resolves `true`.
- Given a deactivated user, when `isAllowed(user, 'profile:identity:write')` is called, then it resolves `false`.
- Given any user and a non-baseline key, when `isAllowed` is called, then behavior and query shape are byte-identical to before this change (no new query issued).
- No existing `access-control` or `user-management` e2e suite changes behavior (nothing yet calls the new key).

## Design Notes

`isActiveUser` costs one indexed point lookup (`users.id` PK), only when `permissionKey ∈ DEFAULT_PERMISSIONS` — every other key keeps today's single-query grant-chain path with zero added round trips. This is what "no hot-path scan" in the SCP decision means in practice: no relationship/graph traversal, not literally zero queries for the baseline path.

## Verification

**Commands:**
- `npm run test -- functional-role-evaluator` -- expected: new unit spec green.
- `npm run test:e2e -- <new-spec-name>` -- expected: red before the code change, green after.
- `npm run lint && npm run build` -- expected: clean.
