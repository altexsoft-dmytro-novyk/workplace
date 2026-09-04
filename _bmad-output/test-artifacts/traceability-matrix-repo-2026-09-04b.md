---
stepsCompleted: ['step-01-load-context','step-02-discover-tests','step-03-map-criteria','step-04-analyze-gaps','step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-09-04'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
externalPointerStatus: 'not_used'
---

# Traceability Matrix — whole repository, all epics

**Refresh of** `tea-trace-coverage-matrix-repo-2026-09-04.json`. Generated 2026-09-04T20:28:44Z.
Gate: **FAIL**.

Workspace `c954d136` · backend `20ed2a08` · frontend `cfbed35b`.

## What changed since the base run

The oracle grew from 227 to 294+ scenario ids; **67 new requirements** entered the inventory:

- `UM-REL-18`…`UM-REL-26` — Story 6.1, `GET /users/:id/relationships`
- `UMAC-10` — the `user-management:edit` FR-grant OR-override on the S1 section gate
- 57 `FE-*` frontend flow scenarios

`untraced_test_suites` is now **empty**. The base run recorded the frontend suite
as 7 files / 133 cases / 0 oracle references; it is 124 cases (`playwright test
--list` and the AST agree — the base run overstated by 9), and every one of them
now names its scenario id in its own test title.

### This is an incremental refresh, not a full re-derivation

Prior requirement verdicts are carried forward **unchanged**. They encode source
inspection this pass did not repeat — mentorship has no `src/` module, so its
committed-red suites stay `PARTIAL` / `NOT_IMPLEMENTED` rather than being
promoted to `FULL` on the mere existence of a spec file. Only the 67 new
requirements were evaluated here. `tests[]` is a union, so the new scenario-id
tagging enriches traceability without moving any prior verdict.

## Coverage

| | Total | Covered | % |
| --- | --- | --- | --- |
| **All requirements** | 258 | 226 | **88%** |
| P0 | 132 | 131 | 99% |
| P1 | 102 | 83 | 81% |
| P2 | 24 | 12 | 50% |

FULL 226 · PARTIAL 31 · NONE 1.

By area:

| Area | Requirements | Fully covered |
| --- | --- | --- |
| user-management | 96 | 90 |
| access-control-kernel | 73 | 73 |
| frontend | 57 | 57 |
| mentorship | 26 | 0 |
| access-control-foundation | 6 | 6 |

## Live evidence

`live_evidence.present` is **true** for the first time: 134 results counted,
0 stale, 0 unmatched, 3 pointing at retired ids.

Producer: `local run (backend unit + frontend e2e; backend e2e absent — needs docker)`.

**Scope.** Live evidence covers the backend unit suite and the frontend Playwright suite only. The backend e2e suite needs Postgres + LocalStack and was not executed in this pass, so its requirements rest on static evidence.

## Gate — FAIL

| Criterion | Required | Actual | Status |
| --- | --- | --- | --- |
| P0 coverage | 100% | 99% | FAIL |
| P1 coverage | ≥95% (min 80%) | 81% | CONCERNS |
| Overall | ≥80% | 88% | PASS |

### Blockers


- **UM-DEP-08** (user-management / departure) — PARTIAL, TODO_ONLY

### Where the P1 deficit sits

19 P1 requirements are not fully covered. They are almost entirely
mentorship: the suites are committed red under AD-1 and there is no `src/`
module behind them yet. That is the process working, not a regression — but it
is also the whole P1 gap, so the number moves when the module lands and not
before.

## Tests

546 cases across 53 files — e2e 522, unit 13,
of which 18 are `it.todo`. Every case resolves to a requirement or is
declared in `untraceable-tests.json` (11 entries: Nest scaffold, assertions
about internals, a packaging check, fixture hygiene, and two malformed-input
cases whose oracle is a standing route-family rule rather than a numbered
scenario).

## Next

1. `UM-DEP-08` is the only thing between this gate and `CONCERNS`.
2. Run the backend e2e suite so its requirements rest on observed evidence — CI
   does this on every PR, or `./scripts/ci-local.sh` locally.
3. The mentorship module is the entire P1 deficit.
