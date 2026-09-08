---
stepsCompleted: ['step-01-load-context','step-02-discover-tests','step-03-map-criteria','step-04-analyze-gaps','step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-09-08'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['docs/test-cases/**', '_bmad-output/planning-artifacts/**/epics.md', 'docs/project-requirements.md']
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
allowGate: false
sourceSha: '6f22d85bf222fc0d216d1dd85c472202362e94da'
---

# Traceability Matrix — whole repository, all epics

**Planning audit.** No quality gate was issued. Generated 2026-09-08, amended
against [run 34222307987](https://github.com/altexsoft-dmytro-novyk/workplace/actions/runs/34222307987)
(push to `main` at `6f22d85`, the merge of this matrix).

Workspace `6f22d85` · backend `49fd0c4` · frontend `4684eb1`.

> **Amended.** The first cut of this matrix wrote `tests[]` as `{file, level}`
> with no `title`. `build-live-verification-results.cjs` indexes on
> `(file, title)` and skips any entry without a title, so the exact lookup
> collapsed from 496 matched cases to 3 and 17 cases fell back to unmatched.
> Titles are restored; the mapping is back to 612 via the matrix index.

## Why there is no gate verdict

`_bmad/custom/bmad-testarch-trace.toml` (committed in `c7b717d`) states the rule
plainly: a release- or demo-readiness gate traces **an explicitly declared
MVP/demo target**, and *"a whole-repository planning audit must set
`allow_gate=false` and must not be presented as release readiness."*

No MVP target was declared for this run, so `allow_gate=false` and
`gate_status: NOT_EVALUATED`.

This is the first run to honour that policy. The 2026-09-06 run published a
whole-repo **CONCERNS** verdict; under the policy now in force it would not have
been permitted to publish one at all. Read the percentages below as an audit of
where coverage stands, never as a readiness claim.

## The inventory moved — the previous 88% is not comparable

Epic 4 (sections access) landed between the two runs and brought **30 new
requirements** into `docs/test-cases/**`:

| Family | New | What it covers |
| --- | --- | --- |
| `S4.2a-OP-01…06` | 6 | Production bootstrap operator set, delegated HR Admin reach |
| `ACM11-FPO-01…06` | 6 | Full-profile-access overlay (§2.4) |
| `S4.2d-DS-01…06` | 6 | Dev org-spine seeding, `create:root` repoint |
| `S4.1c-SAG-01…05` | 5 | `GET/PATCH /users/:id` section-access gate |
| `S4.2b-TR-01…04` | 4 | Root's tree position and reporting resolution |
| `S4.1a-DP-01…03` | 3 | `DEFAULT_PERMISSIONS` baseline in `isAllowed` |

The oracle now knows **324 ids**; 36 are retired, leaving **288 active
requirements** against the 258 the last matrix measured. The previous **88%** was
computed over an inventory that no longer describes the product.

## Coverage

Two numbers, because they answer different questions.

**Static coverage** — does a test exist that maps to this requirement?

| | Total | FULL | % |
| --- | --- | --- | --- |
| **All requirements** | 288 | 257 | **89%** |
| P0 | 159 | 159 | **100%** |
| P1 | 105 | 86 | 82% |
| P2 | 24 | 12 | 50% |

**Verified** — and did that test actually pass in this run? This is the number
the team's 100% policy is written against.

| | Total | Verified | % |
| --- | --- | --- | --- |
| **All requirements** | 288 | 228 | **79%** |
| P0 | 159 | 143 | **90%** |
| P1 | 105 | 73 | 70% |
| P2 | 24 | 12 | 50% |

By area:

| Area | Requirements | FULL | Verified | Observed failing |
| --- | --- | --- | --- | --- |
| user-management | 109 | 104 | 86 | 9 |
| access-control-kernel | 90 | 90 | 79 | 0 |
| frontend | 57 | 57 | 57 | 0 |
| mentorship | 26 | 0 | 0 | 24 |
| access-control-foundation | 6 | 6 | 6 | 0 |

Live observation across all 288: 228 observed passing, 33 failing, 13 not
observed, 9 partially observed, 5 with only `todo` cases.

What actually ran, from the three uploaded reports:

| Suite | Cases | Passed | Failed | Todo |
| --- | --- | --- | --- | --- |
| Backend unit | 50 | 50 | 0 | 0 |
| Backend e2e (54 suites) | 506 | 448 | 40 | 18 |
| Frontend Playwright | 124 | 124 | 0 | 0 |

680 cases seen, 634 mapped to a requirement, 35 unmatched, 11 deliberately
untraceable (framework scaffolding, packaging and test-hygiene assertions).

## The green checkmarks overstate the run

All eight jobs report ✅, but three steps exited 1 under `continue-on-error`, and
GitHub reports a soft step's conclusion as `success` — exactly the trap
`tests.yml:80-82` warns about. What actually happened:

| Job | Reported | Actually |
| --- | --- | --- |
| Backend · e2e | ✅ | compose step exited 1 — `container backend-localstack-1 is unhealthy`; suite then ran 41 red |
| Backend · ACM9 | ✅ | measurement exited 1 — budget breach (below) |
| Frontend · Playwright | ✅ | 124/124 green; the red was the soft `Lint` step (unused vars in `departures.pact.spec.ts`) |

A side effect worth fixing: because the soft steps keep the job's status out of
`failure`, the `Container logs on failure` step is **skipped**, so the one step
that would explain why LocalStack was unhealthy never runs.

### 9 requirements are red for environment reasons, not product reasons

`UM-PHOTO-01, -02, -03, -05, -06, -07, -08, -09` (P1) and **`UMAC-09` (P0)** all
fail with `AWS SDK error wrapper for AggregateError` — the S3-backed photo
upload path with no LocalStack behind it. The code is unchanged and these were
green on the 2026-09-06 sweep. Static coverage stands; there is simply no fresh
passing evidence. Re-run once LocalStack is healthy.

### `ACM-0` — flake, confirmed

`converges concurrent seeds after a users_workEmail_key insert race` hit the
Jest 5000 ms per-case timeout in run 34218105827 and **passed in run
34222307987** on the same code. Runner speed, not a defect.

## 16 P0 requirements have no fresh passing evidence

P0 static coverage is 100%, but only 143 of 159 were observed green:

**11 are mapping gaps, not coverage gaps** — the suite ran green, but the
producer could not resolve the case to the requirement:

- `ACM1-FB-02, -04, -05, -06, -07`, `ACM1R-FB-10, -12, -13, -21, -22` —
  `acm1r-fr-foundation.e2e-spec.ts`, 39/39 green. The matrix does carry titles
  for these, but they predate the suite's rewrite in `49fd0c4`, so the exact
  `(file, title)` lookup misses. Re-mapping against the current titles closes
  all ten. **Flagged on 2026-09-06 and still open.**
- `UMAC-10` — `s41c-section-access-gate.e2e-spec.ts`.

`S4.1a-DP-01, -02, -03` were in this list and are now closed: the three cases in
`s41a-default-permissions-baseline.e2e-spec.ts` correspond one-to-one with the
three docs, and that mapping is now in the matrix.

**1 failing:** `UMAC-09` (LocalStack).

**4 partially observed:** `UM-DEP-02, -03, -04`, `UM-SEED-13`.

## P1 gaps that are not mentorship

Five career-timeline requirements still run only as `it.todo` — `UM-CT-03, -04,
-05, -06, -09` — blocked on the `profile:timeline:write` grant and the
department-tree-walk increment. Unchanged since 2026-09-06.

## Mentorship — 24 requirements red by design

All 26 mentorship requirements remain uncovered; 24 are observed failing with
the same `404` signature, because no mentorship module exists in
`services/backend/src`. These are Stage-2 tests committed red on purpose under
AD-1. Not regressions, not counted as coverage. `MEN-FLAG-04` and `MEN-PAIR-05`
have no live record at all.

## ACM9 performance NFR — breached, informational by design

`first_breach: acyclic-chain, depth 400, p95 2005.9 ms` against a 2000 ms
budget — 0.3% over, on the deep-chain shape only. Real reporting chains are
5–10 levels, where the same gate costs 9–12 ms. The job is
`continue-on-error` for exactly this reason and should stay that way; the fix is
to narrow the protocol's depth sequence, which is a new protocol version, not a
tweak.

## What to do next

1. **Re-map the ten `ACM1*` requirements** against the current titles in
   `acm1r-fr-foundation.e2e-spec.ts`, and map `UMAC-10` — recovers 11 P0
   requirements' evidence for free. Putting the id in the case title would make
   these self-healing across future rewrites.
2. **Fix the LocalStack health check** in the e2e job, then re-run — recovers 9
   more (1 of them P0).
3. **Make `Container logs on failure` run** when a soft step fails
   (`if: always()`), or the next LocalStack failure is just as opaque.
4. **Declare an MVP target** if a real gate verdict is wanted; under the current
   policy a whole-repo run can never produce one.
