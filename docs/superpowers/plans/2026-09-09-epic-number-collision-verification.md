# Epic Number Collision Repair — Independent Verification (Step 5)

**Role:** independent reviewer/QA, not the executor. No product file was modified by this pass.
**Scope:** everything currently uncommitted on `main` per `git status --short` / `git diff --stat`, checked against `git show HEAD:...` baselines, plus the plan and its two "Уточнення" sections.
**Method:** every claim below was re-derived from the actual files and from commands run in this session — fixtures invoked directly, tests executed, `sprint_plan.py validate` and `verify-coverage.py` run and their JSON/text read, a pristine `git worktree` built for byte-diff comparison, and a scratch copy (`mktemp -d`, outside the repo) used to exercise `sprint-status-generate.sh`. Nothing under `/Users/home/bootcamp/workplace` was left modified by this review (one incidental gitignored build artifact, `reports/readiness-map/index.html`, was created by a verification command and removed again before this report was written — see note at the end of §A.5).

## Overall verdict: **LOCAL PASS; live integration verification deferred (§D)**

The identity migration (A), baseline preservation (B), and the tooling guard end-to-end (C) all check out under independent reproduction — every test I ran matches the executor's claimed counts, and I found the guard's protections to be real, not decorative. Section E's "pre-existing, not a regression" claims are confirmed byte-identical against a pristine `HEAD` worktree.

The prior missing-provenance conclusion in §D has been reconciled: the user supplied the six ClickUp task URLs, and each URL task ID matches its `EPIC_BY_TRACK` literal. That confirms origin, not the present state, parentage, `bmad_key`, or status of any live ClickUp task. No ClickUp API request was made in this pass.

The first-generation wrapper defect found in §C.6 is fixed and regression-tested in the follow-up recorded below.

---

## A. Identity migration — content, not counts

**Verdict: PASS**

### A.1 The 7 stories + 2 epics, one successor each

Read the full `git diff` (not just headers) for both `epics.md` files end to end (380 lines platform, 79 lines UM). Every changed line falls into one of: a heading number, an `**ID:**`/`**Sprint key:**` line, a cross-reference inside prose (`Epic 4–7` → `Epic 5–8`, `UM-E6` → `UM-E8`, etc.), or a newly-added numbering note. **Zero** `Given`/`When`/`Then` lines, gate names, or dependency *targets* (as opposed to their ID spelling) were touched.

| Old ID | New ID | Verified via |
|---|---|---|
| `PLAT-E4-S4.1` | `PLAT-E8-S8.1` | `epics.md` heading, ID, sprint key, coverage YAML row, tracking key `8-1-project-line-derivation-from-explicit-pm-dm-attachments` |
| `PLAT-E4-S4.2` | `PLAT-E8-S8.2` | same pattern |
| `PLAT-E4-S4.3` | `PLAT-E8-S8.3` | same pattern |
| `PLAT-E4-S4.4` | `PLAT-E8-S8.4` | same pattern |
| `UM-E6-S6.1` | `UM-E8-S8.1` | same pattern |
| `UM-E6-S6.2` | `UM-E8-S8.2` | same pattern |
| `UM-E6-S6.3` | `UM-E8-S8.3` | same pattern |
| platform Epic 4 "Project-Line Audience" | platform Epic 8 | Epic List (`epics.md`) + epic body heading, both changed together |
| UM Epic 6 "Custom Fields as Data" | UM Epic 8 | Epic List + epic body heading, both changed together |

Each old ID has **exactly one** successor; none of the 9 renumbered identities collide with anything else post-migration — confirmed independently by running the guard against the live repo root (`node scripts/epic-id-guard.cjs --root .` → `OK — 37 epic and 134 story definitions across 13 files, 140 tracking keys across 5 files`, exit 0; see §C).

### A.2 Cross-surface agreement (Epic List ↔ body ↔ coverage YAML ↔ tracking ↔ ClickUp mapping key)

For all 7 stories and both epics I traced the chain by hand:

- **Epic List ↔ body:** both changed in the same diff hunk in each file (`platform/epics.md` lines ~98/174; `user-management/epics.md` lines ~21/42).
- **Body ↔ coverage YAML:** `global-fr-epic-story-coverage.yaml` rows for `PM-FR-1`, `PM-FR-2`, `PM-FR-5` now read `PLAT-E8-S8.n` / `UM-E8-S8.n` with matching sprint keys, and `epics: [...]` lists were updated (`PLAT-E2, PLAT-E3, PLAT-E5, PLAT-E8`; `epics: [UM-E7, UM-E8]`). **No `coverage_status` and no per-story `status` changed** — verified by reading the full diff hunk; every `status: specified` value is untouched.
- **Coverage ↔ tracking key:** the sprint keys in the coverage YAML (`8-1-project-line-derivation-from-explicit-pm-dm-attachments`, etc.) match the newly-added `sprint-status.yaml` keys byte-for-byte.
- **Tracking key ↔ ClickUp mapping prefix:** `clickup-lib.cjs`'s `EPIC_BY_TRACK` now has a `5-`/`6-`/`7-`/`8-` prefix entry for platform and `7-`/`8-` for user-management, so every one of these tracking keys resolves to *some* declared parent — confirmed via `node scripts/epic-id-guard.cjs --root . --clickup-mappings` (exit 0, no `UNMAPPED_CLICKUP_PARENT` finding) and via `npm run test:clickup`'s "unmapped sprint-status story keys are reported" output, which lists only the 5 `dept-*` keys as unmapped (expected — see §A.4) and nothing under the new numeric prefixes.

**Caveat carried into §D:** "declared" is not "verified live." The mapping *keys resolve*, which is what this sub-check is testing (internal self-consistency of the repo's own artifacts); whether the *values* those keys point to are real ClickUp tasks is a separate, unresolved question — see §D, which is the one place this migration is not fully closed.

### A.3 Preserved word-for-word

Spot-checked every item the plan named:

- `TT-IDENTITY-01`, `SEC-AUTH-01`, `ARCH-PROJ-WRITER-01` — present, unchanged text, on Epic 8 stories 8.1–8.4 (`platform/epics.md` lines 803, 863, 917).
- SD-8 ACM-9 re-baseline obligation — text preserved; only the epic-number list in its own sentence changed (`Epics 4, 5, and 6` → `Epics 5, 6, and 8`), which is a semantic rewrite the plan explicitly calls for (not a content change — SD-8 still binds the same three epics, one of which changed its number).
- `RA-E1` cross-slice dependency for UM Epic 8 — line 146 of `user-management/epics.md` reads `**Depends on (outside this file):** role-administration/epics.md Epic RA-E1 — the manage custom fields permission key and a working isAllowed must exist...` and **this line does not appear in the diff at all** — i.e. it is byte-identical to `HEAD`, because it never needed an ID substitution (it references `RA-E1`, not `UM-E6`).
- Gate lines — 20 in platform, 0 in UM, both unchanged in count per the executor's own table; I independently confirm no gate line was deleted by reading the full diff (gates only ever appear as unchanged text or with an ID substituted inside them, e.g. `Epic UM-E6` → `Epic UM-E8` inside a gate note, never removed).

### A.4 The 21 newly-tracked stories

All 21 enter `sprint-status.yaml` as `backlog` (verified: `grep -c ': backlog'` across the new block, and by reading every line of the diff hunk — no story in the new block carries any other status). None claim evidence they don't have. The **DEPT ↔ Epic 5** cross-reference is present in **both directions**, not just one: `dept-epic.md` gained a "DEPT ↔ Epic 5 — do not double-count" note, and `platform/sprint-status.yaml`'s Epic 5 block carries inline comments (`# overlaps DEPT-1/DEPT-3`) on the `5-1` and `5-3` keys. Neither file promotes a `done` status across the boundary.

### A.5 Readiness-map render (Уточнення §1)

This is a code claim, not a doc claim, so I ran the actual build function rather than trusting the report:

```
node -e '
const { build } = require("./scripts/build-readiness-map.cjs");
const evidence = JSON.parse(require("fs").readFileSync("_bmad-output/test-artifacts/live-verification-results.json","utf8"));
const result = build(evidence, { headSha: evidence.source_sha });
...counts PLAT-E4 / PLAT-E8 / UM-E6 / UM-E8 in result.data.product, and old IDs in result.html
'
```
Result: `PLAT-E4: 0`, `PLAT-E8: 9`, `UM-E6: 0`, `UM-E8: 8` in `data.product`; 42 `implementation` notes survive (matches the claimed 42/42); the only old-ID strings in the rendered HTML are `PLAT-E4-S4.1a` and `PLAT-E4-S4.1c`, which are **Consolidation** (not Project-Line) test-evidence titles from the frozen trace matrix — correct, since those sub-increment IDs were never part of the migration (AMBIGUITY-2). `docs/demo/workplace-readiness-data-2026-09-07.json` itself is untouched (`git status` shows no diff). This independently confirms the executor's claim.

*Note on my own process:* running this build wrote `reports/readiness-map/index.html` into the working tree (a gitignored, regenerable build artifact per `.gitignore:14`, pre-dated by an already-existing empty `reports/` directory). I deleted the file I created (`rm -rf reports/readiness-map`) immediately after reading the in-memory result, restoring the tree to its prior state, per the hard constraint not to leave the workspace modified.

---

## B. Baseline preservation

**Verdict: PASS**

Diffed `git show HEAD:<file>` against the working copy programmatically (Python + PyYAML) for both `sprint-status.yaml` files, comparing full key sets, not just counts:

```
--- platform ---
HEAD key count: 33   NOW key count: 57
removed keys: []
added keys count: 24  (matches +4 epics, +16 stories, +4 retrospectives)
changed existing keys: {}
--- user-management ---
HEAD key count: 36   NOW key count: 45
removed keys: []
added keys count: 9   (matches +2 epics, +5 stories, +2 retrospectives)
changed existing keys: {}
```

Zero keys removed, zero existing key's status changed, in either file — this is a full key-set diff, not a count comparison.

Specifically confirmed by grep against both the working tree and `HEAD`:
- `epic-4: done`, `4-1-generalise-section-access-authorisation: done`, `4-2-default-org-relationship-seed: done` — identical, byte-for-byte, before and after.
- `epic-6: in-progress`, `6-1-read-current-manager-and-people-partner: review`, `6-2`…`6-6: backlog` — identical, byte-for-byte, before and after.

`services/backend` gitlink: `git diff -- services/backend` shows `cb23d23…` → `f7c0385…`, but `git show HEAD:services/backend` (via `git ls-tree HEAD`) already points at `cb23d23…`, i.e. this gitlink bump **predates** this repair entirely — it is the same foreign, out-of-scope change recorded in the audit's baseline (§0: "`M services/backend` — foreign change, out of scope"). It was not touched, staged, or altered by anything in this diff set.

(Pre-existing, unrelated observation, not a defect of this repair: `platform/epics.md`'s own preamble text claims `sprint-status.yaml still records epic-3: in-progress and epic-2: in-progress` — but the actual file has recorded `epic-2: done` / `epic-3: done` since before `HEAD`. That sentence was already stale before this pass touched the file and is untouched by this pass; flagging it here only so it isn't mistaken for something this repair introduced.)

---

## C. Guard + wrapper, end to end

**Verdict: PASS**, with one new defect found (see below) that does not block this migration.

### C.1 Test suites, run directly

```
$ node --test test/epic-id-guard.test.cjs
ℹ tests 59
ℹ pass 59
ℹ fail 0

$ npm run test:clickup
  (runs test/clickup-lib.test.cjs, clickup-sync, clickup-create, clickup-safety, clickup-descriptions)
ℹ tests 75
ℹ pass 75
ℹ fail 0
```
Both green, no failures, run to completion with no skips.

### C.2 Fixture reproduction, direct CLI invocation (not through the test runner)

```
$ node scripts/epic-id-guard.cjs --root test/fixtures/epic-id-guard/platform-epic-4-collision
Epic/Story identifier guard: FAIL
  [DUPLICATE_EPIC_DEFINITION] platform: Epic 4 has 2 epic bodies (...)
  [DUPLICATE_STORY_DEFINITION] platform: Story 4.1 has 2 definitions (...)
  [DUPLICATE_STORY_DEFINITION] platform: Story 4.2 has 2 definitions (...)
exit=1

$ node scripts/epic-id-guard.cjs --root test/fixtures/epic-id-guard/user-management-epic-6-collision
Epic/Story identifier guard: FAIL
  [DUPLICATE_EPIC_DEFINITION] user-management: Epic 6 has 2 epic bodies (...)
  [DUPLICATE_STORY_DEFINITION] user-management: Story 6.1/6.2/6.3 has 2 definitions (...)
exit=1

$ node scripts/epic-id-guard.cjs --root test/fixtures/epic-id-guard/legitimate-repeats
Epic/Story identifier guard: OK — 5 epic and 8 story definitions across 3 files, 23 tracking keys across 2 files.
exit=0

$ node scripts/epic-id-guard.cjs --root .
Epic/Story identifier guard: OK — 37 epic and 134 story definitions across 13 files, 140 tracking keys across 5 files.
exit=0
```
Both original collisions reproduce with the exact finding codes named in the task (`DUPLICATE_EPIC_DEFINITION`, `DUPLICATE_STORY_DEFINITION`) and non-zero exit; the negative-negative fixture (`legitimate-repeats` — Epic List repeats, cross-domain same numbers, retired markers, dept keys, symlinks) passes clean; the repaired real tree passes clean.

### C.3 Guard invoked before the first write, for the whole batch

Read `scripts/create-clickup-task.cjs` (lines 28–44) and `scripts/sync-clickup.cjs` (lines 134–148): in both files, `await assertNoAmbiguousEpicIds(...)` is the **first statement** in the exported function — before config is even loaded, before `authorizeWorkspace`, before any `fetch` call of any kind. This is not "before the POST" — it's before any network I/O at all.

`test/epic-id-guard.test.cjs:395` (`create makes zero writes when the conflict is the last record in the set`) and `:417` (`sync makes zero writes...`) construct a fixture where the ambiguous record is deliberately the *last* one a naive per-item loop would reach, and assert `requests` (the full list of every fetch call, not just POST/PUT) is `[]` — i.e. literally zero HTTP calls of any kind, not just zero writes. Both pass (part of the 59/59 above).

### C.4 `sprint-status-generate.sh`, all three invocation forms, on a scratch copy

Built a scratch environment (`mktemp -d`, entirely outside the repo) containing copies of `scripts/`, `node_modules/`, `.agents/skills/bmad-sprint-planning/`, and the real `platform`/`user-management` `epics.md` + `sprint-status.yaml` files, and ran `scripts/sprint-status-generate.sh generate --fresh ...` against a copy of the real user-management status file, in all three forms the task specified:

1. **`--fresh` as a separate arg:** refused — `sprint-status generate refused: the candidate does not preserve the current tracking state`, listing 7 dropped entries and 21 downgraded statuses (`epic-1: done → backlog`, etc.). Real (scratch-copy) file byte-identical after (`diff` empty).
2. **`--status-file=<path>` (`=value` form) + bare `--fresh`:** same refusal, same diagnostic, file byte-identical after.
   *(I also tried `--fresh=1` literally: the wrapper's own `=value` normalization splits it into `--fresh 1`, which `sprint_plan.py`'s argparse then rejects as `unrecognized arguments: 1` since `--fresh` is `action='store_true'` and does not accept an explicit value — the wrapper still fails safe in this case, refusing the write, file untouched, but for a different immediate reason. This is expected: `--fresh=value` is not a form `sprint_plan.py` itself supports; the form the task and the shipped test suite actually exercise is `--status-file=<path>` combined with a bare `--fresh`, which behaves correctly as shown above.)*
3. **Quoted YAML keys** (`"epic-0": in-progress`, `"epic-6": in-progress`, etc.) + `--fresh`: refused, correctly parsing the quoted keys (3 dropped, 2 downgraded reported by exact key name), file byte-identical after.

**Safe regeneration allowed through:** constructed a minimal epics.md/status.yaml pair where the existing tracking keys exactly match what the generator would produce (`epic-1: done`, `1-1-bar: done`), ran a non-fresh `generate` — it succeeded (`exit=0`), the existing keys/statuses were preserved unchanged, only an additive `epic-1-retrospective: optional` key and updated `last_updated` timestamp were written, and the file was **actually written** (confirmed by re-reading it after the run).

*(Incidental finding while doing this: running a non-fresh `generate` against the real platform or user-management epics.md/status.yaml pair is **also** correctly refused, because several live tracking keys are hand-shortened relative to what the title-slug-based generator would produce — e.g. `0-1-adopt-read-path-and-rebind-port` vs. the generator's `0-1-adopt-the-read-path-and-rebind-the-port-umac-1`. This is exactly the "short-key drift" hazard the audit and the guard's own comments describe, and the wrapper catches it even outside `--fresh` mode, which is *more* protective than the plan strictly required. Not a defect.)*

### C.5 CI wiring

`.github/workflows/tests.yml`: new `epic-id-guard` job runs `npm run guard:epic-ids` then `npm run test:epic-ids`, on `ubuntu-latest` with Node 24. Its own comment states plainly: *"Whether a failure here prevents a merge depends on the repository's required-status-check settings, which live in GitHub, not here."*

`.github/workflows/sync-clickup.yml`: both `create-if-missing` and `sync` jobs now run `npm run guard:epic-ids:clickup` immediately before `npm run create:clickup` / `npm run sync:clickup`. The path filter that triggers this workflow was extended to include `scripts/epic-id-guard.cjs` and `test/epic-id-guard.test.cjs` (confirmed by reading the full YAML), so a change to the guard itself re-triggers the workflow.

**On blocking vs. informational, stated explicitly as instructed:** I cannot determine from any file in this repository whether the `epic-id-guard` job in `tests.yml` is a required/blocking status check — that is a GitHub branch-protection setting, external to the repo's tracked files, and no such setting is visible here. Do not read the job's mere existence as proof it blocks merges.

### C.6 New defect found (not in the executor's report) — LOW severity, does not block this migration

While reproducing the "first generation" scenario (a brand-new `sprint-status.yaml` that does not exist yet — the case `sprint-status-diff.cjs`'s own unit tests describe as "null means first generation, not malformed"), I ran the **actual shell wrapper** end-to-end against a genuinely nonexistent `--status-file` target, which no test in `test/epic-id-guard.test.cjs` does (its "first generation" tests call `compareTrackingStatuses(null, ...)` directly as a unit test, never through the CLI with a real missing file):

```
$ bash scripts/sprint-status-generate.sh generate --epic-file <epics.md> --status-file <path-that-does-not-exist-yet> --stories-dir ... --project ... --date ...
Epic/Story identifier guard: OK — ...
Checking the 2 argument(s) actually passed to the generator:
Epic/Story identifier guard failed to run: ENOENT: no such file or directory, open '<path>'
exit=1
```

**Root cause:** `scripts/sprint-status-generate.sh` lines 97–103 always re-invoke `epic-id-guard.cjs` with `--status-file "$status_file"` whenever `$status_file` is non-empty, regardless of whether that file exists yet. `epic-id-guard.cjs`'s `collectGuardInput` (around line 636–641) builds `trackingFiles` from `options.sprintStatusPaths` via a direct `dedupeByRealPath(...)` map with no existence check — unlike its own auto-discovery path (`discoverSprintStatusFiles`'s `push` helper, which explicitly gates on `fs.existsSync`). The subsequent `fsp.readFile(file.path, ...)` call throws `ENOENT`, which is caught only by the CLI's outer `.catch` (`console.error('...guard failed to run...'); process.exitCode = 1`), not treated as "zero tracking keys" the way a first-generation scenario should be.

**Impact:** any genuinely first-time `sprint-status.yaml` generation for a new domain, run through this wrapper with the file's real intended path (rather than a path that already has an empty placeholder file), is refused with a confusing crash message instead of proceeding. It fails *closed* (no bad write occurs), so it is not a data-safety defect, but it is a real usability/coverage gap: the executor's own end-to-end scenario tests never exercised the wrapper's shell-level guard call against a missing file, only the pure-function comparator. **Does not affect this migration** — both `platform/sprint-status.yaml` and `user-management/sprint-status.yaml` already exist, so nothing in this repair path hits it. Recommend: either have the wrapper's second guard invocation skip `--status-file` when the file does not yet exist (mirroring how `sprint-status-diff.cjs` already treats a missing file as "first generation"), or have `epic-id-guard.cjs`'s explicit-path branch tolerate a missing tracking file the same way its discovery path does.

---

## D. ClickUp mapping — provenance reconciled; live state unresolved

**Verdict: LOCAL PASS — source is user-supplied URLs; live verification is NOT RUN.**

The initial reviewer could find the six values only in `scripts/clickup-lib.cjs`; that was insufficient to establish provenance from repository evidence. The user subsequently supplied the following six URLs in this order. Their final path components match the corresponding `EPIC_BY_TRACK` literals exactly:

| Epic | User-supplied URL | URL task ID | `EPIC_BY_TRACK` literal | Result |
|---|---|---|---|---|
| PLAT-E5 | `https://app.clickup.com/t/90122019689/869ezmy89` | `869ezmy89` | `869ezmy89` | match |
| PLAT-E6 | `https://app.clickup.com/t/90122019689/869ezmyg7` | `869ezmyg7` | `869ezmyg7` | match |
| PLAT-E7 | `https://app.clickup.com/t/90122019689/869ezmynx` | `869ezmynx` | `869ezmynx` | match |
| PLAT-E8 | `https://app.clickup.com/t/90122019689/869ezmyy0` | `869ezmyy0` | `869ezmyy0` | match |
| UM-E7 | `https://app.clickup.com/t/90122019689/869ezmz6b` | `869ezmz6b` | `869ezmz6b` | match |
| UM-E8 | `https://app.clickup.com/t/90122019689/869ezmzdb` | `869ezmzdb` | `869ezmzdb` | match |

This supersedes the earlier “likely fabricated” wording: the values are sourced from the user-supplied URLs, not invented from local repository data. It does **not** prove that the tasks currently exist, belong to the expected workspace/list, have the expected parent/`bmad_key`, or retain any particular status. ClickUp API access was unavailable and no live request was attempted.

`node scripts/epic-id-guard.cjs --root . --clickup-mappings` passes locally with these six mappings. Preflight, live dry-run, the merge gate, and live create/sync verification remain **NOT RUN — deferred (no API access)**. They are neither a local-QA failure nor integration PASS.

---

## E. Pre-existing failures — confirmed unchanged, not this repair's fault

**Verdict: PASS — both confirmed byte-identical / value-identical against a pristine baseline, independently reproduced, not via the executor's word.**

### E.1 `verify-coverage.py`

Built a pristine, isolated copy of `HEAD` via `git worktree add --detach /tmp/.../pristine-head HEAD` (never touching the working tree), and ran the checker in both locations:

```
$ cd _bmad-output/planning-artifacts && python3 global-coverage/verify-coverage.py   # current tree
exit=1, 2 FAILs:
  FAIL  every unmapped story is declared in unmapped_story_exemptions — {...}
  FAIL  every scenario document resolves to >=1 PM-FR — 233 of 324 unresolved...

$ cd /tmp/.../pristine-head/_bmad-output/planning-artifacts && python3 global-coverage/verify-coverage.py
exit=1, same 2 FAILs

$ diff coverage-pristine.txt coverage-now.txt
(no output — BYTE IDENTICAL)
```
`verify-coverage.py` itself is untouched (`git status --short` on that file is empty). The two pre-existing FAILs are unchanged in count, wording, and every detail down to the exact unresolved counts (`233 of 324`).

### E.2 `sprint_plan.py validate`

Ran on every `sprint-status.yaml` file that exists (not just the two this repair touched), reading the JSON `valid`/`problems` fields directly rather than trusting exit codes:

| File | `valid` | `problems` |
|---|---|---|
| `platform/sprint-status.yaml` (current) | `false` | exactly 5: `dept-epic`, `dept-1-...`, `dept-2-...`, `dept-3-...`, `dept-4-...` — all "unrecognized key" |
| `platform/sprint-status.yaml` (pristine `HEAD` worktree) | `false` | **identical** 5 problems, same text |
| `user-management/sprint-status.yaml` (current) | `true` | `[]` |
| `user-management/sprint-status.yaml` (pristine `HEAD`) | `true` | `[]` — identical |
| root `implementation-artifacts/sprint-status.yaml` (symlink to platform's) | `false` | same 5 dept problems (untouched by this repair, `git status` empty) |
| `resourcing/sprint-status.yaml` | `true` | `[]` (untouched) |
| `platform-capabilities/sprint-status.yaml` | `true` | `[]` (untouched) |
| `mentorship/sprint-status.yaml` | `true` | `[]` (untouched) |

Platform: `valid=false` with **exactly** the 5 pre-existing `dept-*` problems, unchanged from baseline — confirmed, not just asserted. User-management: `valid=true`, unchanged.

---

## Test commands run, verbatim, with actual results

```
node --test test/epic-id-guard.test.cjs                              → 59 pass, 0 fail (initial QA run)
npm run test:clickup                                                  → 75 pass, 0 fail
npm run test:readiness                                                → 10 pass, 0 fail (sanity check, not required by plan but touched by Уточнення §1)
node scripts/epic-id-guard.cjs --root .                                → OK, exit 0
node scripts/epic-id-guard.cjs --root . --clickup-mappings             → OK, exit 0
node scripts/epic-id-guard.cjs --root test/fixtures/.../platform-epic-4-collision        → FAIL, exit 1 (DUPLICATE_EPIC_DEFINITION, DUPLICATE_STORY_DEFINITION)
node scripts/epic-id-guard.cjs --root test/fixtures/.../user-management-epic-6-collision → FAIL, exit 1 (same finding codes)
node scripts/epic-id-guard.cjs --root test/fixtures/.../legitimate-repeats               → OK, exit 0
bash scripts/sprint-status-generate.sh generate --fresh ...            → refused, exit 1, file byte-identical (×3 invocation forms, scratch copy)
bash scripts/sprint-status-generate.sh generate ... (safe case)        → succeeded, exit 0, file written, keys preserved (scratch copy)
python3 global-coverage/verify-coverage.py  (current + pristine worktree) → exit 1 both, byte-identical output
uv run .../sprint_plan.py validate --status-file <each sprint-status.yaml, current + pristine>  → JSON read directly, matches in every case
```

Follow-up local completion (after the first-generation regression fix):

```
node --test test/epic-id-guard.test.cjs                              → 60 pass, 0 fail
npm run test:clickup                                                  → 75 pass, 0 fail
node scripts/epic-id-guard.cjs --root . --clickup-mappings           → OK, exit 0
scripts/sprint-status-generate.sh generate ... <missing temp output> → OK, output created by the actual generator
```

## Pre-existing, not a regression

- `verify-coverage.py`'s 2 FAILs (`unmapped_story_exemptions`, scenario-document PM-FR resolution) — byte-identical to pristine `HEAD`.
- `sprint_plan.py validate` on platform returning `valid=false` with exactly 5 `dept-*` "unrecognized key" problems — identical to pristine `HEAD`.
- `platform/epics.md`'s preamble sentence claiming `sprint-status.yaml still records epic-3: in-progress and epic-2: in-progress`, which was already false before this pass (both have read `done` since before `HEAD`) and is untouched by this pass.
- `services/backend` gitlink bump (`cb23d23…` → `f7c0385…`) — already present at `HEAD`, not part of this diff's own changes, not touched further.

## Follow-up resolution and remaining work

1. **§D provenance — resolved locally.** The six literals match the six user-supplied URLs 6/6. The previous “likely fabricated” conclusion is withdrawn; the source is recorded in §D.
2. **§C.6 first-generation ENOENT — fixed.** The wrapper passes `--status-file` to its second guard invocation only when the target exists; it still checks the explicitly passed epic files. The new wrapper-level regression test was red then green, and an actual-generator run created a missing status file in a temporary directory.
3. **Live work — NOT RUN, deferred (no API access).** ClickUp preflight, live dry-run, the merge gate, live create/sync, and verification of present task state/parentage/status remain outstanding. This is not a local-QA failure and not an integration PASS. No commit, push, merge, or ClickUp API call occurred in this follow-up.

---

## F. Post-repair staleness and coverage follow-up

**Verdict: LOCAL PASS.** This is a maintainer follow-up to the independent QA
record above, not a rewrite of that review's historical observations.

- The Pact documentation now records the current split accurately: both pinned
  service revisions contain `@pact-foundation/pact`, `test:contract`, frontend
  consumer suites, and backend provider verification; workspace
  `.github/workflows/tests.yml` still runs neither contract script. The dated
  2026-09-04 pipeline artifact preserves its setup-time decision and explicitly
  states that it no longer describes current `main`.
- Platform Stories 1.4 and 1.5 moved `backlog` → `done` only after every AC
  was checked against the PM/ACF spines, canonical blocker supersessions, and
  `docs/architecture/dashboards.md`. Epic 1 remains `in-progress`; Stories 1.1,
  1.2, 1.3, and 1.6 remain open.
- The recorded Consolidation coverage gap is closed. `PLAT-E4-S4.1` and
  `PLAT-E4-S4.2` are explicit story IDs and `implemented` `PM-FR-3` coverage;
  `PLAT-E4` is a co-owner. `PM-FR-3` remains `in-progress`. `NFR-AC-*` remains
  outside the 42-row global FR model, and Epic 4's slice-local performance
  measurement question remains unresolved.
- Both Epic List summaries now display numeric order. The full body blocks retain
  authoring order to avoid a noisy move and to keep historical line-based
  evidence useful.
- The service-promotion comments no longer call historical evidence SHAs the
  revisions that `main` "currently pins".
- The reported backend gitlink issue was **not changed**: root pins `cb23d239`,
  the shared submodule checkout is detached at `f7c0385`, and local
  `origin/main` is `f1eea3c`. The local object database cannot prove ancestry
  between the pinned commit and `f1eea3c`, so the claim that the pin is "one
  commit behind" is unverified; repointing it would risk including or regressing
  unrelated backend work.

Follow-up verification:

```text
node --test test/epic-id-guard.test.cjs                    60 pass, 0 fail
npm run test:clickup                                        75 pass, 0 fail
node scripts/epic-id-guard.cjs --root . --clickup-mappings PASS
verify-coverage.py                                          2 known baseline FAILs only
sprint_plan.py validate (platform)                          valid=false, the same five DEPT records only
git diff --check                                            PASS
```

No ClickUp API call was made. ClickUp preflight, live dry-run, merge gate,
live create/sync, and present task-state verification remain **NOT RUN — deferred
(no API access)**. This is neither a local-QA failure nor an integration PASS.
