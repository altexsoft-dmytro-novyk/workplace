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
validatedAt: '2026-09-13'
validationReport: '_bmad-output/test-artifacts/test-design-validation-report-epic-platform-4.md'
generated: '2026-09-12'
---

# Test Design: PLAT-E4 — Access Control Authorization Consolidation

**Date:** 2026-09-12 (edited 2026-09-13)  
**Author:** User  
**Status:** Written. Approval **granted 2026-09-12** by the requester, Anna Pikula, for the test design only. The last-recorded validation before this Edit was **PASS (2026-09-12)**, confirmed across four
same-day Epic Validate runs. The 2026-09-12 edit below addressed the prior CONCERNS report and the
epic requirements review; a second run confirmed PASS after `deferred-work.md` and
`access-control.md` were updated to record E4-AV01/AV02/AV03's closures; a third run confirmed the
one remaining low-severity observation (E4-AV03's own re-run grep pattern) is now closed; a fourth
run, after the AF-3 decision (declined 2026-09-12; the dev seed now journals every edge), confirmed
PASS again with one new non-blocking finding (G-1, a checkpoint test-count discrepancy).
**A further Edit (2026-09-13, below) records same-day evidence completion for E4-C03b, E4-C04a,
E4-C04b, E4-C04c, E4-C02's/E4-AV01's static oracle, and E4-C06(6)/E4-C09(GAP-2). A fifth Epic
Validate run, the first for this edited content, independently re-verified every completion claim
(including two reproducible test runs and a `git merge-base` check) and confirmed PASS (2026-09-13),
with one non-blocking finding (H-1, a pre-existing test-count undercount in the E4-C04d citation) —
see `test-design-validation-report-epic-platform-4.md`.**
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

## Edit record (2026-09-13, Epic-Level Edit, contract §4.3) — correction log

**Operation:** Edit · scope `epic` · `PLAT-E4` · domain `platform` · number `4` · `runKey`
`epic-platform-4`. Identity tuple unchanged. This edit changes no approval, sprint status, gate,
trace artifact, or other epic's plan/checkpoint.

**Why:** same-day (2026-09-13) test and evidence work closed several rows this plan had recorded as
`Planned` or as blocked on an open item. Each claim below was independently re-verified against the
cited file/test/commit before being written here — see the validation report for the re-verification
detail.

**Verified and reflected:**

- **E4-C03b (denial oracle).** (1) `write-adoption.e2e-spec.ts` UMAC-07 Test 6 (deactivated caller
  PATCH → `401`) — new. (2)–(3) `test/user-management/access-control-adoption/umac-11-hidden-target-denial-oracle.e2e-spec.ts`
  (Tests 1–6) plus rewritten `s41c-sag-01` Tests 5–6, `s41c-sag-04` Test 5, and `umac-05` Test 3 —
  all on backend commit `89ea674` (branch `feat/conflict-um-01-hidden-target-404`). No stale `403`
  pin remains. **Removed the "blocked on `CONFLICT-UM-01`" language**: `blockers.yaml` records
  `CONFLICT-UM-01` **closed 2026-09-12** (closure_note cites this same commit). **Added nuance not
  in the closure note:** `git -C services/backend merge-base --is-ancestor 89ea674 origin/main`
  returns false (verified 2026-09-13) — the branch carrying the fix is **not yet merged** into
  `services/backend` `main`. This plan records both facts without resolving the merge question,
  which is outside test-design scope.
- **E4-C04c.** Root and delegated-HR-Admin missing/inactive-target `PATCH` → `404` (`s42a-op-04`
  Tests 5–6; `s42a-op-05` Tests 6–7) — new, same code path as E4-C03b.
- **E4-C04a.** Root's own card `canEdit:false` — new in both the production bootstrap (`s42a-op-04`
  Test 4) and the dev spine (`s42d-ds-06` Test 5).
- **E4-C04b.** All 14 routes gated by the six canonical FR keys are now evidenced: 9 previously
  untested routes covered by real HTTP (`s42a-op-05` Tests 8–17); Test 18 is **structural-only**
  (regex on the shared decorator) for the retry/reparenting sub-routes, recorded as a weaker,
  advisory-flagged oracle, not additional live-HTTP evidence. `POST /users` and "role assignment"
  are recorded **N/A**: the bare create route does not exist (only `POST /users/import`, covered by
  Test 15 — platform story 1-8 removed the create path), and no HTTP route anywhere attaches an FR
  policy to a user.
- **File move (2026-09-13, after test review).** `s42a-op-05`/`s42a-op-06` tests moved out of
  `s42a-op-root-operator-set.e2e-spec.ts` into new `test/user-management/access-control-adoption/s42a-op-05-delegated-hr-admin.e2e-spec.ts`,
  with shared setup in new `s42a-op-root-operator-set.fixtures.ts`; `s42a-op-03`/`s42a-op-04` stay in
  the original file. Every plan citation of op-05/op-06 test evidence (E4-C04b, E4-C04c, E4-C04d) is
  updated to the new file path above. This followed `test-review-plat-e2-e4-2026-09-13.md`'s two HIGH
  findings against the pre-split file (H5: 1339 lines, over the 1000-line cap; H4: `s42a-op-05` Test
  13 had an undeclared cross-`describe` ordering dependency on `s42a-op-03` Test 3). Both are now
  fixed: the file is split into three (344/584/646 lines), Test 13 now asserts its own precondition
  and targets a fixture this describe block owns (no cross-file/cross-describe dependency), and the
  Nadia delegation setup is hoisted to a top-level `beforeAll` via `delegateHrAdminToNadia()`. Verified
  2026-09-13, run twice: `s42a-op-root-operator-set.e2e-spec.ts` (13/13) + `s42a-op-05-delegated-hr-admin.e2e-spec.ts`
  (24/24) = 37/37 green both times. Recorded as **resolved**, not merely fixed-and-unverified.
- **E4-C02 / E4-AV01.** Both static-oracle halves (the five root/FR-special-case identifiers and the
  retired `S<n>` pattern) are delivered in one new DB-free spec,
  `src/access-control/infrastructure/bootstrap/legacy-gate-absence.spec.ts` (7 tests, scoped to
  production source, excluding `__tests__/`/`*.spec.ts`/`generated/` where the same strings appear
  deliberately as negative-test evidence). Hand-run grep findings for the test-side negative evidence
  are recorded in `docs/test-cases/access-control-kernel/fr-bootstrap/e4-av01-legacy-gate-absence-in-production-source.md`.
- **E4-C06 (6).** `src/access-control/infrastructure/bootstrap/dev-seed-absence.spec.ts`, scenario
  `s42d-ds-08`, delivers the entrypoint-absence static oracle. **(7) stays open**: `s42d-ds-07` still
  depends on unmerged backend branch `feat/plat-e4-dev-seed-journal` — a human merge decision, not
  re-decided by this edit.
- **Evidence-producer fix (mentioned where this plan discusses live evidence, not elsewhere):**
  workspace commit `087dabb` fixed a first-wins index bug in
  `scripts/build-live-verification-results.cjs` that had left several `acm1r-fr-foundation`
  cases (`ACM1-FB-02/04/05/06/07`, `ACM1R-FB-10/12/13/21/22`) recorded `not_observed` although that
  suite is 39/39 green.
- **Test quality (`test-review-plat-e2-e4-2026-09-13.md`).** Two HIGH findings against the
  pre-split `s42a-op-root-operator-set.e2e-spec.ts` are FIXED and re-verified — see the file-move
  entry above. Recorded as resolved, not merely noted.
- **GAP-2.** `dept-epic.md` records GAP-2 **CLOSED 2026-09-12 — by inspection proof**; every
  Executive Summary/Risk/NFR/Exit-Criteria/Coverage/Traceability/Mitigation/Dependency mention of
  GAP-2 in this plan is updated to reflect that closure. `E4-C08`'s separate `seeded-two-level`
  ACM-9 measurement question **stays open** — this edit does not decide it.
- **Left open, unchanged (not decided by this edit):** E4-C08 (`seeded-two-level` ACM-9 decision),
  E4-C04d (pinned deviation until DEPT-2 — file citation only updated, no assertion changed),
  `s42d-ds-07`'s backend-branch merge.

**Files this edit changed:** this plan only (per contract §4.3, an Epic Edit may modify only the
selected epic plan). The matching checkpoint records this same edit separately. No trace artifact,
sprint-status, other epic's plan/checkpoint, or service code was touched.

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
2. **The superseded `403` for missing or inactive targets** on the section gate, on `services/backend`
   `main`. `blockers.yaml` records blocker `CONFLICT-UM-01` **closed 2026-09-12**, on the strength of
   a fix and its Stage-2 evidence on backend branch `feat/conflict-um-01-hidden-target-404` (commit
   `89ea674` and later same-day commits). **That branch is not yet merged into `services/backend`
   `main`** (verified 2026-09-13: `89ea674` is not an ancestor of `origin/main`). See E4-C03b/C04c and
   the 2026-09-13 Edit record below.

## Not in Scope

| Item | Reasoning | Mitigation / owner |
| --- | --- | --- |
| Directory HTTP performance (DIRA1 / Contract A) | It measures `GET /users`, not this epic's AccessControl facade work. | Remains `PMC-E1-S1.9` / `PG-04` evidence. |
| P6 `resolveAudiences` timing (Contract C) | P6 is a measurement record, not a gate, and has a different subject. | Kept separate from ACM-9. Owner: Access Control. |
| Closing the `profile:timeline:write` deviation (making career-timeline write a dual gate; removing the key from the `hr-admin` set, 6 → 5) | The PO accepted it as a condition-bound deviation under ruling AF-2. Its closure depends on the department-manager audience (DEPT-1). | **DEPT-2**, `dept-epic.md`. Owner: Access Control. This plan only **pins** the current behaviour and its closure trigger (E4-C04d). |
| The three-versus-six `hr-admin` canonical-set reconciliation routed from `PLAT-E3` | **Received here and not accepted as E4 scope.** Epic 4 is `done`. The set returns to five only when DEPT-2 removes `profile:timeline:write`, and DEPT-4 carries the test fallout. | Owner: Access Control, through **DEPT-2 / DEPT-4** (`dept-epic.md`). E4 evidence must not canonize six-key membership as an invariant (see Assumptions). |
| Runtime implementation of the PM/AD-24 route-class denial oracle | `UM-E0` owns the oracle for each route class (`test-design-epic-user-management-0.md` § Denial oracle). The runtime divergence was blocker `CONFLICT-UM-01`, recorded **closed 2026-09-12** in `blockers.yaml` on the strength of backend branch `feat/conflict-um-01-hidden-target-404` (commit `89ea674`+), **not yet merged to `services/backend` `main`** (verified 2026-09-13). | Owners: PO, Architect and QE. Runtime owner: `UM-E0-S0.1`. E4 still owns the **section-gate instances** in E4-C03/C04 (R08). |
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
| PLAT-E4-R08 | SEC | `SectionAccessGuard` answered `403` for a missing or inactive target on `GET`/`PATCH /users/:id` on `services/backend` `main`, where PM/AD-24 (§3.3.8) requires `404` preceding mutation checks. **Evidence now exists (2026-09-13)** on backend branch `feat/conflict-um-01-hidden-target-404` (commit `89ea674`+): the guard now returns a leak-free `404` before `hasSectionAccess`, the formerly-stale `s41c-sag-01` Tests 5–6, `s41c-sag-04` Test 5, and `umac-05` Test 3 were rewritten to assert `404` (with `SUPERSEDED` comments retained for history), and no stale `403` pin remains. **That branch is not yet merged to `main`**, so the score is held at 6 pending merge; see E4-C03b/C04c. | 3 | 2 | 6 | Specify the three-code cases for the section gate (E4-C03b/C04c) — **done, on the unmerged branch**. Mark the superseded `403` assertions stale — **done** (`89ea674`). Merge `feat/conflict-um-01-hidden-target-404` to `services/backend` `main` — outstanding, a merge/release decision outside this plan's authority. | UM + Access Control; oracle owner `UM-E0` | Before `CONFLICT-UM-01` closes — design/blocker-tracking closure recorded 2026-09-12; code merge still open |

### Medium-priority risks (score 3–4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| PLAT-E4-R06 | PERF | The existing upward walk is credited without an agreed, comparable `seeded-two-level` ACM-9 measurement (E4-C08, still an open decision). Epic 4's added per-request queries (GAP-2) are **closed 2026-09-12** by inspection proof (`dept-epic.md`) — see E4-C09. Or the result is conflated with DIRA1/P6. | 2 | 2 | 4 | Get an explicit scope decision that states baseline comparability for `seeded-two-level`. GAP-2 is closed; no further action needed on that half. | Access Control + Architect |

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
| Performance | If the residual question is accepted: ACM9-MVP-v1 facade measurement at 500 active targets, with 5 warm-ups and 20 samples. Warm p95 and worst case must each be ≤2s for every protocol shape. The run needs its own comparable baseline. GAP-2's per-request-query half is already closed (2026-09-12, inspection proof). | R06 | One explicit, append-only baseline and final pair, or a new protocol version, for `seeded-two-level` only. | Artifact under `_bmad-output/test-artifacts/performance/`, if `seeded-two-level` is accepted. GAP-2's proof is recorded in `dept-epic.md`. |
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
  **The PM/AD-24 `404`/precedence cases in E4-C03b/C04c now have passing evidence (added 2026-09-13)**
  on backend branch `feat/conflict-um-01-hidden-target-404` (commit `89ea674` and later):
  `umac-11-hidden-target-denial-oracle.e2e-spec.ts` (6/6), the rewritten `s41c-sag-01`/`s41c-sag-04`/
  `umac-05` cases, `write-adoption.e2e-spec.ts` UMAC-07 Test 6, `s42a-op-04` Tests 5–6, and
  `s42a-op-05` Tests 6–7 — 47/47 combined, verified 2026-09-13. `blockers.yaml` records
  `CONFLICT-UM-01` **closed 2026-09-12** on that strength. **That branch is not yet merged into
  `services/backend` `main`** (verified 2026-09-13: `89ea674` is not an ancestor of `origin/main`).
  This row's evidence exists; whether it counts as "passes in its required environment" for P0 exit
  depends on a merge decision this plan does not make. This is a documentation-accuracy correction,
  not an approval, gate, or release-readiness claim.
- P1 failures are triaged with an owner. Every high-risk mitigation has an evidence path.
- The static migration oracle and the behavioural E2E together show no executable legacy gate path.
  The static oracle is now delivered: `src/access-control/infrastructure/bootstrap/legacy-gate-absence.spec.ts`
  (7/7, added 2026-09-13), covering both E4-AV01's five identifiers and E4-C02's `S<n>` pattern.
- Repository-audit obligations E4-AV01 to E4-AV03 are recorded with their findings. E4-AV01's static
  oracle is delivered (above); E4-AV02/AV03 remain recorded as in the 2026-09-12 Edit.
- If R06 is accepted, its immutable ACM-9 artifact exists with a comparable baseline and is evaluated
  only under Contract B (still an open decision, E4-C08). GAP-2 is **closed 2026-09-12** by inspection
  proof, recorded in `dept-epic.md`; that half of R06 needs no further action.
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
| E4-C02 | Human-key matrix semantics hold: unknown keys fail closed, the strongest audience wins, and no executable `S<n>` identifier remains in `src/` or `test/`. | Facade E2E + unit + repository audit | R02 | Access Control | Existing: `test/access-control/acm5-section-access.e2e-spec.ts`; `src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts`. **Done (2026-09-13):** `src/access-control/infrastructure/bootstrap/legacy-gate-absence.spec.ts`'s `E4-C02` describe block (2 tests: no `S<n>` token outside a comment in production `src/`/`scripts/`; `SECTION_ACCESS_MATRIX` keys are all human-readable `profile:*` strings), scoped to exclude `__tests__/`/`*.spec.ts` where the same strings appear deliberately as negative-test evidence. |
| E4-C03a | For a **visible** target, `GET /users/:id` data, `PATCH /users/:id`, and `canEdit` share one section decision. A baseline holder with `colleague`/`self` audience gets `403` / `canEdit:false`. A reporting-line manager or assigned PP gets `200` / `canEdit:true`. The row is unchanged after a denied `PATCH`. | Real HTTP / PostgreSQL E2E | R01, R02 | User Management | Existing: `test/user-management/access-control-adoption/s41c-section-access-gate.e2e-spec.ts` (`s41c-sag-01` Tests 1–4, `-02`, `-04`), `read-adoption.e2e-spec.ts`, `write-adoption.e2e-spec.ts` (UMAC-07 Tests 3–4) |
| E4-C03b | Denial oracle on the section-gated routes. (1) An invalid token or a deactivated caller gets `401` on both `GET` and `PATCH /users/:id`. (2) A missing target id or an inactive target gets `404` with a leak-free body on `GET`. (3) The same holds on `PATCH`, and **`404` comes before the mutation check**: a caller who would be refused `403` on a visible target still gets `404` on a missing one, and no row is written. (4) `403` is used only for a visible but forbidden target. | Real HTTP / PostgreSQL E2E | R08 | User Management; oracle owner `UM-E0` | (1) Existing: `read-denial.e2e-spec.ts` UMAC-05 Tests 1–2 (`GET`: invalid token, deactivated caller); `write-adoption.e2e-spec.ts` UMAC-07 Test 5 (`PATCH`: invalid token) and **Test 6, added 2026-09-13** (`PATCH`: deactivated caller → `401`). (2)–(3) **Done (2026-09-13):** `test/user-management/access-control-adoption/umac-11-hidden-target-denial-oracle.e2e-spec.ts` (Tests 1–6: `GET`/`PATCH` missing→404, `GET`/`PATCH` inactive→404 before the mutation check with the row unchanged, contrast `403` for a visible/forbidden target, `401` precedes `404`), on backend branch `feat/conflict-um-01-hidden-target-404` (commit `89ea674`, **not yet merged to `services/backend` `main`**, verified 2026-09-13). **No stale pin remains:** the same commit rewrote `s41c-sag-01` Tests 5–6, `s41c-sag-04` Test 5, and UMAC-05 Test 3 to assert `404`, each carrying a `SUPERSEDED 2026-09-12` comment. |
| E4-C04a | Clean-bootstrap root on a production-shaped database resolves `colleague` to every employee. It gets `PATCH /users/:id` → `403` and `canEdit:false` on every visible target, including its own card (`self: read`). Root sits at the top of the tree with no relationship row of its own. | Real bootstrap + HTTP E2E | R03 | Access Control + UM | Existing: `test/user-management/access-control-adoption/s42a-op-root-operator-set.e2e-spec.ts` (`s42a-op-04` Tests 1–3, unrelated target); `test/user-management/access-control-adoption/s42b-tr-root-tree-position.e2e-spec.ts` (`s42b-tr-03`, tree position). **Done (2026-09-13), both shapes:** the same file's `s42a-op-04` Test 4 (production-shaped clean bootstrap: root reads its own card → `200`, `canEdit:false`); `test/user-management/access-control-adoption/s42d-ds-root-resolves-over-seeded-population.e2e-spec.ts` `s42d-ds-06` Test 5 (dev-spine shape, same claim). |
| E4-C04b | A delegated HR Admin (FR only, no relationship) is allowed on the global FR-gated routes it holds. On an unrelated **visible** person, `PATCH /users/:id` → `403` and `canEdit:false`. The canonical `hr-admin` membership is asserted by the membership suite, not by the invariant suite. It is six keys only while DEPT-2 is open; the three-versus-six reconciliation belongs to DEPT-2/DEPT-4, not to E4. | Real bootstrap + HTTP E2E | R03 | Access Control + UM | Existing: `test/user-management/access-control-adoption/s42a-op-05-delegated-hr-admin.e2e-spec.ts` — **note the 2026-09-13 file move**: `s42a-op-05`/`s42a-op-06` tests moved out of `s42a-op-root-operator-set.e2e-spec.ts` into this new file (shared setup in the sibling `s42a-op-root-operator-set.fixtures.ts`); `s42a-op-03`/`s42a-op-04` stay in the original file. `s42a-op-05` Test 1 (list users), Test 4 (relationship write, departure record), Tests 2–3 and 5 (data denials); `test/access-control/s42a-op-bootstrap-canonical-set.e2e-spec.ts`. **Done (2026-09-13), real HTTP:** `s42a-op-05` Tests 8–17 cover the nine previously-untested routes the six canonical FR keys gate (relationship PUT/DELETE, department membership POST/DELETE, department manager PUT/DELETE, `POST /users/import`, `DELETE /users/:id`, departure read-back). **Test 18 is structural-only, not live HTTP** — a source-read regex confirming all four `departures.controller.ts` routes share one `@RequireFeature` decorator/constant; recorded as a weaker, advisory-flagged oracle pending buildable domain preconditions for `retry`/`reparent`. **N/A, recorded not tested:** the ticket's "`POST /users`" (bare create) does not exist — only `POST /users/import` exists (platform story 1-8 removed the create path), covered by Test 15; "role assignment" (attaching an FR policy) has no HTTP route in any controller — the only such mechanism is the administrator-shaped raw insert this suite's own precondition performs. |
| E4-C04c | For the root and delegated-HR-Admin personas, a missing or inactive target on `PATCH /users/:id` returns `404` before any feature or section check. `403` is never used for it. | Real HTTP E2E | R03, R08 | UM; oracle owner `UM-E0` | **Done (2026-09-13):** `s42a-op-root-operator-set.e2e-spec.ts` `s42a-op-04` Tests 5–6 (root: missing target → `404` not `403`; inactive target → `404` not `403`, row unchanged) and `s42a-op-05-delegated-hr-admin.e2e-spec.ts` `s42a-op-05` Tests 6–7 (delegated HR Admin Nadia, same claims). Same production code path as E4-C03b (`SectionAccessGuard` hidden-target check, backend commit `89ea674`, branch `feat/conflict-um-01-hidden-target-404`, **not yet merged to `services/backend` `main`**). |
| E4-C04d | **Pin of the accepted deviation.** A delegated HR Admin writes an unrelated person's career timeline and gets `201`. **Closure trigger:** when DEPT-2 lands, this case is retired in place and replaced by a dual-gate denial (`403` for a visible target without a reporting/PP write audience). Until then, asserting a denial here is a wrong-reason failure. | Real HTTP E2E | R03 | Access Control + UM | Existing: `test/user-management/access-control-adoption/s42a-op-05-delegated-hr-admin.e2e-spec.ts` (`s42a-op-06` Tests 1–2) — **moved here 2026-09-13** from `s42a-op-root-operator-set.e2e-spec.ts`; no assertion changed. Replacement is planned under DEPT-2/DEPT-4. |

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
| E4-C06 | The dev seed: (1) refuses `NODE_ENV=production` before connecting to the database; (2) creates only the specified fake two-level spine after import; (3) preserves existing direct edges; (4) is deterministic for inactive and multi-department users; (5) reruns safely; (6) is **absent from `prisma/seed.ts` and `scripts/bootstrap-access-control.ts`**; (7) **writes exactly one `kind: 'manager'` `AccessJournal` row per seeded edge, in the same transaction and in the `assignManager` shape (actor root, `before: NULL`, `after` = the edge), and none on a no-op rerun** (AF-3 exception declined 2026-09-12); (8) leaves the ACM-1 invariant suite `acm1r-fr-foundation` green. For contrast, root's real `POST /users/:id/relationships` precondition writes exactly one `manager` journal row. | Script/integration E2E + repository audit | R04, R07 | Access Control + QA | Existing (1)–(5): `test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts` (`s42d-ds-01`…`-04`); `test/user-management/access-control-adoption/s42d-ds-root-resolves-over-seeded-population.e2e-spec.ts`. Existing (8): `test/access-control/acm1r-fr-foundation.e2e-spec.ts` (GAP-1 closed 2026-09-08). **Done (6):** `src/access-control/infrastructure/bootstrap/dev-seed-absence.spec.ts`, scenario `s42d-ds-08` (doc `docs/test-cases/access-control-kernel/dev-seed-spine/s42d-ds-08-dev-seed-absent-from-deploy-entrypoints.md`); committed on backend commit `b714327`. (7): `s42d-ds-07` Tests 1–3 in the same suite; scenario `docs/test-cases/access-control-kernel/dev-seed-spine/s42d-ds-07-seeded-edges-are-journaled.md`. The tests were red against `de508c9` and are green with the backend change on `feat/plat-e4-dev-seed-journal` (**still not yet merged**, verified 2026-09-13; a human merge decision, not re-decided here). Product-path journaling is existing in `test/user-management/epic-4/access-journal.e2e-spec.ts`. |
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
| E4-C09 | GAP-2 (`dept-epic.md`): Epic 4 net-adds per-request queries (`isActiveUser` per `DEFAULT_PERMISSIONS` key; the `resolveJwtSubject` `findUnique`). Close it with either (a) an ACM-9 rerun or (b) a one-paragraph inspection proof, recorded against GAP-2, that both queries are O(1) per request and outside the 500-target walk. | Measurement or manual-review | R06 | Access Control | **Closed 2026-09-12 — by inspection proof (route b)**, recorded in `dept-epic.md`'s GAP-2 row (verified against `services/backend` `d1ef680`+`a25ec28`): `FunctionalRoleEvaluatorService.isAllowed` runs ≤2 indexed queries per call, called at most once per request; `JwtSessionResolverAdapter.resolveJwtSubject` runs one primary-key lookup per authenticated request; neither runs inside the 500-target ACM-9 walk. Unit evidence: `functional-role-evaluator.service.spec.ts`, `jwt-session-resolver.adapter.spec.ts`, `access-control-facade.adapter.spec.ts`, 31/31 green. |

**P2 estimate:** ~3–8 hours after the decision. No P3 scenario is identified.

### Repository-audit obligations (not test cases)

These use the `repository-audit` evidence level (the `PLAT-E1` AV pattern). They record a finding.
They do not execute product behaviour.

| ID | Obligation | Acceptance criterion | Owner | Evidence / observed input at planning |
| --- | --- | --- | --- | --- |
| E4-AV01 | `scripts/dev-grant-root.ts` is retired, `create:root` is repointed, and nothing in `src/`, `scripts/`, or `package.json` still gives root `canEdit` through a special case. | 4.1 AC "no functional-role or root special case" (corrected); 4.2 dev-spine AC | Access Control | Existing: `s42d-ds-dev-seed-spine.e2e-spec.ts` `s42d-ds-05` Tests 1–4. **Done (2026-09-13):** `src/access-control/infrastructure/bootstrap/legacy-gate-absence.spec.ts` (7 tests total, shared with E4-C02) automates `git grep -n "dev-grant-root\|canEditS1\|isAllowedForTarget\|EDIT_USER_FEATURE\|user-management:edit" -- src scripts package.json`, scoped to exclude `__tests__/`/`*.spec.ts`/`generated/`; the hand-run grep findings (all hits are dated comments or compliant negative-test evidence) are recorded in `docs/test-cases/access-control-kernel/fr-bootstrap/e4-av01-legacy-gate-absence-in-production-source.md`. |
| E4-AV02 | Both access-control deferred-work entries that Story 4.1 closes carry a closed status that cites delivery evidence. | 4.1 AC "Closes the two access-control deferred-work entries" | Access Control | **Recorded 2026-09-12:** in `_bmad-output/implementation-artifacts/access-control/deferred-work.md`, "Generalise section-access authorisation" reads `CLOSED 2026-09-12 — DELIVERED` and cites `b311589` (4.1c) and `ef03c88` (4.1d). The `profile:timeline` entry records its rename half as `CLOSED 2026-09-12` (4.1b). Its remaining `canAccessSection`/dual-gate work stays open as DEPT-2 (not E4 scope). Re-run on change: check both status lines. |
| E4-AV03 | `docs/architecture/access-control.md` describes the FR-set suites as they are now: `s42a-op-bootstrap-canonical-set` owns membership, and `acm1r-fr-foundation` owns the invariants with a source-derived count. No "stale three-key" claim remains. | 4.2 AC "ACM-1 invariant suite green" | Architect + Access Control | **Recorded 2026-09-12:** the note after the canonical permission list was reconciled with `dept-epic.md` GAP-1 (closed 2026-09-08) and `test/access-control/acm1r-fr-foundation.e2e-spec.ts:58–59`. Re-run on change: `git grep -n "three.\?.user-management\|three-key\|pins the three" docs/architecture/access-control.md` returns only the historical "Originally … the three `user-management:*` keys only" sentence. |

## Acceptance-Criterion Traceability

The full Story 4.1 and 4.2 tickets are authoritative. The epic summary was aligned with them on
2026-09-12.

| Story AC (ticket) | Planned verification | Level / owner | State |
| --- | --- | --- | --- |
| 4.1-1 — `isAllowed` baseline for active users; inactive users denied; explicit FR grant resolves; no `employee` row | E4-C01 | Facade E2E + unit / Access Control | Existing |
| 4.1-2 — no `S<n>` section identifier in `src/`/`test/`; human keys only, anything else → `none` | E4-C02 | Facade E2E + unit + audit / Access Control | Existing E2E; audit planned |
| 4.1-3 — `PATCH` and the `canEdit` hint are gated by `@RequireSectionAccess('profile:identity','write')`; colleague/self → `403`/`false`; manager/PP → `200`/`true` | E4-C03a; oracle boundary E4-C03b | HTTP E2E / UM | Existing; the `404`/precedence part is now evidenced (R08) on the unmerged `feat/conflict-um-01-hidden-target-404` branch, added 2026-09-13 |
| 4.1-4 — `canEditS1` and the `EDIT_USER_FEATURE`/`READ_USER_FEATURE` branches are gone | E4-AV01 grep; E4-C02 | Audit / Access Control | Done (2026-09-13): `legacy-gate-absence.spec.ts` |
| 4.1-5 — adoption/profile E2E stay green or are updated with a recorded reason | E4-C07; the stale `403` assertions are recorded under E4-C03b | Regression E2E / QA | Existing; formerly-stale cases named in E4-C03b are now rewritten and green (2026-09-13, on the unmerged branch) |
| 4.1-6 — the two deferred-work entries are closed | E4-AV02 | Audit / Access Control | Recorded (both entries closed with evidence; DEPT-2 remainder outside E4) |
| Epic 4.1 summary — no root/FR special case (supersedes the `dev-grant-root.ts` wording) | E4-AV01; E4-C04a | Audit + HTTP E2E / Access Control | Done (2026-09-13): both halves now Existing |
| 4.2-1 — no FR branch in the identity-card decision (standing regression grep) | E4-AV01 | Audit / Access Control | Done (2026-09-13): `legacy-gate-absence.spec.ts` |
| 4.2-2 — dev: root `reporting`→`write` on other spine members with `canEdit:true`, own card `false`; production: root `colleague`, `403`, `canEdit:false` | Dev: E4-C06 (`s42d-ds-06` Tests 2–4). Production: E4-C04a | HTTP E2E / Access Control + UM | Existing; own-card `false` done (2026-09-13) in both shapes |
| 4.2-3 — delegated HR Admin: global FR routes allowed; unrelated `PATCH` → `403`; `canEdit:false` | E4-C04b; timeline exception pinned by E4-C04d | HTTP E2E / Access Control + UM | Existing; remaining FR routes done (2026-09-13): Tests 8–17 real HTTP, Test 18 structural-only advisory |
| 4.2-4 — upward walk locked; `seeded-two-level` ACM-9 evidence | E4-C08 (still an open decision); GAP-2 under E4-C09 (**closed 2026-09-12** by inspection proof) | Measurement / Access Control + Architect | `seeded-two-level` (E4-C08): open decision, non-blocking. GAP-2 (E4-C09): closed, no further action |
| 4.2-5 — `db:dev:seed-org` throws in production, is absent from `prisma/seed.ts` and `bootstrap-access-control.ts`, and the ACM-1 invariant suite is green | E4-C06 (1), (6), (8); E4-AV03 | Script E2E + audit / Access Control + QA | Refusal and suite existing; absence audit done (2026-09-13): `dev-seed-absence.spec.ts` / `s42d-ds-08`; doc drift reconciled (E4-AV03) |
| 4.2-6 — closes the "reporting walk descends" deferred item and updates the full-profile holder question | E4-C05 (holder); E4-AV02 method applied to `deferred-work.md` | Audit / Access Control | Entries read as resolved at planning |
| Epic 4.2 decision — dev-seed edges are journaled (AF-3 declined 2026-09-12) | E4-C06 (7): `s42d-ds-07` Tests 1–3 | Script E2E / Access Control | Decided; implemented on an unmerged backend branch (`feat/plat-e4-dev-seed-journal`, still unmerged as of 2026-09-13) |
| Epic 4.2 boundary — HTTP denial oracle (§3.3.8) | E4-C03b, E4-C04c | HTTP E2E / UM; oracle `UM-E0` | Done (2026-09-13): passing on backend branch `feat/conflict-um-01-hidden-target-404` (commit `89ea674`+). `CONFLICT-UM-01` recorded closed 2026-09-12 in `blockers.yaml` on that evidence; the branch is **not yet merged** to `services/backend` `main` (verified 2026-09-13) |

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

- The P0 scenario pass rate is 100%. The `CONFLICT-UM-01` cases (E4-C03b/C04c) are now green
  (2026-09-13), on backend branch `feat/conflict-um-01-hidden-target-404`, not yet merged to
  `services/backend` `main` (see Exit Criteria — this plan does not decide whether an unmerged
  branch satisfies "passes in its required environment"). The P1 target is at least 95%, with an
  explicit owner or waiver for any exception. P2 is informational until accepted.
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
- **R06:** decide the `seeded-two-level` measurement shape and its baseline-comparability route
  before scheduling it. GAP-2 is **closed 2026-09-12** by inspection proof — no further action on
  that half. Preserve ACM-9's immutable evidence and distinct contract identity. Owner: Access
  Control + Architect.
- **R07:** keep every seeded edge paired with its `manager` journal row in one transaction, in the
  `assignManager` shape. `s42d-ds-07` guards this. Owner: Access Control.
- **R08:** mark the superseded `403` assertions stale and regenerate the three-code cases through
  AD-1 under `CONFLICT-UM-01`. Do not rewrite historical expected results as if they always said
  `404`. **Done 2026-09-13** on backend branch `feat/conflict-um-01-hidden-target-404` (commit
  `89ea674`+): `umac-11-hidden-target-denial-oracle.e2e-spec.ts` added, `s41c-sag-01`/`s41c-sag-04`/
  `umac-05` rewritten with `SUPERSEDED` comments retained for history. Merging that branch to
  `services/backend` `main` remains outstanding. Owner: UM + Access Control; oracle owner `UM-E0`.

## Assumptions and Dependencies

- The public AccessControl facade remains the only authorization entry for routes.
- The existing backend suites can provision a migrated PostgreSQL database and use pseudonymised data.
- Story 4.2's recorded "Open for decision" items stay unresolved unless changed separately. This plan
  does not resolve them.
- **FR-set evidence:** `s42a-op-bootstrap-canonical-set` owns exact membership, currently six keys
  while DEPT-2 is open. `acm1r-fr-foundation` owns the invariants only, with its count derived from
  `CANONICAL_PERMISSIONS`. No E4 case may hard-code six as a permanent invariant.
- **Dependencies:** DEPT-2 and DEPT-4 (`dept-epic.md`) for the timeline deviation and the set
  reconciliation; `CONFLICT-UM-01` (`blockers.yaml`, recorded closed 2026-09-12) and the `UM-E0` plan
  for the route-class denial oracle — its evidence exists on backend branch
  `feat/conflict-um-01-hidden-target-404` (commit `89ea674`+), **not yet merged to `services/backend`
  `main`** (verified 2026-09-13); merge of backend branch `feat/plat-e4-dev-seed-journal` (AF-3
  decision, still unmerged as of 2026-09-13). GAP-2 is **closed 2026-09-12** (inspection proof,
  `dept-epic.md`); no further dependency on it.
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
approved obligation. It turns one planned assertion into a decided and implemented one. Epic validation was **PASS (2026-09-12)**, confirmed
across four same-day re-validations, the fourth run after this AF-3 decision itself, with one new
non-blocking finding (G-1, a checkpoint test-count discrepancy that does not affect the verdict).
**A fifth Epic Validate run, after the 2026-09-13 Edit above, independently re-verified every
2026-09-13 completion claim and confirmed PASS (2026-09-13)**, with one new non-blocking finding
(H-1, a pre-existing test-count undercount in the E4-C04d citation, unrelated to today's changes).
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
2026-09-12 and again on 2026-09-13.
