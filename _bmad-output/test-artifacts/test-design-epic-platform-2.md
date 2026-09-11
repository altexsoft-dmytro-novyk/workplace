---
epicId: 'PLAT-E2'
epicDomain: 'platform'
epicNumber: 2
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicSourceHeading: '## Epic 2: Access Control Foundation'
runScope: 'epic'
runKey: 'epic-platform-2'
workflowStatus: 'generated'
approvalStatus: 'ungranted'
validationStatus: 'not-run'
totalSteps: 5
stepsCompleted:
  [
    'step-01-detect-mode',
    'step-02-load-context',
    'step-03-risk-and-testability',
    'step-04-coverage-plan',
    'step-05-generate-output',
  ]
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-09-11'
runBaselineHead: '28d8e2049d457b103cd7eee31587add7a970f4fc'
inputDocuments:
  - _bmad-output/test-artifacts/test-design/README.md
  - docs/test-design-workflow-contract.md
  - _bmad-output/planning-artifacts/platform/epics.md
  - _bmad-output/test-artifacts/test-design-architecture.md
  - _bmad-output/test-artifacts/test-design-qa.md
  - _bmad-output/specs/spec-access-control-audience-foundation/SPEC.md
  - docs/test-cases/access-control-foundation/
  - _bmad-output/implementation-artifacts/access-control/deferred-work.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml
  - _bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md
  - services/backend/test/access-control/audience-resolution.e2e-spec.ts
---

# Test Design: Epic PLAT-E2 — Access Control Foundation

**Scope identity:** `PLAT-E2` · domain `platform` · number `2`
**Canonical source:** `_bmad-output/planning-artifacts/platform/epics.md`, heading `## Epic 2: Access Control Foundation`
**Run key:** `epic-platform-2`
**Date:** 2026-09-11
**Author:** Anna Pikula (`_bmad/tea/config.yaml` `user_name` is the unset placeholder `User`)
**Run baseline `HEAD`:** `28d8e204` (captured before this run's first write)

> **State of this document — read first.**
>
> - **WRITTEN.** Document generation only.
> - **Approval: ungranted.** No Product Manager, Tech Lead, or QA Lead has approved this plan.
> - **Validation: NOT RUN.** `test-design-validation-report-epic-platform-2.md` does not exist.
> - This plan asserts **no coverage, no pass rate, no gate result, and no release readiness.**
>   Every quality-gate number below is a *planned threshold*, never an evaluated outcome.
> - Shared policy lives in the platform pair (`test-design-architecture.md`, `test-design-qa.md`).
>   Where this plan and the pair state the same rule, **the pair is the source and this plan has a
>   defect.**

---

## Why this plan exists, and what changed

Until this run, `test-design/README.md` carried a blanket rule: *"No plan is created for `UM-E8`,
any `PLAT-E*`, … because no obligation in the superseded set transfers to them."* That statement is
accurate as a **ledger** fact — `test-design/migration-map.md` routes **zero** rows to
`test-design-epic-platform-2.md` — and it was never a statement that this epic needs no test design.
The index said so itself: *"A domain with no plan is not a statement that the domain needs no test
design."*

The active team policy is **one test-design plan per active canonical epic**, independent of
transferred obligations. That blanket exclusion was **retired as a routing rule on 2026-09-11 by the
separate `epic-platform-1` Create run**, which landed while this run was resolving scope; this run
only removed `PLAT-E2` from the residual "still unplanned" list it left behind. Nothing about the
migration ledger is rewritten by either run: it still routes no obligation here, and this plan does
not claim it did.

**`PLAT-E2` is not a greenfield epic.** Its single story `PLAT-E2-S2.1` / `ACF-1` is implemented,
its 9 Stage-1 scenarios were AD-1 approved on 2026-08-30, and a real-PostgreSQL e2e suite exists.
This is consequently a **rework and evidence-integrity plan**, not a from-scratch coverage plan. The
bulk of the work below is closing gaps between what the approved scenarios say, what the committed
tests assert, and what the shipped resolver does.

---

## Executive Summary

**Scope:** Epic-Level test design for `PLAT-E2` — the Phase-0 `resolveAudiences` boundary
(`Self` / `Reporting line` / direct `PP` / `Colleague`), fail-closed, with no User Management route,
projection, or UI ownership.

**Risk Summary:**

- Total risks identified: **9**
- High-priority risks (≥6): **3** (`R-PLAT2-01` score 9, `R-PLAT2-02` score 6 — **mitigated 2026-09-11**, `R-PLAT2-03` score 6)
- Critical categories: **SEC**, **TECH**

**Coverage Summary (planned, not achieved):**

- P0: 4 scenario obligations / **7** tests (~14–22 h)
- P1: 2 scenario obligations / **3** tests (~6–10 h)
- P2: 2 obligations / **1** test + 1 measurement + 1 documentation item (~4–8 h)
- P3: 1 scenario obligation / **1** test (~1–2 h)
- **Total: ~25–42 h (~4–6 days)**. No approval-latency exclusion applies: AD-1 stage approval was
  retired 2026-09-04 (`docs/architecture/testing-strategy.md:25–38`), so ordinary PR review is the
  only gate on these changes.

---

## Existing evidence baseline (a starting point, not coverage)

| Artifact | Count / state |
| --- | --- |
| Stage-1 scenario documents | **9** under `docs/test-cases/access-control-foundation/` (5 `ACF-AU-*`, 4 `ACF-FC-*`), each carrying `**Approved:** Anna Pikula, 2026-08-30` |
| Stage-2 e2e | `services/backend/test/access-control/audience-resolution.e2e-spec.ts` — **10** tests against real PostgreSQL |
| Scenario documents whose expected result was **invalidated, then reworked** | **3** — `ACF-AU-05`, `ACF-FC-01`, `ACF-FC-02` (superseded 2026-09-01, reworked 2026-09-11) |
| `TR-*` rows receiving evidence from this suite | `TR-2.1-02`, `TR-2.1-05`, `TR-2.1-05A`, `TR-7-01` — **partial in every case**, per `test-design-qa.md` § U-19 |
| `TR-*` rows receiving **full** evidence | **none** |
| Performance record | `measurement (P6)` — `performance/p6-resolve-audiences-postgresql.md`, **a record, never a gate** |

**None of the above is coverage.** A present, approved scenario document is not evidence that a
requirement is satisfied; `test-design-qa.md` § U-19 states this for all 99 access-control scenario
documents and it applies unchanged to these 9.

---

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| **Production `GET /users/:id` authorization** | The route is not wired to the facade; `ACCESS_CONTROL_PORT` stays bound to `InterimAccessControlAdapter` in `user-management.module.ts`. Adoption is `UM-E0-S0.1`, not this epic | Cross-epic dependency, tracked under `R-PLAT2-01` and `R-PLAT2-03`; the rework in P0 removes this plan's dependence on the route |
| **Section matrix, `canAccessSection`, `isAllowed`** | Kernel substrate is `PLAT-E3` (`ACM-5`, `ACM-2`); S2–S16 is `PLAT-E6` | Consumed as cross-epic evidence; see Interworking |
| **Multi-audience merge semantics** | `CAP-2` / `ACM-4R` is `PLAT-E3` | `ACF-AU-06` (P1) covers only the *Phase-0 boundary consequence*: this suite's own "one audience per viewer×target" scope claim is stale |
| **Project line, Department walk, PP HR-line** | Explicitly fail-closed and out of Phase 0; owned by `PLAT-E8` / `PLAT-E5` | `ACF-FC-02` proves the *withholding*, not the positive walk; recorded as such |
| **Dismissed-target read-only projection (AD-20)** | Needs a `Departure`/`EmploymentStatus` persistence seam absent from `prisma/schema.prisma` | Fail-closed is the sanctioned default; `ACF-FC-05` (P1) makes the empty-set rule explicit rather than incidental |
| **Unknown / non-existent viewer or target id contract** | `deferred-work.md` sources this to `ACM-4R` (`PLAT-E3`) | Not duplicated here; recorded in Interworking |
| **Field projection / S1 identity-card DTO** | User Management Story 0.1 | Out of boundary per AD-2 |
| **Promoting `backend-acm9` to a blocking check** | Standing repository decision: the job is deliberately informational | Explicitly **not proposed** by this plan |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `R-PLAT2-01` | SEC | **`SEC-AUTH-01` (P0, open).** Every `ACF-AU-*` HTTP case authenticates through `InterimSessionResolverAdapter`, which resolves *any* `Bearer <token:persona>` to a session, and `isAllowedForTarget` returns `Boolean(userId)` for every target check. This epic's HTTP-level evidence is produced on an auth substrate that fails **open** | 3 | 3 | **9** | Move every allow case off the route and onto the facade (P0 `ACF-AU-R1`). Closure of `SEC-AUTH-01` itself is Architect + Security, **not this epic** | Architect and Security | Before first shared-environment deploy |
| `R-PLAT2-02` | TECH | **MITIGATED 2026-09-11.** ~~Stage-1 and Stage-2 disagreed~~: `services/backend` commit `da7d1fa` (2026-09-03) reworked the `403` assertions for `ACF-AU-05`/`ACF-FC-01`/`ACF-FC-02` into resolver audience-label checks, while all three scenario documents still carried the invalidated `403` expected result. All three now carry a fresh `**Reworked & approved:** Anna Pikula, 2026-09-11` marker, explicitly recorded as a retro-anchor rather than a mechanical status swap | 3 | 2 | **6** (mitigated) | P0 `ACF-RW-01..03` — **done**. Rewrote the three scenario documents to the audience-set expectation, matching the code and test already at `da7d1fa` | Access Control owners + QA | Closed 2026-09-11 |
| `R-PLAT2-03` | TECH | **`ACF-AU-01..04` can pass for the wrong reason.** All four assert HTTP `200` on `GET /users/:id`. Since 2026-09-01 that route returns the S1 identity card `200` to *any* active authenticated viewer, so the assertion no longer discriminates the audience it names. `ACF-AU-01` (Self) additionally has **no `TR-*` row at all** | 3 | 2 | **6** | P0 `ACF-AU-R1`: re-express all four as facade audience-set assertions, the pattern `ACF-FC-04` already uses. Catalog gap handled by P2 `ACF-TR-01` | QA + Access Control owners | With the P0 rework |

### Medium-Priority Risks (Score 3–4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `R-PLAT2-04` | TECH | The empty-set rule for a deactivated or unconfirmed target (shipped in `9e69682`) **is stated by no approved scenario**. `deferred-work.md` records it as decided "by the placement of a join rather than by a decision" | 2 | 2 | 4 | P1 `ACF-FC-05` states the rule as a scenario in this suite | Access Control owners |
| `R-PLAT2-05` | PERF | **P6 misread as production load.** The depth-499 × 500-target row is warm p50/p95/worst **960.940 / 983.087 / 984.351 ms** — ~49 % of the 2 s facade budget, and visually alarming. Real reporting chains run **5–10 levels**, where the balanced depth-5 × 500-target row is warm p95 **9.139 ms** | 2 | 2 | 4 | P2 `ACF-PERF-01`. Read deep-chain rows as a **canary for algorithmic change**, not production load. **Do not raise the fixture depth ceiling above 499** — `acyclic_depths` and `target_count` are hashed into `fixture_manifest_hash` and changing them invalidates every existing baseline | Platform / Backend |
| `R-PLAT2-06` | TECH | The suite README's scope table still asserts **"Phase 0 resolves *one* audience per viewer×target"**. That stopped being true in `services/backend` commit `f36d1b2` (2026-08-30), which returns all audiences per target and walks upward from targets | 2 | 2 | 4 | P1 `ACF-AU-06` + P2 `ACF-DOC-01` correct the claim without importing `ACM-4R`'s merge semantics | Access Control owners |
| `R-PLAT2-07` | OPS | **`PLAT-E2` status disagrees across three tracking surfaces** — see the dedicated section below | 3 | 1 | 3 | Reconciliation belongs to **Platform Story 1.1**. This plan records the conflict and changes none of the three | Platform epic owner |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | P | I | Score | Action |
| --- | --- | --- | --- | --- | --- | --- |
| `R-PLAT2-08` | TECH | `ACF-FC-01`'s fixture places the deactivated user **only** mid-chain, so a green result cannot distinguish "the walk stopped at a broken bridge" from "the implementation merely refuses deactivated targets" | 1 | 2 | 2 | **Monitor.** Recorded `resolved` in `deferred-work.md` by `ACM3-II-01` / `ACM3-II-03` in the **kernel** suite (`PLAT-E3`). Not re-tested here — that would be duplicate coverage. See Interworking |
| `R-PLAT2-09` | TECH | The ACF e2e imports `ACCESS_CONTROL_PORT` from `src/user-management/domain/`, which `domain-driven-design.md` forbids | 1 | 1 | 1 | **Monitor.** Recorded `irreducible` in `deferred-work.md`: NestJS matches DI tokens by object identity, so the literal export is required. Resolves only when User Management rebinds the port to a facade-backed adapter |

### Risk Category Legend

- **TECH**: Technical / Architecture · **SEC**: Security · **PERF**: Performance ·
  **DATA**: Data Integrity · **BUS**: Business Impact · **OPS**: Operations

---

## Tracking-surface conflict for `PLAT-E2` (recorded, not resolved)

Four surfaces disagree about this epic's status. **This plan changes none of them** (contract §5).

| Surface | What it says at the run baseline |
| --- | --- |
| `_bmad-output/implementation-artifacts/platform/sprint-status.yaml:61-62` | `epic-2: done` · `2-1-resolve-phase-0-audiences-acf-1: done` |
| `_bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml:95` | `PLAT-E2-S2.1 … status: in-progress` — deliberately *"left as in-progress here pending Platform Story 1.1 reconciliation rather than silently flipped"* |
| `_bmad-output/planning-artifacts/platform/epics.md:394` | `**Status:** in-progress` |
| `_bmad-output/planning-artifacts/platform/epics.md` § Overview | Says *"`sprint-status.yaml` still records `epic-3: in-progress` and `epic-2: in-progress`"* — **this caveat is itself now stale**: `sprint-status.yaml` records `done` for both keys |

**Consequence for test design:** "`PLAT-E2` is done" is not mechanically verified from any single
surface, and the epic body's own caveat about which surfaces conflict no longer describes the tree.
Reconciliation is Platform Story 1.1's traceability matrix. The rework obligations below are
independent of how that reconciliation lands.

---

## NFR Planning

| NFR Category | Requirement / Threshold | Risk Link | Planned Validation | Evidence Needed |
| --- | --- | --- | --- | --- |
| Security | Fail-closed: broken or orphaned relationship data reduces access and never grants it | `R-PLAT2-01`, `R-PLAT2-04` | Facade-level audience-set assertions (`ACF-RW-01..03` — **done 2026-09-11**, `ACF-FC-05` — planned) against real PostgreSQL | Committed e2e run in `test/access-control/`; the three reworked scenario documents carry a rework/attribution marker (evidence-integrity record, **not** a gate — see Quality Gate Criteria) |
| Security | Three-code denial oracle — `401` invalid/inactive session · `404` hidden/missing · `403` visible but forbidden | `R-PLAT2-01` | **Not validated by this epic.** The oracle is a *route* contract; `PLAT-E2` owns no route | Owned by `UM-E0-S0.1`; recorded here only as the seam |
| Performance | **Contract C — P6 `resolveAudiences`. Threshold: none.** A measurement record, and **never a gate** | `R-PLAT2-05` | `measurement (P6)` — `test/measurement/resolve-audiences.measurement-spec.ts`, `measurementOnly: true`, asserts nothing about timings | `performance/p6-resolve-audiences-postgresql.{md,json}` |
| Performance | **Contract B — ACM-9 facade resolver**, 2 s per-gate budget | — | **Not this epic's.** Owned by `PLAT-E3-S3.8`. Its CI job stays **informational** and this plan proposes **no** promotion to blocking | `measurement (ACM9-MVP-v1)` |
| Reliability | Resolution terminates on a cyclic graph instead of hanging | `R-PLAT2-08` | `ACF-FC-04` (exists) + P3 `ACF-FC-07` (three-person cycle) | Existing + new e2e |
| Reliability | Empty target list issues **zero** database queries | — | `ACF-FC-03` (exists, facade-level, observes the port rather than a statement counter) | Existing e2e |

**Contract separation — restated because conflating these is the recurring error.** Contract **A**
(the All Employees list including permission resolution, harness `DIRA1-MVP-v1`, release gate
`PG-04`), Contract **B** (ACM-9 facade resolver), and Contract **C** (P6 `resolveAudiences`) share
a "500" and a "2 seconds" **and nothing else**. **B and C are not evidence for A.** `PLAT-E2` owns
only **C**, and C is not a gate.

**Unknown thresholds:** none invented. The database-timeout headroom below the outer 2 s request
budget, and the classification of PostgreSQL `SQLSTATE 57014` versus an outer request timeout,
remain **UNKNOWN** — recorded in `deferred-work.md` as an accepted P6 finding requiring its own
follow-up story. That story is **not** created by this plan.

---

## Entry Criteria

- [ ] The canonical epic tuple (`PLAT-E2` · `platform` · `epics.md` `## Epic 2`) is unchanged
- [ ] Real PostgreSQL available to `test/access-control/` (this suite does not run on a stub)
- [ ] The foundation fixture (Alice, Bob, Carol, Paula, Hana, Colin, Erin, InactiveMgr, Frank, CycleA/B) seeds through Prisma in test setup
- [x] The three rework documents are rewritten — **done 2026-09-11**: `ACF-RW-01..03` (Anna Pikula, retro-anchor). No reviewer-availability gate applies: AD-1 stage approval was retired 2026-09-04
- [ ] This plan has been human-reviewed (it is currently **approval ungranted**)

## Exit Criteria

- [ ] All P0 tests passing
- [ ] All P1 tests passing, or failures triaged and recorded
- [x] `ACF-AU-05`, `ACF-FC-01`, `ACF-FC-02` carry a **fresh** `**Approved:**` marker for the reworked expected result — **done 2026-09-11** (`**Reworked & approved:** Anna Pikula, 2026-09-11`); the 2026-08-30 approval did not carry over on its own
- [ ] The suite README's "one audience per viewer×target" scope claim is corrected
- [ ] No open high-severity defect in `resolveAudiences`
- [ ] **Not an exit criterion:** closure of `SEC-AUTH-01`. It blocks deployment, not this epic's test design

---

## Test Coverage Plan

### P0 (Critical)

**Criteria:** security or evidence-integrity impact with no safe workaround.

| Requirement / obligation | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `ACF-RW-01` — rewrite `ACF-AU-05` expected result: `resolveAudiences(Colin,[Alice])` yields `{colleague}`, not `403` | Component (facade) | `R-PLAT2-02` | 1 | QA + AC | **DONE 2026-09-11.** Test was already green at `da7d1fa`; the document and its fresh approval were the deliverable |
| `ACF-RW-02` — rewrite `ACF-FC-01`: `resolveAudiences(Frank,[Erin])` yields `{colleague}` and **not** `reporting` | Component | `R-PLAT2-02` | 1 | QA + AC | **DONE 2026-09-11.** Retro-anchors an existing green test to a reworked scenario |
| `ACF-RW-03` — rewrite `ACF-FC-02`: `resolveAudiences(Hana,[Alice])` yields `{colleague}`, **no** `pp`, **no** `reporting` | Component | `R-PLAT2-02` | 1 | QA + AC | **DONE 2026-09-11.** Proves PP withholding only; the positive HR-line walk stays `PRODUCT/ARCH BLOCKED` under `PLAT-E5` |
| `ACF-AU-R1` — re-express the four allow cases (`AU-01` Self, `AU-02` direct, `AU-03` transitive, `AU-04` PP) as facade audience-set assertions | Component | `R-PLAT2-01`, `R-PLAT2-03` | 4 | QA + AC | Removes the epic's dependence on an unprotected route. HTTP cases may be **kept as a separate marked-provisional layer**, never as the primary assertion |

**Total P0:** 7 tests, **~14–22 h** (includes three scenario-document rework passes).

### P1 (High)

**Criteria:** core resolver behaviour with a limited workaround.

| Requirement / obligation | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `ACF-AU-06` — a viewer who is **both** direct manager and assigned PP of the same target resolves both labels | Component | `R-PLAT2-06` | 1 | QA + AC | Phase-0 boundary only. **Does not** import `ACM-4R` merge precedence — that stays `PLAT-E3` |
| `ACF-FC-05` — the empty-set rule stated as a scenario: (a) deactivated **target** yields an empty set, never the Colleague floor; (b) deactivated **viewer** yields an empty set | Component | `R-PLAT2-04` | 2 | QA + AC | Makes explicit what `9e69682` shipped. Does **not** implement the AD-20 dismissed-target projection |

**Total P1:** 3 tests, **~6–10 h**.

### P2 (Medium)

| Requirement / obligation | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `ACF-PERF-01` — add a realistic-depth row (chain depth **5–10**, 500 targets) to the P6 record so the epic's own performance artifact describes the shape production actually has | Measurement | `R-PLAT2-05` | 1 run | Platform / Backend | **Measurement only; no threshold, no gate, no CI wiring.** Must not raise the depth ceiling above 499 — `acyclic_depths` is hashed into `fixture_manifest_hash` |
| `ACF-TR-01` — record a decision for the `ACF-AU-01` (Self) `TR-*` orphan: either register a row or record the deliberate absence | Documentation | `R-PLAT2-03` | — | QA + Architect | A **catalog** gap, not a scenario gap. `test-design-qa.md` § U-19 already names it |

**Total P2:** 1 measurement run + 1 documentation item, **~4–8 h**.

### P3 (Low)

| Requirement / obligation | Test Level | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- |
| `ACF-FC-07` — a **three-person** reporting cycle terminates | Component | 1 | DEV | `ACF-FC-04` covers the two-person cycle only. Exploratory; the `NOT c.repeated` path guard is expected to hold |

**Total P3:** 1 test, **~1–2 h**.

---

## Execution Order

### Smoke (<1 min)

- [ ] `ACF-FC-03` empty bulk — zero queries (facade)
- [ ] `ACF-AU-R1` Self (facade)

### P0 (<5 min)

- [ ] `ACF-AU-R1` × 4 — Self, direct, transitive, PP (facade)
- [x] `ACF-RW-01..03` × 3 — colleague fallback, broken bridge, PP withholding (facade) — **done 2026-09-11**

**Total:** 7 scenarios

### P1 (<5 min)

- [ ] `ACF-AU-06` manager + PP dual audience (facade)
- [ ] `ACF-FC-05` × 2 — inactive target, inactive viewer (facade)

**Total:** 3 scenarios

### P3 + measurement (nightly/on demand)

- [ ] `ACF-FC-07` three-person cycle (facade)
- [ ] `ACF-PERF-01` P6 realistic-depth run — **opt-in benchmark, never in the PR gate**

**Execution model:** the whole functional set is facade-level against real PostgreSQL and runs well
inside the PR budget. `ACF-PERF-01` is opt-in and belongs to neither PR nor a blocking nightly gate.

---

## Resource Estimates

| Priority | Count | Total Hours | Notes |
| --- | --- | --- | --- |
| P0 | 7 tests / 4 obligations | ~14–22 | Three of the four are **document + approval** work over already-green tests |
| P1 | 3 tests / 2 obligations | ~6–10 | New scenarios, new tests |
| P2 | 1 run + 1 doc | ~4–8 | Measurement protocol care dominates |
| P3 | 1 test | ~1–2 | Fixture extension |
| **Total** | **12 tests + 1 run + 1 doc** | **~25–42** | **~4–6 days**; no approval-latency exclusion (AD-1 stage approval retired 2026-09-04) |

### Prerequisites

**Test data:** the existing foundation fixture, extended with (a) a persona who is simultaneously
manager and PP of the same target (`ACF-AU-06`), and (b) a third cycle member (`ACF-FC-07`). Both
are additive; no existing persona changes.

**Tooling:** Jest/Nest e2e with a test-module override binding the real `AccessControlFacade`;
`expectAudienceLabels` as the assertion helper; `measurementOnly` P6 spec for `ACF-PERF-01`.

**Environment:** real PostgreSQL. The cycle case relies on `statement_timeout = 0` behaviour and
uses a `Promise.race` hang guard rather than `SET LOCAL statement_timeout`, because the facade
opens its own transaction on a pooled connection.

---

## Quality Gate Criteria

**Planned thresholds. None is evaluated by this document.**

- P0 pass rate: 100 %
- P1 pass rate: ≥ 95 %, waivers recorded
- P2/P3 pass rate: ≥ 90 %, informational
- High-risk (≥6) mitigations: complete or explicitly waived
- Every reworked scenario document lands through ordinary **PR review** — the gate named by ruling
  `D-1` / `DG-01` since AD-1 stage approval was retired 2026-09-04. The `Reworked & approved: Anna
  Pikula` markers are a voluntary evidence-integrity and attribution record, **not** evidence that a
  required gate was satisfied

**Non-negotiable for this epic:**

- [ ] No allow case relies on an HTTP `200` from a route that is not wired to the facade
- [ ] No approved scenario document contradicts the test that claims to implement it
- [ ] No P6 number is cited as evidence for Contract A or as a gate result
- [ ] The `backend-acm9` job is **not** promoted to blocking as a mitigation for anything here

---

## Mitigation Plans

### `R-PLAT2-01`: `SEC-AUTH-01` fail-open auth substrate (Score 9)

**Strategy:** Two separable halves. (1) **Owned here:** move every `PLAT-E2` allow case off
`GET /users/:id` and onto `AccessControlFacade.resolveAudiences`, so this epic's evidence no longer
passes through the interim session resolver. (2) **Not owned here:** closing `SEC-AUTH-01` — interim
adapters fail closed or leave the production module.
**Owner:** Architect and Security (closure) · QA + AC (the rework half).
**Timeline:** rework with P0; closure before the first shared-environment deploy.
**Status:** Planned.
**Verification:** every `ACF-*` assertion names an audience set, not an HTTP status. `SEC-AUTH-01`
closure is verified against `blockers.yaml`, not against this plan.

### `R-PLAT2-02`: Stage-1 / Stage-2 divergence (Score 6) — MITIGATED 2026-09-11

**Strategy:** Rewrote `ACF-AU-05`, `ACF-FC-01`, `ACF-FC-02` to the audience-set expectation, each
reviewed on rework. This was deliberately a **retro-anchor**: the code and tests already existed and
were green, so the normal scenario → red → production order could not be re-run. The rework record
says so plainly rather than implying the order was followed. That review was **voluntary** — AD-1
stage approval had already been retired on 2026-09-04 — and is kept for evidence integrity, not as a
satisfied gate.
**Owner:** Access Control owners + QA.
**Status:** Complete.
**Verification:** each file carries a `**Reworked & approved:** Anna Pikula, 2026-09-11` marker
naming the retro-anchor explicitly, and the suite README's own top note, provisional-mapping
section, and layout table were updated to match. The platform pair's `test-design-qa.md` § U-19
table also no longer parenthesizes `ACF-FC-01` and `ACF-FC-02` as `(invalidated)` — corrected
2026-09-11 via a **System Edit** under contract §4.3, done as its own confirmed edit rather than a
side effect of this epic plan. That edit changed `test-design-qa.md`'s content after
`test-design-validation-report.md` recorded its hash; the report is unchanged and its recorded PASS
still describes what it evaluated at the time, but the hash no longer matches current content until
a re-Validate.

### `R-PLAT2-03`: allow cases pass for the wrong reason (Score 6)

**Strategy:** `ACF-AU-R1` — four facade-level audience-set assertions replacing the `200` checks as
the primary evidence. Any retained HTTP layer is explicitly marked provisional and is never cited as
audience evidence.
**Owner:** QA + Access Control owners.
**Status:** Planned.
**Verification:** deliberately break the resolver for one audience and confirm the corresponding
facade test goes red while the HTTP case would have stayed green.

---

## Assumptions and Dependencies

### Assumptions

1. `PLAT-E2` remains an **active** canonical epic. If it is superseded, this plan is superseded with
   it and is not migrated to another identity.
2. The 2026-09-01 User Management answer (`self`/`reporting`/`pp`/`colleague` → `200` S1 card;
   empty audience → `403`; unresolved session → `401`; no leak-free `404`) stays settled.
3. Real reporting chains run **5–10 levels**. `ACF-PERF-01` is scoped from this. If the figure is
   revised, the realistic-depth row is re-scoped — the 499 ceiling still does not move.
4. `f36d1b2` (all audiences per target, upward walk from targets) is the current resolver contract.

### Dependencies

1. ~~**An AD-1 Stage-1 reviewer** — blocks `ACF-RW-01..03` entirely.~~ **Withdrawn — no such dependency exists.** AD-1 stage approval was retired 2026-09-04, before this plan was written; nothing blocks a Stage-2 test or production code on a reviewer. `ACF-RW-01..03` were reworked and reviewed in-session on 2026-09-11 (Anna Pikula) as a voluntary record.
2. **`PLAT-E3` kernel evidence** — `ACM3-II-01` / `ACM3-II-03` already close `R-PLAT2-08`; this plan
   consumes that rather than duplicating it.
3. **Platform Story 1.1 reconciliation** — resolves the status conflict; **not** a precondition for
   any test above.
4. **`UM-E0-S0.1`** — facade adoption on the production route. Until then no HTTP-level audience
   claim from this epic is meaningful.

### Risks to Plan

- **Risk:** the three rework approvals are treated as a mechanical status swap.
  **Impact:** the same divergence returns, now with a signature on it.
  **Contingency:** the suite README already states this is *not* a mechanical swap; the approval
  record must name the retro-anchor explicitly.
- **Risk:** `ACF-PERF-01` is read as an NFR gate for `PLAT-E2`.
  **Impact:** Contract C acquires a threshold it has never had.
  **Contingency:** the measurement spec stays `measurementOnly: true` and is never wired into CI as
  a gate; it cannot go red on a regression and must not be asked to.

---

## Interworking & Regression

| Service / Component | Impact | Regression Scope |
| --- | --- | --- |
| `services/backend` `src/access-control/` | The facade and `AudienceResolverService` are the subject | All of `test/access-control/` must stay green — **every** suite under that path, not a fixed subset (21 `*.e2e-spec.ts` files at run baseline `28d8e20`) |
| `PLAT-E3` kernel (`ACM-3` inactive identity) | **Consumed, not duplicated.** `ACM3-II-01` (inactive viewer at chain top) and `ACM3-II-03` (inactive target under a live manager) are what actually closed `R-PLAT2-08` | `acm3-inactive-identity.e2e-spec.ts` must stay green; this plan adds no equivalent case |
| `PLAT-E3` (`ACM-4R` multi-audience) | Owns merge precedence. `ACF-AU-06` must not restate it | `acm4r-multi-audience.e2e-spec.ts` |
| `UM-E0` access-control adoption | Consumes `resolveAudiences`; the `403`/`401` route oracle is theirs | `test/user-management/access-control-adoption/` |
| User Management read paths | `resolveAudiences` is called from the career-timeline, access-journal, and org-relationships facade adapters | `test/user-management/epic-3/`, `epic-4/`; `test/mentorship/` |
| `prisma-relationship-graph.adapter.ts` | The recursive CTE is the cost centre; any change invalidates the P6 reading | Re-run `measurement (P6)`; **do not** reuse an old baseline across an adapter change |

---

## Follow-on Workflows (Manual)

- `bmad-testarch-test-design` **Validate**, scope `epic-platform-2` → writes
  `test-design-validation-report-epic-platform-2.md`. **Not run.**
- `/bmad-testarch-atdd` for the P0 set, once the three rework scenarios are approved.
- `/bmad-testarch-trace` remains a planning audit with `allow_gate=false`.

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: ______ Date: ______
- [ ] Tech Lead: ______ Date: ______
- [ ] QA Lead: ______ Date: ______

**Status: approval ungranted.** No box above is ticked, and none may be ticked by a workflow run.
This document does not inherit the 2026-08-30 AD-1 approval of the 9 scenario documents, nor the
2026-09-11 platform-pair approval.

---

## Appendix

### Knowledge Base References

- `risk-governance.md` · `probability-impact.md` · `test-levels-framework.md` ·
  `test-priorities-matrix.md` · `nfr-criteria.md`

### Related Documents

- **Epic (canonical):** `_bmad-output/planning-artifacts/platform/epics.md` `## Epic 2: Access Control Foundation`
- **Spec:** `_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md`
- **Architecture spine:** `_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`
- **Platform pair:** `test-design-architecture.md` · `test-design-qa.md`
- **Index:** `test-design/README.md` · **Routing contract:** `docs/test-design-workflow-contract.md`
- **Scenarios:** `docs/test-cases/access-control-foundation/`
- **Deferred findings:** `_bmad-output/implementation-artifacts/access-control/deferred-work.md`
- **Blockers:** `…/architecture-people-management-ratification-2026-09-02/blockers.yaml` (`SEC-AUTH-01`)
- **Measurement:** `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md`

---

**Generated by:** BMad TEA Agent — Test Architect Module
**Workflow:** `bmad-testarch-test-design` (Create, Epic-Level), routed by `docs/test-design-workflow-contract.md`
**Run key:** `epic-platform-2`
