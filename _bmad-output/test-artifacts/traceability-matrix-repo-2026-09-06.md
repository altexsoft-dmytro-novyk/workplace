---
stepsCompleted: ['step-01-load-context','step-02-discover-tests','step-03-map-criteria','step-04-analyze-gaps','step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-09-06'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
sourceSha: 'd8faa81ff914d9d198b33f76242fa47a0ef713bf'
---

# Traceability Matrix — whole repository, all epics

**Refresh of** `tea-trace-coverage-matrix-repo-2026-09-04b.json`. Generated 2026-09-06.
Gate: **CONCERNS**.

Workspace `d8faa81f` · backend `20ed2a08` · frontend `cfbed35b`.

## What changed since the base run

The requirement inventory (258) and every static coverage verdict are unchanged.
What changed is the **evidence basis**.

The 2026-09-04b run recorded 148 live cases and its own `scope_note` admitted:
"The remaining backend e2e specs were not executed in this pass." Its
access-control-kernel verdicts were therefore carried forward from source
inspection, not from observation.

**This run executed every suite** — backend unit (19 cases), the complete
backend e2e suite (43 files / 406 cases), and the frontend Playwright suite
(124 cases): **549 cases seen, 538 mapped, 0 unmatched**.

Running them corrected a false green. `test/access-control/acm1r-fr-foundation.e2e-spec.ts`
was **37 of 39 red** at the base SHAs and nobody knew, because commit `37a339a`
had deleted `"db:bootstrap:access-control"` from `services/backend/package.json`
while the wrapper `scripts/bootstrap-access-control.ts` stayed in place. The 11
`ACM1*` requirements it backs were reported FULL on inspection alone. The script
has been restored and the suite is now 39/39 green. access-control-kernel was
**re-evaluated against observation**, as requested, rather than carried forward.

## ⚠️ Integrity caveat — this evidence is not yet reproducible

The run was produced from a **working tree**, not a commit. The restored
`db:bootstrap:access-control` line is uncommitted, so `recorded_source_sha`
(`d8faa81f`) names a commit that does **not** contain the fix. A clean checkout
of `d8faa81f` still reproduces 37 failures. The freshness check passes only
because the sha matches nominally.

**Commit the fix before treating this run as reproducible evidence.**

## Coverage

| | Total | Covered | % | Gate |
| --- | --- | --- | --- | --- |
| **All requirements** | 258 | 227 | **88%** | PASS (min 80) |
| P0 | 132 | 132 | **100%** | PASS (req 100) |
| P1 | 102 | 83 | **81%** | CONCERNS (target 90, min 80) |
| P2 | 24 | 12 | 50% | — |

By area:

| Area | Requirements | Fully covered | Live-observed | Observed failing |
| --- | --- | --- | --- | --- |
| user-management | 96 | 91 | 91 | 0 |
| access-control-kernel | 73 | 73 | 62 | 0 |
| frontend | 57 | 57 | 57 | 0 |
| mentorship | 26 | 0 | 0 | 24 |
| access-control-foundation | 6 | 6 | 6 | 0 |

## Live observation breakdown

| Disposition | Count |
| --- | --- |
| observed passing | 206 |
| observed passing, some cases `todo` | 10 |
| observed failing | 24 |
| only `todo` cases ran | 5 |
| no live record | 13 |

## Blockers — 29 failing cases, all mentorship

All 29 are Stage-2 tests committed red on purpose under AD-1. Every one fails
with the same signature: the route answers `404` because no mentorship module
exists in `services/backend/src`. They are not regressions and they are not
counted as coverage.

Gated on: `mentorship:assign` permission seed (G-PERM), the S13
`canAccessSection` increment (G-S13), the career-event application boundary
(G-CT), and the departure executor seam (G-DEP).

## Gaps that are not mentorship

**Five P1 career-timeline requirements run only as `it.todo`:** UM-CT-03,
UM-CT-04, UM-CT-05, UM-CT-06, UM-CT-09. Blocked on the FR-permission-matrix
grant of `profile:timeline:write` and the department-tree-walk increment. These
five plus mentorship's 14 P1s are exactly the 19 P1 requirements missing from
100%.

**Eleven access-control-kernel requirements have no live record** — ACM1-FB-02
… ACM1-FB-07, ACM1R-FB-10, ACM1R-FB-12, ACM1R-FB-13, ACM1R-FB-21, ACM1R-FB-22 —
even though the suite that backs them ran 39/39 green. This is an oracle-mapping
gap in the evidence producer, not a coverage gap: their cases matched no
requirement id. Worth closing so the next run does not have to reason about it.

Two mentorship requirements (MEN-FLAG-04, MEN-PAIR-05) also have no live record.

## Gate decision

**CONCERNS** — deterministic Rule 5: P0 coverage is 100% and overall coverage is
88% (minimum 80), but P1 coverage is 81% against a target of 90%.

Same verdict as 2026-09-04b, materially different basis: that run reached it
without executing the backend e2e suite at all.
