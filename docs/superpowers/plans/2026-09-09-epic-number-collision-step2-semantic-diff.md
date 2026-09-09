# Epic Number Collision Repair — Step 2 semantic diff and verification evidence

**Pass:** executor, step 2 only, 2026-09-09.
**Inputs:** [repair plan](2026-09-09-epic-number-collision-repair.md) incl. *Уточнення після аудиту*, and the [step-1 audit](2026-09-09-epic-number-collision-audit.md) semantic map.
**Baseline:** branch `main`, HEAD `d05581f`. `M services/backend` (foreign gitlink) present before and after — **not touched, not staged**.
**Not done, by instruction:** no commit, no push, no merge, no ClickUp write, no ClickUp script/workflow change.

---

## 1. The migration — every old ID has exactly one successor

Identity used for every row: domain + epic title + story title + current full key.

### 1.1 platform / Project-Line Audience → Epic 8

| Old ID | New ID | Old sprint key | New sprint key |
|---|---|---|---|
| `PLAT-E4-S4.1` | `PLAT-E8-S8.1` | `4-1-project-line-derivation-from-explicit-pm-dm-attachments` | `8-1-…` (same slug) |
| `PLAT-E4-S4.2` | `PLAT-E8-S8.2` | `4-2-project-line-column-narrowness-and-best-column-merge` | `8-2-…` |
| `PLAT-E4-S4.3` | `PLAT-E8-S8.3` | `4-3-project-derived-revocation-and-timetracker-outage-withdrawal` | `8-3-…` |
| `PLAT-E4-S4.4` | `PLAT-E8-S8.4` | `4-4-project-membership-is-read-only-to-access-control` | `8-4-…` |

Epic heading changed in **both** representations: Epic List and epic body.

### 1.2 user-management / Custom Fields as Data → Epic 8

| Old ID | New ID | Old sprint key | New sprint key |
|---|---|---|---|
| `UM-E6-S6.1` | `UM-E8-S8.1` | `6-1-define-a-custom-field-with-declared-visibility` | `8-1-…` (same slug) |
| `UM-E6-S6.2` | `UM-E8-S8.2` | `6-2-set-and-store-custom-field-values` | `8-2-…` |
| `UM-E6-S6.3` | `UM-E8-S8.3` | `6-3-custom-field-values-respect-section-level-access` | `8-3-…` |

### 1.3 Explicitly NOT migrated (verified unchanged)

| Kept | Evidence |
|---|---|
| platform Epic 4 — Access Control Authorization Consolidation | `epic-4: done`, `4-1-…`/`4-2-…` `done`, backend commits, all comments preserved verbatim |
| user-management Epic 6 — Current-State Read Endpoints | `epic-6: in-progress`, `6-1-…: review`, `6-2`…`6-6` `backlog` |
| platform Epics 5, 6, 7 · user-management Epic 7 | no collision; numbers unchanged |
| `dept-epic`, `dept-1`…`dept-4` | separate live namespace, untouched |
| `PLAT-E4-S4.1a`…`S4.2d` sub-increment IDs (8 spec files, 2 story files, test corpus, trace matrices) | Consolidation; correct as written |
| historical `"No Epic 4"` notes (`platform/epics.md` twice) | 2026-09-02 CE-pass evidence, verbatim |

**No blanket replace was run.** Every edit was applied by line number with an exact-match
assertion that failed the run on any mismatch (63 assertions on `platform/epics.md`, 13 on
`user-management/epics.md`, 17 on the coverage YAML).

---

## 2. Reference updates, by file

| File | What changed |
|---|---|
| `planning-artifacts/platform/epics.md` | Epic List + body headings; 4 story headings, IDs, sprint keys; 3 in-body `Dependency: Story 4.1`/`Independent of S4.1–S4.3`; FR Coverage Map rows PM-FR-1, PM-FR-2, NFR-AC-1; dependency graph; open follow-ups; Step-4 validation block; **26 range expressions** "Epics 4–7"/"E4–E7"/"E4/E5/E6" rewritten *semantically* to 5–8 / E5–E8 / E5/E6/E8, never absorbing Consolidation; 6 `UM-E6` → `UM-E8`; 2 numbering notes added |
| `planning-artifacts/user-management/epics.md` | Epic List + body headings; 3 story headings, IDs, sprint keys; FR-17 coverage row; the 2026-09-03 re-entry note; **`Depends on: Epic 6` → `Epic 8`** with an explicit "a higher number is not a later slot" clause; gate note; numbering note added |
| `planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml` | 7 story rows (id + sprint_key), 3 `epics[]` lists, 5 note bodies. PM-FR-2 story rows reordered ascending. **No `coverage_status` and no per-story `status` changed** |
| `planning-artifacts/platform-capabilities/epics.md` | 3 live `UM-E6` → `UM-E8` (PM-FR-5 owner references) |
| `planning-artifacts/role-administration/epics.md` | 2 live `Epic UM-E6` → `UM-E8`; `PLAT-E1–E7` → `PLAT-E1–E8`; AMBIGUITY-4 clarification added, **PO ruling text left verbatim and not reversed** |
| `planning-artifacts/prds/.../prd.md` | PM-FR-5 owner `UM-E6` → `UM-E8` |
| `planning-artifacts/platform/dept-epic.md` | Context section: collision described as resolved; Epic 4 row → Epic 8; **DEPT ↔ Epic 5 do-not-double-count note** added. The `PLAT-E4-S4.1` SCP reference at `:297` is Consolidation and was left alone |
| `implementation-artifacts/platform/sprint-status.yaml` | +4 epics, +16 stories, +4 retrospectives; tracking-gaps comment rewritten |
| `implementation-artifacts/user-management/sprint-status.yaml` | +2 epics, +5 stories, +2 retrospectives |
| 3 historical artifacts (`global-coverage/.memlog.md`, `epic-coverage-review-2026-09-03.md`, `chain-fix/unmapped-stories-classification.md`) | **text left verbatim**; a dated old→new map pointer added. The memlog got an appended event, matching its append-only convention |

### The 26 range expressions — the trap the plan named

"Post-kernel scope" was written throughout as *Epics 4–7*, meaning Project-Line + Department
Walk + Section Matrix + Shared-Link. That set is now **5, 6, 7, 8**. Every occurrence was
rewritten to that set — never to "4–8", which would have silently pulled the Consolidation
epic into 26 binding conditions, gate scopes and SD-* rulings it was never part of. Two
set-expressions that were not ranges (`Epics 4, 5, and 6` and `Epics 4–6`, both the SD-8
ACM-9 re-baseline set) became `Epics 5, 6, and 8`.

---

## 3. The 21 tracking gaps — registered, none resolved

All 21 enter as `backlog`. Coverage records them `status: specified`, which means *a story
exists that owns this FR* — that is **not** `done` and was not converted into a tracking status.

**platform — 16:** Epic 8 Project-Line (4) · Epic 5 Department Walk (3) · Epic 6 Section Matrix (6) · Epic 7 Shared-Link (3).
**user-management — 5:** Epic 8 Custom Fields (3) · Epic 7 Visibility-Safe Filtering (2).

Each block carries its live gates in comments — `SEC-AUTH-01`, `TT-IDENTITY-01`, `TT-PMDM-01`,
`ARCH-PROJ-WRITER-01`, `DEPARTMENT-EDGE`, `AC-SECTION-MATRIX-01`, `AC-S9-S13`, `CC-07`,
the SD-8 ACM-9 re-baseline obligation, and the `RA-E1` cross-slice dependency. **No gate was closed.**

Two orderings recorded explicitly so a later reader does not "fix" them:
- **UM Epic 7 depends on UM Epic 8** — recorded in the Epic List, the epic body note, and the tracking comment.
- **platform Epic 5 stories overlap `DEPT-1`…`DEPT-4`** (dept-epic.md:30/56 — same substrate; DEPT-1/DEPT-3 overlap `5-1`/`5-3`). Flagged in both directions; remaining scope is not 3 + 4 and no `done` may propagate either way.

---

## 4. Verification evidence

| Check | Result |
|---|---|
| Duplicate epic bodies / Epic List entries, per domain | **NONE** in either file (was: `PLAT` Epic 4 ×2, `UM` Epic 6 ×2) |
| Story prefix matches parent epic, all 64 stories | **NONE mismatched** |
| Acceptance criteria preserved | platform `Given/When/Then` 106/108/108 → **identical**; UM 71/71/71 → **identical** |
| Stories preserved | platform 36 → 36 headings, 16 `**ID:**`; UM 28 → 28 headings, 21 `**ID:**` |
| Gate lines preserved | platform 20 → 20; UM 0 → 0 |
| `sprint-status` existing statuses | **0 changed, 0 keys removed** (platform 33→57 keys, UM 36→45) |
| `sprint_plan.py validate` platform | `valid=false`, **exactly the same 5 pre-existing `dept-*` problems** as baseline — no new problem |
| `sprint_plan.py validate` user-management | `valid=true`, 0 problems (unchanged) |
| `verify-coverage.py` full output vs pristine `HEAD` worktree | **byte-identical** — the 2 pre-existing FAILs unchanged, nothing introduced |
| `npm run test:clickup` | **75 pass / 0 fail** |
| Coverage YAML parses; PM-FR-1/2/5 statuses | `in-progress`/`in-progress`/`specified` — unchanged; all 7 migrated stories still `specified` |
| `docs/demo/workplace-readiness-data-2026-09-07.json` | **`git diff` empty — snapshot not modified** |
| Generated readiness `data.product` | `PLAT-E4` 11→**0**, `PLAT-E8` 0→**9**, `UM-E6` 8→**0**, `UM-E8` 0→**8** |
| Readiness implementation notes | **42/42 identical** to baseline |
| Old IDs left in rendered readiness HTML | only `PLAT-E4-S4.1a` / `PLAT-E4-S4.1c` — **Consolidation** test-evidence titles from the frozen trace matrix, correct |
| ClickUp tooling / workflows / package.json | `git diff` **empty** |
| Foreign gitlink | `services/backend` unchanged and unstaged |

### Readiness-map decision (AMBIGUITY-3) — resolved as *frozen snapshot*, and it costs nothing

The plan's clarification §1 is confirmed by code and by execution. `scripts/build-readiness-map.cjs:20-31`
rebuilds `seed.product` from the canonical coverage YAML (`...r`), carrying over only
`implementation` by FR id. All 19 old-ID hits in the JSON live in `product.*.stories`,
`epics` and `notes` — all discarded on build. Verified: `data.product` has **zero** old IDs
after the coverage migration while all 42 implementation notes survive. So the dated artifact
is left verbatim **and** the render is correct. This needed no product decision.

---

## 5. Findings for the next steps

1. **AMBIGUITY-5 is resolved by fact, and the audit's reading was wrong.** The "two PMC copies"
   are one file: `_bmad-output/planning-artifacts/epics.md` is a **symlink** to
   `platform-capabilities/epics.md`, and only the target is tracked by git
   (`git ls-files` returns one path). Editing either path edits the one file, so the copies
   cannot desynchronise and the plan's "change both synchronously" requirement is satisfied
   inherently. Both paths were verified to show the migrated text.
2. **ClickUp mapping gap — 6 epic parents, unchanged from the audit.** `clickup-lib.cjs`
   `EPIC_BY_TRACK` still has no `8-` prefix in either track and no `7-` in user-management, so
   the 21 newly tracked keys plus the 7 migrated ones resolve to `null` → `warnUnmappedPrefix`
   → **silently skipped, not failed**. Step 4 must confirm against the live board and create
   only genuinely missing parents. `869ew04c9` and `869ew04uk` must **not** be reused — they
   belong to Consolidation and Current-State Reads.
3. **Live-write trigger still applies.** Both `sprint-status.yaml` files and both `epics.md`
   files are inside the `sync-clickup.yml` path filter, so merging this to `main` fires live
   create/sync. Integration verification before merge remains mandatory.
4. **Consolidation coverage gap recorded separately, not fixed** —
   [2026-09-09-consolidation-coverage-gap.md](2026-09-09-consolidation-coverage-gap.md).
5. **Deliberate deviation: no block reordering.** `Epic 8` keeps its authoring position in both
   files (platform: between Epic 4 and Epic 5; UM: between Epic 6 and Epic 7). Moving ~195 and
   ~45 line bodies would have produced a diff no reviewer could check against "no AC lost" for
   zero semantic gain. Both files now carry an explicit note that document order is authoring
   order and numbers are identities. Flagging it so step 5 does not read it as an oversight.
6. **A guard would have caught a mistake I made.** The first draft of the two numbering notes
   quoted `PLAT-E4-S4.1` and `UM-E6-S6.1` as bare literals; `verify-coverage.py` check 4 scans
   registered slice files with `\b([A-Z]{1,5})-E\d+-S\d+\.\d+\b` and immediately reported two
   new unmapped stories. The notes were reworded to the `S4.*` / `S6.*` form and the output
   went back to byte-identical. **Step 3's guard must treat a retired ID quoted inside a
   migration note as documentation, not as a live story** — otherwise it will fail on correct data.
7. **Not acted on (pre-existing, out of scope):** the `epic-4` comment in
   `platform/sprint-status.yaml` cites `epics.md line 32` for the "No Epic 4" note; that note
   is not and was not at line 32. Inaccurate before this pass; left alone.
