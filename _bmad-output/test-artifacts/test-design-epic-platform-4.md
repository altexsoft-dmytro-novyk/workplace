---
runScope: 'epic-level'
runKey: 'epic-platform-4'
epicId: 'PLAT-E4'
epicDomain: 'platform'
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicNumber: 4
workflowStatus: 'generated'
approval: 'ungranted'
validation: 'CONCERNS'
validatedAt: '2026-09-12'
validationReport: '_bmad-output/test-artifacts/test-design-validation-report-epic-platform-4.md'
generated: '2026-09-12'
---

# Test Design: PLAT-E4 — Access Control Authorization Consolidation

**Date:** 2026-09-12  
**Author:** User  
**Status:** Written — approval ungranted; validation **CONCERNS (2026-09-12)**
**Validation report:** `test-design-validation-report-epic-platform-4.md`, synchronized with
`test-design/README.md`.

## Executive Summary

**Scope:** Epic-level test design for `PLAT-E4` in the `platform` domain. The
epic consolidates User Management route authorization around
`@RequireSectionAccess`, moves section IDs to human keys, preserves the
audience-first dual gate, and establishes root bootstrap/dev-seed evidence.
It contains two completed tracker stories: `PLAT-E4-S4.1` and `PLAT-E4-S4.2`.
Their tracker status is implementation context, not approval, validation,
coverage, or release evidence.

The plan has six high risks: three P0 security boundaries (audience-first
authorization, human-key/route-map drift, and functional-role widening), two
P1 security/operational boundaries, and one P1 evidence gap around the proposed
`seeded-two-level` ACM-9 measurement. Existing real PostgreSQL facade and HTTP
E2E suites provide the initial evidence surface; this plan names the required
scenario bundles and the residual evidence work without claiming they pass.

## Not in Scope

| Item | Reasoning | Mitigation / owner |
| --- | --- | --- |
| Directory HTTP performance (DIRA1 / Contract A) | It measures `GET /users`, not this epic's AccessControl facade work. | Remains `PMC-E1-S1.9` / `PG-04` evidence. |
| P6 `resolveAudiences` timing | P6 is a measurement record, not a gate, and is a different subject. | Keep separate from ACM-9; owner: Access Control. |
| New profile routes or section-matrix expansion | Only `profile:identity` has a live UM consumer; new section routes belong to their first consumer story. | Require their own endpoint-map and AD-1 evidence. |
| Project/department audiences and TimeTracker sync | These are later platform epics with their own blockers. | Preserve fail-closed behavior; do not infer access. |
| Frontend authorization UX | PLAT-E4 acceptance criteria do not state a frontend behavior. | Frontend plans own UI evidence when a product flow requires it. |
| New Pact interactions | No changed consumer-provider HTTP boundary is specified by this epic. | Existing contracts remain regression inputs; provider source is authoritative. |

## Risk Assessment

### High-priority risks (score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| PLAT-E4-R01 | SEC | A guard or `canEdit` hint bypasses the audience-first dual gate, letting an FR grant widen profile access. | 3 | 3 | 9 | Assert the same `hasSectionAccess` path for route and hint, with deny/allow personas. | Access Control + UM | Before authorization changes ship |
| PLAT-E4-R02 | SEC | Legacy `S<n>` keys, duplicated predicates, or endpoint-map drift create a matrix decision mismatch. | 2 | 3 | 6 | Pair matrix/facade cases with a scoped executable-source migration oracle. | Access Control + UM | Before authorization changes ship |
| PLAT-E4-R03 | SEC | Root or a delegated HR Admin gains target data write from functional role alone. | 2 | 3 | 6 | Use clean bootstrap plus unrelated-target `403` and `canEdit:false` cases. | Access Control + UM | Before authorization changes ship |
| PLAT-E4-R04 | OPS | Dev seed use can modify production data, make a bad/non-idempotent graph, or pollute the shared test database. | 2 | 3 | 6 | Exercise production refusal, real import ordering, rerun behavior, and run-namespaced cleanup. | Access Control + QA | Before script use in CI/demo |
| PLAT-E4-R05 | SEC | The full-profile overlay is misread as write authority or as proof of live projection coverage. | 2 | 3 | 6 | Prove only read-only/Self-exclusive bootstrap and resolution facts; keep live projection evidence separate. | Access Control | Before overlay consumers ship |

### Medium-priority risk (score 3–4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| PLAT-E4-R06 | PERF | The existing upward walk is credited without an agreed `seeded-two-level` ACM-9 measurement, or the result is conflated with DIRA1/P6. | 2 | 2 | 4 | Obtain an explicit scope decision; if accepted, publish an immutable ACM9-MVP-v1 result only. | Access Control |

Score is `probability × impact`; score ≥6 is high. This risk register is local
to PLAT-E4 and references, rather than re-scores, shared platform risks in
`test-design-architecture.md`.

## NFR Planning

| Category | Requirement / threshold | Risk | Planned validation | Expected evidence |
| --- | --- | --- | --- | --- |
| Security | Architecture denial oracle: `401` invalid/inactive session, `404` hidden/missing target, `403` visible-but-forbidden. PLAT-E4 specifically requires audience-first `403` and `canEdit:false`. | R01–R05 | Real facade/router E2E with distinct personas; scoped source oracle only as supplementary proof. | E2E output and named suites. |
| Performance | If the residual question is accepted: ACM9-MVP-v1 facade measurement, 500 active targets, five warm-ups and 20 samples; warm p95 and worst case ≤2s per protocol shape. | R06 | One explicit, append-only measurement run. | Artifact under `_bmad-output/test-artifacts/performance/`. |
| Reliability / operability | Production refusal, deterministic two-level dev graph, idempotent rerun, and isolated cleanup. No availability/retry threshold is stated. | R04 | Real script E2E against migrated PostgreSQL. | Script/E2E report and teardown evidence. |
| Maintainability | One declared section gate and no executable legacy branch. No numerical quality threshold is stated. | R02 | Route/facade integration cases plus scoped `git grep`. | E2E output and reviewable source oracle. |

**Unknowns:** Whether `seeded-two-level` becomes a distinct ACM-9 measurement
dispatch, which protocol role it uses, and the PO/architect decisions recorded
in Story 4.2 remain open. No threshold, live-overlay claim, or release outcome
is invented. Contract A (DIRA1) and Contract C (P6) are excluded.

## Entry Criteria

- The canonical PLAT-E4 epic source, both story tickets, and the platform test-design pair remain readable.
- Migrated PostgreSQL, pseudonymised seed/import data, and the backend serial E2E harness are available.
- Test runs use isolated run namespaces and clean up only their owned records.
- `ROOT_WORK_EMAIL`, `DATABASE_URL`, and the real production provisioning sequence are available for bootstrap/script scenarios.
- The `seeded-two-level` measurement is not scheduled until its open scope decision is recorded.

## Exit Criteria

- Every P0 scenario bundle is executable and passes in its required real database/router environment.
- P1 failures are triaged with an owner; no unresolved high-risk mitigation lacks an evidence path.
- The static migration oracle and behavioral E2E together show no executable legacy gate path.
- If R06 is accepted, its immutable ACM-9 artifact is present and evaluated only under Contract B.
- A later human review and Epic Validate are required for approval/validation; generating this plan satisfies neither.

## Test Coverage Plan

Priority expresses impact, not execution timing. Existing suite names identify
evidence locations; they are not a claim that the cases were re-executed in
this workflow.

### P0 — authorization boundaries

| ID | Requirement / scenario bundle | Level | Risk | Owner | Evidence location |
| --- | --- | --- | --- | --- | --- |
| E4-C01 | Active default section-write baseline; inactive denial; explicit FR grant remains valid; no employee-policy substitute. | Facade E2E plus evaluator unit boundary | R01, R03 | Access Control | `test/access-control/s41a-default-permissions-baseline.e2e-spec.ts`; functional-role evaluator unit spec |
| E4-C02 | Human-key matrix semantics, unknown-key fail-closed behavior, strongest-audience result, and removal of executable `S<n>` identifiers. | Facade E2E plus repository audit | R02 | Access Control | `test/access-control/acm5-section-access.e2e-spec.ts`; scoped `git grep` oracle |
| E4-C03 | `GET /users/:id` data, `PATCH /users/:id`, and `canEdit` use the same section decision for colleague/self, reporting, and PP personas. | Real HTTP / PostgreSQL E2E | R01, R02 | User Management | `s41c-section-access-gate`, `read-adoption`, `read-denial`, `write-adoption` |
| E4-C04 | Clean-bootstrap root and delegated-HR-admin feature/data split: allowed global features do not imply unrelated profile write. | Real bootstrap + HTTP E2E | R03 | Access Control + UM | `s42a-op-bootstrap-canonical-set`, `s42a-op-root-operator-set`, adoption denial suites |

**P0 estimate:** ~6–12 hours of net test/evidence repair.

### P1 — bootstrap, seed, and regression boundaries

| ID | Requirement / scenario bundle | Level | Risk | Owner | Evidence location |
| --- | --- | --- | --- | --- | --- |
| E4-C05 | Root has no seeded relationship row, canonical bootstrap grants, and a read-only/Self-exclusive full-profile overlay boundary. | Bootstrap + facade/HTTP E2E | R03, R05 | Access Control | `s42b-tr-bootstrap-no-relationship-row`, `s42b-tr-root-tree-position`, `acm11-full-profile-overlay-*` |
| E4-C06 | Dev seed refuses production, creates its specified fake two-level spine after import, preserves existing direct edges, is deterministic for inactive/multi-department users, and reruns safely. | Script/integration E2E | R04 | Access Control + QA | `s42d-ds-dev-seed-spine`, `s42d-ds-root-resolves-over-seeded-population` |
| E4-C07 | Authorization changes rerun all access-control E2E plus affected User Management adoption suites. | PR regression E2E | R01–R05 | QA + component owners | Platform pair cross-epic regression map |

**P1 estimate:** ~8–16 hours of net test/evidence repair.

### P2 — pending performance evidence

| ID | Requirement / scenario bundle | Level | Risk | Owner | Evidence location |
| --- | --- | --- | --- | --- | --- |
| E4-C08 | Decide and, only if accepted, measure the `seeded-two-level` shape under ACM9-MVP-v1 without changing resolver behavior or CI blocking status. | Measurement | R06 | Access Control | New immutable performance artifact; none exists yet |

**P2 estimate:** ~2–6 hours after the decision. No P3 scenario is identified.

## Execution Strategy

- **PR:** Run all affected functional suites when they fit the established PR budget, including the full access-control E2E set for facade changes and affected UM adoption suites. Backend E2E stays serial with run-namespaced data.
- **Nightly:** Run an accepted ACM9-MVP-v1 measurement only. It remains informational; this plan does not promote it to a blocking job.
- **Weekly / release preparation:** Repeat the accepted measurement when its fixture or resolver dependency changes, preserving each append-only artifact. Run NFR assessment only after evidence exists.

## Resource Estimates and Prerequisites

Total contingent effort is **~16–34 hours**: P0 ~6–12, P1 ~8–16, and P2
~2–6 after its decision. This is evidence-maintenance work only; it does not
estimate already-recorded implementation delivery.

Required tooling and data are backend Jest/supertest E2E, a migrated PostgreSQL
test instance, pseudonymised seed/import fixtures, the production bootstrap
scripts, and the existing run-namespace cleanup convention. No browser, third-
party service, or Pact-broker access is required for the stated scenarios.

## Quality Gate Criteria

These are test-design completion criteria, not an executable release verdict:

- P0 scenario pass rate is 100%; P1 target is at least 95%, with an explicit owner/waiver for any exception; P2 is informational until accepted.
- High-risk mitigations require a named owner and scenario/evidence path.
- Security scenario bundles must all be covered by runnable real facade/router evidence; a static check cannot substitute for it.
- Critical authorization paths have full scenario mapping; P1/P2 scope is tracked as stated rather than converted into a repository-wide percentage.
- NFR evidence is identified for each in-scope category. Final PASS/CONCERNS/FAIL remains for `nfr-assess` after evidence exists.

## Mitigation Plans

- **R01/R03:** Keep route guard and `canEdit` behind `hasSectionAccess`; test ordinary, reporting, PP, root, and delegated-HR-admin personas through the real router and database. Owner: Access Control + UM.
- **R02:** Keep one human-key route mechanism; combine matrix/facade behavior tests with the scoped legacy identifier/branch oracle. Owner: Access Control + UM.
- **R04:** Keep dev seeding production-refusing, import-ordered, additive-only, and run-namespaced in test. Owner: Access Control + QA.
- **R05:** Do not treat a bootstrap/resolver proof as live profile projection coverage; retain read-only and Self-exclusive negatives. Owner: Access Control.
- **R06:** Decide the measurement shape before scheduling it. Preserve ACM-9's immutable evidence and distinct contract identity. Owner: Access Control.

## Assumptions and Dependencies

- The public AccessControl facade remains the sole authorization entry for routes.
- The existing backend suites can provision a migrated PostgreSQL database and use pseudonymised data.
- Story 4.2's recorded open PO/architect decisions remain unresolved unless separately changed; this plan does not resolve them.
- The current platform pair owns shared NFR definitions, evidence levels, isolation policy, and cross-epic regression rules.

## Interworking and Regression

| Component | Impact | Required regression scope |
| --- | --- | --- |
| Access Control facade | Shared authorization entry changes can affect every consumer. | Full access-control E2E and bypass/inconsistent-authorization cases. |
| User Management user routes | `GET /users/:id`, `PATCH /users/:id`, and `canEdit` depend on the section gate. | Access-control-adoption read, write, denial, and section-gate E2E. |
| Bootstrap / seed scripts | Root provisioning and dev graph facts control fixture legitimacy. | Bootstrap canonical-set, tree-position, dev-seed, and cleanup scenarios. |
| Full-profile overlay | Bootstrap fact must not widen active section behavior. | ACM11 overlay suites; retain live-section boundary. |

## Approval

- [ ] Product Manager review
- [ ] Architecture / technical review
- [ ] QA review

No approval is implied by the generated document. Epic validation is **CONCERNS (2026-09-12)**.

## References

- Epic: `_bmad-output/planning-artifacts/platform/epics.md` — `## Epic 4: Access Control Authorization Consolidation`
- Stories: `story-4-1-generalise-section-access-authorisation.md`; `story-4-2-default-org-relationship-seed.md`
- Shared policy: `_bmad-output/test-artifacts/test-design-architecture.md`; `_bmad-output/test-artifacts/test-design-qa.md`
- Architecture: `docs/architecture/access-control.md`; `docs/architecture/testing-strategy.md`
- Workflow routing: `docs/test-design-workflow-contract.md`

**Generated by:** BMad TEA Test Design workflow, Create / Epic-Level.
