---
runScope: 'user-management-child'
runKey: 'system'
workflowStatus: 'approved'
totalSteps: 5
stepsCompleted:
  - 'step-01-detect-mode'
  - 'step-02-load-context'
  - 'step-03-risk-and-testability'
  - 'step-04-coverage-plan'
  - 'step-05-generate-output'
  - 'step-01-validate'
  - 'human-approval'
  - 'normative-propagation'
  - 'scenario-updates'
lastStep: 'scenario-updates'
nextStep: 'bmad-testarch-atdd'
lastSaved: '2026-08-25'
inputDocuments:
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - docs/architecture/access-control.md
  - docs/architecture/api-conventions.md
  - docs/architecture/database-schema.md
  - docs/architecture/user-management-test-decisions.md
reviewedNotSourcesOfTruth:
  - docs/architecture/testing-strategy.md
  - _bmad-output/specs/spec-user-management-test-cases/SPEC.md
  - docs/test-cases/user-management/**/*.md
intentEvidence:
  - ../workplace/docs/requirements-qa-addendum.md
  - workspace branch dn-user-management through 6fb1040
  - backend branch user-management at 865df5f
outputs:
  - _bmad-output/test-artifacts/test-design-architecture.md
  - _bmad-output/test-artifacts/test-design-qa.md
  - _bmad-output/test-artifacts/critical-review-existing-artifacts.md
  - _bmad-output/test-artifacts/test-design/people-management-handoff.md
  - _bmad-output/test-artifacts/test-design-validation-report.md
  - docs/architecture/user-management-test-decisions.md
---

# Test Design Progress — User Management Child

> **Note:** This checkpoint is the **approved User Management bounded-context** TEA run (`runKey: system`). Platform-wide strategy lives in `test-design-progress-platform.md` and `test-design-*-platform.md`.

## Approval — 2026-08-25

Human approval granted for system-level test design and critical review. Authorized: normative propagation + stage-1 scenario updates.

## Step 4: Coverage Plan Summary

- ~57 proposed scenarios (P0: ~8, P1: ~31, P2: ~13, P3: ~5)
- **46 stage-1 scenario files** on disk after updates (28 retained/reconciled + 17 new + 1 added by TEA per-file review: `um-ct-08`, plus `um-reg-nfr` renamed to `um-reg-13`)

## Propagation Complete

| Target | Status |
| --- | --- |
| `docs/architecture/user-management-test-decisions.md` | Created (DEC-UM-001..011) |
| `docs/project-requirements.md` §4.9 | Read/write audience clarified |
| `docs/architecture/database-schema.md` | `customFields` default `{}` |
| `docs/architecture/testing-strategy.md` | DEC-UM-010 isolation progression |
| `_bmad-output/specs/spec-user-management-test-cases/SPEC.md` | Constraints + CAP-7/8 |
| `_bmad-output/planning-artifacts/epics.md` | Stories 1.1, 1.4, 2.2, 3.2, 4.1 updated |
| `docs/test-cases/user-management/**` | 45 files; README updated |

## Validation Checklist Status

- [x] System-level prerequisites met
- [x] Risk assessment with P×I scoring
- [x] NFR planning (unknowns marked)
- [x] Coverage matrix P0–P3
- [x] Execution strategy PR/nightly/weekly
- [x] Interval effort estimates
- [x] Both architecture + QA documents
- [x] Handoff document
- [x] Critical review of existing artifacts
- [x] Full test-design approval (2026-08-25)
- [x] Normative propagation
- [x] Stage-1 scenarios updated
- [ ] Per-file developer approval before stage-2 E2E
- [ ] ATDD (P0 failing E2E)

## Next Step

Run `/bmad-testarch-atdd` for P0 scenarios after per-file scenario review as needed.
