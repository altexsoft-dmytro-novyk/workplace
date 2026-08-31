---
title: 'ACM-4R Stage 2 — real PostgreSQL CAP-2 evidence'
type: 'feature'
created: '2026-08-31'
status: 'done'
review_loop_iteration: 0
baseline_commit: '5b26e047ed31bcca3c467b33d7b7aec4fa6eec3e'
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/testing-strategy.md'
  - '{project-root}/_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml'
  - '{project-root}/_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** CAP-2 (multi-audience audience resolution — Reporting, direct PP, Colleague-as-floor, Self-exclusivity, FR-separation, deduplication) has six approved Stage-1 scenario contracts (`ACM4R-MA-01`..`06`) but no Stage-2 evidence: no real-PostgreSQL, direct-facade integration test proves whether the shipped `AudienceResolverService` actually satisfies them.

**Approach:** Translate all six approved contracts, unmodified, into committed direct-facade integration test(s) under `services/backend/test/access-control/`, using the real `AccessControlFacade.resolveAudiences` through a real Nest module, real Prisma adapters, and migrated PostgreSQL fixtures. Run them and report whether a concrete behavior gap exists — do not change production code either way.

## Boundaries & Constraints

**Always:**
- Use the real `AccessControlFacade` (`services/backend/src/access-control/application/access-control.facade.ts`) via `Test.createTestingModule({ imports: [AppModule, AccessControlModule] })`, real Prisma adapters, migrated PostgreSQL. No fake repository, provider override, artificial HTTP route, direct resolver call bypassing the facade, or unit-only proof.
- Cover exactly the six approved contracts (`ACM4R-MA-01`..`06`) — no more, no fewer — with exact `Set<Audience>` membership/size assertions (no loose "contains" checks that would pass on an over-broad set).
- Follow the established fixture/cleanup pattern from `test/access-control/acm3-inactive-identity.e2e-spec.ts` (persona-keyed `ids` map, `runId`-scoped unique emails, `afterAll` teardown deleting relationships then users).
- Commit the test artifact and stop for human review regardless of outcome.
- If all six assertions pass, this is a characterization result: it must prove already-shipped behavior and change no production code.
- If any approved assertion is red, preserve the committed-red evidence and record the concrete behavior gap in the completion notes — do not attempt a fix in this dispatch.

**Ask First:**
- Any approved scenario doc's exact expected `Map<string,Set<Audience>>` output appears ambiguous or internally inconsistent when read against `docs/architecture/access-control.md` — halt and ask rather than reinterpreting the contract.

**Never:**
- Do not write or modify production code in `src/access-control/**` in this dispatch.
- Do not write a Stage-3 disposition or approval record — this dispatch stops after committing the test artifact.
- Do not broaden scope to section access, User Management, or unrelated FR behavior beyond the FR-separation fixture the contracts already specify.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| ACM4R-MA-01 | Active viewer, target with both a Reporting chain edge and a direct PP link | Target's set is exactly `{'reporting','pp'}` — neither suppresses the other | N/A |
| ACM4R-MA-02 | Confirmed active viewer == confirmed active target | Set is exactly `{'self'}`; no Reporting/PP/Colleague merged in | N/A |
| ACM4R-MA-03 | Three viewer perspectives on the same target: no relationship, Reporting only, PP only | Colleague appears only for the no-relationship viewer; Reporting/PP viewers each get their own single-audience set with no Colleague added | N/A |
| ACM4R-MA-04 | Bulk `resolveAudiences` call with the same target id repeated in the input list | Output map has exactly one entry for that id, with the full deduplicated multi-audience set | N/A |
| ACM4R-MA-05 | Target has a real FR permission/policy/grant/attachment (via ACM-1 production bootstrap) but no relationship data to the viewer | Set is exactly `{'colleague'}` — FR data never appears in or affects the audience output | N/A |
| ACM4R-MA-06 | Single bulk call, mixed PostgreSQL fixture, 4 targets covering Reporting, direct PP, Colleague, and the FR-separation case together | 4-entry map, each entry matching its individual expected set from MA-01/03/05 | N/A |

</frozen-after-approval>

## Code Map

- `services/backend/src/access-control/application/access-control.facade.ts:25-30` -- public entry point under test: `resolveAudiences(viewerId, employeeIds)`.
- `services/backend/src/access-control/domain/services/audience-resolver.service.ts:29-111` -- resolution logic (identity confirmation, relationship-graph facts, self/reporting/pp/colleague derivation); read-only reference for understanding expected behavior, not to be modified.
- `services/backend/src/access-control/domain/audience.ts:9` -- `Audience = 'self' | 'reporting' | 'pp' | 'colleague'` union used in assertions.
- `services/backend/src/access-control/access-control.module.ts:17-33` -- `@Global() AccessControlModule`, real Prisma-backed port bindings; import this + `AppModule` in the test's `Test.createTestingModule`.
- `services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts` -- real Prisma raw-SQL adapter (reporting-chain CTE + partner lookup) exercised transitively.
- `services/backend/src/access-control/infrastructure/prisma-identity.adapter.ts` -- real Prisma identity-confirmation adapter exercised transitively.
- `services/backend/test/access-control/acm3-inactive-identity.e2e-spec.ts` -- pattern reference: module bootstrap, persona-keyed fixture map, `runId`-scoped unique emails, `afterAll` teardown, per-target assertion helper.
- `services/backend/test/access-control/acm3-cycle-acyclicity.e2e-spec.ts` -- pattern reference: "committed red on purpose" header-comment convention to reuse if any scenario lands red.
- `docs/test-cases/access-control-kernel/multi-audience/acm4r-ma-01..06-*.md` -- the six approved Stage-1 contracts; source of truth for exact inputs/outputs, do not reinterpret.
- `docs/architecture/testing-strategy.md` (~lines 119-145) -- governs the Stage-2 gate: real facade, real module, real Prisma, migrated PostgreSQL, AD-1 dispatch discipline.
- `docs/architecture/access-control.md` (~lines 189-230) -- CAP-2 contract: Self exclusivity, Reporting/PP coexistence, Colleague-as-floor, FR-separation.

## Tasks & Acceptance

**Execution:**
- [x] `services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts` -- create one e2e spec file covering all six approved scenarios (ACM4R-MA-01..06) against the real facade/module/PostgreSQL, following the acm3-inactive-identity.e2e-spec.ts pattern for bootstrap and fixture/teardown -- delivers the Stage-2 evidence this dispatch exists to produce.
- [x] Run `npm run db:up && npm run db:migrate && npm run test:e2e -- acm4r-multi-audience` in `services/backend/` and capture the actual pass/fail result for all six assertions -- this is the evidence itself, not just a formality; do not report an outcome without having run it.
- [x] Record the actual result (green characterization vs. named concrete gap) in the story's Dev Agent Record / Completion Notes -- this is what step-04 review and the human approver will read to decide the next dispatch.

## Dev Agent Record / Completion Notes

**Prerequisites verified before starting:** the six `ACM-4R-scenarios` stage-1-scenarios approval records in `approvals.yaml` (commit `eed43516394775e6245c963e64c182742488ddc8` in `workspace`, all six `acm4r-ma-0{1..6}-*.md` artifacts confirmed present via `git cat-file -e`), and the `ACM-1-production` stage-3-production approval record (commit `436f3c6` in `services/backend`, artifact `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts` confirmed present). Both verified; `services/backend` HEAD (`5b26e04`) matches the story's `baseline_commit`.

**Result: all six approved contracts pass green.** This is a characterization result under the AD-1 validation-only exception: it proves already-shipped `AudienceResolverService` behavior and changes no production code (`git status --short` after the run and commit shows only the new test file).

Commands run:
- `npm run db:up` -- Postgres container up.
- `npm run db:migrate` -- `npx prisma migrate status` confirmed "Database schema is up to date!" against the 3 existing migrations (the interactive `db:migrate` invocation only prompted because it was backgrounded and stdin closed; no schema drift existed).
- `npm run test:e2e -- acm4r-multi-audience` -- **8 passed, 8 total** (Test Suites: 1 passed, 1 total), real PostgreSQL, real `AccessControlFacade`/`AccessControlModule`/Prisma adapters via `Test.createTestingModule({ imports: [AppModule, AccessControlModule] })`.

Per-scenario outcome (exact `Set<Audience>` match, no subset/superset checks):
- ACM4R-MA-01: Marta -> Alice resolves exactly `{'reporting','pp'}`. PASS.
- ACM4R-MA-02: SelfViewer -> SelfViewer resolves exactly `{'self'}`. PASS.
- ACM4R-MA-03: three sub-cases (Zara->Daria `{'reporting'}`, Paula->Daria `{'pp'}`, Unrelated1->Daria `{'colleague'}`). PASS (3/3).
- ACM4R-MA-04: Marta -> [Alice, Alice] (duplicate input) yields one map entry, `{'reporting','pp'}`, size 2. PASS.
- ACM4R-MA-05: FrViewer (holds a real FR permission/policy/grant/`UserPolicies` attachment created directly through the ACM-1-production schema) -> FrTarget (no relationship) resolves exactly `{'colleague'}`; no permission/policy value leaks into the set. PASS.
- ACM4R-MA-06: Mara6 (also holding the same kind of FR attachment) -> [Taylor6, Reese6, Carmen6, Noah6] in one bulk call resolves a 4-entry map matching MA-01/03/05's per-target sets exactly (`{'reporting','pp'}`, `{'reporting'}`, `{'pp'}`, `{'colleague'}`). PASS.

Fixture cleanup verified: `select count(*) from users where "workEmail" like 'acm4r-%'` returned `0` after the suite's `afterAll` teardown ran.

**File List:** `services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts` (new, committed at `c5999b2`). No file under `src/access-control/**` or elsewhere in production code was created or modified.

**Nothing incomplete or at risk from this dispatch's own scope.** Two process notes for the human reviewer, neither a defect in this evidence:
1. The committer identity on `c5999b2` fell back to a local git default (`Анна <home@MacBook-Pro---Anna.local>`) rather than an explicitly configured identity — worth a `git config` pass in this environment if authorship attribution matters downstream, but does not affect the evidence itself.
2. Per AD-1 and the story's own boundaries, this dispatch stops here: no Stage-3 disposition, no `ACM-4R-production` (not applicable — no gap found), and no edit to `approvals.yaml` was made by this dispatch. The next step is an independent human Stage-2 review/approval of this commit, to be recorded as its own `ACM-4R-tests` / `stage-2-tests` entry in `approvals.yaml` by the approver (author != approver), which then unblocks `ACM-4R-disposition`.

**Acceptance Criteria:**
- Given the real Nest module and migrated PostgreSQL, when `resolveAudiences` runs against each of the six approved fixtures, then every assertion checks an exact `Set<Audience>` match (not a subset/superset check).
- Given the suite has run, when all six pass, then the completion notes state this is a characterization result and confirm no production file appears in the File List.
- Given the suite has run, when any assertion is red, then the completion notes name the specific scenario and the concrete behavior gap, and the test file is committed red as-is (not adjusted to pass).

## Spec Change Log

## Design Notes

Only one new test file is needed (`acm4r-multi-audience.e2e-spec.ts`) rather than six, since all six scenarios share one facade entry point, one module bootstrap, and largely overlapping fixture shape (MA-06 is explicitly the union of MA-01/03/05 in one bulk call) — splitting into six files would duplicate setup/teardown for no isolation benefit given they're all read-only assertions against seeded data.

## Verification

**Commands:**
- `cd services/backend && npm run db:up && npm run db:migrate` -- expected: migrated PostgreSQL test database is up.
- `cd services/backend && npm run test:e2e -- acm4r-multi-audience` -- expected: reports the real pass/fail state of all six assertions (a red result here is a valid, acceptable dispatch outcome if it reflects true facade behavior).

## Suggested Review Order

- Module bootstrap through the real facade — the whole file's evidentiary weight rests on this being the real DI graph, not a stub.
  [`acm4r-multi-audience.e2e-spec.ts:24`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L24)

- Shared assertion helper — every scenario's pass/fail rides on this exact-set comparison, not a loose contains-check.
  [`acm4r-multi-audience.e2e-spec.ts:55`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L55)

- Reporting + PP coexistence (ACM4R-MA-01).
  [`acm4r-multi-audience.e2e-spec.ts:251`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L251)

- Self exclusivity (ACM4R-MA-02).
  [`acm4r-multi-audience.e2e-spec.ts:261`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L261)

- Colleague-as-floor across three viewer perspectives on one target (ACM4R-MA-03).
  [`acm4r-multi-audience.e2e-spec.ts:273`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L273)

- Duplicate-target dedup (ACM4R-MA-04).
  [`acm4r-multi-audience.e2e-spec.ts:296`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L296)

- FR-separation fixture: a real Permission/Policy/PolicyPermission/UserPolicy chain that must never leak into the audience output (ACM4R-MA-05).
  [`acm4r-multi-audience.e2e-spec.ts:177`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L177)

- Combined 4-target fixture proving all four audience classes plus FR-separation in one bulk call (ACM4R-MA-06); Noah6 intentionally has zero relationship rows.
  [`acm4r-multi-audience.e2e-spec.ts:120`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L120)
  [`acm4r-multi-audience.e2e-spec.ts:321`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L321)

- Teardown — deletes the FR chain before the users/relationships it references, then the fixtures themselves.
  [`acm4r-multi-audience.e2e-spec.ts:214`](../../../../services/backend/test/access-control/acm4r-multi-audience.e2e-spec.ts#L214)
