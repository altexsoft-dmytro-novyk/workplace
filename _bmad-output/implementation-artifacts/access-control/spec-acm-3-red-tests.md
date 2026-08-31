---
title: 'ACM-3 Stage 2 — inactive identity red PostgreSQL integration tests'
type: 'feature'
created: '2026-08-31'
status: 'in-progress'
review_loop_iteration: 0
baseline_commit: 'b0598812398897fef6ae1335efe84613159c89f2'
context:
  - '{project-root}/_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml'
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/testing-strategy.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** CAP-1 requires inactive viewers and targets to fail closed, while the shipped Phase-0 resolver currently returns `reporting` for an inactive viewer reachable through active bridges, returns `self` before validating that viewer, and falls back to `colleague` for an inactive target. The three approved ACM-3 scenario artifacts at workspace commit `512dce5d73c56969a96ec4776ba032d087fe2eb4` must become independently reviewable Stage-2 evidence.

**Approach:** Add one direct-facade PostgreSQL integration suite that creates only the approved scenario fixtures through Prisma, calls the real `AccessControlFacade` from a Nest testing module importing the real `AccessControlModule`, and commits the resulting red tests without changing production code.

## Boundaries & Constraints

**Always:**

- Use migrated PostgreSQL, `AppModule` for real Config/Prisma composition, `AccessControlModule`, `AccessControlFacade`, and the bound `PrismaRelationshipGraphAdapter`; use no repository fake, User Management provider override, artificial HTTP route, or direct resolver call.
- Translate only the three approved artifacts, unchanged from their approved revision: `ACM3-II-01`, `ACM3-II-02`, and `ACM3-II-03`. Their five named test cases are the complete Stage-2 scope.
- Assert typed `Map<string, Set<Audience>>` results through the public facade. Each requested target must have the asserted map entry; empty audience means `new Set()`, not an omitted key.
- Create isolated UUID-scoped users and real `Relationship` rows through Prisma, then delete only those fixture rows after the suite. The fixture setup is test data, not an authorization implementation.
- Run migrations against the configured PostgreSQL before execution. Preserve the expected red state: CAP-1 is missing if the suite shows the approved inactive-viewer and inactive-target gaps.
- Commit only the test artifact in `services/backend` after recording fresh red execution output. Do not change `src/**`, Prisma schema/migrations, application wiring, or the Stage-1 approval ledger. Stop for explicit human approval immediately after presenting the complete test file, commit, and red output.

**Ask First:**

- Any test beyond the three approved scenario documents, including empty bulk input, duplicate collapse, cycles, inactive PP endpoints, absent-edge termination, or the after-viewer-proof inactive-endpoint grant. The kernel-suite README records these as still unwritten Stage-1 scenarios.
- Any production code change or change intended to make this suite green.

**Never:**

- Add `canAccessSection`, `isAllowed`, User Management, HTTP, field-projection, due/departure, soft-delete, missing-endpoint-row, PP, or functional-role behavior.
- Treat the existing Phase-0 HTTP suite's facade-backed provider override as evidence for this story; this suite must call the facade directly with no override.
- Amend, supersede, or self-approve a record in `approvals.yaml`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| ACM3-II-01 Test 1 | Inactive top-level Owen resolves active Alice through Alice → Bob → Owen | Alice key maps to `Set()`; neither `reporting` nor `colleague` is derived | Red today: active bridges currently prove inactive Owen as Reporting viewer |
| ACM3-II-01 Test 2 | Inactive Owen resolves `[owenId]` | Owen key maps to `Set()`; `self` is absent | Red today: Self is derived before viewer validation |
| ACM3-II-02 Test 1 | Active Carol resolves Alice across Alice → Bob → DeadNode(inactive) → Carol | Alice key maps to `Set(['colleague'])`; `reporting` is absent | Existing traversal behavior; remains a control in the red suite |
| ACM3-II-02 Test 2 | Active Bob resolves direct report Alice below the same inactive DeadNode | Alice key maps to `Set(['reporting'])` | Existing live segment remains a control |
| ACM3-II-03 Test 1 | Active Bob resolves `[dismissedId, aliceId]`; Dismissed is inactive and both report to Bob | Dismissed maps to `Set()` and Alice maps to `Set(['reporting'])` | Red today: Dismissed falls through to `colleague`; Alice proves the failure is target-local |

</frozen-after-approval>

## Code Map

- `services/backend/test/access-control/acm3-inactive-identity.e2e-spec.ts` -- new Stage-2 direct-facade suite; owns UUID-scoped fixture creation, facade calls, exact audience assertions, and cleanup.
- `services/backend/src/access-control/access-control.module.ts:15` -- real module that binds `AccessControlFacade`, `AudienceResolverService`, and `PrismaRelationshipGraphAdapter`; test imports it without overrides.
- `services/backend/src/access-control/application/access-control.facade.ts:23` -- only invocation point: `resolveAudiences(viewerId, employeeIds)`.
- `services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:19` -- real Prisma adapter invoked by the facade; read-only for this story.
- `services/backend/src/access-control/domain/services/audience-resolver.service.ts:24` -- CAP-1 gaps deliberately exposed by the red tests; read-only for this story.
- `services/backend/test/access-control/audience-resolution.e2e-spec.ts:100` -- fixture/Prisma lifecycle precedent only; its HTTP provider override must not be copied.
- `docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-01-inactive-viewer-chain-top.md` -- approved source for first two test cases.
- `docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-02-inactive-bridge-stops-traversal.md` -- approved source for bridge-denial and live-segment controls.
- `docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-03-inactive-target-below-active-manager.md` -- approved source for inactive-target bulk-locality case.

## Tasks & Acceptance

**Execution:**

- [ ] `services/backend/test/access-control/acm3-inactive-identity.e2e-spec.ts` -- add five approved direct-facade integration cases with isolated real Prisma fixtures and exact `Set` assertions; expose CAP-1 without altering implementation.
- [ ] `services/backend` -- run `npm run db:deploy` and `npm run test:e2e -- acm3-inactive-identity.e2e-spec.ts`; capture the fresh exit-1 output showing the three required gaps and the two traversal controls passing.
- [ ] `services/backend` -- commit the test-only red evidence with a conventional message; leave all production files and the approval ledger untouched, then stop for the Stage-2 human-review gate.

**Acceptance Criteria:**

- Given the test module starts, when it resolves `AccessControlFacade`, then the real `AccessControlModule` and real Prisma adapter are in the provider graph with no overrides.
- Given each approved fixture, when its approved facade call runs, then the suite asserts precisely the five matrix results and no unapproved CAP-1 case.
- Given the current implementation, when the focused suite runs after migrations, then it exits nonzero because ACM3-II-01 Test 1, ACM3-II-01 Test 2, and ACM3-II-03 Test 1 do not produce their approved empty sets; the two ACM3-II-02 controls pass.
- Given the Stage-2 commit is inspected, when its diff is compared with the baseline, then it contains only the new integration-test file and no production code, migration, or ledger modification.

## Spec Change Log

## Design Notes

Separate fixture subgraphs avoid violating the migrated partial-unique direct-manager constraint: the approved prose reuses Alice/Bob names across independent scenarios, but a single database graph cannot give Bob both Owen and DeadNode as direct managers. One UUID-scoped factory owner supplies `createdBy`; it is not part of audience facts.

## Verification

**Commands:**

- `npm run db:deploy` -- expected: all committed migrations apply or are already applied to the configured PostgreSQL database.
- `npm run test:e2e -- acm3-inactive-identity.e2e-spec.ts` -- expected: exit 1; exactly the approved inactive-viewer/self and inactive-target assertions fail for the documented missing CAP-1 behavior, while the two inactive-bridge controls pass.
- `git diff --check` and `git diff --name-only HEAD` -- expected: no whitespace errors and only the Stage-2 test file before commit.
