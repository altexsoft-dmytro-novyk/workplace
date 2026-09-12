# Test Design and Coverage Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to execute this plan task by task. Checkboxes track execution; writing this plan completes none of them.

**Goal:** Validate existing epic test designs, create missing plans in priority order, and refresh coverage from actual test execution evidence.

**Architecture:** Keep system test policy, epic test designs, executable tests, and observed coverage distinct. Preserve canonical epic identities and repository workflow routing. Test execution can proceed alongside design work; verified coverage is refreshed after execution evidence is available.

**Tech Stack:** BMad TEA; backend Jest/HTTP/PostgreSQL tests; frontend Playwright; service contract and performance suites; workspace evidence and trace scripts.

**Spec:** User request on 2026-09-12 concerns testing, not creation of product epics. Binding inputs are `docs/project-requirements.md`, the PM architecture spine and `docs/architecture/testing-strategy.md`, `docs/test-design-workflow-contract.md`, and `_bmad-output/test-artifacts/test-design/README.md`.

**Status:** Proposed execution plan. No tests, validation runs, PR merges, or coverage updates were performed to create it.

## Global constraints

- Reuse existing product epics and story IDs. This plan creates or edits their **test designs**, not their product decomposition.
- Use `bmad-testarch-test-design` with the exact system or domain-qualified epic scope. Each epic owns its plan, checkpoint, and validation report.
- New design documents do not inherit approval or validation. A corrected checkpoint hash is not a Validate run.
- Scenario → committed-red executable test → production implementation remains mandatory for new behavior. Per-stage human approval was retired; do not reinstate it.
- Retrospective plans for implemented behavior must state their evidence boundary honestly; do not manufacture a scenario-first development history.
- A whole-repository Trace uses `allow_gate=false`. Release verdicts require a separately declared MVP/demo target.
- Canonical trace artifacts are overwritten in place. No dated trace copies; the configured Trace completion hook persists the coverage matrix.
- Do not infer passing tests from a green informational CI job. Inspect runner reports and infrastructure outcomes.
- Application changes belong in service repositories. Saving service changes follows the repository's service-first commit/push and workspace-gitlink sequence.

## Evidence baseline and pending PRs

Inspected workspace baseline: `367750e46861cbc43772ff701531cfa33801cfdd`. The following PR heads were read; refresh their state at execution time:

| PR | Inspected head | Effect on this plan |
| --- | --- | --- |
| [Re-record four drifted checkpoint hashes; rewrite the dashboard developer handoff](https://github.com/altexsoft-dmytro-novyk/workplace/pull/56) | `92355f4a8330e048c149fcd0bc67069246c5cb78` | Accounts for four checkpoint hash changes. Does not validate those epic plans. Avoid duplicating the fixes. |
| [fix: repair epic identifier collisions + sprint-status bypass mitigation](https://github.com/altexsoft-dmytro-novyk/workplace/pull/57) | `c6f76bda85d15a490c90c1aca59e837190775d41` | Requires guarded tracking writes at workflow activation. No epic test design or coverage evidence is added. |
| [Dashboard docs and test-cases](https://github.com/altexsoft-dmytro-novyk/workplace/pull/6) | `4ced4ea353d59ca733f1f91f1982b932df1facb0` | Contains an older dashboard engine/auth design. Do not import its test expectations as current requirements without reconciliation against PM/AD-33. |

The [test-design index at the inspected baseline](https://github.com/altexsoft-dmytro-novyk/workplace/blob/367750e46861cbc43772ff701531cfa33801cfdd/_bmad-output/test-artifacts/test-design/README.md) records system validation followed by document edits, one epic validation with CONCERNS, many generated but unvalidated epic plans, and missing active-epic plans.

The [trace at the inspected baseline](https://github.com/altexsoft-dmytro-novyk/workplace/blob/367750e46861cbc43772ff701531cfa33801cfdd/_bmad-output/test-artifacts/traceability-matrix.md) records an older source commit. It is a planning audit, not evidence of current release readiness.

## Task 1 — Select and record the execution baseline

**Inputs:** Current PR heads, workspace HEAD, service gitlinks, current test-design index.
**Output:** A baseline record in this plan's execution notes.

- [ ] Recheck the three PRs. Prefer the integrated baseline after the checkpoint and workflow-protection changes land. A pre-merge assessment may use an explicitly recorded PR/integration head; never describe separate PR runs as a combined-main run.
- [ ] Record workspace commit, both service commits, local modifications, and relevant CI run identities.
- [ ] Run `npm run guard:epic-ids`, `npm run test:test-design-routing`, `npm run test:epic-ids`, and `npm run test:trace-gate` in the workspace.
- [ ] Resolve any remaining identity or checkpoint inconsistencies without repeating changes already present in the selected baseline.

**Done when:** Inputs and check results are recorded against an exact baseline. Known failures remain explicit and are assigned to their owning scope.

## Task 2 — Repair and validate existing test designs

**Files:** The canonical system architecture/QA pair, system handoff and index; `test-design-epic-platform-2.md`, its checkpoint and validation report, all under `_bmad-output/test-artifacts/`.

- [ ] Use system Edit to reconcile stale handoff statements with recorded decisions. Preserve prior validation as historical evidence rather than claiming it covers later edits.
- [ ] Run system Validate against the resulting current content.
- [ ] Use epic Edit for `PLAT-E2` (Access Control Foundation). Recheck each finding in its existing validation report against current content; fix the missing AC4/AC5 verification obligations, add an acceptance-criterion-to-scenario/evidence table, and address the remaining applicable assertion-strength and execution-order findings.
- [ ] Explicitly assess the four allow cases reported as asserting HTTP success on an unwired route. Distinguish resolver-unit evidence from actual HTTP behavior; documentation changes cannot establish execution coverage.
- [ ] Run epic Validate for `PLAT-E2`; update only its scoped report/checkpoint and index entry as required by the routing contract.
- [ ] Validate other existing epic plans in delivery order, prioritizing implemented behavior and the next development slice. Record per-epic outcomes and unresolved findings instead of applying a blanket approval.

**Done when:** System and selected epic outcomes describe the current files, with every finding resolved or explicitly retained. Documentation validation remains distinct from test execution and product blocker closure.

## Task 3 — Create missing epic test designs

**Files:** Canonical product epic sources under `_bmad-output/planning-artifacts/`; scoped plans/checkpoints under `_bmad-output/test-artifacts/`; the current index.

- [ ] Create and validate `epic-platform-3` for `PLAT-E3` (Access Control Kernel MVP). Map its existing acceptance criteria to risks, scenarios, executable tests, and evidence gaps.
- [ ] Create and validate `epic-platform-4` for `PLAT-E4` (Access Control Authorization Consolidation), with the same explicit evidence mapping.
- [ ] Resolve `UM-E6` ownership using its own current-state endpoint acceptance criteria and the directory/PersonPicker consumer relationship. Create and validate `epic-user-management-6` for its owned obligations; reference shared policy rather than duplicating it.
- [ ] Inventory all remaining active canonical epics against the index, including platform capabilities. Queue missing plans by the next delivery slice and risk. Exclude superseded epics; do not treat absent migration obligations as grounds for excluding an active epic.
- [ ] Record each remaining scope, owner, priority, and dependency in the index or its existing tracking location.

**Done when:** The three priority scopes have scoped plans and validation outcomes, and remaining missing active scopes have an explicit queue. This initial batch does not claim all project test design is complete.

## Task 4 — Collect fresh execution evidence

**Inputs:** Recorded baseline; service instructions and test configs; `.github/workflows/tests.yml`.
**Outputs:** Runner reports, suite outcomes, environment information, and source-commit attribution.

- [ ] Reuse complete runner reports from CI only when they match the assessed commits and required environment. Otherwise run the relevant suites using the service instructions and CI configuration.
- [ ] Collect backend unit and real HTTP/PostgreSQL E2E results plus frontend Playwright results. Include unit/component and contract suites where present on the chosen service commits and relevant to the assessed behavior.
- [ ] Record database, storage, application, and other prerequisite failures separately from assertion failures. Do not mark tests as passed when setup prevented execution.
- [ ] Classify failed, skipped, expected committed-red, and unexecuted cases. Check whether skipped-case unblock conditions have already been met.
- [ ] Collect performance evidence where changed behavior invalidates prior measurements. Keep directory contract A, facade contract B, and audience-function measurement C separate; reuse prior evidence only with an explicit applicability check.

**Done when:** Every included suite has a report and known execution conditions, and every omitted suite has a reason. This task may start after Task 1 without waiting for all design tasks.

## Task 5 — Refresh live evidence and Trace

**Files:** `scripts/build-live-verification-results.cjs`; canonical `live-verification-results.json`, `traceability-matrix.md`, `e2e-trace-summary.json`, and `tea-trace-coverage-matrix.json` under `_bmad-output/test-artifacts/`.

- [ ] Build live verification results from Task 4 runner reports with the script's documented options and exact source attribution. Check unmatched test-to-requirement mappings; do not force unrelated tests onto requirement IDs.
- [ ] Run `bmad-testarch-trace` for the selected scope. For the whole repository, retain `allow_gate=false` and issue no release verdict.
- [ ] Reconcile the resulting requirement-to-test mappings with the evidence producer. If mappings changed, regenerate affected evidence and rerun Trace as needed so both artifacts describe the same baseline and mapping.
- [ ] Let the configured completion hook persist the coverage matrix under its canonical name. Verify downstream pointers reference that file.
- [ ] Review covered versus execution-verified results separately. Group gaps into missing tests, failing tests, skipped tests, unavailable environment, missing implementation, and unresolved requirements.
- [ ] Cite committed artifacts by their commit. Label uncommitted run results explicitly until saved.

**Done when:** Matrix, reports, and evidence share an attributable baseline; unmapped or unexecuted cases are explicit; no aggregate percentage is presented as release readiness.

## Task 6 — Turn findings into a targeted testing queue

- [ ] Prioritize P0 authorization/evidence-integrity gaps, then P1 gaps affecting the selected delivery scope.
- [ ] Map each action to an existing story or QA backlog owner and state the expected observable result.
- [ ] For newly missing behavior, follow scenario → committed-red test → implementation. For test or environment defects, fix the verified cause and rerun affected suites.
- [ ] Refresh evidence and Trace after material changes. Do not rerun unchanged suites solely to regenerate documents.
- [ ] Record remaining blockers and the next executable scope. Any release assessment is a separate run with an explicit MVP/demo target.

**Done when:** Each actionable gap has an owner, next action, dependency, and verification criterion. Remaining work is visible; planning completion is not reported as product completion.

## Execution notes

No execution recorded. Creating this plan did not merge PRs, change service code, validate test designs, run service tests, or update coverage.
