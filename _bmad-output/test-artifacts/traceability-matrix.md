---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-08-30T01:31:00+03:00'
workflowType: 'testarch-trace'
inputDocuments:
  - 'docs/test-cases/access-control-foundation/README.md'
  - 'docs/test-cases/access-control-foundation/audience/acf-au-01-self.md'
  - 'docs/test-cases/access-control-foundation/audience/acf-au-02-reporting-direct.md'
  - 'docs/test-cases/access-control-foundation/audience/acf-au-03-reporting-transitive.md'
  - 'docs/test-cases/access-control-foundation/audience/acf-au-04-pp-direct.md'
  - 'docs/test-cases/access-control-foundation/audience/acf-au-05-colleague-denied.md'
  - 'docs/test-cases/access-control-foundation/fail-closed/acf-fc-01-broken-reports-to-edge.md'
  - 'docs/test-cases/access-control-foundation/fail-closed/acf-fc-02-pp-hr-line-withheld.md'
  - 'docs/test-cases/access-control-foundation/fail-closed/acf-fc-03-empty-bulk.md'
  - '_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources:
  - 'docs/test-cases/access-control-foundation/'
  - '_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md'
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
sourceSha: 'd23428209b359e7bd2cb0742e6c1bb2fcb1bb729'
tempCoverageMatrixPath: '/tmp/tea-trace-coverage-matrix-2026-08-30T01-30-00+03-00.json'
---

# Traceability Matrix & Gate Decision — ACF-1

**Target:** ACF-1 — Resolve Phase-0 Audiences  
**Date:** 2026-08-30  
**Evaluator:** TEA Agent  
**Gate type:** Story  
**Collection mode:** Contract-static plus local Jest execution  

## Context and oracle resolution

The formal coverage oracle is limited to the eight Stage-1 ACF foundation scenarios and
`SPEC-access-control-audience-foundation`. This is a high-confidence oracle for the deliberately
narrow Phase-0 slice: Self, recursive Reporting line, direct People Partner, Colleague fallback,
fail-closed traversal, and the empty-bulk short circuit.

The 171 draft files under `docs/test-cases/access-control/` are explicitly outside this gate.
Their known delivery gap — including 146 scenarios aimed at endpoints that do not exist — is
tracked separately and does not contribute rows, coverage percentages, or blockers to the ACF-1
decision.

Two governance qualifications apply before test discovery:

1. The eight scenarios and their translated tests are agent-authored and have no independent
   human AD-1 approval.
2. HTTP allow/deny expectations use the provisional mapping
   `self|reporting|pp → allow; colleague → deny`, pending answer 3 in
   `_bmad-output/implementation-artifacts/access-control/um-integration-contract-request.md`.

The test stack for this run is Jest plus supertest using `test/jest-e2e.json`; the configured
Playwright utility flag is stale and is not applicable.

## Test discovery and execution inventory

### Runnable ACF-1 evidence

| Level | File | ACF-1 cases | Supplemental cases | Current result |
| --- | --- | ---: | ---: | --- |
| Unit | `services/backend/src/access-control/domain/services/audience-resolver.service.spec.ts` | 8 | 3 bulk/precedence cases | 11/11 passed |
| E2E/API | `services/backend/test/access-control/audience-resolution.e2e-spec.ts` | 8 | 1 non-persistence case | 9/9 passed |

Current local execution at source
`d23428209b359e7bd2cb0742e6c1bb2fcb1bb729`:

- `npm test`: 2 suites passed; 13 tests passed; 0 failed; 0 skipped; 0.306 s.
  Eleven tests are ACF resolver tests; two unrelated health tests are excluded from ACF-1
  coverage and pass-rate calculations.
- `npm run test:e2e -- access-control`: 1 suite passed; 9 tests passed; 0 failed; 0 skipped;
  0.746 s.
- PostgreSQL dependency: `backend-postgres-1`, healthy before E2E execution.

No `live-verification-results.json` exists. There is therefore no separate `live` evidence
bucket.

### Historical diagnostic evidence supplied for this gate

This evidence is recorded as corroboration, not counted as additional runnable test cases:

- A colleague-to-reporting resolver mutation killed exactly `ACF-AU-05`, `ACF-FC-01`, and
  `ACF-FC-02`. This demonstrates that the negative/fallback scenarios discriminate against a
  broad fail-open mutation.
- Removing the `users.isActive` join killed exactly `ACF-FC-01`, demonstrating targeted
  sensitivity to traversal through a deactivated intermediary.
- Six database-invariant violation probes each observed PostgreSQL reject the violation.
  These are user-supplied execution observations, not committed automated tests or a
  source-SHA-bound runtime manifest, so they do not increase coverage counts.

The 31 failures under `test/user-management/**` are excluded. They were independently reported
as identical before and after this change at commit `aca387b`, with missing endpoints and absent
LocalStack as causes. They are neither selected by the ACF command nor evidence against ACF-1.

### Discovered test identities

Each oracle case has one same-ID unit test and one same-ID E2E/API test:

- `ACF-AU-01` — unit line 45; E2E line 167
- `ACF-AU-02` — unit line 59; E2E line 176
- `ACF-AU-03` — unit line 69; E2E line 185
- `ACF-AU-04` — unit line 79; E2E line 194
- `ACF-AU-05` — unit line 89; E2E line 203
- `ACF-FC-01` — unit line 99; E2E line 215
- `ACF-FC-02` — unit line 111; E2E line 224
- `ACF-FC-03` — unit line 121; E2E line 233

Supplemental unit identities:

- `ACF-UNIT-BULK-01` — returns every requested target in one graph call (line 133)
- `ACF-UNIT-BULK-02` — deduplicates repeated targets (line 148)
- `ACF-UNIT-PRECEDENCE-01` — Reporting wins when manager and PP facts overlap (line 158)

Supplemental E2E identity:

- `ACF-E2E-NONPERSIST-01` — audience resolution leaves relationship rows unchanged (line 246)

All discovered ACF tests are active: no `.only`, skip, pending, or fixme markers were found.

### Coverage heuristics inventory

```json
{
  "endpoints": {
    "oracle": ["GET /users/:id", "AccessControlFacade.resolveAudiences(viewerId, [])"],
    "directly_tested": ["GET /users/:id", "AccessControlFacade.resolveAudiences(viewerId, [])"],
    "gaps": []
  },
  "auth_negative_paths": {
    "status": "covered",
    "cases": ["ACF-AU-05", "ACF-FC-01", "ACF-FC-02"]
  },
  "error_paths": {
    "status": "covered_for_oracle",
    "cases": ["ACF-FC-01", "ACF-FC-02", "ACF-FC-03"]
  },
  "ui_journeys": {
    "status": "not_applicable"
  },
  "ui_states": {
    "status": "not_applicable"
  },
  "out_of_scope_gap": {
    "suite": "docs/test-cases/access-control/",
    "draft_files": 171,
    "scenarios_targeting_nonexistent_endpoints": 146,
    "included_in_acf_1_gate": false
  }
}
```

## Requirements-to-tests traceability

All eight ACF-1 oracle items are P0 because an incorrect result can expose or improperly withhold
employee profile data. Coverage status describes implemented, runnable test coverage only; it
does not imply AD-1 approval or production readiness.

| Oracle item | Required outcome | Unit evidence | E2E/API evidence | Coverage |
| --- | --- | --- | --- | --- |
| `ACF-AU-01` | Self resolves first without a graph lookup; own profile allowed | `ACF-AU-01-UNIT`, resolver spec:45 | `ACF-AU-01-E2E`, audience E2E:167 | FULL |
| `ACF-AU-02` | Live direct manager resolves Reporting; profile allowed | `ACF-AU-02-UNIT`, resolver spec:59 | `ACF-AU-02-E2E`, audience E2E:176 | FULL |
| `ACF-AU-03` | Reporting resolution traverses live direct edges transitively | `ACF-AU-03-UNIT`, resolver spec:69 | `ACF-AU-03-E2E`, audience E2E:185 | FULL |
| `ACF-AU-04` | Direct assigned People Partner resolves PP; profile allowed | `ACF-AU-04-UNIT`, resolver spec:79 | `ACF-AU-04-E2E`, audience E2E:194 | FULL |
| `ACF-AU-05` | Unrelated employee falls back to Colleague; full profile denied without profile fields | `ACF-AU-05-UNIT`, resolver spec:89 | `ACF-AU-05-E2E`, audience E2E:203 | FULL |
| `ACF-FC-01` | Deactivated intermediary breaks traversal; ancestor denied | `ACF-FC-01-UNIT`, resolver spec:99 | `ACF-FC-01-E2E`, audience E2E:215 | FULL |
| `ACF-FC-02` | PP does not propagate through the PP's manager chain; ancestor denied | `ACF-FC-02-UNIT`, resolver spec:111 | `ACF-FC-02-E2E`, audience E2E:224 | FULL |
| `ACF-FC-03` | Empty target list returns an empty map and performs no graph/database query | `ACF-FC-03-UNIT`, resolver spec:121 | `ACF-FC-03-E2E`, audience E2E:233 | FULL |

### Behavioral mapping detail

- `ACF-AU-01`: Given viewer and target are Alice, when audiences resolve and `GET /users/:id`
  executes, then the result is Self/200 and Alice is excluded from graph lookup.
- `ACF-AU-02`: Given Alice has a live direct edge to Bob, when Bob reads Alice, then Reporting
  resolves and HTTP returns 200.
- `ACF-AU-03`: Given Alice → Bob → Carol live direct edges and no Alice → Carol edge, when Carol
  reads Alice, then recursive Reporting resolves and HTTP returns 200.
- `ACF-AU-04`: Given Alice has a direct PP edge to Paula and no reporting relation to her, when
  Paula reads Alice, then PP resolves and HTTP returns 200.
- `ACF-AU-05`: Given Colin has no qualifying relation to Alice, when Colin reads Alice, then
  Colleague resolves, HTTP returns 403, and profile fields are absent.
- `ACF-FC-01`: Given Erin's intermediary manager is inactive, when the manager's manager reads
  Erin, then traversal stops and HTTP returns 403.
- `ACF-FC-02`: Given Hana manages Alice's assigned PP but has no relation to Alice, when Hana
  reads Alice, then PP does not propagate and HTTP returns 403.
- `ACF-FC-03`: Given no target IDs, when the facade resolves audiences, then it returns an empty
  map and `loadAudienceFacts` is never invoked.

### SPEC-level supporting evidence

- Exactly one label per requested target and one graph call:
  `ACF-UNIT-BULK-01`.
- Duplicate target IDs do not create duplicate work:
  `ACF-UNIT-BULK-02`.
- Single-label precedence is deterministic when Reporting and PP both apply:
  `ACF-UNIT-PRECEDENCE-01`.
- Derived audience decisions are not persisted:
  `ACF-E2E-NONPERSIST-01`.
- Fail-closed mutation sensitivity:
  colleague-to-reporting mutation killed `ACF-AU-05`, `ACF-FC-01`, and `ACF-FC-02`;
  removal of the active-user join killed `ACF-FC-01`.

Unit/E2E overlap is intentional defense in depth. Unit tests isolate resolver label and
short-circuit rules. E2E/API tests exercise the real facade, graph adapter, PostgreSQL, guard,
and User Management HTTP route through a test-only provider override.

### Coverage totals

| Priority | Oracle items | FULL | Coverage | Current mapped execution |
| --- | ---: | ---: | ---: | --- |
| P0 | 8 | 8 | 100% | 16/16 mapped tests passed |
| P1 | 0 | 0 | N/A | N/A |
| P2 | 0 | 0 | N/A | N/A |
| P3 | 0 | 0 | N/A | N/A |
| **Total** | **8** | **8** | **100%** | **16/16 mapped tests passed** |

The four supplemental tests also passed, producing 20/20 passing ACF-relevant tests overall.
No stale, failed, skipped, blocked, invalid, unmatched, or contradicted live records were used.

## Phase 1 gap analysis

Static and current-execution coverage has no ACF-1 requirement gap:

- P0 uncovered: 0
- Partial or unit-only: 0
- Endpoint gaps: 0
- Authorization negative-path gaps: 0
- Happy-path-only criteria: 0
- UI gaps: not applicable
- Live-evidence blockers: 0; no live manifest is present

The coverage result is 8/8 FULL (100%), with 16/16 mapped tests passing and four additional
ACF-relevant tests passing.

Three qualifications remain outside the numeric coverage calculation:

1. Independent human AD-1 approval is absent for all agent-authored scenarios and tests.
2. The HTTP audience-to-allow/deny mapping remains provisional pending User Management contract
   answer 3.
3. Production wiring is absent: `AppModule` does not import `AccessControlModule`, and the E2E
   suite reaches the facade only through a test-module provider override. Production
   `GET /users/:id` remains on the interim allow-all path.

Recommended next actions are to obtain per-file human approval, resolve the owner-controlled
mapping, and complete the User Management-owned production adoption. The 171-file Phase-1 gap,
including 146 scenarios for nonexistent endpoints, remains separately tracked and excluded from
all ACF-1 calculations.

Phase 1 machine-readable matrix:
`/tmp/tea-trace-coverage-matrix-2026-08-30T01-30-00+03-00.json`.

## Quality gate decision

### GATE DECISION: FAIL

**Base coverage-threshold result:** PASS  
**Final ACF-1 story gate:** FAIL  

The standard coverage thresholds are met:

| Criterion | Threshold | Actual | Result |
| --- | ---: | ---: | --- |
| P0 oracle coverage | 100% | 100% (8/8) | MET |
| P0 mapped-test pass rate | 100% | 100% (16/16) | MET |
| Overall oracle coverage | ≥80% | 100% | MET |
| Active mapped tests | No skip/fixme/pending | 16 active | MET |

The final gate cannot use the threshold-only PASS because three confirmed gate blockers sit
outside numeric test coverage:

1. **`ACF-GOV-01` — no independent AD-1 approval.** Every scenario and translated test is
   agent-authored. Static mappings and green runs show implementation alignment, but they are not
   approved release evidence. This condition independently prevents PASS.
2. **`ACF-CONTRACT-01` — provisional business rule.** The E2E suite encodes
   `self|reporting|pp → allow; colleague → deny`. User Management has not answered question 3 in
   `um-integration-contract-request.md`. Green tests against an unapproved rule cannot establish
   correct authorization. This condition independently prevents PASS.
3. **`ACF-WIRING-01` — dormant production module.** `AppModule` does not import
   `AccessControlModule`. The E2E suite imports it and replaces `ACCESS_CONTROL_PORT` only inside
   the test module; production `GET /users/:id` remains on `InterimAccessControlAdapter`, which
   allows any authenticated non-empty user ID. The test proves the candidate integration path,
   not the running production composition.

Because the third blocker leaves a target-scoped production route effectively allow-all, this is
a security-critical deployment blocker, not a monitoring-only concern. The final FAIL is a
documented governance/security overlay on the deterministic coverage result; it does not rewrite
the 100% trace result.

### Execution evidence

- `npm test`: 13/13 passed across two suites; 11 are ACF-relevant.
- `npm run test:e2e -- access-control`: 9/9 passed against healthy PostgreSQL.
- Total ACF-relevant current execution: 20/20 passed, including four supplemental tests.
- Mutation evidence supplied for this assessment:
  - colleague-to-reporting killed exactly `ACF-AU-05`, `ACF-FC-01`, `ACF-FC-02`;
  - removing the active-user join killed exactly `ACF-FC-01`.
- Six database-invariant violation probes were observed rejecting their violations. They are
  corroborating historical evidence, not additional committed test cases.
- No burn-in, code-coverage report, or separate NFR assessment was provided; those dimensions are
  not claimed as PASS.

### Exclusions and separate gaps

- The 31 `test/user-management/**` failures are not attributed to ACF-1. They were reported
  unchanged before/after at `aca387b` and caused by missing endpoints and unavailable LocalStack.
- The 171-file Phase-1 `docs/test-cases/access-control/` suite is outside this gate. Its 146
  scenarios targeting nonexistent endpoints remain a separately tracked coverage gap and do not
  affect ACF-1 rows, percentages, or decision logic.
- Playwright is not part of this assessment. Evidence uses Jest, supertest, and
  `test/jest-e2e.json`.

### Required actions before re-gating

1. Independent human reviewer approves or rejects each of the eight Stage-1 scenarios and each
   translated test under AD-1.
2. User Management owner answers integration-contract question 3; update the E2E expectations if
   the approved audience mapping differs.
3. User Management adopts the real Access Control facade in production composition and the same
   boundary suite passes without a test-only provider override.
4. Re-run both Jest commands and this ACF-1 trace gate against the resulting source SHA.

### Machine-readable outputs

- `_bmad-output/test-artifacts/e2e-trace-summary.json`
- `_bmad-output/test-artifacts/gate-decision.json`

Generated 2026-08-30 by `bmad-testarch-trace`.
