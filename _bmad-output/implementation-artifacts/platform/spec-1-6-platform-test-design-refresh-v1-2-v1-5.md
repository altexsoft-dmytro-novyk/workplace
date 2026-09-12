---
title: 'Close PLAT-E1 Story 1.6 test-design refresh'
type: 'chore'
created: '2026-09-12'
status: 'draft'
review_loop_iteration: 0
context:
  - 'AGENTS.md'
  - '_bmad-output/implementation-artifacts/platform/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** PLAT-E1-S1.6 has the right v1.5 model in its canonical test-design set, but its functional P0 baseline and ACM-9 evidence anchors are not all recorded where its acceptance criteria require. Its TimeTracker “untracked” caveat is factually false at the ratification baseline, and the story still reports `backlog` with a superseded consolidation-only debt statement.

**Approach:** Add historical, commit-pinned evidence to the canonical QA and architecture documents; record a bounded story-completion record that preserves the distinction between documentation closure and runtime/release readiness; then change only S1.6's sprint-status key to `done`.

## Boundaries & Constraints

**Always:** Keep the functional P0 baseline (`c342138`) distinct from ACM-9 performance and directory-list performance; state that TimeTracker's source contract is tracked at the ratification baseline while its substantive successor gates remain open; use commit-pinned GitHub paths for historical claims; preserve current v1.5 authority and canonical artifact identities.

**Ask First:** Any proposal to alter gate thresholds, declare a release gate green, commit the external TimeTracker contract, resolve `TT-IDENTITY-01`/`TT-PMDM-01`, change application code, or close a product requirement/blocker beyond S1.6.

**Never:** Do not overwrite existing dirty artifacts, modify service submodules, treat a historical PASS measurement as a functional coverage PASS, or imply that closing this documentation story closes PM-FR-15 or runtime integration debt.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Historical P0 baseline | Pinned `gate-decision.json` at `c342138` is FAIL | QA names `FAIL`, `NOT_MET`, `critical_open: 1`, and `ACM3-II-06` as historical open debt | Do not infer a current release verdict |
| TimeTracker evidence | External API JSON exists at ratification SHA | Architecture corrects the prior absence claim beside the live successor gate IDs | Do not claim file presence resolves the substantive contract defects |

</frozen-after-approval>

## Code Map

- `_bmad-output/test-artifacts/test-design-qa.md` — Contract B owns the ACM-9 evidence contract; release-gate material is the appropriate home for the historical functional P0 baseline.
- `_bmad-output/test-artifacts/test-design-architecture.md` — `PR-B-08` maps the superseded TimeTracker gate to `TT-IDENTITY-01` and `TT-PMDM-01`.
- `_bmad-output/planning-artifacts/platform/epics.md` — Story 1.6 defines the seven acceptance criteria and contains the consolidation-only debt statement to replace with a current completion record.
- `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` — owns the exact S1.6 lifecycle key; Epic 1 stays in progress because other stories remain backlog.
- `_bmad-output/test-artifacts/test-design-validation-report.md` — system-level validation history; do not rewrite historical hashes without a real revalidation.
- `c342138035e8189665955453e5b5308a20a2ed00:_bmad-output/test-artifacts/gate-decision.json` — immutable functional P0 baseline.
- `3a3cd71884bf62d8c56577da1b4b36f2a8b327a3` — commit containing paired ACM9-MVP-v1 baseline/final evidence artifacts.

## Tasks & Acceptance

**Execution:**
- [ ] `_bmad-output/test-artifacts/test-design-qa.md` — add an explicit, commit-pinned historical functional-P0 record and paired ACM-9 baseline/final evidence anchors, with scope separation.
- [ ] `_bmad-output/test-artifacts/test-design-architecture.md` — correct TimeTracker provenance beside `TT-IDENTITY-01` and `TT-PMDM-01` without closing their substantive defects.
- [ ] `_bmad-output/planning-artifacts/platform/epics.md` — replace obsolete consolidation-only debt with a bounded S1.6 completion record that maps AC4, AC5, and AC7 to canonical evidence and retains PM-FR-15/runtime boundaries.
- [ ] `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` — mark only `1-6-platform-test-design-refresh-v1-2-v1-5` as `done` and update tracking metadata.

**Acceptance Criteria:**
- Given the canonical QA document, when a reviewer follows AC4, then the `c342138` artifact and all four historical P0 facts resolve without claiming a current PASS.
- Given Contract B, when a reviewer follows AC5, then the paired ACM-9 baseline and final JSON artifacts resolve at the same immutable commit and remain separate from functional P0 and directory evidence.
- Given the TimeTracker dependency, when a reviewer follows AC7, then the live successor gates carry the untracked-at-pinned-SHA caveat and no reproducibility claim.
- Given the story source and tracker, when S1.6 is inspected, then it is `done` while Epic 1 and unrelated blockers retain their existing status.

## Design Notes

The completion record is deliberately narrow: it closes the evidence-refresh deliverable, not a quality gate. A historical failed gate remains truthful evidence even if later tests exist, and ACM-9 PASS data cannot be used as directory or functional-coverage proof.

## Verification

**Commands:**
- `git show c342138035e8189665955453e5b5308a20a2ed00:_bmad-output/test-artifacts/gate-decision.json` -- expected: the cited historical values exactly match the canonical documentation.
- `git ls-tree -r --name-only 3a3cd71884bf62d8c56577da1b4b36f2a8b327a3 _bmad-output/test-artifacts/performance` -- expected: both cited ACM-9 artifact paths resolve.
- `rg -n 'c342138|ACM3-II-06|acm9-baseline|acm9-final|TT-IDENTITY-01|TT-PMDM-01|timetracker-external-api|1-6-platform-test-design-refresh-v1-2-v1-5: done' ...` -- expected: all closure anchors occur in their intended canonical/source/tracker files.
- `git diff --check` -- expected: no whitespace errors.
