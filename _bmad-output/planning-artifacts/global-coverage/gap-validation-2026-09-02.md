# Mechanical Gap Validation — People Management

**Date:** 2026-09-02  
**Validator:** mechanical (automated + artifact cross-read)  
**Authority chain:** `docs/project-requirements.md` v1.5 → `prd-people-management-2026-08-24/prd.md` → `global-fr-epic-story-coverage.yaml`  
**Rules:** `global-coverage/README.md` § Completeness rules, § Validation

---

## Executive summary

| Check | Result |
|---|---|
| PM-FR-1..42 inventory (exactly 42, no duplicates) | **PASS** |
| `deferred` / `uncovered` → `stories: []` | **PASS** |
| `specified` / `in-progress` / `implemented` → ≥1 story | **PASS** |
| `source_slices` vs actual `epics.md` files | **FAIL** — `cds`, `risk` exist but are unregistered; `cds` is draft template only |
| Story IDs epics ↔ yaml (bidirectional) | **FAIL** — risk carve-out incomplete; mentorship IDs absent in epics; CDS has no stories |
| `gates[]` ↔ `blockers.yaml` | **PASS** (all 14 referenced gate IDs resolve) |
| Duplicate FR ownership (risk vs engagement PM-FR-21/22) | **FAIL** — triple ownership (engagement + risk + yaml ENG-E3) |

**Highest-impact gaps:** incomplete risk slice carve-out (yaml still points at `ENG-E3-S3.*` while `risk/epics.md` defines `RISK-E*`); unregistered `cds`/`risk` slices; `cds/epics.md` claims decomposition but remains a placeholder template; gate-scope over-stretch of `AC-S9-S13` onto non-S9/S13 sections.

**Coverage snapshot (yaml):** `in-progress` 5 · `specified` 27 · `uncovered` 6 · `deferred` 4 · `superseded` 0 at requirement level.

---

## Mechanical check results

### 1. PM-FR inventory

- 42 entries, IDs `PM-FR-1` … `PM-FR-42`, each exactly once.
- No duplicate IDs.
- Normative source (`docs/project-requirements.md`) does not use `PM-FR-*` literals; traceability is via section refs in yaml `normative_refs` — expected.

### 2. Status ↔ stories[] rules

All requirements satisfy:

- `deferred` / `uncovered` with empty `stories`: PM-FR-5, 6, 9, 16, 17, 27, 30, 31, 38, 39
- `specified` / `in-progress` / `implemented` with ≥1 story: all remaining 32 requirements

### 3. source_slices registration

| Slice path | In `source_slices[]` | `epics.md` state |
|---|---|---|
| `platform/epics.md` | PLAT ✓ | populated |
| `user-management/epics.md` | UM ✓ | populated |
| `mentorship/epics.md` | M ✓ | populated (draft; no `M-E*` literals) |
| `platform-capabilities/epics.md` | PMC ✓ | populated |
| `resourcing/epics.md` | RS ✓ | populated |
| `engagement/epics.md` | ENG ✓ | populated |
| `feedback/epics.md` | FB ✓ | populated |
| `timetracker/epics.md` | TT ✓ | populated |
| **`cds/epics.md`** | **absent** | **draft — `{{requirements_coverage_map}}` / `{{epics_list}}` placeholders** |
| **`risk/epics.md`** | **absent** | **populated — `RISK-E1` (4 stories) + `RISK-E2` (3 stories)** |
| `planning-artifacts/epics.md` (PMC root duplicate) | not listed | byte-identical to `platform-capabilities/epics.md` |

`namespace_rules` in yaml lists `PLAT`, `UM`, `M`, `PMC`, `RS`, `ENG`, `FB`, `TT` — **`CDS-E*` and `RISK-E*` absent** despite both draft slices claiming registration in their frontmatter.

### 4. Story ID bidirectional sync

**Yaml → epics (failures):**

| Yaml story ID | PM-FR(s) | Issue |
|---|---|---|
| `ENG-E3-S3.1` … `ENG-E3-S3.5` | PM-FR-21, 22 | Still in yaml; `risk/epics.md` supersedes with `RISK-E*` |
| `M-E1-S1.1` … `M-E1-S1.6` | PM-FR-28–34, 41 | Sprint keys in yaml; **`mentorship/epics.md` has no `M-E*` literals** (only `Story 1.x` headers) |

**Epics → yaml (material failures):**

| Epics story ID | Slice | Issue |
|---|---|---|
| `RISK-E1-S1.1` … `RISK-E1-S1.4` | risk | Not in any `requirements[].stories[]` |
| `RISK-E2-S2.1` … `RISK-E2-S2.3` | risk | Not in yaml (replaces `ENG-E3-S3.4`, `ENG-E3-S3.5` with finer split) |
| `ENG-E3-S3.1` … `ENG-E3-S3.5` | engagement | Active story bodies; yaml-aligned but **risk slice claims supersession** |

**Epics → yaml (accepted / infra):**

- `PLAT-E1-S1.*` — platform alignment stories; intentionally outside FR coverage rollup
- `PLAT-E3-S3.2`, `S3.3`, `S3.5`, `S3.7`, `S3.8` — kernel infra / ACM evidence; partially mapped via other PLAT stories
- `PMC-E1-S1.2`, `S1.9` — presentation chrome / NFR perf evidence; not mapped to a PM-FR (documented in PMC slice)
- `ENG-E4-S4.*` in `engagement/epics.md` — **superseded** to `feedback/epics.md` (`FB-E*` in yaml); retained for traceability
- `UM-E0-S0.2`, `S0.3`, `UM-E1-S1.1`, `S1.5`, `UM-E2-S2.*` — auth / seed / list stories outside current yaml FR mapping

### 5. gates[] ↔ blockers.yaml

All gate IDs referenced in `requirements[].gates[]` resolve in `blockers.yaml`:

`AC-S9-S13`, `ARCH-PROJ-WRITER-01`, `CC-04`, `CC-06`, `CC-07`, `CC-08`, `CC-09`, `CC-10-MENTORSHIP`, `CONFLICT-UM-01`, `DEPARTMENT-EDGE`, `OQ-PERM-01`, `SEC-AUTH-01`, `TT-IDENTITY-01`, `TT-PMDM-01`

- `TIMETRACKER-CONTRACT` not cited as a live gate ✓
- `AC-SECTION-MATRIX-01` **not registered** in `blockers.yaml` (documented stand-in pattern uses `AC-S9-S13`)

### 6. PM-FR-21 / PM-FR-22 duplicate ownership

| Artifact | PM-FR-21 | PM-FR-22 | Story IDs claimed |
|---|---|---|---|
| `global-fr-epic-story-coverage.yaml` | `specified` | `specified` | `ENG-E3-S3.1`–`S3.3` / `ENG-E3-S3.4`–`S3.5` |
| `engagement/epics.md` Epic 3 | active claim | active claim | `ENG-E3-S3.1`–`S3.5` (full story bodies) |
| `risk/epics.md` | active claim (supersedes ENG-E3) | active claim | `RISK-E1-S1.1`–`S1.4` / `RISK-E2-S2.1`–`S2.3` |
| `prd-people-management-2026-08-24/prd.md` §0.2 | via Engagement slice | via Engagement slice | Risk still listed under Engagement namespace |

`risk/epics.md` documents preconditions for carve-out (register `RISK-E*` in yaml, supersede engagement Epic 3) — **preconditions not met**.

---

## Findings

| SEVERITY | TYPE | LOCATION | EVIDENCE | FIX |
|---|---|---|---|---|
| **CRITICAL** | SLICE-CARVEOUT-INCOMPLETE | `global-fr-epic-story-coverage.yaml` PM-FR-21, PM-FR-22 | Yaml stories are `ENG-E3-S3.1`–`S3.5`; `risk/epics.md` defines `RISK-E1-S1.1`–`S1.4` + `RISK-E2-S2.1`–`S2.3` and states ENG-E3 superseded | Repoint `stories[]` to `RISK-E*`; add `RISK` to `namespace_rules` + `source_slices`; mark `engagement` Epic 3 superseded |
| **CRITICAL** | DUPLICATE-FR-OWNERSHIP | `engagement/epics.md` + `risk/epics.md` | Both files actively decompose PM-FR-21/22 with conflicting story IDs and story counts (5 vs 7) | Complete risk carve-out per `risk/epics.md` § Supersession preconditions |
| **HIGH** | UNREGISTERED-SLICE | `cds/epics.md` | File exists; not in `source_slices[]`; `CDS-E*` absent from `namespace_rules` | Register CDS slice after stories exist, or mark file `status: draft-only` until registration |
| **HIGH** | UNREGISTERED-SLICE | `risk/epics.md` | File exists with 7 named stories; not in `source_slices[]`; `RISK-E*` absent from `namespace_rules` | Register RISK slice as part of carve-out |
| **HIGH** | DRAFT-SLICE-CLAIMS-COVERAGE | `cds/epics.md` L178–182 | `{{requirements_coverage_map}}` and `{{epics_list}}` placeholders; no `CDS-E*` story IDs | Generate epic/story bodies; then update yaml PM-FR-30/31 from `uncovered`/`[]` to `specified` + `CDS-E*` |
| **HIGH** | YAML-SLICE-MISMATCH | `requirements/PM-FR-30`, `PM-FR-31` | `coverage_status: uncovered`, `stories: []`; `cds/epics.md` overview claims decomposition of both FRs | Either complete CDS slice + yaml update, or remove FR claims from draft CDS doc |
| **HIGH** | STORY-DECOMPOSITION-MISMATCH | `risk/epics.md` vs yaml ENG-E3 | Risk splits dashboard into 3 stories (`RISK-E2-S2.1`–`S2.3`); yaml/engagement use 2 (`ENG-E3-S3.4`, `S3.5`) | Align coverage model to RISK decomposition on carve-out |
| **HIGH** | STORY-ID-NOT-IN-EPICS | `mentorship/epics.md` ↔ yaml `M-E1-S1.*` | Yaml lists `M-E1-S1.1`–`S1.6` with sprint keys; epics uses `Story 1.x` only, no `M-E*` literals, `status: draft` | Add `**ID:** \`M-E1-S1.x\`` blocks to mentorship stories (match risk/feedback pattern) |
| **MEDIUM** | GATE-SCOPE-DEFECT | `requirements/PM-FR-19` | `gates: [AC-S9-S13]`; blocker `blocks:` = S9 career timeline + S13 mentorship only; notes admit S14 absent | Register `AC-SECTION-MATRIX-01` in `blockers.yaml` for S14; remove or annotate AC-S9-S13 stand-in |
| **MEDIUM** | GATE-SCOPE-DEFECT | `requirements/PM-FR-21`, `PM-FR-22` | `gates: [AC-S9-S13]`; S6 owned by `PLAT-E6-S6.4`; AC-S9-S13 does not block S6 | Same as PM-FR-26 disposition: register `AC-SECTION-MATRIX-01` |
| **MEDIUM** | GATE-SCOPE-DEFECT | `requirements/PM-FR-26` | `gates: [AC-S9-S13]` for S15; defect already recorded in yaml notes | Register `AC-SECTION-MATRIX-01`; repoint gate |
| **MEDIUM** | GATE-SCOPE-DEFECT | `requirements/PM-FR-35` | `gates: [AC-S9-S13]` for S8 feedback; blocker scope is S9/S13 | Register section-matrix gate covering S8 |
| **MEDIUM** | GATE-STATUS-MISMATCH | `conflicts[]` vs `blockers.yaml` | `CONFLICT-UM-01` marked `resolved` in yaml `conflicts`; `status: open` in `blockers.yaml` with `implementation_status: stale-and-divergent` | Document as design-resolved / impl-open consistently; cite as gate on PM-FR-12/20 not as closed blocker |
| **MEDIUM** | EPIC-WITHOUT-STORIES | `requirements/PM-FR-16`, `PM-FR-17` | `epics: [PMC-E3]`, `stories: []`, `coverage_status: uncovered` | Accepted per PMC SD-7; add PMC-E3 stories when TT-IDENTITY-01 closes, or drop `epics:` assignment |
| **MEDIUM** | YAML-STORY-UNMAPPED | `platform-capabilities/epics.md` PMC-E1 | `PMC-E1-S1.2` (chrome), `PMC-E1-S1.9` (NFR perf) have story bodies but no yaml FR mapping | Map to PM-FR-8 infra/NFR trace or document as non-FR evidence stories |
| **MEDIUM** | PRD-TRACEABILITY-STALE | `prd-people-management-2026-08-24/prd.md` §7 table | Rows still show `Uncovered` for PM-FR-19–26, 35, 36–37 while yaml has `specified` + stories | Refresh PRD §7 traceability after slice registrations |
| **MEDIUM** | PRD-NAMESPACE-STALE | `prd-people-management-2026-08-24/prd.md` §0.2 | Risk still under Engagement (`PM-FR-19`–`22`); no `RISK-E*` / `CDS-E*` / `FB-E*` in namespace table (FB partially noted) | Amend §0.2 slice registry |
| **LOW** | PMC-ROOT-DUPLICATE | `planning-artifacts/epics.md` | Byte-identical to `platform-capabilities/epics.md` (89 656 bytes) | Keep single canonical path; prevent drift |
| **LOW** | SUPERSEDED-STORIES-RETAINED | `engagement/epics.md` Epic 4 | `ENG-E4-S4.1`–`S4.3` bodies remain; yaml uses `FB-E*` | Acceptable for traceability if Epic 4 header stays `superseded` |
| **LOW** | INFRA-STORY-UNMAPPED | `platform/epics.md` PLAT-E3-S3.8 | ACM-9 perf evidence story not in yaml | Map to quality evidence or exclude from FR rollup explicitly |
| **INFO** | RECORDED-ACCEPTED-GAP | `requirements/PM-FR-27` | `uncovered`, `stories: []`, `epics: [PLAT-E7]` — port ≠ capability | No mechanical fix; sharing bounded context still absent |
| **INFO** | RECORDED-ACCEPTED-GAP | `requirements/PM-FR-9` | `uncovered`, inline directory editing has no slice | Expected gap |

---

## Per-slice notes (read-through)

| Slice | FR coverage in yaml | Mechanical status |
|---|---|---|
| **platform** | PM-FR-1–4, 27 (epic ref), 39 (epic ref) | Story bodies align with yaml PLAT IDs; E1 alignment stories intentionally unmapped |
| **user-management** | PM-FR-4, 7, 12–13, 28–29, 40–42 | Sprint-key mapping consistent; auth/seed stories outside FR rollup |
| **mentorship** | PM-FR-28–34, 41 (partial) | **Missing `M-E*` literals in epics** |
| **platform-capabilities** | PM-FR-8–11, 15–18 | PMC-E3 empty for PM-FR-16/17 documented; S1.2/S1.9 unmapped |
| **resourcing** | PM-FR-23–26 | RS IDs bidirectional match |
| **engagement** | PM-FR-19–22 | **PM-FR-21/22 conflict with risk slice**; Epic 4 superseded to feedback |
| **feedback** | PM-FR-35 | FB IDs match yaml; ENG-E4 only in supersession prose |
| **timetracker** | PM-FR-36–37 | TT IDs match yaml; `gates: []` on PM-FR-36 per superseded TIMETRACKER-CONTRACT rule |
| **risk** | *(none — still ENG in yaml)* | 7 stories defined; **not registered** |
| **cds** | *(none — still uncovered)* | **Template only**; claims false-complete registration |

---

## Validation limits (manual review still required)

Per README § Validation:

- Semantic adequacy of stories vs normative requirements
- Whether evidence (`implemented` story statuses) proves production behavior
- Authorization / business-rule consequences of story acceptance criteria
- Whether PMC/ENG partial-by-gate deliveries satisfy product intent

This report is **mechanical only** — no files were modified.

---

## Recommended fix sequence

1. **Close risk carve-out** — register `RISK-E*` in yaml; supersede `engagement` Epic 3; repoint PM-FR-21/22 stories (7-story decomposition).
2. **Register or quarantine CDS** — either complete `cds/epics.md` and yaml rows for PM-FR-30/31, or mark CDS as draft-only until decomposition lands.
3. **Add `M-E*` ID blocks** to `mentorship/epics.md` for bidirectional story sync.
4. **Register `AC-SECTION-MATRIX-01`** in `blockers.yaml` and repoint overstretched `AC-S9-S13` gates on PM-FR-19, 21, 22, 26, 35.
5. **Refresh PRD §0.2 and §7** traceability to match post-carve-out slice registry and yaml statuses.

---

## Disposition — 2026-09-03

This report is a **dated audit record, not a live checklist**. Findings below are frozen as written on 2026-09-02; the disposition column records what happened afterwards. Re-run the mechanical validation rather than editing the findings table.

| Finding | Disposition |
|---|---|
| **All findings** | **Every finding in this report is now closed or explicitly accepted.** Nothing is left open pending someone else. |
| CRITICAL — SLICE-CARVEOUT-INCOMPLETE | **Closed before triage.** PM-FR-21 → `RISK-E1-S1.1`–`S1.4`; PM-FR-22 → `RISK-E2-S2.1`–`S2.3`; `RISK` registered in `namespace_rules` and `source_slices`. Retired `ENG-E3-S3.*` recorded in both requirement notes |
| CRITICAL — DUPLICATE-FR-OWNERSHIP | **Closed before triage.** `engagement/epics.md` Epic 3 carries a supersession banner and a *(superseded)* heading; identifiers retired, not reused |
| HIGH — UNREGISTERED-SLICE (`risk`) | **Closed before triage** as part of the carve-out |
| HIGH — STORY-ID-NOT-IN-EPICS (mentorship) | **Closed 2026-09-03.** `**ID:**` + sprint-key blocks added for `M-E1-S1.1`–`S1.6`; FR Coverage Map gained a Story ID column; frontmatter gained `slice` / `id_namespace`. All six IDs resolve in both directions |
| MEDIUM — PRD-TRACEABILITY-STALE (§13, cited as §7) | **Closed 2026-09-03.** §13 postures rewritten against actual yaml statuses, with an owning-slice column, an as-of date, and the requirement-level rollup |
| MEDIUM — PRD-NAMESPACE-STALE (§0.2) | **Closed 2026-09-03.** Risk row added; Engagement row corrected to `PM-FR-19`/`PM-FR-20`; CDS listed as draft-only/unregistered; `RISK-E*` added to the identifier bullet; retired-identifier line added |
| LOW — PMC-ROOT-DUPLICATE | **Closed before triage.** `planning-artifacts/epics.md` is a symlink to `platform-capabilities/epics.md`, so drift is structurally impossible |
| HIGH ×3 — CDS (UNREGISTERED-SLICE, DRAFT-SLICE-CLAIMS-COVERAGE, YAML-SLICE-MISMATCH) | **Closed 2026-09-03.** The finding's premise was partly wrong: the file was not a template but a run that stopped before rendering its last two sections. Decomposition written (2 epics, 7 stories, `CDS-E*`); slice registered as `draft-bounded-context-slice`; PM-FR-30/31 `uncovered` → `specified`; the false registration claim at L54 corrected; PRD §0.2 row flipped from draft-only to live |
| MEDIUM ×4 — GATE-SCOPE-DEFECT (`AC-SECTION-MATRIX-01`) | **Closed 2026-09-03.** Registered in `blockers.yaml` (Access Control, P1, `blocks:` S2–S8 and S14–S16); `PM-FR-21`, `PM-FR-22`, `PM-FR-26`, `PM-FR-35` repointed and their defect annotations retired; slice prose updated across platform, risk, feedback, engagement and cds. **This report's PM-FR-19 row was wrong** — it carries no `AC-S9-S13` gate; the real scope was 4 requirements over 3 sections (S6, S8, S15). The audit also **missed** the S12 contest, resolved the same day in favour of `AC-S9-S13`. Decision record: `architecture/gate-registration-proposal-AC-SECTION-MATRIX-01-2026-09-03.md` |
| HIGH — STORY-DECOMPOSITION-MISMATCH | **Moot.** Resolved by the carve-out; the coverage model now uses the 7-story RISK decomposition |
| Remaining MEDIUM / LOW / INFO rows | **Accepted and recorded** — gate-status nuance on `CONFLICT-UM-01`, empty `PMC-E3`, unmapped infra/evidence stories, retained superseded `ENG-E4` bodies, and the PM-FR-9 / PM-FR-27 gaps |
