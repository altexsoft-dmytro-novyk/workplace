---
stepsCompleted: ['step-01-load-context','step-02-discover-tests','step-03-map-criteria','step-04-analyze-gaps','step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-09-14'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['docs/test-cases/**', '_bmad-output/planning-artifacts/**/epics.md', 'docs/project-requirements.md', '_bmad-output/test-artifacts/test-design-epic-*.md']
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
allowGate: false
sourceSha: '33230f27768915b03059e34404f4adefba030071'
tempCoverageMatrixPath: '/tmp/tea-trace-coverage-matrix-2026-09-14T10-02-48.json'
---

# Traceability Matrix — whole repository, all epics

**Planning audit. No quality gate was issued** (`gate_status: NOT_EVALUATED`). Generated
2026-09-14 against [CI run 34750097766](https://github.com/altexsoft-dmytro-novyk/workplace/actions/runs/34750097766)
— the completed, successful `Tests` run whose `head_sha` is this trace's commit.

Workspace `33230f2` (branch `docs/plat-e3-test-design-remediation`) · backend `28343b5`
(`feat/plat-e4-dev-seed-journal`) · frontend `025dd7e` (unchanged from the prior trace).

Supersedes the 2026-09-13 matrix (sourceSha `827877e`, CI run 34728869039); that version stays in
git history.

## Read this first — what the commit under trace is

- **This is not `main`.** It is the current head of `docs/plat-e3-test-design-remediation` at the
  time evidence was collected; no merge to `main` is required for this trace. Only committed
  content is traced: `git show 33230f2:<path>` and the `827877e..33230f2` / backend
  `7ab095a..28343b5` diffs, not the live working tree.
- **The branch has since advanced two commits past 33230f2** (`a66b361` unrelated skills
  refactor; `e8681c9`, which committed this same `live-verification-results.json` verbatim — its
  content is unchanged). Neither touches `docs/test-cases/`, `test-design-epic-*`, or either
  service gitlink, so they do not affect this trace.
- **A concurrent session has uncommitted edits** in `docs/test-cases/access-control-foundation/audience/acf-au-01-self.md`,
  `docs/test-cases/access-control-kernel/multi-audience/acm4r-ma-02-self-exclusive-after-confirmation.md`,
  and several `test-design-epic-platform-2`/`test-design-qa`/`test-design-progress`/`test-design/README`
  files — not committed, not acted on here. The two doc edits inspected are U-19 normative-coverage
  cross-reference annotations only (registering `ACF-AU-01` as primary evidence for a new `TR-3.2-SELF`
  row); no requirement id, test, expected result, or priority changes. Excluded from this trace like
  the previous one excluded other uncommitted sessions — noted, not traced.

## What changed in this refresh

- **Fixed:** `scripts/build-live-verification-results.cjs` `loadMatrixIndex` no longer drops a
  requirement that shares a `(file, title)` test with another requirement (commit `087dabb`).
  `ACM1-FB-02/04/05/06/07` and `ACM1R-FB-10/12/13/21/22` — 10 P0 requirements flagged as a "producer
  blind spot" in the last three traces — now carry their own `observed_pass` record. **Verified**
  immediately below confirms this: P0 verified jumped from 147/162 to 158/163 with no test or
  requirement change on those ten.
- **Same fix, attribution only:** `MEN-PAIR-05` and `MEN-FLAG-04` now also get their own record —
  a `fail`, from the same already-failing shared test previously visible only under `MEN-PAIR-04` /
  `MEN-FLAG-03`. This is not a new failure; mentorship stays red by design under AD-1 either way, and
  no coverage or gate math moves.
- **PLAT-E2 (`ACF-*`), 2026-09-13:** `ACF-AU-01..04` reworked to assert the facade's exact audience
  set as the primary oracle (`ACF-AU-R1`), keeping the old `200` check as separately labelled
  UM-owned route evidence. `ACF-FC-04` reworked the same way (`ACF-RW-04`); its test file and title
  are unchanged. **`ACF-FC-05` added** (P1, `R-PLAT2-04`): a deactivated target or viewer resolves to
  an empty audience set, never the Colleague floor.
- **PLAT-E4, 2026-09-13:** **`E4-AV01` added** (P0) — the static-source half of "no root/FR special
  case," closing Epic 4.1's acceptance rows 4.1-4/4.2-1 (`legacy-gate-absence.spec.ts`, 5 tests).
  **`S4.2d-DS-08` added** (P1) — the dev seed's absence from both deploy entrypoints, automating
  `E4-C06` obligation (6) (`dev-seed-absence.spec.ts`, 5 tests). `S4.2a-OP-04` gained Tests 4-6
  (root's own card; missing/inactive target → `404` not `403`). **`S4.2a-OP-05`/`S4.2a-OP-06` moved**
  out of `s42a-op-root-operator-set.e2e-spec.ts` into a new file,
  `s42a-op-05-delegated-hr-admin.e2e-spec.ts` (shared fixtures extracted to
  `s42a-op-root-operator-set.fixtures.ts`); `S4.2a-OP-05` also gained Tests 6-18, closing E4-C04b's
  nine previously-untested FR-gated routes plus the missing/inactive-target pair (Test 18 is
  structural-only, not a live HTTP call). `S4.2d-DS-06` gained Test 5 (root's own card, dev-spine
  mirror). `UMAC-07` gained Test 6 (deactivated caller → `401`).
- **Confirmed, not changed:** backend `28343b5` still includes `a25ec28` (dev-seed journal);
  `S4.2d-DS-07`'s 3 tests remain mapped and observed passing, exactly as in the 827877e trace.
- **PLAT-E2 and PLAT-E4 test-design plans re-validated PASS on 2026-09-13**
  (`test-design-validation-report-epic-platform-{2,4}.md`).

### Correction (post-publish, 2026-09-14): a join bug hid `S4.2d-DS-07`'s own evidence, and was wider than that one id

A first pass of this refresh carried forward `live_cases`/`live_observation` unchanged for every
requirement whose `tests[]` list I did not personally edit, instead of recomputing all 295 against
`live-verification-results.json` at `33230f2`. That file's own record ids shift between CI runs (new
tests inserted earlier in suite order renumber everything after them), so untouched requirements were
left pointing at stale `repo-LIVE-*` ids from the 827877e evidence file — usually still the right
verdict by coincidence (the underlying test didn't change), but wrong evidence, and in a few cases a
wrong verdict outright. `S4.2d-DS-07` was the flagrant case: it kept the 827877e trace's placeholder
`not_observed`/`[]` although its 3 tests carry their own `requirement_id: "S4.2d-DS-07"` `pass`
records this run.

**Fix:** every requirement was recomputed from scratch against the `33230f2` evidence file. For each
of a requirement's own `tests[]` entries, match live records by `(file, title)`; if the title is
shared with sibling requirements (the `loadMatrixIndex` fix's own case — one test, several owners,
each with its own record), keep only the record whose `requirement_id` equals *this* requirement,
never a sibling's. An earlier attempt at this fix unioned a plain `requirement_id` match with a plain
`(file, title)` match, which over-counted: for a shared test, `(file, title)` alone pulls in every
sibling's record too (`ACM1-FB-01`'s one shared test briefly read as 10 live cases instead of 5). The
corrected join is exact-id-first, `(file, title)`-only as a single-candidate fallback (needed for
tests whose `requirement_id` in the raw evidence is an off-canonical fallback id — `E4-AV01` Test 3
is tagged `S42D-DS-05`, the new `S4.2a-OP-04/05` tests are tagged `S42A-OP-04`/`S42A-OP-05` with no
dot — because CI built this evidence file against the matrix as it stood *before* this refresh).

**Corrected:** `S4.2d-DS-07` (`not_observed` → `observed_pass`, its 3 own records). Four more
requirements' evidence had drifted past a simple re-check into a real verdict change once matched
against fresh, correctly-owned records rather than stale ones: `UM-PHOTO-03`, `UM-PHOTO-06`,
`UM-PHOTO-08`, `UM-PHOTO-09`, and `UMAC-09` move from `observed_partial` to `failing` — each already
had a failing photo-upload case this run; the stale reference had been masking it as a skip-shaped
partial. Every other requirement's `live_cases` array was refreshed to the current run's record ids
(same verdict, correct evidence) with no verdict change. Net: **verified moves from 245 to 246** of
295 (P1 verified 75→76, 69%→70%); `live_observation_breakdown` no longer carries any `not_observed`
entry (0 of 295, down from 1). The corrected numbers replace the ones this section originally
reported; see Coverage below.

## Why there is no gate verdict

`_bmad/custom/bmad-testarch-trace.toml`: a release- or demo-readiness gate traces an explicitly
declared MVP/demo target; *a whole-repository planning audit must set `allow_gate=false`*. No target
is declared, so every percentage below describes where coverage stands, never readiness.

## Live evidence: fresh

The CI job **Live verification evidence** built `live-verification-results.json` at `33230f2` — the
commit under trace. It was downloaded from
[CI run 34750097766](https://github.com/altexsoft-dmytro-novyk/workplace/actions/runs/34750097766)
and adopted verbatim (`source_sha` in the file matches; `run_summary.matrix_used` names
`_bmad-output/test-artifacts/tea-trace-coverage-matrix.json`, the same fixed path this trace writes
— consistent, per the `on_complete` hook's instruction).

**697 records: 637 passed, 42 failed, 18 skipped** (`oracle_ids_known: 329`, matching this trace's
295 active + 34 retired requirement ids exactly; `mapped_via`: 609 by matrix, 70 by title fallback —
the title-fallback share is high because the checked-in matrix CI built against still carried the
827877e mapping; this refresh's matrix update is what retires that fallback next run).

## Coverage

**Static** — is a test mapped to the requirement?

|  | Total | FULL | % |
| --- | --- | --- | --- |
| **All requirements** | 295 | 264 | **89%** |
| P0 | 163 | 163 | 100% |
| P1 | 108 | 89 | 82% |
| P2 | 24 | 12 | 50% |

**Verified** — was every mapped test observed passing at `33230f2`?

|  | Total | Verified | % |
| --- | --- | --- | --- |
| **All requirements** | 295 | 246 | **83%** |
| P0 | 163 | 158 | 97% |
| P1 | 108 | 76 | 70% |
| P2 | 24 | 12 | 50% |

827877e for comparison (recomputed from that trace's own committed matrix, not its prose summary,
which had drifted by a handful of counts): static 292/261 (P0 162/162, P1 106/87, P2 24/12); verified
232/292 (P0 162/147=91%, P1 106/73=69%, P2 24/12=50%).

The **+3 total/FULL** are the three new requirements (`ACF-FC-05`, `E4-AV01`, `S4.2d-DS-08`, all
observed passing). The **+14 P0 verified** (147→158, +11) and the P1/overall movement are the ten
`ACM1-FB`/`ACM1R-FB` blind-spot recoveries, `E4-AV01`, `S4.2d-DS-07` (see Correction above), and the
two new P1s. **No existing requirement lost coverage.** Five carried-forward requirements did lose
*verification* on re-check against correctly-owned evidence — `UM-PHOTO-03/06/08/09`, `UMAC-09`, all
in the "environment reason" gap group below, already known red — not a new regression, a corrected
read of evidence that was already failing.

| Area | Active | P0 | FULL | Verified |
| --- | --- | --- | --- | --- |
| access-control-foundation | 10 | 9 | 10 | 10 |
| access-control-kernel | 93 | 88 | 93 | 92 |
| frontend | 57 | 14 | 57 | 57 |
| mentorship | 26 | 0 | 0 | 0 |
| user-management | 109 | 52 | 104 | 86 |

## Gaps

### P0/P1 requirements without full verified evidence

- **Red for an environment reason:** `UM-PHOTO-01/02/03/05/06/07/08/09`, `UMAC-09` — the e2e job's
  object store is unreachable. Unchanged since 09-08; none of this refresh's backend changes touch
  photo storage.
- **Partially observed (a mapped case is `it.todo`):** `UM-CT-12`, `UM-DEP-02/03/04`, `UM-LIST-12`,
  `UM-REL-12/13/17`, `UM-SEED-13`.
- **P1 `it.todo` only:** `UM-CT-03/04/05/06/09` — blocked on the `profile:timeline:write` grant and
  the department-tree-walk increment.
- **Mentorship — 26 requirements, red by design:** 25 PARTIAL + `MEN-END-04` NONE; Stage-2 tests
  committed red under AD-1, no mentorship module under `services/backend/src`.
- **Evidenced only on unmerged backend branches:** `S4.2d-DS-07` (journal — `observed_pass`, its 3
  tests all pass, per the Correction above; `feat/plat-e4-dev-seed-journal` is the branch this
  trace's backend gitlink `28343b5` already sits on) and the PM/AD-24 404 oracle
  underlying `UMAC-07` Test 6 / `S4.2a-OP-04` Tests 5-6 / `S4.2a-OP-05` Tests 6-7 / `UMAC-11`
  (`feat/conflict-um-01-hidden-target-404`, commit `89ea674`+, verified 2026-09-13 not yet an
  ancestor of `services/backend` `main`). All pass in this trace's evidence because the trace is
  pinned to `28343b5`; none of this is `main` coverage yet.

### Not in this matrix, by design

- **`docs/test-cases` is the oracle.** Epics with no scenario footprint — `PLAT-E1` (27
  documentation obligations `plat-e1:AV-01…27`), `E4-C02`'s static `S<n>`-token audit (evidenced by
  `legacy-gate-absence.spec.ts`'s `E4-C02` describe block, 2 tests, but with no
  `docs/test-cases` scenario document of its own — unlike its sibling `E4-AV01`, which graduated
  into this matrix this refresh because it now has one) — are test-design obligations, not oracle
  rows. Their approved plans record which are complete; this trace does not re-score them.
- **ACM9 (Contract B) is a side-channel measurement, never a requirement row and never a gate.**
  Real reporting chains are 5–10 levels; the job stays informational (unchanged policy).
- **DIRA1 (Contract A, `PG-04`)** measurement code has no oracle row here, and P6/ACM9 are not
  evidence for it.

## Anomalies observed this refresh

- **The 827877e report's prose summary had drifted from its own committed JSON.** The prior
  `traceability-matrix.md` text states P0 verified 147/**161** and P1 verified 74/106 (80%
  overall); the JSON it shipped alongside (`tea-trace-coverage-matrix.json` at that sha) computes
  to P0 162 total/147 verified (91%), P1 106 total/73 verified (69%), overall 292/232 (79%), and its
  own top-level `live_observation_breakdown` field (233/12/33/5/9) does not match a fresh count over
  its own `requirements` array (232/13/28/14/5) either. This trace's numbers above are freshly
  computed from the requirements array in both the old and new matrix (never from either report's
  prose or stored summary field), so the comparison is apples-to-apples; the drift is noted, not
  corrected retroactively.
- **`E4-AV01`'s own Test 3** (`legacy-gate-absence.spec.ts`, "mirrors s42d-ds-05 Test 1") was
  attributed by CI's title-fallback heuristic to `S42D-DS-05` (an off-canonical id, no dot) rather
  than `E4-AV01`, because the checked-in matrix CI built against predates this scenario. This trace
  maps it to `E4-AV01` on the strength of that scenario's own doc, which lists it as `E4-AV01`'s own
  Test 3 — the correct attribution once this matrix is the one CI reads next run.
- **`S4.2a-OP-04`'s Tests 4-6 and `S4.2a-OP-05`'s Tests 6-18** likewise arrived in the live evidence
  under off-canonical fallback ids (`S42A-OP-04`, `S42A-OP-05`, no dot) rather than this trace's
  canonical `S4.2a-OP-0X` ids, for the same reason (file move + new tests, stale matrix at CI time).
  Mapped here by exact (file, title) match against each scenario document.

## What to do next

1. **Re-run CI's Live verification evidence job against this updated matrix** so the 70
   title-fallback mappings (mostly the items above) resolve via the matrix directly next time.
2. **Fix the object store (LocalStack) in the e2e job** — recovers 9 photo requirements (1 P0).
3. **Merge `feat/plat-e4-dev-seed-journal` and `feat/conflict-um-01-hidden-target-404`** to
   `services/backend` `main` — both are evidenced only on unmerged branches; `S4.2d-DS-07`,
   `UMAC-07` Test 6, `S4.2a-OP-04` Tests 5-6, `S4.2a-OP-05` Tests 6-7, and `UMAC-11` are not yet
   `main` coverage.
4. **Declare an MVP target** if a gate verdict is wanted; a whole-repo run cannot produce one.

## Full matrix

Per-test mappings (file, title, level), live records and dispositions are in
`_bmad-output/test-artifacts/tea-trace-coverage-matrix.json`.

<details><summary>295 active requirements</summary>

| Id | Area | Priority | Coverage | Observation | Tests | Levels |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ACF-AU-01` | access-control-foundation | P0 | FULL | observed_pass | 3 | e2e, unit | **updated** |
| `ACF-AU-02` | access-control-foundation | P0 | FULL | observed_pass | 3 | e2e, unit | **updated** |
| `ACF-AU-03` | access-control-foundation | P0 | FULL | observed_pass | 3 | e2e, unit | **updated** |
| `ACF-AU-04` | access-control-foundation | P0 | FULL | observed_pass | 3 | e2e, unit | **updated** |
| `ACF-AU-05` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-FC-01` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-FC-02` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-FC-03` | access-control-foundation | P0 | FULL | observed_pass | 2 | e2e, unit |  |
| `ACF-FC-04` | access-control-foundation | P0 | FULL | observed_pass | 1 | e2e | **updated** |
| `ACF-FC-05` | access-control-foundation | P1 | FULL | observed_pass | 2 | e2e | **new** |
| `ACM-0` | access-control-kernel | P0 | FULL | observed_pass | 7 | e2e |  |
| `ACM1-FB-01` | access-control-kernel | P0 | FULL | observed_pass | 5 | e2e |  |
| `ACM1-FB-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e | **updated** |
| `ACM1-FB-03` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1-FB-04` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e | **updated** |
| `ACM1-FB-05` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e | **updated** |
| `ACM1-FB-06` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e | **updated** |
| `ACM1-FB-07` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e | **updated** |
| `ACM1-FB-08` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM1-FB-09` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM11-FPO-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM11-FPO-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM11-FPO-03` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM11-FPO-04` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM11-FPO-05` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e |  |
| `ACM11-FPO-06` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM1R-FB-10` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e | **updated** |
| `ACM1R-FB-11` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `ACM1R-FB-12` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e | **updated** |
| `ACM1R-FB-13` | access-control-kernel | P0 | FULL | observed_pass | 3 | e2e | **updated** |
| `ACM1R-FB-14` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-15` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-16` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-17` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-18` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-19` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `ACM1R-FB-20` | access-control-kernel | P0 | FULL | observed_pass | 5 | e2e |  |
| `ACM1R-FB-21` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e | **updated** |
| `ACM1R-FB-22` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e | **updated** |
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
| `E4-AV01` | access-control-kernel | P0 | FULL | observed_pass | 5 | unit | **new** |
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
| `MEN-FLAG-04` | mentorship | P2 | PARTIAL | failing | 1 | e2e | **updated** |
| `MEN-PAIR-01` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-PAIR-02` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-PAIR-03` | mentorship | P1 | PARTIAL | failing | 1 | e2e |  |
| `MEN-PAIR-04` | mentorship | P1 | PARTIAL | failing | 2 | e2e |  |
| `MEN-PAIR-05` | mentorship | P1 | PARTIAL | failing | 1 | e2e | **updated** |
| `MEN-POOL-01` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-POOL-02` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-POOL-03` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-01` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-02` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-03` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-04` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `MEN-VIEW-05` | mentorship | P2 | PARTIAL | failing | 1 | e2e |  |
| `S4.1a-DP-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.1a-DP-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.1a-DP-03` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.1c-SAG-01` | user-management | P0 | FULL | observed_pass | 6 | e2e |  |
| `S4.1c-SAG-02` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `S4.1c-SAG-03` | user-management | P0 | FULL | observed_pass | 4 | e2e |  |
| `S4.1c-SAG-04` | user-management | P0 | FULL | observed_pass | 5 | e2e |  |
| `S4.1c-SAG-05` | user-management | P0 | FULL | observed_pass | 4 | unit |  |
| `S4.2a-OP-01` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `S4.2a-OP-02` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.2a-OP-03` | user-management | P0 | FULL | observed_pass | 6 | e2e |  |
| `S4.2a-OP-04` | user-management | P0 | FULL | observed_pass | 7 | e2e | **updated** |
| `S4.2a-OP-05` | user-management | P0 | FULL | observed_pass | 20 | e2e | **updated** |
| `S4.2a-OP-06` | user-management | P0 | FULL | observed_pass | 4 | e2e | **updated** |
| `S4.2b-TR-01` | access-control-kernel | P0 | FULL | observed_pass | 1 | e2e |  |
| `S4.2b-TR-02` | user-management | P0 | FULL | observed_pass | 5 | e2e |  |
| `S4.2b-TR-03` | user-management | P0 | FULL | observed_pass | 2 | e2e |  |
| `S4.2b-TR-04` | user-management | P0 | FULL | observed_pass | 6 | e2e |  |
| `S4.2d-DS-01` | access-control-kernel | P0 | FULL | observed_pass | 2 | e2e |  |
| `S4.2d-DS-02` | access-control-kernel | P1 | FULL | observed_pass | 8 | e2e |  |
| `S4.2d-DS-03` | access-control-kernel | P1 | FULL | observed_pass | 4 | e2e |  |
| `S4.2d-DS-04` | access-control-kernel | P1 | FULL | observed_pass | 2 | e2e |  |
| `S4.2d-DS-05` | access-control-kernel | P0 | FULL | observed_pass | 5 | e2e |  |
| `S4.2d-DS-06` | user-management | P0 | FULL | observed_pass | 5 | e2e | **updated** |
| `S4.2d-DS-07` | access-control-kernel | P1 | FULL | observed_pass | 3 | e2e | **updated** |
| `S4.2d-DS-08` | access-control-kernel | P1 | FULL | observed_pass | 5 | unit | **new** |
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
| `UM-PHOTO-03` | user-management | P1 | FULL | failing | 3 | e2e | **updated** |
| `UM-PHOTO-04` | user-management | P1 | FULL | observed_pass | 3 | e2e |  |
| `UM-PHOTO-05` | user-management | P1 | FULL | failing | 2 | e2e |  |
| `UM-PHOTO-06` | user-management | P1 | FULL | failing | 6 | e2e | **updated** |
| `UM-PHOTO-07` | user-management | P1 | FULL | failing | 1 | e2e |  |
| `UM-PHOTO-08` | user-management | P1 | FULL | failing | 2 | e2e | **updated** |
| `UM-PHOTO-09` | user-management | P1 | FULL | failing | 2 | e2e | **updated** |
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
| `UMAC-07` | user-management | P0 | FULL | observed_pass | 6 | e2e | **updated** |
| `UMAC-08` | user-management | P0 | FULL | observed_pass | 3 | e2e |  |
| `UMAC-09` | user-management | P0 | FULL | failing | 3 | e2e | **updated** |
| `UMAC-11` | user-management | P0 | FULL | observed_pass | 6 | e2e |  |
</details>

## Gate decision summary

```
GATE DECISION: NOT_EVALUATED

Coverage analysis (planning audit, no thresholds applied):
- P0: 163/163 FULL (100%), verified 158/163 (97%)
- P1: 89/108 FULL (82%), verified 76/108 (70%)
- Overall: 264/295 FULL (89%), verified 246/295 (83%)

Rationale: Gate decision skipped because allow_gate=false and collection_status=COLLECTED.

Live evidence: fresh (697 records: 637 pass, 42 fail, 18 skipped)
Critical gaps (P0 with NONE coverage): 0

GATE: NOT EVALUATED - collection status is COLLECTED but allow_gate=false (no declared MVP target);
machine-readable summary still emitted.
```
