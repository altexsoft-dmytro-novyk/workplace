---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-08-31'
workflowType: 'testarch-trace'
inputDocuments:
  - '_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md'
  - '_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml'
  - '_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml'
  - 'docs/test-cases/access-control-kernel/**/*.md'
  - '_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml'
  - '_bmad-output/test-artifacts/performance/acm9-baseline-acm9-1788173258311-697e946d9f11.json'
  - '_bmad-output/test-artifacts/performance/acm9-final-acm9-1788173458416-ff94a3e685d1.json'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md', 'docs/test-cases/access-control-kernel/']
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
sourceSha: 'd3f4e8657a7a28832311f973b894ff587c025967'
tempCoverageMatrixPath: '_bmad-output/test-artifacts/tea-trace-coverage-matrix-2026-08-31.json'
---

# Traceability Matrix and Gate Decision: Access Control Kernel MVP (ACM-0..ACM-9)

**Target:** Access Control Kernel MVP epic (CAP-1 through CAP-8, stories ACM-0 through ACM-9-final)
**Date:** 2026-08-31
**Evaluator:** TEA Agent (bmad-testarch-trace)
**Coverage Oracle:** acceptance criteria (approved scenario docs, one file per scenario or scenario group)
**Oracle Confidence:** high
**Oracle Sources:** `_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md` (CAP-1..CAP-8), 73 approved scenario documents under `docs/test-cases/access-control-kernel/`, cross-verified against the append-only `approvals.yaml` AD-1 ledger.

This workflow audits coverage and applies its deterministic gate. It does not generate tests. `collection_mode` is `contract_static` (repository default) — every counted test below is a re-runnable spec file, not a recorded live-run claim, except CAP-7's performance gate, which is evidenced by two immutable, append-only measurement artifacts rather than a spec file (noted explicitly where it appears).

## Step 1 — Oracle Resolution

Resolved via formal requirements (tier 1 of 4) — see prior save. This project's own AD-1 process makes every scenario document an already human-approved acceptance criterion with a commit-level pointer in `approvals.yaml` from criterion to satisfying artifact.

## Step 2 — Test Discovery & Catalog

**Source SHA (workspace, this run):** `d3f4e8657a7a28832311f973b894ff587c025967`
**Source SHA (services/backend submodule, this run):** `eb98b3393f98e556e45033c1165b1a41f7542879`
**Live results file:** none present (`_bmad-output/test-artifacts/live-verification-results.json` does not exist) — not needed under `contract_static`.

### Catalog by test file (all under `services/backend/test/`)

| File | Level | `it` cases | Scenario IDs covered | Skip/fixme/only |
|---|---|---:|---|---|
| `access-control/acm0-root-user-prerequisite.e2e-spec.ts` | E2E | 7 | ACM0-RU-01..07 | none |
| `access-control/acm1r-fr-foundation.e2e-spec.ts` | E2E | 24 | ACM1-FB-01..09, ACM1R-FB-10..28 (all 28 CAP-3 criteria; several `it`s each assert 2+ IDs together) | none |
| `access-control/acm2-is-allowed.e2e-spec.ts` | E2E | 10 | ACM2-IA-01..10 | none |
| `access-control/acm3-inactive-identity.e2e-spec.ts` | E2E | 5 | ACM3-II-01, 02, 03 | none |
| `access-control/acm3-cycle-acyclicity.e2e-spec.ts` | E2E | 6 | ACM3-II-07, 08 | none |
| `access-control/acm3-termination-taxonomy.e2e-spec.ts` | E2E | 4 | ACM3-II-09, 10 | none |
| `access-control/acm3-path-local-visited-state.e2e-spec.ts` | E2E | 2 | ACM3-II-12 | none |
| `access-control/acm3-inactive-pp-endpoint.e2e-spec.ts` | E2E | 3 | ACM3-II-11 | none |
| `access-control/acm3-fail-closed-identity.e2e-spec.ts` | E2E | 5 | ACM3-II-13, 14 | none |
| `access-control/acm4r-multi-audience.e2e-spec.ts` | E2E | 8 | ACM4R-MA-01..06 | none |
| `access-control/acm5-section-access.e2e-spec.ts` | E2E | 9 | ACM5-SA-01..09 | none |
| `access-control/acm8-kernel-composition.e2e-spec.ts` | E2E | 5 | ACM8-KC-01..05 | none |
| `access-control/audience-resolution.e2e-spec.ts` | E2E | 11 | Phase-0 ACF-AU-01..05, ACF-FC-01..04 (pre-epic baseline; cross-mapped below for ACM3-II-04/05) | none |
| `measurement/acm9/acm9-baseline.measurement-spec.ts` | Live (artifact) | 1 (run twice: `role=baseline`, `role=final`) | CAP-7 performance gate | none |

**Totals:** 13 E2E spec files, 99 `it` cases, 0 `.skip`/`.only`/`.todo`/`xit`/`fit` found anywhere in the suite — no committed skips or focus.

### Coverage Heuristics Inventory

- **Auth/authz negative paths:** covered directly — `acm2-is-allowed` denies (inactive user, missing user, unknown key, case variant, empty key, AR cross-type, nonmatching join); `acm3-*` denies for inactive/missing/cyclic identities; `acm5-section-access` returns `none` for unsupported/missing/empty-audience. No auth/authz requirement in this epic's scope has a happy-path-only test.
- **Error-path coverage:** present and deliberate — `acm2-is-allowed` (`ACM2-IA-09`), `acm3-fail-closed-identity` (`ACM3-II-13`), `acm5-section-access` (`ACM5-SA-09`) each assert a real PostgreSQL infrastructure failure propagates as a thrown error rather than a silent false/none/empty result. This is a named architectural invariant (AD-11/12 fail-closed), not incidental coverage.
- **Endpoint coverage:** N/A in the OpenAPI sense — this epic's public surface is three facade methods (`resolveAudiences`, `isAllowed`, `canAccessSection`), not HTTP routes. `ACM8-KC-04` explicitly asserts no HTTP/debug route was added.
- **UI journey coverage:** N/A — this is a headless backend kernel; ACM-8 is the only story touching composition, and it explicitly forbids adding a route.

Load next step: step-03-map-criteria.

## Step 3 — Coverage Matrix

Legend: **FULL** = the approved scenario's exact assertion is exercised; **PARTIAL** = some but not all of the scenario's stated assertions are exercised, or the assertion lives under a different (non-canonical) test ID; **NONE** = no test exercises this criterion.

### CAP-8 / ACM-0 — Deploy-time root User prerequisite (P0)

| ID | Criterion (short) | Coverage | Test |
|---|---|---|---|
| ACM0-RU-01 | Fresh deploy creates one canonical active root | FULL | `acm0-root-user-prerequisite.e2e-spec.ts:100` |
| ACM0-RU-02 | Unrelated active employees don't affect eligibility | FULL | `:114` |
| ACM0-RU-03 | Blank config fails before mutation | FULL | `:138` |
| ACM0-RU-04 | Unmatched identity fails, no fallback adoption | FULL | `:149` |
| ACM0-RU-05 | Count all normalized matches before active-state check | FULL | `:173` |
| ACM0-RU-06 | Single inactive match rejected, not reactivated | FULL | `:202` |
| ACM0-RU-07 | Concurrent seeds converge via unique-violation race | FULL | `:221` |

**CAP-8: 7/7 FULL.**

### CAP-3 / ACM-1 + ACM-1R — FR schema, migration, atomic bootstrap (P0)

All 28 criteria (ACM1-FB-01..09, ACM1R-FB-10..28) map into one suite, `acm1r-fr-foundation.e2e-spec.ts` (36 ID references across 24 `it` blocks — several blocks assert multiple IDs at once, e.g. `ACM1-FB-08` + `ACM1R-FB-10` share one fixture).

| IDs | Criterion (short) | Coverage |
|---|---|---|
| ACM1-FB-01 | 3 canonical permission keys seeded | FULL |
| ACM1-FB-02, 07 | 1 HR-admin FR policy, no target | FULL |
| ACM1-FB-03 | Role granted exactly 3 permissions | FULL |
| ACM1-FB-04 | Exactly 1 root attachment, provenance recorded | FULL |
| ACM1-FB-05 | Rerun over undrifted DB changes nothing | FULL |
| ACM1-FB-06 | No other role/attachment/grant created | FULL |
| ACM1-FB-08, ACM1R-FB-10 | Row-shape CHECK; partial FR unique key; AR row w/ same targetRole accepted | FULL |
| ACM1-FB-09, ACM1R-FB-12, ACM1R-FB-13 | Duplicate key/grant/attachment rejected; unknown-permission grant rejected; permission-first index exposed; bad user/policy attachment rejected | FULL |
| ACM1R-FB-11 | Policies(id,type) support key + composite FK boundary | FULL |
| ACM1R-FB-14 | AccessControlBootstrap singleton constraints | FULL |
| ACM1R-FB-15 | ON DELETE RESTRICT, all 4 FR-side FKs | FULL |
| ACM1R-FB-16 | Renamed canonical key: restore + preserve, no in-place update | FULL |
| ACM1R-FB-17 | DEC-UM-007 normalization at lookup | FULL |
| ACM1R-FB-18 | Common advisory lock blocks + times out | FULL |
| ACM1R-FB-19 | Rollback on deactivation inside tx window | FULL |
| ACM1R-FB-20 A/B | Absent-singleton: adopt existing FR policy by natural key / refuse on managedBy drift | FULL |
| ACM1R-FB-21 A/B | Absent-singleton: adopt own attachment / never adopt others' | FULL |
| ACM1R-FB-22 | Absent-singleton adopts changed root (no provenance) | FULL |
| ACM1R-FB-23 | Singleton present + email drift fails atomically | FULL |
| ACM1R-FB-24 | AR hr-admin policy invisible to bootstrap | FULL |
| ACM1R-FB-25 A/B | Concurrent identical runs converge / concurrent conflicting runs: 1 success + 1 atomic failure | FULL |
| ACM1R-FB-26 R1/R2/P1/P2/F3/F4 | Per-field drift: restore grant, restore attachment, preserve description, preserve ids, fail on policyId drift, fail on rootUserId drift | FULL |
| ACM1R-FB-27 | Mid-transaction kill leaves no partial state | FULL |
| ACM1R-FB-28 | 4th permission + later attachment survive rerun | FULL |
| (control) | `db:bootstrap:access-control` npm script wired | FULL |

**CAP-3: 28/28 FULL** — all 13 database invariants from `database-schema.md` independently confirmed present in this suite (this was the exact gap ACM-1R was opened to close after the original `ACM-1-red-tests` covered only 3/13 fully).

### CAP-1 / ACM-3 — Audience derivation for inactive/cyclic identities (P0)

| ID | Criterion (short) | Coverage | Test |
|---|---|---|---|
| ACM3-II-01 | Inactive viewer at top of active chain → empty set (both for a target and for self) | FULL | `acm3-inactive-identity.e2e-spec.ts:146,154` |
| ACM3-II-02 | Inactive bridge stops traversal → Colleague above it, Reporting below it | FULL | `:164,172` |
| ACM3-II-03 | Inactive target below active manager → empty set, sibling unaffected | FULL | `:182` |
| ACM3-II-04 | Empty target list → empty map, **zero** graph-port calls | **PARTIAL (cross-mapped)** | `audience-resolution.e2e-spec.ts:288` (`ACF-FC-03`, pre-epic Phase-0 test — asserts the identical port-call-count claim, but is not itself an approved ACM-3 Stage-2 artifact in `approvals.yaml`) |
| ACM3-II-05 | Duplicate targets **and** a duplicated viewer id in one call collapse correctly; viewer id never reaches the graph port | **PARTIAL (cross-mapped)** | `acm4r-multi-audience.e2e-spec.ts:296` (`ACM4R-MA-04` — covers the duplicate-*target* half only; does **not** test a duplicated viewer-self id in the same bulk call, and does not assert the port received each id at most once) |
| ACM3-II-06 | A repeated node reached **before** viewer proof (viewer off-chain) denies Reporting for that target and falls to Colleague, leaving a sibling target unaffected | **NONE** | See finding below |
| ACM3-II-07 | Repeat AFTER viewer proof denies Reporting | FULL | `acm3-cycle-acyclicity.e2e-spec.ts:176,186,194` |
| ACM3-II-08 | Viewer herself inside the cycle is denied, not proven | FULL | `:208,216,226` |
| ACM3-II-09 | Absent manager edge is a clean end → Reporting granted | FULL | `acm3-termination-taxonomy.e2e-spec.ts:142,150` |
| ACM3-II-10 | Inactive endpoint above proven viewer is a clean end → Reporting granted; nothing above dead node reachable; dead node as target is identity failure not Colleague | FULL | `:160,172,185` |
| ACM3-II-11 | Inactive PP endpoint → no direct-PP audience; sibling unaffected; viewer-side denial | FULL | `acm3-inactive-pp-endpoint.e2e-spec.ts:119,127,141` |
| ACM3-II-12 | Path-local visited state: shared ancestors across 2 targets are not repeats; a genuine cycle on one target doesn't poison the other | FULL | `acm3-path-local-visited-state.e2e-spec.ts:135,156` |
| ACM3-II-13 | Real infra failure (unreadable relation, mid-flight) propagates as a thrown error, never a partial/empty map | FULL | `acm3-fail-closed-identity.e2e-spec.ts:124,155` |
| ACM3-II-14 | Missing viewer/target id(s) → empty set(s), never Self/Colleague | FULL | `:165,180,195` |

**CAP-1: 11/14 FULL, 2/14 PARTIAL (cross-mapped), 1/14 NONE.**

**🔴 Finding TRACE-1 (documentation defect, not a behavior defect):** `acm3-termination-taxonomy.e2e-spec.ts` line 23 states *"ACM3-II-06/07/08 are covered in `acm3-cycle-acyclicity.e2e-spec.ts` and are not restated here."* But `acm3-cycle-acyclicity.e2e-spec.ts` itself states, in its own header (line 22), *"Scope: these two scenarios only [ACM3-II-07 and ACM3-II-08]. The identity cases ... are not restated here"* — it never claims II-06, and inspection of its `describe` blocks (`ACM3-II-07`, `ACM3-II-08` only) confirms II-06 is absent. **ACM3-II-06 — "a repeated node reached before viewer proof denies Reporting and falls to Colleague" — has no test anywhere in the suite.** This is a real, previously unnoticed gap: it is a documented, code-verified-not-a-behavior-change scenario, but "code-verified" here means human/manual reasoning recorded in the scenario doc's prose, not a re-runnable assertion. Nothing currently guards this specific case against a future regression.

### CAP-2 / ACM-4R — Multi-audience retention, Self/Colleague, dedup, FR-separation (P1)

| ID | Criterion (short) | Coverage | Test |
|---|---|---|---|
| ACM4R-MA-01 | Reporting + direct PP both retained, neither suppresses the other | FULL | `acm4r-multi-audience.e2e-spec.ts:252` |
| ACM4R-MA-02 | Confirmed active Self is exactly `{self}`, no merge | FULL | `:262` |
| ACM4R-MA-03 | Colleague only when no stronger audience; 3 sub-cases (Reporting suppresses, PP suppresses, unrelated gets floor) | FULL | `:274,280,286` |
| ACM4R-MA-04 | Duplicate target collapses to 1 key, cardinality 2 preserved | FULL | `:297` |
| ACM4R-MA-05 | FR permission never enters audience resolution | FULL | `:311` |
| ACM4R-MA-06 | 1 mixed PostgreSQL fixture covers every CAP-2 audience class in one bulk call | FULL | `:322` |

**CAP-2: 6/6 FULL.** `acm-4-disposition.yaml` records `disposition: no-gap`, consistent with this matrix.

### CAP-4 / ACM-2 — Live type-separated `isAllowed` (P0)

| ID | Criterion (short) | Coverage | Test |
|---|---|---|---|
| ACM2-IA-01 | Live active FR grant for exact key → true | FULL | `acm2-is-allowed.e2e-spec.ts:154` |
| ACM2-IA-02 | Revocation is immediate (no cache) | FULL | `:159` |
| ACM2-IA-03 | Inactive user denies | FULL | `:172` |
| ACM2-IA-04 | Missing user → false, not an error | FULL | `:177` |
| ACM2-IA-05 | Unknown catalog key denies | FULL | `:182` |
| ACM2-IA-06 | Case-variant key denies (case-sensitive) | FULL | `:187` |
| ACM2-IA-07 | AR cross-type collision never grants | FULL | `:197` |
| ACM2-IA-08 | Nonmatching join (permission not granted via attached policy) denies | FULL | `:202` |
| ACM2-IA-09 | DB failure propagates, not false | FULL | `:207` |
| ACM2-IA-10 | Empty key denies without an invented short-circuit | FULL | `:192` |

**CAP-4: 10/10 FULL.**

### CAP-5 / ACM-5 — Base S1/S10/S11 section access (P1)

| ID | Criterion (short) | Coverage | Test |
|---|---|---|---|
| ACM5-SA-01 | S1 read for Self/Colleague only | FULL | `acm5-section-access.e2e-spec.ts:143` |
| ACM5-SA-02 | S1 write for Reporting/PP | FULL | `:151` |
| ACM5-SA-03 | S10 read for every Phase-0 audience, never write/none | FULL | `:161` |
| ACM5-SA-04 | S11 read for every Phase-0 audience, never write/none | FULL | `:175` |
| ACM5-SA-05 | Merge precedence: write > read > none | FULL | `:189` |
| ACM5-SA-06 | Unsupported section → none (successful read) | FULL | `:196` |
| ACM5-SA-07 | Missing target → none | FULL | `:203` |
| ACM5-SA-08 | Empty audience set → none | FULL | `:218` |
| ACM5-SA-09 | Underlying audience-resolution DB error propagates | FULL | `:231` |

**CAP-5: 9/9 FULL.**

### CAP-6 / ACM-8 — Deployable kernel composition (P0)

| ID | Criterion (short) | Coverage | Test |
|---|---|---|---|
| ACM8-KC-01 | Facade resolves from the real `AppModule` container | FULL | `acm8-kernel-composition.e2e-spec.ts:63` |
| ACM8-KC-02 | `ACCESS_CONTROL_PORT` stays bound to `InterimAccessControlAdapter` | FULL | `:77` |
| ACM8-KC-03 | `GET /users/:id` behavior unchanged | FULL | `:84` |
| ACM8-KC-04 | No new HTTP/debug endpoint | FULL | `:109` |
| ACM8-KC-05 | Header comment no longer conflates composition with port rebinding | FULL | `:115` |

**CAP-6: 5/5 FULL.**

### CAP-7 / ACM-9 — 500-target PostgreSQL performance gate (P1, absolute NFR gate)

| Criterion | Coverage | Evidence |
|---|---|---|
| Baseline PASS under `ACM9-MVP-v1`, comparable manifest | FULL (Live/artifact) | `_bmad-output/test-artifacts/performance/acm9-baseline-acm9-1788173258311-697e946d9f11.json` — `status: PASS` |
| Post-composition final measurement, same protocol, comparable to baseline | FULL (Live/artifact) | `_bmad-output/test-artifacts/performance/acm9-final-acm9-1788173458416-ff94a3e685d1.json` — `status: PASS`, `comparability: comparable`, `first_breach: None`, worst 1346ms vs 2000ms limit |

This is genuinely **Live** evidence in this workflow's sense (a recorded runtime measurement, not a re-runnable spec-file assertion of a boolean pass/fail) — but unlike the schema this workflow's `live-verification-results.json` contract describes, these two artifacts are themselves the append-only, immutable, hash-verifiable records (per `ACM9-MANIFEST-v1`), reserved-before-fallible-step and independently reproducible by rerunning `npm run measure:access-control:acm9`. I am treating this pairing as FULL rather than the "live evidence caps at CONCERNS" rule in Step 5 below, and flagging that judgment call explicitly for the gate step rather than applying it silently.

**CAP-7: 2/2 FULL**, with the caveat above carried into Step 5.

## Step 4 — Gap Analysis & Statistics

**Execution mode:** sequential (no subagent/agent-team orchestration invoked; dataset size did not warrant it).

### Coverage Statistics

| Priority | Total Criteria | Fully Covered | Coverage | Status |
|---|---:|---:|---:|---|
| P0 | 64 | 61 | 95% | CONCERNS (1 NONE gap) |
| P1 | 17 | 17 | 100% | PASS |
| P2 | 0 | 0 | N/A | N/A |
| P3 | 0 | 0 | N/A | N/A |
| **Total** | **81** | **78** | **96%** | — |

Fully covered: 78. Partially covered: 2 (`ACM3-II-04`, `ACM3-II-05`). Uncovered: 1 (`ACM3-II-06`).

### Gap Analysis

**Critical gaps (P0, coverage NONE): 1**
- `ACM3-II-06` — see Finding TRACE-1 above. This is a P0 gap because CAP-1's fail-closed audience derivation is the security-critical core of the entire epic, and this specific case (a cycle the viewer is off of, encountered before viewer proof) is exactly the shape most likely to regress silently if the Reporting-walk implementation changes again — there is currently nothing to catch it.

**High gaps (P1, coverage NONE): 0**

**Partial coverage items: 2**
- `ACM3-II-04` — cross-mapped to a pre-epic Phase-0 test (`ACF-FC-03`) that asserts the identical claim (zero graph-port calls on empty input) but was never an approved ACM-3 Stage-2 artifact in its own right. Functionally proven; procedurally orphaned from this epic's own AD-1 ledger.
- `ACM3-II-05` — cross-mapped to `ACM4R-MA-04`, which proves duplicate-*target* collapsing but not the scenario's second half (a duplicated *viewer* id in the same bulk call never reaching the graph port).

### Coverage Heuristics

- Endpoint gaps: 0 (N/A — no HTTP surface in this epic; `ACM8-KC-04` explicitly proves none was added)
- Auth/authz negative-path gaps: 0 — every denial-shaped criterion (inactive/missing/unknown/case-variant/cross-type/nonmatching/empty) has a dedicated test
- Happy-path-only criteria: 0 — every story family (CAP-1, CAP-3, CAP-4, CAP-5) has at least one explicit infrastructure-error/fail-closed test
- UI journey / UI state gaps: N/A (headless kernel)

### Live Evidence

`present: false` — no `_bmad-output/test-artifacts/live-verification-results.json` exists, and none was needed: CAP-7's two performance artifacts are re-runnable spec-file evidence (`acm9-baseline.measurement-spec.ts`, invoked twice with `ACM9_ROLE=baseline|final`), not out-of-band claims, so they are counted as ordinary (non-"live"-schema) test evidence in the matrix above rather than through this workflow's live-verification pathway.

### Recommendations

1. **URGENT** — Add committed-red-then-green Stage-2 coverage for `ACM3-II-06`, and correct the false cross-reference comment in `acm3-termination-taxonomy.e2e-spec.ts:23` that currently claims it. *(1 requirement: ACM3-II-06)*
2. **MEDIUM** — Close the 2 partial/cross-mapped items: either formally adopt `ACF-FC-03` as `ACM3-II-04`'s Stage-2 record in `approvals.yaml`, or write a canonical one; extend `ACM4R-MA-04` (or add a sibling test) to also cover a duplicated viewer-self id in the same bulk call for `ACM3-II-05`. *(2 requirements: ACM3-II-04, ACM3-II-05)*
3. **LOW** — Run `bmad-testarch-test-review` (or `bmad-code-review`, already in progress in a parallel session per the user) to assess test quality beyond coverage.

Full machine-readable coverage matrix: `_bmad-output/test-artifacts/tea-trace-coverage-matrix-2026-08-31.json`.

Load next step: step-05-gate-decision.

## Step 5 — Gate Decision

**Gate eligible:** yes (`allow_gate: true`, `collection_status: COLLECTED`).

## 🚨 GATE DECISION: FAIL

**Rationale:** P0 coverage is 95% (required: 100%). 1 critical requirement uncovered: `ACM3-II-06`.

| Criterion | Required | Actual | Status |
|---|---|---|---|
| P0 coverage | 100% | 95% | **NOT MET** |
| P1 coverage | 90% (min 80%) | 100% | MET |
| Overall coverage | ≥80% | 96% | MET |

This is a **strict, deterministic** result: the rule is "P0 coverage must be 100%, no exceptions," and this epic's own AD-1 process has applied exactly this severity before — recall the ACM-4 coverage audit, which halted an entire downstream chain (`ACM-4-red-tests`, `ACM-4-production`, `ACM-5`) over a coverage gap alone, with no behavior defect involved. This trace holds the epic to the same bar it has held itself to throughout.

**What FAIL means here, precisely — and what it does not mean:**
- It does **not** mean any of the 78 FULL-covered criteria are wrong, unproven, or regressed. ACM-0 through ACM-9-final all have real, re-runnable, currently-passing evidence.
- It does **not** mean CAP-1's actual runtime behavior is broken for the `ACM3-II-06` case — the scenario doc's own "code-verified" reasoning and the shared implementation logic in `prisma-relationship-graph.adapter.ts` (which now handles the sibling cases II-07/08/09/10/12 correctly per FULL-covered tests) make an undetected regression here unlikely, but "unlikely" is exactly the word this whole epic has spent nine stories refusing to accept as evidence.
- It **does** mean: there is currently no test in the repository that would catch a future regression in "a cycle the viewer is not part of, encountered before the viewer is reached, with a sibling target proving the denial is target-local" — and a comment in the codebase incorrectly claims this case is covered, which is worse than an acknowledged gap because it would not surface in a routine self-check.

### Gate Criteria Detail

```json
{
  "p0_coverage_required": "100%", "p0_coverage_actual": "95%", "p0_status": "NOT_MET",
  "p1_coverage_target": "90%", "p1_coverage_minimum": "80%", "p1_coverage_actual": "100%", "p1_status": "MET",
  "overall_coverage_minimum": "80%", "overall_coverage_actual": "96%", "overall_status": "MET"
}
```

### Path to PASS

Only recommendation #1 from Step 4 blocks the gate: add committed Stage-2 evidence for `ACM3-II-06` (a repeated node before viewer proof, viewer off-chain, denies Reporting and falls to Colleague, sibling target unaffected) and fix the false cross-reference comment at `acm3-termination-taxonomy.e2e-spec.ts:23`. This is scoped, small, and follows the exact same pattern already used for the sibling scenarios (II-09/10/11/12/13/14) — a single new spec file exercising the real facade against real PostgreSQL. Recommendation #2 (the two PARTIAL items) does not block the gate on its own (P0 coverage counts PARTIAL as not-FULL, but even fixing only II-06 would restore P0 to 100% since PARTIAL items are pre-existing and were already priced into the 95%... **correction, verified**: P0 total is 64, with 61 FULL; fixing II-06 alone brings FULL to 62/64 = 97%, which is *still* short of 100% because the two PARTIAL items (II-04, II-05) are P0 and also not FULL. **All three — II-04, II-05, and II-06 — must reach FULL for the gate to pass**, not just the NONE one.

### Machine-Readable Outputs

- `_bmad-output/test-artifacts/tea-trace-coverage-matrix-2026-08-31.json` — full Phase 1 coverage matrix (81 requirements)
- `_bmad-output/test-artifacts/e2e-trace-summary.json` — portable CI/CD-consumable summary
- `_bmad-output/test-artifacts/gate-decision.json` — slim gate signal

### Display

```
🚨 GATE DECISION: FAIL

📊 Coverage Analysis:
- P0 Coverage: 95% (Required: 100%) → NOT_MET
- P1 Coverage: 100% (PASS target: 90%, minimum: 80%) → MET
- Overall Coverage: 96% (Minimum: 80%) → MET

⚠️ Critical Gaps: 1 (ACM3-II-06)

📝 Recommended Actions:
1. URGENT — Add Stage-2 coverage for ACM3-II-06; fix the false coverage claim in acm3-termination-taxonomy.e2e-spec.ts:23
2. MEDIUM — Close ACM3-II-04 and ACM3-II-05 to canonical FULL coverage (both are P0 and also block 100%)
3. LOW — Run bmad-testarch-test-review for test quality

📂 Full Report: _bmad-output/test-artifacts/traceability-matrix.md

🚫 GATE: FAIL - Release BLOCKED until coverage improves
```

**Workflow complete.**
