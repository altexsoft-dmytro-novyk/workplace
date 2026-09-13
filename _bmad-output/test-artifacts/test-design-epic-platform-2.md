---
epicId: 'PLAT-E2'
epicDomain: 'platform'
epicNumber: 2
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicSourceHeading: '## Epic 2: Access Control Foundation'
runScope: 'epic'
runKey: 'epic-platform-2'
workflowStatus: 'generated'
approvalStatus: 'granted'
approvalGrantedBy: 'Anna Pikula'
approvalGrantedDate: '2026-09-12'
validationStatus: 'PASS'
validationDate: '2026-09-13'
validationReport: '_bmad-output/test-artifacts/test-design-validation-report-epic-platform-2.md'
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
  - _bmad-output/test-artifacts/test-reviews/test-review-plat-e2-e4-2026-09-13.md
lastEditDate: '2026-09-13'
lastEditSummary: 'Recorded 2026-09-13 completions: ACF-AU-R1, ACF-FC-05, ACF-RW-04, ACF-DOC-01 (docs/ half), ACF-SCOPE-01, ACF-SCOPE-02. See Correction Log.'
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
> - **Approval: granted 2026-09-12 by Anna Pikula, the requester.** This human approval is
>   separate from validation and covers only the test design.
> - **Validation: PASS (2026-09-13, fresh independent Epic-Level validation).** Recorded in
>   `test-design-validation-report-epic-platform-2.md`, which independently re-verified every
>   2026-09-13 completion claim below against its cited source (commit, file, or test-review
>   record) rather than accepting this plan's own word. Supersedes the prior PASS (2026-09-12,
>   same report path) as the current validation state; that prior run remains historical evidence
>   of what it evaluated at the time.
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
its 9 Stage-1 scenarios carry historical 2026-08-30 approval markers (not a current workflow
state), and a real-PostgreSQL e2e suite exists.
This is consequently a **rework and evidence-integrity plan**, not a from-scratch coverage plan. The
bulk of the work below is closing gaps between what the scenario prose says, what the committed
tests assert, and what the shipped resolver does.

---

## Executive Summary

**Scope:** Epic-Level test design for `PLAT-E2` — the Phase-0 `resolveAudiences` boundary
(`Self` / `Reporting line` / direct `PP` / `Colleague`), fail-closed, with no User Management route,
projection, or UI ownership.

**Risk Summary:**

- Total risks identified: **9**
- High-priority risks (≥6): **3** (`R-PLAT2-01` score 9, `R-PLAT2-02` score 6,
  `R-PLAT2-03` score 6)
- Critical categories: **SEC**, **TECH**

**Coverage Summary (planned, not achieved):**

- P0: **4 API-E2E cases + 4 scenario-document alignment items** — **all 8 now complete
  (2026-09-13)**: `ACF-AU-R1`'s 4 facade audience-set assertions and `ACF-RW-01..04`'s 4 document
  alignments. This is document and test-item completion, not a coverage, gate, or release claim.
- P1: **3 API-E2E cases + 1 repository audit** — `ACF-FC-05`'s 2 cases done 2026-09-13;
  `ACF-NC-01` (1 API-E2E + 1 audit) remains open
- P2: **1 measurement + 4 repository/document audits** — `ACF-DOC-01` (docs/ half), `ACF-SCOPE-01`,
  and `ACF-SCOPE-02` done 2026-09-13 (3 of 5 items); `ACF-PERF-01` and `ACF-TR-01` remain open, and
  `ACF-DOC-01`'s `_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md` half is a
  separate remaining open item (owner AC + Architect)
- P3: **1 API-E2E case** — open
- **Total: ~31–53 h (~1–2 weeks)** as originally estimated; hours are not re-estimated by this
  edit. Counts distinguish executable tests from documentation and audit evidence. No
  approval-latency exclusion applies: AD-1 stage approval was retired 2026-09-04
  (`docs/architecture/testing-strategy.md:25–38`), so ordinary PR review is the only gate on these
  changes.

---

## Existing evidence baseline (a starting point, not coverage)

| Artifact | Count / state |
| --- | --- |
| Stage-1 scenario documents | **9** under `docs/test-cases/access-control-foundation/` (5 `ACF-AU-*`, 4 `ACF-FC-*`); their historical `Approved` markers are provenance only, not a current AD-1 state |
| Stage-2 e2e | `services/backend/test/access-control/audience-resolution.e2e-spec.ts` — **10** tests against real PostgreSQL |
| Scenario documents whose expected result was invalidated | **4** — `ACF-AU-05`, `ACF-FC-01`, `ACF-FC-02`, `ACF-FC-04`; all four are now reworked — the first three on 2026-09-11, `ACF-FC-04` on 2026-09-13 via `ACF-RW-04` |
| New scenario document added 2026-09-13 | `acf-fc-05-deactivated-identity-empty-set.md` (`ACF-FC-05`) — states the deactivated-target/deactivated-viewer empty-set rule as a scenario for the first time (was `R-PLAT2-04`) |
| `TR-*` rows receiving evidence from this suite | `TR-2.1-02`, `TR-2.1-05`, `TR-2.1-05A`, `TR-7-01` — **partial in every case**, per `test-design-qa.md` § U-19 |
| `TR-*` rows receiving **full** evidence | **none** |
| Performance record | `measurement (P6)` — `performance/p6-resolve-audiences-postgresql.md`, **a record, never a gate** |

**None of the above is coverage.** A present or historically approval-marked scenario document is not evidence that a
requirement is satisfied; `test-design-qa.md` § U-19 states this for all 99 access-control scenario
documents and it applies unchanged to these 9.

---

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| **Production `GET /users/:id` authorization** | *(Corrected 2026-09-11: the route **is** now wired — `@Get(':id')` carries `@RequireSectionAccess('profile:identity', 'read')` behind `SectionAccessGuard`, and `ACCESS_CONTROL_PORT` binds `AccessControlFacadeAdapter`, not `InterimAccessControlAdapter`, at `user-management.module.ts:215`.)* It stays out of scope on the unchanged reason: the **route contract** — the `PM/AD-24` three-code denial oracle — is owned by `UM-E0-S0.1`, not this epic | Cross-epic dependency, tracked under `R-PLAT2-01` and `R-PLAT2-03`; the rework in P0 removes this plan's dependence on the route |
| **Section matrix, `canAccessSection`, `isAllowed`** | Kernel substrate is `PLAT-E3` (`ACM-5`, `ACM-2`); S2–S16 is `PLAT-E6` | Consumed as cross-epic evidence; see Interworking |
| **Multi-audience combination and merge semantics** | `CAP-2` / `ACM-4R` is `PLAT-E3` | Consume `ACM4R-MA-01`; do not duplicate it here. `ACF-DOC-01` reconciles the foundation SPEC/README's stale “exactly one audience” wording with current applicable-set semantics while preserving Self exclusivity |
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
| `R-PLAT2-01` | SEC | **`SEC-AUTH-01`.** **Status per `blockers.yaml`, re-checked 2026-09-13: `status: closed`, `closed: 2026-09-12`** (requester Anna Pikula; `.../blocker-verification-2026-09-12.md`), **but the closure carries an explicit, currently-unmet reopen condition.** The interim adapters are confirmed absent from the production module. One residual path was found and fixed in source (`env.validation.ts` no longer defaults `ALLOW_TEST_SESSION_TOKENS` permissively under `NODE_ENV=production`) on backend branch `fix/sec-auth-01-refuse-test-tokens-in-production` (`45a671e`) — **verified 2026-09-13 that this branch is not yet merged to `services/backend` `main`** (`origin/main` at `d1ef680`; `git merge-base --is-ancestor 45a671e origin/main` → false). `blockers.yaml` states verbatim: *"Reopens if that branch is not merged to services/backend main."* **This plan records that fact and does not decide whether the blocker is therefore open; QA does not re-score or re-adjudicate a security risk unilaterally — that is Architect + Security's call, named in `blockers.yaml`'s own owner field.** Score kept at 9 pending that adjudication | 3 | 3 | **9** | Move every allow case off the route and onto the facade — **P0 `ACF-AU-R1`: DONE 2026-09-13** (backend `b714327`). Closure/reopening of `SEC-AUTH-01` itself is Architect + Security, **not this epic** | Architect and Security | Before first shared-environment deploy |
| `R-PLAT2-02` | TECH | Stage-1 prose and current API-E2E evidence disagree. `ACF-AU-05`/`ACF-FC-01`/`ACF-FC-02` were realigned on 2026-09-11; **`ACF-FC-04` was realigned 2026-09-13** (`ACF-RW-04`) — the obsolete HTTP `403` oracle was dropped and the doc now states the exact `{colleague}` result the current test asserts, retaining the termination/hang oracle | 3 | 2 | **6** | P0 `ACF-RW-01..04`: **all four done** (2026-09-11 / 2026-09-13) | Access Control owners + QA | Complete |
| `R-PLAT2-03` | TECH | **`ACF-AU-01..04` could pass for the wrong reason.** All four previously asserted only HTTP `200` on `GET /users/:id`, which no longer discriminates the audience since the route returns `200` to any active authenticated viewer. **`ACF-AU-01` (Self) additionally has no `TR-*` row at all — still true; `ACF-TR-01` remains open, see P2.** | 3 | 2 | **6** | P0 `ACF-AU-R1`: **DONE 2026-09-13.** `audience-resolution.e2e-spec.ts` now asserts exact facade audience sets via `AccessControlFacade.resolveAudiences` for AU-01 `{self}`, AU-02 `{reporting}`, AU-03 `{reporting}` (transitive), AU-04 `{pp}`; HTTP `200` is retained only as a separately labelled "UM route evidence" case. Backend commit `b714327`; scenario docs `docs/test-cases/access-control-foundation/audience/acf-au-0{1..4}-*.md` updated to match. Spec confirmed 16/16 green (`test-review-plat-e2-e4-2026-09-13.md` scored the file 100/100, 0 findings). Catalog gap (`ACF-AU-01` `TR-*` row) still handled by open P2 `ACF-TR-01` | QA + Access Control owners | Rework complete; `TR-*` catalog decision still open |

### Medium-Priority Risks (Score 3–4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `R-PLAT2-04` | TECH | The empty-set rule for a deactivated or unconfirmed target (shipped in `9e69682`) previously had **no approved scenario** stating it. **Resolved 2026-09-13.** | 2 | 2 | 4 | P1 `ACF-FC-05`: **DONE.** Two new facade tests added to `audience-resolution.e2e-spec.ts` (deactivated target → empty set; deactivated viewer → empty set), reusing the existing `InactiveMgr` fixture; new scenario doc `docs/test-cases/access-control-foundation/fail-closed/acf-fc-05-deactivated-identity-empty-set.md`. Suite confirmed 16/16 green | Access Control owners |
| `R-PLAT2-05` | PERF | **P6 misread as production load.** The depth-499 × 500-target row is warm p50/p95/worst **960.940 / 983.087 / 984.351 ms** — ~49 % of the 2 s facade budget, and visually alarming. Real reporting chains run **5–10 levels**, where the balanced depth-5 × 500-target row is warm p95 **9.139 ms** | 2 | 2 | 4 | P2 `ACF-PERF-01`. Read deep-chain rows as a **canary for algorithmic change**, not production load. **Do not raise the fixture depth ceiling above 499** — `acyclic_depths` and `target_count` are hashed into `fixture_manifest_hash` and changing them invalidates every existing baseline | Platform / Backend |
| `R-PLAT2-06` | TECH | The foundation SPEC and suite README asserted exactly one audience per target, while current resolver evidence returns the applicable set with Self exclusive and Colleague as fallback. Combination/precedence evidence belongs to PLAT-E3. **Partially resolved 2026-09-13: the README half is fixed; the SPEC half is not, and is outside this Edit's writable file set** | 2 | 2 | 4 | P2 `ACF-DOC-01`: **`docs/test-cases/access-control-foundation/README.md:19` DONE** — reworded from "resolves **one** audience per viewer×target" to "resolves the **applicable set** ... not exactly one," naming Self-exclusive / Reporting-and-PP-coexist / Colleague-floor and consuming (not duplicating) `PLAT-E3` `ACM4R-MA-01`. **`_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md:23` still says "exactly one" — remains open**, owner AC + Architect; a proposed replacement text exists on file (audit report) pending a proper spec-edit workflow, not applied here | Access Control owners |
| `R-PLAT2-07` | OPS | The authoritative tracker and Epic 2 header say `done`, while global coverage deliberately keeps `PLAT-E2-S2.1` `in-progress` pending Story 1.1 | 3 | 1 | 3 | Reconciliation belongs to **Platform Story 1.1**. This plan records the one genuine divergence and changes neither surface | Platform epic owner |

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

One deliberate divergence remains. **This plan changes neither surface** (contract §5).

| Surface | What it says at the run baseline |
| --- | --- |
| `_bmad-output/implementation-artifacts/platform/sprint-status.yaml:61-62` | `epic-2: done` · `2-1-resolve-phase-0-audiences-acf-1: done` |
| `_bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml:95` | `PLAT-E2-S2.1 … status: in-progress` — deliberately *"left as in-progress here pending Platform Story 1.1 reconciliation rather than silently flipped"* |
| `_bmad-output/planning-artifacts/platform/epics.md:403` | `**Status:** done` — agrees with the tracker |

**Consequence for test design:** implementation is `done` according to the authoritative tracker;
the coverage model intentionally withholds its own completion classification. Reconciliation is
Platform Story 1.1's traceability matrix. The evidence obligations below are independent of how
that reconciliation lands.

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
- [x] Three rework documents are aligned — **done 2026-09-11**: `ACF-RW-01..03` (voluntary attribution only)
- [x] `ACF-RW-04` aligns the cyclic-chain scenario with its current exact-set API-E2E evidence — **done 2026-09-13** (voluntary attribution only, per the same pattern as `ACF-RW-01..03`)
- [x] This plan has been human-reviewed and approved by the requester — **2026-09-12**

## Exit Criteria

- [x] All P0 tests passing — **2026-09-13**: `ACF-AU-R1`'s 4 facade audience-set cases plus the
  existing suite are 16/16 green in `audience-resolution.e2e-spec.ts` (confirmed twice); all 4
  `ACF-RW-*` document alignments are also complete. This is a test-run and document-completion
  fact, not a coverage, gate, or release-readiness claim
- [ ] All P1 tests passing, or failures triaged and recorded — `ACF-FC-05`'s 2 cases done
  2026-09-13 (part of the same 16/16 green run); `ACF-NC-01` (1 API-E2E + 1 audit) remains open, so
  this box stays unchecked
- [x] `ACF-RW-01..03` have an explicit rework-attribution record; this is not approval or a gate
- [x] `ACF-RW-04` and `ACF-SCOPE-01/02` are complete (2026-09-13). **`ACF-DOC-01` is complete only
  for its `docs/` half** (the suite README) — the `_bmad-output/specs/...SPEC.md:23` half remains
  open, owner AC + Architect; see `R-PLAT2-06`. This box is checked for the three fully-complete
  items; `ACF-DOC-01`'s remaining half is tracked separately and is not hidden by this checkmark
- [x] No open high-severity defect in `resolveAudiences` — `test-review-plat-e2-e4-2026-09-13.md`
  found 0 CRITICAL/HIGH findings in `audience-resolution.e2e-spec.ts` (scored 100/100, Approve);
  this is a test-quality review finding, not an NFR or security verdict
- [ ] **Not an exit criterion:** closure of `SEC-AUTH-01`. It blocks deployment, not this epic's
  test design. **Status note (2026-09-13, not a decision by this plan):** `blockers.yaml` records
  it `closed` (2026-09-12) with an explicit reopen condition that is currently unmet — see
  `R-PLAT2-01`

---

## Test Coverage Plan

> **P0/P1/P2/P3 are priority, not execution timing.** Execution timing is defined separately in
> the PR/Nightly/Weekly strategy below. “API E2E” here means headless facade integration through a
> real Nest module and migrated PostgreSQL; it is not a jsdom/network-mocked component test.

### P0 (Critical)

**Criteria:** security or evidence-integrity impact with no safe workaround.

| Requirement / obligation | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `ACF-RW-01` — align `ACF-AU-05` to exact `{colleague}`, not HTTP `403` | Scenario-document alignment | `R-PLAT2-02` | 1 doc | QA + AC | **DONE 2026-09-11.** Existing API-E2E was already green at `da7d1fa`; this item repaired the evidence description |
| `ACF-RW-02` — align `ACF-FC-01` to exact `{colleague}` and not `reporting` | Scenario-document alignment | `R-PLAT2-02` | 1 doc | QA + AC | **DONE 2026-09-11.** Retro-anchor over existing API-E2E evidence |
| `ACF-RW-03` — align `ACF-FC-02` to exact `{colleague}`, no `pp`, no `reporting` | Scenario-document alignment | `R-PLAT2-02` | 1 doc | QA + AC | **DONE 2026-09-11.** Proves PP withholding only |
| `ACF-RW-04` — align cyclic-chain `ACF-FC-04` to exact `{colleague}` while retaining its termination/hang oracle | Scenario-document alignment | `R-PLAT2-02` | 1 doc | QA + AC | **DONE 2026-09-13.** Retro-anchor over existing API-E2E evidence; obsolete HTTP `403` dropped, termination/hang oracle retained verbatim in spirit |
| `ACF-AU-R1` — re-express AU-01..04 as exact facade audience-set assertions | API E2E (headless facade integration) | `R-PLAT2-01`, `R-PLAT2-03` | 4 | QA + AC | **DONE 2026-09-13.** `audience-resolution.e2e-spec.ts` asserts exact sets via `AccessControlFacade.resolveAudiences`: AU-01 `{self}`, AU-02 `{reporting}`, AU-03 `{reporting}` (transitive), AU-04 `{pp}`. HTTP `200` retained only as a separately labelled "UM route evidence" case. Backend commit `b714327`; scenario docs updated to match; suite 16/16 green |

**Total P0:** 4 API-E2E cases + 4 document-alignment items — **all 8 complete as of 2026-09-13**, **~16–26 h**.

### P1 (High)

**Criteria:** core resolver behaviour with a limited workaround.

| Requirement / obligation | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `ACF-FC-05` — deactivated target and deactivated viewer each yield an empty set | API E2E (headless facade integration) | `R-PLAT2-04` | 2 | QA + AC | **DONE 2026-09-13.** Makes explicit what `9e69682` shipped; not the AD-20 dismissed-target projection. New scenario doc `acf-fc-05-deactivated-identity-empty-set.md`; suite 16/16 green |
| `ACF-NC-01` — prove resolver results are neither persisted nor served from a decision cache | Repository audit + API E2E | `R-PLAT2-04` | 1 API-E2E + 1 audit | QA + AC | Inspect writes/cache providers and prove relationship changes are observed by a fresh call; satisfies the binding SPEC constraint without duplicating PLAT-E3 merge tests |

**Total P1:** 3 API-E2E cases + 1 repository audit, **~9–15 h**.

### P2 (Medium)

**Criteria:** secondary evidence or document consistency with an acceptable temporary workaround.
**Purpose:** make source, trace, and scope-boundary claims auditable.

| Requirement / obligation | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `ACF-PERF-01` — add a realistic-depth row (chain depth **5–10**, 500 targets) to the P6 record so the epic's own performance artifact describes the shape production actually has | Measurement | `R-PLAT2-05` | 1 run | Platform / Backend | **Measurement only; no threshold, no gate, no CI wiring.** Must not raise the depth ceiling above 499 — `acyclic_depths` is hashed into `fixture_manifest_hash` |
| `ACF-TR-01` — decide the `ACF-AU-01` Self `TR-*` orphan: register a row or record deliberate absence | Repository audit | `R-PLAT2-03` | 1 audit | QA + Architect | **Still OPEN.** A catalog gap, not a scenario gap; the decision itself is QA + Architect's, not made by this edit |
| `ACF-DOC-01` — reconcile the foundation SPEC and suite README to applicable-set semantics with Self exclusive and Colleague as fallback | Documentation audit | `R-PLAT2-06` | 1 audit | AC + Architect | **DONE for the `docs/` half, 2026-09-13** — `docs/test-cases/access-control-foundation/README.md:19` now states the applicable-set rule and consumes `PLAT-E3` `ACM4R-MA-01` without duplicating it. **`_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md:23` still says "exactly one" and remains open** — outside this Edit's writable file set; a proposed replacement text is on file in the audit report for a proper spec-edit workflow to apply |
| `ACF-SCOPE-01` — verify the ACF-1 delivery range changes no User Management controller/guard/adapter or frontend file | Repository audit | `R-PLAT2-03` | 1 audit | QA + Architect | **DONE — PASS, 2026-09-13.** Backend squash commit `c1b34c2`, 40 pathspecs reviewed, zero under `src/user-management/` or `test/user-management/`; `app.module.ts`'s 2-line diff only imports/registers `AccessControlModule` |
| `ACF-SCOPE-02` — verify ACF-1 enables no Project, Department, PP-HR-line, shared-link, full-profile, functional-permission, or section-matrix decision | Repository audit | `R-PLAT2-03` | 1 audit | QA + Architect | **DONE — PASS for the `resolveAudiences` capability, 2026-09-13.** Its call graph touches only `IdentityPort`/`RelationshipGraphPort`; no Project/Department/PP-HR-line/functional-permission/section-matrix read; `ACF-FC-02` independently proves PP-HR withholding. **Caveat:** `c1b34c2` is one squash merge that also contains `PLAT-E3`'s Kernel MVP (`isAllowed`, `canAccessSection`, etc.), so "the ACF-1 commit" is not an isolable range that excludes that code — the PASS verdict is scoped to `resolveAudiences`'s own call graph, not to a claim that the commit touches nothing else |

**Total P2:** 1 measurement run + 4 repository/document audits — **3 of 4 audit/document items complete (`ACF-DOC-01` docs/ half, `ACF-SCOPE-01`, `ACF-SCOPE-02`) as of 2026-09-13**; `ACF-PERF-01` and `ACF-TR-01` remain open, and `ACF-DOC-01`'s SPEC.md half remains open, **~5–10 h**.

### P3 (Low)

**Criteria:** exploratory, low-frequency resilience beyond the core resolver contract.
**Purpose:** broaden cycle-termination evidence without duplicating required coverage.

| Requirement / obligation | Test Level | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- |
| `ACF-FC-07` — a **three-person** reporting cycle terminates | API E2E (headless facade integration) | 1 | DEV | `ACF-FC-04` covers the two-person cycle only. Exploratory; the `NOT c.repeated` path guard is expected to hold |

**Total P3:** 1 test, **~1–2 h**.

## Acceptance-Criterion Traceability

| Story 2.1 AC | Planned verification | Level / owner | State |
| --- | --- | --- | --- |
| AC1 — only Self, Reporting, direct PP, or Colleague; Self exclusive | `ACF-AU-R1` exact sets (`{self}` for Self) plus `ACF-RW-01`; unexpected labels fail the assertion | API E2E / QA + AC | **Complete 2026-09-13** — `ACF-AU-R1` and `ACF-RW-01` both done; `ACF-AU-01`'s `TR-*` catalog gap is separately tracked as open `ACF-TR-01` |
| AC2 — live direct reporting edges and target-assigned PP only | `ACF-AU-R1` positive direct/transitive/PP cases; `ACF-RW-02` broken-edge negative; `ACF-RW-03` PP-chain withholding | API E2E + aligned scenario prose / QA + AC | **Complete 2026-09-13** — positive rework (`ACF-AU-R1`) and negative evidence (`ACF-RW-02/03`) both done |
| AC3 — empty input makes zero DB queries; broken/orphan data only reduces access | Existing `ACF-FC-03`; `ACF-RW-02..04`; `ACF-FC-05`; `ACF-NC-01` for non-persistence/cache | API E2E + repository audit / QA + AC | **Mostly complete 2026-09-13** — `ACF-RW-02..04` and `ACF-FC-05` all done; `ACF-NC-01` (non-persistence/cache audit) remains open |
| AC4 — no User Management controller/guard/adapter or frontend change | `ACF-SCOPE-01` commit-range/pathspec audit | Repository audit / QA + Architect | **Complete — PASS, 2026-09-13** |
| AC5 — no Project/Department/PP-HR/shared-link/full-profile/FR/section-matrix decision | `ACF-SCOPE-02` delivery/API-surface audit plus `ACF-RW-03` for PP-HR withholding; positive ownership remains PLAT-E5/E6/E8 and UM | Repository audit + API E2E / QA + Architect | **Complete — PASS, 2026-09-13**, for the `resolveAudiences` capability itself; PP-HR negative evidence aligned. Caveat: the delivery commit (`c1b34c2`) is not isolable from `PLAT-E3`'s Kernel MVP — see `ACF-SCOPE-02` row above |

---

## Execution Strategy

**Philosophy:** run every functional API-E2E check in PRs when the suite stays below 15 minutes;
defer only expensive measurement or genuinely long-running work. Priority does not determine timing.

### Every PR

- Existing foundation regression, including `ACF-FC-03` zero-query and current cycle evidence.
- `ACF-AU-R1` exact-set cases, `ACF-FC-05`, and `ACF-FC-07` once implemented.
- Repository/document audits `ACF-NC-01`, `ACF-TR-01`, `ACF-DOC-01`, and
  `ACF-SCOPE-01/02`; document alignment `ACF-RW-04` completed 2026-09-13 (see Correction Log).

### Nightly / on demand

- `ACF-PERF-01` P6 realistic-depth measurement only. It remains opt-in, non-blocking, and is
  never evidence for Contract A.

### Weekly

- No separate PLAT-E2-only class. Investigate repeated PostgreSQL/cycle flakes from PR evidence;
  do not rerun the same functional inventory merely to create another tier.

---

## Resource Estimates

| Priority | Count | Total Hours | Notes |
| --- | --- | --- | --- |
| P0 | 4 API-E2E cases + 4 docs | ~16–26 | **All 8 items complete as of 2026-09-13** (RW-01..04, AU-R1) |
| P1 | 3 API-E2E cases + 1 audit | ~9–15 | `ACF-FC-05` (2 cases) done 2026-09-13; `ACF-NC-01` (1 case + 1 audit) open |
| P2 | 1 run + 4 audits | ~5–10 | `ACF-DOC-01` (docs/ half), `ACF-SCOPE-01`, `ACF-SCOPE-02` done 2026-09-13; `ACF-PERF-01`, `ACF-TR-01`, and `ACF-DOC-01`'s SPEC.md half open |
| P3 | 1 test | ~1–2 | Fixture extension |
| **Total** | **8 API-E2E cases + 1 run + 9 docs/audits** | **~31–53** | **~1–2 weeks**; no approval-latency exclusion |

### Prerequisites

**Test data:** the existing foundation fixture, extended with a third cycle member for
`ACF-FC-07`. No PLAT-E2 fixture duplicates PLAT-E3's multi-audience evidence.

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

- [ ] No allow case cites HTTP `200` as audience evidence; the route is wired but belongs to UM
- [ ] No current scenario document contradicts the API-E2E evidence it describes
- [ ] No P6 number is cited as evidence for Contract A or as a gate result
- [ ] The `backend-acm9` job is **not** promoted to blocking as a mitigation for anything here

---

## Mitigation Plans

### `R-PLAT2-01`: `SEC-AUTH-01` fail-open auth substrate (Score 9)

**Strategy:** Two separable halves. (1) **Owned here:** move every `PLAT-E2` allow case off
`GET /users/:id` and onto `AccessControlFacade.resolveAudiences`, so this epic's evidence asserts an
audience set rather than a route outcome. (2) **Not owned here:** closing `SEC-AUTH-01` — interim
adapters fail closed or leave the production module.

**Premise correction, 2026-09-11.** Half (1) was justified as removing this epic's dependence on the
*interim session resolver*. That resolver no longer exists (see the risk row), so the stated
justification is retired. **The rework is still worth doing on its own merits** — a facade-level
audience-set assertion tests the thing this epic owns, while an HTTP status conflates the route
contract (`PM/AD-24`, owned by `UM-E0-S0.1`) with the audience decision. Retained on that reasoning,
not on the retired one.
**Owner:** Architect and Security (closure) · QA + AC (the rework half).
**Timeline:** rework with P0; closure before the first shared-environment deploy.
**Status:** **Rework half DONE 2026-09-13** (`ACF-AU-R1`, backend `b714327`). **Closure half:
per `blockers.yaml`, `SEC-AUTH-01` is recorded `status: closed` (2026-09-12), but that closure
names an explicit reopen condition — branch `fix/sec-auth-01-refuse-test-tokens-in-production`
(`45a671e`) merged to `services/backend` `main` — that was confirmed **not yet met** as of
2026-09-13 (`origin/main` at `d1ef680`). This plan records that fact only; the adjudication is
Architect + Security's, not QA's.**
**Verification:** every `ACF-*` assertion names an audience set, not an HTTP status — confirmed in
`audience-resolution.e2e-spec.ts` (16/16 green, reviewed 100/100 in
`test-review-plat-e2-e4-2026-09-13.md`). `SEC-AUTH-01` closure/reopening is verified against
`blockers.yaml`, not against this plan.

### `R-PLAT2-02`: Stage-1 / API-E2E divergence (Score 6)

**Strategy:** `ACF-RW-01..03` aligned three scenario documents to their existing exact-set
API-E2E evidence. `ACF-RW-04` must do the same for `ACF-FC-04`, retaining its cycle-termination
oracle while removing the contradictory HTTP `403`. These are validation-only characterization
repairs under `testing-strategy.md`; they do not claim the historical scenario → red → production
order was re-run and require no per-stage approval.
**Owner:** Access Control owners + QA.
**Status:** **Complete — RW-01..03 done 2026-09-11; RW-04 done 2026-09-13.**
**Verification:** each completed file states the corrected exact-set oracle and its attribution;
`ACF-FC-04` must agree with the current `{colleague}` API-E2E assertion. The platform pair's `test-design-qa.md` § U-19
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
**Status:** **DONE 2026-09-13.** `audience-resolution.e2e-spec.ts` now asserts exact facade
audience sets for AU-01..04; backend commit `b714327`; scenario docs updated to match.
**Verification:** deliberately break the resolver for one audience and confirm the corresponding
facade test goes red while the HTTP case would have stayed green. (Not independently re-run by
this edit; relies on the reviewed test's own oracle design, confirmed in
`test-review-plat-e2-e4-2026-09-13.md`.)

---

## Assumptions and Dependencies

### Assumptions

1. `PLAT-E2` remains the canonical implemented Epic 2 identity. The authoritative tracker and epic
   header say `done`; the separate coverage classification remains under Story 1.1 reconciliation.
2. The 2026-09-01 User Management answer (`self`/`reporting`/`pp`/`colleague` → `200` S1 card;
   empty audience → `403`; unresolved session → `401`; no leak-free `404`) stays settled.
3. Real reporting chains run **5–10 levels**. `ACF-PERF-01` is scoped from this. If the figure is
   revised, the realistic-depth row is re-scoped — the 499 ceiling still does not move.
4. Current implementation returns the applicable audience set; `ACF-DOC-01` must reconcile the
   foundation SPEC/README wording. Until then this is an explicit source-consistency risk, not an
   unqualified contract assumption.

### Dependencies

1. ~~**An AD-1 Stage-1 reviewer** — blocks `ACF-RW-01..03` entirely.~~ **Withdrawn — no such dependency exists.** AD-1 stage approval was retired 2026-09-04, before this plan was written; nothing blocks a Stage-2 test or production code on a reviewer. `ACF-RW-01..03` were reworked and reviewed in-session on 2026-09-11 (Anna Pikula) as a voluntary record.
2. **`PLAT-E3` kernel evidence** — `ACM3-II-01` / `ACM3-II-03` already close `R-PLAT2-08`; this plan
   consumes that rather than duplicating it.
3. **Platform Story 1.1 reconciliation** — resolves the status conflict; **not** a precondition for
   any test above.
4. **`UM-E0-S0.1`** — facade adoption on the production route. Until then no HTTP-level audience
   claim from this epic is meaningful.

### Risks to Plan

- **Risk:** the three rework attribution markers are treated as approval or a mechanical status swap.
  **Impact:** the same divergence returns, now with a signature on it.
  **Contingency:** retain them only as historical attribution; current AD-1 has no scenario approval state.
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
| `PLAT-E3` (`ACM-4R` multi-audience) | Owns combination and merge precedence; PLAT-E2 consumes, never duplicates, `ACM4R-MA-01` | `acm4r-multi-audience.e2e-spec.ts` |
| `UM-E0` access-control adoption | Consumes `resolveAudiences`; the `403`/`401` route oracle is theirs | `test/user-management/access-control-adoption/` |
| User Management read paths | `resolveAudiences` is called from the career-timeline, access-journal, and org-relationships facade adapters | `test/user-management/epic-3/`, `epic-4/`; `test/mentorship/` |
| `prisma-relationship-graph.adapter.ts` | The recursive CTE is the cost centre; any change invalidates the P6 reading | Re-run `measurement (P6)`; **do not** reuse an old baseline across an adapter change |

---

## Follow-on Workflows (Manual)

- `bmad-testarch-test-design` **Validate**, scope `epic-platform-2` → refreshes
  `test-design-validation-report-epic-platform-2.md` after this Edit.
- `/bmad-testarch-atdd` for the open P0 API-E2E set; ordinary review and CI apply.
- `/bmad-testarch-trace` remains a planning audit with `allow_gate=false`.

---

## Correction Log

> Dated entries recording content changes made after this plan's original 2026-09-11 generation.
> Each is a content-only **Edit under `docs/test-design-workflow-contract.md` §4.3**, not a Create
> or Validate run, and confers no approval, coverage, gate, or release-readiness claim by itself.

**2026-09-13 — Edit: record same-day rework and audit completions.** Following work verified this
same day, this plan's coverage tables, risk mitigation statuses, entry/exit-criteria checkboxes,
and the Acceptance-Criterion Traceability table were updated to reflect:

- `ACF-AU-R1` (P0) — **DONE.** `services/backend/test/access-control/audience-resolution.e2e-spec.ts`
  now asserts exact facade audience sets via `AccessControlFacade.resolveAudiences` for AU-01
  `{self}`, AU-02 `{reporting}`, AU-03 `{reporting}` (transitive), AU-04 `{pp}`; HTTP `200` is kept
  only as separately labelled "UM route evidence." Backend commit `b714327`. Scenario docs
  `docs/test-cases/access-control-foundation/audience/acf-au-0{1..4}-*.md` updated to match. This
  closes `R-PLAT2-03`'s P0 mitigation. `R-PLAT2-01`'s residual exposure stays with `SEC-AUTH-01`:
  `blockers.yaml` records it `status: closed` (2026-09-12) but names an explicit reopen condition
  (branch `fix/sec-auth-01-refuse-test-tokens-in-production`, `45a671e`, merged to
  `services/backend` `main`) that was verified **not yet met** as of 2026-09-13 — recorded here,
  not re-adjudicated by this plan.
- `ACF-FC-05` — **DONE.** Two new facade tests (deactivated target / deactivated viewer → empty
  set) added to the same spec; new doc
  `docs/test-cases/access-control-foundation/fail-closed/acf-fc-05-deactivated-identity-empty-set.md`.
  Spec now 16/16 green (confirmed twice by test review).
- `ACF-RW-04` — **DONE.** `acf-fc-04-cyclic-reporting-chain.md` realigned to exact `{colleague}`
  with the termination/hang oracle retained; obsolete `403` expectation dropped.
- `ACF-DOC-01` — **DONE for `docs/`.** Suite README reconciled to applicable-set semantics. The
  foundation SPEC `_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md:23` still
  says "exactly one"; that file is outside this Edit's writable set (not the plan, checkpoint, or
  index), so it was **not** edited here — recorded as a remaining open item, owner AC + Architect,
  with a proposed replacement text already on file (audit report) for a proper spec-edit workflow.
- `ACF-SCOPE-01` — **PASS.** Backend squash commit `c1b34c2`, 40 pathspecs reviewed, zero under
  `src/user-management/` or `test/user-management/`; `app.module.ts` registers
  `AccessControlModule` only.
- `ACF-SCOPE-02` — **PASS** for the `resolveAudiences` capability's own call graph, corroborated by
  `ACF-FC-02`. Caveat recorded: `c1b34c2` is a single squash merge that also contains `PLAT-E3`'s
  Kernel MVP (`isAllowed`, `canAccessSection`, etc.), so "the ACF-1 commit" is not an isolable
  range excluding that code — the verdict is scoped to the capability's call graph, not to a claim
  that the commit touches nothing else.
- `ACF-TR-01` — **still OPEN**; QA + Architect decision, not made by this edit.
- Test quality: `_bmad-output/test-artifacts/test-reviews/test-review-plat-e2-e4-2026-09-13.md`
  scored `audience-resolution.e2e-spec.ts` 100/100, 0 findings, deterministic (16/16 twice).

This edit changed this plan's content after `test-design-validation-report-epic-platform-2.md`
recorded its 2026-09-12 hash for this file. **A fresh independent Validate ran immediately
afterward (same session) and returned PASS (2026-09-13)**, re-verifying every completion claim
above against its cited source; see that report for the current content hash and the
per-claim verification record. **No approval, gate, or release status is claimed by this edit, by
the Validate that followed it, or by any item above.**

---

## Approval

**Approval granted 2026-09-12 by Anna Pikula**, the requester, and recorded in this plan's
frontmatter as `approvalStatus: granted`. This was an explicit human act after the independent
validation; neither Create nor Validate conferred it.

**What this approval covers:** the PLAT-E2 test design — risks, NFR planning, coverage
obligations, acceptance-criterion traceability, priorities, execution strategy, and estimates.

**What it does not become:** no runtime coverage, test execution, quality-gate result, NFR
verdict, or release-readiness claim. The open ACF scenario, audit, measurement, tracker, and
security obligations remain open. The validation report's statement that approval was ungranted
is an accurate snapshot of the earlier validation run; this later approval does not rewrite that
evidence record or require a new verdict.

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
