---
stepsCompleted: ['step-01-load-context','step-02-discover-tests','step-03-map-criteria','step-04-analyze-gaps','step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-09-12'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['docs/test-cases/**', '_bmad-output/planning-artifacts/**/epics.md', 'docs/project-requirements.md', '_bmad-output/test-artifacts/test-design-epic-*.md']
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
allowGate: false
sourceSha: '1e0d51297d997cd4d0e84f5d2d511805025ee571'
tempCoverageMatrixPath: '/tmp/tea-trace-coverage-matrix-2026-09-12T23-27-03.json'
---

# Traceability Matrix — whole repository, all epics

**Planning audit. No quality gate was issued** (`gate_status: NOT_EVALUATED`). Generated
2026-09-12 against [CI run 34715886564](https://github.com/altexsoft-dmytro-novyk/workplace/actions/runs/34715886564)
— the completed, successful `Tests` run whose `head_sha` is this trace's commit.

Workspace `1e0d512` (branch `docs/plat-e3-test-design-remediation`) · backend `a25ec28` · frontend `025dd7e`.

Supersedes the 2026-09-10 matrix (`sourceSha 43d50ad`, [PR #49](https://github.com/altexsoft-dmytro-novyk/workplace/pull/49)); that version stays in git history.

## Read this first — what the commit under trace is

- **This is not `main`.** `origin/main` is `367750e` (backend `d1ef680`). The traced commit is the
  head of `docs/plat-e3-test-design-remediation`, whose backend gitlink `a25ec28`
  sits on the **unmerged** backend branch `feat/plat-e4-dev-seed-journal`. `S4.2d-DS-07` below is
  implemented and green *only* at that pin. It becomes `main` coverage when both merges land.
- **Uncommitted work was excluded.** While this trace ran, another session had uncommitted edits
  in the workspace (`docs/test-cases/user-management/access-control-adoption/{README,s41c-sag-01,umac-05}.md`,
  a new untracked `umac-11-hidden-target-denial-oracle.md`, and a dirty `services/backend` checkout
  on `fix/sec-auth-01-refuse-test-tokens-in-production`). The oracle was read with `git show HEAD:`
  and the tests from the CI reports, so none of that is in these numbers. `UMAC-11` in particular
  is **not** an oracle item yet.

## Why there is no gate verdict

`_bmad/custom/bmad-testarch-trace.toml`: a release- or demo-readiness gate traces an explicitly
declared MVP/demo target; *a whole-repository planning audit must set `allow_gate=false`*. No target
is declared, so every percentage below describes where coverage stands, never readiness.

## What changed in the oracle since 43d50ad

`git diff 43d50ad 1e0d512 -- docs/test-cases/` touches 64 files. 57 of them only add a
`U-19 normative coverage` cross-reference or drop the per-file approval line (AD-1 stage approval
was retired 2026-09-04) — no expected result changed. The other seven are the two READMEs, the
`um-list-12` Stage-2 note (now pointing at `DIRA1-MVP-v1`), and the four documents in the table. All
oracle-relevant changes:

| Change | Id | Why |
| --- | --- | --- |
| added | `S4.2d-DS-07` | New Stage-1 scenario 2026-09-12 (AF-3 declined); 3 e2e tests in s42d-ds-dev-seed-spine.e2e-spec.ts |
| reactivated | `ACF-AU-05` | Reworked 2026-09-11 from a superseded HTTP 403 to a facade exact-{colleague} oracle; no longer superseded |
| reactivated | `ACF-FC-01` | Reworked 2026-09-11 from a superseded HTTP 403 to a facade exact-{colleague} oracle; no longer superseded |
| reactivated | `ACF-FC-02` | Reworked 2026-09-11 from a superseded HTTP 403 to a facade exact-{colleague} oracle; no longer superseded |
| retired | `UMAC-10` | Doc header: SUPERSEDED 2026-09-05 by s41c-sag-04 (PLAT-E4-S4.1c). Three of four mapped tests no longer exist and the fourth entry had no title; it was counted FULL/P0 in the 09-08 and 09-10 traces |
| remapped | `MEN-FLAG-04` | Tests narrowed to the one men-flag-04 case; the men-flag-01/02/03 cases (one under a truncated title that matched nothing) belong to their own requirements |

**325 oracle ids known, 291 active, 34 retired** (09-10: 324 / 288 / 36).

Two of these correct the previous matrix rather than follow a document change:

- **`UMAC-10` was counted as a FULL P0 for a week after it was superseded.** Its header has read
  *SUPERSEDED 2026-09-05 by `s41c-sag-04`* since PLAT-E4-S4.1c; the OR-override it ratified was
  removed and its `write-adoption.e2e-spec.ts` block retired. Three of its four mapped tests no
  longer exist and the fourth had no title. It is retired here, and `s41c-sag-04` (already FULL,
  observed passing) carries the surviving assertion.
- **`MEN-FLAG-04` was mapped to all four flag tests**, one under a truncated title. Narrowed to its
  own case. Mentorship is red by design, so this moves no number.

Priorities for the four items entering the active set follow the approved test designs:
`ACF-AU-05/FC-01/FC-02` are P0 (PLAT-E2 `ACF-RW-01..03`; every ACF scenario is P0), `S4.2d-DS-07` is
P1 (PLAT-E4 `E4-C06 (7)`).

## Live evidence: fresh

The CI job **Live verification evidence** built `live-verification-results.json` at
`1e0d512` — the commit under trace. It was downloaded
(`gh run download 34715886564 --name live-verification-results`) and adopted verbatim, as on 09-10.

| Suite | Cases | Passed | Failed | Skipped/todo |
| --- | --- | --- | --- | --- |
| Backend unit | 50 | 50 | 0 | 0 |
| Backend e2e (54 suites) | 509 | 451 | 40 | 18 |
| Frontend Playwright | 124 | 124 | 0 | 0 |

683 cases seen, 637 mapped to a requirement id, 35 unmatched, 11 declared untraceable.

Dispositions against this oracle (workflow step 2 §1b / step 3 §1b): **555 counted**,
39 fail, 18 skipped, 9 contradicted (a pass beside a fail for the same
requirement), 16 unmatched (records naming retired documents whose tests still run),
0 stale, 0 invalid. No requirement is covered by live evidence alone.

## Coverage

**Static** — is a test mapped to the requirement?

|  | Total | FULL | % |
| --- | --- | --- | --- |
| **All requirements** | 291 | 260 | **89%** |
| P0 | 161 | 161 | 100% |
| P1 | 106 | 87 | 82% |
| P2 | 24 | 12 | 50% |

**Verified** — was every mapped test observed passing at `1e0d512`?

|  | Total | Verified | % |
| --- | --- | --- | --- |
| **All requirements** | 291 | 232 | **80%** |
| P0 | 161 | 146 | 91% |
| P1 | 106 | 74 | 70% |
| P2 | 24 | 12 | 50% |

09-10 for comparison: static 257/288 (P0 159/159, P1 86/105, P2 12/24); verified 228/288 (P0 143/159, P1 73/105, P2 12/24).
The +4 verified are exactly the four items entering the active set; `UMAC-10` leaving removes one
P0 that was never verified. **No existing requirement changed state** — every one of the 287 carried
forward has the same coverage and the same observation it had on 09-10, recomputed from this run's
records rather than copied.

| Area | Active | P0 | FULL | Verified |
| --- | --- | --- | --- | --- |
| access-control-foundation | 9 | 9 | 9 | 9 |
| access-control-kernel | 91 | 87 | 91 | 81 |
| frontend | 57 | 14 | 57 | 57 |
| mentorship | 26 | 0 | 0 | 0 |
| user-management | 108 | 51 | 103 | 85 |

## Gaps

### 10 P0 requirements have passing tests but no evidence record — the cause was misdiagnosed

`ACM1-FB-02`, `ACM1-FB-04`, `ACM1-FB-05`, `ACM1-FB-06`, `ACM1-FB-07`, `ACM1R-FB-10`, `ACM1R-FB-12`, `ACM1R-FB-13`, `ACM1R-FB-21`, `ACM1R-FB-22`.

The 09-10 report, repeating the 09-06 and 09-08 flags, attributed these to test titles that predate a rewrite of
`acm1r-fr-foundation.e2e-spec.ts`. **That is not the cause.** Every mapped title is present in this
run's raw Jest report, and every one passed. Each of these requirements shares its tests with
another requirement (`ACM1-FB-01`, `ACM1-FB-08`, `ACM1-FB-09`, `ACM1R-FB-20`), and
`scripts/build-live-verification-results.cjs` `loadMatrixIndex` keeps only the first requirement for
a `(file, title)` key (`if (!index.has(key))`). The shared test emits one record, under the first
owner; the others get nothing and read `not_observed`.

They stay unverified in this matrix because the evidence contract counts records, not raw reports.
Fixing the index to emit one record per mapping would move P0 verified from 146 to
156 of 161 with no test change. The same blind spot hides `MEN-PAIR-05` and
`MEN-FLAG-04`, whose tests fail anyway.

### Other P0/P1 requirements without full verified evidence

- **Red for an environment reason:** `UM-PHOTO-01`, `UM-PHOTO-02`, `UM-PHOTO-03`, `UM-PHOTO-05`, `UM-PHOTO-06`, `UM-PHOTO-07`, `UM-PHOTO-08`, `UM-PHOTO-09`, `UMAC-09` — 11 failing cases, one cause: the
  e2e job's object store is unreachable. Five raise `AWS SDK error wrapper for AggregateError`, six
  receive `503` where `200` is expected. Unchanged since 09-08.
- **Partially observed (a mapped case is `it.todo`):** `UM-CT-12`, `UM-DEP-02`, `UM-DEP-03`, `UM-DEP-04`, `UM-LIST-12`, `UM-REL-12`, `UM-REL-13`, `UM-REL-17`, `UM-SEED-13`.
- **P1 `it.todo` only:** `UM-CT-03`, `UM-CT-04`, `UM-CT-05`, `UM-CT-06`, `UM-CT-09` — blocked on the `profile:timeline:write` grant
  and the department-tree-walk increment.
- **Mentorship — 26 requirements, red by design:** 25 PARTIAL + `MEN-END-04` NONE; Stage-2 tests
  committed red under AD-1, no mentorship module under `services/backend/src`.

### Wrong-reason passes (heuristic: auth negative paths)

Green does not mean correct here. The approved PLAT-E4 test design (risk `PLAT-E4-R08`, `E4-C03b`)
names assertions that pin the **superseded** `403` for a missing or inactive target, where PM/AD-24
requires `404` before mutation checks:

- `S4.1c-SAG-01` Tests 5–6 — active, FULL, observed passing. At `1e0d512` its document still
  states `403`, so the mapping matches its oracle; the document itself is what `CONFLICT-UM-01` has
  to regenerate. (An uncommitted edit in the working tree marks it superseded by `umac-11`.)
- `UMAC-05` Test 3 — retired document, test still green; its records are among the 16 unmatched.

The `404` cases that replace them (`E4-C03b` (2)–(3), `E4-C04c`) are planned, not written. That is an
open P0 blocker under `CONFLICT-UM-01` (runtime owner `UM-E0-S0.1`), and it is invisible to a coverage
percentage.

### Retired documents whose tests still run

`MEN-END-08`, `UM-CT-01`, `UM-EDIT-03`, `UM-EDIT-04`, `UM-LIST-05`, `UM-SEED-02`, `UM-SEED-10`, `UMAC-05`
— 8 documents, 16 records (09-10: 11 documents). Down because `ACF-AU-05/FC-01/FC-02` were
reworked back into the active set.

## Not in this matrix, by design

- **`docs/test-cases` is the oracle.** Epics with no scenario footprint — `PLAT-E1` (27
  documentation obligations `plat-e1:AV-01…27`), the `ACF-*`/`E3-C*`/`E4-*` planning obligations —
  are test-design obligations, not oracle rows. Their approved plans record which are complete; this
  trace does not re-score them. `PLAT-E1`'s plan says "21 obligations" while its table defines 27 — a
  document inconsistency worth one edit.
- **ACM9 (Contract B) is a side-channel measurement, never a requirement row and never a gate.** This
  run's baseline (`acm9-baseline-acm9-1789243377361-*`, `source_revision a25ec28`) stopped
  `FAIL / absolute_breach` on a Postgres `57014` statement timeout at synthetic depth 499 — the same
  shape as 09-10. Real reporting chains are 5–10 levels. The job stays informational.
- **DIRA1 (Contract A, `PG-04`)** measurement code landed at backend `a25ec28`
  (`test/measurement/dira1/`); it has no oracle row here, and P6/ACM9 are not evidence for it.

## What to do next

1. **Fix `loadMatrixIndex` in `scripts/build-live-verification-results.cjs`** to emit a record per
   requirement for a shared test — recovers 10 P0 verifications for free. The previous
   remedy ("re-map the titles") would have changed nothing.
2. **Fix the object store (LocalStack) in the e2e job** — recovers 9 photo requirements (1 P0).
3. **Regenerate the PM/AD-24 `404` cases** under `CONFLICT-UM-01` and retire the superseded-`403`
   assertions; commit `umac-11` so it enters the oracle.
4. **Merge `feat/plat-e4-dev-seed-journal`** so `S4.2d-DS-07` is `main` coverage.
5. **Declare an MVP target** if a gate verdict is wanted; a whole-repo run cannot produce one.

## Full matrix

Per-test mappings (file, title, level), live records and dispositions are in
`_bmad-output/test-artifacts/tea-trace-coverage-matrix.json`.

<details><summary>291 active requirements</summary>

| Id | Area | Priority | Coverage | Observation | Tests | Levels |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ACF-AU-01` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-AU-02` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-AU-03` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-AU-04` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-AU-05` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit | **new** |
| `ACF-FC-01` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit | **new** |
| `ACF-FC-02` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit | **new** |
| `ACF-FC-03` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-FC-04` | access-control-foundation | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM-0` | access-control-kernel | P0 | FULL | observed_pass | 7 | e2e |  |
| `ACM1-FB-01` | access-control-kernel | P0 | FULL | observed_pass | 5 | e2e |  |
| `ACM1-FB-02` | access-control-kernel | P0 | FULL | not_observed | 1 | e2e |  |
| `ACM1-FB-03` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1-FB-04` | access-control-kernel | P0 | FULL | not_observed | 1 | e2e |  |
| `ACM1-FB-05` | access-control-kernel | P0 | FULL | not_observed | 1 | e2e |  |
| `ACM1-FB-06` | access-control-kernel | P0 | FULL | not_observed | 1 | e2e |  |
| `ACM1-FB-07` | access-control-kernel | P0 | FULL | not_observed | 1 | e2e |  |
| `ACM1-FB-08` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM1-FB-09` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM11-FPO-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM11-FPO-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM11-FPO-03` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM11-FPO-04` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM11-FPO-05` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM11-FPO-06` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM1R-FB-10` | access-control-kernel | P0 | FULL | not_observed | 2 | e2e |  |
| `ACM1R-FB-11` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM1R-FB-12` | access-control-kernel | P0 | FULL | not_observed | 3 | e2e |  |
| `ACM1R-FB-13` | access-control-kernel | P0 | FULL | not_observed | 3 | e2e |  |
| `ACM1R-FB-14` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-15` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-16` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-17` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-18` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-19` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-20` | access-control-kernel | P0 | FULL | observed_pass | 5 | e2e |  |
| `ACM1R-FB-21` | access-control-kernel | P0 | FULL | not_observed | 2 | e2e |  |
| `ACM1R-FB-22` | access-control-kernel | P0 | FULL | not_observed | 1 | e2e |  |
| `ACM1R-FB-23` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-24` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-25` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM1R-FB-26` | access-control-kernel | P0 | FULL | observed_pass | 8 | e2e |  |
| `ACM1R-FB-27` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-28` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-03` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-04` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-05` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-06` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-07` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-08` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-09` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM2-IA-10` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM3-II-01` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM3-II-02` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM3-II-03` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM3-II-04` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM3-II-05` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM3-II-06` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM3-II-07` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM3-II-08` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM3-II-09` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM3-II-10` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM3-II-11` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM3-II-12` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM3-II-13` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM3-II-14` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM4R-MA-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM4R-MA-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM4R-MA-03` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM4R-MA-04` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM4R-MA-05` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM4R-MA-06` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-03` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-04` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-05` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-06` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-07` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-08` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM5-SA-09` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM8-KC-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM8-KC-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM8-KC-03` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM8-KC-04` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM8-KC-05` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.1a-DP-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.1a-DP-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.1a-DP-03` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.2a-OP-01` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `S4.2a-OP-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.2b-TR-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.2d-DS-01` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `S4.2d-DS-02` | access-control-kernel | P1 | FULL | observed_pass | 8 | e2e |  |
| `S4.2d-DS-03` | access-control-kernel | P1 | FULL | observed_pass | 4 | e2e |  |
| `S4.2d-DS-04` | access-control-kernel | P1 | FULL | observed_pass | 2 | e2e |  |
| `S4.2d-DS-05` | access-control-kernel | P0 | FULL | observed_pass | 5 | e2e |  |
| `S4.2d-DS-07` | access-control-kernel | P1 | FULL | observed_pass | 3 | e2e | **new** |
| `FE-AUTH-01` | frontend | P0 | FULL | observed_pass | 1 | e2e |  |
| `FE-AUTH-02` | frontend | P0 | FULL | observed_pass | 3 | e2e |  |
| `FE-AUTH-03` | frontend | P0 | FULL | observed_pass | 3 | e2e |  |
| `FE-AUTH-04` | frontend | P0 | FULL | observed_pass | 3 | e2e |  |
| `FE-AUTH-05` | frontend | P0 | FULL | observed_pass | 1 | e2e |  |
| `FE-DEP-01` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-DEP-02` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-DEP-03` | frontend | P1 | FULL | observed_pass | 6 | e2e |  |
| `FE-DEP-04` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-DEP-05` | frontend | P1 | FULL | observed_pass | 5 | e2e |  |
| `FE-DEP-06` | frontend | P2 | FULL | observed_pass | 1 | e2e |  |
| `FE-DEP-07` | frontend | P0 | FULL | observed_pass | 2 | e2e |  |
| `FE-DEP-08` | frontend | P2 | FULL | observed_pass | 1 | e2e |  |
| `FE-EMP-01` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-EMP-02` | frontend | P2 | FULL | observed_pass | 1 | e2e |  |
| `FE-EMP-03` | frontend | P1 | FULL | observed_pass | 3 | e2e |  |
| `FE-EMP-04` | frontend | P2 | FULL | observed_pass | 1 | e2e |  |
| `FE-EMP-05` | frontend | P2 | FULL | observed_pass | 1 | e2e |  |
| `FE-EMP-06` | frontend | P1 | FULL | observed_pass | 3 | e2e |  |
| `FE-EMP-07` | frontend | P0 | FULL | observed_pass | 1 | e2e |  |
| `FE-IMP-01` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-IMP-02` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-IMP-03` | frontend | P2 | FULL | observed_pass | 3 | e2e |  |
| `FE-IMP-04` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-IMP-05` | frontend | P1 | FULL | observed_pass | 4 | e2e |  |
| `FE-IMP-06` | frontend | P0 | FULL | observed_pass | 1 | e2e |  |
| `FE-IMP-07` | frontend | P0 | FULL | observed_pass | 1 | e2e |  |
| `FE-IMP-08` | frontend | P2 | FULL | observed_pass | 3 | e2e |  |
| `FE-IMP-09` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-ORG-01` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-ORG-02` | frontend | P2 | FULL | observed_pass | 1 | e2e |  |
| `FE-ORG-03` | frontend | P1 | FULL | observed_pass | 5 | e2e |  |
| `FE-ORG-04` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-ORG-05` | frontend | P2 | FULL | observed_pass | 4 | e2e |  |
| `FE-ORG-06` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-ORG-07` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-ORG-08` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-ORG-09` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-ORG-10` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-ORG-11` | frontend | P1 | FULL | observed_pass | 3 | e2e |  |
| `FE-ORG-12` | frontend | P1 | FULL | observed_pass | 3 | e2e |  |
| `FE-ORG-13` | frontend | P2 | FULL | observed_pass | 6 | e2e |  |
| `FE-ORG-14` | frontend | P0 | FULL | observed_pass | 4 | e2e |  |
| `FE-ORG-15` | frontend | P0 | FULL | observed_pass | 1 | e2e |  |
| `FE-ORG-16` | frontend | P2 | FULL | observed_pass | 1 | e2e |  |
| `FE-PROF-01` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-PROF-02` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-PROF-03` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-PROF-04` | frontend | P1 | FULL | observed_pass | 4 | e2e |  |
| `FE-PROF-05` | frontend | P1 | FULL | observed_pass | 3 | e2e |  |
| `FE-PROF-06` | frontend | P1 | FULL | observed_pass | 3 | e2e |  |
| `FE-PROF-07` | frontend | P1 | FULL | observed_pass | 2 | e2e |  |
| `FE-PROF-08` | frontend | P0 | FULL | observed_pass | 4 | e2e |  |
| `FE-PROF-09` | frontend | P1 | FULL | observed_pass | 1 | e2e |  |
| `FE-PROF-10` | frontend | P2 | FULL | observed_pass | 1 | e2e |  |
| `FE-PROF-11` | frontend | P0 | FULL | observed_pass | 1 | e2e |  |
| `FE-SHELL-01` | frontend | P0 | FULL | observed_pass | 2 | e2e |  |
| `MEN-DEP-01` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-DEP-02` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-END-01` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-END-02` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-END-03` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-END-04` | mentorship | P1 | NONE | failing | 3 | e2e |  |
| `MEN-END-05` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-END-06` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-END-07` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-FLAG-01` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-FLAG-02` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-FLAG-03` | mentorship | P2 | PARTIAL | failing | 2 | e2e |  |
| `MEN-FLAG-04` | mentorship | P2 | PARTIAL | not_observed | 1 | e2e |  |
| `MEN-PAIR-01` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-PAIR-02` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-PAIR-03` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-PAIR-04` | mentorship | P1 | PARTIAL | failing | 2 | e2e |  |
| `MEN-PAIR-05` | mentorship | P1 | PARTIAL | not_observed | 1 | e2e |  |
| `MEN-POOL-01` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-POOL-02` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-POOL-03` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-01` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-02` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-03` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-04` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-05` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `S4.1c-SAG-01` | user-management | P0 | FULL | observed_pass | 6 | e2e |  |
| `S4.1c-SAG-02` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `S4.1c-SAG-03` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `S4.1c-SAG-04` | user-management | P0 | FULL | observed_pass | 5 | e2e |  |
| `S4.1c-SAG-05` | user-management | P0 | FULL | observed_pass | 4 | unit |  |
| `S4.2a-OP-03` | user-management | P0 | FULL | observed_pass | 6 | e2e |  |
| `S4.2a-OP-04` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `S4.2a-OP-05` | user-management | P0 | FULL | observed_pass | 7 | e2e |  |
| `S4.2a-OP-06` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `S4.2b-TR-02` | user-management | P0 | FULL | observed_pass | 5 | e2e |  |
| `S4.2b-TR-03` | user-management | P0 | FULL | observed_pass | 2 | e2e |  |
| `S4.2b-TR-04` | user-management | P0 | FULL | observed_pass | 6 | e2e |  |
| `S4.2d-DS-06` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `UM-AUTH-01` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-AUTH-02` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-AUTH-02b` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-AUTH-03` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-AUTH-04` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-AUTH-05` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-AUTH-06` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-CT-02` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-CT-03` | user-management | P1 | PARTIAL | skipped_only | 1 | e2e |  |
| `UM-CT-04` | user-management | P1 | PARTIAL | skipped_only | 1 | e2e |  |
| `UM-CT-05` | user-management | P1 | PARTIAL | skipped_only | 1 | e2e |  |
| `UM-CT-06` | user-management | P1 | PARTIAL | skipped_only | 1 | e2e |  |
| `UM-CT-07` | user-management | P1 | FULL | observed_pass | 4 | e2e |  |
| `UM-CT-08` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-CT-09` | user-management | P1 | PARTIAL | skipped_only | 2 | e2e |  |
| `UM-CT-10` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-CT-11` | user-management | P1 | FULL | observed_pass | 5 | e2e |  |
| `UM-CT-12` | user-management | P1 | FULL | observed_partial | 7 | e2e |  |
| `UM-CT-13` | user-management | P1 | FULL | observed_pass | 6 | e2e |  |
| `UM-DEP-01` | user-management | P0 | FULL | observed_pass | 2 | e2e |  |
| `UM-DEP-02` | user-management | P0 | FULL | observed_partial | 5 | e2e |  |
| `UM-DEP-03` | user-management | P0 | FULL | observed_partial | 5 | e2e |  |
| `UM-DEP-04` | user-management | P0 | FULL | observed_partial | 6 | e2e |  |
| `UM-DEP-05` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `UM-DEP-06` | user-management | P0 | FULL | observed_pass | 7 | e2e |  |
| `UM-DEP-07` | user-management | P0 | FULL | observed_pass | 3 | e2e |  |
| `UM-DEP-08` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `UM-EDIT-01` | user-management | P1 | FULL | observed_pass | 2 | e2e |  |
| `UM-EDIT-02` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-EDIT-05` | user-management | P1 | FULL | observed_pass | 4 | e2e |  |
| `UM-EDIT-06` | user-management | P1 | FULL | observed_pass | 5 | e2e |  |
| `UM-EDIT-07` | user-management | P1 | FULL | observed_pass | 2 | e2e |  |
| `UM-EDIT-08` | user-management | P1 | FULL | observed_pass | 5 | e2e |  |
| `UM-LIST-01` | user-management | P1 | FULL | observed_pass | 4 | e2e |  |
| `UM-LIST-02` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-LIST-03` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-LIST-04` | user-management | P1 | FULL | observed_pass | 6 | e2e |  |
| `UM-LIST-06` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-LIST-07` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-LIST-08` | user-management | P1 | FULL | observed_pass | 2 | e2e |  |
| `UM-LIST-09` | user-management | P1 | FULL | observed_pass | 4 | e2e |  |
| `UM-LIST-10` | user-management | P1 | FULL | observed_pass | 2 | e2e |  |
| `UM-LIST-11` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-LIST-12` | user-management | P1 | FULL | observed_partial | 2 | e2e |  |
| `UM-PHOTO-01` | user-management | P1 | FULL | failing | 1 | e2e |  |
| `UM-PHOTO-02` | user-management | P1 | FULL | failing | 1 | e2e |  |
| `UM-PHOTO-03` | user-management | P1 | FULL | failing | 3 | e2e |  |
| `UM-PHOTO-04` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-PHOTO-05` | user-management | P1 | FULL | failing | 2 | e2e |  |
| `UM-PHOTO-06` | user-management | P1 | FULL | failing | 6 | e2e |  |
| `UM-PHOTO-07` | user-management | P1 | FULL | failing | 1 | e2e |  |
| `UM-PHOTO-08` | user-management | P1 | FULL | failing | 2 | e2e |  |
| `UM-PHOTO-09` | user-management | P1 | FULL | failing | 2 | e2e |  |
| `UM-REL-01` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-REL-02` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-REL-03` | user-management | P1 | FULL | observed_pass | 2 | e2e |  |
| `UM-REL-07` | user-management | P1 | FULL | observed_pass | 2 | e2e |  |
| `UM-REL-08` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-REL-09` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-REL-10` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-REL-11` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-REL-12` | user-management | P1 | FULL | observed_partial | 2 | e2e |  |
| `UM-REL-13` | user-management | P1 | FULL | observed_partial | 2 | e2e |  |
| `UM-REL-14` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-REL-15` | user-management | P1 | FULL | observed_pass | 8 | e2e |  |
| `UM-REL-16` | user-management | P1 | FULL | observed_pass | 4 | e2e |  |
| `UM-REL-17` | user-management | P1 | FULL | observed_partial | 5 | e2e |  |
| `UM-REL-18` | user-management | P1 | FULL | observed_pass | 2 | e2e, unit |  |
| `UM-REL-19` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-REL-20` | user-management | P1 | FULL | observed_pass | 2 | e2e, unit |  |
| `UM-REL-21` | user-management | P0 | FULL | observed_pass | 3 | e2e, unit |  |
| `UM-REL-22` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-REL-23` | user-management | P0 | FULL | observed_pass | 4 | e2e, unit |  |
| `UM-REL-24` | user-management | P0 | FULL | observed_pass | 2 | e2e |  |
| `UM-REL-25` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-REL-26` | user-management | P1 | FULL | observed_pass | 1 | e2e |  |
| `UM-SEED-01` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-SEED-03` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-SEED-04` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-SEED-05` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-SEED-06` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-SEED-07` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-SEED-08` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UM-SEED-09` | user-management | P0 | FULL | observed_pass | 3 | e2e |  |
| `UM-SEED-11` | user-management | P0 | FULL | observed_pass | 3 | e2e |  |
| `UM-SEED-12` | user-management | P0 | FULL | observed_pass | 2 | e2e |  |
| `UM-SEED-13` | user-management | P0 | FULL | observed_partial | 2 | e2e |  |
| `UMAC-01` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UMAC-02` | user-management | P0 | FULL | observed_pass | 2 | e2e |  |
| `UMAC-03` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UMAC-04` | user-management | P0 | FULL | observed_pass | 1 | e2e |  |
| `UMAC-06` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `UMAC-07` | user-management | P0 | FULL | observed_pass | 5 | e2e |  |
| `UMAC-08` | user-management | P0 | FULL | observed_pass | 3 | e2e |  |
| `UMAC-09` | user-management | P0 | FULL | failing | 3 | e2e |  |

</details>

## Gate decision summary

```
GATE DECISION: NOT_EVALUATED

Coverage analysis (planning audit, no thresholds applied):
- P0: 161/161 FULL (100%), verified 146/161 (91%)
- P1: 87/106 FULL (82%), verified 74/106 (70%)
- Overall: 260/291 FULL (89%), verified 232/291 (80%)

Rationale: Gate decision skipped because allow_gate=false and collection_status=COLLECTED.

Live evidence: fresh (555 counted, 0 stale)
Critical gaps (P0 with NONE coverage): 0

GATE: NOT EVALUATED - collection status is COLLECTED but allow_gate=false (no declared MVP target);
machine-readable summary still emitted.
```
