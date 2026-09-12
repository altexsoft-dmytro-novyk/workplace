---
runScope: 'epic-level'
runKey: 'epic-platform-4'
epicId: 'PLAT-E4'
epicDomain: 'platform'
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicNumber: 4
workflowStatus: 'generated'
approval: 'granted'
approvalGrantedBy: 'Anna Pikula'
approvalGrantedDate: '2026-09-12'
validation: 'PASS'
validatedAt: '2026-09-12'
validationReport: '_bmad-output/test-artifacts/test-design-validation-report-epic-platform-4.md'
generated: '2026-09-12'
---

# Test Design: PLAT-E4 — Access Control Authorization Consolidation

**Date:** 2026-09-12  
**Author:** User  
**Status:** Written. Approval **granted 2026-09-12** by the requester, Anna Pikula, for the test design only. Validation **PASS (2026-09-12)**, confirmed across four
same-day Epic Validate runs. The 2026-09-12 edit below addressed the prior CONCERNS report and the
epic requirements review; a second run confirmed PASS after `deferred-work.md` and
`access-control.md` were updated to record E4-AV01/AV02/AV03's closures; a third run confirmed the
one remaining low-severity observation (E4-AV03's own re-run grep pattern) is now closed; a fourth
run, after the AF-3 decision (declined 2026-09-12; the dev seed now journals every edge), confirmed
PASS again with one new non-blocking finding (G-1, a checkpoint test-count discrepancy).
**Validation report:** `test-design-validation-report-epic-platform-4.md`, synchronized with
`test-design/README.md`.

## Edit record (2026-09-12, Epic-Level Edit, contract §4.3)

This edit addresses every finding in the CONCERNS report (F-1 to F-9) and the three findings of the
epic requirements review of the same day:

- **ERR-PLAT-E4-01:** the stale Epic 4 summary acceptance criteria are corrected in the epic
  source.
- **ERR-PLAT-E4-02:** the unjournaled dev-seed exception was first bounded with an owner. Later on 2026-09-12, Anna Pikula (PO + Architect) declined it, and the seed now journals (`s42d-ds-07`).
- **ERR-PLAT-E4-03:** the `401`/`404`/precedence denial-oracle cases are now mapped.

The epic source (`epics.md` `## Epic 4`) was corrected separately so that its summary acceptance
criteria match the Story 4.1 and 4.2 tickets. The plan's identity tuple is unchanged. This edit
changes no approval, validation verdict, coverage, sprint status, scenario file, or service code.

## Executive Summary

**Scope:** Epic-level test design for `PLAT-E4` in the `platform` domain. The epic:

- consolidates User Management route authorization around `@RequireSectionAccess`;
- moves section IDs to human keys;
- preserves the audience-first dual gate;
- establishes the evidence for root bootstrap and the dev seed.

It has two completed tracker stories, `PLAT-E4-S4.1` and `PLAT-E4-S4.2`. Their tracker status is
implementation context. It is not approval, validation, coverage, or release evidence.

The register has **eight risks**:

- **Six high (score ≥6).** Four are P0 security boundaries: audience-first authorization (R01),
  human-key/route-map drift (R02), functional-role widening (R03), and the section gate's divergence
  from the PM/AD-24 denial oracle (R08). Two are P1 boundaries: dev-seed operability (R04) and the
  read-only full-profile overlay (R05).
- **One medium (score 4), P2:** the `seeded-two-level` ACM-9 evidence gap (R06).
- **One low (score 2):** a regression that drops the dev seed's journal rows (R07). The AF-3
  exception was declined on 2026-09-12 and the seed now journals, so R07 is covered inside P1
  E4-C06.

Existing real-PostgreSQL facade and HTTP E2E suites are the starting evidence surface. This plan names
the required scenario bundles, three repository-audit obligations, and the residual evidence work. It
does not claim that any of them pass.

Two shipped behaviours are named rather than hidden. **Neither may be asserted as a defect, and
neither may be canonized as permanent:**

1. **The career-timeline write deviation** (PO ruling AF-2): `canEditTimeline` has no audience half.
   Closure is tracked as DEPT-2.
2. **The superseded `403` for missing or inactive targets** on the section gate. Closure is tracked
   as blocker `CONFLICT-UM-01`.

## Not in Scope

| Item | Reasoning | Mitigation / owner |
| --- | --- | --- |
| Directory HTTP performance (DIRA1 / Contract A) | It measures `GET /users`, not this epic's AccessControl facade work. | Remains `PMC-E1-S1.9` / `PG-04` evidence. |
| P6 `resolveAudiences` timing (Contract C) | P6 is a measurement record, not a gate, and has a different subject. | Kept separate from ACM-9. Owner: Access Control. |
| Closing the `profile:timeline:write` deviation (making career-timeline write a dual gate; removing the key from the `hr-admin` set, 6 → 5) | The PO accepted it as a condition-bound deviation under ruling AF-2. Its closure depends on the department-manager audience (DEPT-1). | **DEPT-2**, `dept-epic.md`. Owner: Access Control. This plan only **pins** the current behaviour and its closure trigger (E4-C04d). |
| The three-versus-six `hr-admin` canonical-set reconciliation routed from `PLAT-E3` | **Received here and not accepted as E4 scope.** Epic 4 is `done`. The set returns to five only when DEPT-2 removes `profile:timeline:write`, and DEPT-4 carries the test fallout. | Owner: Access Control, through **DEPT-2 / DEPT-4** (`dept-epic.md`). E4 evidence must not canonize six-key membership as an invariant (see Assumptions). |
| Runtime implementation of the PM/AD-24 route-class denial oracle | `UM-E0` owns the oracle for each route class (`test-design-epic-user-management-0.md` § Denial oracle). The runtime divergence is blocker `CONFLICT-UM-01`, which is open. | Owners: PO, Architect and QE. Runtime owner: `UM-E0-S0.1`. E4 still owns the **section-gate instances** in E4-C03/C04 (R08). |
| New profile routes or section-matrix expansion | `profile:identity` is the only section with a live UM consumer. New section routes belong to their first consumer story. | Each needs its own endpoint-map and AD-1 evidence. |
| Project/department audiences and TimeTracker sync | These are later platform epics with their own blockers. | Keep fail-closed behaviour. Do not infer access. |
| Frontend authorization UX | PLAT-E4 acceptance criteria state no frontend behaviour. | Frontend plans own UI evidence when a product flow needs it. |
| New Pact interactions | This epic specifies no changed consumer-provider HTTP boundary. | Existing contracts remain regression inputs. Provider source is authoritative. |

## Risk Assessment

### High-priority risks (score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| PLAT-E4-R01 | SEC | A guard or `canEdit` hint bypasses the audience-first dual gate, so an FR grant widens profile access. | 3 | 3 | 9 | Assert that route and hint use the same `hasSectionAccess` path, with deny and allow personas. | Access Control + UM | Before authorization changes ship |
| PLAT-E4-R02 | SEC | Legacy `S<n>` keys, duplicated predicates, or endpoint-map drift create a mismatch with the matrix decision. | 2 | 3 | 6 | Pair matrix/facade cases with a scoped executable-source migration oracle. | Access Control + UM | Before authorization changes ship |
| PLAT-E4-R03 | SEC | Root or a delegated HR Admin gains target data write from the functional role alone. **Boundary:** `profile:timeline:write` is the one sanctioned exception (AF-2; `access-control.md:81–88`). It is pinned as current behaviour, never asserted as a denial, and its closure (DEPT-2) must flip the pin. | 2 | 3 | 6 | Clean bootstrap, plus `403` and `canEdit:false` on unrelated visible targets for `profile:identity`, plus a pin on the timeline deviation with its closure trigger. | Access Control + UM | Before authorization changes ship |
| PLAT-E4-R04 | OPS | The dev seed modifies production data, builds a bad or non-idempotent graph, leaks into a production entrypoint, or pollutes the shared test database. | 2 | 3 | 6 | Test production refusal, absence from entrypoints, real import ordering, rerun behaviour, and run-namespaced cleanup. | Access Control + QA | Before script use in CI/demo |
| PLAT-E4-R05 | SEC | The full-profile overlay is misread as write authority or as proof of live projection coverage. | 2 | 3 | 6 | Prove only the read-only, Self-exclusive bootstrap and resolution facts. Keep live projection evidence separate. | Access Control | Before overlay consumers ship |
| PLAT-E4-R08 | SEC | `SectionAccessGuard` answers `403` for a missing or inactive target on `GET`/`PATCH /users/:id`. PM/AD-24 (§3.3.8) requires `404`, and `404` must precede mutation checks. Existing suites pin the superseded `403` (`s41c-sag-01` Tests 5–6; `umac-05` Test 3), so a green run passes for the wrong reason. | 3 | 2 | 6 | Specify the three-code cases for the section gate (E4-C03b/C04c). Mark the superseded `403` assertions stale. Regenerate them through AD-1 under `CONFLICT-UM-01`. | UM + Access Control; oracle owner `UM-E0` | Before `CONFLICT-UM-01` closes |

### Medium-priority risks (score 3–4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| PLAT-E4-R06 | PERF | The existing upward walk is credited without an agreed, comparable `seeded-two-level` ACM-9 measurement. Or Epic 4's added per-request queries (GAP-2) go unexamined. Or the result is conflated with DIRA1/P6. | 2 | 2 | 4 | Get an explicit scope decision that states baseline comparability. Close GAP-2 with a rerun or with an inspection proof. | Access Control + Architect |

### Low-priority risk (score 1–2)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| PLAT-E4-R07 | SEC | A change to `db:dev:seed-org` drops or unpairs the `AccessJournal` row for a seeded edge. **Decision 2026-09-12** (Anna Pikula, PO + Architect): the `spec-4-2d` AF-3 development-fixture exception is **declined**. Seeded edges must be journaled like any other manager change (§2.1, §3.4, PM/AD-29). Implemented on backend branch `feat/plat-e4-dev-seed-journal`, not yet merged. | 1 | 2 | 2 | `s42d-ds-07` asserts one `manager` row per seeded edge, in the `assignManager` shape, with no row on a no-op rerun. The product path stays asserted by `epic-4/access-journal`. | Access Control |

Score is `probability × impact`, and a score of 6 or more is high. This risk register is local to
PLAT-E4. It references shared platform risks in `test-design-architecture.md` without re-scoring
them.

## NFR Planning

| Category | Requirement / threshold | Risk | Planned validation | Expected evidence |
| --- | --- | --- | --- | --- |
| Security | PM/AD-24 denial oracle (§3.3.8): `401` for an invalid or inactive session; `404` for a hidden or missing target, with `404` before mutation checks; `403` for a visible but forbidden target. PLAT-E4 also requires audience-first `403` and `canEdit:false` on visible targets. | R01–R03, R05, R08 | Real facade/router E2E with distinct personas. A scoped source oracle is supplementary proof only. | E2E output from the suites named in the Coverage Plan. |
| Security (audit) | §3.4 / PM/AD-29: relationship changes are journaled in the same transaction, including edges written by the dev seed (AF-3 declined 2026-09-12). | R07 | Script E2E asserts one `manager` journal row per seeded edge. Product-path E2E asserts the journal row. | `s42d-ds-*` and `epic-4/access-journal` output. |
| Performance | If the residual question is accepted: ACM9-MVP-v1 facade measurement at 500 active targets, with 5 warm-ups and 20 samples. Warm p95 and worst case must each be ≤2s for every protocol shape. The run needs its own comparable baseline. | R06 | One explicit, append-only baseline and final pair, or a new protocol version. Or, for GAP-2, a written O(1)-per-request inspection proof. | Artifact under `_bmad-output/test-artifacts/performance/`, or the proof recorded against GAP-2. |
| Reliability / operability | Production refusal, a deterministic two-level dev graph, idempotent rerun, and isolated cleanup. No availability or retry threshold is stated. | R04 | Real script E2E against migrated PostgreSQL. | Script/E2E report and teardown evidence. |
| Maintainability | One declared section gate and no executable legacy branch. No numerical quality threshold is stated. | R02 | Route/facade integration cases plus a scoped `git grep`. | E2E output and a reviewable source oracle. |

**Unknowns:** these remain open:

- whether `seeded-two-level` becomes a distinct ACM-9 measurement dispatch, which protocol role it
  uses, and whether it is a protocol change or only a fixture variant;
- the Story 4.2 "Open for decision" items.

No threshold, live-overlay claim, or release outcome is invented. Contract A (DIRA1) and Contract C
(P6) are excluded.

## Entry Criteria

- The canonical PLAT-E4 epic source, both story tickets, and the platform test-design pair remain readable.
- Migrated PostgreSQL, pseudonymised seed/import data, and the backend serial E2E harness are available.
- Test runs use isolated run namespaces and clean up only records they own.
- `ROOT_WORK_EMAIL`, `DATABASE_URL`, and the real production provisioning sequence are available for bootstrap and script scenarios.
- The `seeded-two-level` measurement is not scheduled until its scope decision and its baseline-comparability choice are recorded.

## Exit Criteria

- Every P0 scenario bundle is executable and passes in its required real database/router environment.
  **The PM/AD-24 `404`/precedence cases in E4-C03b/C04c are expected to fail until `CONFLICT-UM-01`
  closes.** That failure is an open P0 blocker with an owner. It is not a waiver, and P0 exit is not
  met while it stands.
- P1 failures are triaged with an owner. Every high-risk mitigation has an evidence path.
- The static migration oracle and the behavioural E2E together show no executable legacy gate path.
- Repository-audit obligations E4-AV01 to E4-AV03 are recorded with their findings.
- If R06 is accepted, its immutable ACM-9 artifact exists with a comparable baseline and is evaluated only under Contract B. GAP-2 is closed by that run or by an inspection proof.
- Approval and validation are separate human/workflow acts. Requester approval (2026-09-12) and Epic Validate PASS (2026-09-12) are both recorded; neither is execution evidence, and neither satisfies the Exit Criteria above.

## Test Coverage Plan

Priority expresses impact, not execution timing. Evidence locations are relative to
`services/backend/`. `test/access-control/` holds facade, bootstrap, and script E2E suites.
`test/user-management/access-control-adoption/` holds real HTTP adoption suites. A named suite shows
where evidence lives. It does not claim the cases were re-executed in this workflow. **Existing**
means the suite already contains the case. **Planned** means the assertion must be added or
regenerated.

### P0 — authorization boundaries

**Criteria:** a security boundary with no safe workaround, where a wrong result widens data access or
misreports the denial contract.
**Purpose:** prove that every identity-card route decision goes through the audience-first section
gate and that the functional role never supplies data write.

| ID | Requirement / scenario bundle | Level | Risk | Owner | Evidence location |
| --- | --- | --- | --- | --- | --- |
| E4-C01 | An active user holds the default section-write baseline, and an inactive user is denied. An explicit FR grant remains valid. No `employee` policy row exists. The unit level covers `DEFAULT_PERMISSIONS` composition and unknown-key denial exhaustively. | Facade E2E + unit | R01, R03 | Access Control | Existing: `test/access-control/s41a-default-permissions-baseline.e2e-spec.ts`; `src/access-control/domain/services/functional-role-evaluator.service.spec.ts` |
| E4-C02 | Human-key matrix semantics hold: unknown keys fail closed, the strongest audience wins, and no executable `S<n>` identifier remains in `src/` or `test/`. | Facade E2E + unit + repository audit | R02 | Access Control | Existing: `test/access-control/acm5-section-access.e2e-spec.ts`; `src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts`. Planned: scoped `git grep -n` oracle that separates dated comments from executable use. |
| E4-C03a | For a **visible** target, `GET /users/:id` data, `PATCH /users/:id`, and `canEdit` share one section decision. A baseline holder with `colleague`/`self` audience gets `403` / `canEdit:false`. A reporting-line manager or assigned PP gets `200` / `canEdit:true`. The row is unchanged after a denied `PATCH`. | Real HTTP / PostgreSQL E2E | R01, R02 | User Management | Existing: `test/user-management/access-control-adoption/s41c-section-access-gate.e2e-spec.ts` (`s41c-sag-01` Tests 1–4, `-02`, `-04`), `read-adoption.e2e-spec.ts`, `write-adoption.e2e-spec.ts` (UMAC-07 Tests 3–4) |
| E4-C03b | Denial oracle on the section-gated routes. (1) An invalid token or a deactivated caller gets `401` on both `GET` and `PATCH /users/:id`. (2) A missing target id or an inactive target gets `404` with a leak-free body on `GET`. (3) The same holds on `PATCH`, and **`404` comes before the mutation check**: a caller who would be refused `403` on a visible target still gets `404` on a missing one, and no row is written. (4) `403` is used only for a visible but forbidden target. | Real HTTP / PostgreSQL E2E | R08 | User Management; oracle owner `UM-E0` | (1) Existing: `read-denial.e2e-spec.ts` UMAC-05 Tests 1–2 (`GET`: invalid token, deactivated caller); `write-adoption.e2e-spec.ts` UMAC-07 Test 5 (`PATCH`: invalid token). Planned: deactivated caller on `PATCH`. (2)–(3) Planned, regenerated through AD-1 under `CONFLICT-UM-01`. **Stale:** `s41c-sag-01` Tests 5–6 and UMAC-05 Test 3 pin the superseded `403`. |
| E4-C04a | Clean-bootstrap root on a production-shaped database resolves `colleague` to every employee. It gets `PATCH /users/:id` → `403` and `canEdit:false` on every visible target, including its own card (`self: read`). Root sits at the top of the tree with no relationship row of its own. | Real bootstrap + HTTP E2E | R03 | Access Control + UM | Existing: `test/user-management/access-control-adoption/s42a-op-root-operator-set.e2e-spec.ts` (`s42a-op-04` Tests 1–3, unrelated target); `test/user-management/access-control-adoption/s42b-tr-root-tree-position.e2e-spec.ts` (`s42b-tr-03`, tree position). Planned: root's own card → `canEdit:false`, in both production and dev (spine) shapes. |
| E4-C04b | A delegated HR Admin (FR only, no relationship) is allowed on the global FR-gated routes it holds. On an unrelated **visible** person, `PATCH /users/:id` → `403` and `canEdit:false`. The canonical `hr-admin` membership is asserted by the membership suite, not by the invariant suite. It is six keys only while DEPT-2 is open; the three-versus-six reconciliation belongs to DEPT-2/DEPT-4, not to E4. | Real bootstrap + HTTP E2E | R03 | Access Control + UM | Existing: `s42a-op-root-operator-set.e2e-spec.ts` `s42a-op-05` Test 1 (list users), Test 4 (relationship write, departure record), Tests 2–3 and 5 (data denials); `test/access-control/s42a-op-bootstrap-canonical-set.e2e-spec.ts`. Planned: every other `hr-admin` feature route that exists at run time (the ticket names `POST /users` and role assignment). |
| E4-C04c | For the root and delegated-HR-Admin personas, a missing or inactive target on `PATCH /users/:id` returns `404` before any feature or section check. `403` is never used for it. | Real HTTP E2E | R03, R08 | UM; oracle owner `UM-E0` | Planned, same regeneration as E4-C03b under `CONFLICT-UM-01` |
| E4-C04d | **Pin of the accepted deviation.** A delegated HR Admin writes an unrelated person's career timeline and gets `201`. **Closure trigger:** when DEPT-2 lands, this case is retired in place and replaced by a dual-gate denial (`403` for a visible target without a reporting/PP write audience). Until then, asserting a denial here is a wrong-reason failure. | Real HTTP E2E | R03 | Access Control + UM | Existing: `s42a-op-root-operator-set.e2e-spec.ts` (`s42a-op-06` Tests 1–2). Replacement is planned under DEPT-2/DEPT-4. |

**P0 estimate:** ~8–14 hours of net test and evidence repair, excluding runtime work under
`CONFLICT-UM-01`.

### P1 — bootstrap, seed, audit, and regression boundaries

**Criteria:** provisioning, fixture, and regression behaviour. A wrong result corrupts evidence or
environments, with a limited workaround.
**Purpose:** make root provisioning, the dev spine, and the regression envelope reproducible and
auditable.

| ID | Requirement / scenario bundle | Level | Risk | Owner | Evidence location |
| --- | --- | --- | --- | --- | --- |
| E4-C05 | Root has no seeded relationship row. The bootstrap grants are canonical. The full-profile overlay is read-only and Self-exclusive. The bootstrap grant is journaled in the same transaction. | Bootstrap + facade/HTTP E2E | R03, R05 | Access Control | Existing: `test/access-control/s42b-tr-bootstrap-no-relationship-row.e2e-spec.ts`; `test/access-control/acm11-full-profile-overlay-bootstrap.e2e-spec.ts`, `-resolution.e2e-spec.ts`, `-real-sections.e2e-spec.ts` |
| E4-C06 | The dev seed: (1) refuses `NODE_ENV=production` before connecting to the database; (2) creates only the specified fake two-level spine after import; (3) preserves existing direct edges; (4) is deterministic for inactive and multi-department users; (5) reruns safely; (6) is **absent from `prisma/seed.ts` and `scripts/bootstrap-access-control.ts`**; (7) **writes exactly one `kind: 'manager'` `AccessJournal` row per seeded edge, in the same transaction and in the `assignManager` shape (actor root, `before: NULL`, `after` = the edge), and none on a no-op rerun** (AF-3 exception declined 2026-09-12); (8) leaves the ACM-1 invariant suite `acm1r-fr-foundation` green. For contrast, root's real `POST /users/:id/relationships` precondition writes exactly one `manager` journal row. | Script/integration E2E + repository audit | R04, R07 | Access Control + QA | Existing (1)–(5): `test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts` (`s42d-ds-01`…`-04`); `test/user-management/access-control-adoption/s42d-ds-root-resolves-over-seeded-population.e2e-spec.ts`. Existing (8): `test/access-control/acm1r-fr-foundation.e2e-spec.ts` (GAP-1 closed 2026-09-08). Planned (6): `git grep -n "seed-org\|dev-seed-org"` over both entrypoints. (7): `s42d-ds-07` Tests 1–3 in the same suite; scenario `docs/test-cases/access-control-kernel/dev-seed-spine/s42d-ds-07-seeded-edges-are-journaled.md`. The tests were red against `de508c9` and are green with the backend change on `feat/plat-e4-dev-seed-journal` (not yet merged). Product-path journaling is existing in `test/user-management/epic-4/access-journal.e2e-spec.ts`. |
| E4-C07 | Authorization changes rerun all access-control E2E and the affected User Management adoption suites. This includes both FR-set suites: `acm1r-fr-foundation` for invariants and `s42a-op-bootstrap-canonical-set` for membership. | PR regression E2E | R01–R05, R08 | QA + component owners | Platform pair cross-epic regression map |

**P1 estimate:** ~10–18 hours of net test and evidence repair.

### P2 — pending performance and audit-closure evidence

**Criteria:** evidence that is contingent on a decision or deferred, with an acceptable temporary
workaround.
**Purpose:** close the residual measurement and tracker questions without converting them into
gates.

| ID | Requirement / scenario bundle | Level | Risk | Owner | Evidence location |
| --- | --- | --- | --- | --- | --- |
| E4-C08 | First decide, then measure only if accepted. The `seeded-two-level` shape under ACM9-MVP-v1 must not change resolver behaviour or CI blocking status. **Comparability constraint** (`testing-strategy.md` ACM-9 protocol §6–7): a new shape changes `fixture_manifest_hash`, and a shape added to the protocol sequence creates a new protocol version. The run therefore cannot be compared with any existing `acm9-baseline-*` artifact. The decision must pick one of two routes: (a) its own baseline and final pair under a fixture manifest for that shape, or (b) a new protocol version. | Measurement | R06 | Access Control + Architect | Planned: a new immutable baseline/final pair. None exists yet. |
| E4-C09 | GAP-2 (`dept-epic.md`): Epic 4 net-adds per-request queries (`isActiveUser` per `DEFAULT_PERMISSIONS` key; the `resolveJwtSubject` `findUnique`). Close it with either (a) an ACM-9 rerun or (b) a one-paragraph inspection proof, recorded against GAP-2, that both queries are O(1) per request and outside the 500-target walk. | Measurement or manual-review | R06 | Access Control | Planned. Route (b) is cheaper and sufficient if the proof holds. `src/user-management/infrastructure/__tests__/jwt-session-resolver.adapter.spec.ts` supports it. |

**P2 estimate:** ~3–8 hours after the decision. No P3 scenario is identified.

### Repository-audit obligations (not test cases)

These use the `repository-audit` evidence level (the `PLAT-E1` AV pattern). They record a finding.
They do not execute product behaviour.

| ID | Obligation | Acceptance criterion | Owner | Evidence / observed input at planning |
| --- | --- | --- | --- | --- |
| E4-AV01 | `scripts/dev-grant-root.ts` is retired, `create:root` is repointed, and nothing in `src/`, `scripts/`, or `package.json` still gives root `canEdit` through a special case. | 4.1 AC "no functional-role or root special case" (corrected); 4.2 dev-spine AC | Access Control | Existing: `s42d-ds-dev-seed-spine.e2e-spec.ts` `s42d-ds-05` Tests 1–4. Planned: `git grep -n "dev-grant-root\|canEditS1\|isAllowedForTarget\|EDIT_USER_FEATURE\|user-management:edit" -- src scripts package.json`, where only dated comments are permitted. |
| E4-AV02 | Both access-control deferred-work entries that Story 4.1 closes carry a closed status that cites delivery evidence. | 4.1 AC "Closes the two access-control deferred-work entries" | Access Control | **Recorded 2026-09-12:** in `_bmad-output/implementation-artifacts/access-control/deferred-work.md`, "Generalise section-access authorisation" reads `CLOSED 2026-09-12 — DELIVERED` and cites `b311589` (4.1c) and `ef03c88` (4.1d). The `profile:timeline` entry records its rename half as `CLOSED 2026-09-12` (4.1b). Its remaining `canAccessSection`/dual-gate work stays open as DEPT-2 (not E4 scope). Re-run on change: check both status lines. |
| E4-AV03 | `docs/architecture/access-control.md` describes the FR-set suites as they are now: `s42a-op-bootstrap-canonical-set` owns membership, and `acm1r-fr-foundation` owns the invariants with a source-derived count. No "stale three-key" claim remains. | 4.2 AC "ACM-1 invariant suite green" | Architect + Access Control | **Recorded 2026-09-12:** the note after the canonical permission list was reconciled with `dept-epic.md` GAP-1 (closed 2026-09-08) and `test/access-control/acm1r-fr-foundation.e2e-spec.ts:58–59`. Re-run on change: `git grep -n "three.\?.user-management\|three-key\|pins the three" docs/architecture/access-control.md` returns only the historical "Originally … the three `user-management:*` keys only" sentence. |

## Acceptance-Criterion Traceability

The full Story 4.1 and 4.2 tickets are authoritative. The epic summary was aligned with them on
2026-09-12.

| Story AC (ticket) | Planned verification | Level / owner | State |
| --- | --- | --- | --- |
| 4.1-1 — `isAllowed` baseline for active users; inactive users denied; explicit FR grant resolves; no `employee` row | E4-C01 | Facade E2E + unit / Access Control | Existing |
| 4.1-2 — no `S<n>` section identifier in `src/`/`test/`; human keys only, anything else → `none` | E4-C02 | Facade E2E + unit + audit / Access Control | Existing E2E; audit planned |
| 4.1-3 — `PATCH` and the `canEdit` hint are gated by `@RequireSectionAccess('profile:identity','write')`; colleague/self → `403`/`false`; manager/PP → `200`/`true` | E4-C03a; oracle boundary E4-C03b | HTTP E2E / UM | Existing; the `404`/precedence part is planned (R08) |
| 4.1-4 — `canEditS1` and the `EDIT_USER_FEATURE`/`READ_USER_FEATURE` branches are gone | E4-AV01 grep; E4-C02 | Audit / Access Control | Planned |
| 4.1-5 — adoption/profile E2E stay green or are updated with a recorded reason | E4-C07; the stale `403` assertions are recorded under E4-C03b | Regression E2E / QA | Existing; stale cases named |
| 4.1-6 — the two deferred-work entries are closed | E4-AV02 | Audit / Access Control | Recorded (both entries closed with evidence; DEPT-2 remainder outside E4) |
| Epic 4.1 summary — no root/FR special case (supersedes the `dev-grant-root.ts` wording) | E4-AV01; E4-C04a | Audit + HTTP E2E / Access Control | Existing + planned |
| 4.2-1 — no FR branch in the identity-card decision (standing regression grep) | E4-AV01 | Audit / Access Control | Planned |
| 4.2-2 — dev: root `reporting`→`write` on other spine members with `canEdit:true`, own card `false`; production: root `colleague`, `403`, `canEdit:false` | Dev: E4-C06 (`s42d-ds-06` Tests 2–4). Production: E4-C04a | HTTP E2E / Access Control + UM | Existing; own-card `false` planned |
| 4.2-3 — delegated HR Admin: global FR routes allowed; unrelated `PATCH` → `403`; `canEdit:false` | E4-C04b; timeline exception pinned by E4-C04d | HTTP E2E / Access Control + UM | Existing; remaining FR routes planned |
| 4.2-4 — upward walk locked; `seeded-two-level` ACM-9 evidence | E4-C08; GAP-2 under E4-C09 | Measurement / Access Control + Architect | Open decision, non-blocking |
| 4.2-5 — `db:dev:seed-org` throws in production, is absent from `prisma/seed.ts` and `bootstrap-access-control.ts`, and the ACM-1 invariant suite is green | E4-C06 (1), (6), (8); E4-AV03 | Script E2E + audit / Access Control + QA | Refusal and suite existing; absence audit planned; doc drift reconciled (E4-AV03) |
| 4.2-6 — closes the "reporting walk descends" deferred item and updates the full-profile holder question | E4-C05 (holder); E4-AV02 method applied to `deferred-work.md` | Audit / Access Control | Entries read as resolved at planning |
| Epic 4.2 decision — dev-seed edges are journaled (AF-3 declined 2026-09-12) | E4-C06 (7): `s42d-ds-07` Tests 1–3 | Script E2E / Access Control | Decided; implemented on an unmerged backend branch |
| Epic 4.2 boundary — HTTP denial oracle (§3.3.8) | E4-C03b, E4-C04c | HTTP E2E / UM; oracle `UM-E0` | Planned; blocked on `CONFLICT-UM-01` |

## Execution Strategy

- **PR:** run every affected functional suite that fits the established PR budget. That includes
  the full access-control E2E set for facade changes and the affected UM adoption suites. Backend
  E2E stays serial with run-namespaced data. Repository-audit greps (E4-AV01, E4-C02, E4-C06 (6))
  run as fast pre-E2E checks.
- **Nightly:** run only an accepted ACM9-MVP-v1 measurement or its successor protocol. It stays
  informational, and this plan does not promote it to a blocking job.
- **Weekly / release preparation:** repeat the accepted measurement when its fixture or resolver
  dependency changes, keeping each append-only artifact. Rerun E4-AV02/AV03 when their source files
  change. Run the NFR assessment only after evidence exists.

## Resource Estimates and Prerequisites

| Priority | Effort (interval) |
| --- | --- |
| P0 | ~8–14 hours |
| P1 | ~10–18 hours |
| P2 | ~3–8 hours after its decision |
| Audit obligations | included in P0/P1 |
| **Total** | **~21–40 hours, about 0.5–1.5 weeks for one engineer** |

This covers evidence maintenance only. It does not estimate implementation delivery that is already
recorded, or runtime work under `CONFLICT-UM-01` or DEPT-2.

Required tooling and data:

- backend Jest/supertest E2E;
- a migrated PostgreSQL test instance;
- pseudonymised seed/import fixtures;
- the production bootstrap scripts;
- the existing run-namespace cleanup convention.

No browser, third-party service, or Pact-broker access is required for the stated scenarios.

## Quality Gate Criteria

These are test-design completion criteria, not an executable release verdict:

- The P0 scenario pass rate is 100%. The `CONFLICT-UM-01` cases block P0 exit until they are green
  (see Exit Criteria). The P1 target is at least 95%, with an explicit owner or waiver for any
  exception. P2 is informational until accepted.
- Every high-risk mitigation needs a named owner and a scenario or evidence path.
- Every security scenario bundle needs runnable, real facade/router evidence. A static check cannot
  substitute for it.
- Every acceptance criterion maps to a scenario, an audit obligation, or an explicit owned gap (see
  the traceability table). P1/P2 scope is tracked as stated, not converted into a repository-wide
  percentage.
- Bug severity: any P0 wrong-reason pass is treated as a P0 defect in the evidence. Examples are a
  superseded `403` asserted as current, or a deviation asserted as a denial.
- NFR evidence is identified for each in-scope category. The final PASS/CONCERNS/FAIL belongs to
  `nfr-assess` once evidence exists.

## Mitigation Plans

- **R01/R03:** keep the route guard and `canEdit` behind `hasSectionAccess`. Test ordinary,
  reporting, PP, root, and delegated-HR-admin personas through the real router and database. Pin the
  AF-2 timeline deviation, and retire the pin only under DEPT-2. Owner: Access Control + UM.
- **R02:** keep one human-key route mechanism. Combine matrix/facade behaviour tests with the scoped
  oracle for legacy identifiers and branches. Owner: Access Control + UM.
- **R04:** keep the dev seed production-refusing, import-ordered, additive-only, absent from
  production entrypoints, and run-namespaced in test. Owner: Access Control + QA.
- **R05:** do not treat a bootstrap or resolver proof as live profile projection coverage. Keep the
  read-only and Self-exclusive negatives. Owner: Access Control.
- **R06:** decide the measurement shape and its baseline-comparability route before scheduling it.
  Close GAP-2 by rerun or inspection proof. Preserve ACM-9's immutable evidence and distinct contract
  identity. Owner: Access Control + Architect.
- **R07:** keep every seeded edge paired with its `manager` journal row in one transaction, in the
  `assignManager` shape. `s42d-ds-07` guards this. Owner: Access Control.
- **R08:** mark the superseded `403` assertions stale and regenerate the three-code cases through
  AD-1 under `CONFLICT-UM-01`. Do not rewrite historical expected results as if they always said
  `404`. Owner: UM + Access Control; oracle owner `UM-E0`.

## Assumptions and Dependencies

- The public AccessControl facade remains the only authorization entry for routes.
- The existing backend suites can provision a migrated PostgreSQL database and use pseudonymised data.
- Story 4.2's recorded "Open for decision" items stay unresolved unless changed separately. This plan
  does not resolve them.
- **FR-set evidence:** `s42a-op-bootstrap-canonical-set` owns exact membership, currently six keys
  while DEPT-2 is open. `acm1r-fr-foundation` owns the invariants only, with its count derived from
  `CANONICAL_PERMISSIONS`. No E4 case may hard-code six as a permanent invariant.
- **Dependencies:** DEPT-2 and DEPT-4 (`dept-epic.md`) for the timeline deviation and the set
  reconciliation; `CONFLICT-UM-01` (`blockers.yaml`) and the `UM-E0` plan for the route-class
  denial oracle; merge of backend branch `feat/plat-e4-dev-seed-journal` (AF-3 decision); GAP-2 for the per-request query proof.
- The current platform pair owns shared NFR definitions, evidence levels, isolation policy, and
  cross-epic regression rules.

## Interworking and Regression

| Component | Impact | Required regression scope |
| --- | --- | --- |
| Access Control facade | A change to the shared authorization entry can affect every consumer. | Full access-control E2E, plus bypass and inconsistent-authorization cases. |
| User Management user routes | `GET /users/:id`, `PATCH /users/:id`, and `canEdit` depend on the section gate and on the denial oracle. | Adoption read, write, denial, and section-gate E2E, including the E4-C03b oracle cases. |
| Career-timeline write | The AF-2 deviation is live until DEPT-2. | `s42a-op-06` pin; replaced when DEPT-2 lands. |
| Bootstrap / seed scripts | Root provisioning and dev graph facts control whether fixtures are legitimate. | Bootstrap canonical set, invariants, tree position, dev seed, entrypoint absence, seed journaling (`s42d-ds-07`), and cleanup scenarios. |
| Relationship journal | Product mutations and the dev seed must both journal every manager change. | `epic-4/access-journal` plus `s42d-ds-07`. |
| Full-profile overlay | The bootstrap fact must not widen active section behaviour. | ACM11 overlay suites; keep the live-section boundary. |

## Approval

- [x] Requester approval — **granted 2026-09-12 by Anna Pikula**, for the test design only
- [ ] Product Manager review
- [ ] Architecture / technical review
- [ ] QA review

Approval was granted by an explicit human act after validation; the document itself implies none.
The approval does not close `CONFLICT-UM-01` and does not assert coverage, execution results, or
release readiness.

The AF-3 decision (exception declined, seed journals) was a separate act, taken on 2026-09-12 by
Anna Pikula as PO + Architect. It was recorded in this plan after the approval, and it narrows no
approved obligation. It turns one planned assertion into a decided and implemented one. Epic validation is **PASS (2026-09-12)**, confirmed
across four same-day re-validations, the fourth run after this AF-3 decision itself, with one new
non-blocking finding (G-1, a checkpoint test-count discrepancy that does not affect the verdict).
PASS is not approval, coverage, or release readiness — it means no blocking validation finding
remains.

## References

- Epic: `_bmad-output/planning-artifacts/platform/epics.md` — `## Epic 4: Access Control Authorization Consolidation`
- Stories: `_bmad-output/implementation-artifacts/platform/story-4-1-generalise-section-access-authorisation.md`; `story-4-2-default-org-relationship-seed.md`; increment specs `spec-4-2a` (AF-2), `spec-4-2d` (AF-3)
- Forward work: `_bmad-output/planning-artifacts/platform/dept-epic.md` (DEPT-2, DEPT-4, GAP-1, GAP-2)
- Blockers: `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml` (`CONFLICT-UM-01`)
- Requirements: `docs/project-requirements.md` §2.1, §2.2–2.4, §3.2, §3.3.8, §3.4
- Shared policy: `_bmad-output/test-artifacts/test-design-architecture.md`; `_bmad-output/test-artifacts/test-design-qa.md`; oracle owner `test-design-epic-user-management-0.md`
- Architecture: `docs/architecture/access-control.md`; `docs/architecture/testing-strategy.md`; PM spine AD-24, AD-28, AD-29
- Workflow routing: `docs/test-design-workflow-contract.md`

**Generated by:** BMad TEA Test Design workflow, Create / Epic-Level; edited by Edit / Epic-Level on
2026-09-12.
