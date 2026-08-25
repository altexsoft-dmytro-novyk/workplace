---
runScope: 'platform-level'
runKey: 'platform'
workflowStatus: 'approved'
totalSteps: 5
stepsCompleted:
  - 'step-01-detect-mode'
  - 'step-02-load-context'
  - 'step-03-risk-and-testability'
  - 'step-04-coverage-plan'
  - 'step-05-generate-output'
  - 'step-01-validate'
  - 'step-01-assess'
  - 'step-02-apply-edit'
  - 'step-01-validate'
  - 'step-03-apply-decisions'
  - 'human-approval'
lastStep: 'human-approval'
nextStep: 'implementation'
lastSaved: '2026-08-25'
inputDocuments:
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - docs/architecture/domain-driven-design.md
  - docs/architecture/access-control.md
  - docs/architecture/testing-strategy.md
  - docs/architecture/dashboards.md
childTestDesigns:
  - path: _bmad-output/test-artifacts/test-design-architecture.md
    scope: user-management
    status: approved
  - path: _bmad-output/test-artifacts/test-design-qa.md
    scope: user-management
    status: approved
  - path: _bmad-output/test-artifacts/test-design/people-management-handoff.md
    scope: user-management
    status: approved
partialChildArtifacts:
  - path: docs/test-cases/access-control/
    count: 202
    status: stage-1-draft
outputs:
  - _bmad-output/test-artifacts/test-design-architecture-platform.md
  - _bmad-output/test-artifacts/test-design-qa-platform.md
  - _bmad-output/test-artifacts/test-design/people-management-platform-handoff.md
  - _bmad-output/test-artifacts/test-design-validation-report-platform.md
---

# Test Design Progress — Platform Level

## Step 3: Risk & Testability Summary

- **Platform risks:** 12 (PR-001..PR-012); 6 high ≥6
- **Platform blockers:** 7 (PR-B-01..PR-B-07) — architecture/integration **TBD**; **do not block UM or AC** (decided 2026-08-25)
- **Child UM risks:** R-001..R-014 — inherited, not re-scored

## Step 4: Coverage Plan Summary

| Layer | Approx. scenarios | Status |
| --- | --- | --- |
| access-control (draft stage-1) | 202 | P0-class; no formal TEA doc |
| user-management (approved child) | 45 | Do not redo |
| Pending contexts (profile, dashboards, 6 workflows) | ~150–250 est. | **Blocked** |
| Integrations (TT, PF) | ~15–30 est. | **Blocked** |
| Platform NFR | ~5–10 | Partial (k6, PII scan) |

## Step 5: Outputs Generated

| File | Audience |
| --- | --- |
| `test-design-architecture-platform.md` | Architecture / Dev |
| `test-design-qa-platform.md` | QA |
| `test-design/people-management-platform-handoff.md` | BMAD integration |

## Open Items (Explicitly Not Decided)

- Custom-field storage (EAV vs JSONB) — PR-B-01
- Dashboard widget/access model — PR-B-02
- Timetracker API contract — PR-B-03
- PeopleForce API contract (scope decided: read-only candidates + vacancies) — PR-B-04
- Bounded-context confirmation for 7 pending domains — PR-B-05
- Department edge modeling + TD-13 finality — PR-B-06
- Temporal employment model — PR-B-07
- Accessibility numeric thresholds

## Decided 2026-08-25

| ID | Decision |
| --- | --- |
| PG-07 | List ≤2 s @ 500+ = release gate; waiver temporary + documented |
| OQ2 | Shared links require authentication in Iteration 2 |
| PR-005 | Canonical User ID; external IDs explicit; email hint only |
| PR-B-04 scope | PF read-only candidates + vacancies; external link fallback only |
| PR-B scope rule | PR-B-01/02/03/05/06/07 do not block UM or Access Control |

## Validation — 2026-08-25 (initial)

**Verdict:** **FAIL** — see `test-design-validation-report-platform.md`.

## Edit Pass — 2026-08-25

Applied documentation fixes for C-01..C-05 and W-01..W-10:

| Fix | Artifact(s) |
| --- | --- |
| C-01 §4.9 split (UM partial vs remaining auto-events) | QA platform map, handoff, Appendix C |
| C-02 Delta-review protocol | QA platform, handoff, architecture INFO |
| C-03 PR-002 score aligned to 6 | architecture-platform Quick Guide |
| C-04 PF vacancies traced | QA integrations, blockers, Appendix C TR-5.2-02 |
| C-05 PR-B-07 temporal model | architecture, QA blockers, Appendix C TR-6-01 |
| W-01 §4.6 access vs dashboard split | QA workflow domains, handoff |
| W-02..W-05 Appendix C full §4 trace | QA platform Appendix C |
| W-06 AC partial child governance | QA Not in Scope, handoff inventory |
| W-07 PG-07 TBD for NFR-2 | QA release gates, handoff |
| W-08 UM progress file clarified | `test-design-progress-system.md` header |
| W-09 §8 in Not in Scope | QA platform |
| W-10 HR Admin row | QA cross-cutting map |

**Not modified:** UM child TEA artifacts, test cases, automated tests, production code.

## Re-Validation — 2026-08-25 (pass 2)

**Verdict:** **WARN — documentation ready for human review** (upgrade from FAIL).

- Requirements trace: **PASS** (Appendix C + coverage map)
- C-01..C-05: all resolved
- Strict approval: planning baseline **approved**; release gates still open until runtime evidence

See `test-design-validation-report-platform.md` (pass 2).

## Decision Pass — 2026-08-25

Applied human decisions to platform architecture, QA, and handoff docs:

| Decision | Artifact impact |
| --- | --- |
| PG-07 release gate | QA release gates, NFR P0, TR-7-01, handoff PG-07 |
| OQ2 auth required | Architecture INFO, QA SL row, TR-4.8-01, blockers table |
| PR-005 canonical User ID | Architecture risk + mitigation; TR-6-02; integrations row |
| PR-B-04 PF scope | Blockers, TR-5.2-*, PR-009, accepted trade-offs |
| PR-B does not block UM/AC | Blockers scope rule across architecture, QA, handoff |

**Not modified:** UM child TEA, AC scenario files, automated tests, production code.

## Platform Approval — 2026-08-25

**Verdict:** **Approved** as platform planning baseline.

| Artifact | Status |
| --- | --- |
| `test-design-architecture-platform.md` | Approved |
| `test-design-qa-platform.md` | Approved |
| `people-management-platform-handoff.md` v1.3 | Approved |

Planning baseline does **not** imply PG-01..PG-07 runtime evidence or PR-B contract resolution — those remain implementation-owned.

## Next Step

UM ATDD (`/bmad-testarch-atdd`) + AC per-file AD-1 review → stage-2 P0 E2E.
