---
stepsCompleted: ['step-01-load-context','step-02-discover-tests','step-03-map-criteria','step-04-analyze-gaps','step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-09-10'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['docs/test-cases/**', '_bmad-output/planning-artifacts/**/epics.md', 'docs/project-requirements.md']
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
allowGate: false
sourceSha: '43d50add983ad70a31064e94576c4a88fb06bf74'
---

# Traceability Matrix — whole repository, all epics

**Planning audit.** No quality gate was issued. Generated 2026-09-10, against
[run 34400438569](https://github.com/altexsoft-dmytro-novyk/workplace/actions/runs/34400438569)
(the completed, successful `Tests` run at `43d50ad`, the current `main` HEAD).

Workspace `43d50ad` · backend `f1eea3c` · frontend `fa3d319`.

This re-traces [the 2026-09-08 matrix](./traceability-matrix-repo-2026-09-08.md)
(`sourceSha 6f22d85`, backend `49fd0c4`, frontend `4684eb1`), which had gone
stale: both service gitlinks moved, a gitlink got briefly dangling and was
repaired, an epic-number-collision repair renumbered two epics, and
`tests.yml` was edited three times.

## Why there is no gate verdict

`_bmad/custom/bmad-testarch-trace.toml` states the rule plainly: a release- or
demo-readiness gate traces **an explicitly declared MVP/demo target**, and *"a
whole-repository planning audit must set `allow_gate=false` and must not be
presented as release readiness."*

No MVP target is declared for this run, so `allow_gate=false` and
`gate_status: NOT_EVALUATED` — exactly as on 2026-09-08. Read every percentage
below as an audit of where coverage stands, never as a readiness claim.

## The inventory did not move this time

The 09-08 amendment's whole point was that Epic 4's 30 new requirements had
changed what "coverage" meant. This run is the opposite case: **the oracle is
byte-identical to 09-08.**

- `docs/test-cases/**` and `docs/project-requirements.md` have zero diff
  between `6f22d85` and `43d50ad` (`git diff --stat 6f22d85 43d50ad --
  docs/test-cases/ docs/project-requirements.md` returns nothing).
- The only planning-artifact files that changed are bookkeeping:
  `_bmad-output/planning-artifacts/{platform,user-management,platform-capabilities,role-administration}/epics.md`,
  `global-fr-epic-story-coverage.yaml`, and `.memlog.md`.
- **324 oracle ids known, 288 active, 36 retired — same as 09-08.**

**New/renumbered requirements folded into this trace: 0.**

## What changed since 09-08 (and what it does *not* mean for this matrix)

1. **Epic-number-collision repair (2026-09-09).** Two same-domain epic-number
   collisions were resolved by renumbering the two later-authored epics:
   platform *Project-Line Audience* Epic 4 → **Epic 8**
   (`PLAT-E4-S4.1…S4.4` → `PLAT-E8-S8.1…S8.4`, sprint keys `4-n-*` → `8-n-*`);
   user-management *Custom Fields as Data* Epic 6 → **Epic 8**
   (`UM-E6-S6.1…S6.3` → `UM-E8-S8.1…S8.3`, sprint keys `6-n-*` → `8-n-*`).
   Platform Epic 4 (*Access Control Authorization Consolidation*, `done`) and
   user-management Epic 6 (*Current-State Read Endpoints*, `in-progress`) kept
   their numbers — those are the two epics this run's `S4.1a-DP-*`,
   `S4.1c-SAG-*`, `S4.2a-OP-*`, `S4.2b-TR-*`, `S4.2d-DS-*`, `ACM11-FPO-*`
   doc-driven requirement ids actually belong under, and their filenames in
   `docs/test-cases/access-control-kernel/**` never carried a `PLAT-E`/`UM-E`
   prefix. **No requirement id in this matrix needed remapping.** The
   renumbering is entirely inside `epics.md`/`global-fr-epic-story-coverage.yaml`
   bookkeeping, which this trace's oracle treats as a source for narrative
   confirmation, not as the id namespace.
2. **`PLAT-E4-S4.1`/`S4.2` flipped specified → implemented.** This is the
   *kept* platform Epic 4 (Access Control Authorization Consolidation, not the
   renumbered one). Story 4.1 ("Generalise section-access authorisation +
   human section keys") and Story 4.2 ("Default org-relationship seed +
   retire the identity-card FR override") are the narrative epics.md
   descriptions of work this matrix already measures concretely through the
   `S4.1c-SAG-*` and `S4.2b-TR-*`/`S4.2d-DS-*`/`ACM11-FPO-*` requirement
   families — all already FULL/high coverage in 09-08 and unchanged here. The
   status flip is `global-fr-epic-story-coverage.yaml` catching up to code
   that was already covered, not new coverage.
3. **Platform Stories 1.4/1.5 moved backlog → done.** Epic 1 (Platform Spec
   v1.5 Alignment) is documentation/process work with no `docs/test-cases`
   footprint; it does not appear in this oracle.
4. **Backend pin `49fd0c4` → `cb23d23` → `f1eea3c`, frontend `4684eb1` →
   `fa3d319`.** Both moves are chore-only: `git log 49fd0c4..f1eea3c` (backend)
   is an agent-context re-verification commit plus a new advisory PR
   code-review GitHub Action; `git log 4684eb1..fa3d319` (frontend) is the
   same agent-context commit. Neither touches application or test source.
5. **`tests.yml` edited three times** (Chrome apt-source drop by filename,
   reverted, then fixed to match by URI since Chrome's postinst migrated
   `google-chrome.list` to deb822 `google-chrome.sources`), plus: Node
   20 → 24 across jobs, a new **Epic/Story ID guard** job (fails the run on an
   ambiguous epic/story id — the exact defect class the epic-number-collision
   repair fixed), and **`backend-unit` and `frontend-e2e` now gate** (no
   `continue-on-error`) since both were observed green at the currently
   pinned SHAs on the promotion run. `backend-e2e` and the ACM9 NFR job stay
   `continue-on-error: true` / informational — unchanged, and per team policy
   ACM9 must never gate (real reporting chains are 5–10 levels deep; ACM9
   stresses synthetic chains up to depth 499).
6. **CI now produces its own live-verification-results.json and readiness
   map** (jobs "Live verification evidence" and "Workspace · readiness map
   (unit tests)", both new since 09-08). This run adopted CI's own
   `live-verification-results` artifact from run 34400438569 as-is instead of
   rebuilding it locally.

## Live evidence: fresh, and identical to 09-08's

`build-live-verification-results.cjs` ran inside CI run 34400438569 itself
(job **Live verification evidence**) and uploaded
`live-verification-results.json` as a build artifact, already carrying
`source_sha: 43d50add983ad70a31064e94576c4a88fb06bf74` — the exact commit
under trace. That file was downloaded (`gh run download 34400438569 --name
live-verification-results`) and adopted verbatim as
`_bmad-output/test-artifacts/live-verification-results.json`, so **live
evidence mode was achieved — no `contract_static` fallback was needed.**

Diffing all 634 records against the 09-08 evidence set field-by-field (`id`,
`requirement_id`, `title`, `status`, `evidence`) found **zero differences.**
That is the expected fingerprint of a chore-only pin move (see point 4 above),
not a stale rerun: it is a fresh observation at the new commit that happens to
reproduce the old one exactly, because nothing test-relevant changed underneath
it.

| Suite | Cases | Passed | Failed | Skipped |
| --- | --- | --- | --- | --- |
| Backend unit | 50 | 50 | 0 | 0 |
| Backend e2e (54 suites) | 506 | 448 | 40 | 18 |
| Frontend Playwright | 124 | 124 | 0 | 0 |

680 cases seen, 634 mapped to a requirement, 35 unmatched, 11 deliberately
untraceable — same as 09-08.

## Coverage

Two numbers, because they answer different questions.

**Static coverage** — does a test exist that maps to this requirement?

| | Total | FULL | % |
| --- | --- | --- | --- |
| **All requirements** | 288 | 257 | **89%** |
| P0 | 159 | 159 | **100%** |
| P1 | 105 | 86 | 82% |
| P2 | 24 | 12 | 50% |

**Verified** — and did that test actually pass in this run?

| | Total | Verified | % |
| --- | --- | --- | --- |
| **All requirements** | 288 | 228 | **79%** |
| P0 | 159 | 143 | **90%** |
| P1 | 105 | 73 | 70% |
| P2 | 24 | 12 | 50% |

These are the identical figures published on 2026-09-08. That is the correct
outcome, not a stale copy: the oracle did not move (above) and the live
evidence is a fresh, exact reproduction of the 09-08 evidence (above). Every
gap named in the 09-08 report is therefore still open, unchanged, and is not
repeated wholesale here — see the delta section below for what is genuinely
new.

## What is genuinely new this run

### ACM9 got worse in kind, not just in degree — still non-gating

The 09-08 report described a soft 0.3% p95 budget overrun at depth 400. This
run's ACM9 measurement (`report-backend-acm9` artifact,
`acm9-baseline-acm9-1788985355956-*.json`, `source_revision: f1eea3c`,
`workspace_revision: 43d50ad` — confirmed to be this run's own measurement)
recorded:

```
status: FAIL
stop_reason: absolute_breach
first_breach: { gate: reporting, shape: acyclic-chain, depth: 499,
  reason: statement_timeout,
  error_class: PrismaClientKnownRequestError,
  error_message: "canceling statement due to statement timeout" (Postgres 57014) }
```

The baseline stage stopped on a hard Postgres statement-timeout error at the
maximum synthetic depth (499) rather than a soft p95-over-budget reading, so
no "final" measurement ran this time. The realistic-depth reading is
unaffected and still healthy: the `balanced-depth-5` gate in the same run
sampled 14.5–20.9 ms, consistent with the team's own read that real reporting
chains are 5–10 levels deep, where this gate costs single-digit-to-low-teens
milliseconds. This is a harder failure mode of the same known, accepted,
depth-scaling limitation — worth a follow-up to confirm the timeout threshold
and query plan at extreme synthetic depth — but it changes nothing about
gating: the job is `continue-on-error: true` and stays that way by design,
and ACM9 has no requirement row in this matrix (it is a side-channel NFR
measurement, never part of P0/P1/P2 coverage).

### CI hygiene, not coverage

The Epic/Story ID guard, backend-unit/frontend-e2e gating, and Node 24 upgrade
(point 5 above) are pipeline-maturity improvements with no coverage-matrix
effect this run — none of them changed a test outcome (see the zero-diff
evidence comparison above).

## The green checkmarks still overstate the run — same trap as 09-08

`backend-e2e (informational)` and `Backend · ACM9 (informational)` both
report ✅ on run 34400438569 because both carry `continue-on-error: true`.
Underneath: backend-e2e ran 41 cases red (LocalStack S3 photo path, same as
09-08) and ACM9 broke at depth 499 as above. This is the documented, accepted
shape of these two jobs, not a new discovery — repeated here only so the ✅
line in the Actions UI is not mistaken for "all green."

### 9 requirements are red for environment reasons, not product reasons

`UM-PHOTO-01, -02, -03, -05, -06, -07, -08, -09` (P1) and **`UMAC-09` (P0)**
still fail with `AWS SDK error wrapper for AggregateError` — the S3-backed
photo upload path with no healthy LocalStack behind it. Unchanged since
09-08; static coverage stands.

## 16 P0 requirements have no fresh passing evidence — unchanged

P0 static coverage is 100%, but only 143 of 159 were observed green, for the
same reasons as 09-08:

- **11 mapping gaps** (`ACM1-FB-02, -04, -05, -06, -07`, `ACM1R-FB-10, -12,
  -13, -21, -22`, `UMAC-10`) — `acm1r-fr-foundation.e2e-spec.ts` still runs
  39/39 green, and the matrix's titles still predate the suite's rewrite in
  `49fd0c4`. That commit is still the ancestor of the current backend pin
  `f1eea3c` (the intervening commits are chore-only — see point 4 above), so
  the exact `(file, title)` lookup still misses. **Flagged 2026-09-06, open
  2026-09-08, open now.**
- **1 failing:** `UMAC-09` (LocalStack).
- **4 partially observed:** `UM-DEP-02, -03, -04`, `UM-SEED-13`.

## P1 gaps that are not mentorship — unchanged

`UM-CT-03, -04, -05, -06, -09` still run only as `it.todo`, blocked on the
`profile:timeline:write` grant and the department-tree-walk increment.

## Mentorship — 24 requirements red by design — unchanged

All 26 mentorship requirements remain uncovered; 24 observed failing with the
same `404` signature (no mentorship module under `services/backend/src`).
Stage-2 tests committed red on purpose under AD-1.

## 11 retired requirements still have live tests — unchanged

`ACF-AU-05`, `ACF-FC-01`, `ACF-FC-02`, `MEN-END-08`, `UM-CT-01`, `UM-EDIT-03`,
`UM-EDIT-04`, `UM-LIST-05`, `UM-SEED-02`, `UM-SEED-10`, `UMAC-05` — same list
as 09-08; still worth one pass to decide whether the retirement or the tests
are stale.

## What to do next

1. **Re-map the ten `ACM1*` requirements plus `UMAC-10`** against the current
   titles in `acm1r-fr-foundation.e2e-spec.ts` — recovers 11 P0 requirements'
   evidence for free, and has now survived two pin moves unfixed.
2. **Fix the LocalStack health check** in the e2e job, then re-run — recovers
   9 more (1 of them P0).
3. **Confirm the ACM9 depth-499 statement-timeout** is the same known
   depth-scaling limitation and not a new regression from the Node 24 bump or
   a Postgres version change in the runner image — the failure mode changed
   from a soft budget overrun to a hard query timeout, which is worth one
   verification pass even though it does not gate.
4. **Declare an MVP target** if a real gate verdict is wanted; under the
   current policy a whole-repo run can never produce one.
