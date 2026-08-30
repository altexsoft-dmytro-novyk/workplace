---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-08-30T18:33:20+03:00'
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
  - 'docs/test-cases/access-control-foundation/fail-closed/acf-fc-04-cyclic-reporting-chain.md'
  - '_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources:
  - 'docs/test-cases/access-control-foundation/'
  - '_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md'
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
sourceSha: '3b1880cfabf0676c1e02e5eb7a31e04be5d3424e'
workspaceSha: '5bdaf5e61ae9a05d26235adf0bc80b6f6624fb02'
tempCoverageMatrixPath: '/tmp/tea-trace-coverage-matrix-2026-08-30T18-30-00+03-00.json'
---

# Traceability Matrix & Gate Decision — ACF-1

**Target:** ACF-1 — Resolve Phase-0 Audiences
**Date:** 2026-08-30 (supersedes the 2026-08-30T01:31 run)
**Evaluator:** TEA Agent
**Gate type:** Story
**Collection mode:** Contract-static plus local Jest execution against a live PostgreSQL container

## What changed since the previous run

Three things, and only the first two move the gate:

1. **AD-1 approval now exists.** All nine Stage-1 scenarios carry an `**Approved:** Anna Pikula, 2026-08-30` marker under their `**Trace:**` line, and the translated suite carries a round-2 approval comment. Blocker `ACF-GOV-01` is resolved. Its provenance is recorded below rather than flattened, because the basis of the round-2 approval is material.
2. **The suite grew from 8 to 9 scenarios.** `ACF-FC-04` (cyclic reporting chain) was added, together with its E2E case and a bounding statement timeout in the adapter (`3b1880c`).
3. **The code under trace advanced four commits** past the previously traced state: `8ee78a8` (interactive transaction at REPEATABLE READ), `f36d1b2` (all audiences per target; walk upward from targets), `9cda644` (`UNION` restored in the recursive walk; cycle regression), `3b1880c` (statement timeout bounding the walk). Two of these close findings the 2026-08-30 checkpoint had dispatched.

The previous run recorded the workspace sha as `source_sha`. This run records the **backend** sha, because the code and tests under trace live in that submodule; the workspace sha is carried separately as `workspaceSha`.

## Context and oracle resolution

The formal coverage oracle is the nine Stage-1 ACF foundation scenarios plus
`SPEC-access-control-audience-foundation`. High confidence: the oracle items are approved,
per-file, by the named human, and each maps to exactly one E2E case that cites its ID.

The 171 draft files under `docs/test-cases/access-control/` remain outside this gate. Their known
delivery gap — 146 scenarios aimed at endpoints that do not exist — is tracked separately and
contributes no rows, percentages, or blockers here.

One governance qualification survives into this run, narrowed from the previous two:

- HTTP allow/deny expectations still use the provisional mapping
  `self|reporting|pp → allow; colleague → deny`, pending answer 3 in
  `_bmad-output/implementation-artifacts/access-control/um-integration-contract-request.md`.
  The approved scenarios encode this assumption; approval does not convert it into a contract.

## Approval provenance (AD-1)

Recorded explicitly, because `testing-strategy.md` makes the human's own sight of the artifact the
substance of the gate, and a matrix that says "approved" without saying how is the exact ambiguity
the rule exists to prevent.

| Round | Artifact | Approver | Basis |
| --- | --- | --- | --- |
| 1 — Stage-1 scenarios | 9 files under `docs/test-cases/access-control-foundation/` | Anna Pikula, 2026-08-30 | Read the suite README, then each scenario's behaviour restated in plain language before approving. Markers written per file. |
| 2 — translated E2E | `services/backend/test/access-control/audience-resolution.e2e-spec.ts` | Anna Pikula, 2026-08-30 | Walkthrough of the fixture, the ten requests and what each asserts — not a line read. Known weaknesses raised at approval time and accepted. |

Accepted knowingly at approval time, and therefore **not** re-raised as blockers:

- `ACF-FC-01`'s fixture places the deactivated user only in the mid-chain position, so the case
  passes for a weaker reason than the scenario claims. Separating a blocked bridge from a blocked
  target needs two further cases.
- `ACF-AU-05` denies the colleague outright, while §3.3.4 entitles a colleague to S1, S10 dates and
  the S11 project name. Correct only while the endpoint returns the whole row; it must change when
  profile projection lands.
- The suite imports `ACCESS_CONTROL_PORT` from `src/user-management/domain/`, which
  `domain-driven-design.md` forbids across context boundaries.

## Test discovery and execution inventory

| Level | Files | Cases | Result |
| --- | --- | --- | --- |
| E2E | 1 | 10 | 10 passed |
| Unit | 2 | 13 | 13 passed |
| API / Component / Live | 0 | 0 | — |

Executed 2026-08-30 on Node v24.18.0 against the project's PostgreSQL 18 container (healthy):

- `npm test` → 2 suites, 13 passed, 0 failed, 0 skipped, 0.312 s
- `npm run test:e2e -- access-control` → 1 suite, 10 passed, 0 failed, 0 skipped, 0.652 s

The tenth E2E case is not an oracle item: it asserts that resolution persists nothing derived,
which is a constraint from the SPEC rather than a scenario. It is counted as a test, not as coverage.

## Coverage matrix

| Oracle item | Priority | E2E case | Coverage |
| --- | --- | --- | --- |
| ACF-AU-01 · Self reads own profile | P0 | `ACF-AU-01 · Self reads own profile` | FULL |
| ACF-AU-02 · Direct manager reads a report | P0 | `ACF-AU-02 · Direct manager reads a report` | FULL |
| ACF-AU-03 · Manager's manager reads through the chain | P0 | `ACF-AU-03 · Manager's manager reads through the chain` | FULL |
| ACF-AU-04 · Assigned People Partner reads the profile | P0 | `ACF-AU-04 · Assigned People Partner reads the profile` | FULL |
| ACF-AU-05 · Unrelated colleague is denied | P0 | `ACF-AU-05 · Unrelated colleague is denied` | FULL |
| ACF-FC-01 · Walk stops at a broken reports-to edge | P0 | `ACF-FC-01 · Walk stops at a broken reports-to edge` | FULL |
| ACF-FC-02 · PP inheritance stops at the assigned partner | P0 | `ACF-FC-02 · PP inheritance stops at the assigned partner` | FULL |
| ACF-FC-03 · Empty bulk resolves without touching the database | P0 | `ACF-FC-03 · Empty bulk resolves without touching the database` | FULL |
| ACF-FC-04 · Cyclic direct chain terminates | P0 | `ACF-FC-04 · cyclic direct chain terminates` | FULL |

**9 of 9 P0 items FULL — 100%.** No P1, P2 or P3 items in this oracle.

### Heuristics

- **Endpoint coverage:** the single consumed endpoint, `GET /users/:id`, is exercised. No gaps.
- **Auth/authz negative paths:** present — three denial cases (`AU-05`, `FC-01`, `FC-02`).
- **Error/edge paths:** present — empty input (`FC-03`) and a malformed graph (`FC-04`).
- **UI journey / UI state:** not applicable; no UI in this slice.

## Gap analysis

No coverage gaps. Every oracle item maps to one executing E2E case citing its ID.

The gaps that remain are not coverage gaps, which is why the gate does not turn on them:

| Gap | Kind |
| --- | --- |
| Provisional feature→audience mapping | Contract — the expectations may be correct and still not be the agreed rule |
| Dormant production wiring | Composition — the suite proves the facade, not the running system |
| `ACF-FC-01` fixture discrimination | Scenario depth — accepted at approval |
| Cross-context import in the suite | Architecture boundary — accepted at approval |

## Gate decision — FAIL

**Base coverage: PASS.** P0 100% (threshold 100%), P1 not applicable, overall 100% (minimum 80%).
All 23 executed tests pass against a real database.

**Gate: FAIL**, on two critical blockers, down from three.

| ID | Severity | State | Reason |
| --- | --- | --- | --- |
| `ACF-GOV-01` | critical | **RESOLVED** | Both AD-1 rounds are recorded with named approver, date and basis. |
| `ACF-CONTRACT-01` | critical | open | The rule `self\|reporting\|pp → allow; colleague → deny` is an Access Control assumption pending answer 3 of the User Management integration contract. Approved scenarios encode the assumption; they do not settle it. |
| `ACF-WIRING-01` | critical | open | `AppModule` does not import `AccessControlModule`. The suite reaches the real facade through a test-only provider override, while production `GET /users/:id` stays bound to `InterimAccessControlAdapter`, whose target check returns `Boolean(userId)`. |

Read together: the story's evidence is now genuine and approved, and it demonstrates a component
that is not in the request path. A green suite behind a test-only override is not production
protection, and no amount of further testing changes that — only the wiring does.

### Recommendations

1. **URGENT — resolve the integration contract.** Six answers are requested in
   `um-integration-contract-request.md`; answer 3 alone unblocks `ACF-CONTRACT-01`. If the agreed
   mapping differs from the provisional one, the approved expectations change and Stage-1 approval
   is re-taken for the affected files.
2. **URGENT — complete the User Management-owned wiring** and re-run the E2E without the provider
   override. Until then this story cannot exceed FAIL regardless of coverage.
3. **Scheduled, not blocking — deepen `ACF-FC-01`.** Two further cases (deactivated viewer at the
   top of the chain; deactivated target with a live manager) separate a blocked bridge from a
   blocked target and would have caught the deactivated-viewer finding.

## Carried forward, not re-measured this run

- **Mutation diagnostics** from the 2026-08-30T01:31 run: flipping `colleague` to `reporting` killed
  `ACF-AU-05`, `ACF-FC-01`, `ACF-FC-02`; dropping the `isActive` join killed `ACF-FC-01`; six
  database constraint probes were each rejected. Not re-executed against `3b1880c`.
- **31 failures under `test/user-management/**`**, reported identical before and after `aca387b`,
  caused by missing endpoints and an unavailable LocalStack. Not attributed to ACF-1 and not
  re-measured; this run executed only the access-control selector.
- **Out-of-scope suite:** `docs/test-cases/access-control/` — 171 draft files, 146 targeting
  endpoints that do not exist. Excluded from this gate.

## Working-tree note

`services/backend` carries one uncommitted modification at trace time: the round-2 approval comment
added to the head of the E2E suite. It is non-behavioural — the executed code at `3b1880c` is
unchanged by it. Nothing was committed by this run.
