# Test-Design Consolidation — Migration Map (Disposition Ledger)

**What this document is.** A migration record: it says where every obligation in the
superseded test-design artifact set goes, on whose authority, and what happens to its
approval and evidence status. It is **not** a second test strategy, not a coverage
claim, and not an approval. Nothing here changes product requirements, scenario files,
stored execution evidence, sprint status, coverage/trace JSON, service code, or service
gitlinks.

**Produced by:** Task 1 of `docs/superpowers/plans/2026-09-10-test-design-consolidation.md`.
**Consumed by:** Tasks 2–5 of that plan.
**Status:** **Task 1 output, reconciled by Task 2.** No disposition in this ledger grants an
approval, a validation verdict, or coverage.

> ### Task 2 has run — read this before using any row
>
> Task 2 ("Reconcile meaning before drafting the new set") re-adjudicated the blocks Task 1
> handed it and resolved every `→ Task 2` placement. **Its record is [§15](#15-task-2--reconciliation-record)**,
> and the per-decision outcome is [§10.1](#101-task-2-outcome-per-decision--nothing-closed-quietly).
> Every number in this banner was machine-counted from this file at the moment the banner was
> written, after the work it describes was finished.
>
> - **All seven of the plan's Task 2 checkboxes are complete.** No checkbox is partial. §15.7
>   records which work an interrupted first pass had done and what the second pass verified or
>   added.
> - Where Task 2 changed a row, **the row itself was edited in place** so that exactly one
>   `disposition` value stays machine-readable per row (Task 5's disposition-aware ID check keys
>   on that cell). The superseded Task 1 value is preserved in prose inside the same row.
>   **Counted 2026-09-10 by two independently written parsers that agree: 565 ledger rows — 328
>   `preserve`, 90 `merge`, 96 `replace`, 51 `retire`; 0 rows carry any other value, and every
>   row has exactly eight cells.** Task 1's distribution (338/88/85/53, 564 rows) is left in
>   §14.1 beside the re-count so the movement is visible rather than overwritten. **Task 2 added
>   one row** — it split `plat:PR-B-05 / OQ-105` in §5.2 — so the total moved 564 → 565 and
>   `replace` moved +11, not +10.
> - **Ruling D-1 (2026-09-10, human user)** is applied throughout: `docs/architecture/testing-strategy.md`
>   lines 25–38 are the authority on scenario-document approval state. No row asks anyone to
>   establish an approval state for `docs/test-cases/**`. See §15.0.
> - **Of Task 1's 16 open decisions: 5 resolved with named authority (U-1, U-7, U-8, U-14,
>   U-15), 1 partially resolved (U-3), 10 still open. Task 2 opened 9 new ones (U-17..U-25).**
>   §10.1 carries the per-decision outcome with its authority; **no decision was closed
>   quietly**, and no decision owned by a product owner was answered here. *(This banner read
>   "7 new ones (U-17..U-23)" until 2026-09-10. Two further questions — the undecided
>   All-Employees-list harness and the `QUALITY-GATE-AC-NFR` conflation hazard — had been
>   "opened" in row prose under numbers that already meant something else, so they sat in no
>   register and went uncounted. They are now U-24 and U-25.)*
> - **The All Employees list ≤2-second requirement has no chosen harness.**
>   Eight `evidence_contract` cells said `load (k6)`; no binding document selects k6 (§6, F-17).
>   The value is now **UNDECIDED** in all of them, and choosing a harness is U-24. This ledger
>   did not pick one.
> - **Design closure is not implementation closure.** 6 of 9 `PR-B-*` blockers are closed at
>   design; **0** are closed at implementation, and both `PR-S-*` sign-offs remain ungranted.
> - Task 2 executed no test suite and reports no pass rate. Implemented-test counts are carried
>   as **unverified** and are excluded from the re-estimate (§8.1).
> - Task 2 wrote no canonical artifact, removed no source, and modified no scenario file, trace
>   artifact, sprint status, service file, gitlink or requirement. It changed this file only.
>
> **Rule this document now carries, because an earlier Task 2 attempt broke it.** That attempt
> was interrupted and, before stopping, wrote a banner in this position claiming results it had
> not verified — including a reference to a §15 that did not then exist, and decision counts
> that did not match §10. Its claims were replaced with a correction notice before any further
> work, and its surviving row edits were re-verified as candidates rather than trusted. **Never
> write a completion summary before doing the work it summarises, and machine-count every
> figure at the moment you write it.**
>
> **The rule was broken again, in a quieter way, and the repair is recorded (2026-09-10).** An
> independent review of Task 2 returned **PASS WITH FINDINGS**, and two of its five findings were
> the same failure class: cells citing "§6, F-14/F-15/F-19/F-22/F-23" when §6 defined only
> F-1..F-13, and a certified row total of 564 that was wrong because the parser producing it
> silently skipped a seven-cell row the same pass had just written. **A mechanical count is not
> automatically a true count** — it inherits every defect in the parser and in the data, and it
> must be run under two independently written parsers and paired with a shape assertion (§1.1b)
> before it is quoted. All five findings are applied; §15.7 lists them with where each correction
> lives. **The figures in this banner were re-parsed at the moment it was rewritten, after the
> corrections were made, not before.**

---

## 0. Frozen baseline

| Pin | Value | How obtained |
| --- | --- | --- |
| Workspace commit | `76a7220701ac6f16843dad8b303934f9a958b54c` | `git rev-parse HEAD` in the migration worktree |
| Worktree branch | `docs/2026-09-10-test-design-consolidation` | worktree creation record |
| Working tree at freeze | clean except two untracked plan documents | `git status --short` |
| `services/backend` gitlink | `f1eea3c048821011da96fba20d9b517f7d0e4f1b` | `git submodule status` |
| `services/frontend` gitlink | `fa3d3198aa9921c26d22307542ab72834a03b899` | `git submodule status` |

Raw command output is in **Appendix A**.

**Drift check against the plan's audit pins.** The plan pins workspace `76a7220…`,
backend `f1eea3c…`, frontend `fa3d3198…`. All three match this freeze exactly, and every
source file listed in §1 is committed at `76a7220…` with no uncommitted modification, so
old findings may be adopted without re-inspecting changed sources. **Caveat:** matching
pins are observation context only. They are not evidence that any test passes, that any
gate is green, or that any artifact's stated status is currently true — several stated
statuses in the sources are demonstrably stale (see §6).

**Submodule note.** In the migration worktree both submodules are *uninitialised*
(`-` prefix, empty directories). Their content was inspected read-only in the user's live
checkout at `/Users/home/bootcamp/workplace/services/{backend,frontend}`, where both are
checked out clean at exactly the pinned revisions. See §4.3.

**Citation rule (AGENTS.md).** Because canonical trace and test-design filenames are
overwritten in place, every claim about the *content* of a superseded artifact in this
ledger is anchored to `76a7220…`. Link form:
`https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/<path>`.
Superseded validation, progress, review and approval statements are pinned to that commit
and are **not** copied into a dated current-evidence directory.

---

## 1. How to read this ledger

### 1.1 Columns

Every row carries the ten fields the plan's Task 1 names. **Eight are rendered as table
columns. Two — `source_commit` and `source_path` — are factored out of the tables and
carried by the ledger section**, because they are constant (or fixed by a short rule)
across a whole section, and repeating them on 500+ rows would make every table unreadable.

**There are no paired half-tables in this file.** No row is split across two adjacent
tables, and no table repeats the `source_anchor_or_id` key for continuation. §1.1a below is
the complete and only rule for recovering the two factored fields, and it resolves them for
every row in the ledger.

| Field | Where it lives | Meaning |
| --- | --- | --- |
| `source_commit` | factored — §1.1a | Commit where the source content quoted by the row exists. |
| `source_path` | factored — §1.1a | Repository-relative path of the source. |
| `source_anchor_or_id` | column 1 | Section heading or scoped identifier. |
| `kind` | column 2 | `section`, `risk`, `test-id`, `decision`, `nfr-threshold`, `execution-constraint`, `approval-claim`, `estimate`, `regression-trigger`, `unresolved-task`, `gate`, `planning-row`, `trace-id`, `factual-claim`. |
| `disposition` | column 3 | Exactly one of `preserve` · `merge` · `replace` · `retire`. **No other value appears in any ledger table** (§1.3). |
| `target_path_and_anchor` | column 4 | Destination path + anchor, or `—` for a retirement with no successor. |
| `authority_and_reason` | column 5 | The binding document or decision that permits the disposition, plus why. **Every cell is self-contained**; no cell depends on the row above it, so rows may be reordered or extracted individually. |
| `approval_status` | column 6 | Approval carried by the *destination*, not by the source. |
| `evidence_contract` | column 7 | What evidence would discharge the obligation, and at what level. |
| `consumers` | column 8 | Documents/tools that read this item today. |

#### 1.1a Recovering `source_commit` and `source_path`

**`source_commit` is `76a7220701ac6f16843dad8b303934f9a958b54c` for every row in this
ledger, without exception.** Where a row's *text* cites a different commit (for example
`1edec31` in §3.7 or `6086491` in §6 F-3), that commit belongs to the statement being
quoted, not to the row's source.

`source_path` is fixed per ledger section by the table below. `S1`..`S15` are the source
documents enumerated in §2, which gives each one's full repository-relative path; the
scope-key prefixes are defined in §1.2. Where two paths are listed, the content of the row
exists in **both** at `76a7220` and the defining statement is named.

| Ledger section | `source_path` for every row in it |
| --- | --- |
| §3.1 – §3.10 | The single source named in the subsection heading (`S1`..`S15`). |
| §4.1 | `S1` (defining statement — the risk assessment tables); restated in `S2` § Risk assessment (QA view) and `S13` § Risk-to-story mapping. |
| §4.2 | `S3` (defining statement — the platform risk assessment); restated in `S4` § Risk assessment and `S14` § Risk-to-domain mapping. |
| §4.3a, §4.3b | `S5`. |
| §4.3c, §4.3d | `S2`. |
| §4.3e | `S13`. |
| §4.4 | `S6`. |
| §5.1, §7.1, §8, §9 | By the row's prefix — see the prefix table below. |
| §5.2 | `S3` (defining statement — the explicit product/architecture blocker table); restated in `S4` § Dependencies and `S14`. |
| §5.3 | Named inside the row's own `source_anchor_or_id` cell (a skill file, `_bmad/config.toml`, or `test/trace-artifact-naming.test.cjs`), with the line number. |
| §5.4, §5.5 | `S15`. |
| §5.6, §5.7 | `S4`. |
| §5.8 | `plat:DG-*` / `plat:PG-*` → `S4`; `legacy-um:gate/*` → `S13`. |
| §7.2 | Three origins, all three named in the row's own `source_anchor_or_id` cell (`S1`, `S3`, `S4`). |

| Row prefix (§5.1, §7.1, §8, §9) | `source_path` |
| --- | --- |
| `legacy-um:` | `S1` and/or `S2` — the `legacy-um` architecture/QA pair. Defining statement: `S2` for `exec/*`, `est/*` and `reg/*` rows; `S1` for `config-owned-thresholds`; both for `NFR-1`..`NFR-4`. |
| `plat:` | `S3` and/or `S4` — the `plat` architecture/QA pair. Defining statement: `S4` for `exec/*`, `est/*`, `reg/*` and the NFR categories; `S3` for `assumptions`. |
| `um-epic:` | `S5`. |
| `fe-epic:` | `S6`. |
| `config:` | `_bmad/config.toml` (line numbers given in the cell). |
| `trace:` | `AGENTS.md` § Trace artifacts. |
| `v1.5:` | `docs/project-requirements.md` (line number given in the cell). |
| `arch:` | `docs/architecture/testing-strategy.md`. |
| `perf:` | `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md`. |

#### 1.1b Row shape rule — exactly eight cells, and no literal `|` in any cell

**Every ledger row has exactly eight cells.** A ledger row is any row of any table whose
header begins `| source_anchor_or_id | kind | disposition |`. A row with seven cells silently
drops `consumers`; a row with nine silently shifts `approval_status`, `evidence_contract` and
`consumers` one column right. Either way a mechanical consumer — Task 5's disposition-aware
ID check, or §14's counter — reads the wrong column or skips the row without saying so, which
is the exact hazard §1.3 warns about.

**No ledger cell may contain a literal `|`, escaped or not.** GFM renders `\|` correctly, but
a line-oriented parser that splits on `|` before handling escapes sees an extra column. Write
the pipe out in prose instead ("… piped to `wc -l`"). Two rows violated this rule and were
repaired on 2026-09-10 (see the correction note in §14.1): `plat:PR-B-05` half 1 of 2 (§5.2)
was missing its `consumers` cell, and `um-epic:R-UM-05` (§4.3a) carried an escaped pipe inside
a `grep` command. Both defects were introduced by Task 2, and the first of them is why Task 2's
own row count came out one too low.

**Checkable mechanically.** Both properties are verified by parsing every ledger row and
asserting a cell count of exactly eight under *both* an escape-aware split and a naive split
on `|`. Both parses agree at the time of writing.

### 1.2 Scope keys (collision prevention)

Bare identifiers repeat across sources. Every bare ID in this ledger is keyed by its
source scope. **Never de-scope these keys** — `legacy-um:R-001` and `plat:PR-001` are
different risks, and `legacy-um:R-004` is unrelated to `um-epic:R-UM-04`.

| Scope key | Source set | Commit |
| --- | --- | --- |
| `legacy-um:` | `test-design-architecture.md`, `test-design-qa.md`, `test-design/people-management-handoff.md`, `test-design-progress-system.md`, `test-design-validation-report.md`, `critical-review-existing-artifacts.md` (the approved 2026-08-25 User Management system-level set) | `76a7220` |
| `plat:` | `test-design-architecture-platform.md`, `test-design-qa-platform.md`, `test-design/people-management-platform-handoff.md`, `test-design-progress-platform.md`, `test-design-validation-report-platform.md` (the 2026-08-29 v1.5 platform Create run) | `76a7220` |
| `um-epic:` | `test-design-epic-user-management.md`, `test-design-progress-user-management.md` (2026-09-06 epic-level run, `runKey: user-management`) | `76a7220` |
| `fe-epic:` | `test-design-epic-frontend.md`, `test-design-progress-frontend.md` (2026-09-06 epic-level run, `runKey: frontend`) | `76a7220` |

### 1.3 Disposition vocabulary

- **preserve** — the obligation survives unchanged in meaning; it moves to a named target
  and keeps its identifier. A preserved ID may legitimately keep its spelling in the new
  canonical documents and in its intended consumers.
- **merge** — the obligation is folded into a target that also receives other origins.
  Every merge row lists **all** origins that converge on the target.
- **replace** — the obligation survives but its statement, subject, or measurement
  contract changes; the row names the replacing statement and its authority.
- **retire** — the obligation stops being an active obligation. Every retirement carries
  an authority and a reason **even when it has no successor**. Retired IDs must not remain
  active obligations anywhere; their text may still appear in historical citations and in
  this ledger.
- A **split** is recorded as multiple rows on the same source ID, each naming one
  successor; the `target_path_and_anchor` cell of each row names its own successor and the
  `authority_and_reason` cell says "Split 1 of N". **`split` is not a disposition value** —
  each of the N rows carries one of the four values above, chosen for that successor alone
  (a half that survives is `preserve` or `replace`; a half with no successor is `retire`).
  Task 5's disposition-aware ID validation keys on the four values only, so a fifth value
  in the column would cause the row to be skipped silently.

### 1.4 `approval_status` vocabulary

Approval belongs to the **destination**, never inherited from the source. A new document
never inherits an old document's validation PASS or human approval.

| Value | Meaning |
| --- | --- |
| `ungranted` | The destination has no human approval. Default for everything this migration produces. |
| `source-approved-2026-08-25 (historical, pinned)` | The *source* carried a human approval on 2026-08-25. It is recorded as history at `76a7220` and does **not** transfer. |
| `source-draft` | The source itself was never approved. |
| `draft-decision` | The underlying product decision is explicitly a draft (e.g. `DEC-UM-012`). |
| `n/a` | Retirement with no destination. |

### 1.5 `evidence_contract` vocabulary

`unit` · `component` · `contract (Pact)` · `api-e2e (real HTTP + PostgreSQL)` ·
`integration-live` · `load (k6)` *(**retired from use 2026-09-10** — no row carries it any more;
no binding document selects k6, see §6, F-17)* · `measurement (ACM9-MVP-v1)` · `measurement (P6)` ·
`ci-scan` · `manual-review` · `repository-audit` · `none-yet` ·
`unexecuted` (the check exists but has not been run) ·
`unverified` (a claim is asserted somewhere but no evidence was located at `76a7220`).

**No row in this ledger asserts that any evidence currently passes.** Where a source
claims completion, the claim is recorded as a `factual-claim` row with its own truth
status, separately from the obligation.

---

## 2. Source inventory

Fifteen source documents were read in full. Line counts are at `76a7220`.

| # | source_path | Lines | Scope | Declared status at source | Run identity |
| --- | --- | ---: | --- | --- | --- |
| S1 | `_bmad-output/test-artifacts/test-design-architecture.md` | 262 | `legacy-um` | "Approved — 2026-08-25 (human approval; normative propagation complete)" | system-level UM child |
| S2 | `_bmad-output/test-artifacts/test-design-qa.md` | 365 | `legacy-um` | "Approved — 2026-08-25" | system-level UM child |
| S3 | `_bmad-output/test-artifacts/test-design-architecture-platform.md` | 203 | `plat` | "Draft — refreshed v1.5 Create run; human review pending" | platform-level |
| S4 | `_bmad-output/test-artifacts/test-design-qa-platform.md` | 461 | `plat` | "Draft — refreshed v1.5 Create run; human review pending" | platform-level |
| S5 | `_bmad-output/test-artifacts/test-design-epic-user-management.md` | 243 | `um-epic` | "Draft — needs human approval before it drives any story" | `runKey: user-management`, `mode: epic-level` |
| S6 | `_bmad-output/test-artifacts/test-design-epic-frontend.md` | 259 | `fe-epic` | "Draft — needs human approval before it drives any story" | `runKey: frontend`, `mode: epic-level` |
| S7 | `_bmad-output/test-artifacts/test-design-progress-system.md` | 89 | `legacy-um` | `workflowStatus: approved`, `runScope: user-management-child`, `runKey: system` | UM child checkpoint |
| S8 | `_bmad-output/test-artifacts/test-design-progress-platform.md` | 138 | `plat` | `workflowStatus: completed`, `runScope: platform-level`, `runKey: platform` | platform checkpoint |
| S9 | `_bmad-output/test-artifacts/test-design-progress-user-management.md` | 25 | `um-epic` | `workflowStatus: complete`, `runKey: user-management` | epic checkpoint |
| S10 | `_bmad-output/test-artifacts/test-design-progress-frontend.md` | 25 | `fe-epic` | `workflowStatus: complete`, `runKey: frontend` | epic checkpoint |
| S11 | `_bmad-output/test-artifacts/test-design-validation-report.md` | 350 | `legacy-um` | "Overall Verdict: PASS — Approved for ATDD"; strict completion FAIL | Validate run 2026-08-25 |
| S12 | `_bmad-output/test-artifacts/test-design-validation-report-platform.md` | 15 | `plat` | "Current validation status: `NOT RUN`" (supersession notice) | none |
| S13 | `_bmad-output/test-artifacts/test-design/people-management-handoff.md` | 122 | `legacy-um` | `status: approved` (2026-08-25) | UM handoff |
| S14 | `_bmad-output/test-artifacts/test-design/people-management-platform-handoff.md` | 189 | `plat` | `status: draft — refreshed v1.5 Create run` | platform handoff |
| S15 | `_bmad-output/test-artifacts/critical-review-existing-artifacts.md` | 236 | `legacy-um` | "Approved 2026-08-25 — decisions propagated" | supporting review |

**Filename-collision warning for Task 3.** Five plan target paths reuse a filename that a
source currently occupies with *different, human-approved* content:
`test-design-architecture.md`, `test-design-qa.md`, `test-design-progress-system.md`,
`test-design-validation-report.md`, and `test-design/people-management-handoff.md`. Every
one of these is currently `legacy-um`-scoped and 2026-08-25-approved; the target is
platform-scoped and `ungranted`. Any surviving citation of the old filename that makes a
content claim must be rewritten to a `76a7220` commit link, or it silently starts
describing the new platform document. This is the exact hazard AGENTS.md §"Trace
artifacts" describes for `gate-decision.json`.

---

## 3. Section-level ledger

One row per section of every source. `A_R` = `authority_and_reason` (abbreviated where the
full sentence appears in §6 or §7).

### 3.1 S1 — `test-design-architecture.md` (`legacy-um`, approved 2026-08-25)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:S1#header` (Purpose/Date/Author/Status/Project/PRD ref/ADR ref) | section | replace | `test-design-architecture.md` § header (platform scope, v1.5 sources) | Plan target table: one platform testability baseline. PRD ref `prd-user-management-2026-08-20` is *historical* per AGENTS.md "Architecture authority"; ADR ref is AD-1..AD-14 but the spine is now AD-1..AD-34+. | ungranted | none-yet | S11, S13, S14 |
| `legacy-um:S1#executive-summary` | section | replace | `test-design-architecture.md` § Executive Summary | Scope becomes platform, not the `user-management` bounded context. | ungranted | none-yet | S11, S14 |
| `legacy-um:S1#quick-guide-scoped-gates` (B-03, B-04 as scoped CI/reliability gates) | section | merge | `test-design-qa.md` § Execution strategy (B-03) + retire (B-04) | B-03 survives as DEC-UM-010 (binding, `docs/architecture/testing-strategy.md` §"Test data isolation"). B-04 depends on a registration transaction that AD-16/AD-21 removed and DEC-UM-008 retires. | ungranted | api-e2e / none | S2, S13 |
| `legacy-um:S1#quick-guide-approved-planning-decisions` (10 numbered rules) | section | replace | `docs/architecture/user-management-test-decisions.md` (already normative, DEC-UM-001..012) | These rules were already propagated into the binding decision log; the test design must reference, not restate, them. Restating creates a second source of shared policy, which the plan forbids. | source-approved-2026-08-25 (historical, pinned) for DEC-UM-001..011; `draft-decision` for DEC-UM-012 | manual-review | S2, S13, S15 |
| `legacy-um:S1#high-priority-team-should-validate` | section | merge | `test-design-architecture.md` § Risk register | Restates R-001..R-005; folded into the single risk table. | ungranted | none-yet | S11 |
| `legacy-um:S1#info-only` | section | retire | — | Pure cross-reference block (points at `test-design-qa.md` and `critical-review-existing-artifacts.md`); its targets are themselves migrating. Retained content becomes the index (`test-design/README.md`). No successor obligation. | n/a | none | — |
| `legacy-um:S1#risk-assessment` (14 risks, 3 tables) | section | merge | `test-design-architecture.md` § Risk register (per-ID rows in §4.1) | Risk rationale is architecture-owned per the plan's target table. Per-risk disposition in §4.1. | ungranted | see §4.1 | S2, S11, S13 |
| `legacy-um:S1#nfr-testability-requirements` (5-row table) | section | replace | `test-design-qa.md` § NFR measurement contracts | Subject changes from UM PRD NFR-1..4 to v1.5 §7 NFRs; the list-performance row needs a stated subject/dataset/statistic it does not currently have (§7.1). | ungranted | see §7.1 | S2, S11 |
| `legacy-um:S1#configuration-owned-thresholds` | section | preserve | `test-design-qa.md` § NFR measurement contracts, "configuration-owned" note | DEC-UM-004 keeps TTL configuration-owned with a controllable clock. Unchanged meaning. | ungranted | api-e2e | S2 |
| `legacy-um:S1#assessment-boundary` (final PASS/CONCERNS/FAIL via `nfr-assess`) | section | preserve | `test-design-qa.md` § NFR measurement contracts, boundary note | Plan global constraint: this migration issues no NFR verdict. | ungranted | none | S4, S8 |
| `legacy-um:S1#testability-concerns-gates-to-fast-feedback` (4 rows) | section | merge | `test-design-architecture.md` § Testability gaps | Row 1 (parallel-worker isolation) is now DEC-UM-010 binding; row 3 (`GET /users` Story 1.5) is now `UM-E1-S1.5`; row 4 (timeline rule normative) is closed by DEC-UM-001. | ungranted | manual-review | S2 |
| `legacy-um:S1#architectural-improvements-needed` (exception mapping, transaction helper) | section | preserve | `test-design-architecture.md` § Testability gaps | AD-11 transaction pattern and stable `409` mapping remain binding. | ungranted | api-e2e + unit | S2 |
| `legacy-um:S1#testability-assessment-summary` (what works well / trade-offs) | section | merge | `test-design-architecture.md` § Testability assessment | Retains AD-3 fake-backed ports, AD-14 fixed routes, layering separation. | ungranted | manual-review | — |
| `legacy-um:S1#risk-mitigation-plans` (R-001..R-005 detailed plans) | section | merge | `test-design-architecture.md` § Risk register + owning epic plans | Per-risk in §4.1; test-activity steps move to the QA document per the plan's ownership split. | ungranted | see §4.1 | S11 |
| `legacy-um:S1#residual-risk-after-planned-mitigation` (5 rows) | section | preserve | `test-design-architecture.md` § Residual risk | Residual-risk statements survive their risks; each row travels with its risk's disposition. | ungranted | manual-review | S11 |
| `legacy-um:S1#assumptions-and-dependencies` | section | replace | `test-design-architecture.md` § Assumptions and dependencies | Assumption 2 (bootstrap HR Admin via `fc-03`) and dependency 3 (500-row seed for Story 1.5) need re-sourcing against the current AC suite layout (§6, F-3). | ungranted | manual-review | — |
| `legacy-um:S1#risks-to-plan` (B-01 copy drift) | section | retire | — | The risk was "the approved B-01 rule is copied incorrectly into normative artifacts". Propagation happened (DEC-UM-001); the drift risk is discharged. No successor. | n/a | none | — |
| `legacy-um:S1#next-steps` | section | retire | — | Points at 2026-08-25 next actions that the repository has since moved past (propagation complete; ATDD superseded by v1.5 replan). No successor obligation. | n/a | none | — |

### 3.2 S2 — `test-design-qa.md` (`legacy-um`, approved 2026-08-25)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:S2#header` | section | replace | `test-design-qa.md` § header (platform scope) | Plan target table: one platform execution/coverage strategy. | ungranted | none-yet | S11, S13 |
| `legacy-um:S2#executive-summary` + coverage-summary table (~57) | section | replace | `test-design-qa.md` § Executive summary | The ~57 total is a *legacy-um planning* number; §8 forbids adding it to the other totals. | ungranted | none-yet | S7, S11, S13 |
| `legacy-um:S2#not-in-scope` (6 rows) | section | merge | `test-design-qa.md` § Not in scope | Rows 1 (§3.2 matrix owned by access-control), 5 (FR-1 seed bootstrap) and 6 (notifications/analytics) survive under v1.5; rows 2–4 need re-statement against v1.5 §§3–5. | ungranted | manual-review | — |
| `legacy-um:S2#dependencies-scoped-test-gates-backend` (10 approved rules + 3 scoped gates) | section | replace | `docs/architecture/user-management-test-decisions.md` (reference only) | Same reason as `legacy-um:S1#quick-guide-approved-planning-decisions`: the binding decision log owns these. | historical, pinned | manual-review | S13 |
| `legacy-um:S2#qa-infrastructure` (5 items) | section | merge | `test-design-qa.md` § Test infrastructure | Item 1 restates DEC-UM-010; item 5 (500+ k6 seed) merges with the platform's 500+ dataset requirement (§7.1). | ungranted | api-e2e / measurement — harness **UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); contract **A** of §7.1 (§6, F-17; §10, U-24) | S4 |
| `legacy-um:S2#factory-pattern-playwright-utils` (code example) | section | preserve | `test-design-qa.md` § Appendix — fixture pattern | `tea_use_playwright_utils = true` in `_bmad/config.toml:25` still binds; the example's `POST /users` body is retired content (AD-16) and must be re-based on a surviving route. | ungranted | api-e2e | S11 |
| `legacy-um:S2#risk-assessment-qa-view` (R-001..R-014 coverage rows) | section | merge | `test-design-qa.md` § Risk → evidence map | Per-risk in §4.1. | ungranted | see §4.1 | S11, S13 |
| `legacy-um:S2#nfr-test-coverage-plan` (NFR-1..NFR-4) | section | replace | `test-design-qa.md` § NFR measurement contracts | See §7.1: subject, dataset, statistic and environment must be stated per NFR; NFR-2's UM statement and the v1.5 All Employees statement are not the same contract. | ungranted | see §7.1 | S4, S11 |
| `legacy-um:S2#entry-criteria` (7 checkboxes) | section | replace | `test-design-qa.md` § Entry criteria | Four boxes are ticked against a 2026-08-25 state; a new document may not inherit ticked boxes. Open items carried forward in §10. | ungranted | unexecuted | S7, S11 |
| `legacy-um:S2#exit-criteria` (7 checkboxes incl. ≥80% FR coverage) | section | merge | `test-design-qa.md` § Exit criteria | Thresholds (P0 100%, P1 ≥95%, ≥80% FR coverage) survive as *stated* thresholds; all boxes reset to unticked. | ungranted | unexecuted | S11, S13 |
| `legacy-um:S2#test-coverage-plan-p0` + P0 distribution note + coverage-ownership paragraph | section | merge | `test-design-qa.md` § Coverage ownership; per-ID rows to epic plans | The P0-ratio rationale ("~14% because one plan spans four epics") is a legacy-um artefact; the new split into per-epic plans changes the denominator, so the rationale cannot be copied unchanged. Priorities are **not** normalised to satisfy a heuristic. | ungranted | see §4.3 | S11, S13 |
| `legacy-um:S2#test-coverage-plan-p1/p2/p3` | section | merge | per-epic plans (see §4.3) | Plan: "Transfer only actual scenario/risk obligations to their owning epics." | ungranted | see §4.3 | S11, S13 |
| `legacy-um:S2#mapping-existing-to-proposed` (`um-*` → `TD-UM-*`) | section | preserve | `test-design/migration-map.md` §4.3 (this table) + `test-design-qa.md` § source-to-successor map | Plan Task 3: "Retain the source-to-successor ID map." The map itself is migration metadata, not strategy. | ungranted | manual-review | S15 |
| `legacy-um:S2#execution-strategy` (PR / nightly / weekly) | section | replace | `test-design-qa.md` § Execution strategy | Superseded by measured reality in `um-epic`/`fe-epic` (§6, F-6) and by DEC-UM-010; the "one worker" rule survives, the "~10–15 min" budget does not match the 90s/19s measurements. | ungranted | unverified | S5, S6 |
| `legacy-um:S2#qa-effort-estimate` (~57 / ~3–5 weeks) | section | replace | `test-design-qa.md` § Effort | See §8 — estimates are re-derived from remaining work only, never summed across sources. | ungranted | none | S7, S11 |
| `legacy-um:S2#interworking-regression` (4 seams) | section | merge | `test-design-qa.md` § Cross-epic regression map | Per-trigger rows in §9. | ungranted | api-e2e | S4 |
| `legacy-um:S2#appendix-a-tags` | section | preserve | `test-design-qa.md` § Appendix — tags | Tag vocabulary `@P0..@P3 @API @concurrency @blocked @TD-UM-{AREA}-{NN}` is still used by surviving scenarios. Retired TD-UM tags must not stay in the active tag contract (see §4.3). | ungranted | api-e2e | S11 |
| `legacy-um:S2#appendix-b-knowledge-base-references` | section | preserve | `test-design-qa.md` § Appendix — knowledge base | Links point into `.claude/skills/bmad-testarch-test-design/resources/knowledge/`; both installations must resolve (see §5.3). | ungranted | none | S11 |
| `legacy-um:S2#approval-required-before` footer | approval-claim | retire | — | "Approval required before modifying `docs/test-cases/user-management/**`" is a 2026-08-25 gating statement. `docs/architecture/testing-strategy.md` records that stage approval was removed on 2026-09-04. Superseded; recorded historically at `76a7220`. | n/a | manual-review | S13 |

### 3.3 S3 — `test-design-architecture-platform.md` (`plat`, draft)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `plat:S3#header` | section | merge | `test-design-architecture.md` § header | Two platform architecture documents collapse into one canonical name. Origins: `plat:S3#header`, `legacy-um:S1#header`. | ungranted | none-yet | S4, S8, S14 |
| `plat:S3#executive-summary` | section | preserve | `test-design-architecture.md` § Executive summary | v1.5 scope statement is current. | ungranted | none-yet | S14 |
| `plat:S3#ownership-boundary` table (UM child / AC Phase-1 171 / deferred AC slices) | section | replace | `test-design/README.md` § Scope index + `test-design-architecture.md` § Ownership | The "approved 2026-08-25 authoritative child baseline" row is exactly what this migration dissolves; the "171 v1.5 Stage-1 scenario drafts" row points at a directory that no longer exists (§6, F-3). **Corrected in place 2026-09-10** (this row previously described the correction as pending): the real inventory at `76a7220` is `docs/test-cases/access-control-foundation/` (**10** `.md`) + `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files, machine-counted; the cited `docs/test-cases/access-control/` does not exist. Under ruling D-1 no approval state is sought for those files. | ungranted | repository-audit | S4, S8, S14 |
| `plat:S3#quick-guide-ready-now` (4 items) | section | preserve | `test-design-architecture.md` § Ready now | AD-1 staging, established seams (real HTTP + PostgreSQL, ports behind DI, facade only, live bulk resolution, synthetic seeds) remain binding via `docs/architecture/testing-strategy.md` and `access-control.md`. Item 3 (review the 171 files) is retired with the 171-file claim. | ungranted | manual-review | S14 |
| `plat:S3#explicit-product-architecture-blockers` (PR-B-01..09) | section | merge | `test-design-architecture.md` § Open blockers | Per-blocker in §5.2; several have candidate ratifications that **Task 2** must adjudicate. | ungranted | manual-review | S4, S8, S14 |
| `plat:S3#ready-for-formal-sign-off` (PR-S-01, PR-S-02) | section | preserve | `test-design-architecture.md` § Sign-off-ready packages | AD-19 / AD-20 remain binding (`docs/architecture/README.md` non-negotiables 15 and 16). Sign-off itself remains **ungranted**. | ungranted | manual-review | S4, S8, S14 |
| `plat:S3#ac-stage-1-e2e-dependencies` | section | replace | `test-design-qa.md` § Access-control dependency | Restates the 171-file inventory (§6, F-3). **Corrected in place 2026-09-10** (this row previously described the correction as pending): the real inventory at `76a7220` is `docs/test-cases/access-control-foundation/` (**10** `.md`) + `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files, machine-counted; the cited `docs/test-cases/access-control/` does not exist. Under ruling D-1 no approval state is sought for those files. | ungranted | repository-audit | S4, S14 |
| `plat:S3#established-architecture-constraints` (5 bullets) | section | preserve | `test-design-architecture.md` § Established constraints | Each bullet restates v1.5 §2.2/§4.7/§5.2 and `docs/architecture/README.md` non-negotiable 10; unchanged. | ungranted | manual-review | S14 |
| `plat:S3#platform-risk-assessment` (PR-001..010) | section | preserve | `test-design-architecture.md` § Risk register | Per-risk in §4.2. Platform `PR-*` does not renumber child `R-*` — that rule is preserved verbatim. | ungranted | see §4.2 | S4, S8, S14 |
| `plat:S3#residual-risk-rule` | section | preserve | `test-design-architecture.md` § Residual risk | "A mitigation is not complete because a design exists" is a governing rule this migration must not weaken. | ungranted | manual-review | S4 |
| `plat:S3#nfr-testability-requirements` (9 categories) | section | merge | `test-design-qa.md` § NFR measurement contracts | Origins: `plat:S3#nfr-testability-requirements`, `plat:S4#nfr-test-coverage-plan`, `legacy-um:S1#nfr-testability-requirements`, `legacy-um:S2#nfr-test-coverage-plan`, `um-epic:S5#nfr-planning`, `fe-epic:S6#nfr-planning`. Per-threshold rows in §7.1. | ungranted | see §7.1 | S4, S8 |
| `plat:S3#testability-concerns-blockers-to-fast-feedback` (6 rows) | section | preserve | `test-design-architecture.md` § Testability gaps | Rows 1–2 depend on PR-B-04/PR-B-01 adjudication (§5.2); rows 3–6 stand. | ungranted | manual-review | S4 |
| `plat:S3#architectural-improvements-needed` (4 numbered) | section | preserve | `test-design-architecture.md` § Testability gaps | Projection adapters, controllable state/time, observable decisions, cross-context consistency all remain unmet architecture asks. | ungranted | manual-review | S4 |
| `plat:S3#testability-assessment-summary` | section | merge | `test-design-architecture.md` § Testability assessment | Origins: `plat:S3#testability-assessment-summary`, `legacy-um:S1#testability-assessment-summary`. The bullet "The approved User Management child preserves bounded ownership" is retired with the child/parent split. | ungranted | manual-review | — |
| `plat:S3#risk-mitigation-plans` (7 grouped rows) | section | merge | `test-design-architecture.md` § Risk register (mitigation column) | Grouped rows expand to per-risk rows in §4.2. | ungranted | see §4.2 | S4 |
| `plat:S3#assumptions-and-dependencies` | section | preserve | `test-design-architecture.md` § Assumptions and dependencies | Assumption 1 (v1.5 overrides v1.2) and 4 (no unspecified threshold inferred) are load-bearing and must survive verbatim in meaning. | ungranted | manual-review | S4 |
| `plat:S3#risks-to-this-plan` (3 bullets) | section | replace | `test-design-architecture.md` § Risks to this plan | Bullet 2 ("child/platform drift") is discharged by removing the child/platform split; replaced by a migration-specific drift risk. | ungranted | manual-review | — |
| `plat:S3#child-references` footer | section | retire | — | Points at `test-design-architecture.md`, `test-design-qa.md` (which become the platform pair) and `docs/test-cases/access-control/README.md` (which does not exist). Dead pointer; the index replaces it. | n/a | none | — |

### 3.4 S4 — `test-design-qa-platform.md` (`plat`, draft)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `plat:S4#header` | section | merge | `test-design-qa.md` § header | Origins: `plat:S4#header`, `legacy-um:S2#header`. | ungranted | none-yet | S8, S14 |
| `plat:S4#executive-summary` + coverage-state vocabulary (6 states) | section | preserve | `test-design-qa.md` § Coverage-state vocabulary | The six-state vocabulary (READY NOW / READY FOR FORMAL SIGN-OFF / PRODUCT-ARCH BLOCKED / AC STAGE-1 DRAFT / E2E DEPENDENCY / OUT OF SCOPE) is the mechanism that stops drafts being counted as coverage (`plat:PR-009`). Preserve verbatim. | ungranted | repository-audit | S8, S14 |
| `plat:S4#child-ownership` (UM + AC paragraphs) | section | replace | `test-design/README.md` § Scope index | Child/parent framing dissolves; UM becomes epic plans, AC keeps its own scope. The "45 existing Stage-1 files" and "171 draft files" counts are both stale (§6, F-3, F-4). **Corrected in place 2026-09-10** (this row previously described the correction as pending): the real inventory at `76a7220` is `docs/test-cases/access-control-foundation/` (**10** `.md`) + `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files, machine-counted; the cited `docs/test-cases/access-control/` does not exist. Under ruling D-1 no approval state is sought for those files. The "45 existing Stage-1 files" figure is a separate stale count handled as a `factual-claim` under F-4 and is **not** corrected here. | ungranted | repository-audit | S8, S14 |
| `plat:S4#planning-volume` table (~79–124 rows) | section | replace | `test-design-qa.md` § Planning volume | Interval survives as a *platform planning* interval only; §8 forbids summing it with 57/59/85. | ungranted | none | S8 |
| `plat:S4#not-in-scope` (7 rows) | section | preserve | `test-design-qa.md` § Not in scope | Each row cites a v1.5 GOOD TO HAVE or §10 exclusion, or AD-3. Unchanged. | ungranted | manual-review | S14 |
| `plat:S4#dependencies-product-and-architecture-decisions` (PR-B table) | section | merge | `test-design-architecture.md` § Open blockers | Duplicate of `plat:S3#explicit-product-architecture-blockers`; the plan requires one owner for shared policy. Origins: both. | ungranted | manual-review | S8, S14 |
| `plat:S4#ready-for-formal-sign-off` | section | merge | `test-design-architecture.md` § Sign-off-ready packages | Origins: `plat:S3#ready-for-formal-sign-off`, `plat:S4#ready-for-formal-sign-off`, `plat:S14#ready-for-formal-sign-off`. | ungranted | manual-review | S8, S14 |
| `plat:S4#e2e-and-integration-dependencies` (7 numbered) | section | preserve | `test-design-qa.md` § Execution dependencies | Item 1's "171 files" inventory is corrected; items 2–7 stand (§6, F-3). **Corrected in place 2026-09-10** (this row previously described the correction as pending): the real inventory at `76a7220` is `docs/test-cases/access-control-foundation/` (**10** `.md`) + `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files, machine-counted; the cited `docs/test-cases/access-control/` does not exist. Under ruling D-1 no approval state is sought for those files. | ungranted | manual-review | S14 |
| `plat:S4#risk-assessment` (PR-001..010, QA view) | section | merge | `test-design-qa.md` § Risk → evidence map | The plan splits risk *rationale* (architecture) from risk *evidence* (QA). Origins: `plat:S3#platform-risk-assessment`, `plat:S4#risk-assessment`. | ungranted | see §4.2 | S8, S14 |
| `plat:S4#normative-coverage-map` §2–§3 (43 rows) | section | preserve | `test-design-qa.md` § Normative coverage map | Per-ID rows in §5.6. | ungranted | see §5.6 | S14 |
| `plat:S4#normative-coverage-map` §4 (49 rows) | section | preserve | `test-design-qa.md` § Normative coverage map | Per-ID rows in §5.6. | ungranted | see §5.6 | S14 |
| `plat:S4#normative-coverage-map` §5–§9 (27 rows) | section | preserve | `test-design-qa.md` § Normative coverage map | Per-ID rows in §5.6. | ungranted | see §5.6 | S14 |
| `plat:S4#nfr-test-coverage-plan` (10 rows) | section | merge | `test-design-qa.md` § NFR measurement contracts | Per-threshold rows in §7.1. | ungranted | see §7.1 | S8 |
| `plat:S4#unknown-and-not-guessed` paragraph | section | preserve | `test-design-qa.md` § Unknown thresholds | **Load-bearing.** WCAG level, viewport set, concurrent-user/load model, percentile definition for the 2-second result, retry/backoff counts, uptime SLO, retention, non-departure observability thresholds stay UNKNOWN. Never fill these in. | ungranted | none | S8, S14 |
| `plat:S4#entry-criteria` (8 checkboxes) | section | replace | `test-design-qa.md` § Entry criteria | All unticked at source; they stay unticked. | ungranted | unexecuted | S8 |
| `plat:S4#exit-criteria` (8 checkboxes) | section | preserve | `test-design-qa.md` § Exit criteria | All unticked; thresholds survive. | ungranted | unexecuted | S8 |
| `plat:S4#p0-p3-coverage-plan` (P0/P1/P2/P3-PLAT rows) | section | merge | `test-design-qa.md` § Coverage plan | Per-row in §5.7. | ungranted | see §5.7 | S8 |
| `plat:S4#execution-strategy` (PR / nightly / weekly / pre-release) | section | merge | `test-design-qa.md` § Execution strategy | Origins: `plat:S4#execution-strategy`, `legacy-um:S2#execution-strategy`, `um-epic:S5#execution-strategy`, `fe-epic:S6#execution-strategy`. Constraint rows in §5.1. | ungranted | unverified | S8 |
| `plat:S4#qa-effort-estimate` (~12–20 weeks) | section | replace | `test-design-qa.md` § Effort | See §8. | ungranted | none | S8 |
| `plat:S4#interworking-regression` (9 seams) | section | merge | `test-design-qa.md` § Cross-epic regression map | Per-trigger rows in §9. Origins: `plat:S4#interworking-regression`, `legacy-um:S2#interworking-regression`. | ungranted | api-e2e | — |
| `plat:S4#release-and-design-gates` (DG-01..05, PG-01..06) | section | preserve | `test-design-qa.md` § Release and design gates | Per-gate rows in §5.8. | ungranted | manual-review | S14 |
| `plat:S4#appendix-a-playwright-utils-pattern` | section | merge | `test-design-qa.md` § Appendix — fixture pattern | Origins: `plat:S4#appendix-a`, `legacy-um:S2#factory-pattern`. The "no code is included / test generation forbidden" boundary is preserved. | ungranted | none | — |
| `plat:S4#appendix-b-knowledge-base-references` | section | merge | `test-design-qa.md` § Appendix — knowledge base | Origins: `plat:S4#appendix-b` (`.agents/` paths), `legacy-um:S2#appendix-b` (`.claude/` paths). Both installations must resolve identically (§5.3). | ungranted | none | — |

### 3.5 S5 — `test-design-epic-user-management.md` (`um-epic`, draft)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `um-epic:S5#frontmatter` (`runKey: user-management`, `mode: epic-level`, `workflowStatus: complete`) | section | replace | `test-design-progress-epic-user-management-{n}.md` frontmatter, one per selected epic | `runKey: user-management` is a *domain*, not an epic; the plan's identity contract requires `epic-{domain}-{number}` resolved from the canonical source `_bmad-output/planning-artifacts/user-management/epics.md` (UM-E0..UM-E8). | ungranted | none | S9 |
| `um-epic:S5#executive-summary` + level-distribution table (340 e2e / 5 unit / 0 api) | section | preserve | `test-design-qa.md` § Level strategy (shared) + owning epic plans | The level-imbalance finding is cross-epic shared policy, so the *rule* belongs to the platform QA document and the *cases* to epic plans. Counts are `unverified` at `76a7220` — no run was executed in this task. | ungranted | unverified | S9 |
| `um-epic:S5#not-in-scope` (5 rows) | section | merge | owning epic plans § Not in scope | Row 3 (mentorship) is a correctly-sourced area boundary — its own mitigation cell points at `planning-artifacts/mentorship/` — but its stated reason ("no `src/` module exists") is a backend-implementation observation, and the boundary should be restated as ownership by the live `M-E1` domain (§6, F-5). Row 5 (ACM9/P6 harnesses opt-in) stands. | ungranted | manual-review | S9 |
| `um-epic:S5#risk-assessment` (R-UM-01..08) | section | merge | `test-design-architecture.md` § Risk register (cross-cutting) + epic plans (epic-local) | Per-risk in §4.3. | ungranted | see §4.3 | S9 |
| `um-epic:S5#nfr-planning` (4 rows + unknown-thresholds note) | section | merge | `test-design-qa.md` § NFR measurement contracts | Per-threshold in §7.1. The note "NFR-2's numeric budget is not stated anywhere this design can read" is **factually contradicted** by `docs/project-requirements.md:614` (§6, F-1). | ungranted | see §7.1 | S9 |
| `um-epic:S5#level-strategy-decision-rule` (5 rows) | section | preserve | `test-design-qa.md` § Level strategy | Cross-epic shared policy; one owner, referenced by every epic plan. | ungranted | manual-review | S6 |
| `um-epic:S5#clusters-that-should-move-down` (9 clusters, 54 unit cases) | section | merge | owning epic plans | Per-cluster in §4.3. This is the substance of the design; every cluster must land in a real epic or the QA improvement backlog. | ungranted | unit | — |
| `um-epic:S5#target-ratio` (tripwire table) | section | preserve | `test-design-qa.md` § Level strategy, tripwire | Explicitly "not a mandate — a tripwire". Must not become a coverage claim. | ungranted | repository-audit | — |
| `um-epic:S5#test-coverage-plan` P0/P1/P2 (59 cases) | section | merge | owning epic plans § Coverage | Per-row in §4.3. | ungranted | unit + api-e2e | — |
| `um-epic:S5#execution-strategy` (PR / nightly / weekly + parallelization note) | section | merge | `test-design-qa.md` § Execution strategy | Constraint rows in §5.1. `--runInBand` and shared-database isolation are the backend statement of DEC-UM-010; they must stay separate from the frontend browser-parallelism statement. | ungranted | unverified | S6 |
| `um-epic:S5#residual-risk` (4 bullets) | section | preserve | owning epic plans § Residual risk | Each bullet travels with its risk (§4.3). | ungranted | manual-review | — |
| `um-epic:S5#entry-criteria` (3 checkboxes) | section | replace | owning epic plans § Entry criteria | Box 3 (where unit specs live) is an unresolved open decision — §10, U-12. | ungranted | unexecuted | — |
| `um-epic:S5#exit-criteria` (4 checkboxes) | section | merge | owning epic plans § Exit criteria | The "unit share ≥15%" tripwire is cross-epic; the R-UM-02 closure condition is epic-local. | ungranted | unexecuted | — |
| `um-epic:S5#handoff` | section | replace | `test-design/people-management-handoff.md` § Level-strategy handoff | Single canonical platform handoff. The rule "new unit cases must not claim requirement coverage they do not have" is preserved verbatim. | ungranted | repository-audit | — |

### 3.6 S6 — `test-design-epic-frontend.md` (`fe-epic`, draft)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `fe-epic:S6#frontmatter` (`runKey: frontend`) | section | retire | — (identity retired; obligations re-homed, see below) | **`frontend` is not an epic.** No `_bmad-output/planning-artifacts/frontend/epics.md` exists; the plan states explicitly "do not use `frontend` as a fictitious epic". The identity is retired; every obligation is re-homed by §4.4. | n/a | none | S10 |
| `fe-epic:S6#executive-summary` + level table (124 e2e / 0 component / 0 unit) | section | preserve | `test-design-qa.md` § Level strategy (frontend section) | The plan's target table gives the QA document "separate backend/frontend/contract/live-integration sections". Counts `unverified` at `76a7220`. | ungranted | unverified | S10 |
| `fe-epic:S6#not-in-scope` (5 rows) | section | merge | `test-design-qa.md` § Not in scope (frontend) + owning epic plans | Row 2 (`components/ui/**` vendored) and row 5 (contract shapes owned by `contract/`) are shared conventions; rows 3–4 are unresolved product decisions (§10, U-10, U-11). | ungranted | manual-review | — |
| `fe-epic:S6#risk-assessment` (R-FE-01..07) | section | merge | `test-design-architecture.md` § Risk register + owning epic plans | Per-risk in §4.4. | ungranted | see §4.4 | S10 |
| `fe-epic:S6#nfr-planning` (5 rows + unknown-thresholds note) | section | merge | `test-design-qa.md` § NFR measurement contracts (frontend) | Per-threshold in §7.1. "Their absence is a planning gap, not a passing grade" is preserved verbatim. | ungranted | see §7.1 | S10 |
| `fe-epic:S6#level-strategy-decision-rule` (5 rows) | section | merge | `test-design-qa.md` § Level strategy (frontend) | Origins: `um-epic:S5#level-strategy-decision-rule`, `fe-epic:S6#level-strategy-decision-rule`. One shared rule with a per-stack table. | ungranted | manual-review | S5 |
| `fe-epic:S6#concrete-targets` — unit `src/lib` (5 modules, 45 cases) | section | merge | owning epic plans + QA improvement backlog | Per-module in §4.4. | ungranted | unit | — |
| `fe-epic:S6#concrete-targets` — component (13 feature components, 40 cases) | section | merge | owning epic plans + QA improvement backlog | Per-component in §4.4. | ungranted | component | — |
| `fe-epic:S6#target-ratio` | section | merge | `test-design-qa.md` § Level strategy, tripwire | Origins: `um-epic:S5#target-ratio`, `fe-epic:S6#target-ratio`. | ungranted | repository-audit | — |
| `fe-epic:S6#test-coverage-plan` P0/P1/P2 (85 cases) | section | merge | owning epic plans § Coverage | Per-row in §4.4. | ungranted | unit + component | — |
| `fe-epic:S6#execution-strategy` + parallelization note | section | merge | `test-design-qa.md` § Execution strategy (frontend) | Constraint rows in §5.1. Playwright browser parallelism and `retries: 2` are **separate** from the backend database-isolation constraint and must not be merged into one worker rule. | ungranted | unverified | S5 |
| `fe-epic:S6#residual-risk` (4 bullets) | section | preserve | owning epic plans § Residual risk | Travels with each risk (§4.4). | ungranted | manual-review | — |
| `fe-epic:S6#entry-criteria` (4 checkboxes) | section | replace | owning epic plans § Entry criteria | Boxes 2–4 are tooling/convention decisions, still open (§10, U-12). | ungranted | unexecuted | — |
| `fe-epic:S6#exit-criteria` (5 checkboxes) | section | merge | owning epic plans § Exit criteria | The 100%-branch-coverage target for `lib/session.ts` and `lib/http.ts` is epic-local; the "no new Playwright case for browser-free logic" rule is shared. | ungranted | unexecuted | — |
| `fe-epic:S6#handoff` (FE-* ownership; two `deferred-work.md` closures) | section | merge | `test-design/people-management-handoff.md` § Level-strategy handoff | Origins: `um-epic:S5#handoff`, `fe-epic:S6#handoff`. The `deferred-work.md` **citations resolve**: the file is a workspace planning artifact, `_bmad-output/implementation-artifacts/user-management/deferred-work.md`, not a service file (§6, F-8). The two **closure** claims remain `unverified` and are not carried forward as completions — a test *design* proposes cases; only executed tests could close a deferred item, and both items are still open in that file at `76a7220` (§4.4, `fe-epic:claim/…`). | ungranted | unverified | — |

### 3.7 S7–S10 — progress checkpoints

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:S7#frontmatter` (`runScope: user-management-child`, `runKey: system`, `workflowStatus: approved`) | section | replace | `test-design-progress-system.md` frontmatter (`runScope: system-level`, `runKey: system`, approval ungranted) | Plan target table. **The old approved run must not be relabelled as a platform run** — its history stays accessible at `76a7220`. | ungranted | none | S11, S13 |
| `legacy-um:S7#approval-2026-08-25` | approval-claim | retire | — (pinned at `76a7220`) | A human approval of the 2026-08-25 UM system-level design. It does not transfer to any document this migration produces. Retired as a *current* statement; preserved as history at the baseline commit. | n/a | manual-review | S11, S13 |
| `legacy-um:S7#step-4-coverage-plan-summary` ("46 stage-1 scenario files on disk") | factual-claim | retire | — | Stale: `docs/test-cases/user-management/**` holds **152** `.md` files at `76a7220` (§6, F-4). Recorded as a historical observation, not carried forward. | n/a | repository-audit | S11 |
| `legacy-um:S7#propagation-complete` (7-row table) | approval-claim | preserve | `test-design/migration-map.md` §11 (history) | Each row names a real propagation target; `docs/architecture/user-management-test-decisions.md` exists with DEC-UM-001..012. The row "`docs/test-cases/user-management/**` — 45 files; README updated" is stale (F-4). | historical, pinned | repository-audit | S11 |
| `legacy-um:S7#validation-checklist-status` (14 boxes, 12 ticked) | approval-claim | retire | — (pinned at `76a7220`) | Ticked boxes belong to the 2026-08-25 run. A new checkpoint starts with generation-complete only; ticks do not transfer. | n/a | unexecuted | S11 |
| `legacy-um:S7#next-step` (`/bmad-testarch-atdd`) | unresolved-task | retire | — | Superseded: `docs/architecture/testing-strategy.md` records stage approval removed 2026-09-04, and the UM epic set was re-planned under v1.5. No successor task. | n/a | none | — |
| `plat:S8#frontmatter` (`runScope: platform-level`, `runKey: platform`) | section | replace | `test-design-progress-system.md` frontmatter | The plan collapses `platform` and `system` into one platform run identity `runKey: system`. | ungranted | none | S12, S14 |
| `plat:S8#checkpoint` + naming-exception paragraph | section | retire | — | The naming exception existed only to stop the platform Create run clobbering the approved UM child checkpoint. With one platform run identity, the exception has no subject. | n/a | none | S14 |
| `plat:S8#authoritative-inputs-and-outputs` | section | replace | `test-design-progress-system.md` § Inputs and outputs | New run records its own inputs by path **and content hash** plus the baseline commit (plan Task 3/4). | ungranted | none | S14 |
| `plat:S8#child-status-and-ownership` | section | replace | `test-design/README.md` § Scope index | Child/parent framing dissolved. | ungranted | repository-audit | S14 |
| `plat:S8#testability-and-platform-risks` / `#coverage-status` / `#nfr-status` | section | merge | `test-design-progress-system.md` § Summary (pointer only) | These paragraphs duplicate S3/S4 wholesale. A checkpoint records run state, not a third copy of the strategy. Origins: `plat:S8#testability-and-platform-risks`, `#coverage-status`, `#nfr-status`. | ungranted | none | S14 |
| `plat:S8#completion-and-next-step` | unresolved-task | replace | `test-design-progress-system.md` § Next step | "Run Validate mode as a separate workflow" survives as an open task; it is **unexecuted**. | ungranted | unexecuted | S12, S14 |
| `um-epic:S9#*` (whole file, 25 lines) | section | replace | `test-design-progress-epic-user-management-{n}.md`, one per selected epic | `runKey: user-management` is a domain, not an epic. Its "Inputs read" cites `tea-trace-coverage-matrix-repo-2026-09-06.json` **as of commit `1edec31`** — a correctly anchored *historical* statement about a dated file that the canonical-naming convention has since removed. Do not rewrite it to the canonical name; that would change what it says. | ungranted | none | — |
| `fe-epic:S10#*` (whole file, 25 lines) | section | retire | — (obligations re-homed by §4.4) | Same dated-matrix historical anchor as S9, same treatment. The `frontend` run identity itself is retired. | n/a | none | — |

### 3.8 S11–S12 — validation reports

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:S11#header` + `#scope` | section | replace | `test-design-validation-report.md` § header | Fresh migration-era validation with explicit scope, evaluated input paths **and content hashes**, and the baseline commit (plan target table). | ungranted | unexecuted | S13 |
| `legacy-um:S11#delta-from-prior-validation` (4 resolved gaps) | approval-claim | retire | — (pinned at `76a7220`) | Evaluates a first-pass state of documents that this migration replaces. Historical only. | n/a | manual-review | — |
| `legacy-um:S11#artifact-snapshot` (line counts) | factual-claim | retire | — | Line counts of the superseded set. Two are already wrong at `76a7220` (`test-design-progress-system.md` listed as 102 lines; actual 89). Historical only. | n/a | repository-audit | — |
| `legacy-um:S11#overall-verdict` ("PASS — Approved for ATDD") | approval-claim | retire | — (pinned at `76a7220`) | **The single most dangerous statement to carry forward.** A PASS on the 2026-08-25 UM documentation checklist. The new canonical documents inherit **no** verdict. Recorded as history at the baseline commit; never copied into a dated current-evidence directory. | n/a | manual-review | S13 |
| `legacy-um:S11#critical-findings` (4 WARNs + 5 human/external gates) | approval-claim | retire | — (pinned at `76a7220`) | Findings against superseded documents. WARN 3 (P0 ratio) and WARN 4 (architecture length) are template observations whose denominators change under the new structure. | n/a | manual-review | — |
| `legacy-um:S11#checklist-evaluation-full` (§§1–10, ~110 criteria rows) | approval-claim | retire | — (pinned at `76a7220`) | The full checklist result for the superseded artifact set. A fresh Validate run produces its own. | n/a | unexecuted | — |
| `legacy-um:S11#completion-criteria-strict` ("Strict overall: FAIL") | approval-claim | retire | — (pinned at `76a7220`) | Same reason. Note the source itself carries **two intentionally distinct verdicts** (documentation WARN, strict FAIL) — the new report must keep that distinction rather than collapsing to one. | n/a | unexecuted | — |
| `legacy-um:S11#post-workflow-actions-status` / `#sign-off-block` / `#self-review` | approval-claim | retire | — (pinned at `76a7220`) | Historical run metadata. The self-review line "`workflow.on_complete` resolver returned empty — no post-hook action" is a useful precedent for Task 5's hook confinement, cited but not copied. | n/a | manual-review | — |
| `plat:S12#*` (whole 15-line supersession notice) | section | replace | `test-design-validation-report.md` § Supersession history | The notice's core statement — a refreshed Create run carries **no** validation verdict and requires a separate Validate run — is exactly the invariant the migration must preserve. Its own claim "the current 171-file Access Control suite" is stale (§6, F-3). **Corrected inventory (2026-09-10):** the real suite at `76a7220` is `access-control-foundation/` (10) + `access-control-kernel/` (91) = **101** files, not 171. | ungranted | unexecuted | S8, S14 |

### 3.9 S13–S14 — handoffs

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:S13#frontmatter` (`status: approved`, `projectName: people management`) | section | replace | `test-design/people-management-handoff.md` frontmatter | Plan target table: single platform handoff at this exact path, "explicitly selected despite configured project display name `people management`". `_bmad/config.toml:14` sets `project_name = "people management"` (with a space) while `workflow.yaml:49` derives `{test_artifacts}/test-design/{project_name}-handoff.md`; the hyphenated filename is therefore **not** derivable from config and must be pinned by the Task 4 contract. | ungranted | none | S14 |
| `legacy-um:S13#purpose` | section | replace | handoff § Purpose | Scope becomes platform. | ungranted | none | — |
| `legacy-um:S13#tea-artifacts-inventory` (4 rows) | section | merge | `test-design/README.md` § Current artifacts | Origins: `legacy-um:S13#tea-artifacts-inventory`, `plat:S14#authority-and-artifact-inventory`. The index owns the inventory; the handoff references it. | ungranted | repository-audit | — |
| `legacy-um:S13#epic-level-integration-guidance` (4 epic gate rows) | section | merge | epic plans (UM Epics 1–4) | Per-epic in §4.3. Epic titles ("Employee Record Lifecycle", "Magic-Link Auth", "Career Timeline", "Organizational Relationships") must be re-sourced from `_bmad-output/planning-artifacts/user-management/epics.md`, where Epic 1 is "Employee Record Management" and Epics 5–8 also exist. | ungranted | api-e2e | — |
| `legacy-um:S13#recommended-quality-gates` (4 numbered) | section | merge | `test-design-qa.md` § Release and design gates | Gate 1 (AD-1 scenario before stage 2) is superseded in its approval form by the 2026-09-04 stage-approval removal; gates 2–4 survive. Origins: this + `plat:S4#release-and-design-gates`. | ungranted | manual-review | — |
| `legacy-um:S13#story-level-integration-guidance` (12 story rows) | section | merge | epic plans § Story mapping | Story IDs (1.1..4.2) must be re-sourced to canonical `UM-E{n}-S{n.m}` identities; Story 1.4 "Deactivate" has no canonical successor under AD-16/AD-22 (retired, see §4.3). | ungranted | api-e2e | — |
| `legacy-um:S13#data-testid-requirements` (3 selectors) | section | merge | `test-design-qa.md` § Frontend section | The frontend now exists with 124 Playwright cases; the "deferred — API-first gate" framing is stale. Origins: this + `fe-epic:S6#concrete-targets`. | ungranted | component | — |
| `legacy-um:S13#risk-to-story-mapping` (R-001..R-014) | section | merge | `test-design-qa.md` § Risk → evidence map | Per-risk in §4.1. | ungranted | see §4.1 | — |
| `legacy-um:S13#recommended-bmad-tea-workflow-sequence` (7 steps; steps 1–3 marked complete) | approval-claim | retire | — (pinned at `76a7220`) | Steps marked complete describe 2026-08-25 state. Sequence is replaced by the platform handoff's own. | n/a | manual-review | — |
| `legacy-um:S13#phase-transition-quality-gates` (5 rows) | section | merge | handoff § Phase transition gates | Origins: this + `plat:S14#phase-transition-gates`. | ungranted | manual-review | — |
| `legacy-um:S13#follow-up-actions-for-product-architecture` (6 numbered) | section | retire | — | Items 1–5 are propagated (DEC-UM-001..011); item 6 ("approve the complete test design and the new Epic 4 + Story 1.5 scenario scope") refers to an approval this migration explicitly does not carry forward. | n/a | manual-review | — |
| `plat:S14#frontmatter` (`projectName: people-management-platform`, `status: draft`) | section | merge | `test-design/people-management-handoff.md` frontmatter | Two handoffs collapse to one. Origins: `legacy-um:S13#frontmatter`, `plat:S14#frontmatter`. **The surviving path is the hyphenated `people-management-handoff.md`; `people-management-platform-handoff.md` is retired.** | ungranted | none | S3, S8, S12 |
| `plat:S14#purpose-and-status` | section | preserve | handoff § Purpose and status | Includes the invariant "This Create run is not validated or approved" — preserve. | ungranted | none | — |
| `plat:S14#authority-and-artifact-inventory` (v1.5 authority order + 9-row table) | section | replace | `test-design/README.md` § Current artifacts + handoff § Authority order | The authority order (v1.5 → PRD/addendum → spine → TEA planning) survives; the inventory rows for the UM child, the 171 AC files and the historical platform validation all change (§6, F-3). **Corrected inventory (2026-09-10):** the real suite at `76a7220` is `access-control-foundation/` (10) + `access-control-kernel/` (91) = **101** files, not 171. | ungranted | repository-audit | — |
| `plat:S14#planning-state-boundaries` (READY NOW / SIGN-OFF / BLOCKED / E2E DEPENDENCY) | section | merge | `test-design-qa.md` § Coverage-state vocabulary | Origins: `plat:S4#executive-summary` vocabulary, `plat:S14#planning-state-boundaries`. | ungranted | repository-audit | — |
| `plat:S14#epic-and-domain-integration-guidance` (13 rows) | section | replace | `test-design/README.md` § Scope index + epic plans | Rows must be re-keyed to the canonical epic identities in §12 (twelve domain `epics.md` files, `UM-E*`, `PLAT-E*`, `PMC-E*`, `RA-E*`, `TT-E*`, `RS-E*`, `RISK-E*`, `CDS-E*`, `M-E*`, `PSH-E*`, `FB-E*`, `ENG-E*`). | ungranted | repository-audit | — |
| `plat:S14#story-level-mapping-rules` (6 numbered + 7 acceptance-intent bullets) | section | preserve | handoff § Story mapping rules | Rule 3 ("without renumbering child UM `R-*` risks") is preserved and generalised by the scope keys in §1.2. Rule 6 ("avoid invented thresholds") is load-bearing. | ungranted | manual-review | — |
| `plat:S14#risk-to-domain-mapping` (PR-001..010) | section | merge | `test-design-qa.md` § Risk → evidence map | Per-risk in §4.2. | ungranted | see §4.2 | — |
| `plat:S14#recommended-bmad-tea-workflow-sequence` (9 steps) | section | preserve | handoff § Workflow sequence | No step is marked complete; nothing to reset. | ungranted | manual-review | — |
| `plat:S14#phase-transition-gates` (11 rows) | section | merge | handoff § Phase transition gates | Origins: `legacy-um:S13#phase-transition-quality-gates`, `plat:S14#phase-transition-gates`. | ungranted | manual-review | — |
| `plat:S14#handoff-boundary` | section | preserve | handoff § Boundary | "This document provides planning integration only" — preserve verbatim in meaning. | ungranted | none | — |

### 3.10 S15 — `critical-review-existing-artifacts.md` (`legacy-um`, approved 2026-08-25)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:S15#header` (subjects reviewed / authoritative sources / intent evidence) | section | preserve | *(document stays in place, unmodified)* | The plan does not list this file as a migration target. It is a dated audit of a 2026-08-25 state; rewriting it would rewrite what a prior review evaluated. It remains a historical document; the index links it as history, not as current guidance. | historical, pinned | manual-review | S1, S2, S7, S11, S13 |
| `legacy-um:S15#executive-summary` (5 numbered findings) | section | preserve | *(document stays in place, unmodified)* | The plan does not list `critical-review-existing-artifacts.md` as a migration target, and this summary is a dated audit finding about a 2026-08-25 state. Rewriting it would rewrite what a prior review evaluated. It stays in place as history; the index links it as history, not as current guidance. | historical, pinned | manual-review | — |
| `legacy-um:S15#reconciliation-ledger` — source contradictions C-01..C-07 | section | merge | `docs/architecture/user-management-test-decisions.md` (already) + §5.4 of this ledger | Already propagated to DEC-UM-001/002/011 etc. Per-ID in §5.4. | historical, pinned | manual-review | S1, S2 |
| `legacy-um:S15#approved-intent-decisions` — A-01/A-02/A-03/A-06 | section | merge | `docs/architecture/user-management-test-decisions.md` DEC-UM-004/002/003/005 | Already propagated. Per-ID in §5.4. | historical, pinned | manual-review | S1, S2 |
| `legacy-um:S15#previously-open-questions` — OQ1..OQ5 | section | merge | `docs/architecture/user-management-test-decisions.md` DEC-UM-006/007/008/009/010 | Already propagated; **two of the five are now RETIRED** by v1.5 (DEC-UM-006, DEC-UM-008). Per-ID in §5.4. | historical, pinned | manual-review | S1, S2 |
| `legacy-um:S15#1-unsupported-assumptions` (A-01..A-07) | section | preserve | *(in place)* | Audit snapshot. A-07 (no guidance on unit tests below the gate) is the same finding `um-epic:S5` re-derives independently. | historical, pinned | manual-review | — |
| `legacy-um:S15#2-contradictions-between-sources` (C-01..C-07) | section | preserve | *(in place)* | Audit snapshot. | historical, pinned | manual-review | — |
| `legacy-um:S15#3-incorrect-test-levels` (7 rows) | section | merge | `test-design-qa.md` § Level strategy | Origins: this, `um-epic:S5#level-strategy`, `fe-epic:S6#level-strategy`. The three level-selection findings are the same finding reached three times, ~13 months of artefact apart in document time. | ungranted | manual-review | S5, S6 |
| `legacy-um:S15#4-duplicated-coverage` (6 pairs) | section | preserve | *(in place)*; verdicts referenced from the epic plans | Each verdict ("not duplicate", "partial duplicate", "dependency, not duplicate") is a preserved judgement about scenario pairs that still exist on disk. | historical, pinned | manual-review | — |
| `legacy-um:S15#5-coverage-gaps` (G-01..G-16) | section | merge | epic plans + QA improvement backlog | Per-gap in §5.5. | ungranted | see §5.5 | — |
| `legacy-um:S15#6-controllability-observability-reliability-isolation` (7 rows) | section | merge | `test-design-architecture.md` § Testability gaps | Origins: this + `plat:S3#testability-concerns`. | ungranted | manual-review | — |
| `legacy-um:S15#7-scenarios-that-cannot-reliably-prove` (6 rows) | section | preserve | *(in place)*; live remediations referenced from epic plans | Rows for `um-auth-02`, `um-reg-08`, `um-deact-02`, `um-ct-03`, `um-reg-05` refer to scenario files that still exist; the NFR-2 row merges into §7.1. | historical, pinned | manual-review | — |
| `legacy-um:S15#8-testing-strategy-review-notes` | section | retire | — | Reviewed `docs/architecture/testing-strategy.md` at a 2026-08-25 state; that document has since been substantially rewritten (ACM-9 protocol, stage-approval removal). The review's conclusions were propagated (DEC-UM-010). No current successor. | n/a | manual-review | — |
| `legacy-um:S15#9-spec-md-review-notes` ("28 scenario files") | factual-claim | retire | — | Stale count (§6, F-4). Historical only. | n/a | repository-audit | — |
| `legacy-um:S15#10-recommendations-before-modifying-existing-artifacts` (7 numbered) | section | retire | — | Recommendations 1, 2, 3, 6 are discharged (propagation complete, DEC-UM-010 binding). Recommendation 5 (add Epic 4 and Story 1.5 folders) is discharged — both exist on disk. Recommendation 7 ("do not merge existing `um-*` IDs into the new design — map old → new") survives as the source-to-successor map obligation, already captured by `legacy-um:S2#mapping-existing-to-proposed`. | n/a | manual-review | — |
| `legacy-um:S15#next-step` | unresolved-task | retire | — | Same reason as `legacy-um:S7#next-step`. | n/a | none | — |

---

## 4. Risk-identifier ledger

All rows: `source_commit` = `76a7220`. `source_path` is fixed per sub-table by §1.1a.

### 4.1 `legacy-um` risks — `test-design-architecture.md` / `test-design-qa.md` / `test-design/people-management-handoff.md`

Scope key prefix `legacy-um:` is mandatory: these bare `R-0nn` identifiers collide with
nothing today only because nothing else uses bare `R-0nn`, and the platform document
explicitly warns "Platform `PR-*` does not renumber child UM `R-*`".

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:R-001` (SEC 3×3=9, controller bypasses AccessControl facade) | risk | preserve | `test-design-architecture.md` § Risk register → `plat:PR-001` family; epic obligation to `test-design-epic-user-management-0.md` | `docs/architecture/README.md` non-negotiable 7 (facade only) and PM/AD-9 keep this live. UM Epic 0 "Access Control Adoption" is its canonical owner. Score 9 is preserved; it is **not** renormalised. | ungranted | api-e2e per route class | S2, S11, S13 |
| `legacy-um:R-002` (DATA 2×3=6, User mutation without paired `UserEvents` write) | risk | preserve | `test-design-epic-user-management-3.md` § Risk | PM/AD-11 same-transaction rule still binding (`docs/architecture/database-schema.md`). Career Timeline = UM Epic 3. | ungranted | api-e2e + integration failure-path | S2, S11, S13 |
| `legacy-um:R-003` (SEC 6, approved auth security not yet normative) | risk | retire | — | **The risk was that the decision was not yet in a normative artifact.** It now is: `docs/architecture/user-management-test-decisions.md` DEC-UM-004. The risk is discharged; the *behaviour* it protected survives as DEC-UM-004 obligations (§5.4) and `legacy-um:TD-UM-AUTH-02/04/05`. Retirement authority: DEC-UM-004 exists and is binding. | n/a | manual-review (propagation confirmed) | S2, S11, S13 |
| `legacy-um:R-004` (DATA 6, approved reject-then-retry not yet normative) | risk | retire | — | Same shape: DEC-UM-005 exists. Behaviour survives as `legacy-um:TD-UM-REL-03`. Retirement authority: DEC-UM-005. | n/a | manual-review | S2, S11, S13 |
| `legacy-um:R-005` (PERF 6, NFR-2 untestable without load harness) | risk | replace | `test-design-architecture.md` § Risk register, All-Employees-list performance risk; merges with `plat:PR-006` | Subject changes: `legacy-um:R-005` names `GET /users` at 500 rows; v1.5 §7 names the **All Employees list with 500+ records, arbitrary filters and derived fields, including permission resolution**. Same family, different measurement subject (§7.1). Harness ownership also changed — a k6 harness was assumed; the repository has ACM-9 and P6 harnesses that measure a *different* subject (§7.1). | ungranted | measurement — harness **UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); on the composed directory route; contract **A** of §7.1 (§6, F-17; §10, U-24) | S2, S11, S13 |
| `legacy-um:R-006` (TECH 4, Prisma unique violation → `500` not `409`) | risk | preserve | `test-design-epic-user-management-1.md` § Risk | `docs/architecture/api-conventions.md` stable error mapping. Owner: UM Epic 1 (import/profile writers). | ungranted | unit (mapper) + api-e2e | S2, S13 |
| `legacy-um:R-007` (DATA 4, normalization drift API vs DB) | risk | preserve | `test-design-epic-user-management-1.md` § Risk | DEC-UM-007 KEPT and reconciled to the import writer; normalization is canonical-at-write. | ungranted | unit + api-e2e | S2, S13 |
| `legacy-um:R-008` (OPS 4, parallel E2E state collision) | risk | merge | `test-design-qa.md` § Execution strategy (backend isolation) | Origins: `legacy-um:R-008`, `um-epic:R-UM-04`. Both describe shared-database isolation. DEC-UM-010 is the binding rule. **The frontend browser-parallelism statement is a separate constraint and is not merged here** (§5.1). | ungranted | repository-audit + api-e2e | S2, S13 |
| `legacy-um:R-009` (BUS 4, deactivated user can still request magic link) | risk | preserve | `test-design-epic-user-management-2.md` § Risk | Survives as the subject of draft `DEC-UM-012`. **Approval status is `draft-decision`** — DEC-UM-012 is explicitly "not covered by the 2026-08-25 product approval that settled DEC-UM-001..011". | draft-decision | api-e2e | S2, S13 |
| `legacy-um:R-010` (TECH 3, AD-11 CHECK/UNIQUE raw SQL migration drift) | risk | preserve | `test-design-epic-user-management-4.md` § Risk | PM/AD-11 constraints in `docs/architecture/database-schema.md`. | ungranted | migration review + api-e2e | S2, S13 |
| `legacy-um:R-011` (BUS 2, rehire could create a second identity) | risk | preserve | `test-design-epic-user-management-1.md` § Risk | DEC-UM-009 KEPT and reframed to the seed/import writer: "no writer creates a second row for a normalized email that already exists". | ungranted | api-e2e (import) | S2, S13 |
| `legacy-um:R-012` (OPS 2, PII in test fixtures/logs) | risk | merge | `test-design-qa.md` § Privacy (merges with `plat:PR-010`, `plat:TR-7-02`) | Origins: `legacy-um:R-012`, `plat:PR-010`, `plat:TR-7-02`. v1.5 §7 privacy rule and `docs/architecture/README.md` seeded-population rule. | ungranted | ci-scan + manual provenance audit | S2, S13 |
| `legacy-um:R-013` (TECH 1, Epic 2 blocked on Epic 1 HTTP for a User row) | risk | retire | — | Premised on Epic 1 exposing an HTTP create path. PM/AD-16 removes employee creation entirely; Epic 2 fixtures seed through the import/seed path. Retirement authority: PM/AD-16, PM/AD-21, DEC-UM-006/008 RETIRED. No successor obligation. | n/a | none | S2, S13 |
| `legacy-um:R-014` (BUS 1, manual `mentorship_end` backfill mistaken for the automatic path) | risk | preserve | `test-design-epic-user-management-3.md` § Risk (with a cross-reference to mentorship `M-E1`) | DEC-UM-011 records the manual-vs-automatic distinction. The automatic path now belongs to the mentorship domain (`M-E1-S1.4`), so the risk spans two epics and must be cross-referenced, not duplicated. | ungranted | api-e2e | S2, S13 |

### 4.2 `plat` risks — `test-design-architecture-platform.md` / `test-design-qa-platform.md` / `test-design/people-management-platform-handoff.md`

All ten preserve their identifier, score and P×I. **No score is renormalised by this
migration**, and no risk closes because a design exists (`plat:S3#residual-risk-rule`).

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `plat:PR-001` (SEC 3×3=9, projection/leak paths) | risk | preserve | `test-design-architecture.md` § Risk register `PR-001`; evidence in `test-design-qa.md` § Risk → evidence map | v1.5 §3.3 and PM/AD-9/AD-10 unchanged. Architecture owns rationale; QA owns evidence — plan's ownership split. | ungranted | api-e2e + manual security review | S4, S8, S14 |
| `plat:PR-002` (SEC 9, stale graph/sync/outage/departure retains access) | risk | preserve | same pattern | PM/AD-10, AD-19, AD-20 and `docs/architecture/access-control.md`. | ungranted | api-e2e with controllable clock; integration-live | S4, S8, S14 |
| `plat:PR-003` (DATA 9, PP contract before sign-off / without CC-07 journal) | risk | preserve | same pattern | PM/AD-19 binding (`README.md` non-negotiable 15). PR-S-01 sign-off remains **ungranted** (§5.2). | ungranted | manual sign-off trace + api-e2e + concurrency | S4, S8, S14 |
| `plat:PR-004` (SEC 9, full-profile overlay precedence unresolved) | risk | preserve | same pattern | Blocked on `PR-B-06 / CC-05` (§5.2), still open. | ungranted | api-e2e projection positives/negatives | S4, S8, S14 |
| `plat:PR-005` (TECH 9, unknown timetracker contract) | risk | preserve | same pattern | Blocked on `PR-B-08` (§5.2). Note `docs/integrations/timetracker-external-api.json` is referenced by `PLAT-E1-S1.6` with an explicit "untracked at the ratification pin" caveat — Task 2 must not treat that file's presence as contract resolution. | ungranted | contract review + integration-live | S4, S8, S14 |
| `plat:PR-006` (PERF 2×3=6, arbitrary fields + bulk resolution may breach ≤2s at 500+) | risk | merge | `test-design-architecture.md` § Risk register `PR-006` | Origins: `plat:PR-006`, `legacy-um:R-005`. Both are the All Employees list latency risk. **Measurement subject must be stated explicitly** and kept distinct from ACM-9 (facade resolver) and P6 (`resolveAudiences`) — §7.1. | ungranted | measurement — harness **UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); on the composed directory route; contract **A** of §7.1 (§6, F-17; §10, U-24) | S4, S8, S14 |
| `plat:PR-007` (DATA 6, dashboard/resourcing/campaign aggregate drift) | risk | preserve | same pattern | Partly re-gated: `docs/architecture/dashboards.md` (PM/AD-33, AD-18) now defines fixed dashboard read models. Whether that closes `PR-B-02` is **Task 2's adjudication** (§5.2). | ungranted | contract review + cross-context api-e2e | S4, S8, S14 |
| `plat:PR-008` (OPS 6, departure contract before sign-off / without AD-20 controls) | risk | preserve | same pattern | PM/AD-20 binding (`README.md` non-negotiable 16). `PR-S-02` sign-off **ungranted**; `PR-B-09` operational envelope open. | ungranted | worker evidence + deployment rehearsal | S4, S8, S14 |
| `plat:PR-009` (OPS 6, treating draft AC files as coverage) | risk | replace | `test-design-architecture.md` § Risk register `PR-009` (restated against the current AC suite) | The risk survives, its *subject* does not: the "171 Phase-1 files" it names are not on disk at `76a7220` (§6, F-3). Restate against `docs/test-cases/access-control-foundation/` (10 files) and `docs/test-cases/access-control-kernel/` (91 files) under the §5.6 preamble's reconciled instruction — **not** by first establishing an approval state, which is no longer a state those files carry (§6, F-12). **Task 2 restatement (D-1) — disposition unchanged (`replace`); the risk is now supported by *stronger* current evidence than the removed gate gave it.** Corrected subject: `docs/test-cases/access-control-foundation/` (10 `.md`) + `docs/test-cases/access-control-kernel/` (91 `.md`) = **101** files. Corrected basis: the "draft versus approved scenario" half is retired under D-1 (a `docs/test-cases/**` scenario is present or absent). What survives is the ordering rule — `docs/architecture/testing-strategy.md:5–23` (scenario document → committed-red Stage-2 test → production code) and the **ordering half only** of `docs/architecture/README.md` non-negotiables 1–2. **Their approval half is not usable as authority**: non-negotiable 1 still reads "a preceding *approved* scenario doc" and non-negotiable 2 still requires "stopping for that approval", both of which D-1 supersedes (§6, F-14). The current strongest support is `testing-strategy.md:48–53`, which states plainly that removing the gate removed a real safeguard and that "**if the suites are not run in CI, nothing checks stage separation at all**" — and `um-epic:R-UM-07` records that the e2e job **is** `continue-on-error`. So the risk "a scenario document is counted as coverage" is *live and less mitigated than in 2026-08-29*, not discharged. Restated obligation: the coverage-state vocabulary must keep a present scenario document, a red Stage-2 test and green production code in three distinct states, and must never promote the first to the third. | ungranted | repository-audit | S4, S8, S14 |
| `plat:PR-010` (DATA 6, identity mismatch / real PII) | risk | merge | `test-design-architecture.md` § Risk register `PR-010` | Origins: `plat:PR-010`, `legacy-um:R-012`. `ttId`/candidate-ID durable-key rule from PM/AD-13, v1.5 §6. | ungranted | ci-scan + reconciliation report | S4, S8, S14 |

### 4.3 User Management scope — `um-epic` risks, clusters, `legacy-um` test IDs, and epic re-homing

#### 4.3a `um-epic` risks — `test-design-epic-user-management.md`

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `um-epic:R-UM-01` (TECH 3×3=9, every logic change costs a full Nest boot + migrated DB) | risk | merge | `test-design-architecture.md` § Testability gaps + `test-design-qa.md` § Level strategy | Cross-epic: it is a property of the estate, not of one epic. Origins: `um-epic:R-UM-01`, `fe-epic:R-FE-04`, `legacy-um:S15#3-incorrect-test-levels`. | ungranted | unit (feedback-latency tripwire) | S9 |
| `um-epic:R-UM-02` (SEC 9, `org:relationships:write`, `profile:timeline:write`, `employee:departure:record` exist only as string literals; bootstrap seeds three other keys) | risk | preserve | `test-design-epic-user-management-0.md` § Risk, cross-referenced from `role-administration` `RA-E1` | Access-Control-adoption seam is UM Epic 0; the permission catalog is `RA-E1-S1.1`. **The fix is a product + Access Control decision, not a test decision** — the design says so explicitly. Remains an open decision (§10, U-9). | ungranted | unit (seeded key set vs gated key set) | S9 |
| `um-epic:R-UM-03` (DATA 2×3=6, departure state machine only asserted through the worker over HTTP) | risk | preserve | `test-design-epic-user-management-5.md` § Risk | UM Epic 5 "Employment Lifecycle" (`UM-E5-S5.1`, `UM-E5-S5.2`) is the canonical owner; PM/AD-20 governs. | ungranted | unit state-transition table + api-e2e happy path + blocked-`409` path | S9 |
| `um-epic:R-UM-04` (TECH 3×2=6, e2e suites share one database) | risk | merge | `test-design-qa.md` § Execution strategy (backend isolation) | Origins: `legacy-um:R-008`, `um-epic:R-UM-04`. **Heading conflict — Task 2 reconciled it in the destination; the score is untouched.** Verified at `76a7220`: `test-design-epic-user-management.md:73` heads the first table "High-Priority Risks (Score ≥6)" and `:81` heads the second "Medium-Priority Risks (Score 3–4)"; `R-UM-04` sits in the second table with `Prob 3 × Impact 2 = **6**`. Six satisfies the document's own high band and falls outside the medium band's stated range, so the **heading placement is the defect and the score is authoritative**. Resolution: in the destination the risk is filed under **High-Priority Risks (Score ≥6)** at score **6**, unchanged. It is **not** renormalised, and the source document is **not** edited. Cross-check performed on the neighbours so the fix is not over-applied: `R-UM-05` scores 4 and `R-UM-06` scores 3 — both correctly inside "3–4"… `R-UM-06` at 3 is in range, so `R-UM-04` is the **only** misfiled row. **U-8 closed** (§10). | ungranted | repository-audit | S9 |
| `um-epic:R-UM-05` (TECH 2×2=4, **31** — not 18 — `it.todo` cases carry unblock triggers nothing enforces) | risk | merge | QA improvement backlog (`test-design-qa.md` § QA improvement backlog) | No product epic owns "make skipped-test triggers enforceable". The plan requires such items to sit in a clearly labelled backlog **with owner and trigger** and to **not** count as requirement coverage. Owner: QA. Trigger: a `skipped` row appearing in a trace run whose stated unblock condition is met. **Task 2 — count corrected 18 → 31; score and disposition unchanged.** Statically counted at backend `f1eea3c`: `grep -rn 'it\.todo' test src` piped to `wc -l` returns **31**, all under `services/backend/test/`, none under `src/`. (No pipe character is written in this cell; a pipe inside a ledger row breaks naive table parsers even when escaped — see §1.1b.) Independently corroborated by `_bmad-output/implementation-artifacts/platform/deferred-work.md:35`, which records the same 31 and separately notes that `docs/ci.md`'s "19" is stale. **This is a static source count, not an execution result** — no suite was run. The correction makes the risk larger, not smaller, and the score is **not** renormalised to match. | ungranted | repository-audit (static count at `f1eea3c`; unexecuted) | S9 |
| `um-epic:R-UM-06` (DATA 3×1=3, nullable identity fields never asserted null) | risk | preserve | `test-design-epic-user-management-1.md` § Risk (backend + frontend subsections) | Same product epic owns both the backend projection and the frontend card render, so per the plan both test levels live in **one** epic plan with separate test-level subsections. Merges with `fe-epic:R-FE-02`'s identity-card null case. | ungranted | unit (projection) + component (render) + contract (Pact) | S9, S6 |
| `um-epic:R-UM-07` (OPS 2, `db:bootstrap:access-control` deleted and nothing failed; e2e job is `continue-on-error`) | risk | preserve | QA improvement backlog § CI observability | **Do not promote the informational CI job to blocking as a mitigation.** The repository's standing decision is that the ACM-9 CI gate stays informational; converting an informational job to a required check is a repository-governance decision outside this migration's scope (root changes are planning artifacts and workflow configuration only). Owner: QA. Trigger: the job's red-case count changing while it stays informational. | ungranted | repository-audit | S9 |
| `um-epic:R-UM-08` (TECH 2, e2e specs address `/users`; production serves `/api/v1/users`) | risk | preserve | `test-design-epic-user-management-1.md` § Risk | Covered by the contract (Pact) provider run per the source. Status "Monitor" is preserved; it is **not** upgraded to closed. | ungranted | contract (Pact) | S9 |

#### 4.3b `um-epic` level-rebalance clusters (54 proposed unit cases)

Every cluster must land in a real epic or the QA improvement backlog. Task 1 marked its
proposed placements `→ Task 2` to signal that they were proposals, not resolutions.
**Task 2 has resolved every one of them** — here, in §4.4, in §4.3c and in §5.7 — so no
`→ Task 2` placement marker remains open anywhere in this ledger. Each resolved placement
states its authority in the row itself; §15.6 lists them together.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `um-epic:cluster/departure-state-machine` (11 cases) | test-id | preserve | `test-design-epic-user-management-5.md` § Coverage | `UM-E5` Employment Lifecycle; PM/AD-20. | ungranted | unit table + 2 api-e2e | — |
| `um-epic:cluster/departure-due-time` (`effectiveDate` + `effectiveTimeZone` → `dueAt`, 8 cases) | test-id | preserve | `test-design-epic-user-management-5.md` § Coverage | Same epic. AD-20's "one validated business timezone/database" constraint. | ungranted | unit | — |
| `um-epic:cluster/blocker-digest` (`expectedBlockerVersion`, 4 cases) | test-id | preserve | `test-design-epic-user-management-5.md` § Coverage | Same epic; `UM-E5-S5.1` blocker matrix. | ungranted | unit | — |
| `um-epic:cluster/s1-card-projection-nullables` (6 cases) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage (backend subsection) | `UM-E1-S1.2` identity-card fields. Pairs with `fe-epic` identity-card component cases in the same plan. | ungranted | unit | — |
| `um-epic:cluster/directory-pagination-arithmetic` (`totalPages`, 3 cases) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.5` list with pagination and filters. **Task 2 — confirmed against `PMC-E1`: pagination arithmetic stays with `UM-E1`.** `UM-E1-S1.5`'s acceptance criteria own "a page of results plus pagination metadata (FR-15)", and its scope sentence hands only "dynamic custom fields, saved views, export, and inline editing" to the platform directory scope — pagination is not in that list. `list/um-list-01-pagination-and-metadata.md` is the owning scenario. | ungranted | unit | — |
| `um-epic:cluster/directory-filter-pruning-and-whitelist` (7 cases) | test-id | preserve | **Split across two owners.** (a) rejecting unsafe and unknown filters on the existing identity-field list → `test-design-epic-user-management-1.md` § Coverage (`UM-E1-S1.5`, `list/um-list-09-unsafe-and-unknown-filters-rejected.md`); (b) anti-inference across filter combinations, including **result-count differencing**, on custom fields → `test-design-epic-user-management-7.md` § Coverage (`UM-E7`) | **Task 2 — the `UM-E1-S1.5` / `UM-E7` boundary is resolved as a split, and Task 1's single placement was too coarse.** Authority: `UM-E1-S1.5` scope — "permission-safe visible identity fields and employment status. Technical `ttId` and `isActive` are **never** public filters" — makes the whitelist over *identity* fields an `UM-E1` obligation, and `list/um-list-09` already exists for it. `UM-E7` "Visibility-Safe Filtering and Columns" covers `PM-FR-5` anti-inference completion: "no combination of filters, **including result-count differencing**, lets a viewer infer a value they cannot see" — a strictly harder property, on custom fields, that `um-list-09` does not address. Recorded dependency, not inherited: `UM-E7` depends on `UM-E8` (custom fields as data), and `PM/AD-32` puts the enforcement point in the AccessControl facade **before** filter execution, so `UM-E7`'s cases are not `UM-E1` cases at a different level. | ungranted | unit + api-e2e | — |
| `um-epic:cluster/career-event-ordering-and-source` (5 cases) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | `UM-E3` Career Timeline. | ungranted | unit | — |
| `um-epic:cluster/import-row-parsing-skip-taxonomy` (9 cases) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.1` "import seeded population"; DEC-UM-007's import-source paragraph names the exact CSV contract. | ungranted | unit | — |
| `um-epic:cluster/permission-key-seed-vs-gate-set` (1 case) | test-id | preserve | `test-design-epic-user-management-0.md` § Coverage | `UM-E0`; mitigates `um-epic:R-UM-02`. The design calls it "highest value/effort ratio in this document". | ungranted | unit | — |

#### 4.3c `legacy-um` test IDs — `test-design-qa.md` coverage plan (56 distinct IDs, 58 rows)

Fifty-six distinct `TD-UM-*` identifiers. Two of them — `TD-UM-REG-05` and `TD-UM-REL-07` —
are splits and therefore occupy two rows each, one per successor, per §1.3.

`docs/test-cases/user-management/**` scenario files are **not modified** by this
migration. Where a row retires, the *obligation* retires; existing scenario files stay on
disk and are not resurrected, edited, or deleted here.

Retirement authority used repeatedly below, stated once: `docs/architecture/README.md`
non-negotiable 10 and PM/AD-16 ("there is no employee-creation API: import only the
provided seeded population"), PM/AD-21 (v1.5 replaces the legacy create/deactivate paths;
no dual-running compatibility mode), PM/AD-22 (employment status owned by the employment
lifecycle, not `User.isActive`), and `docs/architecture/user-management-test-decisions.md`
DEC-UM-006 **RETIRED** and DEC-UM-008 **RETIRED**. Abbreviated as **[v1.5-no-create]**.

**RE-ADJUDICATED BY TASK 2 — this family is now settled, and five rows changed.** Task 1
recorded a first pass and said plainly it lacked standing to close it. Task 2 re-ran the
classification against the same authorities **plus three the first pass did not use**, and
changed five dispositions. Task 1's values are preserved in prose inside each changed row.

**Authorities Task 2 added, and what each one supplies:**

1. **`docs/architecture/user-management-test-decisions.md` DEC-UM-006 "Transport specified
   2026-09-02"** (`epic-1-story-1-1-decisions.md`). The replacement route is now *fixed*:
   **`POST /users/import`**, `multipart/form-data`, one `file` part carrying the
   semicolon-delimited CSV, authorized by the existing `user-management:create` permission,
   no operator-supplied identity fields. A structurally invalid file → **`400`**, nothing
   written; row-level errors → **`200`** with a per-row `skipped` / `errors[]` summary. Task 1
   retired the authentication and authorization rows because "the route does not exist" — a
   replacement route now does exist, so those obligations have a real successor subject.
2. **DEC-UM-007's "Mapping OPEN items resolved 2026-09-02"**: `IsDismissed` + `DismissedDate`
   → an `EmploymentStatus` row, **never** `User.isActive`, which is set `true` for **every**
   imported row, dismissed included. This changes what the `isActive` list rows can even
   assert.
3. **The repository's own executed retirement.**
   `docs/test-cases/user-management/registration/README.md` and `.../deactivation/README.md`
   both declare their folders **RETIRED (v1.5, 2026-09-01)** and **name their successors by
   file**. That is stronger and more specific than any inference from PM/AD-16: it is the
   owning suite recording where each behaviour went. The successor suites exist on disk at
   `76a7220`: `seed/` (13 scenarios `um-seed-01..13`), `departure/` (8 scenarios
   `um-dep-01..08`), and `list/um-list-05` + `um-list-06`.

**Corroborating supersession**, as Task 1 directed:
`_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md:166`
forecasts exactly this refresh and names
`_bmad-output/test-artifacts/e2e-actual-state-audit-2026-09-01.md` as the authoritative
audit of the backend state behind it.

**Inventory fact recorded, not acted on.** The retired scenario files are still on disk at
`76a7220`: `registration/` holds **16** `.md` (README + `um-reg-01..15`) and `deactivation/`
holds **4** (README + `um-deact-01..03`). Both READMEs say they are "retained in this folder
as history only — do not translate them to stage-2, do not cite them from any trace line, do
not approve them." **This migration modifies none of them and resurrects none of them.**
Whether 20 history-only scenario files should remain on disk is a question for the suite's
owner, not for a test-design migration; it is opened as **U-21** rather than answered here.

**Absences recorded, deliberately not ledger rows.** `um-reg-14`/`um-reg-15` (birthday day/
month persistence and incomplete-pair rejection), `um-reg-13` (dispatch failure), and
`um-seed-04..07`, `um-seed-12` have **no `legacy-um` `TD-UM-*` antecedent** — they are
net-new since 2026-08-25. There is nothing to dispose of; the successor `um-seed-06-birthday-split.md`
and `um-seed-07-null-source-fields.md` exist independently of this migration.

Two standing rules held throughout, as Task 1 required: `docs/test-cases/user-management/**`
scenario files are not modified, and retired scenario files are not resurrected.

##### Canonical legacy priority-preservation matrix

This table is the machine-readable priority companion to the unchanged 565-row disposition
ledger. Source priorities are independently expanded from the pinned `76a7220`
`test-design-qa.md` coverage bands, including combined cells such as `PF-03/04`. A priority is
shown only for an active result; a fully retired obligation has `n/a`. A row records planning
priority and disposition only — it grants no approval, execution evidence, coverage, or gate.

<!-- legacy-priority-matrix:start -->
| Source ID | Source priority | Disposition | Active destination | Result priority | Priority authority |
| --- | --- | --- | --- | --- | --- |
| `TD-UM-AC-01` | `P0` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-0.md` | `P0` | Pinned source priority retained; ledger §4.3c preserve authority. |
| `TD-UM-AUTH-01` | `P0` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` | `P0` | Pinned source priority retained; ledger §4.3c preserve authority. |
| `TD-UM-AUTH-02` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` | `P1` | Pinned source priority retained; DEC-UM-004 and ledger §4.3c. |
| `TD-UM-AUTH-03` | `P0` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` | `P0` | Pinned source priority retained; ledger §4.3c preserve authority. |
| `TD-UM-AUTH-04` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` | `P1` | Pinned source priority retained; DEC-UM-004 and ledger §4.3c. |
| `TD-UM-AUTH-05` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` | `P1` | Pinned source priority retained; DEC-UM-004 and ledger §4.3c. |
| `TD-UM-AUTH-06` | `P0` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` | `P0` | Pinned source priority retained; draft DEC-UM-012 status also remains unchanged. |
| `TD-UM-CT-01` | `P0` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P0` | Source priority retained on the DEC-UM-008 import-transaction successor. |
| `TD-UM-CT-02` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P1` | Pinned source priority retained; UM-E3-S3.1 and PM/AD-11. |
| `TD-UM-CT-03` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P1` | Pinned source priority retained; UM-E3-S3.2 and DEC-UM-001. |
| `TD-UM-CT-04` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P1` | Pinned source priority retained; UM-E3-S3.2 and DEC-UM-001. |
| `TD-UM-CT-05` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P1` | Pinned source priority retained; UM-E3-S3.3. |
| `TD-UM-CT-06` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P1` | Pinned source priority retained; UM-E3-S3.3. |
| `TD-UM-CT-07` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P1` | Pinned source priority retained; UM-E3-S3.3. |
| `TD-UM-CT-08` | `P2` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P2` | Pinned source priority retained; PM/AD-11 immutability. |
| `TD-UM-DEACT-01` | `P0` | `retire` | `n/a` | `n/a` | Retirement authority: deactivation suite README plus PM/AD-21 and PM/AD-22 remove the generic delete/deactivate subject. |
| `TD-UM-DEACT-02` | `P1` | `merge` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Source P1 retained for the merged employment-status successor; suite README and UM-E1-S1.5. |
| `TD-UM-DEACT-03` | `P1` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-5.md` | `P1` | Source priority retained on the DEC-UM-002 departure-permission successor. |
| `TD-UM-DOC-01` | `P3` | `merge` | `_bmad-output/test-artifacts/test-design-qa.md` | `P1` | Priority change: current aggregate `P1-PLAT-08` owns AD-1 trace and spec conformance; ledger §4.3c records the merge origins. |
| `TD-UM-DOM-01` | `P2` | `merge` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P2` | Source priority retained; merged with the import error-mapping unit cluster. |
| `TD-UM-DOM-02` | `P2` | `merge` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P2` | Source priority retained; merged with the source review's corrected unit-level obligation. |
| `TD-UM-EXP-01` | `P3` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-3.md` | `P3` | Pinned source priority retained; DEC-UM-001. |
| `TD-UM-EXP-02` | `P3` | `retire` | `n/a` | `n/a` | Retirement authority: no photo limit is specified; ledger §4.3c keeps the unanswered product question as U-11 instead of an active test obligation. |
| `TD-UM-EXP-03` | `P3` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md`<br>`_bmad-output/test-artifacts/test-design-epic-platform-capabilities-1.md` | `P2` | Priority change: current aggregate `P2-PLAT-02` owns sort stability; UM-E1-S1.5 and PMC-E1-S1.3 discharge the source condition. |
| `TD-UM-LIST-01` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Pinned source priority retained; UM-E1-S1.5. |
| `TD-UM-LIST-02` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Pinned source priority retained; UM-E1-S1.5. |
| `TD-UM-LIST-03` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Pinned source priority retained; UM-E1-S1.5. |
| `TD-UM-LIST-04` | `P2` | `merge` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Priority change: the one merged successor retains the higher `P1` source priority of `TD-UM-DEACT-02`; suite README and UM-E1-S1.5 establish the shared result. |
| `TD-UM-NFR-PERF-01` | `P1` | `replace` | `_bmad-output/test-artifacts/test-design-qa.md` | `P0` | Priority change: current aggregate `P0-PLAT-08` is release-gated by PG-04 and the preserved exit criteria require 100% P0 coverage. |
| `TD-UM-NFR-PII-01` | `P3` | `merge` | `_bmad-output/test-artifacts/test-design-qa.md` | `P2` | Priority change: current aggregate `P2-PLAT-03` owns the repository PII and seed-provenance audit; ledger §4.3c records the merge. |
| `TD-UM-NFR-REL-01` | `P1` | `retire` | `n/a` | `n/a` | Retirement authority: DEC-UM-008 retires create-time registration dispatch; the distinct DEC-UM-004 magic-link reliability successor does not reuse this retired ID. |
| `TD-UM-PF-01` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Pinned source priority retained; UM-E1-S1.2. |
| `TD-UM-PF-02` | `P2` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P2` | Pinned source priority and its acceptable-workaround rationale retained; UM-E1-S1.3. |
| `TD-UM-PF-03` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Pinned source priority retained; UM-E1-S1.2 and DEC-UM-007. |
| `TD-UM-PF-04` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Pinned source priority retained; UM-E1-S1.2 and DEC-UM-007. |
| `TD-UM-PF-05` | `P2` | `merge` | `_bmad-output/test-artifacts/test-design-qa.md` | `P2` | Source priority retained on the platform-owned access-boundary merge. |
| `TD-UM-REG-01` | `P0` | `retire` | `n/a` | `n/a` | Retirement authority: registration suite README and the §4.3c `[v1.5-no-create]` authorities remove the HTTP-create subject. |
| `TD-UM-REG-02` | `P1` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Source priority retained on the DEC-UM-006 unauthenticated-import successor. |
| `TD-UM-REG-03` | `P1` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Source priority retained on the DEC-UM-006 import-capability successor. |
| `TD-UM-REG-04` | `P1` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Source priority retained on the DEC-UM-009 identity-reuse successor. |
| `TD-UM-REG-05` | `P1` | `replace + retire` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Source priority retained on the no-session successor; DEC-UM-008 retires only the create-time dispatch half. |
| `TD-UM-REG-06` | `P1` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Source priority retained on the two DEC-UM-006 invalid-import successors. |
| `TD-UM-REG-07` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Pinned source priority retained; TT-IDENTITY-01 remains an open blocker. |
| `TD-UM-REG-08` | `P1` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Source priority retained on the concurrent import-writer obligation. |
| `TD-UM-REG-09` | `P1` | `replace` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P1` | Source priority retained on the DEC-UM-006 row-error successor. |
| `TD-UM-REG-10` | `P2` | `retire` | `n/a` | `n/a` | Retirement authority: DEC-UM-006 and PM/AD-16 make import identity fields writer-owned, so the former payload rejection has no subject. |
| `TD-UM-REG-11` | `P2` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P2` | Pinned source priority retained for the DEC-UM-007 normalization half. |
| `TD-UM-REG-12` | `P2` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-1.md` | `P2` | Pinned source priority retained; DEC-UM-009. |
| `TD-UM-REL-01` | `P0` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-4.md` | `P0` | Pinned source priority retained; UM-E4-S4.1. |
| `TD-UM-REL-02` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-4.md` | `P1` | Pinned source priority retained; UM-E4-S4.1. |
| `TD-UM-REL-03` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-4.md` | `P1` | Pinned source priority retained; DEC-UM-005. |
| `TD-UM-REL-04` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-mentorship-1.md` | `P1` | Pinned source priority retained on the M-E1-S1.3 owner. |
| `TD-UM-REL-05` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-mentorship-1.md` | `P1` | Pinned source priority retained on the M-E1-S1.4 owner. |
| `TD-UM-REL-06` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-mentorship-1.md` | `P1` | Pinned source priority retained on the M-E1-S1.3 owner. |
| `TD-UM-REL-07` | `P1` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-4.md`<br>`_bmad-output/test-artifacts/test-design-epic-mentorship-1.md` | `P1` | Pinned source priority retained on both explicitly split domain halves. |
| `TD-UM-REL-08` | `P2` | `preserve` | `_bmad-output/test-artifacts/test-design-epic-user-management-4.md` | `P2` | Pinned source priority retained; DEC-UM-005 and gap G-13. |
<!-- legacy-priority-matrix:end -->

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:TD-UM-REG-01` (HR Admin creates user, `201`, `isActive:true`) | test-id | retire | — (successor obligation: seed/import row persists, `test-design-epic-user-management-1.md` § Coverage) | **Task 2 — confirmed `retire`.** [v1.5-no-create], and now `registration/README.md` names the successor by file: `seed/um-seed-01-import-success.md` ("one canonical `User` row per seeded employee; normalized `workEmail`; `joined_company` per row"). The "employee row exists after the population enters the system" intent survives at `UM-E1-S1.1`; the `201` HTTP-create assertion has no successor. Note the `isActive:true` half survives for a different reason than it was written for — DEC-UM-007 (2026-09-02) sets `isActive: true` for **every** imported row including dismissed ones, so it is now a row-retention flag, not a status assertion. | n/a | api-e2e (import path only) | S11, S13, `docs/superpowers/plans/2026-08-25-test-design-validation-fixes.md` |
| `legacy-um:TD-UM-REG-02` (unauthenticated create → `401`) | test-id | replace | `test-design-epic-user-management-1.md` § Coverage — unauthenticated import → `401` (`seed/um-seed-11-import-unauthenticated.md`); cross-referenced from `test-design-epic-user-management-0.md` § Coverage as one instance of the PM/AD-24 route-class oracle | **Task 2 re-adjudication (was `retire`).** Task 1 retired this because "[v1.5-no-create] removes the route". A **replacement route now exists**: DEC-UM-006's 2026-09-02 transport note fixes it as `POST /users/import`, and `docs/test-cases/user-management/seed/um-seed-11-import-unauthenticated.md` is a real successor scenario on disk. The `401`-on-no-session invariant therefore survives with a changed subject, which is `replace`, not `retire`. The generic PM/AD-24 denial oracle (`401` invalid/inactive session, `404` hidden/missing, `403` visible but forbidden) remains owned per route class by `UM-E0`; this row is one instance of it, not a duplicate of it. | ungranted | api-e2e (import route) | S11, S13 |
| `legacy-um:TD-UM-REG-03` (no create permission → `403`, uses Ida) | test-id | replace | `test-design-epic-user-management-1.md` § Coverage — import without capability → `403` (`seed/um-seed-10-import-without-capability-forbidden.md`) | **Task 2 re-adjudication (was `retire`).** Same reason as REG-02: the capability check survives on the replacement route. DEC-UM-006's transport note states the import is "authorized by the existing `user-management:create` permission (HR-Admin-only in the seeded system — no new key or kernel seed)", so the *same permission key* gates the *same class of denial* on a different route — a changed subject, not a removed obligation. Successor scenario `seed/um-seed-10-import-without-capability-forbidden.md` exists on disk. The **actor-selection rule** (Ida for a generic feature-permission denial, Bob only for a manager-specific probe — `legacy-um:C-04`) survives independently in §5.4 and applies here. | ungranted | api-e2e (import route) | S11, S13 |
| `legacy-um:TD-UM-REG-04` (duplicate `workEmail` → `409`) | test-id | replace | `test-design-epic-user-management-1.md` § Coverage — import-writer identity reuse (`seed/um-seed-08-idempotent-re-import.md`, `seed/um-seed-03-bootstrap-hr-admin-and-root-id-reuse.md`) | **Task 2 — `replace` confirmed, but the assertion is restated, not relocated.** Task 1 wrote "same rule, different subject", which understates the change: **the expected outcome inverts.** DEC-UM-009 states that no writer creates a second row for a normalized email that already exists and that a CSV row matching `ROOT_WORK_EMAIL` **updates the ACM-0 root `User` in place**. So a duplicate normalized email no longer produces a `409` — it produces an in-place update. Carrying the `409` forward would assert behaviour the decision log forbids. The surviving invariant is "exactly one `User` row per normalized email, ever", evidenced by idempotent re-import. DEC-UM-007 additionally records that the `users_workEmail_key` index is on the **raw stored value**, so normalized uniqueness is a **writer-side** guarantee and a DB functional unique index over the normalized value is deferred work — the test must target the writer, not the constraint. | ungranted | unit (normalizer) + api-e2e (idempotent re-import) | S11, S13 |
| `legacy-um:TD-UM-REG-05` (no auto-login; email dispatched) — **no-session half** | test-id | replace | `test-design-epic-user-management-1.md` § Coverage — completing seed/import establishes **no** session (`seed/um-seed-02-no-post-users-create-path.md`, and the no-session assertion on the import response) | **Task 2 re-adjudication (was `preserve`).** Split 1 of 2. The obligation survives — DEC-UM-008 states it explicitly ("FR-3: completing seed/import does not establish a session, and there is no separate invite path") — but its **trigger changes from a create route to the import writer**, and §1.3 defines a changed subject as `replace`, not `preserve`. Task 1's own cell said "import trigger instead of a create route", which is the definition of `replace`. `legacy-um:C-07`'s "no session in body or headers" assertion carries the check at `UM-E1-S1.1`. | ungranted | api-e2e (import) | S11, S13 |
| `legacy-um:TD-UM-REG-05` (no auto-login; email dispatched) — **create-time dispatch half** | test-id | retire | — | Split 2 of 2. The create-time magic-link dispatch half has no successor: DEC-UM-008 is marked **RETIRED** — "there is no create-time dispatch to make durable" — and [v1.5-no-create] removes the route that triggered it. Dispatch assertions survive only for `POST /auth/magic-link` under DEC-UM-004 (`legacy-um:TD-UM-NFR-REL-01`). | n/a | none | S11, S13 |
| `legacy-um:TD-UM-REG-06` (missing required field → `400`) | test-id | replace | `test-design-epic-user-management-1.md` § Coverage — **two** successors: (a) structurally invalid file → `400`, nothing written (api-e2e); (b) row-level skip taxonomy → `200` with per-row `skipped`/`errors[]` (`seed/um-seed-09-malformed-rows-skipped.md`, unit + api-e2e) | **Task 2 — `replace` confirmed; successor corrected from one to two, and the level corrected.** Task 1 mapped the whole obligation to unit-level row parsing. DEC-UM-006's 2026-09-02 transport note splits it: *"A structurally invalid file (no `file` part, non-CSV, header mismatch, unparseable) → `400`, nothing written; row-level errors → `200` with a per-row `skipped` / `errors[]` summary."* The `400` half therefore keeps an **HTTP** assertion that unit-level row parsing cannot make, and the `200`-with-summary half is a real behavioural contract, not merely a parser detail. Both successors named; `um-epic:cluster/import-row-parsing-skip-taxonomy` covers the unit half only. | ungranted | unit (row taxonomy) + api-e2e (structural `400`, per-row summary) | S11 |
| `legacy-um:TD-UM-REG-07` (duplicate `ttId` → `409`) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage, **recorded as an obligation with no current trigger and no closable path**; the `ttId is null` half is exercised by `seed/um-seed-07-null-source-fields.md` | **Task 2 — `preserve` confirmed; evidence contract corrected and the blocker named.** Task 1's caveat is right and is now upgraded from a caveat to the row's actual state. DEC-UM-007: the delivered `docs/Accounts_template.csv` has **no employee-id column**, so `ttId` (PM/AD-13) has no source and is left `null` at import — no writer can produce a duplicate. This is not a scheduling accident: blocker **`TT-IDENTITY-01` is P0 open** and states the problem exactly — project members arrive as `AccountTalentDto {email, dateStart, dateEnd}` with no durable id, requirements say email alone is insufficient, and "`User.ttId` therefore has no population source". So the obligation cannot be exercised **or** closed until `TT-IDENTITY-01` closes. Evidence contract corrected from `api-e2e` to `none-yet`. **Not dropped** — it is a real PM/AD-13 invariant with a named unblock condition. | ungranted | none-yet (blocked on `TT-IDENTITY-01`, P0 open) | S11 |
| `legacy-um:TD-UM-REG-08` (concurrent duplicate `workEmail`, `@concurrency`) | test-id | replace | `test-design-epic-user-management-1.md` § Coverage — concurrent import writer; **no successor scenario exists on disk**, so it also feeds the open concurrency-coverage item at §5.5 `legacy-um:G-15` | **Task 2 — `replace` confirmed, with a coverage gap recorded rather than assumed closed.** Concurrency intent survives and its subject moves to the import writer, as Task 1 said. What Task 1 did not record: the `seed/` suite has **no `@concurrency` scenario** — `um-seed-08-idempotent-re-import.md` is sequential re-import, which is a different property. Under DEC-UM-009 the relevant race is two writers reaching the same normalized email at once, and DEC-UM-007 notes the DB index is on the **raw** value, so the writer-side guarantee is exactly the part a race can defeat. Recorded as an obligation whose successor scenario has not been written. The `@concurrency` mechanism (parallel HTTP inside one isolated test via `Promise.all`) is preserved as an execution constraint (§5.1) and remains legal at one worker under DEC-UM-010. | ungranted | api-e2e `@concurrency` (no current scenario) | S11, S13 |
| `legacy-um:TD-UM-REG-09` (malformed `workEmail` → `400`) | test-id | replace | `test-design-epic-user-management-1.md` § Coverage — import row skip taxonomy (`seed/um-seed-09-malformed-rows-skipped.md`) | **Task 2 — `replace` confirmed.** Same treatment as REG-06, but this one falls entirely on the **row-level** half: a malformed `Email` in one CSV row is a row error, not a structurally invalid file, so the outcome is `200` with that row in `skipped`/`errors[]` (DEC-UM-006 transport note), **not** `400`. Carrying the `400` forward would assert the wrong status. Successor scenario `seed/um-seed-09-malformed-rows-skipped.md` exists on disk. | ungranted | unit + api-e2e (per-row summary) | S11 |
| `legacy-um:TD-UM-REG-10` (server-owned create fields `id`/`createdAt`/`createdBy` → `400`) | test-id | retire | — | **Task 2 — confirmed `retire`, and now positively evidenced rather than only negatively.** DEC-UM-006 is **RETIRED** ("v1.5 — no `POST /users` payload"), and its 2026-09-02 transport note states positively why no successor is needed: the import "carries **no** operator-supplied identity fields: `createdBy` is the ACM-0 root id by construction, `id`/`createdAt` are writer-owned". There is no payload field to reject, so there is no rejection to assert. Retirement authority: the decision log itself, plus PM/AD-16 and PM/AD-21. No successor. | n/a | none | S11 |
| `legacy-um:TD-UM-REG-11` (email normalization: trim + lowercase on write/lookup; normalized duplicates → `409`) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage (`seed/um-seed-01-import-success.md` — "normalized `workEmail`") | **Task 2 — `preserve` confirmed for the normalization half only.** DEC-UM-007 is **KEPT**, reconciled to the import writer and the CSV `Email` column, and "identity is canonical *at write*" — that is the surviving obligation and it preserves cleanly. **The row's own "normalized duplicates → `409`" clause does not survive** and is not carried: it is the same inverted outcome recorded on REG-04 (DEC-UM-009 makes a normalized-email match an in-place update). Recorded so the `409` is not silently transported inside a `preserve` row. | ungranted | unit (normalizer) + api-e2e (import) | S11 |
| `legacy-um:TD-UM-REG-12` (rehire identity preservation) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage (`seed/um-seed-03-bootstrap-hr-admin-and-root-id-reuse.md`) | **Task 2 — `preserve` confirmed.** DEC-UM-009 is **KEPT**, reframed: no writer creates a second row for an existing normalized email; a CSV row matching `ROOT_WORK_EMAIL` updates the ACM-0 root `User` in place with the same `id`/`createdAt`/`createdBy`. Successor scenario exists on disk. DEC-UM-009 also records that a dedicated rehire/reactivation endpoint stays out of scope and must reuse the existing `User` id when it lands — carried as a forward constraint, not as a current obligation. | ungranted | api-e2e (import) | S11 |
| `legacy-um:TD-UM-AUTH-01` (request magic link, known email) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage | `UM-E2-S2.1`; DEC-UM-004. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-AUTH-02` (enumeration-safe unknown email; zero dispatch) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage | DEC-UM-004. `legacy-um:S15#7` records that the response schema must be frozen and asserted by deep equality — preserve that remediation with the case. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-AUTH-03` (consume token → session works) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage | `UM-E2-S2.2`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-AUTH-04` (expired token → `401`, injected deterministic TTL + controllable clock) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage | DEC-UM-004: TTL is configuration-owned, boundary-tested with a controllable clock; **no production duration is invented** (§7.1). | ungranted | api-e2e with injected clock | S11, S13 |
| `legacy-um:TD-UM-AUTH-05` (replay token → `401`) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage | DEC-UM-004 single-use. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-AUTH-06` (deactivated user login denied) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage | Subject of `DEC-UM-012`, which is **Proposed, not covered by the 2026-08-25 approval**. The case survives; its decision stays draft (§10, U-6). | draft-decision | api-e2e | S11, S13 |
| `legacy-um:TD-UM-PF-01` (Manager-line `PATCH` persists) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.2`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-PF-02` (self photo upload) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.3` "self uploads own photo". Priority P2 with the recorded rationale ("acceptable workaround; does not block identity/authentication") is preserved — the P2 placement was an explicit 2026-08-25 decision recorded in `docs/superpowers/plans/2026-08-25-test-design-validation-fixes.md:287`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-PF-03` (PATCH uniqueness conflict) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.2`; DEC-UM-007. Source states it jointly with PF-04; recorded here as two distinct IDs. | ungranted | api-e2e | S11 |
| `legacy-um:TD-UM-PF-04` (PATCH uniqueness conflict, second case) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.2` profile `PATCH`; DEC-UM-007 normalized-email uniqueness. The source states PF-03 and PF-04 jointly in one row; they are recorded here as two distinct IDs so each resolves independently. | ungranted | api-e2e | S11 |
| `legacy-um:TD-UM-PF-05` (self cannot PATCH others) | test-id | merge | `test-design-qa.md` § Access-boundary evidence (platform), **owned by the platform pair**; cross-referenced from `test-design-epic-user-management-0.md` § Coverage | Origins: `legacy-um:TD-UM-PF-05`, `plat:TR-4.3-01`. **Task 2 — ownership resolved: the platform pair owns it, `UM-E0` cross-references it.** Authority: `docs/architecture/README.md` non-negotiable 7 (authorization goes through the `AccessControl` facade only) makes "who may write another person's record" an access-control decision, not a profile-feature decision; `UM-E0` "Access Control Adoption" is the seam that proves the adoption, and `UM-E0-S0.2` is the write-path dual gate. Placing the rule in the platform pair and the *instance* in `UM-E0` avoids a second source of shared policy, which the plan's ownership split requires. Corroborated by `docs/test-cases/user-management/access-control-adoption/` (24 scenarios on disk). Note the gate this depends on: `SEC-AUTH-01` is **P0 open** — `isAllowedForTarget` was `Boolean(userId)` at `e6049c8` and, although the real facade adapter is now bound, `interim-session-resolver.adapter.ts` still self-provisions `position: 'HR Admin'`, so a green result here today would not be trustworthy evidence. | ungranted | api-e2e | S11 |
| `legacy-um:TD-UM-DEACT-01` (HR Admin soft delete, row survives) | test-id | retire | — (successor obligation: `test-design-epic-user-management-5.md` departure, `departure/um-dep-01..08`) | **Task 2 — confirmed `retire`, on the suite's own recorded authority.** `docs/test-cases/user-management/deactivation/README.md` states it directly: `um-deact-01..03` "tested a generic `DELETE /users/:id` deactivation capability. That capability is removed in v1.5 (AD-16): `isActive` is an internal account/row-retention flag only, not employment status and not a product deactivation operation", and "Employment lifecycle … is **Epic 5**". PM/AD-22 and PM/AD-21 corroborate. The "record survives, is not hard-deleted" intent survives inside `UM-E5` departure (implementation blocked on `CC-06`, P1 open). The README also records that `services/backend/test/user-management/deactivation.e2e-spec.ts` is a corresponding retirement — this migration does not touch it. | n/a | api-e2e (departure path) | S11, S13 |
| `legacy-um:TD-UM-DEACT-02` (deactivated user excluded from active list) | test-id | merge | `test-design-epic-user-management-1.md` § Coverage — dismissed employee hidden by default and findable through an authorized employment-status filter (`list/um-list-05-dismissed-hidden-by-default.md` + `list/um-list-06-dismissed-findable-via-authorized-filter.md`) | **Task 2 re-adjudication (was `replace`).** Origins: `legacy-um:TD-UM-DEACT-02`, `legacy-um:TD-UM-LIST-04`. Both converge on one successor behaviour, so this is a `merge`, not two independent replacements. `deactivation/README.md` names it as "the one surviving observable behaviour" and `UM-E1-S1.5`'s acceptance criteria state it verbatim ("Colin is absent by default but can be found through an authorized employment-status filter"). Subject changes from `isActive` to the lifecycle-owned employment status (PM/AD-22, and DEC-UM-007's 2026-09-02 mapping, under which `isActive` is `true` for every imported row). `legacy-um:S15#4`'s blocked-on-Story-1.5 dependency is discharged. **Dead citation recorded (§6, F-16):** `deactivation/README.md` points at `um-list-05-dismissed-employee-filterable.md`; that file split into `um-list-05` + `um-list-06`. The source is not modified. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-DEACT-03` (deactivate without capability → `403`) | test-id | replace | `test-design-epic-user-management-5.md` § Coverage — departure-permission denial | **Task 2 — `replace` confirmed.** DEC-UM-002's traceability row already re-points this to "Epic 5 departure-permission denial", and DEC-UM-002's v1.5 note states the surviving principle precisely: any capability check — including the departure command — is a **no-target AccessControl feature capability** check through the facade, and "no controller, action, domain service, or adapter hard-codes a role name or `User.position`". That principle is the load-bearing half; the `DELETE /users/:id` surface is not. Actor rule (Ida for a generic feature-permission denial) preserved via `legacy-um:C-04`. Note the successor's own gate: `UM-E5` implementation is blocked on `CC-06` (P1 open), so this obligation has a scenario (`departure/`) and no production path yet. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-LIST-01` (pagination metadata) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.5`. | ungranted | unit (arithmetic) + api-e2e | S11, S13 |
| `legacy-um:TD-UM-LIST-02` (single filter, country) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.5`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-LIST-03` (compound filters) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage | `UM-E1-S1.5`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-LIST-04` (filter `isActive=false` includes Colin) | test-id | merge | `test-design-epic-user-management-1.md` § Coverage — merged with `legacy-um:TD-UM-DEACT-02` onto `list/um-list-05` + `list/um-list-06` | **Task 2 re-adjudication (was `replace`).** Origins: `legacy-um:TD-UM-DEACT-02`, `legacy-um:TD-UM-LIST-04` — one successor behaviour, therefore `merge`. The stated filter has **no successor as written**: DEC-UM-007's 2026-09-02 mapping sets `User.isActive` to `true` for **every** imported row, dismissed included, so `isActive=false` selects nothing meaningful; and `UM-E1-S1.5`'s own scope statement says "Technical `ttId` and `isActive` are **never** public filters". The surviving obligation is the authorized **employment-status** filter. Recorded explicitly so the `isActive` filter is not transported into a new document as though it still worked. | ungranted | api-e2e | S11 |
| `legacy-um:TD-UM-CT-01` (`joined_company` on create) | test-id | replace | `test-design-epic-user-management-1.md` § Coverage — `joined_company` written in the import row transaction (`seed/um-seed-13-joined-company-event-in-row-transaction.md`) | **Task 2 — `replace` confirmed, successor named.** DEC-UM-008: "the `joined_company` `UserEvents` row is still written at import — synchronously, same transaction as the row insert (AD-11 / Epic 3 pattern)". Trigger changes from create to import; the atomicity obligation is unchanged. Successor scenario `seed/um-seed-13-joined-company-event-in-row-transaction.md` exists on disk. Cross-references `UM-E3`. Related open blocker recorded, not inherited: `CC-09` gained `model UserEvent` in the merge but stays **P0 open** because `idempotencyKey` exists nowhere in the schema or `src/` — that gates retry-safety, not this atomicity assertion. | ungranted | api-e2e (import) | S11, S13 |
| `legacy-um:TD-UM-CT-02` (`position_change` on PATCH) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | `UM-E3-S3.1`; PM/AD-11. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-CT-03` (assigned PP manual add) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | `UM-E3-S3.2`; DEC-UM-001. Source states CT-03/04 jointly; recorded here as two IDs. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-CT-04` (direct UM manual add) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | Same. DM/PM and transitive managers remain read-only (DEC-UM-001). | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-CT-05` (correct = delete + append) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | `UM-E3-S3.3`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-CT-06` (UM deletes manual entry) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | `UM-E3-S3.3`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-CT-07` (deleted event absent from read) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | `UM-E3-S3.3`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-CT-08` (no `PATCH` on events — immutability) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | Gap `G-14`; PM/AD-11 immutable facts. | ungranted | api-e2e + unit | S11 |
| `legacy-um:TD-UM-REL-01` (assign reports-to) | test-id | preserve | `test-design-epic-user-management-4.md` § Coverage | `UM-E4-S4.1`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-REL-02` (revoke reports-to, hard delete) | test-id | preserve | `test-design-epic-user-management-4.md` § Coverage | `UM-E4-S4.1`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-REL-03` (second reports-to `POST` → `409`) | test-id | preserve | `test-design-epic-user-management-4.md` § Coverage | DEC-UM-005 reject-then-retry. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-REL-04` (mentorship pair + `mentorship_start`) | test-id | preserve | `test-design-epic-mentorship-1.md` § Coverage | Split of the old `REL-*` family to its current canonical owner: mentorship is now its own domain (`_bmad-output/planning-artifacts/mentorship/epics.md`, `M-E1-S1.3`) with 28 scenario files on disk. Split 1 of 3. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-REL-05` (unpair + `mentorship_end`) | test-id | preserve | `test-design-epic-mentorship-1.md` § Coverage | `M-E1-S1.4`. Split 2 of 3. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-REL-06` (multiple mentors allowed) | test-id | preserve | `test-design-epic-mentorship-1.md` § Coverage | `M-E1-S1.3`; PM/AD-11 / PM/AD-17. Split 3 of 3. **Task 2 — cardinality confirmed, `preserve` stands.** `docs/architecture/mentorship.md:129` states the constraint as a partial `UNIQUE (mentorUserId, menteeUserId) WHERE status = 'active'` — "at most one **active** pair per **ordered** (mentor, mentee); recurrence after ending is allowed (Decision 4)". An ordered-pair uniqueness constraint does not bound how many distinct mentors one mentee may have, so "multiple mentors allowed" is correct and survives unchanged. Note the constraint also carries a second obligation the source did not state: **re-pairing after an ended pair is legal**, which is a distinct case the mentorship plan should cover. `CC-10-MENTORSHIP` is P1 open (`src/mentorship` does not exist), so this has scenarios and no production path. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-REL-07` (non-HR-Admin → `403` on relationship/mentorship writes) — **relationships half** | test-id | preserve | `test-design-epic-user-management-4.md` § Coverage | Split 1 of 2. The single source case covered two domains that are now separate epics. The reports-to/PP relationship-write denial stays with `UM-E4` Organizational Relationships, alongside `TD-UM-REL-01/02/03/08`. Actor rule (Ida for a generic feature-permission denial) preserved via `legacy-um:C-04`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-REL-07` (non-HR-Admin → `403` on relationship/mentorship writes) — **mentorship half** | test-id | preserve | `test-design-epic-mentorship-1.md` § Coverage | Split 2 of 2. The mentorship-write denial follows the mentorship pair/unpair cases to their current canonical owner, the mentorship domain (`_bmad-output/planning-artifacts/mentorship/epics.md`, `M-E1`), the same authority that moves `TD-UM-REL-04/05/06`. Actor rule preserved via `legacy-um:C-04`. | ungranted | api-e2e | S11, S13 |
| `legacy-um:TD-UM-REL-08` (concurrent reports-to assign, `@concurrency`) | test-id | preserve | `test-design-epic-user-management-4.md` § Coverage | Gap `G-13`. | ungranted | api-e2e `@concurrency` | S11 |
| `legacy-um:TD-UM-AC-01` (mutations call AccessControl, sample each controller) | test-id | preserve | `test-design-epic-user-management-0.md` § Coverage | `UM-E0-S0.2` write-path dual gate; mitigates `legacy-um:R-001`. | ungranted | api-e2e per controller | S11, S13 |
| `legacy-um:TD-UM-DOM-01` (uniqueness mapper unit) | test-id | merge | `test-design-epic-user-management-1.md` § Coverage | Origins: `legacy-um:TD-UM-DOM-01`, `um-epic:cluster/import-row-parsing-skip-taxonomy` (error-mapping half). Already at the right level in the source; the `um-epic` design independently re-derives the same need. | ungranted | unit | S11 |
| `legacy-um:TD-UM-DOM-02` (event immutability unit) | test-id | merge | `test-design-epic-user-management-3.md` § Coverage | Origins: `legacy-um:TD-UM-DOM-02`, `legacy-um:S15#3-incorrect-test-levels` row 2. | ungranted | unit | S11 |
| `legacy-um:TD-UM-NFR-PERF-01` (k6 `GET /users` list latency SLA, nightly) | test-id | replace | `test-design-qa.md` § NFR measurement contracts — All Employees list (contract **A** of §7.1); canonical owner `PMC-E1-S1.9`; current scenario `list/um-list-12-perf-nfr2-stage2-note.md` | **Task 2 — `replace` confirmed; two further corrections.** (1) **Subject** replaced as Task 1 said: the v1.5 requirement is the composed All Employees list with 500+ records, arbitrary filters and derived fields, **including permission resolution**. ACM-9 and P6 resolver semantics are **not** imported (§7.1, §15.3). (2) **Harness corrected — k6 is not a repository decision.** `k6` appears at `76a7220` only inside the superseded test-design set and inside stock BMad skill templates and knowledge files; it appears in no binding architecture document, no repository configuration, no `package.json`, and no scenario (§6, F-17). The harness is **UNDECIDED** and is opened as **U-24** *(this cell cited "U-20" until 2026-09-10; U-20 was already defined in §10.1 as a different question — see the numbering note there)*. The repository's own successor scenario `list/um-list-12-perf-nfr2-stage2-note.md` proposes only "a dedicated perf/load spec (tagged `@perf`, seeded to 500+ rows)" and names **no** tool — a proposal inside a scenario document, not a decision. *(An earlier version of this cell said the scenario proposes a **Playwright** spec. It does not: it names no tool, and its Stage-2 subject is the backend `GET /users` route with an `ACCESS_CONTROL_PORT` call-counter, not a browser. Corrected 2026-09-10.)* (3) **"Nightly" is not carried** — no repository schedule states it. | ungranted | measurement — harness **UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); see §6, F-17 and §10, U-24 | S11, S13 |
| `legacy-um:TD-UM-NFR-REL-01` (email transport failure after registration; durable dispatch intent) | test-id | retire | — (successor: magic-link dispatch reliability at `test-design-epic-user-management-2.md`) | DEC-UM-008 RETIRED: "there is no create-time dispatch to make durable". The reliability obligation survives only for `POST /auth/magic-link` under DEC-UM-004. Split into one successor; the registration half has none. | n/a (registration half); ungranted (auth half) | api-e2e with throwing fake | S11, S13 |
| `legacy-um:TD-UM-NFR-PII-01` (no real PII in repo fixtures, CI grep) | test-id | merge | `test-design-qa.md` § Privacy | Origins: `legacy-um:TD-UM-NFR-PII-01`, `plat:TR-7-02`, `plat:P2-PLAT-03`. | ungranted | ci-scan | S11, S13 |
| `legacy-um:TD-UM-DOC-01` (scenario trace lines cite normative § not derived FR-n) | test-id | merge | `test-design-qa.md` § Process/trace evidence | Origins: `legacy-um:TD-UM-DOC-01`, `plat:TR-8-01`, `plat:P1-PLAT-08`. `legacy-um:C-03` records this as already resolved once and retained as a regression audit. | ungranted | repository-audit | S11 |
| `legacy-um:TD-UM-EXP-01` (decision-drift audit: DM/PM manual timeline write remains denied) | test-id | preserve | `test-design-epic-user-management-3.md` § Coverage | DEC-UM-001. **Task 2 (checkbox 6) — `UM-E3` CONFIRMED; access control is a dependency, not the owner.** The obligation's own scenario is `docs/test-cases/user-management/career-timeline/um-ct-09-permission-without-s9-write-denied.md`, which lives in the **user-management** suite and traces itself to "requirements §4.9 · §3.2 row S9 · PRD FR-12 · epics.md Story 3.2 · DEC-UM-001 · access-control.md §2.2 dual gate". A dual gate has two sides: Access Control supplies the S9 write audience (`profile:timeline` `canAccessSection`, tracked as unbuilt at `implementation-artifacts/access-control/deferred-work.md:45`), and User Management owns the route, the denial and the scenario. Recorded as a **dependency** on the access-control side; ownership is not split. The case is one of the five `it.todo` deferrals (§15.6), so it is a real but currently blocked obligation. | ungranted | api-e2e | S11 |
| `legacy-um:TD-UM-EXP-02` (large photo upload limits, "if limits specified") | test-id | retire | — | **Task 2 — confirmed `retire`.** The trigger condition ("if limits specified") is still unmet at `76a7220`: no photo size/type limit is stated in `docs/project-requirements.md`, in any `docs/architecture/**` file, or in `UM-E1-S1.3`. Retirement authority: `plat:S4#unknown-and-not-guessed` and `plat:S3#assumptions` 4 — no unspecified threshold is inferred, and inventing one here would be exactly the failure the plan forbids. Recorded in §10, **U-11** as an unresolved product question owned by the Product Owner, **not** as an active obligation. Adjacent live work recorded so the retirement is not mistaken for "photo is finished": `UM-E6-S6.5` (`DELETE /users/:id/photo`) is drafted, and `deferred-work.md` records that no remove-photo affordance exists. | n/a | none | S11 |
| `legacy-um:TD-UM-EXP-03` (list sort order stability, "if sort specified") | test-id | replace | **Split across two owners.** (a) deterministic **default** sort on the existing list → `test-design-epic-user-management-1.md` § Coverage (`list/um-list-11-deterministic-default-sort.md`, `UM-E1-S1.5`); (b) the server-side **sort control** and its stability across sortable columns → `test-design-epic-platform-capabilities-1.md` § Coverage (`PMC-E1-S1.3`) | **Task 2 — `replace` confirmed; the `PMC-E1` vs `UM-E1-S1.5` boundary is resolved as a split, not a choice.** Authority: `UM-E1-S1.5`'s own scope sentence — "Dynamic custom fields, saved views, export, and inline editing remain owned by the **platform directory scope** rather than this bounded-context epic" — leaves the *existing* list, including its default ordering, with `UM-E1`; `PMC-E1-S1.3` "Sort, Filter, and Search the Directory" owns the sort *control*. Repository state corroborates the split: `_bmad-output/implementation-artifacts/user-management/deferred-work.md` records that "the repository sorts by a fixed `lastName,firstName`" and that a server-side sort control is directory work the list endpoint does not yet have. The conditional ("if sort specified") is discharged — both halves now have a named owner. | ungranted | api-e2e + unit | S11 |

#### 4.3d Source-to-successor scenario map (`legacy-um:S2#mapping-existing-to-proposed`)

Preserved verbatim in meaning; **this is migration metadata, not coverage.** No scenario
file on disk is changed by this migration.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:map/um-reg-01..09 → TD-UM-REG-01..09` | section | preserve | `test-design-qa.md` § Source-to-successor map + this ledger §4.3c | Plan Task 3: "Retain the source-to-successor ID map." Note the successors themselves largely retire under [v1.5-no-create]; the map records *history*, not a live obligation. | ungranted | repository-audit | S15 |
| `legacy-um:map/um-auth-01..05 → TD-UM-AUTH-01..05` | section | preserve | same | Successors survive. | ungranted | repository-audit | S15 |
| `legacy-um:map/um-pf-01..04 → TD-UM-PF-01..04` | section | preserve | same | Successors survive. | ungranted | repository-audit | S15 |
| `legacy-um:map/um-deact-01..03 → TD-UM-DEACT-01..03` | section | preserve | same | Successors retire/replace under PM/AD-21/AD-22; the map still records the historical correspondence. | ungranted | repository-audit | S15 |
| `legacy-um:map/um-ct-01..07 → TD-UM-CT-01..07` | section | preserve | same | Successors survive. | ungranted | repository-audit | S15 |
| `legacy-um:map/(none) → TD-UM-LIST-01..04, REL-01..08, AUTH-06, NFR-*` | section | preserve | same | Records which successors were net-new in 2026-08-25. | ungranted | repository-audit | S15 |

#### 4.3e `legacy-um` handoff epic/story gates → canonical epic identities

Epic titles and story numbers in `legacy-um:S13` predate the current canonical source.
**No epic is renumbered by this migration**; the rows below re-point to the identities
that already exist in `_bmad-output/planning-artifacts/user-management/epics.md`.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:handoff/Epic 1 "Employee Record Lifecycle"` gate (`TD-UM-REG-01`, `TD-UM-DEACT-01`, `TD-UM-AC-01`) | gate | replace | `test-design-epic-user-management-1.md` § Gate | Canonical Epic 1 is "Employee Record Management" (`UM-E1`, stories 1.1/1.2/1.3/1.5). Two of its three named gate scenarios retire under [v1.5-no-create]; `TD-UM-AC-01` moves to `UM-E0`. | ungranted | api-e2e | S11 |
| `legacy-um:handoff/Epic 2 "Magic-Link Auth"` gate (`AUTH-01`, `-03`, `-06`) | gate | preserve | `test-design-epic-user-management-2.md` § Gate | `UM-E2` matches. `AUTH-06`'s decision stays draft. | ungranted (gate); draft-decision (`AUTH-06`) | api-e2e | S11 |
| `legacy-um:handoff/Epic 3 "Career Timeline"` gate (`CT-01`) | gate | replace | `test-design-epic-user-management-3.md` § Gate — gate case becomes `legacy-um:TD-UM-CT-02` (`position_change` on `PATCH`, `UM-E3-S3.1`), with `TD-UM-CT-05/06/07` (correct = delete + append; deleted event absent from read) as the Story 3.3 gate | **Task 2 — resolved.** `CT-01`'s trigger moved to import (DEC-UM-008), so it now gates `UM-E1`, not `UM-E3`; the Epic 3 gate must name a timeline-owned case. `TD-UM-CT-02` is chosen because `UM-E3-S3.1` "System Auto-Generates Career Timeline Events" is the story that has a production path today — `career-timeline/` holds 14 scenarios and `um-ct-10`/`um-ct-12` are live. **Deliberately not chosen:** `TD-UM-CT-03/04` (manual add by PP/UM), because `um-ct-03`/`04`/`09` are `it.todo` pending the `OQ-PERM-01` FR-matrix grant plus DEC-UM-001 scoping (§15.6), and a gate case that cannot run is not a gate. | ungranted | api-e2e | S11 |
| `legacy-um:handoff/Epic 4 "Organizational Relationships"` gate (`REL-01`) | gate | preserve | `test-design-epic-user-management-4.md` § Gate | `UM-E4` matches. | ungranted | api-e2e | S11 |
| `legacy-um:handoff/story-1.1..4.2 mapping` (12 rows) | section | replace | epic plans § Story mapping | Story 1.4 "Deactivate" has **no canonical successor** — `UM-E1` has stories 1.1, 1.2, 1.3, 1.5 and no 1.4; deactivation moved to `UM-E5`. Story 1.1's subject changed from "HR Admin registers" to "import seeded population". | ungranted | api-e2e | S11 |

**Recorded coverage hole — deliberately NOT a ledger row.** The 2026-08-25 handoff covers
UM Epics 1–4 only. `UM-E0`, `UM-E5`, `UM-E6`, `UM-E7` and `UM-E8` exist canonically in
`_bmad-output/planning-artifacts/user-management/epics.md` and have **no `legacy-um`
obligation to migrate**. There is therefore nothing to dispose of, and no disposition value
is legal for it: it is an absence in the source, not a source item. It is recorded here so
the absence is visible rather than silently lost. It must **not** be read as a retirement —
those five epics are live. Task 3 creates plans **only** for epics that receive real
transferred obligations; the plan forbids empty plans for every epic.

### 4.4 Frontend scope — `fe-epic` risks and re-homing

**The `frontend` run identity is retired** (no canonical `frontend` epic exists; the plan
forbids a fictitious one). Every obligation below is re-homed either to a real product
epic or to the clearly labelled QA improvement backlog. Backlog items carry an owner and a
trigger and **do not count as requirement coverage**.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `fe-epic:R-FE-01` (SEC 3×3=9, `decodeJwtSub` / `isJwtExpired` untested at any level) | risk | preserve | `test-design-epic-user-management-2.md` § Risk (frontend subsection) | Session parsing decides who is logged in; magic-link authentication is `UM-E2`. Same product epic owns backend and frontend halves, so one plan with test-level subsections (plan Task 3). | ungranted | unit | S10 |
| `fe-epic:R-FE-02` (TECH 9, e2e fixtures are the only definition of what the backend sends; contract run found nulls no fixture produces) | risk | merge | `test-design-epic-user-management-1.md` § Risk (frontend subsection) | Origins: `fe-epic:R-FE-02`, `um-epic:R-UM-06`. Both are the nullable-identity-field gap on the two sides of the same seam; the contract (Pact) suite is the shared oracle. | ungranted | component + contract (Pact) | S10, S9 |
| `fe-epic:R-FE-03` (BUS 3×2=6, `lib/http.ts` error extractors drive user-visible error copy) | risk | preserve | QA improvement backlog § Frontend error handling | No single product epic owns "every documented API failure renders its own copy" — it spans every flow. Backlog item with owner DEV and trigger "a new documented failure body is added to any endpoint". Cross-referenced from `UM-E5` for the departure `409` shapes the source names explicitly. | ungranted | unit + component | S10 |
| `fe-epic:R-FE-04` (TECH 3×1=3, no sub-second loop) | risk | merge | `test-design-qa.md` § Level strategy | Origins: `um-epic:R-UM-01`, `fe-epic:R-FE-04`. Same estate-level property. | ungranted | unit | S10 |
| `fe-epic:R-FE-05` (BUS 2×2=4, `PersonPicker` sees only the first directory page and filters client-side) | risk | preserve | `test-design-epic-platform-capabilities-1.md` § Risk | `PMC-E1-S1.3` "sort, filter and search the directory" is the canonical owner of directory search; the source itself says "the real fix is backend typeahead (platform §4.1)". **Task 2 (checkbox 6) — `PMC-E1` CONFIRMED over `UM-E1-S1.5`, on User Management's own ownership boundary.** `_bmad-output/planning-artifacts/user-management/epics.md:610` lists "**substring / typeahead search on `GET /users`**" among three gaps that are explicitly **out of** the UM epic, assigning it to "platform §4.1 directory scope (FR-15)". The owning epic disclaiming the capability is stronger than inferring ownership from adjacency, so the risk and its remedy sit with `PMC-E1-S1.3`. **Recorded consequence, not inherited:** the component is *consumed* by the UM relationship-mutation flows (`UM-E4`, `UM-E6`), so `test-design-epic-user-management-4.md` carries a cross-reference to this risk; it does not own it. Corroborated by `_bmad-output/implementation-artifacts/user-management/deferred-work.md:59`, which records the same limitation ("cannot substring-search — a target past row ~100 … is unreachable") as unbuilt work. | ungranted | component | S10 |
| `fe-epic:R-FE-06` (TECH 4, no proactive session-expiry handling) — **predicate-testing half** | risk | preserve | `test-design-epic-user-management-2.md` § Risk (frontend subsection) — `isJwtExpired` predicate testing | Split 1 of 2. This half is a test obligation and survives unchanged: the source's own mitigation is "unit-test the predicate now". Session expiry decides whether a viewer stays authenticated, so it belongs with magic-link authentication, `UM-E2`. Corroborated by `_bmad-output/implementation-artifacts/user-management/deferred-work.md:23–25`, which records that `AuthContext` evaluates `isJwtExpired` only at mount and that the 401 interceptor is the only safety net. | ungranted | unit | S10 |
| `fe-epic:R-FE-06` (TECH 4, no proactive session-expiry handling) — **timer / `visibilitychange` half** | risk | retire | — (no test successor; the open product question is recorded at §10, U-13) | Split 2 of 2. Retired **as a test obligation only**, on the source's own authority: `fe-epic:S6#risk-assessment` states that the timer/`visibilitychange` behaviour "is a product decision", and `_bmad-output/implementation-artifacts/user-management/deferred-work.md:25` likewise proposes it as unbuilt work rather than an untested behaviour. There is nothing to test until Product decides, so no obligation is carried forward; the question itself stays explicit and open at §10, U-13. The executor does not invent its answer. | n/a | none | S10 |
| `fe-epic:R-FE-07` (OPS 2, no per-route `document.title` on standalone auth pages) | risk | preserve | QA improvement backlog § Frontend polish | No product requirement states a title convention. Owner DEV, trigger "a route-title requirement is stated". Status "Monitor" preserved; not upgraded. | ungranted | none-yet | S10 |
| `fe-epic:unit/session.ts` (`decodeJwtSub`, `isJwtExpired`, read/write/clear — 12 cases, P0) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage (frontend subsection) | Mitigates `fe-epic:R-FE-01`. | ungranted | unit | — |
| `fe-epic:unit/http.ts` (`httpStatus`, `errorCode`, `errorBody` — 9 cases, P0) | test-id | preserve | QA improvement backlog § Frontend error handling | Cross-cutting; no owning product epic. | ungranted | unit | — |
| `fe-epic:unit/employeeFormatters.ts` (`getInitials`, `formatBirthday`, `formatIsoDate`, `fullName` — 12 cases, P1) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage (frontend subsection) | Identity-card presentation; `UM-E1-S1.2`. | ungranted | unit | — |
| `fe-epic:unit/datetime.ts` (`formatTimestamp`, `todayIsoDate` — 6 cases, P1) | test-id | preserve | QA improvement backlog § Frontend shared utilities | Used across flows; no single owner. | ungranted | unit | — |
| `fe-epic:unit/hooks` (`useDebounce`, `useLocalStorage` — 6 cases, P2) | test-id | preserve | QA improvement backlog § Frontend shared utilities | Generic hooks used across flows with no product requirement stating their behaviour, so no product epic owns them. The plan requires such items to sit in a clearly labelled backlog with owner and trigger and to **not** count as requirement coverage. Owner: DEV. Trigger: a helper gains a product-visible behaviour. | ungranted | unit | — |
| `fe-epic:component/StatePanel` (6 cases, P0) | test-id | preserve | QA improvement backlog § Shared UI surfaces | "Every flow renders it; nothing tests it directly." No single product epic. | ungranted | component | — |
| `fe-epic:component/RequireAuth` (4 cases, P0) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage (frontend subsection) | Route guard is part of the authenticated-session obligation, `UM-E2`. | ungranted | component | — |
| `fe-epic:component/identity-card-nulls` (5 cases, P0 — one per nullable field) | test-id | merge | `test-design-epic-user-management-1.md` § Coverage (frontend subsection) | Origins: `fe-epic:component/identity-card-nulls`, `um-epic:cluster/s1-card-projection-nullables`. Same defect class on both sides of the seam. | ungranted | component | — |
| `fe-epic:component/PersonPicker` (8 cases, P1) | test-id | preserve | `test-design-epic-platform-capabilities-1.md` § Coverage | With `fe-epic:R-FE-05`. **Task 2 (checkbox 6) — `PMC-E1` CONFIRMED**, on the same authority as the risk: `user-management/epics.md:610` places substring/typeahead directory search outside UM and inside platform §4.1 directory scope. The source's own case list — "Search, pagination boundary, empty result" (`test-design-epic-frontend.md:144`) — is directory-search behaviour, so all 8 cases follow the capability, not the consuming flow. Cross-referenced from `UM-E4`/`UM-E6` as a consumer. | ungranted | component | — |
| `fe-epic:component/AccountMenu` (3 cases, P1) | test-id | preserve | `test-design-epic-user-management-2.md` § Coverage (frontend subsection) | Sign-out / session interaction. | ungranted | component | — |
| `fe-epic:component/MainHeader,SideMenu` (5 cases, P2) | test-id | preserve | QA improvement backlog § Shared UI surfaces | Nav chrome; no owning product epic. **Task 2 (checkbox 6) — the `PMC-E1-S1.2` re-home is DECLINED; the backlog placement stands.** `PMC-E1-S1.2`'s own scope note (`platform-capabilities/epics.md:426`) says Story 1.1 "owns the row projection, its leak matrix, and pagination; **this story owns everything presentational over those rows**" — its subject is the directory *table's* presentation and the accessibility floor, not application-global chrome. The source describes these cases as "**Nav state and active-route rendering**" (`test-design-epic-frontend.md:146`), which is app-shell behaviour present on every route, so no product epic owns it and no product requirement states a navigation contract. Backlog entry carries **owner: DEV** and **trigger: a product requirement states global navigation or active-route behaviour**. Per the plan it does **not** count as requirement coverage. | ungranted | component | — |
| `fe-epic:component/mutation-hooks` (optimistic token, `409` recovery — 6 cases, P1) | test-id | preserve | `test-design-epic-user-management-4.md` § Coverage (frontend subsection) | The `409` recovery path is the DEC-UM-005 reject-then-retry contract seen from the client. **Task 2 (checkbox 6) — `UM-E4` CONFIRMED, and the departure-`409` question is answered elsewhere, not here.** The source assigns the departure `409` shapes to a *different* row: `test-design-epic-frontend.md:170` puts "Incl. the departure `409` shapes" on the **error-extractor unit** obligation (`fe-epic:unit/http.ts`, `R-FE-03`, 9 cases), which §4.4 already routes to the QA improvement backlog with an explicit `UM-E5` cross-reference. The mutation-hooks row itself carries **no risk ID** at source (`:185`) and its subject is the optimistic-concurrency token — `expectedCurrentTargetId` / `expectedCurrentManagerId`, the DEC-UM-005 relationship-mutation contract, which is `UM-E4`. Corroborated by `_bmad-output/implementation-artifacts/user-management/deferred-work.md:74–77`, where exactly those two token names are the item's subject. So these 6 cases are **not** split across `UM-E4` and `UM-E5`; the departure obligation is already carried, once, by the error-extractor row. | ungranted | component | — |
| `fe-epic:component/import-summary` (partial success is not an error — 3 cases, P2) | test-id | preserve | `test-design-epic-user-management-1.md` § Coverage (frontend subsection) | `UM-E1-S1.1` import. | ungranted | component | — |
| `fe-epic:claim/two deferred-work.md items closed by this design` (`test-design-epic-frontend.md:259`) | factual-claim | retire | — (retired as a *current completion claim* only; both underlying deferred items stay open in their own live file, which this migration does not modify) | **Re-adjudicated on the real file.** The cited file exists — `_bmad-output/implementation-artifacts/user-management/deferred-work.md` — and both cited items resolve: `:11–13` is the 401-interceptor/`isAuthEndpoint` e2e-coverage note, `:15–17` the "`useAuth().userId` / `decodeJwtSub` output is unverified" note. The **closure** claim is retired on three grounds. (1) That file records closures explicitly with a `resolved:` line (see `:40` and `:77`); **neither cited item carries one at `76a7220`** — both are still open. (2) A test *design* proposes cases; it executes none. Plan Task 2: "If current implementation has not been verified, label it unverified rather than completed." (3) For the 401-interceptor note the claim is not merely unexecuted but unsupported: that note asks for an **e2e** assertion (seed a session, stub a 401, assert `sessionStorage` cleared + one redirect to `/login`, and that a `/auth/magic-link*` 401 is **not** redirected), and no obligation in §4.4 covers it — `fe-epic:unit/http.ts` tests the `lib/http.ts` extractors, not the interceptor. **Task 2 (checkbox 6) — settled: it does NOT discharge it, and the row's `retire` disposition is confirmed.** `_bmad-output/implementation-artifacts/user-management/deferred-work.md:16` states the item's subject as "`useAuth().userId` / `decodeJwtSub` output is unverified — **no G1 component reads it**". The unverified thing is therefore the *consumption* of the decoded subject by a rendering component, not the purity of the decoder. `fe-epic:unit/session.ts` (12 cases) tests `decodeJwtSub`, `isJwtExpired` and the read/write/clear helpers in `lib/session.ts` — it covers the decoder half and **not** the "a component reads it and renders it" half, which needs a component-level assertion that no obligation in §4.4 currently states. **Consequence recorded, not invented:** the gap is opened as **U-22**, owned by DEV/QA; it is not converted into a new test obligation here, because inventing coverage is exactly what this ledger must not do. Neither deferred item is closed by this migration. | n/a | unverified (a `resolved:` line in `_bmad-output/implementation-artifacts/user-management/deferred-work.md`, written by that file's owner after the tests run, would discharge it) | — |

---

## 5. Decision, constraint, blocker, gap, trace and gate ledger

### 5.1 Execution constraints

These must stay **separately stated**. Backend database isolation and frontend browser
parallelism are different constraints with different mechanisms; collapsing them into one
"worker" rule would lose both.

**RECHECKED BY TASK 2 (checkbox 5) — the current policy was re-read, not the old document.**
Four things were checked and are recorded here once rather than repeated per row.

1. **The binding isolation policy is current, and it is the reason for the disposition.**
   Re-read at `76a7220`: `docs/architecture/testing-strategy.md` § "Test data isolation
   (DEC-UM-010)", lines 254–261, states (a) run with **one test worker** now, each run/test
   using a collision-proof UUID namespace and deleting only data it owns; (b) `@concurrency`
   scenarios issue parallel HTTP **inside one isolated test** via `Promise.all` and do **not**
   require multiple workers; (c) **before** enabling parallel workers, provision **one
   PostgreSQL schema per worker** and clean it up after the run — a `Date.now()` prefix alone
   is not sufficient; (d) this is platform infrastructure, so feature owners do not invent
   ad-hoc isolation per story. Every backend row below is preserved **because that policy says
   so today**, not because the 2026-08-25 document said so. No old worker setting was carried
   forward unchecked.
2. **The backend and frontend constraints are kept apart, and the reason is mechanical.**
   The backend rule exists because e2e suites share **one database**; the frontend rule exists
   because Playwright parallelises **by file** over browsers with **no shared database**. The
   frontend therefore does **not** inherit `--runInBand` or the one-worker rule, and the
   backend does **not** inherit `retries: 2`. Two rows, two mechanisms, no merged "worker" rule.
3. **Schema-per-worker is explicitly not scheduled work.** `um-epic:exec/--runInBand-backend-e2e`
   carries the source's own conclusion — "Schema-per-worker would unlock parallelism; it is not
   needed at 90 seconds and should not be built until it is" — which agrees with DEC-UM-010's
   ordering (schema-per-worker is a **precondition of** enabling parallel workers, not a
   standing task). It is recorded in §8 as shared infrastructure that is deliberately unbuilt,
   with no estimate attached.
4. **The evidence-level distinctions are preserved as four separate levels, and one was
   under-named.** §1.5's vocabulary keeps `contract (Pact)` (provider/consumer verification, no
   browser and no live provider), `api-e2e (real HTTP + PostgreSQL)` (backend Jest + supertest
   against a migrated database), and `integration-live` (a real external provider —
   timetracker, PeopleForce — reachable only in the weekly/pre-release slot) apart, and no row
   below substitutes one for another. The **mocked-browser** level was carried in §1.5 only as
   the bare word `component`; Task 2 records the missing qualifier here rather than editing the
   vocabulary table out from under Task 1's 500+ rows: every `component` evidence cell in this
   ledger means **a component rendered in `jsdom` with the network mocked** — no browser
   process, no HTTP, no database. It is therefore *not* interchangeable with the frontend
   Playwright e2e cases (a real browser against a mocked or real API), which appear in this
   ledger as `unverified` observations of the existing suite, never as `component`. Recorded as
   a vocabulary precision note, **not** a disposition change: no row's `evidence_contract` cell
   was altered.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:exec/one-worker-until-schema-per-worker` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — backend isolation | **Recheck outcome: still binding.** `docs/architecture/testing-strategy.md` § "Test data isolation (DEC-UM-010)" states (1) one test worker now, collision-proof UUID namespace, delete only owned data; (2) one PostgreSQL schema per worker before parallel workers; `Date.now()` prefix alone insufficient. Preserved because the current policy says so, not because the old document said so. | ungranted | repository-audit | S1, S2, S13, S15 |
| `legacy-um:exec/@concurrency-parallel-http-in-one-test` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — backend | DEC-UM-010: concurrency scenarios issue parallel HTTP inside one isolated test via `Promise.all`; they do **not** require multiple test workers. | ungranted | api-e2e | S2, S15 |
| `legacy-um:exec/k6-nightly-no-live-third-party` | execution-constraint | replace | `test-design-qa.md` § Execution strategy — nightly | The "no live third-party calls in gate E2E" rule (PM/AD-3) is preserved; the k6 nightly slot's *subject* is replaced (§7.1). | ungranted | measurement — harness **UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); contract **A** of §7.1 (§6, F-17; §10, U-24) | S1, S2 |
| `legacy-um:exec/all-gate-e2e-in-PR-unless->15min` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — philosophy | Identical philosophy independently restated by `plat`, `um-epic` and `fe-epic`. Origins: `legacy-um:S2#execution-strategy`, `plat:S4#execution-strategy`, `um-epic:S5#execution-strategy`, `fe-epic:S6#execution-strategy`. | ungranted | unverified | S4, S5, S6 |
| `um-epic:exec/--runInBand-backend-e2e` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — backend isolation | Backend e2e runs serial because suites share one database and isolate by run-namespaced ids (`um-epic:R-UM-04`). The source's own conclusion — "Schema-per-worker would unlock parallelism; it is not needed at 90 seconds and should not be built until it is" — is consistent with DEC-UM-010 and is preserved. | ungranted | unverified | S5 |
| `um-epic:exec/backend-suite-timings (unit 0.4s; e2e 43 files/406 cases/90s; contract ~50s)` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — backend, marked `unverified` | Measured on 2026-09-06 by the source run; **not re-measured in this task**. Carried as an unverified observation with its date, never as a current guarantee. | ungranted | unverified | S5 |
| `fe-epic:exec/playwright-parallelizes-by-file-retries-2-in-CI` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — frontend | Frontend parallelism is a browser/file concern with no shared database; it must not inherit the backend one-worker rule. `playwright.config.ts` `retries: 2` in CI is a frontend fact. | ungranted | unverified | S6 |
| `fe-epic:exec/frontend-suite-timings (124 cases/19s; unit <2s target; component <10s target; contract ~2s)` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — frontend, marked `unverified` | Same treatment as the backend timings. | ungranted | unverified | S6 |
| `fe-epic:exec/vitest+jsdom present; needs @testing-library/react and a second vitest config` | execution-constraint | preserve | owning epic plans § Entry criteria | Tooling prerequisite, not a platform decision, per the source. Unresolved sub-question (config/file-location convention) → §10, U-12. | ungranted | unexecuted | S6 |
| `plat:exec/no-live-PeopleForce-run-required` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — weekly/pre-release | v1.5 §5.2 GOOD TO HAVE; unchanged. | ungranted | none | S4 |
| `plat:exec/live-timetracker-uses-test-environment-and-seeded-population` | execution-constraint | preserve | `test-design-qa.md` § Execution strategy — weekly/pre-release | v1.5 §5.1 + §7 privacy. Blocked on `PR-B-08`. | ungranted | integration-live | S4, S14 |
| `plat:exec/no-test-generation-in-this-run` | execution-constraint | preserve | `test-design-qa.md` § Appendix — fixture pattern | "This Create run is a planning artifact, and the user explicitly forbids test generation." The migration honours the same boundary. | ungranted | none | S4 |
| `config:tea_use_playwright_utils = true` (`_bmad/config.toml:25`) | execution-constraint | preserve | `test-design-qa.md` § Appendix — fixture pattern | Raw `request.<method>` is not permitted; `apiRequest` from merged fixtures + `expect` from `@playwright/test`. Configuration is unchanged by this migration. | ungranted | repository-audit | S2, S4 |
| `config:test_artifacts` / `test_design_output` (`_bmad/config.toml:24,35`) | execution-constraint | preserve | Task 4 contract | `test_artifacts = "{project-root}/_bmad-output/test-artifacts"`; `test_design_output = "_bmad-output/test-artifacts/test-design"`. **Output roots stay unchanged**; `test_design_output` remains the existing handoff location, not a competing root. | ungranted | repository-audit | Task 4 |
| `trace:allow_gate=false` whole-repository planning audit (AGENTS.md § Trace artifacts) | execution-constraint | preserve | `test-design-qa.md` § Release and design gates, boundary note | AGENTS.md: the current trace is a whole-repository planning audit run with `allow_gate=false`, and its aggregate percentage must never be presented as release readiness; `gate-decision.json` does not exist unless a run issues a verdict. **This migration issues no verdict and regenerates no trace artifact.** | ungranted | none | AGENTS.md, `_bmad/custom/bmad-testarch-trace.toml` |

### 5.2 `plat` blockers and sign-off packages

Nine blockers and two sign-off packages. **ADJUDICATED BY TASK 2.** Task 1 named candidate
ratifications and left every one open. Task 2 adjudicated all eleven against the
**architecture blocker register**, which Task 1 did not consult and which resolves them
directly rather than by inference from epic files.

**Authority: `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml`**
(the register: 31 entries, each carrying `status`, `design_status`, `implementation_status`,
`decision_refs`, `closure_condition`), corroborated by
`_bmad-output/planning-artifacts/architecture/blocker-verification-2026-09-03.md` (every open
entry's premise re-checked against backend source, twice, across an `origin/main` merge) and
`_bmad-output/planning-artifacts/global-coverage/.memlog.md:12` ("Removed live
OQ-114/OQ-115/CC-05 gates after PM/AD-32/33/28. OQ-PERM-01 remains. DEPARTMENT-EDGE and CC-07
remain implementation gates").

**The distinction the plan demands is the register's own distinction, and it is load-bearing
here.** `blockers.yaml` states the governing rule itself — *"open blockers remain fail-closed
and are not resolved by ratification"* — and individual entries reinforce it: *"schema
approval alone does not close implementation"*, *"a named memlog decision does not close
implementation"*, *"design ratification is not implementation evidence"*, *"do not treat
design closure as production-ready projection"*. So the register separates `design_status`
from `implementation_status` on every row, and the 2026-09-03 sweep concluded **"17 open · 0
closeable"**.

**Outcome: 6 of the 9 `PR-B-*` blockers are CLOSED AT DESIGN. Not one of them is closed at
implementation, and closing design discovery closes no implementation work.** Both `PR-S-*`
sign-offs remain **ungranted**. Nothing below grants a sign-off, asserts an implementation,
or reports runtime evidence.

| Design-closed, implementation open | Still open |
| --- | --- |
| `PR-B-01`/`OQ-114` (PM/AD-32) · `PR-B-02`/`OQ-115` (PM/AD-33) · `PR-B-03`/`OQ-116` (PM/AD-27) · `PR-B-04`/`OQ-117` + `ARCH-ENV-01` (PM/AD-34) · `PR-B-05`/`OQ-105` **HR-Admin half only** (PM/AD-26, AD-12) · `PR-B-06`/`CC-05` (PM/AD-28) | `PR-B-05` **role-permission-assignment half** → `OQ-PERM-01` P1 · `PR-B-07`/`CC-07` **P0** · `PR-B-08` → `TT-IDENTITY-01` **P0** + `TT-PMDM-01` P1 · `PR-B-09` → `OPERATIONAL-ENVELOPE` **P0** · `PR-S-01`/`CC-04` · `PR-S-02`/`CC-06` |

**U-1 is therefore closed as a question and replaced by a smaller one** (§10): six blockers
resolve, and what remains is the implementation and decision work the register already
tracks under its own IDs. **U-2 stays open** — no sign-off was granted or inferred.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `plat:PR-B-01 / OQ-114` (EAV vs JSONB custom-field storage; indexed visibility-safe filter/sort; column-per-field excluded) | decision | replace | `test-design-architecture.md` § Ratified design decisions (moved **out** of § Open blockers) — recorded as *design-closed, implementation open* | **Task 2 — CLOSED AT DESIGN (both halves); implementation OPEN as transition debt.** Authority: `blockers.yaml` `OQ-114` — `status: closed`, `closed: 2026-09-02`, `design_status: resolved-approved`, `implementation_status: **transition-debt**`, `decision_refs: [PM/AD-32]`, `carries_transition_debt: [TD-12]`, closure condition *"Closed at design: typed EAV plus definitions table. Implementation still uses `User.customFields` jsonb (TD-12)."* Both halves of the blocker resolve: **storage** — `docs/architecture/custom-fields.md` fixes `CustomFieldDefinition` + `CustomFieldValue` typed EAV and states "Column-per-field schema is forbidden"; **indexed visibility-safe filter/sort** — the same file names four btree indexes and states "Directory filter/sort reads `CustomFieldValue`, never `User.customFields`" and "Access Control visibility is applied **before** filter execution so a hidden value cannot be inferred". **What does not close:** implementation. `User.customFields jsonb` is still the live schema and is explicitly "not the target" (TD-12); `UM-E8` and `UM-E7` are unstarted. Design closure is not implementation evidence. | ungranted | manual-review (design, closed) + api-e2e/unit (implementation, absent) | S3, S4, S8, S14 |
| `plat:PR-B-02 / OQ-115` (one dashboard engine's widget authorization, aggregation, counter projection) | decision | replace | `test-design-architecture.md` § Ratified design decisions — recorded as *design-closed, implementation absent* | **Task 2 — CLOSED AT DESIGN; implementation ABSENT.** Authority: `blockers.yaml` `OQ-115` — `status: closed`, `closed: 2026-09-02`, `design_status: resolved-approved`, `implementation_status: **absent**`, `decision_refs: [PM/AD-33]`, closure condition *"Closed at design: four fixed read models; authorize then aggregate; no generic widget framework. Implementation absent."* All three sub-questions the blocker named are answered by `docs/architecture/dashboards.md`: **widget authorization** — "AccessControl resolves authorized target ids **before** any aggregation. A dashboard never widens section access", and "view a given dashboard" stays an independently grantable functional permission; **aggregation** — four fixed read models (UM, DM, PM, PP) composed from owning-context application queries, "one composer, not four unrelated apps, and not a shareable widget engine"; **counter projection** — the AD-18 fixed facts (active risk excludes `low`; unattached resourcing requests appear in `Unassigned` and count in all-project counters; PP dashboard has no resourcing block; DM counters span the viewer's projects, PM the same model scoped to own projects). The blocker is answered by **rejecting** the generic engine, which is a resolution, not an evasion. **What does not close:** implementation is "Absent", and `PMC-E2` carries its own **SPRINT-ENTRY BLOCK on `OQ-PERM-01`** (gating a dashboard on its proper permission while seeding no grant yields "working, correct, unreachable software"). Recorded open conflict, not resolved here: `PMC-E1` SD-1 records PM/AD-33's "no widget engine" against an EXPECTED-UX dashboard-customize mode as an **open UX↔architecture conflict** owned outside this migration. | ungranted | manual-review (design, closed) + api/ui e2e (implementation, absent) | S3, S4, S8, S14 |
| `plat:PR-B-03 / OQ-116` (non-manager project-assignment semantics; resulting policy target roles) | decision | replace | `test-design-architecture.md` § Ratified design decisions — design-closed; the department walk is re-gated on `DEPARTMENT-EDGE`, not on this blocker | **Task 2 — CLOSED AT DESIGN; implementation ABSENT; and the successor gate is a *different* blocker.** Authority: `blockers.yaml` `OQ-116` — `status: closed`, `closed: 2026-09-02`, `design_status: resolved-approved`, `implementation_status: absent`, `decision_refs: [PM/AD-27]`, closure condition *"Closed. Ordinary membership is not Project-line. No member `targetRole`."* That answers both halves the blocker asked: ordinary project membership does **not** confer a Project-line audience, and no policy target role is created for a member. Task 1's candidate authority (`PLAT-E5`/`PLAT-E8` existing as epics) was the wrong kind of evidence — an epic existing is not a decision. **Correction that matters for scheduling:** the register records "`DEPARTMENT-EDGE` no longer depends on this question", and `DEPARTMENT-EDGE` is itself **P1 open** — the 2026-09-03 re-sweep found `Department` + `DepartmentMembership` shipped but **four** closure elements absent (no `parentId` index, no `isHr` column, no cycle rejection, and `DepartmentMembership` is temporal and multi-valued where AD-35 specifies single-valued `UserDepartment`). So closing `OQ-116` moves the department-walk gate, it does not remove it. | ungranted | manual-review (design, closed) + api-e2e (implementation, absent) | S3, S4, S8, S14 |
| `plat:PR-B-04 / OQ-117` (profile bounded-context boundary; S1–S16 projection ownership) | decision | replace | `test-design-architecture.md` § Ratified design decisions — design-closed; the *projection* half survives as a live seam under `ARCH-ENV-01` `implementation_status: partial` | **Task 2 — CLOSED AT DESIGN; implementation PARTIAL. "Re-gated" means re-registered, not still-blocking.** Authority: `blockers.yaml` `OQ-117` — `status: closed`, `closed: 2026-09-02`, `design_status: resolved-approved`, `implementation_status: **partial**`, `decision_refs: [PM/AD-34]`, closure condition *"Closed at design. `user-management` owns assembly. No new bounded context."*, note *"Decided together with `ARCH-ENV-01` (PM/AD-34). Runtime still serializes whole `User` rows."* `ARCH-ENV-01` (which **supersedes** architecture `OQ-118`) carries the companion closure and its own warning: *"Do not treat design closure as production-ready projection."* Task 1's reconciliation question about `PLAT-E1-S1.6`'s "PR-B-04 re-gated" resolves: the blocker was **re-registered** as `ARCH-ENV-01` to escape an ID collision with a historical PRD `OQ-118`, not left blocking. **What does not close, and is the load-bearing residue:** `GET /users` still whole-row serializes, recorded identically in four canonical planning files (`platform/epics.md:210`, `platform-capabilities/epics.md:61`, `cds/epics.md:82`, `engagement/epics.md:83`) as "ratification §4.2 `absent`; PM/AD-34 `partial`" — "a correct section decision in the kernel does not imply a correct payload at the HTTP edge". That seam is a **testability gap the platform architecture document must state**, not a closed question. | ungranted | manual-review (design, closed) + api-e2e projection (implementation, partial) | S3, S4, S8, S14 |
| `plat:PR-B-05 / OQ-105` — **half 1 of 2: who may grant/revoke HR Admin** | decision | replace | `test-design-architecture.md` § Ratified design decisions — design-closed, implementation transition-debt | **Task 2 — SPLIT (Split 1 of 2). This half is CLOSED AT DESIGN; implementation is transition debt.** Authority: `blockers.yaml` `OQ-105` — `status: closed`, `closed: 2026-09-02`, `design_status: resolved-approved`, `implementation_status: **transition-debt**`, `decision_refs: [PM/AD-26, PM/AD-12]`, closure condition *"Closed at design and consistent with AD-12. Implementation still treats `User.position` as HR Admin and has no last-holder FR guard."* The 2026-09-03 sweep lists `OQ-105` among the entries "**closed at design with implementation still absent or transition debt**" and warns that reading these as "done" is "the specific misreading the fields exist to prevent". Two named implementation gaps travel with the closure and are real test obligations: `User.position` is still treated as HR Admin (which DEC-UM-002 forbids as an authorization rule), and there is **no last-holder guard**. | ungranted | manual-review (design, closed) + api-e2e (`position`-as-authorization negative; last-holder guard) | S3, S4, S8, S14 |
| `plat:PR-B-05 / OQ-105` — **half 2 of 2: remaining default role-permission assignments** | decision | preserve | `test-design-architecture.md` § Open blockers — re-pointed to **`OQ-PERM-01`** (P1 open, Product Owner) and **`OQ-AC-EDIT`** (P1 open, Architect + Access Control) | **Task 2 — SPLIT (Split 2 of 2). This half is STILL OPEN, under two live register IDs.** `OQ-105`'s closure covers the HR-Admin grant/revoke chain only; the register tracks the assignment question separately as **`OQ-PERM-01`** — `status: open`, closure condition *"Approved default role-to-permission assignment matrix"*, note *"Scope is assignment only. Permission-key **existence** is a separate gap tracked as `OQ-AC-EDIT`. Three permissions are seeded in bootstrap; seeding does not establish a catalog. 2026-09-02: remains open. **Architect must not invent default grants.**"* — and the key-existence question as **`OQ-AC-EDIT`** — `status: open`, closure condition *"Both keys present in an approved permission catalog, **or** the design references removed"*, note *"Both keys are referenced by design and exist in no catalog."* **This is the same gap as `um-epic:R-UM-02`** (§4.3a) seen from the architecture side, so U-9 now has named owners and a named closure condition (§10). Its downstream reach is wide and recorded, not inferred: `PMC-E2` is sprint-entry blocked on `OQ-PERM-01`, and the five `um-ct-03/04/05/06/09` `it.todo` cases are blocked on the same matrix grant (§15.6). No default grant is invented here. | ungranted | unit (seeded key set vs gated key set) + approved catalog (absent) | S3, S4, S8, S14 |
| `plat:PR-B-06 / CC-05` (Self versus full-profile overlay precedence; effective section mapping) | decision | replace | `test-design-architecture.md` § Ratified design decisions — design-closed, overlay implementation absent | **Task 2 — CLOSED AT DESIGN; implementation ABSENT.** Authority: `blockers.yaml` `CC-05` — `status: closed`, `closed: 2026-09-02`, `design_status: resolved-approved`, `implementation_status: **absent**`, `decision_refs: [PM/AD-28]`, closure condition *"Closed at design: Self exclusive when viewer equals target; overlay is read-only; `max(Self, overlay)` with `write > read > none` is testable. Overlay implementation remains absent."* Corroborated by `global-coverage/.memlog.md:12` ("Removed live … `CC-05` gates after PM/AD-32/33/28") and `profile-sharing/epics.md:120` ("PM/AD-28 / CC-05 — Full-profile overlay *(design closed)*"). **The closure statement is itself the test contract** — `max(Self, overlay)` with a stated total order is directly assertable, which is why the entry says it "is testable". `plat:PR-004` (SEC 9), which Task 1 recorded as "Blocked on `PR-B-06 / CC-05` … still open", is therefore **unblocked at design** and its evidence becomes schedulable design work; the risk score is **not** changed and the risk does **not** close, because no overlay implementation exists. Recorded, not inherited: `platform` SD-6 confirms `PLAT-E7-S7.3` creates no grant/revoke/seed path and `PM-FR-39`'s grant lifecycle stays **deferred**. | ungranted | manual-review (design, closed) + api-e2e projection positives/negatives (implementation, absent) | S3, S4, S8, S14 |
| `plat:PR-B-07 / CC-07` (immutable relationship/access journal schema, snapshots, reader authorization, transaction enrollment) | decision | preserve | `test-design-architecture.md` § Open blockers — **remains open, P0** | **Task 2 — confirmed OPEN, and it is the single most load-bearing open blocker in this ledger.** Authority: `blockers.yaml` `CC-07` — `status: **open**`, `severity: **P0**`, `design_status: resolved-approved` (PM/AD-29 settled schema, snapshots, readers, enrolment, idempotency on 2026-09-02), `implementation_status: **absent**`, closure condition *"Close only when `AccessJournal` exists, same-transaction enrolment is proven for every listed kind, reader authorization matches PM/AD-29, and `idempotencyKey` uniqueness is proven under retry. **Schema approval alone does not close implementation.**"* Verified in code twice: the 2026-09-03 sweep found **zero occurrences** of `AccessJournal` in `src/` or `prisma/`, unchanged across the `origin/main` merge. This is the exact shape the plan's checkbox 2 names — **the design is adopted and the implementation is absent, and the first does not close the second.** Downstream reach, recorded not inferred: it is the upstream gate for `CC-04` (`PR-S-01`) and AD-19 stage 2; every `UM-E4` story's journal-writing stage is blocked on it; and `profile-sharing/epics.md:74` classes it a **release blocker for the whole profile-sharing slice**, not one story's gate, because §4.8 makes journaling every shared-link access unconditional. | ungranted | manual-review (design, closed) + api-e2e same-transaction enrolment + `@concurrency` idempotency (implementation, absent) | S3, S4, S8, S14 |
| `plat:PR-B-08` (timetracker API/auth/identity/error contract; events vs state-at-sync; partial/intermittent success) | decision | replace | `test-design-architecture.md` § Open blockers — **re-pointed to its two live successors `TT-IDENTITY-01` (P0 open) and `TT-PMDM-01` (P1 open)**; the `TIMETRACKER-CONTRACT` identifier is superseded | **Task 2 — OPEN, but under different identifiers, and Task 1's caution was right for the wrong reason.** Authority: `blockers.yaml` `TIMETRACKER-CONTRACT` — `status: **superseded**`, `superseded_by: [TT-IDENTITY-01, TT-PMDM-01]`. The delivered contract **did** answer three of the blocker's sub-questions on evidence: assignment arrives as **state-at-sync** (no cursor, `since`, delta, webhook or event feed), **no write or reassignment operation exists**, and the 15-minute / 4-hour rules are therefore a poll cadence plus a platform-side consecutive-failure timer. It was *"superseded, not closed: two harder contradictions replace it"* — **`TT-IDENTITY-01`** (P0 open; project members arrive as `AccountTalentDto {email, dateStart, dateEnd}` with **no durable id**, requirements say email alone is insufficient, and PM/AD-13's `User.ttId` therefore "has no population source") and **`TT-PMDM-01`** (P1 open; `projectManager`/`deliveryManager` are untyped strings while members in the same object are emails — "joining an authorization edge on an unformatted display name is a fail-open risk"). A third gap is recorded on the superseded entry: **no leaves endpoint** in the delivered OpenAPI contract, which is `TT-E1`'s subject. **Task 1's file-presence caveat corrected on the facts:** `docs/integrations/timetracker-external-api.json` **does exist** at `76a7220` (§6, F-18), so the 2026-09-03 observation that it was absent from the working tree no longer holds. That changes nothing about the adjudication — the successors are open on **substance**, not on the file's absence — but the ledger must not carry a false statement about the repository. Downstream: `plat:PR-005` (TECH 9) stays open; `PMC-E3` carries no stories at all under SD-7 until `TT-IDENTITY-01` closes. | ungranted | contract review (delivered, partial) + integration-live (blocked) | S3, S4, S8, S14 |
| `plat:PR-B-09` (hosting, environment topology, secrets, backup/restore, monitoring, alert ownership, rollback envelope) | decision | replace | `test-design-architecture.md` § Open blockers — **re-pointed to `OPERATIONAL-ENVELOPE` (P0 open, owner: Architect)**, with its eight named dimensions | **Task 2 — OPEN, and Task 1's "no candidate ratification found" is CORRECTED: the blocker is registered.** Task 1 searched `docs/architecture/*` and found nothing, which is true but was the wrong place to look — the entry lives in the blocker register. Authority: `blockers.yaml` `OPERATIONAL-ENVELOPE` — `status: **open**`, `severity: **P0**`, `owner: Architect`, `register_dimension: operational-envelope`, blocking eight named dimensions: hosting provider · environment topology · observability vendor and alert ownership · manual retry surface · `BUSINESS_TIME_ZONE` validation across environments · worker process topology · rollback position · secret management for external integration keys. Closure condition: *"Each listed dimension decided **or explicitly deferred with a named owner**, without weakening AD-20's shared-database, timezone, health, alert, or worker requirements."* Two things this gives the migration that Task 1's "Open" did not. **(1) It is cheaply closeable and nobody has closed it** — the 2026-09-03 sweep calls it "the cheapest of the five: its closure condition explicitly accepts *deferred with a named owner*. It does not require solving anything — only assigning." **(2) It is a live test-design dependency, not just a release chore** — `CC-06` (`PR-S-02`) `depends_on` it, AD-20 "classifies mixed process configuration as a **startup/deployment failure**, so divergence here is a runtime failure mode, not a documentation inconsistency", and `BUSINESS_TIME_ZONE` validation across environments is precisely the seam the departure `dueAt` boundary tests depend on (§15.6). Recorded note: *"Declining to certify deployment readiness is not the same as recording the envelope as deferred with an owner."* | ungranted | manual-review (decision, unassigned) + deployment evidence (absent) | S3, S4, S8, S14 |
| `plat:PR-S-01 / CC-04` (one PP per employee; atomic optimistic create/replace/delete; next-request revocation; concurrency; journal direction) | decision | replace | `test-design-architecture.md` § Sign-off-ready packages — restated as *design resolved-approved; open purely as an implementation and journal-enrolment gate; sign-off still ungranted* | **Task 2 — the sign-off distinction Task 1 preserved is right and is kept; the blocker's *character* is restated.** Authority: `blockers.yaml` `CC-04` — `status: open`, `severity: P2`, `design_status: **resolved-approved**`, `implementation_status: absent`, `decision_refs: [PM/AD-19, PM/AD-29]`, and an explicit `status_note`: *"Design is resolved-approved (PM/AD-19). This entry stays open **only as an implementation and journal-enrolment gate**. It is **not a design blocker on AD-19** (H8 verified 2026-09-02)."* Closure condition: *"Close only when `CC-07` is closed **AND** `PUT`/`DELETE` people-partner routes exist with journal-in-transaction behind independently approved AD-1 Stage-2 evidence. **A named memlog decision does not close implementation.**"* So the design content the sign-off package describes — storage as `Relationship`, fixed cardinality, atomic replace with `expectedCurrentTargetId`, `409` semantics, journal-in-transaction — **is settled and can be designed and reviewed against now**, exactly as `plat:DG-03` says. What is **not** settled, and is preserved unchanged: the formal Product Owner/Architect **sign-off is ungranted** (a binding architecture direction is not a sign-off — **U-2 stays open**), and implementation is absent behind `CC-07`. Verified state: `Relationship` model and the `people_partner` partial unique index exist; **no `PUT`/`DELETE` people-partner route and no journal write exist**. | ungranted | manual sign-off trace (ungranted) + api-e2e + `@concurrency` (implementation, absent) | S3, S4, S8, S14 |
| `plat:PR-S-02 / CC-06` (effective date/reason; relationship blockers and outcomes; durable retrying fail-closed executor) | decision | replace | `test-design-architecture.md` § Sign-off-ready packages — restated as *design resolved-approved; open on a five-clause implementation closure condition and four upstream blockers; sign-off still ungranted* | **Task 2 — sign-off distinction preserved; the closure condition is now stated, because it is itself a test contract.** Authority: `blockers.yaml` `CC-06` — `status: open`, `severity: P1`, `design_status: **resolved-approved**`, `implementation_status: absent`, `decision_refs: [PM/AD-20, PM/AD-22, PM/AD-23]`, `depends_on: [CC-07, CC-08, CC-09, OPERATIONAL-ENVELOPE]`. Closure requires, *"with independently approved **production** evidence, not scenarios or red tests"*: (1) every listed participant (`mentorship.applyDepartureEffects`, `action-items.applyDepartureEffects`, the access-control access-ending participant) implements PM/AD-23 against the same signature using the supplied `tx` with no nested transaction; (2) the executor owns claim/fencing and stale tokens no-op; (3) retry/idempotency proven per participant via `departureId`; (4) `CC-07`, `CC-08`, `CC-09` closed; (5) the AD-20 operational release gate demonstrated. **Upstream state, verified:** `CC-07` absent; `CC-08` and `CC-09` gained `model EmploymentStatus` and `model UserEvent` in the merge but stay **P0 open** (`idempotencyKey` exists nowhere in schema or `src/`; the TimeTracker write path does not exist); `OPERATIONAL-ENVELOPE` P0 open; `src/mentorship` does not exist (`CC-10-MENTORSHIP`, P1 open). Sign-off **ungranted** — **U-2 stays open**. `UM-E5-S5.1`/`S5.2` and `departure/um-dep-01..08` exist as scenario prose only. | ungranted | manual sign-off trace (ungranted) + unit state table + api/worker e2e (implementation, absent) | S3, S4, S8, S14 |
| `plat:boundary/"closing design discovery does not close implementation work"` | decision | preserve | `test-design-architecture.md` § Sign-off-ready packages, boundary note; **and as the governing rule over the whole § Ratified design decisions block** | Plan Task 2 requires this distinction explicitly: an adopted design is not implemented behaviour and is not runtime evidence. **Task 2 — `preserve` confirmed, and the rule is now carried with the repository's own wording rather than the test design's.** `blockers.yaml` states it as the register's governing rule — *"open blockers remain fail-closed and are not resolved by ratification"* — and four entries restate it individually: *"schema approval alone does not close implementation"* (`CC-07`, `DEPARTMENT-EDGE`), *"a named memlog decision does not close implementation"* (`CC-04`), *"design ratification is not implementation evidence"*, and *"do not treat design closure as production-ready projection"* (`ARCH-ENV-01`). The 2026-09-03 sweep's own conclusion is the strongest form: **"17 open · 0 closeable"**, with "Reading these as 'done' is the specific misreading the fields exist to prevent." **This rule is what makes the six design closures above safe to record** — without it, moving `PR-B-01..06` out of § Open blockers would read as progress on implementation, which none of them is. It applies verbatim to the three-tier distinction the plan names: adopted design ≠ implemented behaviour ≠ runtime evidence. | ungranted | none | S3, S4, S8, S14 |

### 5.3 Workflow and installation constraints

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `skills:dual-installation` (`.agents/skills/bmad-testarch-test-design` and `.claude/skills/bmad-testarch-test-design`) | execution-constraint | preserve | Task 4 contract | AGENTS.md § "Installed skills are duplicated": Claude Code loads the `.claude/` copy; every fix must be applied to both, and a drift between them once left configurable thresholds inert for days. **Verified at `76a7220`: `diff -qr` between the two `bmad-testarch-test-design` trees reports no differences.** Any Task 4 override must resolve identically through both. | ungranted | repository-audit | Task 4, Task 5 |
| `skills:epic-output-path` (`workflow.yaml:56` — `{test_artifacts}/test-design-epic-{epic_num}.md`) | execution-constraint | replace | Task 4 contract — `epic-{domain}-{number}` identity | This stock derivation is exactly what produced `test-design-epic-user-management.md` and `test-design-epic-frontend.md` from a *domain* rather than an epic number, and it is why a bare repeated epic number across twelve domains is ambiguous. Task 4 overrides step 1 derivation and step 5 output generation. | ungranted | sandbox exercise (Task 5) | Task 4 |
| `skills:handoff-output-path` (`workflow.yaml:49` — `{test_artifacts}/test-design/{project_name}-handoff.md`) | execution-constraint | replace | Task 4 contract — exact path `_bmad-output/test-artifacts/test-design/people-management-handoff.md` | `_bmad/config.toml:14` sets `project_name = "people management"` **with a space**; the existing file is hyphenated. The stock derivation cannot reproduce the existing filename, so the path must be pinned explicitly or a second handoff appears. Plan Task 4 requires exactly this. | ungranted | sandbox exercise (Task 5) | Task 4 |
| `skills:system-output-paths` (`workflow.yaml:37,43` — `{test_artifacts}/test-design-architecture.md`, `test-design-qa.md`) | execution-constraint | preserve | Task 4 contract | These already point at the canonical platform pair names the plan targets. Output roots unchanged. | ungranted | repository-audit | Task 4 |
| `skills:customize.toml` (`persistent_facts = []`, `activation_steps_prepend = []`, `on_complete = ""`) | execution-constraint | preserve | Task 4 creates `_bmad/custom/bmad-testarch-test-design.toml` | The generated `customize.toml` is marked "DO NOT EDIT — overwritten on every update"; the override belongs in `_bmad/custom/`, alongside the existing `bmad-testarch-trace.toml`, `bmad-sprint-planning.toml`, `bmad-validate-prd.toml`. No such file exists for test-design at `76a7220`. | ungranted | repository-audit | Task 4 |
| `test:trace-artifact-naming.test.cjs` | execution-constraint | preserve | — (no change required) | The test governs only the four trace families (`traceability-matrix.md`, `e2e-trace-summary.json`, `tea-trace-coverage-matrix.json`, `gate-decision.json`). Its comment explicitly exempts "test-design progress documents" as legitimately dated per-occurrence records. **No filename this migration introduces is constrained by it**, and it must not be modified. | ungranted | `node --test test/trace-artifact-naming.test.cjs` (unexecuted in this task) | Task 5 |

### 5.4 `legacy-um` decision identifiers → binding decision log

All of these were propagated on 2026-08-25 into `docs/architecture/user-management-test-decisions.md`.
The **decision log is now the authority**; the test-design documents must reference it, not
restate it (restating creates a second source of shared policy). Four of the twelve
decisions have since been RETIRED or REFRAMED by v1.5, and one is a draft.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:B-01` / `legacy-um:C-01` (timeline read vs write audience) | decision | preserve | `docs/architecture/user-management-test-decisions.md` DEC-UM-001 | Already normative. Full Manager line + PP read S9; assigned PP + direct UM write; DM/PM and transitive managers read-only. | source-approved-2026-08-25 (historical, pinned) | api-e2e | S1, S2, S13, S15 |
| `legacy-um:B-02` / `legacy-um:A-02` (deactivation authorization = no-target feature capability) | decision | replace | `docs/architecture/user-management-test-decisions.md` DEC-UM-002 | DEC-UM-002 re-points its traceability to `um-seed-*`, Epic 0 adoption `isAllowed` cases, and Epic 5 departure-permission denial — i.e. the capability rule survives, the deactivation subject moved (PM/AD-22). | historical, pinned | api-e2e | S1, S2, S13, S15 |
| `legacy-um:B-05` / `legacy-um:A-03` (`customFields` database default `{}`) | decision | replace | `docs/architecture/user-management-test-decisions.md` DEC-UM-003 — marked **REFRAMED (v1.5 — no `POST /users`)** | The default survives; the "registration payload omits it" half is gone. | historical, pinned | api-e2e (import) | S1, S2, S15 |
| `legacy-um:R-003` / `legacy-um:A-01` (magic-link enumeration-safety, expiry, single-use, configuration-owned TTL) | decision | preserve | `docs/architecture/user-management-test-decisions.md` DEC-UM-004 | Already normative and current. | historical, pinned | api-e2e with injected clock | S1, S2, S13, S15 |
| `legacy-um:R-004` / `legacy-um:A-06` (reports-to reassignment: explicit DELETE→POST; second POST `409`) | decision | preserve | `docs/architecture/user-management-test-decisions.md` DEC-UM-005 | Already normative and current. | historical, pinned | api-e2e | S1, S2, S13, S15 |
| `legacy-um:OQ1` (server-owned create fields rejected `400`) | decision | retire | — | `docs/architecture/user-management-test-decisions.md` DEC-UM-006 is marked **RETIRED (v1.5 — no `POST /users`)**. Authority: the decision log itself, PM/AD-16, PM/AD-21. No successor. | n/a | none | S1, S2, S15 |
| `legacy-um:OQ2` (`workEmail` trim + lowercase before validation/storage/lookup/uniqueness) | decision | preserve | `docs/architecture/user-management-test-decisions.md` DEC-UM-007 — **KEPT, reconciled to kernel reality** | Applies to the delivered CSV's `Email` column; import is keyed by normalized email because the CSV has no employee-id column. | historical, pinned | unit + api-e2e | S1, S2, S15 |
| `legacy-um:OQ3` / `legacy-um:B-04` (durable retryable dispatch intent in the registration transaction) | decision | retire | — (magic-link dispatch durability survives inside DEC-UM-004 / `UM-E2-S2.1`) | DEC-UM-008 **RETIRED (v1.5 — no registration)**: "there is no create-time dispatch to make durable." Split: registration half has no successor; the `joined_company` same-transaction write survives at import. | n/a (registration); historical, pinned (`joined_company`) | api-e2e (import) | S1, S2, S13, S15 |
| `legacy-um:OQ4` (rehire preserves identity/history; never a second `User` for a normalized email) | decision | preserve | `docs/architecture/user-management-test-decisions.md` DEC-UM-009 — **KEPT, reframed to the seed/import writer** | Now binds every writer, not only a rehire endpoint. | historical, pinned | api-e2e (import) | S1, S2, S15 |
| `legacy-um:OQ5` / `legacy-um:B-03` (one worker + UUID-owned slices now; schema-per-worker before parallel) | decision | preserve | `docs/architecture/user-management-test-decisions.md` DEC-UM-010 and `docs/architecture/testing-strategy.md` § Test data isolation | Binding and current. See §5.1. | historical, pinned | repository-audit | S1, S2, S13, S15 |
| `legacy-um:C-06` (manual backfill may use any documented `UserEvents` type independently of trigger readiness) | decision | preserve | `docs/architecture/user-management-test-decisions.md` DEC-UM-011 | Current. Now spans two domains (`UM-E3` manual, `M-E1` automatic) — see `legacy-um:R-014`. | historical, pinned | api-e2e | S1, S2, S15 |
| `legacy-um:C-02` (Story 1.1 traceability must map all nine registration scenarios) | decision | retire | — | Described as "planning drift, not a product decision". Story 1.1's subject is now "import seeded population" and the nine registration scenarios are legacy. No successor obligation. | n/a | none | S15 |
| `legacy-um:C-03` (scenario trace lines cite normative § not derived FR-n) | decision | preserve | `test-design-qa.md` § Process/trace evidence (via `TD-UM-DOC-01`) | Recorded as "already resolved", retained as a regression audit. | historical, pinned | repository-audit | S15 |
| `legacy-um:C-04` (use Ida for generic feature-permission denials; Bob only for a manager-specific probe) | decision | preserve | `test-design-qa.md` § Persona and denial-actor conventions | A cross-epic test convention that catches an incorrect "any functional role" gate. It survives even though `TD-UM-REG-03` and `TD-UM-DEACT-03` change; the convention is not tied to those routes. | historical, pinned | api-e2e | S15 |
| `legacy-um:C-05` (timetracker supplies projects/people/PM/DM but **no** reports-to hierarchy; reports-to is a manual `direct` relationship) | decision | preserve | `test-design-architecture.md` § Established constraints | Confirmed by PM/AD-10 and PM/AD-13 and by the current `TT-E2` epic ("project membership sync as sole relationship writer"). Load-bearing: conflating reports-to with project-derived manager access is a live confusion risk. | historical, pinned | manual-review | S15 |
| `legacy-um:C-07` (stage-2 email-adapter fake must record exactly one dispatch and no session) | decision | retire | — (dispatch assertion survives only for `POST /auth/magic-link`) | Premised on a registration dispatch that DEC-UM-008 retires. The "no session in body or headers" half survives at `UM-E1-S1.1` (see `TD-UM-REG-05` split). | n/a (dispatch); ungranted (no-session) | api-e2e | S15 |
| `legacy-um:A-04` (manual timeline actors are PP and UM only, vs §3.2 S9 Manager-line RW) | decision | retire | — | Superseded by DEC-UM-001, which resolved exactly this contradiction. The assumption is discharged. | n/a | none | S15 |
| `legacy-um:A-05` (nullable omitted columns return present-and-`null`) | decision | preserve | `test-design-epic-user-management-1.md` § Coverage (both test levels) | **Independently re-derived twice since:** `um-epic:R-UM-06` and `fe-epic:R-FE-02` both found this exact gap, and the contract (Pact) run confirmed the backend returns nulls no fixture produced. The 2026-08-25 "not explicitly sourced" flag is now a live, evidenced obligation. | ungranted | unit + component + contract (Pact) | S15, S5, S6 |
| `legacy-um:A-07` (`testing-strategy.md` gives no guidance on unit tests below the gate) | decision | preserve | `test-design-qa.md` § Level strategy | Same finding as `um-epic:S5` and `fe-epic:S6`. It is the origin of the whole level-strategy section. | ungranted | manual-review | S15, S5, S6 |
| `legacy-um:DEC-UM-012` (deactivated-user magic-link request; extends DEC-UM-004) | decision | preserve | `test-design-epic-user-management-2.md` § Coverage, marked **draft** | `docs/architecture/user-management-test-decisions.md` states: "Proposed 2026-08-25 by TEA per-file scenario review — **not covered by the 2026-08-25 product approval that settled DEC-UM-001..011**; treat as draft until explicitly confirmed." **Must not inherit the DEC-UM-001..011 approval.** Kept explicit and draft; its answer is not invented here (§10, U-6). | draft-decision | api-e2e | `docs/architecture/user-management-test-decisions.md` |

### 5.5 `legacy-um` coverage gaps `G-01`..`G-16`

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:G-01` (Epic 4 reports-to assign/revoke/reassign-denied, P0) | decision | retire | — (gap closed) | Closed: `docs/test-cases/user-management/relationships/` exists on disk at `76a7220`. The *obligation* lives on as `TD-UM-REL-01/02/03`; the *gap* is discharged. | n/a | repository-audit | S15 |
| `legacy-um:G-02` (Epic 4 mentorship pair/unpair + events, P0) | decision | retire | — (gap closed; obligation moved) | Closed: mentorship is now its own domain with 28 scenario files and `M-E1` epics. Obligation tracked as `TD-UM-REL-04/05` split to mentorship (§4.3c). | n/a | repository-audit | S15 |
| `legacy-um:G-03` (Story 1.5 `GET /users` pagination, multi-filter, metadata, P1) | decision | retire | — (gap closed) | Closed: `docs/test-cases/user-management/list/` exists; `UM-E1-S1.5` is a canonical story. Obligation = `TD-UM-LIST-01..04`. | n/a | repository-audit | S15 |
| `legacy-um:G-04` (registration → `joined_company` atomicity, P0) | decision | replace | `test-design-epic-user-management-1.md` — import → `joined_company` atomicity | Trigger changed to import (DEC-UM-008); atomicity obligation unchanged. | ungranted | api-e2e | S15 |
| `legacy-um:G-05` (mentorship attach → `mentorship_start` atomicity, P0) | decision | preserve | `test-design-epic-mentorship-1.md` | `M-E1-S1.3`. | ungranted | api-e2e | S15 |
| `legacy-um:G-06` (self `PUT /users/:id/photo` negative — cannot upload for another user, P1) | decision | preserve | `test-design-epic-user-management-1.md` (or access-control) | `UM-E1-S1.3`. **Task 2 (checkbox 6) — `UM-E1-S1.3` CONFIRMED; access control is a dependency, not the owner.** `_bmad-output/planning-artifacts/user-management/epics.md:300` defines a canonical UM story **"Story 1.3: Self Uploads Own Photo"** (`UM-E1-S1.3`), and `:280` states "Self reads S1 and can write only their photo through Story 1.3". The negative — self cannot upload *for another user* — is the denial half of that same story's contract, so it travels with it. Access Control supplies the denial oracle (PM/AD-24: `401` invalid/inactive session, `404` hidden/missing target, `403` visible but forbidden), which is recorded as a dependency. The `(or access-control)` alternative in the target cell is resolved: it is **not** access-control-owned. | ungranted | api-e2e | S15 |
| `legacy-um:G-07` (magic link for a **deactivated** user, P0) | decision | preserve | `test-design-epic-user-management-2.md` (`TD-UM-AUTH-06`) | Subject of draft DEC-UM-012. | draft-decision | api-e2e | S15 |
| `legacy-um:G-08` (magic link for an **unknown** email — no dispatch, P1) | decision | preserve | `test-design-epic-user-management-2.md` (`TD-UM-AUTH-02`) | DEC-UM-004. | ungranted | api-e2e | S15 |
| `legacy-um:G-09` (`POST /users` with client-supplied `id`/`createdAt`/`createdBy` → `400`, P1) | decision | retire | — | DEC-UM-006 RETIRED; the route does not exist under PM/AD-16. No successor. | n/a | none | S15 |
| `legacy-um:G-10` (`workEmail` trim/lowercase normalization and normalized uniqueness, P1) | decision | preserve | `test-design-epic-user-management-1.md` (`TD-UM-REG-11`) | DEC-UM-007. | ungranted | unit + api-e2e | S15 |
| `legacy-um:G-11` (email transport failure preserves User + durable dispatch intent, P1) | decision | retire | — (auth-side reliability survives at `UM-E2`) | DEC-UM-008 RETIRED. | n/a | api-e2e (auth only) | S15 |
| `legacy-um:G-12` (rehire reactivates the existing User; no duplicate normalized identity, P2) | decision | preserve | `test-design-epic-user-management-1.md` (`TD-UM-REG-12`) | DEC-UM-009. | ungranted | api-e2e | S15 |
| `legacy-um:G-13` (concurrent duplicate reports-to assign, P2) | decision | preserve | `test-design-epic-user-management-4.md` (`TD-UM-REL-08`) | The gap is **not** discharged, so it is preserved rather than retired: `docs/architecture/user-management-test-decisions.md` DEC-UM-005 makes a second reports-to `POST` a `409`, and only one `@concurrency` case (`um-reg-08`) exists on disk — `legacy-um:G-15` records that no parallel reports-to case exists. Its successor obligation `TD-UM-REL-08` is itself preserved (§4.3c) and carries the `@concurrency` mechanism from §5.1. Owner: `UM-E4`, which owns `TD-UM-REL-01/02/03`. | ungranted | api-e2e `@concurrency` | S15 |
| `legacy-um:G-14` (`PATCH /users/:id/events/:id` must not exist — immutability, P2) | decision | preserve | `test-design-epic-user-management-3.md` (`TD-UM-CT-08`) | PM/AD-11. | ungranted | api-e2e | S15 |
| `legacy-um:G-15` (only `um-reg-08` addresses concurrency; no parallel mentorship/reports-to, no concurrent PATCH same field) | decision | merge | `test-design-qa.md` § Execution strategy — concurrency coverage | Partially discharged by `TD-UM-REL-08`; "concurrent PATCH same field" has no successor case and is carried as an open coverage item → QA improvement backlog (owner QA; trigger: a concurrent-write defect or a new same-field mutation route). | ungranted | api-e2e `@concurrency` | S15 |
| `legacy-um:G-16` (implement the approved CI isolation progression) | decision | retire | — | Discharged: DEC-UM-010 is binding policy and `--runInBand` is the current backend behaviour (`um-epic:S5`). The progression's second stage (schema-per-worker) remains a *conditional* gate, not an open gap; it is carried in §5.1. | n/a | repository-audit | S15 |

### 5.6 `plat` normative trace identifiers `TR-*` (119 rows)

Every `TR-*` row is **preserved with its identifier, requirement statement, planned
level and planning state**, and moves to the single platform QA document's Normative
coverage map. `source_commit` = `76a7220`; `source_path` =
`_bmad-output/test-artifacts/test-design-qa-platform.md`; `approval_status` = `ungranted`
for every row (no planning state is an approval, and `AC STAGE-1 DRAFT` is explicitly
inventory, not coverage). Rows whose planning state is `PRODUCT/ARCH BLOCKED` keep their
named blocker, whose adjudication is §5.2 / Task 2. Rows whose state is `OUT OF SCOPE`
preserve that state and its v1.5 GOOD TO HAVE / §10 basis.

> **TASK 2 HAS EXECUTED THIS BLOCK. The text from here to the end of item 4 below is the
> Task 1 *instruction*, retained verbatim so the reasoning is auditable. It is no longer an
> outstanding instruction. What Task 2 actually did, and on whose authority, is recorded
> immediately after it under "Task 2 outcome (D-1)".**

**Instruction to Task 2 for the 23 `AC STAGE-1 DRAFT` rows — read this before acting on
F-3.** Two findings in §6 bear on these rows and, taken literally, they conflict:

- **F-3** says the rows' inventory pointer is dead (`docs/test-cases/access-control/`, 171
  files, does not exist) and must be re-derived.
- **F-12** says `docs/architecture/testing-strategy.md:25–38` removed stage approval on
  2026-09-04, and states plainly that **`docs/test-cases/` scenario documents no longer
  carry an approval status** — "draft", "pending approval" and "unapproved" "are no longer
  meaningful states for them. A scenario is either present or absent."

The reconciled instruction, so Task 2 is not sent after a state the repository abolished:

1. **Re-derive the inventory. Do not go looking for an approval state.** Task 2 replaces the
   dead path and the stale count with the real paths and counts. There is no per-file
   approval status to establish for `docs/test-cases/**` at `76a7220`, so "establish the
   approval state of these suites" is not a task anyone can complete, and asking for it
   would invite an invented answer.
2. **`AC STAGE-1 DRAFT` is preserved as a source state, not re-confirmed as a live one.**
   It records what `plat:S4` said on 2026-08-29, pinned at `76a7220`. Preserving it is not
   a claim that any file is a draft today. It must not be silently converted into
   "approved" either — the correct current statement is that the per-file gate no longer
   exists, so neither word applies.
3. **The `PR-009` risk and the `PG-01` gate survive; their per-file-approval rationale does
   not.** Both rest on the removed gate (§4.2 `plat:PR-009`, §5.8 `plat:PG-01`). Task 2
   restates each against the *current* rule — `docs/architecture/README.md` non-negotiables
   1–2 keep the ordering (scenario doc → red E2E → production code) and the
   no-self-certification rule — rather than copying the 2026-08-29 wording. **`PG-01` is
   still not marked schedulable here**: removing its stated rationale is not evidence that
   the underlying condition is met, and promoting it would be an unevidenced status change.
4. **Task 1 adjudicates none of this.** It records the conflict and the reconciled
   instruction only. See §10, U-15 for the residual open question, restated to match.

#### Task 2 outcome (D-1) — this block is discharged

**Authority: ruling D-1 (2026-09-10, human user), which names
`docs/architecture/testing-strategy.md:25–38` as the authority over the F-3/F-12 conflict.**
Applied as follows; the full reasoning is in §15.0.

1. **Inventory re-derived, per row.** All 23 rows now carry the real inventory —
   `docs/test-cases/access-control-foundation/` (10 `.md`) and
   `docs/test-cases/access-control-kernel/` (91 `.md`), **101** files. Counted at `76a7220`
   with `find docs/test-cases/<dir> -name '*.md' | wc -l`. The "171 files under
   `docs/test-cases/access-control/`" pointer is dead in **five** superseded documents
   (§6, F-3). Disposition stays `replace` for all 23 — the obligation survives, its evidence
   pointer changed.

   **Scope of that claim, corrected 2026-09-10.** This paragraph previously read "every ledger
   row that repeated it is corrected". When it was written that was **not yet true**: the 23
   `TR-*` rows here and `plat:PR-009` (§4.2) carried the corrected inventory, but six further
   rows outside this block still named 171 — four of them (`plat:S3#ownership-boundary`,
   `plat:S3#ac-stage-1-e2e-dependencies`, `plat:S4#child-ownership`,
   `plat:S4#e2e-and-integration-dependencies`) still described the correction as *pending*. All
   six now carry the corrected inventory, so the claim is true as written. The complete set of
   rows that repeat the dead pointer is: §3.3 ×2, §3.4 ×2, §3.8 ×1, §3.9 ×1, §4.2 `plat:PR-009`,
   §5.6 ×23, §5.8 `plat:PG-01`. **No source document was edited** — the dead pointer still stands
   in the five superseded artifacts, which is what makes them superseded.
2. **No approval state was sought, found, invented, or recorded.** Under D-1 a
   `docs/test-cases/**` scenario is present or absent. The remediation instruction "establish
   the approval state of these suites" is **dropped from this ledger wherever it appeared**.
3. **`AC STAGE-1 DRAFT` is recorded as a source state only.** It states what `plat:S4` said on
   2026-08-29, pinned at `76a7220`. It is **not** converted to "approved", **not** re-asserted
   as a live state, and **not** carried into any canonical artifact as an active approval
   obligation. The correct current statement is that the per-file gate does not exist, so
   neither "draft" nor "approved" applies to those files.
4. **`plat:PR-009` restated** — see §5.8's sibling note and §15.0.2. Its per-file-approval
   rationale is retired with D-1 as authority; the risk itself survives on *stronger* current
   evidence, not weaker.
5. **`plat:PG-01` re-adjudicated** — see §5.8 and §15.0.3. Its stated rationale is retired
   with D-1 as authority (the removed per-file gate **was** its only stated support). The gate
   is **not** promoted to schedulable, because three currently-open blockers independently
   support keeping it closed. That is a *new, evidenced* rationale, not the old one preserved.
6. **`plat:DG-01` and the legacy per-stage gates restated** — see §5.8 and §15.0.1.
7. **U-15 is closed** (§10). Two new questions this block exposed are opened as U-19 and U-20.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `plat:TR-2.1-01` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-2.1-01` | v1.5 §2.1 — Access roles and functional roles remain separate; strongest applicable audience is per section. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Phase-1 functional-boundary and audience files; approval pending. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E + policy unit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-02` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-2.1-02` | v1.5 §2.1 — Transitive reports-to Reporting line; relationship-specific audiences in one session. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Phase-1 direct graph only. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-03` | v1.5 §2.1 — Nested Department management grants Reporting-line access. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-03 / OQ-116 plus approved Department edge contract. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-04` | v1.5 §2.1 — Project PM/DM line is separate, transitive only through project path, and narrower. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-03 / OQ-116 defines positive scope; PR-B-08 supplies assignment/freshness contract. | ungranted | API E2E + timetracker integration | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-05` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-2.1-05` | v1.5 §2.1 — Direct assigned-PP audience derivation. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Draft review continues; E2E/implementation waits for PR-S-01 / CC-04 sign-off and normal AD-1 approvals. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-05A` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-05A` | v1.5 §2.1 — Recursive PP HR line follows the PP's HR reporting chain, never the employee delivery chain. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-03 / OQ-116 and approved Department/HR-boundary contract; PR-S-01 sign-off still precedes E2E. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-06` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-06` | v1.5 §2.1 — Manager, PP, department, department-manager changes use dedicated permission/screen, reject self-assignment, journal atomically, apply next request. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: User Management owns PP mutation; its Stage-1 is READY FOR FORMAL SIGN-OFF under PR-S-01 / CC-04. Journal execution waits for PR-B-07 / CC-07; Department mutations still need the approved Department contract. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-06A` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-06A` | v1.5 §2.1 — PP assignment create/replace/delete, concurrency, no self-assignment, journal direction, next-request effect. Planning state at source: **READY FOR FORMAL SIGN-OFF**; dependency/ownership: User Management-owned Stage-1 design/review proceeds against requirements + AD-19; E2E/implementation waits for PR-S-01 / CC-04 sign-off, AD-1 approvals, and PR-B-07 / CC-07 journal details. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-07` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-07` | v1.5 §2.1 — Project access changes within 15 minutes; outage withdraws it after 4 hours. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: PR-B-08 timetracker contract. | ungranted | Integration E2E with controllable time | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.2-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.2-01` | v1.5 §2.2 — UM/DM/PM/PP feature sets; PP has no resourcing; HR Admin is configuration-only. Planning state at source: **READY NOW**; dependency/ownership: Feature owners prove menus/actions; AC Phase-1 proves HR Admin has no default data grant. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.3-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.3-01` | v1.5 §2.3 — Runtime role/permission catalog CRUD and assignment through UI, no deploy/schema change. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Deferred role-catalog child/consumer; no current approved UR suite. | ungranted | UI E2E + API contract | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.3-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.3-02` | v1.5 §2.3 — Every listed permission independently grantable; removal immediate. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Role catalog plus each feature consumer. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.3-03` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-2.3-03` | v1.5 §2.3 — Functional permissions never widen data; campaign exception remains campaign-local. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Base dual-gate only; campaign exception needs campaign consumer. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.3-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.3-04` | v1.5 §2.3 — HR Admin delegation and default starting-role permission assignments approved by PO. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-05 / OQ-105. | ungranted | Configuration review + UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.4-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.4-01` | v1.5 §2.4 — Separate full-profile grant, holder-only grant, no self-assignment, seeded first holder, last-holder guard, journal. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-06 / CC-05 for overlay precedence; CC-07 for the shared journal contract. CC-04 is PP-only and does not apply here. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.1-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-3.1-01` | v1.5 §3.1 — No profile-level permission; server assembles sections per request. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: AC base decisions plus profile projection consumer. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S01` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S01` | v1.5 §3.2 — S1 identity-card matrix, photo exception, relationship fields not writable in S1. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Phase-1 audiences only; Project/full/shared overlays deferred. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S02` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S02` | v1.5 §3.2 — S2 personal-contact matrix. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Same limitation. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S03` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S03` | v1.5 §3.2 — S3 emergency-contact matrix. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Same limitation. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S04` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S04` | v1.5 §3.2 — S4 employment matrix. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Workflow and temporal records are feature-owned. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S05` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S05` | v1.5 §3.2 — S5 document matrix including Project CV/cert narrowing and self certificate upload. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Project positive cells deferred. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S06` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S06` | v1.5 §3.2 — S6 risk matrix; Self/Colleague denial. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Risk workflow separately owned. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S07` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S07` | v1.5 §3.2 — S7 flags, PM read narrowing, employee record-level visibility. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: PM positive/flag behavior awaits Project-line suite. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S08` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S08` | v1.5 §3.2 — S8 feedback visibility matrix. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Feedback workflow separately owned. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S09` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S09` | v1.5 §3.2 — S9 timeline matrix and functional write dual gate. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Timeline workflow separately owned. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S10` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S10` | v1.5 §3.2 — S10 leaves; colleague dates only. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Data freshness/display requires timetracker. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S11` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S11` | v1.5 §3.2 — S11 projects; colleague project name only. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Positive Project-line and sync deferred. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S12` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S12` | v1.5 §3.2 — S12 CDS matrix and self IDP completion exception. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: CDS workflow separately owned. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S13` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S13` | v1.5 §3.2 — S13 mentorship matrix and self flag exception. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Pair-note privacy also needs mentorship consumer. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S14` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S14` | v1.5 §3.2 — S14 tasks matrix and self completion exception. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Campaign exception needs campaign consumer. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S15` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S15` | v1.5 §3.2 — S15 request-history matrix. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Resourcing workflow separately owned. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.2-S16` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.2-S16` | v1.5 §3.2 — S16 per-field visibility matrix. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Runtime filter/projection is PRODUCT/ARCH BLOCKED by OQ-114. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.3-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-3.3-01` | v1.5 §3.3 — `—`, narrowed, and flag-gated facts absent from UI/API/export/search/errors/notifications. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Projection-surface suite deferred; each consumer must prove its surface. | ungranted | API/UI/download E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.3-02` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-3.3-02` | v1.5 §3.3 — Colleague whitelist exactly S1 + S10 dates + S11 project name. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Base section projection only; list/profile consumers still required. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.3-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-3.3-03` | v1.5 §3.3 — Hidden custom values cannot be inferred through filters/columns. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-01 / OQ-114. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.3-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-3.3-04` | v1.5 §3.3 — Campaign sender sees only recipient name and own campaign task status until close. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Campaign workflow/consumer. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-3.4-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-3.4-01` | v1.5 §3.4 — Narrow journal event set, fields, and reader authorization. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-07 / CC-07; PP Stage-1 design may proceed under PR-S-01, but journal-dependent E2E/implementation waits. | ungranted | API E2E + DB transaction evidence | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.8-AC` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.8-AC` | v1.5 §4.8 — Authenticated named-recipient, read-only shared-link overlay; cfg/default/never set; configurable expiry (24-hour default); creator recheck; revocation; access journal. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Shared-link child deferred; never-share set `{S3,S7,S13,S14}`. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.4-AC` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.4-AC` | v1.5 §2.4 — Full-profile overlay over all sections and interaction with Self. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-06 / CC-05. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.3-AC` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.3-AC` | v1.5 §2.3 — Full role/permission catalog authorization. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Deferred role-catalog dispatch. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-PROJ` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-PROJ` | v1.5 §2.1 — Positive Project-line matrix cells. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-03 / OQ-116 and PR-B-08. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-DEPT` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-DEPT` | v1.5 §2.1 — Positive Department walk. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-03 / OQ-116 plus approved Department edge contract. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-2.1-PPHR` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-2.1-PPHR` | v1.5 §2.1 — Positive PP HR-line walk with HR boundary negative. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-03 / OQ-116 plus AD-19 Department/HR-boundary contract. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.1-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.1-01` | v1.5 §4.1 — Sortable All Employees columns. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Profile/directory consumer. | ungranted | API/UI component | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.1-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.1-02` | v1.5 §4.1 — Any profile/derived/custom field as filter and column. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-01 / OQ-114. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.1-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.1-03` | v1.5 §4.1 — Years-with-company numeric filtering and listed standard filters. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Directory plus owning domain data. | ungranted | API + unit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.1-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.1-04` | v1.5 §4.1 — Runtime custom-field types, values, immediate filter/column use. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-01 / OQ-114. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.1-05` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.1-05` | v1.5 §4.1 — Inline edits obey both gates; org relationships excluded. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Directory/profile consumer plus AC. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.1-06` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.1-06` | v1.5 §4.1 — Owner-scoped saved views, multiple tabs, manager sharing. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Directory consumer. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.1-07` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.1-07` | v1.5 §4.1 — Current entitled view exports `.xlsx` with no hidden columns/values. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Projection-surface owner; use XLSX utility. | ungranted | API/UI/download E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.1-08` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.1-08` | v1.5 §4.1 — Colleague list and click-through limited profile. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Boundary draft is insufficient without projection consumer. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.2-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.2-01` | v1.5 §4.2 — Profile assembles S1–S16 and header manager/PP/mentor. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-04 / OQ-117. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.3-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.3-01` | v1.5 §4.3 — Self-service reads/edits/uploads/completes only enumerated capabilities. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Profile, document, CDS, mentorship, task consumers. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.3-02` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-4.3-02` | v1.5 §4.3 — Self never receives risk or unflagged notes. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Also prove through profile projection. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.4-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.4-01` | v1.5 §4.4 — UM dashboard people grouping, exact counters/table/tasks/navigation. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-02 / OQ-115. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.4-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.4-02` | v1.5 §4.4 — DM project tables, all/single selector, recalculated totals, Unassigned, PM-created requests. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-02 / OQ-115. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.4-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.4-03` | v1.5 §4.4 — PM dashboard equals DM shape within own projects. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-02 / OQ-115. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.4-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.4-04` | v1.5 §4.4 — PP dashboard scoped/groupable and contains no resourcing block. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-02 / OQ-115; optional widget ideas are not acceptance requirements. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.5-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.5-01` | v1.5 §4.5 — Manual action-item creation within audience + permission. Planning state at source: **READY NOW**; dependency/ownership: Action-item feature owner. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.5-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.5-02` | v1.5 §4.5 — Fields; open→completed; completion date; author cancellation reason; overdue everywhere. Planning state at source: **READY NOW**; dependency/ownership: Action-item feature owner. | ungranted | API + UI component/E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.5-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.5-03` | v1.5 §4.5 — Campaign activation creates exactly one action item per frozen recipient. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Campaign/action-item contract. | ungranted | Cross-context E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.6-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.6-01` | v1.5 §4.6 — Fixed risk ordering/history/current/trend; any transition; no closed state; leaver ≠ dismissed. Planning state at source: **READY NOW**; dependency/ownership: Risk owner. | ungranted | API + unit + UI | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.6-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.6-02` | v1.5 §4.6 — Active excludes low; dashboard scope/count/sort/filter/drill-through. Planning state at source: **READY NOW**; dependency/ownership: Risk owner; dashboard page is separate from OQ-115 shared engine. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.7-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.7-01` | v1.5 §4.7 — Platform-owned vacancy; creation fields, department routing, optional project, Unassigned, DM visibility. Planning state at source: **READY NOW**; dependency/ownership: Resourcing owner; no PeopleForce vacancy. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.7-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.7-02` | v1.5 §4.7 — Vacancy compensation visible only to author/routed UM/reviewing DM and absent elsewhere. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Resourcing plus projection consumers. | ungranted | API/UI/export negative E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.7-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.7-03` | v1.5 §4.7 — UM proposes department employees or external candidate with required PeopleForce ID/link. Planning state at source: **READY NOW**; dependency/ownership: Candidate ID storage is required; API prefill is not. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.7-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.7-04` | v1.5 §4.7 — Submission auto-creates request-bound DM link with exact evaluation section set and optional S6; link expires when the request is approved, rejected, or withdrawn. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Resourcing/shared-link contract. | ungranted | Cross-context E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.7-05` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.7-05` | v1.5 §4.7 — DM approve/reject with reason, headcount fill, explicit close only, repeated proposals. Planning state at source: **READY NOW**; dependency/ownership: Resourcing owner. | ungranted | API/UI E2E + state-machine unit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.7-06` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.7-06` | v1.5 §4.7 — S15 attempt history excludes compensation; approval waits for timetracker assignment. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Resourcing, profile projection, timetracker. | ungranted | Cross-context E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.8-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.8-01` | v1.5 §4.8 — Manual and automatic profile-sharing workflow. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Shared-link dispatch; see TR-4.8-AC. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.9-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.9-01` | v1.5 §4.9 — Automatic join/grade/position/department/type/extended-leave/mentorship events. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Multiple feature owners; UM child only partially covers legacy set. | ungranted | API integration + transaction checks | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.9-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.9-02` | v1.5 §4.9 — Manual add/edit/delete under both gates; timeline readable chronologically. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Timeline consumer and role defaults. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.9-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.9-03` | v1.5 §4.9 — Departure never creates a timeline event. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Lifecycle/timeline contract. | ungranted | Cross-context negative E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.10-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.10-01` | v1.5 §4.10 — CDS dictionary by department entity+position; external matrix/result links; conclusions. Planning state at source: **READY NOW**; dependency/ownership: CDS owner. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.10-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.10-02` | v1.5 §4.10 — IDP fields, own completion and date, open definition. Planning state at source: **READY NOW**; dependency/ownership: CDS owner. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.10-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.10-03` | v1.5 §4.10 — Last-assessment before/after/between/never and open-IDP filters. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: CDS/directory interworking. | ungranted | API/UI E2E + query unit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.11-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.11-01` | v1.5 §4.11 — Self open flag, mentor/mentees, unflag behavior with active pair. Planning state at source: **READY NOW**; dependency/ownership: Mentorship owner. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.11-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.11-02` | v1.5 §4.11 — Company-wide willing pool exposes S1+flag only; mentee is access-scoped. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Mentorship projection plus AC. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.11-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.11-03` | v1.5 §4.11 — Pair/status lifecycle, required pair closure note, privacy, durable history and timeline events. Planning state at source: **READY NOW**; dependency/ownership: Mentorship owner. | ungranted | API/UI E2E + state-machine unit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.11-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.11-04` | v1.5 §4.11 — Departure auto-closes with system note and bypasses manual-note gate. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Lifecycle/mentorship contract. | ungranted | Cross-context E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.12-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.12-01` | v1.5 §4.12 — Form metadata, external-only content, filter/saved-view audience preview and adjustment. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Campaign/directory contract. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.12-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.12-02` | v1.5 §4.12 — Audience freezes on activation; recipients self-report completion; sender sees exact status/overdue. Planning state at source: **READY NOW**; dependency/ownership: Campaign owner. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.12-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.12-03` | v1.5 §4.12 — Campaign is sole form distribution path, including requested feedback. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Campaign/feedback contract. | ungranted | Cross-context E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.13-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.13-01` | v1.5 §4.13 — Notifications and their negative-content metric. Planning state at source: **OUT OF SCOPE**; dependency/ownership: §4.13 GOOD TO HAVE. | ungranted | Deferred design | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.14-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.14-01` | v1.5 §4.14 — Current-state/event analytics and XLSX export. Planning state at source: **OUT OF SCOPE**; dependency/ownership: §4.14 GOOD TO HAVE. | ungranted | Deferred design | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.15-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.15-01` | v1.5 §4.15 — Feedback fields, management default, employee share flag, chronology/period filter. Planning state at source: **READY NOW**; dependency/ownership: Feedback owner. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.15-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.15-02` | v1.5 §4.15 — Joining interview is feedback; requested feedback is manually entered after campaign; no period comparison. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Feedback/campaign contract. | ungranted | API/UI/cross-context E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.16-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.16-01` | v1.5 §4.16 — Time-bounded active/dismissed status is sole departure source and filter. Planning state at source: **READY FOR FORMAL SIGN-OFF**; dependency/ownership: Stage-1 design/review proceeds against requirements + AD-20; E2E/implementation waits for PR-S-02 / CC-06 sign-off and AD-1 approvals. | ungranted | API/UI E2E + temporal unit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.16-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.16-02` | v1.5 §4.16 — Effective-date read-only/list/task/mentorship/account/access effects are atomic. Planning state at source: **READY FOR FORMAL SIGN-OFF**; dependency/ownership: PR-S-02 / CC-06 sign-off precedes E2E/implementation; PR-B-09 separately blocks operational/release evidence. | ungranted | API E2E + worker evidence | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.16-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.16-03` | v1.5 §4.16 — Recording blocked for all manager/PP responsibilities; explicit re-parent and external PM/DM remediation. Planning state at source: **READY FOR FORMAL SIGN-OFF**; dependency/ownership: PR-S-02 / CC-06 sign-off precedes E2E/implementation; timetracker-owned PM/DM remediation separately depends on PR-B-08. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.17-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.17-01` | v1.5 §4.17 — Seed-only population import, platform auth, no user-create flow, no real data. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Targeted UM child seed-import follow-up; AD-16/AD-21. | ungranted | API/import E2E + route negative | S14 (handoff), S8 (checkpoint) |
| `plat:TR-4.17-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-4.17-02` | v1.5 §4.17 — Exactly one nested department; manager grants access; department maintenance/routing/timeline/CDS key. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-03 / OQ-116 plus approved Department edge contract. | ungranted | API/UI/cross-context E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-5.1-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-5.1-01` | v1.5 §5.1 — Pull leaves/type/dates/status for seeded users and self-service link. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: PR-B-08 timetracker contract/environment. | ungranted | Contract + live test-env integration | S14 (handoff), S8 (checkpoint) |
| `plat:TR-5.1-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-5.1-02` | v1.5 §5.1 — Pull projects/people/PM/DM; sync solely owns sync-managed policy rows. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: PR-B-08 timetracker contract/environment. | ungranted | Contract + integration E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-5.1-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-5.1-03` | v1.5 §5.1 — Security freshness: ≤15 minutes; visible stale banner; last-known data; Project access gone after 4 failed hours. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: PR-B-08; controllable clock and failure-capable adapter. | ungranted | Integration/reliability E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-5.2-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-5.2-01` | v1.5 §5.2 — Store PeopleForce candidate ID/link for external proposals. Planning state at source: **READY NOW**; dependency/ownership: Required resourcing data, no API call needed. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-5.2-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-5.2-02` | v1.5 §5.2 — Optional candidate prefill preview, per-field acceptance/conflict, mapping, authorization, idempotency, forbidden fields. Planning state at source: **OUT OF SCOPE**; dependency/ownership: §5.2 GOOD TO HAVE; platform vacancy remains authoritative. | ungranted | Deferred design | S14 (handoff), S8 (checkpoint) |
| `plat:TR-6-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-6-01` | v1.5 §6 — Runtime custom fields survive arbitrary filtering/sorting. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-01 / OQ-114. | ungranted | API/query evidence | S14 (handoff), S8 (checkpoint) |
| `plat:TR-6-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-6-02` | v1.5 §6 — Three-part role model and live split graph resolution. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: AC approvals plus Project/Department consumers. | ungranted | API E2E + architecture review | S14 (handoff), S8 (checkpoint) |
| `plat:TR-6-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-6-03` | v1.5 §6 — Grade/position/department/type/status are time-bounded records. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: AD-16/AD-20 and owning feature models. | ungranted | API + DB integration | S14 (handoff), S8 (checkpoint) |
| `plat:TR-6-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-6-04` | v1.5 §6 — Seeded user, timetracker user and optional candidate use durable IDs; email insufficient. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: `ttId` and candidate-ID mapping contract. | ungranted | Contract + API/integration negatives | S14 (handoff), S8 (checkpoint) |
| `plat:TR-7-01` | trace-id | replace | `test-design-qa.md` § Normative coverage map → `TR-7-01` | v1.5 §7 — Access correctness directly tested per audience/path/section. Planning state at source: **AC STAGE-1 DRAFT**; dependency/ownership: Phase 1 only; full DoD requires deferred suites. **Task 2 (D-1) — pointer re-derived, disposition unchanged (`replace`).** `AC STAGE-1 DRAFT` is retained as the row's **source** planning state at 2026-08-29 and is not re-asserted as a live state. Its inventory pointer is re-derived: the cited `docs/test-cases/access-control/` (171 files) does not exist at `76a7220`; the real inventory is `docs/test-cases/access-control-foundation/` (**10** `.md`) plus `docs/test-cases/access-control-kernel/` (**91** `.md`) = **101** files. No approval state is sought or recorded for either directory: under ruling D-1 and `docs/architecture/testing-strategy.md:25–38` a `docs/test-cases/**` scenario is **present or absent**, and "draft"/"pending approval"/"unapproved" name a gate removed on 2026-09-04. | ungranted | API E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-7-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-7-02` | v1.5 §7 — Only seeded test population; no real PII in contexts/logs/screenshots/repository. Planning state at source: **READY NOW**; dependency/ownership: Use synthetic identifiers and delivered seed only. | ungranted | CI scan + manual provenance audit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-7-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-7-03` | v1.5 §7 — All Employees with 500+ records and permission resolution responds within 2 seconds. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Composed directory route and 500+ dataset. | ungranted | measurement — harness **UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); contract **A** of §7.1 (§6, F-17; §10, U-24) | S14 (handoff), S8 (checkpoint) |
| `plat:TR-7-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-7-04` | v1.5 §7 — Integration failures do not take down app within §5.1 limits. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Timetracker failure contract. | ungranted | Reliability E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-7-05` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-7-05` | v1.5 §7 — Accessible and responsive list/profile/dashboard. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: No numeric WCAG target is sourced; do not invent one. | ungranted | Automated accessibility + manual viewport/keyboard review | S14 (handoff), S8 (checkpoint) |
| `plat:TR-8-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-8-01` | v1.5 §8 — BMAD use and deliberate migration decisions. Planning state at source: **READY NOW**; dependency/ownership: Manual evidence, not product E2E. | ungranted | Repository/process audit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-8-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-8-02` | v1.5 §8 — Parallel feature ownership without serial QA bottleneck. Planning state at source: **READY NOW**; dependency/ownership: AD-4 feature-owner gate evidence. | ungranted | Branch/review/process audit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-8-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-8-03` | v1.5 §8 — Intelligent repository contains specs/decisions/transcripts/API docs/rules. Planning state at source: **READY NOW**; dependency/ownership: Manual evidence. | ungranted | Repository audit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-8-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-8-04` | v1.5 §8 — Foundation topics have named owners and written alignment before implementation. Planning state at source: **READY NOW**; dependency/ownership: Manual evidence. | ungranted | Repository/review audit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-8-05` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-8-05` | v1.5 §8 — Communication and status are captured. Planning state at source: **READY NOW**; dependency/ownership: Manual evidence. | ungranted | Repository/process audit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-9-01` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-9-01` | v1.5 §9 — Shipped behavior matches §§2–3 and all required functionality. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Requires all child evidence. | ungranted | Trace audit + release regression | S14 (handoff), S8 (checkpoint) |
| `plat:TR-9-02` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-9-02` | v1.5 §9 — Every `—`, narrowed Project-line cell, S7 employee/PM flags, colleague whitelist/campaign exception proven. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: 171 drafts do not cover all deferred DoD slices. | ungranted | API/projection E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-9-03` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-9-03` | v1.5 §9 — Runtime role creation/permission UI works without deploy. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Role-catalog consumer. | ungranted | UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-9-04` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-9-04` | v1.5 §9 — Org changes/full grants reject self-assignment and journal. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PP Stage-1 is PR-S-01 sign-off ready; journal execution remains PR-B-07 / CC-07, full-profile remains PR-B-06 / CC-05, and Department scope remains PR-B-03 / OQ-116. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-9-05` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-9-05` | v1.5 §9 — Shared link named/authenticated, creator rechecked, always revocable. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Shared-link child. | ungranted | API/UI E2E | S14 (handoff), S8 (checkpoint) |
| `plat:TR-9-06` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-9-06` | v1.5 §9 — Timetracker runs against test environment and seeded population. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: PR-B-08 provider access/contract. | ungranted | Live integration demonstration | S14 (handoff), S8 (checkpoint) |
| `plat:TR-9-07` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-9-07` | v1.5 §9 — Foundation test architecture is applied and specs equal behavior. Planning state at source: **E2E DEPENDENCY**; dependency/ownership: Approved AD-1 chain per feature. | ungranted | Trace/history audit | S14 (handoff), S8 (checkpoint) |
| `plat:TR-9-08` | trace-id | preserve | `test-design-qa.md` § Normative coverage map → `TR-9-08` | v1.5 §9 — Product is deployed and demonstrable. Planning state at source: **PRODUCT/ARCH BLOCKED**; dependency/ownership: PR-B-09 operational envelope. | ungranted | Deployment smoke + evidence | S14 (handoff), S8 (checkpoint) |

**Row count: 119.** Planning-state distribution at source: AC STAGE-1 DRAFT = 23; E2E DEPENDENCY = 45; OUT OF SCOPE = 3; PRODUCT/ARCH BLOCKED = 23; READY FOR FORMAL SIGN-OFF = 4; READY NOW = 21.

### 5.7 `plat` planning rows `P0–P3-PLAT` (23 rows)

These are **planning rows, not generated test cases and not coverage**, per the source's own
statement. All preserve their identifier; `approval_status` = `ungranted`; `source_path` =
`_bmad-output/test-artifacts/test-design-qa-platform.md`.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `plat:P0-PLAT-01` (§2–§3 audience derivation and S1–S16 negatives) | planning-row | replace | `test-design-qa.md` § Coverage plan P0 | Preserved as a planning row; its `AC STAGE-1 DRAFT` state carries the dead-pointer correction of §5.6. Risks `PR-001`/`PR-009`. | ungranted | api-e2e | S8 |
| `plat:P0-PLAT-02` (Project/Department/PP-HR/full/shared overlays) | planning-row | preserve | `test-design-qa.md` § Coverage plan P0 | Blocked by `PR-B-03`/`PR-B-06`/`PR-B-08` (§5.2). Risks `PR-001/002/004/005`. | ungranted | api-e2e + integration | S8 |
| `plat:P0-PLAT-03` (projection leak prevention across list/filter/export/profile/errors) | planning-row | preserve | `test-design-qa.md` § Coverage plan P0 | Consumer-owned; risk `PR-001`; v1.5 §3.3. | ungranted | api/ui/download e2e | S8 |
| `plat:P0-PLAT-04` (runtime permission removal; no data widening) | planning-row | preserve | `test-design-qa.md` § Coverage plan P0 | Role catalog now canonical as `RA-E1`; risks `PR-001/007`. | ungranted | api/ui e2e | S8 |
| `plat:P0-PLAT-05` (timetracker identity, atomic sync, freshness, outage cutoff) | planning-row | preserve | `test-design-qa.md` § Coverage plan P0 | `PR-B-08`; canonical owner `TT-E2`. Risks `PR-002/005/010`. | ungranted | integration-live | S8 |
| `plat:P0-PLAT-06` (departure cutoff and atomic effective-date effects) | planning-row | preserve | `test-design-qa.md` § Coverage plan P0 | PM/AD-20; `PR-S-02` sign-off ungranted; canonical owner `UM-E5`. Risks `PR-002/008`. | ungranted | api/worker e2e | S8 |
| `plat:P0-PLAT-07` (seed import/auth cutover; no create/deactivate legacy surface) | planning-row | preserve | `test-design-qa.md` § Coverage plan P0 | PM/AD-16, AD-21. **This row is the platform statement of the same cutover that retires the `legacy-um` registration/deactivation family** (§4.3c) — the two must agree. Canonical owner `UM-E1-S1.1`. | ungranted | api/import e2e + route negative | S8 |
| `plat:P0-PLAT-08` (500+ directory ≤2 seconds) | planning-row | merge | `test-design-qa.md` § NFR measurement contracts + Coverage plan P0 | Origins: `plat:P0-PLAT-08`, `plat:TR-7-03`, `plat:PR-006`, `legacy-um:R-005`, `legacy-um:TD-UM-NFR-PERF-01`, `um-epic:nfr/NFR-2`. See §7.1 for the single measurement contract. **Task 2 (checkbox 4) — the P0-versus-P1 conflict is RESOLVED as `P0`, with the rationale recorded; U-7 closes.** Full reasoning in §15.4. In short: (a) **the risk scores are identical, so severity does not decide it** — `legacy-um:R-005` is PERF **6** and `plat:PR-006` is PERF 2×3 = **6**; both are preserved unchanged and neither is re-scored to justify the priority; (b) the obligation is **release-gated** — `plat:PG-04` is a release gate over `docs/project-requirements.md:614`, a normative v1.5 §7 NFR; (c) `legacy-um:S2#exit-criteria` sets **P0 = 100% covered, P1 = ≥95%**, so a P1 label makes it formally acceptable to ship the release gate uncovered, which contradicts (b) — P0 is the only value consistent with the exit criteria the migration preserves; (d) a dedicated canonical story now exists, `PMC-E1-S1.9` "Directory Performance Evidence at 500+ Rows" (`platform-capabilities/epics.md:737`), whose closing criterion states that on a measured failure "this story does not claim the NFR-3 or SM-4 threshold is met" — a blocking semantics, not a best-effort one. **What was NOT done:** no P0 *percentage* was normalised. The `plat` P0 band keeps exactly its eight existing rows (`P0-PLAT-01..08`); the `legacy-um` P1 statement is a **merge origin** of this row, not an additional P0 row, so no denominator was engineered and the plan's prohibition on normalising P0 ratios to a template heuristic is not touched. **Standing:** this is a **QA priority resolution recorded by the migration**, which the plan's Task 2 explicitly asks for. It changes no product requirement and grants no approval; Product may revisit the label, and doing so would not disturb (a)–(d). | ungranted | measurement — harness **UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); contract **A** of §7.1 (§6, F-17; §10, U-24) | S8 |
| `plat:P1-PLAT-01` (directory/profile/self-service workflows) | planning-row | preserve | `test-design-qa.md` § Coverage plan P1 | Blocked by `PR-B-01`/`PR-B-04`; canonical owner `PMC-E1`. | ungranted | api/ui e2e | S8 |
| `plat:P1-PLAT-02` (four dashboards) | planning-row | preserve | `test-design-qa.md` § Coverage plan P1 | **Task 2 (checkbox 2) — the candidate ratification is confirmed, and the row stays blocked.** `PR-B-02`/`OQ-115` is **closed at design** by **PM/AD-33** (`blockers.yaml`: `status: closed`, `design_status: resolved-approved`, `decision_refs: [PM/AD-33]`), so the *design* question the blocker asked is answered. But the same entry records `implementation_status: **absent**`, and `blockers.yaml`'s governing rule is that "open blockers remain fail-closed and are not resolved by ratification". This planning row therefore stays blocked on **implementation**, not on design — the distinction the plan requires (§15.2). Canonical owners `PMC-E2`, `PMC-E3`. | ungranted | api/ui e2e | S8 |
| `plat:P1-PLAT-03` (action items, campaigns, feedback) | planning-row | preserve | `test-design-qa.md` § Coverage plan P1 | Canonical owners `ENG-E1`, `ENG-E2`, `FB-E1`/`FB-E2`. **Note for Task 2:** `ENG-E3` and `ENG-E4` are marked *(superseded)* in `engagement/epics.md`, with `RISK-E*` and `FB-E*` as the live successors — the mapping must use the live epics. | ungranted | api/ui/cross-context e2e | S8 |
| `plat:P1-PLAT-04` (risks and risk dashboard) | planning-row | preserve | `test-design-qa.md` § Coverage plan P1 | Canonical owners `RISK-E1`, `RISK-E2`. | ungranted | api/ui + unit | S8 |
| `plat:P1-PLAT-05` (resourcing, sharing, request history) | planning-row | preserve | `test-design-qa.md` § Coverage plan P1 | Canonical owners `RS-E1`, `RS-E2`, `PSH-E1`, `PSH-E2`. | ungranted | api/ui/cross-context e2e | S8 |
| `plat:P1-PLAT-06` (timeline, CDS, mentorship) | planning-row | preserve | `test-design-qa.md` § Coverage plan P1 | Canonical owners `UM-E3`, `CDS-E1`/`CDS-E2`, `M-E1`. | ungranted | api/ui/cross-context e2e | S8 |
| `plat:P1-PLAT-07` (integration graceful degradation/recovery) | planning-row | preserve | `test-design-qa.md` § Coverage plan P1 | `PR-B-08`; `TT-E1-S1.4`. | ungranted | api/integration e2e | S8 |
| `plat:P1-PLAT-08` (AD-1 trace/spec conformance) | planning-row | merge | `test-design-qa.md` § Process/trace evidence | Origins: `plat:P1-PLAT-08`, `plat:TR-8-01`, `legacy-um:TD-UM-DOC-01`. AD-1's *stage-approval* clause changed on 2026-09-04 (`docs/architecture/testing-strategy.md` § "Stage approval was removed on 2026-09-04") — the conformance obligation survives, the approval mechanism it audits does not. | ungranted | repository-audit | S8 |
| `plat:P2-PLAT-01` (responsive/accessibility validation) | planning-row | preserve | `test-design-qa.md` § Coverage plan P2 | Thresholds unspecified and **stay unspecified** (§7.1, §10 U-11). | ungranted | scanner + manual | S8 |
| `plat:P2-PLAT-02` (sorting stability, empty states, correction and concurrency edges) | planning-row | preserve | `test-design-qa.md` § Coverage plan P2 | Merges with `legacy-um:TD-UM-EXP-03` (sort stability) now that sort is specified by `PMC-E1-S1.3`. | ungranted | unit/api/ui | S8 |
| `plat:P2-PLAT-03` (repository PII/seed provenance audit) | planning-row | merge | `test-design-qa.md` § Privacy | Origins: `plat:P2-PLAT-03`, `plat:TR-7-02`, `legacy-um:TD-UM-NFR-PII-01`, `legacy-um:R-012`, `plat:PR-010`. | ungranted | ci-scan + manual | S8 |
| `plat:P2-PLAT-04` (BMAD/parallelism/intelligent-repository evidence) | planning-row | preserve | `test-design-qa.md` § Coverage plan P2 | v1.5 §8. | ungranted | manual audit | S8 |
| `plat:P3-PLAT-01` (cross-browser/viewport exploratory beyond agreed set) | planning-row | merge | `test-design-qa.md` § Coverage plan P3 | Origins: `plat:P3-PLAT-01`, `fe-epic:not-in-scope/cross-browser`. Both say the browser set is undecided and neither invents one (§10, U-10). | ungranted | manual | S8 |
| `plat:P3-PLAT-02` (terminology/drift audit: Reporting vs Project line, leaver vs dismissed, vacancy vs PeopleForce candidate) | planning-row | preserve | `test-design-qa.md` § Coverage plan P3 | Directly supports `legacy-um:C-05`. | ungranted | manual | S8 |
| `plat:P3-PLAT-03` (notifications, analytics, PeopleForce API prefill) | planning-row | preserve | `test-design-qa.md` § Coverage plan P3, `OUT OF SCOPE` | v1.5 §4.13/§4.14/§5.2 GOOD TO HAVE. Preserved as out of scope; not promoted. | ungranted | none | S8 |

### 5.8 `plat` release and design gates (`DG-01..05`, `PG-01..06`)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `plat:DG-01` (AD-1: no Stage-2 E2E before independent human approval of its Stage-1 file; no production code before independently approved red E2E) | gate | replace | `test-design-qa.md` § Release and design gates | **Task 2 restatement (D-1) — disposition unchanged (`replace`).** The per-stage *human approval* clause is **retired**; D-1 names `docs/architecture/testing-strategy.md:25–38` as the authority, and it states that AD-1 no longer requires an approval between stages, that no new ledger entries are written, and that the two existing approval ledgers are kept as history and "simply stop being a precondition for anything". What `DG-01` keeps: (a) the three-stage **ordering** — scenario document, then a **committed-red** Stage-2 test, then production written until it passes; (b) the **no-self-certification** principle of README non-negotiable 2, which survives on its own merits as a review norm even though its "stopping for that approval" mechanism does not; (c) the narrow **validation-only evidence exception** (`testing-strategy.md:55–74`) — characterization tests over already-shipped behaviour may be committed green, are never a Stage-2 gate, and the exception does not travel with a remediation; (d) the **Kernel MVP exception** (`testing-strategy.md:86–93`) deferring due/departure and dismissed-target coverage for ACM-0..ACM-5. **U-18 resolved 2026-09-11 by the document's owner (Architect).** This migration itself recorded, but did not fix, a self-contradiction: `testing-strategy.md` read against itself in **two** places — line **84** ("Each scenario still stops for its own human approval before stage 2") and lines **117–119** ("Preserve AD-1 unchanged: scenario prose, independent human approval, a separate Stage-2 dispatch committed red and independently approved, then a separate production dispatch") — both re-read verbatim at `76a7220` (§6, F-14). D-1 named lines 25–38 as the authority; the owner has now edited both contradicting locations to match that authority (`testing-strategy.md` current text at the same anchors), removing every "human approval" clause while preserving the three-stage ordering unchanged. | ungranted | manual-review | S14 |
| `plat:DG-02` (do not design through PR-B-01..09) | gate | preserve | `test-design-qa.md` § Release and design gates | Survives; its blocker list is re-derived from §5.2 after Task 2's adjudication. | ungranted | manual-review | S14 |
| `plat:DG-03` (PR-S-01/02 permit Stage-1 design/review now; E2E/implementation waits for explicit sign-off) | gate | preserve | `test-design-qa.md` § Release and design gates | PM/AD-19, AD-20. | ungranted | manual sign-off trace | S14 |
| `plat:DG-04` (PR-B-08: timetracker contract inspected; event/state semantics and identity mapping recorded before adapter Stage 1) | gate | preserve | `test-design-qa.md` § Release and design gates | Unchanged. | ungranted | contract review | S14 |
| `plat:DG-05` (child ownership: approved UM files remain unchanged; seed-import/registration/departure drift gets a targeted child follow-up) | gate | retire | — | Premised on the child/platform split that this migration dissolves, and on an "approved UM" set that becomes epic plans with `ungranted` approval. The follow-up it names is precisely what §4.3c executes. No successor gate. | n/a | none | S14 |
| `plat:PG-01` (access control **not schedulable** while the 171 Phase-1 files await per-file approval and deferred DoD slices lack approved Stage-1 artifacts) | gate | replace | `test-design-qa.md` § Release and design gates | **Task 2 re-adjudication (D-1) — disposition unchanged (`replace`); the gate stays NOT schedulable, on a new and evidenced rationale.** Stated rationale **retired in full**, with D-1 as authority: the per-file approval gate it rested on was removed on 2026-09-04 and **was its only stated support**, and its 171-file subject does not exist (§6, F-3 — the real inventory is 101 files across `access-control-foundation/` and `access-control-kernel/`). Per the plan, that retirement is recorded here rather than the old rationale being preserved. **The gate itself is not promoted**, because three *currently open* blockers independently keep access control unschedulable, none of which is an approval state: `SEC-AUTH-01` (**P0 open** — `interim-session-resolver.adapter.ts` is still wired as `SESSION_RESOLVER_PORT` and still self-provisions `position: 'HR Admin'`; `blocker-verification-2026-09-03.md` §5, and `platform-capabilities/epics.md` names it a slice-level precondition); `CC-07` (**P0 open** — no `AccessJournal` table, zero occurrences in `src/` or `prisma/`); and `AC-S9-S13` / `AC-SECTION-MATRIX-01` (**P1 open** — `access-control.facade.ts:52-54` literally early-returns `none` for every section but S1/S10/S11). Authority: `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml` and `_bmad-output/planning-artifacts/architecture/blocker-verification-2026-09-03.md`. This is a replacement of the rationale, **not** a re-derivation of the same conclusion from the same removed premise, and it is **not** an assertion that any of those blockers will close. | ungranted | repository-audit | S14 |
| `plat:PG-02` (required live timetracker leaves/projects/people evidence over the seeded population) | gate | preserve | `test-design-qa.md` § Release and design gates | v1.5 §5.1, §9. | ungranted | integration-live | S14 |
| `plat:PG-03` (PR-S-01/02 sign-off and AD-1 approvals precede PP/departure E2E; zero unresolved leak/stale-access/self-assignment/due-departure defect) | gate | preserve | `test-design-qa.md` § Release and design gates | PM/AD-19, AD-20, AD-12. | ungranted | api-e2e + sign-off trace | S14 |
| `plat:PG-04` (All Employees ≤2 seconds at 500+ records including permission resolution) | gate | preserve | `test-design-qa.md` § Release and design gates | v1.5 §7 verbatim. **Its evidence contract is §7.1's All-Employees-list contract, not ACM-9 and not P6.** **Task 2 (checkbox 3) — canonical owner identified and a live conflation hazard recorded.** The owner of this gate's evidence is `PMC-E1-S1.9` "Directory Performance Evidence at 500+ Rows" (`_bmad-output/planning-artifacts/platform-capabilities/epics.md:737`), which specifies the measurement in detail (§15.3). **Hazard:** blocker `QUALITY-GATE-AC-NFR` is recorded **closed** (2026-09-02) on an ACM-9 *facade-resolver* artifact, yet `PMC-E1-S1.9`'s own acceptance criteria route the *directory-list* evidence into that same gate. A closed resolver gate does **not** discharge this list gate; the subjects differ (§7.1, §15.3, §6 F-15). Opened as **U-25** *(this cell cited "U-19" until 2026-09-10; U-19 was already defined in §10.1 as a different question — see the numbering note there)*. Evidence contract corrected: the harness is **UNDECIDED**, not k6 (§6, F-17) — and the `evidence_contract` cell, which still read `load (k6)` and so contradicted this cell's own prose, is corrected with it. | ungranted | measurement — harness **UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); contract **A** of §7.1 | S14, `_bmad-output/planning-artifacts/platform/epics.md` Story 1.6 |
| `plat:PG-05` (every required v1.5 trace row has accepted evidence; OUT OF SCOPE used only for GOOD TO HAVE/§10) | gate | preserve | `test-design-qa.md` § Release and design gates | Unchanged. | ungranted | repository-audit | S14 |
| `plat:PG-06` (after PR-B-09: deployed demonstrable product, AD-1 history, parallel ownership, current intelligent-repository specs) | gate | preserve | `test-design-qa.md` § Release and design gates | v1.5 §8, §9. | ungranted | deployment evidence | S14 |
| `legacy-um:gate/phase-transitions` (5 rows: Test Design → Human Approval → Scenario Updates → ATDD → Implementation → Release) | gate | merge | `test-design/people-management-handoff.md` § Phase transition gates | Origins: `legacy-um:S13#phase-transition-quality-gates`, `plat:S14#phase-transition-gates`. **Task 2 restatement (D-1) — disposition unchanged (`merge`).** The **"Human Approval" phase is retired** as a gate between stages (D-1; `testing-strategy.md:25–38`), and the ATDD phase is superseded by the current ordering rule. Three thresholds survive unchanged — P0 100%, P1 ≥95%, access-control suite pass. The fourth is restated: "k6 baseline or waiver" becomes **"All-Employees-list performance baseline or recorded waiver, harness undecided"**, because k6 is not a repository decision (§6, F-17) and the measurement subject is §7.1's list contract, not ACM-9. **These thresholds are carried as thresholds only. This migration computes, asserts and publishes no coverage percentage against them** (plan global constraint; `allow_gate=false`). | ungranted | unexecuted | S11 |

---

## 6. Findings — where a source, or the plan, does not match the repository at `76a7220`

These are observations made while freezing the baseline. **None of them is resolved here.**
They are recorded so Task 2 reconciles against reality rather than against a stale
assertion, and so the orchestrator can decide whether any of them changes the plan.

| # | Finding | Evidence at `76a7220` | Consequence for the migration |
| --- | --- | --- | --- |
| **F-1** | `um-epic:S5#nfr-planning` states "NFR-2's numeric budget is not stated anywhere this design can read." | `docs/project-requirements.md:614` states: "Performance: the All Employees list with 500+ records, arbitrary filters and derived fields responds within 2 seconds, including permission resolution." | A **threshold does** exist for the All Employees list. What is genuinely absent is the *percentile definition, concurrent-user/load model and environment* — `plat:S4#unknown-and-not-guessed` says exactly that. Task 2 must record the sourced threshold and keep the missing parameters unknown, not repeat the "no budget exists" claim. |
| **F-2** | The subject of the ≤2s requirement differs across sources: `legacy-um:R-005`/`TD-UM-NFR-PERF-01` say `GET /users`; v1.5 §7 and `plat:TR-7-03`/`PG-04` say the composed All Employees list including permission resolution; `um-epic:S5` points at "the opt-in ACM9 / P6 harness" as "the real measurement". | `docs/architecture/testing-strategy.md` § ACM-9 measures the **AccessControl facade/resolver** at 500 requested active targets; `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md` measures **`resolveAudiences`** at millisecond scale across graph depths 5–499. Neither measures an HTTP list endpoint. | Three different subjects are being treated as one threshold. §7.1 separates them. **ACM-9/P6 resolver semantics must not be imported into the list requirement.** |
| **F-3** | Both platform documents, the platform handoff, the platform checkpoint and the platform supersession notice all assert "**171** v1.5 Phase-1 Stage-1 draft files" under `docs/test-cases/access-control/`. | `docs/test-cases/access-control/` **does not exist**. The access-control scenarios live at `docs/test-cases/access-control-foundation/` (10 `.md`) and `docs/test-cases/access-control-kernel/` (91 `.md`) — 101 files, different paths. `_bmad-output/specs/spec-access-control-test-cases/.memlog.md:52` records "pre-v1.5 suite withdrawn in `6086491` with zero scenario files on disk". | Every `AC STAGE-1 DRAFT` row, `plat:PR-009`, `plat:PG-01` and `plat:S3#ownership-boundary` cites a dead path and a stale count. Recorded in §5.6 per row. **Task 2 re-derives the AC inventory — and must NOT be sent to establish an "approval state".** F-12 below records that `docs/architecture/testing-strategy.md:25–38` removed per-file approval status from `docs/test-cases/**` on 2026-09-04: a scenario is present or absent, and "draft"/"pending approval"/"unapproved" are no longer meaningful states for those documents. The reconciled instruction, which supersedes any earlier wording of this row, is in the §5.6 preamble; the residual open question is §10, U-15. Task 1 assumes nothing about approval either way. |
| **F-4** | Scenario-file counts in the `legacy-um` set are stale: `legacy-um:S7` says "46 stage-1 scenario files on disk" and "45 files"; `legacy-um:S15#9` says "28 scenario files"; `plat:S4#child-ownership` says "45 existing Stage-1 files". | `docs/test-cases/user-management/**` holds **152** `.md` files across ten subdirectories including `seed/`, `departure/`, `access-control-adoption/` that did not exist in 2026-08-25. | These are `factual-claim` rows retired as current statements and pinned as history (§3.7, §3.10). No count is carried forward. |
| **F-5** *(framing softened)* | `um-epic:S5#not-in-scope` (`test-design-epic-user-management.md:65`) excludes mentorship, reasoning "No `src/` module exists". | The exclusion is **correctly sourced and not a false claim**: the same row's mitigation cell reads "Covered by `planning-artifacts/mentorship/`; its 26 requirements are out of this area", so the source explicitly knows the planning slice exists and is deliberately drawing an area boundary, not declaring the domain non-existent. Alongside that slice: `_bmad-output/planning-artifacts/mentorship/epics.md` defines `M-E1` with six stories; `docs/test-cases/mentorship/` holds 28 `.md` files; `docs/architecture/mentorship.md` is a binding rendered rule file (PM/AD-5, AD-17, AD-23). (The source's "26 requirements", `M-E1`'s six stories and the 28 scenario files count three different things and do not contradict each other.) | Mentorship is a live domain with its own canonical owner, which is why `legacy-um:TD-UM-REL-04/05/06` split to it (§4.3c) — that split stands. What Task 2 must re-classify is narrower than "the source was wrong": the *stated reason* ("no `src/` module") is a backend-implementation observation rather than a test-scope one, and under the new per-epic structure the boundary should be restated as ownership by `M-E1`. |
| **F-6** | Execution-time claims differ across sources: `legacy-um:S2#execution-strategy` budgets "~10–15 min" per PR; `um-epic:S5` measures the whole backend e2e suite at 90 s and `fe-epic:S6` the whole frontend suite at 19 s. | All three are document assertions; **none was re-executed in this task.** | The newer measured figures supersede the older budget, but both are `unverified` at `76a7220`. Task 2 carries them with dates and the `unverified` label; Task 5 may re-measure. |
| **F-7** | `_bmad-output/planning-artifacts/platform/epics.md` Story 1.6 ("Platform Test-Design Refresh v1.2 → v1.5") names deliverables `test-design-architecture-platform`, "QA, handoff, and validation" and is tracked as `1-6-platform-test-design-refresh-v1-2-v1-5: backlog` in `_bmad-output/implementation-artifacts/platform/sprint-status.yaml:55`. | Two of the four artefacts it names are retired by this migration (`-platform` suffix removed; duplicate handoff removed). `_bmad-output/planning-artifacts/platform/reviews/review-cross-slice-seams-2026-09-02.md:66` separately records that completing Story 1.6 would falsely close `PM-FR-15`. | Task 3 updates **artifact references and factual dependency references only**; the sprint status stays `backlog`, `PM-FR-15` is untouched, and the recorded substantive debt is preserved rather than the story being declared complete. |
| **F-8** *(corrected)* | `fe-epic:S6` and `um-epic:S5` repeatedly cite `deferred-work.md` for both areas, and `fe-epic:S6#handoff` (`test-design-epic-frontend.md:259`) claims two of its items are "closed by this design". | **The citations resolve.** `deferred-work.md` is a **workspace planning artifact, not a service file**, and four exist at `76a7220`: `_bmad-output/implementation-artifacts/deferred-work.md`, and one each under `implementation-artifacts/{platform,user-management,access-control}/`. The `um-epic`/`fe-epic` citations point at the `user-management` one: `:15–17` is verbatim the string quoted at `test-design-epic-frontend.md:38` ("`useAuth().userId` / `decodeJwtSub` output is unverified — no G1 component reads it"), `:23–25` is the `isJwtExpired`-evaluated-only-at-mount / 401-interceptor-only-net note behind `R-FE-06`, and `:11–13` is the 401-interceptor/`isAuthEndpoint` e2e-coverage note. `_bmad-output/specs/spec-access-control-test-cases/.memlog.md:52` independently names `deferred-work.md` as an input to the 2026-08-29 AC refresh. **Correction of record:** the original Task 1 search was scoped wrong — it looked only inside the two service submodules (§13.3) and concluded from that absence that no such file existed anywhere. That conclusion was false, and it must not be used as authority for anything. | **The citations are sound and are carried as sound.** What stays `unverified` is only the *closure* claim, and now for real reasons: that file marks closures with an explicit `resolved:` line (`:40`, `:77`) and **neither cited item carries one at `76a7220`**; a test design proposes cases and executes none; and no §4.4 obligation covers the 401-interceptor e2e note at all. See the re-adjudicated `fe-epic:claim/…` row in §4.4. **Task 2** decides whether `fe-epic:unit/session.ts` discharges the `decodeJwtSub` half. `_bmad-output/implementation-artifacts/**` is **not** modified by this migration. |
| **F-9** | The plan's target table describes `test-design-progress-system.md` as "**New** platform system run state". | The path already exists as the **approved 2026-08-25 User Management child checkpoint** (`runScope: user-management-child`, `runKey: system`, `workflowStatus: approved`). | Not a plan defect — the plan's Task 3 covers "replace current checkpoints" — but the collision is sharp: an `approved` checkpoint is overwritten by an `ungranted` one at the same path. §3.7 pins the old run at `76a7220` and forbids relabelling it as a platform run. Flagged for the orchestrator. |
| **F-10** | The same collision applies to `test-design/people-management-handoff.md`, `test-design-architecture.md`, `test-design-qa.md` and `test-design-validation-report.md`: all four are currently the 2026-08-25 approved `legacy-um` artefacts and become `ungranted` platform artefacts at the same paths. | See §2. | Every surviving citation that makes a content claim about these five filenames must become a `76a7220` commit link, or it silently re-points at the new document. This is Task 3's "update historical citations to commit links" item; §13 lists the affected consumers. |
| **F-11** | `_bmad/config.toml:14` sets `project_name = "people management"` (with a space) while `workflow.yaml:49` derives the handoff path as `{test_artifacts}/test-design/{project_name}-handoff.md`. | The existing file is `people-management-handoff.md` (hyphenated) — not derivable from that template. | The plan already requires Task 4 to pin the exact handoff path. Recorded here as the mechanical reason it is required, so the fix is not mistaken for cosmetics. |
| **F-12** | `plat:DG-01` and `legacy-um` gate rows encode AD-1 with a *per-stage human approval* step. | `docs/architecture/testing-strategy.md` § "Stage approval was removed on 2026-09-04"; `docs/architecture/README.md` non-negotiables 1–2 keep the ordering (approved scenario doc → red E2E → production code) and the no-self-certification rule. | Task 2 must restate the gate against the current rule. Copying the 2026-08-29 wording forward would reintroduce a removed gate. |
| **F-13** | `_bmad-output/test-artifacts/test-design-progress-{user-management,frontend}.md` cite `tea-trace-coverage-matrix-repo-2026-09-06.json` "as of commit `1edec31`". | AGENTS.md § Trace artifacts forbids dated copies and `test/trace-artifact-naming.test.cjs` enforces it; the dated file is gone from the working tree (consolidated in `76a7220`). | This is a **correctly anchored historical statement**, not a defect. It must **not** be rewritten to the canonical filename — doing so would change what it says about which file was read. Recorded as a "do not rewrite" consumer in §13.2. |
| **F-14** *(added 2026-09-10)* | `docs/architecture/testing-strategy.md` contradicts itself about per-stage human approval, in **two** places, not one. | Lines **25–38** are headed "Stage approval was removed on 2026-09-04" and state "**AD-1 no longer requires a human approval between stages**" and that `docs/test-cases/` scenario documents "no longer carry an approval status". Against that, **line 84** still reads "Each scenario still stops for its own human approval before stage 2", and **lines 117–119** still read "Preserve AD-1 unchanged: scenario prose, **independent human approval**, a separate Stage-2 dispatch committed red and **independently approved**, then a separate production dispatch." Both re-read verbatim at `76a7220`. | **For this ledger the conflict is settled**: ruling D-1 (2026-09-10, human user) names lines 25–38 as the authority, and no row here relies on line 84 or on lines 117–119. But a binding document contradicting itself twice is a defect **its owner must fix**, and the second location was missed when the question was first opened. **This migration does not edit `docs/architecture/**`.** Recorded as §10, **U-18** — whose scope is hereby widened from line 84 alone to both locations. Cited by `plat:PR-009` (§4.2) and `plat:DG-01` (§5.8), both of which rely on the *ordering* half of `docs/architecture/README.md` non-negotiables 1–2 while explicitly declining to use their *approval* half. |
| **F-15** *(added 2026-09-10)* | Blocker `QUALITY-GATE-AC-NFR` is closed on ACM-9 **facade-resolver** evidence, yet a canonical story routes **directory-list** evidence into the same gate name. | `…/architecture-people-management-ratification-2026-09-02/blockers.yaml` `QUALITY-GATE-AC-NFR`: `status: closed`, `closed: 2026-09-02`, `implementation_status: proven`, `artifact_refs: [ACM-9]`, closure condition *"Close only when an **ACM9-MVP-v1** FINAL artifact exists with status PASS, **500 requested active targets**, warm p95 and worst case both <= 2 seconds…"*, `closure_evidence` naming `_bmad-output/test-artifacts/performance/acm9-final-acm9-1788173458416-ff94a3e685d1.json`. Every clause of that condition is contract **B**. Against that, `PMC-E1-S1.9` (`platform-capabilities/epics.md:737`) has the acceptance criterion "**When `QUALITY-GATE-AC-NFR` is evaluated / Then the artifact is cited by path and the gate state reflects the measured result**" — for the *directory read model*, which is contract **A**. | **Two different subjects share one gate name, and one of them is already recorded closed.** A reader checking the gate finds `closed` and may conclude the All Employees list requirement has evidence. It does not: contract A has no measurement at all (§7.1, §15.3). This is a **naming collision to be resolved by the gate's owners**, not by this migration, and nothing here reopens, closes or renames the blocker. Opened as §10, **U-25**. Cited by `plat:PG-04` (§5.8). **The standing repository decision that the ACM-9 CI job stays informational is not disturbed.** |
| **F-16** *(added 2026-09-10; cited as "F-19" by an earlier draft)* | `docs/test-cases/user-management/deactivation/README.md` cites a scenario file that no longer exists. | `deactivation/README.md:16` links `../list/um-list-05-dismissed-employee-filterable.md`. At `76a7220` that filename is absent from `docs/test-cases/user-management/list/`; the scenario split into `um-list-05-dismissed-hidden-by-default.md` and `um-list-06-dismissed-findable-via-authorized-filter.md`, both present. | A dead link in a scenario-suite README. **Recorded, not repaired** — `docs/test-cases/**` is out of this migration's scope (plan Global Constraints: no scenario changes). The ledger row that inherits the obligation (`legacy-um:TD-UM-DEACT-02`, §4.3c) names **both** successors explicitly, so the migration does not depend on the dead link. Its repair belongs to the owner of `docs/test-cases/user-management/**`. |
| **F-17** *(added 2026-09-10; cited as "F-22" by an earlier draft)* | **k6 is not a repository decision.** No binding document selects it as the harness for the All Employees list requirement. | Searched at `76a7220` for `k6` across the whole repository. It appears **only** in (a) the superseded test-design set itself (`test-design-architecture.md`, `test-design-qa.md`, `test-design-qa-platform.md`, `test-design-validation-report.md`, `critical-review-existing-artifacts.md`, `test-design/people-management-handoff.md`), (b) stock BMad skill templates and knowledge files under `.agents/skills/**` and `.claude/skills/**`, and (c) one *planning* document, `docs/superpowers/plans/2026-08-25-test-design-validation-fixes.md:122`, which proposes "Implement TD-UM-NFR-PERF-01 in k6" with **`Status: Planned`**. It appears in **no** file under `docs/architecture/`, **not** in `docs/project-requirements.md`, **not** in any `docs/test-cases/**` scenario, and in **no** `package.json`. (`services/*/package-lock.json` and two binary/base64 blobs match `k6` only as a substring.) The evidence owner `PMC-E1-S1.9` specifies dataset, statistics, measured shape and failure semantics in detail and **names no harness at all**. | **The harness for contract A is UNDECIDED**, and every cell that said `load (k6)` overstated the repository's position by importing a superseded document's proposal as if it were a decision. Corrected in all four places on 2026-09-10 (§7.1 contract A, §5.8 `plat:PG-04`, §4.3c `legacy-um:TD-UM-NFR-PERF-01`, §15.3 contract A). A proposal inside a superseded artifact, and a plan step marked `Planned`, are **not** authority. Opened as §10, **U-24**. |
| **F-18** *(added 2026-09-10; cited as "F-23" by an earlier draft)* | Task 1 recorded that `docs/integrations/timetracker-external-api.json` was absent. It is present. | `git cat-file -e 76a7220:docs/integrations/timetracker-external-api.json` succeeds; the file is committed at the baseline (12,517 bytes), alongside `docs/integrations/timetracker-accounts-export.md`. The absence Task 1 relayed came from a 2026-09-03 working-tree observation recorded elsewhere, which no longer holds at `76a7220`. | **Corrects a false statement about the repository, and changes no adjudication.** `plat:PR-B-08` (§5.2) stays open under its two live successors `TT-IDENTITY-01` (P0) and `TT-PMDM-01` (P1) — they are open on **substance** (no durable id in `AccountTalentDto`; untyped `projectManager`/`deliveryManager` strings), never on the file's absence. Recorded so the ledger does not carry a claim that is untrue at its own baseline. |

**Numbering note for §6, recorded so nobody reuses a number.** F-1..F-13 were written by Task 1.
Task 2 wrote cells citing "F-14", "F-15", "F-19", "F-22" and "F-23" **without ever writing those
findings into this section** — a citation to nothing, structurally the same defect as the first
Task 2 pass's reference to a §15 that did not then exist. On 2026-09-10 the five underlying
findings were verified against their sources and written above as a **contiguous** F-14..F-18,
and every citing cell was repointed: former "F-19" → **F-16**, former "F-22" → **F-17**, former
"F-23" → **F-18**. F-14 and F-15 keep the numbers they were cited under; F-16, F-17 and F-18 are
newly assigned here, having been cited by nobody. **F-19 through F-23 are retired and must not be
reused** — F-19, F-22 and F-23 because their content now lives at F-16, F-17 and F-18, and F-20
and F-21 because no pass ever defined *or* cited them. The only remaining occurrences of those
five tokens in this file are in this note and in the parenthetical provenance labels above; there
is **no citation** left pointing at them. Every `F-nn` **citation** anywhere in this file resolves
to exactly one definition in the table above, and no number in F-1..F-18 is skipped.

---

## 7. NFR thresholds and measurement contracts

### 7.1 Threshold ledger

Each row records **subject, dataset, filters/graph shape, environment, statistic and
evidence** where they are stated, and marks them `UNKNOWN` where they are not.
**No unknown parameter is filled in by this ledger.**

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `v1.5:§7/all-employees-latency` — All Employees list, 500+ records, arbitrary filters and derived fields, **including permission resolution**, ≤ 2 seconds | nfr-threshold | preserve | `test-design-qa.md` § NFR measurement contracts — All Employees list | `docs/project-requirements.md:614`, normative. **Subject:** the composed All Employees HTTP/list route. **Dataset:** 500+ records. **Filters:** "arbitrary" plus derived/custom fields where available. **Environment:** UNKNOWN (a representative target environment must be named and recorded). **Statistic:** UNKNOWN — percentile definition is explicitly listed as not guessed. **Load model:** UNKNOWN — concurrent-user model explicitly not guessed. Merges `legacy-um:R-005`, `legacy-um:TD-UM-NFR-PERF-01`, `plat:PR-006`, `plat:TR-7-03`, `plat:P0-PLAT-08`, `plat:PG-04`, `um-epic:nfr/NFR-2`. **Task 2 (checkbox 3) — contract **A**; owner named, several UNKNOWNs closed by a canonical story, three deliberately left UNKNOWN.** The evidence owner is `PMC-E1-S1.9` "Directory Performance Evidence at 500+ Rows" (`_bmad-output/planning-artifacts/platform-capabilities/epics.md:737`), which specifies far more than the sources did and is now the defining statement for this row's parameters. **Now KNOWN, on `PMC-E1-S1.9`'s authority:** *dataset* — 500+ seeded employees "with representative relationship breadth and depth, and no real personal data"; *graph shape* — fixture breadth and depth must be **recorded with the result**, not fixed in advance; *recorded statistics* — p50, p95 **and** worst case together, plus query count, PostgreSQL version and `EXPLAIN (ANALYZE, BUFFERS)`; *measured shape* — page size, whether the total-count query is included, and whether the figure covers one page or the full entitled set must be stated explicitly, and the budget is measured "against the shape the user actually experiences on first load, so '2 seconds at 500+ rows' cannot be satisfied by measuring a small page of a large set"; *reporting rule* — the first filter/sort/column shape exceeding two seconds is named explicitly, or the run records that none did; *failure semantics* — a measured miss opens optimization as a separately gated story and the run may not claim the threshold met. **Still UNKNOWN and still not invented:** (i) **which statistic the 2-second threshold binds to** — the story requires p50/p95/worst to be *recorded* and requires exceeding shapes to be *named*, but never says which figure is the pass/fail one; (ii) the **target environment** (a PostgreSQL version is recorded, but no environment is named); (iii) the **concurrent-user / load model**. Those three are U-3's residue and stay with Product Owner (threshold statistic) and Platform/DevOps (environment, load model). **Not imported:** ACM-9's "warm p95 **and** worst case" pass rule is *not* read into (i) merely because it resembles the recording obligation — see §15.3 and the conflation hazard on `plat:PG-04` (§5.8, §10 U-25). **Harness correction of record (2026-09-10):** this row's `evidence_contract` read `load (k6)`. No binding document selects k6 for this contract — it is named only by the superseded test-design set, by stock BMad skill templates, and by one planning document marked `Status: Planned`; `PMC-E1-S1.9` names **no** harness (§6, F-17). The honest value is **UNDECIDED**, and it is now stated identically in all four places that carry it (§4.3c, §5.8, §15.3, here). The harness is opened as **U-24**. | ungranted | measurement against the composed directory route with a recorded environment — **harness UNDECIDED** (**not** k6, **not** ACM-9, **not** P6); owner `PMC-E1-S1.9`; see §6, F-17 and §10, U-24 | S1, S2, S3, S4, S5, S8, S14, `platform/epics.md` Story 1.6, `platform-capabilities/epics.md` `PMC-E1-S1.9` |
| `arch:ACM9-MVP-v1` — AccessControl facade resolver, 500 requested active targets, warm p95 **and** worst case ≤ 2 s, per-shape gates at depths 5/25/50/100/200/300/400/499 | nfr-threshold | preserve | `test-design-qa.md` § NFR measurement contracts — **separate row**, cross-referenced only | `docs/architecture/testing-strategy.md` § "ACM-9 operational measurement protocol — `ACM9-MVP-v1`", binding. **Subject:** the public facade call end to end, including transaction and result mapping — **not** an HTTP list route. **Dataset:** 500 requested active targets. **Graph shape:** balanced depth-5 plus acyclic chains at the listed depths, each an independent gate; slow classes must not be aggregated. **Environment:** recorded via `ACM9-MANIFEST-v1` hashes. **Statistic:** p50/p95 by nearest rank over 20 measured calls after 5 discarded warm-ups, plus absolute worst case. Tracked as blocker `QUALITY-GATE-AC-NFR`. | ungranted (the migration grants nothing; a `final` `PASS` artifact exists and whether it closes the blocker is recorded there as a ratification question, not decided here) | measurement (ACM9-MVP-v1); artifacts under `_bmad-output/test-artifacts/performance/` | `docs/architecture/testing-strategy.md`, `platform/epics.md` Story 1.6 `QUALITY-GATE-AC-NFR`, backend `test/measurement/acm9/` |
| `perf:P6-resolve-audiences` — `resolveAudiences` measurement, 500 synthetic users, balanced branching 4 depth 5 plus acyclic depths 25–499 | nfr-threshold | preserve | `test-design-qa.md` § NFR measurement contracts — **separate row**, cross-referenced only | `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md`, which states in its own scope section "Measurement only; **no production code or CI timing threshold changed**". **Subject:** `resolveAudiences`. **Statistic:** cold/warm p50/p95/worst in milliseconds. **P6 is a measurement record, not a gate**, and must never be treated as one. | n/a (measurement record) | measurement (P6) | backend `test/measurement/resolve-audiences.measurement-spec.ts` |
| `legacy-um:NFR-1` / `plat:privacy` — pseudonymised, delivered seeded population only; no real PII in code, agents, logs, screenshots or repository | nfr-threshold | merge | `test-design-qa.md` § NFR measurement contracts — Privacy | Origins: `legacy-um:NFR-1`, `legacy-um:R-012`, `legacy-um:TD-UM-NFR-PII-01`, `plat:PR-010`, `plat:TR-7-02`, `plat:P2-PLAT-03`. v1.5 §7; `docs/architecture/README.md` seeded-population rule. **Statistic:** none — it is a binary scan plus provenance audit. | ungranted | ci-scan + manual provenance audit | many |
| `legacy-um:NFR-3` / `plat:reliability` — external integration failure must not take down the core; last-known timetracker data is visibly stale | nfr-threshold | replace | `test-design-qa.md` § NFR measurement contracts — Reliability | The `legacy-um` statement was about *email transport after registration*, which DEC-UM-008 retires. The surviving statement is the v1.5 §5.1/§7 integration-degradation rule plus the magic-link dispatch path. **Timeout/retry/circuit thresholds: UNKNOWN** and not invented. | ungranted | api-e2e with port fake; integration-live smoke | S1, S2, S3, S4 |
| `legacy-um:NFR-4` — AccessControl composition; `403` without entitlement on every endpoint | nfr-threshold | preserve | `test-design-qa.md` § NFR measurement contracts — Security | `docs/architecture/README.md` non-negotiable 7 and PM/AD-24 denial oracle (`401` invalid/inactive session, `404` hidden/missing target, `403` visible but forbidden). Note the denial oracle is now a **three-code** contract, richer than the original `403`-only statement. | ungranted | api-e2e per route class | S1, S2, S13 |
| `plat:revocation` — owned relations next request; project changes ≤ 15 minutes; failed sync withdraws project access after 4 hours; due departure cuts off at request time | nfr-threshold | preserve | `test-design-qa.md` § NFR measurement contracts — Revocation | v1.5 §5.1/§2.1; PM/AD-10, AD-19, AD-20. Concrete numeric thresholds — preserve exactly (15 minutes, 4 hours). | ungranted | api/integration e2e with controllable clock | S3, S4, S8, S14 |
| `plat:accessibility-responsive` — list, profile, dashboard must be accessible and responsive | nfr-threshold | preserve | `test-design-qa.md` § Unknown thresholds | **WCAG conformance level: UNKNOWN. Viewport set: UNKNOWN.** Explicitly not guessed. `fe-epic:S6#nfr-planning` independently records "No stated requirement anywhere in `docs/`" and that its absence "is a planning gap, not a passing grade". Preserve both statements. | ungranted | none-yet | S3, S4, S6, S8 |
| `plat:availability-recovery` — core degrades gracefully; AD-20 converges without restoring access | nfr-threshold | preserve | `test-design-qa.md` § Unknown thresholds | **Availability %, RTO, RPO, backup frequency, restore and rollback thresholds: UNKNOWN.** Gated by `PR-B-09`. | ungranted | none-yet | S3, S4, S8 |
| `plat:deployability` — module deployed and demonstrable; AD-20 migration before worker; same timezone and database | nfr-threshold | preserve | `test-design-qa.md` § NFR measurement contracts — Deployment | v1.5 §9; PM/AD-20. Gated by `PR-B-09`. | ungranted | deployment evidence | S3, S4, S8 |
| `plat:maintainability-process` — approved scenario → approved red E2E → production code; specs match shipped behaviour | nfr-threshold | replace | `test-design-qa.md` § NFR measurement contracts — Process | Restate against the current ordering rule (§6, F-12). | ungranted | repository-audit | S3, S4, S8 |
| `legacy-um:config-owned-thresholds` — production magic-link TTL, rate limits, retry count, retry backoff | nfr-threshold | preserve | `test-design-qa.md` § NFR measurement contracts — configuration-owned note | DEC-UM-004: tests inject deterministic values and verify boundaries; **no production duration is invented**. Production values remain operational configuration and do not block scenario approval. | historical, pinned | api-e2e with injected clock | S1, S2, S13 |
| `um-epic:nfr/security` — the seeded permission-key set is a superset of the keys the code gates on | nfr-threshold | preserve | `test-design-epic-user-management-0.md` § NFR | Mitigates `um-epic:R-UM-02`. Whether the keys get seeded is an open product + Access Control decision (§10, U-9). | ungranted | unit | S5 |
| `um-epic:nfr/reliability` — departure worker is idempotent under retry and partial failure | nfr-threshold | preserve | `test-design-epic-user-management-5.md` § NFR | PM/AD-20 durable retrying fail-closed executor. | ungranted | unit state table + api-e2e | S5 |
| `um-epic:nfr/maintainability` — a domain rule is verifiable without a database | nfr-threshold | preserve | `test-design-qa.md` § Level strategy, tripwire | Tracked as a ratio tripwire, explicitly "not a mandate". Not a coverage claim. | ungranted | repository-audit | S5 |
| `fe-epic:nfr/security` — a malformed or expired token never yields an authenticated shell | nfr-threshold | preserve | `test-design-epic-user-management-2.md` § NFR (frontend) | Mitigates `fe-epic:R-FE-01`. | ungranted | unit + existing `fe-auth-*` e2e | S6 |
| `fe-epic:nfr/reliability` — every documented API failure renders its own copy, never a blank screen | nfr-threshold | preserve | QA improvement backlog § Frontend error handling | With `fe-epic:R-FE-03`. | ungranted | unit + component | S6 |
| `fe-epic:nfr/compatibility` — Chromium only today | nfr-threshold | preserve | `test-design-qa.md` § Unknown thresholds | "No new validation; the gap is named, not filled." Browser set is an open product question (§10, U-10). | ungranted | none | S6 |
| `fe-epic:nfr/performance` — no stated budget for bundle size, LCP or interaction latency | nfr-threshold | preserve | `test-design-qa.md` § Unknown thresholds | **UNKNOWN and not invented.** | ungranted | none | S6 |

### 7.2 Assessment boundary (preserved from three sources)

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:S1#assessment-boundary` + `plat:S3#assessment-boundary` + `plat:S4#unknown-and-not-guessed` | nfr-threshold | merge | `test-design-qa.md` § NFR measurement contracts, boundary note | Origins: all three. Final PASS/CONCERNS/FAIL belongs to `nfr-assess`, not to a test design and not to this migration. Plan global constraint: "This plan's acceptance is document/workflow migration acceptance, not product release readiness." | ungranted | none | S1, S3, S4, S8 |

---

## 8. Estimates

**Do not add these together.** They count different things, at different levels, over
different scopes, on different dates. The plan states this explicitly and §6 F-6 shows the
underlying timings also disagree.

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:est/~57 scenarios, ~3–5 weeks, 1 QA engineer` | estimate | retire | — (superseded; re-derive remaining work only) | Counts *proposed stage-1 scenarios* for a UM system-level design whose registration/deactivation half is retired by [v1.5-no-create]. Not re-usable as a remaining-work figure. Preserved as history at `76a7220`. | n/a | none | S2, S7, S11, S13 |
| `legacy-um:est/P0 ~8 (~1–2 wk), P1 ~31 (~1.5–2.5 wk), P2 ~13 (~3–5 d), P3 ~5 (~1–2 d)` | estimate | retire | — (superseded; re-derive remaining work only) | The per-priority breakdown of the same ~57-scenario `legacy-um` figure. Retired for the same reason as that total: it counts *proposed stage-1 scenarios* for a UM system-level design whose registration/deactivation half is retired by [v1.5-no-create] (§4.3c), so it is not re-usable as a remaining-work figure. The per-epic split also changes every denominator. Preserved as history at `76a7220`. | n/a | none | S2, S11 |
| `plat:est/~79–124 planning rows, ~12–20 QA weeks` | estimate | preserve | `test-design-qa.md` § Effort — platform planning interval | Counts *planning rows*, explicitly "not test-case counts and not evidence of coverage". Survives as a platform planning interval with that label attached. | ungranted | none | S4, S8 |
| `plat:est/P0 ~24–34 rows (~5–8 wk), P1 ~35–55 (~5–8 wk), P2 ~15–25 (~1.5–3 wk), P3 ~5–10 (~0.5–1 wk)` | estimate | preserve | `test-design-qa.md` § Effort | Same label. Conditional on `PR-S-01/02` sign-off, `PR-B-07`, `PR-B-08`, `PR-B-09` — those conditions travel with the number. | ungranted | none | S4, S8 |
| `um-epic:est/59 net-new cases (54 unit + 5 e2e), ~8–12 days` | estimate | preserve | owning UM epic plans § Effort | Counts **net-new work only**, which is the basis the plan wants. Its own caveat — "a planning range, not a commitment; no historical velocity data exists in this repository to calibrate against" — travels with it. | ungranted | none | S5 |
| `fe-epic:est/85 net-new cases (45 unit + 40 component), ~7–11 days` | estimate | preserve | owning epic plans + QA improvement backlog § Effort | Same basis and same caveat. Split across destinations per §4.4, so the single 85 figure does not survive as one number attached to one plan. | ungranted | none | S6 |
| `um-epic:est/existing 340 e2e + 5 unit + 18 contract`; `fe-epic:est/existing 124 e2e` | estimate | preserve | `test-design-qa.md` § Level strategy, marked `unverified` | Implemented-test counts, distinct from planning rows and from net-new work. **Not re-counted in this task** — carried as unverified observations dated 2026-09-06. The plan requires implemented / new / planning / shared-infrastructure / deferred to stay distinguishable; these four categories are the distinction. | ungranted | unverified | S5, S6 |
| `legacy-um:est/"Replaces/extends existing 28 files"` | estimate | retire | — | Stale count (§6, F-4). | n/a | none | S2 |

### 8.1 Task 2 re-estimate (checkbox 7) — remaining work only

**Method, stated before the numbers.** The five categories the plan names are separated
first, and only one of them is estimated. **Nothing here is a sum across categories**, and
the four figures the plan forbids adding — `legacy-um` ~57 scenarios, `plat` 79–124 planning
rows, `um-epic` 59 cases, `fe-epic` 85 cases — are never added together anywhere below.
Every count in this subsection was machine-counted or read directly from a cited line at the
time of writing; where a figure is carried from a source it is labelled with its date and
marked unverified.

**Category 1 — implemented tests. UNVERIFIED, and now demonstrably unreliable as a baseline.**
The sources report backend "340 e2e + 5 unit + 18 contract" and frontend "124 e2e", both
dated 2026-09-06. Task 2 did **not** execute any suite and does **not** report a pass rate.
Three checks show these figures cannot be used as a remaining-work baseline:

- The **same source document disagrees with itself**: `test-design-epic-user-management.md:30`
  and `:146` state **340** e2e cases; `:196` states the whole backend e2e suite is "43 files,
  **406** cases, 90s with `--runInBand`". 340 and 406 are both presented as the current e2e
  case count on the same date.
- The **file count does not reproduce**. At the pinned backend gitlink
  `f1eea3c048821011da96fba20d9b517f7d0e4f1b` — which the user's live checkout matches exactly
  and cleanly — `find test -name '*.e2e-spec.ts' | wc -l` returns **54**, not the 43 claimed.
  Task 2 did not determine which subset the "43" counted; it records only that the obvious
  reproduction disagrees.
- Frontend: `find . -name '*.test.ts*'` under the frontend service returns **0**, consistent
  with the sources' own statement that `@testing-library/react` and a second vitest config do
  not exist yet (`fe-epic:exec/...`), i.e. the frontend has **no unit or component layer at
  all** today and its "124 e2e" is a Playwright figure.

**Consequence:** implemented-test counts are carried as `unverified` observations dated
2026-09-06 and are **excluded from the estimate**. Re-counting them is opened as **U-23**.
Per the plan: unverified, not completed.

**Category 2 — net-new tests. This is the only category Task 2 estimates.** Both source
figures count net-new cases on the same basis (proposed cases, one engineer, explicitly "a
planning range, not a commitment; no historical velocity data exists in this repository to
calibrate against"). Task 2 re-partitioned them by the destinations §4.3b and §4.4 now fix,
and the partitions were counted from those sections at the time of writing:

| Partition | Cases | Counted from |
| --- | ---: | --- |
| `um-epic` net-new to epic plans — 9 clusters (11+8+4+6+3+7+5+9+1 unit) | **54** | §4.3b, all nine rows |
| `um-epic` net-new e2e | **5** | `um-epic:est/59 net-new cases (54 unit + 5 e2e)` |
| `fe-epic` net-new to epic plans (session 12, employeeFormatters 12, RequireAuth 4, identity-card-nulls 5, PersonPicker 8, AccountMenu 3, mutation-hooks 6, import-summary 3) | **53** | §4.4, after Task 2's placements |
| `fe-epic` net-new to the QA improvement backlog (http 9, datetime 6, hooks 6, StatePanel 6, MainHeader/SideMenu 5) | **32** | §4.4, after Task 2's placements |

Reconciliation: 54 + 5 = **59**, exactly the `um-epic` total; 53 + 32 = **85**, exactly the
`fe-epic` total. No case was dropped to reduce file count, and none was invented.
**Requirement-coverage figure: 112 cases** (59 UM + 53 FE) land in epic plans and may count
as coverage. **32 cases** land in the QA improvement backlog and, per the plan, **do not count
as requirement coverage** — each carries an owner and a trigger in §4.4.

**Effort for category 2 only.** `um-epic` gives ~8–12 days for its 59; `fe-epic` gives ~7–11
days for its 85. These two are the **same basis** (net-new cases, one engineer, uncalibrated),
so combining them is legitimate where combining them with the other two figures is not:

> ### The only form in which this figure may be quoted
>
> **≈ 15–23 engineer-days of category-2 net-new test authoring (unverified, uncalibrated,
> category 2 only — not a schedule, not a commitment, and never to be added to any other
> estimate in this ledger).**
>
> **Quote the whole sentence or none of it.** The number alone is meaningless and actively
> misleading. It is the **sum of two source ranges** (8–12 + 7–11), which is the nearest this
> ledger comes to the addition the plan's Task 2 forbids; it is permitted **only** because both
> ranges count net-new cases on one engineer on the same uncalibrated basis, and for no other
> pair of figures in this document. It is the sources' own range re-partitioned, **not** a
> re-derived duration, and no velocity data exists in this repository to check it against.
>
> **It must never be added to** the `plat` 79–124 planning rows / ~12–20 QA weeks (category 3),
> the ~57 legacy scenarios, the unverified implemented-test counts (category 1), the UNKNOWN
> shared-infrastructure work (category 4, which includes the **All-Employees-list harness that
> does not exist and has not been chosen** — §10, U-24), or the 31 deferred `it.todo` cases
> (category 5). None of those shares its basis.
>
> **Task 3 must carry this caveat with the number.** A downstream artifact that states
> "15–23 engineer-days" without it is misstating this ledger.

**Category 3 — planning rows. Not test cases, not estimated here.** `plat`'s 79–124 rows /
~12–20 QA weeks is preserved in the table above **with its label and its conditions attached**
(`PR-S-01`, `PR-S-02`, `PR-B-07`, `PR-B-08`, `PR-B-09`). Task 2's §5.2 adjudication removes
none of those conditions: six blockers closed **at design only**, and the three that gate this
interval — `PR-B-07`, `PR-B-08`, `PR-B-09` — are all **still open**, two of them P0. The
interval is therefore unchanged by this migration.

**Category 4 — shared infrastructure. UNKNOWN, deliberately not estimated.** Three items, none
of which is inside the category-2 15–23 engineer-days: (a) `@testing-library/react` plus a second vitest config —
a prerequisite for **every one of the 85 frontend cases**, and its file-location convention is
an open decision (U-12), so it is not scheduled here; (b) an **All-Employees-list load
harness** — it does not exist **and none has been chosen** (§6, F-17; §10, U-24), and ACM-9 and
P6 measure different subjects (§7.1), so no existing harness discharges contract **A**; (c) **schema-per-worker** — explicitly **not** to
be built (§5.1 note 3), so it carries **no** estimate rather than a zero.

**Category 5 — deferred candidates. Not remaining work of this migration.** **31** `it.todo`
cases, statically counted at backend `f1eea3c` (`grep -rn 'it\.todo' test src | wc -l` = 31,
all under `services/backend/test/`, none under `src/`), each blocked on its own stated unblock
trigger. Five of them are the `UM-CT-03/04/05/06/09` career-timeline cases (§15.6). They are
tracked, blocked, and outside this estimate.

**What this re-estimate is not.** It is not a schedule, not a commitment, and not a coverage
claim. It estimates authoring effort for identified net-new cases only. It asserts nothing
about whether any existing test passes.

---

## 9. Cross-epic regression triggers

| source_anchor_or_id | kind | disposition | target_path_and_anchor | authority_and_reason | approval_status | evidence_contract | consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy-um:reg/access-control → every endpoint` ("full access-control E2E must pass on every PR") | regression-trigger | merge | `test-design-qa.md` § Cross-epic regression map | Origins: `legacy-um:S2#interworking-regression` row 1, `plat:S4#interworking-regression` row 1. `docs/architecture/README.md` non-negotiable 7. | ungranted | api-e2e | S2, S4 |
| `legacy-um:reg/Epic 1 → Epic 3` (PATCH fires events; re-run `CT-02` when profile changes) | regression-trigger | preserve | `test-design-qa.md` § Cross-epic regression map | PM/AD-11. Trigger: a profile-mutation route changes. | ungranted | api-e2e | S2 |
| `legacy-um:reg/Epic 3 → Epic 4` (Relationship fires events; re-run `REL-04/05` when the event writer changes) | regression-trigger | replace | `test-design-qa.md` § Cross-epic regression map | Trigger survives; its targets `REL-04/05` moved to mentorship (§4.3c), so the arrow is now `UM-E3` → `M-E1`. | ungranted | api-e2e | S2 |
| `legacy-um:reg/Epic 2 → all suites` (session tokens; auth smoke on every PR) | regression-trigger | preserve | `test-design-qa.md` § Cross-epic regression map | Trigger: any change to the auth/session path. | ungranted | api-e2e | S2 |
| `plat:reg/User Management → Access Control` (org change reflected next request) | regression-trigger | preserve | `test-design-qa.md` § Cross-epic regression map | PM/AD-19 next-request revocation. | ungranted | api-e2e | S4 |
| `plat:reg/Timetracker → policies/profile/dashboards` (identity, stale project access; 15-minute / 4-hour checks) | regression-trigger | preserve | same | v1.5 §5.1; `PR-B-08`. | ungranted | integration e2e with controllable clock | S4 |
| `plat:reg/Directory → profile/custom fields/export/campaigns` (hidden-value inference; audience drift) | regression-trigger | preserve | same | v1.5 §3.3; `PR-B-01`. | ungranted | api/ui e2e | S4 |
| `plat:reg/Resourcing → shared links → S15 → timetracker` (candidate data leak; false assignment) | regression-trigger | preserve | same | v1.5 §4.7/§4.8. | ungranted | cross-context e2e | S4 |
| `plat:reg/Campaigns → action items → feedback` (duplicate tasks; widened sender view) | regression-trigger | preserve | same | v1.5 §4.12. | ungranted | cross-context e2e | S4 |
| `plat:reg/Mentorship, lifecycle → timeline` (missing/incorrect events; closure notes) | regression-trigger | preserve | same | PM/AD-17, AD-20. | ungranted | cross-context e2e | S4 |
| `plat:reg/Departure → auth/AC/tasks/mentorship` (partial offboarding) | regression-trigger | preserve | same | PM/AD-20. | ungranted | api/worker e2e | S4 |
| `plat:reg/CDS → Department/directory` (wrong matrix link or filter result) | regression-trigger | preserve | same | v1.5 §4.10. | ungranted | cross-context e2e | S4 |
| `plat:reg/AccessControl facade → every consumer` (bypassed or inconsistent authorization) | regression-trigger | preserve | same | Non-negotiable 7. | ungranted | api-e2e | S4 |
| `um-epic:reg/TTL, time controls, outbound fakes, durable-state observability` (implicit in the departure/dueAt/worker clusters) | regression-trigger | preserve | `test-design-qa.md` § Cross-epic regression map — controllable time and outbound fakes | Plan Task 2 names these explicitly for preservation. Controllable clock/timezone seams serve the 15-minute, 4-hour, magic-link expiry and departure-cutoff boundaries; outbound fakes serve dispatch and sync observation; durable-state observability serves the departure worker and (post-DEC-UM-008) the magic-link dispatch path only. | ungranted | api-e2e with injected clock and fakes | S3, S4, S5 |

---

## 10. Unresolved decisions register

**Every item here stays explicit and draft. This ledger does not invent any answer.**
Tasks 2–5 may record who owns a decision and what would resolve it; only the named owner
can resolve it.

### 10.1 Task 2 outcome, per decision — nothing closed quietly

Task 1 opened **16** decisions, U-1..U-16. Task 2's outcome for each is below; the Task 1
wording of every row survives unedited in the table that follows this one, so a reader can
always see what was asked before it was answered. **Counted 2026-09-10: 5 resolved with named
authority, 1 partially resolved, 10 still open, 9 newly opened (U-17..U-25).** *(Read "7 newly
opened" until 2026-09-10. That figure was wrong: two questions — the undecided All-Employees-list
harness and the `QUALITY-GATE-AC-NFR` conflation hazard — were "opened" in row prose under numbers
that already meant something else, so they existed in no register and were never counted. They are
now **U-24** and **U-25**; see the numbering note below.)*

A "resolved" row means a *named binding authority* answers the question — not that Task 2
decided it. Where the question belongs to a product owner, it stays open no matter how
obvious the answer looks.

| # | Task 2 outcome | Authority, or why it stays open | Recorded at |
| --- | --- | --- | --- |
| **U-1** | **Resolved with authority**, and replaced by the narrower **U-17** | `architecture-people-management-ratification-2026-09-02/blockers.yaml` (31 entries) plus the 2026-09-03 re-verification ("17 open · 0 closeable"). Six of nine `PR-B-*` are **closed at design**; **none** is closed at implementation. The question "are these blockers still open?" now has an answer; the implementation work it uncovered does not. | §5.2 |
| **U-2** | **Resolved 2026-09-11** | Sign-off closes only on explicit recorded Product Owner + Architect approval per package; PM/AD-19/AD-20 are direction, not sign-off. Both remain **ungranted** until recorded. | §5.2, §15.2; `test-design-qa.md` § Open questions |
| **U-3** | **Partially resolved** | `PMC-E1-S1.9` (`platform-capabilities/epics.md:737`) now fixes dataset, fixture-recording, the statistics to record, the measured shape, the exceeding-shape reporting rule and the failure semantics. **Three parameters stay UNKNOWN:** which statistic the 2-second threshold binds to; the target environment; the concurrent-user/load model. Owners: Product Owner (statistic), Platform/DevOps (environment, load model). | §7.1, §15.3 |
| **U-4** | **Still open** | WCAG conformance level and viewport set. No document states either; Product Owner owns it. Not guessed. | §7.1 |
| **U-5** | **Still open** | Uptime SLO, RTO, RPO, backup/retention, timeout/retry/backoff, circuit thresholds. Gated by `PR-B-09`, which §5.2 confirms is **still open** as `OPERATIONAL-ENVELOPE` **P0**. | §7.1, §5.2 |
| **U-6** | **Still open** | `DEC-UM-012` remains an explicit **draft decision** and does not inherit the DEC-UM-001..011 approval. Product must confirm. | §5.4 |
| **U-7** | **Resolved with authority** — **P0** | `docs/project-requirements.md:614` (normative), `plat:PG-04` (release gate), `legacy-um:S2#exit-criteria` (P0 100% / P1 ≥95%), `PMC-E1-S1.9` closing criterion. Both risk scores stay **6**; no P0 percentage was normalised. | §5.7, §15.4 |
| **U-8** | **Resolved with authority** — the **score is authoritative, the heading is the defect** | `test-design-epic-user-management.md:73/:81` — 6 satisfies the document's own "Score ≥6" band and falls outside its "Score 3–4" band. Neighbours `R-UM-05` (4) and `R-UM-06` (3) are correctly placed, so exactly one row is misfiled. Score unchanged; source document unedited. | §4.3a |
| **U-9** | **Still open** | Whether `org:relationships:write`, `profile:timeline:write` and `employee:departure:record` get seeded. The source states it is a **product + Access Control decision, not a test decision**. The test obligation is preserved and its expected outcome stays open, including the source's note that the test is red on purpose until it lands. `blockers.yaml` `OQ-PERM-01` (**P1, open**) is the assignment half of the same area. | §4.3a, §5.2 |
| **U-10** | **Still open** | Browser support beyond Chromium. Product Owner. Two independent sources both decline to invent a set. | §4.4, §5.7 |
| **U-11** | **Still open** | Frontend performance budgets, frontend accessibility requirements, photo-upload size limits. Not invented; `TD-UM-EXP-02` stays retired precisely because its "if limits specified" trigger is unmet. | §7.1 |
| **U-12** | **Still open** | Backend/frontend test-file location conventions, the second vitest config, `@testing-library/react`. DEV owns it. Task 2 records in §8.1 that this is a **prerequisite for all 85 frontend net-new cases**, which raises its urgency without resolving it. | §5.1, §8.1 |
| **U-13** | **Still open** | Proactive logout on a timer / `visibilitychange`. The source says it is a product decision; only the predicate-testing half is a test obligation, and that half is placed. | §4.4 |
| **U-14** | **Resolved with authority** | Every directory/list boundary case now has one owner: pagination arithmetic → `UM-E1-S1.5` (its AC own "a page of results plus pagination metadata (FR-15)"); filter pruning **split** `UM-E1-S1.5` / `UM-E7` (identity-field whitelist vs `PM-FR-5` anti-inference incl. result-count differencing); `PersonPicker` → `PMC-E1-S1.3` (`user-management/epics.md:610` puts typeahead search **outside** UM); nav chrome → QA backlog (`PMC-E1-S1.2` owns directory-table presentation, not the app shell); sort stability **split** per `TD-UM-EXP-03`. | §4.3b, §4.4, §15.6 |
| **U-15** | **Resolved with authority** | Ruling **D-1** (2026-09-10, human user) and `docs/architecture/testing-strategy.md:25–38`. Inventory re-derived to **101** files (10 + 91), machine-counted; no approval state sought, found or invented; `PR-009` and `PG-01` restated on current evidence; `PG-01` **not** promoted to schedulable. | §5.6, §5.8, §15.0 |
| **U-16** | **Still open** | Whether `platform/epics.md` Story 1.6 is satisfied, partially satisfied, or made obsolete. Platform epic owner. Task 2 changed no story status, sprint-status key or coverage field; Task 3 updates artifact references only. | §6 F-7 |

**Newly opened by Task 2 — U-17..U-25.** Each is a question the reconciliation *exposed*; none
is a question Task 2 answered and then re-labelled.

**Numbering note, corrected 2026-09-10 — recorded so nobody reuses a number.** The interrupted
earlier pass cited **U-19**, **U-20** and **U-21** in §4.3c and §5.6 without ever defining them.
Those three citations were honoured with the definitions below, derived from the blocks that
cite them, and **U-17** and **U-18** were assigned to two further new questions.

An earlier version of this note then claimed the result was that "no number means two things".
**That claim was false, and it is withdrawn.** `U-19` and `U-20` each had a definition here
*and* a conflicting "opened as …" use in row prose, so each number meant two different things:

| Number | Definition in this section | Conflicting use in row prose | Fix applied |
| --- | --- | --- | --- |
| `U-19` | which of the 101 AC scenario files covers which of the 119 `plat:TR-*` rows | `plat:PG-04` (§5.8) — the `QUALITY-GATE-AC-NFR` facade-vs-directory conflation hazard | the conflation hazard is now **U-25**; the definition below is unchanged |
| `U-20` | what recorded condition makes access control schedulable | `legacy-um:TD-UM-NFR-PERF-01` (§4.3c) — the undecided All-Employees-list load harness | the harness question is now **U-24**; the definition below is unchanged |

Both conflicting cells were written by Task 2. The consequence, now repaired, was that **two
genuine open questions existed only in row prose and in no register** — so the count "7 newly
opened" undercounted them. They are defined below as **U-24** and **U-25**, the citing cells are
repointed, and the correct count is **9 newly opened (U-17..U-25)**.

**Verified mechanically after the repair:** every `U-nn` token appearing anywhere in this file
has exactly one definition in this section, no number in U-1..U-25 is skipped, and no number
is used for two different questions.

| # | Newly opened question | Owner | Why it is open, and where it came from |
| --- | --- | --- | --- |
| **U-17** | For the six `PR-B-*` blockers now **closed at design**, what closes them at **implementation** — and what closes the five register entries that remain open (`OQ-PERM-01` P1, `CC-07` P0, `TT-IDENTITY-01` P0, `TT-PMDM-01` P1, `OPERATIONAL-ENVELOPE` P0)? | Architect + the per-entry owners in `blockers.yaml` | The residue of U-1. `blockers.yaml` states the governing rule itself — *"open blockers remain fail-closed and are not resolved by ratification"* — and carries `implementation_status` values of `transition-debt`, `absent` and `partial` on the closed rows. Closing design discovery closed no implementation work, and this ledger must not let the design closure read as one. (§5.2) |
| **U-18** *(resolved 2026-09-11)* | **Resolved** — the document's owner (Architect) edited both contradicting locations (`testing-strategy.md:84` and `:117–119`) to match the authority named by ruling D-1 (lines 25–38): both now state that no human approval gates a stage transition, while the three-stage ordering is unchanged | Owner of `docs/architecture/testing-strategy.md` (Architect) | Found by Task 2's checkbox-5 recheck while re-reading the binding policy; widened from one location to two at §6, F-14. Ruling D-1 had already settled *which* reading governs this ledger; this closes the residual defect — the source document contradicting itself — that D-1 explicitly left for the owner to fix. (§15.0, §15.5) |
| **U-19** *(resolved 2026-09-11)* | **Resolved** — of the **119** `plat:TR-*` rows, **14** receive any evidence (none full) from the **101** scenario files, matched via each file's own `**Trace:**` §-citation against v1.5, never guessed from filenames; **105** rows have zero evidence, per each suite's own stated scope exclusions. Full mapping table, method, and the `ACF-AU-01` (Self) orphan finding recorded in `test-design-qa.md` § "U-19 normative coverage — scenario file mapping"; every matched scenario file also carries an inline pointer. **Does not affect `PG-01`** — that stays governed by U-20 alone. | Access Control owners + QA | Exposed by §5.6's re-derivation. The old pointer ("171 files under `docs/test-cases/access-control/`") was dead, and re-deriving the inventory does **not** re-establish the row-to-file mapping the dead pointer used to imply. (§5.6) |
| **U-20** | **Resolved 2026-09-11** — `PG-01` becomes schedulable when `SEC-AUTH-01`, `CC-07`, `AC-S9-S13` and `AC-SECTION-MATRIX-01` are all closed at implementation; evaluated by Platform epic owner + Architect against the blocker register and a current re-verification record | Platform epic owner + Architect | Recorded in `test-design-qa.md` § Release and design gates (`PG-01`). Until all four are closed, `PG-01` stays **not schedulable**. |
| **U-21** | Should the **20** history-only retired scenario files (`registration/` 16, `deactivation/` 4) remain on disk, given their READMEs forbid translating, citing or approving them? | Owner of `docs/test-cases/user-management/**` | Exposed by §4.3c. It is a scenario-suite curation question, not a test-design migration question, and this migration modifies none of those files. (§4.3c) |
| **U-22** | What covers the "`useAuth().userId` / `decodeJwtSub` output is unverified — no G1 component reads it" gap, given that `fe-epic:unit/session.ts` covers the decoder but not a component's consumption of it? | DEV + QA | Exposed by §4.4's re-adjudication of the `fe-epic` closure claim. Task 2 established that the existing obligation does **not** discharge the deferred item, and deliberately did **not** invent a new component case to fill the hole. (§4.4) |
| **U-23** *(resolved 2026-09-11)* | **Resolved** — inventory re-counted via jest/playwright configs at gitlinks `3bc801a…` / `fa3d319…` | QA | Backend e2e **506** cases in **54** suites (**488** executable + **18** `it.todo`); unit **50**; contract **18** pact interactions; frontend Playwright **124**. Supersedes contradictory 340 / 406 / "43 files". See `test-design-qa.md` § Implemented-test inventory. |
| **U-24** *(number assigned 2026-09-10; **resolved 2026-09-11**)* | **Resolved** — contract **A** harness is **`DIRA1-MVP-v1`** (`docs/architecture/testing-strategy.md` § DIR-A1; `npm run measure:user-management:dira1` in `services/backend`) | Platform / DevOps + QA | U-3 statistic/environment/load model also resolved by the same protocol. PASS final artifact `performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json` (local env). |
| **U-25** *(number assigned 2026-09-10; **resolved 2026-09-11**)* | **Resolved** — `QUALITY-GATE-AC-NFR` governs contract **B** (ACM-9 facade) only; contract **A** / the All Employees list uses release gate **`PG-04`**. `PMC-E1-S1.9` cites `PG-04` for directory-list evidence | Access Control + Quality Engineering + the platform-capabilities epic owner | Recorded in `test-design-qa.md` § NFR measurement contracts, `platform-capabilities/epics.md` Story 1.9, and the handoff. `QUALITY-GATE-AC-NFR` is not reopened or renamed. |

| # | Unresolved question | Owner named by the sources | Where it is recorded | What Task 1 did **not** do |
| --- | --- | --- | --- | --- |
| **U-1** | The nine `PR-B-01..09` product/architecture blockers. Two have candidate ratifications landed after the source date (`PR-B-01` ← `docs/architecture/custom-fields.md`/PM-AD-32; `PR-B-02` ← `docs/architecture/dashboards.md`/PM-AD-33, AD-18) and three have candidate canonical epics (`PR-B-03` ← `PLAT-E5`/`PLAT-E8`; `PR-B-04` ← `PMC-E1`/`UM-E6`; `PR-B-05` ← `RA-E1`). | Architect / Product Owner / Security / Integration / DevOps, per blocker | §5.2 | Did **not** close any blocker. All nine remain **Open**; Task 2 adjudicates each against the ratification, and a closing must cite the ratification, not this ledger. |
| **U-2** *(resolved 2026-09-11)* | **Resolved** — explicit recorded Product Owner + Architect sign-off per package; PM/AD-19/AD-20 are direction only | Product Owner + Architect | §5.2 | Recorded 2026-09-11 in the PM memlog; `PR-S-01`/`CC-04` and `PR-S-02`/`CC-06` implementation and evidence blockers remain open. See `test-design-architecture.md` § Formally signed-off packages with implementation blockers. |
| **U-3** | Percentile definition, concurrent-user/load model and target environment for the All Employees ≤2-second requirement. | Product Owner (threshold), Platform/DevOps (environment) | §7.1 | Did not import ACM-9's `p95 + worst case` semantics or P6's per-shape semantics into the list requirement. |
| **U-4** | WCAG conformance level and viewport set for the accessibility/responsive requirement. | Product Owner | §7.1 | Did not invent a level or a viewport list. |
| **U-5** | Uptime SLO, RTO, RPO, backup frequency, retention period, timeout/retry/backoff counts, circuit thresholds, non-departure observability thresholds. | DevOps + Architect + Security (`PR-B-09`) | §7.1 | Did not invent any of them. |
| **U-6** | `DEC-UM-012` — whether a deactivated user's `workEmail` is treated identically to an unknown email for `POST /auth/magic-link`. | Product (explicit confirmation required) | §5.4, `legacy-um:TD-UM-AUTH-06`, `legacy-um:R-009` | Did not confirm it and did not let it inherit the DEC-UM-001..011 approval. It stays `draft-decision`. |
| **U-7** | Priority conflict: the All Employees latency obligation is **P1** in `legacy-um:S2#nfr-test-coverage-plan` and **P0** in `plat:P0-PLAT-08` / `plat:S4#nfr-test-coverage-plan`. | QA + Product | §5.7, §7.1 | Did not pick one. The plan's Task 2 requires a **recorded rationale** for the resolution and forbids normalising P0 percentages to satisfy a template heuristic. |
| **U-8** | `um-epic:R-UM-04` scores 6 but sits under a "Medium-Priority Risks (Score 3–4)" heading, while the same document treats ≥6 as high. | QA | §4.3a | Did not change the score and did not change the heading. Recorded the inconsistency for Task 2; **the score is authoritative**. |
| **U-9** | Whether `org:relationships:write`, `profile:timeline:write` and `employee:departure:record` get seeded into the permission catalog, or the gap is an accepted recorded decision. | Product + Access Control (`um-epic:R-UM-02` says so explicitly) | §4.3a, §7.1 | Did not decide. The test obligation ("assert the seeded key set against the gated key set") is preserved; its expected outcome stays open, and the source's note that the test "will be red on purpose" until it lands is preserved. |
| **U-10** | Browser support beyond Chromium. | Product Owner | §4.4, §5.7 (`P3-PLAT-01`), §7.1 | Did not select a browser set. |
| **U-11** | Frontend performance budgets (bundle size, LCP, interaction latency), frontend accessibility requirements, and photo-upload size limits. | Product Owner | §7.1, `legacy-um:TD-UM-EXP-02` | Did not invent budgets. `TD-UM-EXP-02` is retired as an obligation precisely because its trigger condition ("if limits specified") is unmet. |
| **U-12** *(resolved 2026-09-11)* | **Resolved by DEV** — backend keeps its existing co-located `*.spec.ts` under `src/`; frontend adopts co-located `*.test.ts` / `*.test.tsx` next to the file under test (no `test/` tree); a second config, `vitest.config.ts`; `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` | DEV | `um-epic:S5#entry-criteria`, `fe-epic:S6#entry-criteria`, §5.1 | Implemented in `services/frontend` on branch `feat/u-12-unit-component-testing` (`60bc882`), proven by two passing specs; **not yet merged to `main`**, so the `um-epic:S5#entry-criteria` / `fe-epic:S6#entry-criteria` checkboxes stay unticked until it is. See `test-design-qa.md` § Frontend. |
| **U-13** | Whether the app should proactively log out on a timer / `visibilitychange`, rather than relying on the 401 interceptor (`fe-epic:R-FE-06`). | Product (the source says so) | §4.4 | Did not decide. Only the predicate-testing half is a test obligation. |
| **U-14** | Which epic owns the directory/list boundary cases that both `UM-E1-S1.5` and `PMC-E1` plausibly own (pagination arithmetic, filter pruning/whitelist, `PersonPicker`, sort stability, nav chrome). | QA + the two domain owners | §4.3b, §4.3c, §4.4 | Proposed placements marked `→ Task 2`; did not fix them. |
| **U-15** *(restated)* | **Not** "what is the approval state of the access-control scenario suites" — that question no longer has an answer, because `docs/architecture/testing-strategy.md:25–38` removed per-file approval status from `docs/test-cases/**` on 2026-09-04 (§6 F-12). The live question is narrower: **on what current basis are `plat:PR-009` and `plat:PG-01` restated**, now that the per-file gate both rest on is gone, and what is the real inventory at `docs/test-cases/access-control-foundation/` and `access-control-kernel/` that the 23 `AC STAGE-1 DRAFT` rows should point at. | Access Control owners + Engineering leads | §5.6 preamble (reconciled instruction), §5.6 per-row, §5.8 `plat:PG-01`, §6 F-3 and F-12 | Did **not** assume the suites are approved and did **not** assume they are drafts — neither word is a meaningful state for them today. Did not restate `PR-009` or `PG-01`. **`PG-01` is not marked schedulable**: the disappearance of its stated rationale is not evidence that its condition is met. |
| **U-16** | Whether `_bmad-output/planning-artifacts/platform/epics.md` Story 1.6 is satisfied, partially satisfied, or made obsolete by this migration, given the separately recorded `PM-FR-15` false-closure hazard. | Platform epic owner | §6 F-7 | Did not change the story's status, its sprint-status key, or any coverage field. Task 3 updates artifact references only. |

---

## 11. Approval, validation and progress statements — pinning record

Plan Task 1: *"Pin superseded validation, progress, review, and approval statements to the
baseline commit where that exact content exists. Do not copy them into a dated
current-evidence directory."*

Every statement below exists verbatim at `76a7220701ac6f16843dad8b303934f9a958b54c`. **None
of them is copied into a dated directory, and none transfers to any document this migration
produces.** Link form:
`https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/<path>`.

| Statement | Pinned path (at `76a7220`) | Type | Transfers? |
| --- | --- | --- | --- |
| "Approved — 2026-08-25 (human approval; normative propagation complete)" | `_bmad-output/test-artifacts/test-design-architecture.md` header | approval | **No** |
| "Approved — 2026-08-25" | `_bmad-output/test-artifacts/test-design-qa.md` header | approval | **No** |
| "Approval required before: modifying `docs/test-cases/user-management/**`, writing stage-2 E2E, or changing production code" | `_bmad-output/test-artifacts/test-design-qa.md` footer | gating claim | **No** — superseded by the 2026-09-04 stage-approval removal |
| "Human approval granted for system-level test design and critical review. Authorized: normative propagation + stage-1 scenario updates." | `_bmad-output/test-artifacts/test-design-progress-system.md` § Approval — 2026-08-25 | approval | **No** |
| `workflowStatus: 'approved'` with `runScope: 'user-management-child'`, `runKey: 'system'` | `_bmad-output/test-artifacts/test-design-progress-system.md` frontmatter | run state | **No** — the new `runKey: system` run starts ungranted and must not be presented as this run |
| Validation checklist with 12 of 14 boxes ticked | `_bmad-output/test-artifacts/test-design-progress-system.md` § Validation Checklist Status | validation | **No** — all boxes reset |
| "Propagation Complete" 7-row table | `_bmad-output/test-artifacts/test-design-progress-system.md` | propagation record | Referenced as history; the two file-count cells are stale (§6 F-4) |
| "Overall Verdict: **PASS — Approved for ATDD (with per-file review gate)**" | `_bmad-output/test-artifacts/test-design-validation-report.md` | validation verdict | **No** |
| "Strict overall: FAIL — documentation ready; human and runtime gates open" | `_bmad-output/test-artifacts/test-design-validation-report.md` § Completion Criteria (Strict) | validation verdict | **No** |
| Full 10-section checklist evaluation (~110 criteria rows) | `_bmad-output/test-artifacts/test-design-validation-report.md` | validation | **No** |
| "Post-Approval Update (2026-08-25): Human approval received. Normative propagation and stage-1 scenario updates are complete." | `_bmad-output/test-artifacts/test-design-validation-report.md` | approval | **No** |
| `status: 'approved'` and "**Status:** Approved 2026-08-25. Stage-1 scenarios updated; ATDD is the next workflow." | `_bmad-output/test-artifacts/test-design/people-management-handoff.md` frontmatter + footer | approval | **No** |
| Workflow sequence steps 1–3 marked "**complete (2026-08-25)**" | `_bmad-output/test-artifacts/test-design/people-management-handoff.md` | progress claim | **No** |
| "**Status:** Approved 2026-08-25 — decisions propagated to normative sources; stage-1 scenarios updated." | `_bmad-output/test-artifacts/critical-review-existing-artifacts.md` header | approval | **No** (document itself stays in place as history) |
| "**Current validation status:** `NOT RUN`" + supersession of the 2026-08-25 v1.2 platform validation | `_bmad-output/test-artifacts/test-design-validation-report-platform.md` | validation state | The *statement of the invariant* survives; the document does not |
| `workflowStatus: 'completed'` / "This checkpoint records planning completion only: it grants no scenario approval, executable coverage, implementation approval, validation verdict, NFR verdict, or release approval." | `_bmad-output/test-artifacts/test-design-progress-platform.md` | run state | The **boundary sentence** is preserved as a rule; the run state does not transfer |
| `workflowStatus: 'complete'` (epic runs, 2026-09-06) | `test-design-progress-user-management.md`, `test-design-progress-frontend.md` frontmatter | run state | **No** — "generation complete" is not "validated" and not "approved" |
| "Inputs read: `tea-trace-coverage-matrix-repo-2026-09-06.json` as of commit `1edec31`" | both epic progress files | historical citation | Preserved **verbatim**; must not be rewritten to the canonical filename (§6 F-13) |

---

## 12. Canonical epic identities (reuse only — nothing is renumbered)

Read from the twelve `_bmad-output/planning-artifacts/*/epics.md` files at `76a7220`.
`docs/superpowers/plans/2026-09-09-epic-number-collision-verification.md` records the last
identity migration (7 stories + 2 epics renumbered: `PLAT-E4-S4.1..4.4` → `PLAT-E8-S8.1..8.4`,
`UM-E6-S6.1..6.3` → `UM-E8-S8.1..8.3`, platform Epic 4 → Epic 8, UM Epic 6 → Epic 8) and
verifies the guard `node scripts/epic-id-guard.cjs --root .` reporting *"OK — 37 epic and 134
story definitions across 13 files, 140 tracking keys across 5 files"*. **This migration
renumbers nothing and touches no ClickUp mapping.**

| Domain (`planning-artifacts/<domain>/epics.md`) | Canonical epic IDs | Notes for epic-plan naming |
| --- | --- | --- |
| `user-management` | `UM-E0` Access Control Adoption · `UM-E1` Employee Record Management · `UM-E2` Magic-Link Authentication · `UM-E3` Career Timeline · `UM-E4` Organizational Relationships · `UM-E5` Employment Lifecycle · `UM-E6` Current-State Read Endpoints · `UM-E7` Visibility-Safe Filtering and Columns · `UM-E8` Custom Fields as Data | `test-design-epic-user-management-{0..8}.md` |
| `platform` | `PLAT-E1`..`PLAT-E8` (E1 Spec v1.5 Alignment · E2 AC Foundation · E3 AC Kernel MVP · E4 AC Authorization Consolidation · E5 Department Walk and PP HR-Line · E6 Section Matrix Beyond the Kernel Slice · E7 Shared-Link Section Policy and Full-Profile Overlay · E8 Project-Line Audience) | `test-design-epic-platform-{1..8}.md` |
| `platform-capabilities` | `PMC-E1` Permission-Safe People Directory · `PMC-E2` People-Grouped Dashboards · `PMC-E3` Project-Grouped Dashboards · `PMC-E4` Inline Directory Editing | `test-design-epic-platform-capabilities-{1..4}.md` |
| `role-administration` | `RA-E1` Runtime Roles and the Permission Catalog · `RA-E2` Roles & Permissions Administration Screen | epic identity is written `RA-E1`/`RA-E2` in the source, not a bare number — Task 4's slug rule applies |
| `timetracker` | `TT-E1` Leaves Integration · `TT-E2` Projects and People Sync | — |
| `resourcing` | `RS-E1` Resourcing Request Lifecycle · `RS-E2` Profile Request History (S15) | — |
| `risk` | `RISK-E1` The Risk Record · `RISK-E2` The Scoped Risk Dashboard | — |
| `cds` | `CDS-E1` The S12 Registry · `CDS-E2` The Two CDS Filters on All Employees | — |
| `mentorship` | `M-E1` Mentorship Hub | — |
| `profile-sharing` | `PSH-E1` The Shared Link · `PSH-E2` Lifetime and Control | — |
| `feedback` | `FB-E1` Feedback Records on Profile · `FB-E2` Requested Feedback through Form Campaign | — |
| `engagement` | `ENG-E1` Action Item Lifecycle · `ENG-E2` Form Campaigns and the Sender Exception · `ENG-E3` *(superseded)* · `ENG-E4` *(superseded)* | `ENG-E3`/`ENG-E4` are marked superseded in the source with `RISK-E*` / `FB-E*` as live successors. **Do not create epic plans for superseded epics.** |
| *(none)* | **`frontend` is not a domain and not an epic.** | `test-design-epic-frontend.md` is retired; its obligations re-home per §4.4. |

**Bare epic numbers repeat across domains** — Epic 1 exists in at least ten of the twelve
domains. That is exactly why the plan requires the `epic-{domain}-{number}` identity and
requires a bare repeated number to prompt for scope without writing anything.

**Observation for Task 4:** the installed skill's own rule (`SKILL.md:87`,
`steps-c/step-01-detect-mode.md:128`) already says the epic checkpoint is
`test-design-progress-{run_key}.md` with `run_key = epic-{epic_num}` — yet the two epic
runs on disk wrote `test-design-progress-user-management.md` / `-frontend.md` with
`runKey: 'user-management'` / `'frontend'`. The stock rule was not what produced these
names, so Task 4 must not assume stock behaviour will be followed, and Task 5 must exercise
it rather than assert it.

---

## 13. Consumer ledger

### 13.1 The sweep

Run verbatim from the worktree root at `76a7220`:

```
rg -n --hidden 'test-design|test_design|TD-UM-|R-UM-|people-management-handoff|people-management-platform-handoff' docs _bmad-output _bmad/custom .agents/skills .claude/skills scripts test .github
```

**Result: 545 matching lines across 125 files.** Every file is classified below. Nothing in
`scripts/`, `.github/` or `_bmad/custom/` matched.

| Class | Files | Hits | Meaning |
| --- | ---: | ---: | --- |
| Source artefacts (self-references) | 14 | 205 | The migrating documents themselves (14 of the 15 sources match; `test-design-epic-frontend.md` contains none of the search terms). Not consumers. |
| This migration's own plan + review | 2 | 28 | `docs/superpowers/plans/2026-09-10-test-design-consolidation{,-review}.md`. Inputs, not consumers. |
| **Current consumer — workflow definition** | 34 | 100 | `bmad-testarch-test-design` in both installations. |
| **Current consumer — repository artefact** | 4 | 10 | See §13.2. |
| **Historical statement — do not rewrite to new semantics** | 7 | 100 | See §13.2. |
| Incidental (workflow *name* only, no artefact reference) | 64 | 102 | `bmad-testarch-{trace,ci}` skill copies (44 files) and shared knowledge fragments (20 files) mentioning `*test-design` as a workflow name, plus two example/illustrative files. No treatment required. |

### 13.2 Per-consumer treatment

| Consumer | Hits | Classification | Treatment |
| --- | ---: | --- | --- |
| `.claude/skills/bmad-testarch-test-design/**` and `.agents/skills/bmad-testarch-test-design/**` (34 files: `workflow.yaml` ×12 each, `steps-c/step-05-generate-output.md` ×7 each, `checklist.md` ×4 each, `SKILL.md`, `instructions.md`, `steps-c/step-01-detect-mode.md`, `steps-c/step-01b-resume.md`, `steps-c/step-02-load-context.md`, `steps-c/step-03-risk-and-testability.md`, `steps-c/step-04-coverage-plan.md`, `steps-v/step-01-validate.md`, four templates, `customize.toml`, `resources/test-design-epic-3.example.md`) | 100 | **Current — producer/consumer of every output path** | **Do not edit the skill trees.** Task 4 places the override in `_bmad/custom/bmad-testarch-test-design.toml` (the generated `customize.toml` is marked "DO NOT EDIT — overwritten on every update") and must resolve identically through both installations. Three stock behaviours the contract must override or pin: (1) `workflow.yaml:56` derives `test-design-epic-{epic_num}.md` from a bare `epic_num`; (2) `workflow.yaml:49` derives the handoff from `{project_name}`, which contains a space; (3) `steps-v/step-01-validate.md:4` writes `{test_artifacts}/test-design-validation-report.md` unconditionally, so an epic Validate would overwrite the system report. Also note `steps-c/step-01b-resume.md:5` globs `test-design-progress-*.md` and `:6` names a `legacyOutputFile` `test-design-progress.md` — resume behaviour sees every checkpoint, which is why a mismatched `runKey` must refuse rather than adopt. |
| `_bmad-output/planning-artifacts/platform/epics.md` (`:130`, `:254`, `:323`, `:328`, `:331`) | 5 | **Current — Story 1.6 deliverable references** | Task 3 updates **artifact references and factual dependency references only**: `test-design-architecture-platform` → the canonical platform pair, "handoff" → the single canonical handoff, "validation" → the canonical validation report. **Preserve** the `QUALITY-GATE-AC` / `QUALITY-GATE-AC-NFR` gate identities, the historical `gate-decision.json` anchor at `c342138`, the `TT-IDENTITY-01`/`TT-PMDM-01` gate IDs, the evidence caveat about the untracked timetracker contract, and the sprint status. Record additional substantive debt instead of declaring the story complete (§6 F-7, §10 U-16). |
| `_bmad-output/implementation-artifacts/platform/sprint-status.yaml:55` (`1-6-platform-test-design-refresh-v1-2-v1-5: backlog`) | 1 | **Current — tracking key** | **No change.** The plan forbids sprint-status changes. The key is a tracking identity, not an artifact path. |
| `_bmad-output/planning-artifacts/global-coverage/chain-fix/unmapped-stories-classification.md` (`:180`, `:187`, `:570`) | 3 | **Current — coverage classification** | Classifies `PLAT-E1-S1.6` as an evidence-layer artifact refresh with no product surface, and explains why attaching `PM-FR-36/37/38` would break `verify-coverage.py` check 2. **No change** — it makes a coverage argument, not an artifact-path claim. Task 5's read-only trace comparison must not perturb it. |
| `test/trace-artifact-naming.test.cjs:17` | 1 | **Current — guard** | **No change.** Its comment exempts test-design progress documents from the dated-name rule; no filename this migration introduces is governed by it (§5.3). |
| `docs/superpowers/plans/2026-08-25-test-design-validation-fixes.md` | 89 | **Historical statement** | This plan *is* the record of how the 2026-08-25 artefacts reached their state; it names line numbers, verbatim `rg` commands and expected content in the superseded files. **Do not rewrite it to new semantics.** Where a citation would change meaning because the filename is reused (§6 F-10), add a `76a7220` commit link beside the path rather than repointing it. Named by the plan as a historical consumer. |
| `docs/superpowers/plans/2026-08-20-tea-environment-setup.md` (`:17`, `:102`) | 2 | **Historical statement** | Records the original TEA installation decision (commit both installations) and a resolver smoke command. **No change**; it is still the origin of the dual-installation rule Task 4 depends on. |
| `_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-27.md` (`:28`, `:48`, `:78`, `:153`, `:227`) | 5 | **Historical statement** | Records the 2026-08-27 finding that platform test-design still cited PRD v1.2, and defines work item **P-6** ("Platform test-design refresh"). **Do not rewrite.** It describes a past state that the 2026-08-29 refresh addressed. |
| `_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md:166` | 1 | **Historical statement, and a live supersession** | States that the 2026-09-01 E2E audit **supersedes** the `865df5f` / "Prisma-and-test-intent-only" characterisations in `critical-review-existing-artifacts.md` **and** `test-design-progress-system.md`, and that `registration.e2e-spec.ts` / `deactivation.e2e-spec.ts` retire because they contradict v1.5. **Do not rewrite**, and treat it as corroborating authority for the registration/deactivation retirements in §4.3c. Named by the plan as a historical consumer. |
| `_bmad-output/planning-artifacts/correct-course-2026-08-29-file-inventory.md:5` | 1 | **Historical statement** | Records that the 2026-08-29 correct-course branch *deliberately excluded* TEA/test-design artifacts. **No change.** |
| `_bmad-output/planning-artifacts/platform/reviews/review-cross-slice-seams-2026-09-02.md:66` | 1 | **Historical statement with a live warning** | Records that completing Story 1.6 would falsely close `PM-FR-15`. **Do not rewrite**; carry the warning into Task 3's Story 1.6 edit (§6 F-7). |
| `_bmad-output/specs/spec-access-control-test-cases/.memlog.md:52` | 1 | **Historical statement** | Records "pre-v1.5 suite withdrawn in `6086491` with zero scenario files on disk" and names `test-design-qa-platform` as an input to that decision. **Do not rewrite** — it is the primary evidence for §6 F-3. Named by the plan as a historical consumer (the access-control spec `.memlog.md`). |
| `.claude/skills/bmad-testarch-{trace,ci}/**` and `bmad-testarch-test-design/resources/knowledge/**` (plus `.agents/` mirrors) — 64 files | 102 | **Incidental** | Matches are the workflow *name* (`*test-design`), generic template prose ("In `test-design-architecture.md`:" inside `adr-quality-readiness-checklist.md`), or illustrative examples (`traceability-matrix.example.md` referencing a fictitious `test-design-epic-6.md`; `resources/test-design-epic-3.example.md`). **No treatment.** They make no claim about this repository's artefacts. |

### 13.3 Service repositories (inspected separately, read-only)

The migration worktree has both submodules uninitialised, so both were inspected in the
user's live checkout, which is checked out clean at exactly the pinned revisions
(`services/backend` `f1eea3c048821011da96fba20d9b517f7d0e4f1b`, `services/frontend`
`fa3d3198aa9921c26d22307542ab72834a03b899`, both `heads/main`, both `git status --short`
empty). Nothing was written to either.

| Check | Result |
| --- | --- |
| The sweep pattern (`test-design\|test_design\|TD-UM-\|R-UM-\|people-management-handoff\|people-management-platform-handoff`) over `services/backend` and `services/frontend`, excluding `node_modules`, `dist`, `.git` | **Zero matches in both repositories.** |
| Broader check for `_bmad-output` / `test-artifacts` references | 16 files. All are either architecture/spec pointers (`backend/AGENTS.md`, `frontend/AGENTS.md` → `ARCHITECTURE-SPINE.md` and `_bmad-output/specs/spec-*/SPEC.md`) or **performance-artifact output paths** (`backend/test/measurement/acm9/acm9-baseline.measurement-spec.ts:40` and `backend/test/measurement/resolve-audiences.measurement-spec.ts:34,730,731` writing to `_bmad-output/test-artifacts/performance/`). |
| `deferred-work.md` in either service | Not present in either service at the pinned revisions — **and it was never supposed to be.** The file the sources cite is a workspace planning artifact under `_bmad-output/implementation-artifacts/` (four exist; §6 F-8). This service-scoped check therefore establishes nothing about it, and **must not be cited as evidence that the file does not exist.** |

**Conclusion:** **no service file consumes any test-design artifact, path, or identifier.**
The only service→workspace coupling in `_bmad-output/test-artifacts/` is the
`performance/` directory, which this migration does not touch. No service change is
required by this migration, and none is permitted by it.

---

## 14. Coverage summary

**Counting method.** Every number in §14 and §14.1 is a mechanical count, not an estimate:
each row of every table in this file whose header begins
`| source_anchor_or_id | kind | disposition |` is counted once, and its `disposition` cell
is read as-is. Prose notes that are deliberately not ledger rows — the §4.3e coverage hole
— are excluded, because they carry no disposition.

| Ledger section | Rows |
| --- | ---: |
| §3.1 S1 sections | 18 |
| §3.2 S2 sections | 19 |
| §3.3 S3 sections | 18 |
| §3.4 S4 sections | 23 |
| §3.5 S5 sections | 14 |
| §3.6 S6 sections | 15 |
| §3.7 S7–S10 sections | 14 |
| §3.8 S11–S12 sections | 9 |
| §3.9 S13–S14 sections | 21 |
| §3.10 S15 sections | 16 |
| **§3 total — every section of all 15 sources** | **167** |
| §4.1 `legacy-um` risks `R-001..R-014` | 14 |
| §4.2 `plat` risks `PR-001..PR-010` | 10 |
| §4.3a `um-epic` risks `R-UM-01..08` | 8 |
| §4.3b `um-epic` level-rebalance clusters | 9 |
| §4.3c `legacy-um` test IDs `TD-UM-*` | 58 |
| §4.3d source-to-successor scenario map | 6 |
| §4.3e handoff epic/story gates | 5 |
| §4.4 `fe-epic` risks, modules, components, claims | 22 |
| **§4 total** | **132** |
| §5.1 execution constraints | 15 |
| §5.2 blockers and sign-off packages | 13 |
| §5.3 workflow/installation constraints | 6 |
| §5.4 `legacy-um` decision IDs | 20 |
| §5.5 coverage gaps `G-01..G-16` | 16 |
| §5.6 `plat` trace IDs `TR-*` | 119 |
| §5.7 `plat` planning rows `P0–P3-PLAT` | 23 |
| §5.8 release and design gates | 12 |
| **§5 total** | **224** |
| §7.1 NFR thresholds and measurement contracts | 19 |
| §7.2 assessment boundary | 1 |
| §8 estimates | 8 |
| §9 cross-epic regression triggers | 14 |
| **§7–§9 total** | **42** |
| **Disposition ledger grand total** | **565** |
| §6 findings against reality | **18** — F-1..F-13 by Task 1, F-14..F-18 added 2026-09-10 |
| §10 unresolved decisions | **25** — U-1..U-16 by Task 1, U-17..U-25 opened by Task 2 |
| §11 pinned approval/validation/progress statements | 18 |
| §13.2 consumer treatments | 13 rows covering all 125 matched files |

### 14.1 Disposition distribution

**Exact counts over all 565 ledger rows** — recounted mechanically per the method above.
Every row carries one of the four legal values; there are no others. The four figures sum
to 565.

> **Task 2 re-count — the table below is Task 1's distribution and is now superseded.**
> Task 2 changed dispositions **in place** (§4.3c, §5.2, §5.6, §5.8) **and added one row**
> (§5.2, see below). Re-counted mechanically on 2026-09-10 by two independently written parsers
> that agree, each parsing every ledger row and reading column 3:
>
> | Disposition | Task 1 | **Current** | Δ |
> | --- | ---: | ---: | ---: |
> | `preserve` | 338 | **328** | −10 |
> | `merge` | 88 | **90** | +2 |
> | `replace` | 85 | **96** | **+11** |
> | `retire` | 53 | **51** | −2 |
> | **Total** | 564 | **565** | **+1** |
>
> **One row was added, and the row total moved 564 → 565.** **0** rows carry a value outside the
> four-value vocabulary, and **every** ledger row has exactly eight cells (§1.1b) — the two
> properties Task 5's disposition-aware ID check depends on. The net movement is
> `preserve` → `replace` (−10/+10), driven by §4.3c's legacy registration/deactivation rows
> gaining real successor subjects under `POST /users/import` and by §5.2's design-closed blockers
> moving out of § Open blockers; `retire` → `merge` (−2/+2) from the same family; **plus the one
> added `replace` row**, which is the eleventh. Task 1's figures are left below unedited so the
> movement is visible rather than overwritten.
>
> **Correction of record — this block asserted three things that were false, and they are
> withdrawn (2026-09-10).** It read "**Row total is unchanged at 564**", showed "Δ Total 0", and
> said "no row was added or removed". A row **was** added: Task 2 split `plat:PR-B-05 / OQ-105`
> into two rows in §5.2 (half 1 — who may grant/revoke HR Admin; half 2 — remaining default
> role-permission assignments), taking that section from 12 rows to 13. Under §1.3 a split is
> recorded as one row per successor, so the split was correct; **only the arithmetic was not.**
>
> **Why the wrong figure survived a mechanical count.** The half-1 row was written with **seven**
> cells — its `consumers` column was missing (§1.1b, now repaired). The parser used to produce
> the superseded figures required at least eight columns and **silently skipped** any row with
> fewer, so it skipped the very row that pass had just created. The count was mechanical and
> still wrong, because the parser and the defect were introduced by the same pass. This is why
> §1.1b now requires the eight-cell property to be asserted, not assumed, and why the recount
> above was run under two independently written parsers rather than one.

| Disposition | Rows | Share | Dominant cause |
| --- | ---: | ---: | --- |
| `preserve` | **338** | 59.9% | The 119 `TR-*` rows, the ten `plat` risks, the surviving `TD-UM-AUTH/CT/REL/LIST/PF` families, the twelve `plat` blockers and sign-off packages, and the decision log's KEPT entries. |
| `merge` | **88** | 15.6% | Duplicated platform/legacy sections (NFR, execution strategy, regression map, risk-to-story maps) and the three independently-derived level-strategy findings. |
| `replace` | **85** | 15.1% | Reused canonical filenames, changed subjects (`isActive` → lifecycle-owned employment status; `POST /users` → import writer; `GET /users` → composed All Employees route), and the 23 `AC STAGE-1 DRAFT` rows whose access-control pointer is dead. |
| `retire` | **53** | 9.4% | [v1.5-no-create] registration/deactivation obligations; discharged risks whose propagation completed; 2026-08-25 approval/validation statements; stale factual claims; the `frontend` run identity. |
| **Total** | **564** | 100% | — |

**Correction of record.** An earlier draft of this section reported "564 ledger rows" against
a §14 table totalling 562, and gave the distribution as approximately 378 / 90 / 55 / 39.
Those shares were estimated, not counted, and they were wrong — most seriously they
understated `replace` by roughly 55%, because the 23 `AC STAGE-1 DRAFT` rows in §5.6 are
`replace`, not `preserve`. §14 certifies acceptance, so nothing in it is estimated: the
figures above are counted. The row total also moved 562 → 564 in the same pass, because
three `split` rows became six legal rows and one non-row (§4.3e) left the tables.

### 14.2 Acceptance self-check against the plan's Task 1

| Plan acceptance clause | Status |
| --- | --- |
| "Every source section and ID has a disposition" | Met — §3's **167** rows cover every section of all 15 sources, and the remaining **398** rows are identifier, threshold, constraint, estimate and trigger rows (167 + 398 = **565**). Every one carries one of the four legal disposition values and exactly eight cells; §14.1 counts them. *(Read 167 + 397 = 564 until 2026-09-10; corrected with the row total — see §14.1.)* |
| "Every matching consumer has a treatment" | Met — all 125 files from the sweep are classified in §13, plus a separate read-only service inspection in §13.3. |
| "An unresolved product decision remains explicit and draft; the executor does not invent its answer" | Met — Task 1's 16 open decisions in §10, each with its owner and with an explicit statement of what Task 1 did **not** do (Task 2 later opened nine more, U-17..U-25; §10.1). Draft `DEC-UM-012` is kept draft and is not given the DEC-UM-001..011 approval. |
| "A retirement has a reason and authority even when no successor exists" | Met — every `retire` row cites a binding document, a RETIRED decision-log entry, or a discharge condition. |
| "Splits list all successors; merges list all origins" | Met — a split is recorded as one row per successor on the same source ID, each numbered "Split n of N" and each carrying its own legal disposition (§1.3); merge rows enumerate their origins. The three families split this way are `legacy-um:TD-UM-REG-05`, `legacy-um:TD-UM-REL-07` and `fe-epic:R-FE-06`, alongside the three-row `TD-UM-REL-04/05/06` split to mentorship. |
| "Key bare risks by source scope" | Met — §1.2 defines four mandatory scope keys and every bare identifier in the ledger carries one. |
| "Reuse current IDs; do not renumber epics or ClickUp mappings" | Met — §12 reuses the canonical identities verbatim; no epic, story, sprint key or ClickUp mapping is changed, proposed for change, or referenced for change. |

---

## 15. Task 2 — reconciliation record

**What this section is.** The record Task 2 owes: per checkbox, what was reconciled and on
whose authority; every open decision with its outcome; the three separated performance
contracts; and the re-estimate. It grants nothing, validates nothing and drafts no canonical
artifact.

**Provenance of this section, stated plainly.** Task 2 ran in two passes. The **first pass was
interrupted** partway through and, before it stopped, wrote a completion banner claiming
results it had not verified — including a reference to *this* section, which did not then
exist. That banner was replaced with a correction notice before any further work, and this
section was written **after** the reconciliation it describes, from counts machine-produced at
the time of writing. The first pass's surviving in-place row edits were treated as
**candidates** and re-verified against their cited sources before being counted as done;
§15.7 lists which were confirmed and what the second pass added. The rule the failure
produced is recorded in the banner and repeated here: **never write a summary before doing the
work it summarises.**

**Boundary.** Task 2 modified `migration-map.md` only. It wrote no canonical artifact, removed
no source, and changed no scenario file, trace artifact, sprint status, service file, gitlink
or product requirement. It executed no test suite and reports no pass rate.

### 15.0 Application of ruling D-1

**The ruling.** D-1 (2026-09-10, human user) names `docs/architecture/testing-strategy.md`
lines 25–38 as the authority on the F-3/F-12 approval-state conflict: `docs/test-cases/`
scenario documents no longer carry an approval status; "draft", "pending approval" and
"unapproved" are not meaningful states for them; a scenario is present or absent; stage
approval was removed on 2026-09-04.

**Verified, not assumed.** Task 2 re-read those lines at `76a7220` before applying them. They
say what the ruling says, and they add three things this ledger relies on: AD-1's three-stage
**ordering** survives (scenario → committed-red Stage-2 → production code); the two existing
approval ledgers are "kept as history" and "simply stop being a precondition for anything";
and the document itself names what replaces the removed control — "ordinary review — the pull
request, and CI actually executing the suites" — while warning that "if the suites are not run
in CI, nothing checks stage separation at all."

**Applied, in four places:**

1. **`plat:DG-01` and the legacy per-stage gates (§5.8, §5.6).** The per-stage *human approval*
   clause is **retired** with D-1 as authority. What survives is the ordering rule and the
   committed-red requirement. The `legacy-um:gate/phase-transitions` merge drops its "Human
   Approval" phase for the same reason; three of its four thresholds (P0 100%, P1 ≥95%,
   access-control suite pass) survive unchanged.
2. **`plat:PR-009` (§4.2).** Restated. The per-file-approval half of its rationale is retired;
   the risk — treating unexecuted access-control scenario documents as coverage — **survives on
   stronger current evidence, not weaker**: the ordering rule survives but its approval half
   does not, and `um-epic:R-UM-07` records that the e2e job is `continue-on-error`, so nothing
   currently forces the suites to run. The risk is **live and less mitigated** than the
   2026-08-29 source described it.
3. **`plat:PG-01` (§5.8).** Its stated rationale is retired in full — the removed per-file gate
   **was** its only stated support, and its "171 files" subject does not exist. The gate is
   **not** promoted to schedulable: removing a rationale is not evidence that a condition is
   met. It stays closed on a **new, evidenced** rationale (three currently-open blockers), and
   the missing closing condition is opened as **U-20**.
4. **The 23 `AC STAGE-1 DRAFT` rows (§5.6).** Preserved as a **source** planning state at
   2026-08-29, pinned at `76a7220`. Not re-asserted as live, not converted to "approved", and
   **not carried into any canonical artifact as an active approval obligation** — exactly as
   D-1 requires. The remediation instruction "establish the approval state of these suites" is
   dropped from this ledger wherever it appeared.

**What D-1 did not settle, handled on its own merits (§6, F-3).** The cited path
`docs/test-cases/access-control/` does not exist. The real inventory, machine-counted at
`76a7220` with `find <dir> -name '*.md' | wc -l`, is `access-control-foundation/` = **10** and
`access-control-kernel/` = **91**, total **101** — not 171. All 23 rows carry the corrected
pointer; their disposition stays `replace` because the obligation survives and only its
evidence pointer changed.

**One thing D-1 exposed that Task 2 could not resolve.** `testing-strategy.md` retains the
removed per-stage approval clause in **two** places, not one — a correction of record made
2026-09-10, because the question was first opened against line 84 alone:

- **`:84`** — "Each scenario still stops for its own human approval before stage 2."
- **`:117–119`** — "Preserve AD-1 unchanged: scenario prose, **independent human approval**, a
  separate Stage-2 dispatch committed red and **independently approved**, then a separate
  production dispatch."

Both were re-read verbatim at `76a7220`. D-1 settles which statement governs *this ledger* —
lines 25–38 — and nothing here relies on either location. But the binding document contradicts
itself twice, and that belongs to its owner. Recorded as **§6, F-14** and opened as **U-18**,
whose scope now covers both locations; Task 2 itself did **not** edit the source.

**U-18 resolved 2026-09-11.** The document's owner (Architect) has since edited both `:84` and
`:117–119` to match lines 25–38, removing every "human approval" clause while leaving the
three-stage ordering unchanged. See §10.1 and the `plat:DG-01` row (§5.8) for the closure record.

### 15.1 Checkbox 1 — legacy registration/deactivation

**Reconciled.** The `legacy-um` registration/deactivation family (§4.3c) was re-classified
against v1.5 seed/import and departure authority. Five dispositions changed from Task 1's
first pass; each changed row preserves Task 1's value in prose.

**Authority.** `docs/architecture/README.md` non-negotiable 10; **PM/AD-16** (no
employee-creation API — import the seeded population only); **PM/AD-21** (v1.5 replaces the
legacy create/deactivate paths, no dual-running mode); **PM/AD-22** (employment status is owned
by the employment lifecycle, not `User.isActive`); `user-management-test-decisions.md`
**DEC-UM-006 RETIRED** and **DEC-UM-008 RETIRED**. Three authorities the first classification
had not used were decisive: **DEC-UM-006's "Transport specified 2026-09-02"**, which fixes the
replacement route as `POST /users/import` (multipart, one `file` part, semicolon-delimited CSV,
`user-management:create`, structurally invalid → `400` with nothing written, row errors →
`200` with a per-row `skipped`/`errors[]` summary); **DEC-UM-007's "Mapping OPEN items resolved
2026-09-02"**, which routes `IsDismissed`/`DismissedDate` to an `EmploymentStatus` row and sets
`User.isActive = true` for **every** imported row including dismissed ones; and **the
repository's own executed retirement** — `docs/test-cases/user-management/registration/README.md`
and `.../deactivation/README.md` both declare their folders RETIRED (v1.5, 2026-09-01) and name
their successors **by file**. Corroborated by
`sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md:166`.

**What that changed.** Task 1 had retired the authentication and authorization rows because
"the route does not exist". A replacement route now demonstrably does, so
`TD-UM-REG-02`/`-03`/`-05`(no-session half) become `replace` onto real successor subjects in
the seed/import coverage rather than retirements, and `TD-UM-DEACT-02` + `TD-UM-LIST-04` merge
onto `list/um-list-05` + `um-list-06`. **Superseded intent retired; surviving auth, timeline,
relationship and identity invariants preserved** — `TD-UM-REG-11` (email normalisation),
`TD-UM-REG-12` (rehire identity preservation) and `TD-UM-REG-07` (duplicate `ttId`, recorded as
an obligation with no current trigger) all survive as `preserve`.

**Retired scenario files were not resurrected.** `registration/` (16 `.md`) and `deactivation/`
(4 `.md`) remain untouched on disk; both READMEs forbid translating, citing or approving them,
and this migration does none of those. Whether 20 history-only files should stay is **U-21**.

### 15.2 Checkbox 2 — platform blockers

**Reconciled.** All nine `PR-B-01..09` and both `PR-S-01/02` sign-off packages (§5.2).

**Authority.**
`_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml`
— the architecture blocker register, **31 entries** (machine-counted), each carrying `status`,
`design_status`, `implementation_status`, `decision_refs` and `closure_condition` — corroborated
by `blocker-verification-2026-09-03.md`, whose result line reads **"17 open · 0 closeable · 1
evidence caveat degraded"**. Spot-verified at `76a7220`: `OQ-114` `status: closed`,
`design_status: resolved-approved`, `implementation_status: transition-debt`, `decision_refs:
[PM/AD-32]`; `OQ-115` closed / `absent` / `[PM/AD-33]`; `OQ-117` closed / `partial` /
`[PM/AD-34]`; `OQ-PERM-01` `status: open`, `severity: P1`.

**The distinction the plan demands is the register's own.** `blockers.yaml` states the rule
itself — *"open blockers remain fail-closed and are not resolved by ratification"* — and
individual entries reinforce it (*"schema approval alone does not close implementation"*,
*"design ratification is not implementation evidence"*).

**Outcome. Six of nine design-closed; none implementation-closed; both sign-offs ungranted.**
Design-closed, implementation open: `PR-B-01`/`OQ-114` (PM/AD-32), `PR-B-02`/`OQ-115`
(PM/AD-33), `PR-B-03`/`OQ-116` (PM/AD-27), `PR-B-04`/`OQ-117` + `ARCH-ENV-01` (**PM/AD-34**),
`PR-B-05`/`OQ-105` **HR-Admin half only** (PM/AD-26, AD-12), `PR-B-06`/`CC-05` (PM/AD-28).
Still open: `PR-B-05` role-permission-assignment half → `OQ-PERM-01` **P1**; `PR-B-07`/`CC-07`
**P0**; `PR-B-08` → `TT-IDENTITY-01` **P0** + `TT-PMDM-01` P1; `PR-B-09` →
`OPERATIONAL-ENVELOPE` **P0**; `PR-S-01`/`CC-04`; `PR-S-02`/`CC-06`.

**`PR-B-05` is recorded as a split**, one row per half, because only one half closed —
the alternative (closing the blocker whole) would have silently discharged the open half.
**U-1 closes; U-17 opens** for the implementation work. `plat:boundary/"closing design
discovery does not close implementation work"` is `preserve`d as a governing rule, not as
prose.

**Recorded caveat, not resolved:** `blockers.yaml`'s own `evidence_caveat` states that
`docs/integrations/timetracker-external-api.json` is **untracked and does not exist at the
pinned SHA**, so every finding resting on it — `TIMETRACKER-CONTRACT`, `TT-IDENTITY-01`,
`TT-PMDM-01`, part of `OPERATIONAL-ENVELOPE` — is a working-tree observation, not a
reproducible baseline claim. Task 2 carries that caveat forward with those entries rather than
treating them as evidenced.

### 15.3 Checkbox 3 — the three performance contracts, separated and stated in full

They share a "500" and a "2 seconds" and **nothing else**. Conflating any two of them would
let a passing measurement of one be reported as evidence for another. Stated in full:

**Contract A — All Employees HTTP/list requirement.**
*Authority:* `docs/project-requirements.md:614` (v1.5 §7, normative), release-gated as
`plat:PG-04`. *Evidence owner:* `PMC-E1-S1.9` (`platform-capabilities/epics.md:737`).
*Subject:* the composed All Employees HTTP/list route, end to end, **including permission
resolution**. *Dataset:* 500+ seeded employee records "with representative relationship breadth
and depth, and no real personal data". *Filters / graph shape:* arbitrary filters, sorts and
column combinations plus derived and custom fields; fixture **breadth and depth are recorded
with the result** rather than fixed in advance. *Environment:* **UNKNOWN** — PostgreSQL version
must be recorded, but no target environment is named anywhere. *Statistic:* p50, p95 **and**
worst case must all be recorded, together with query count and `EXPLAIN (ANALYZE, BUFFERS)`;
**which of them the threshold binds to is UNKNOWN**. *Measured shape:* page size, whether the
total-count query is included, and whether the figure covers one page or the full entitled set
must be stated; the budget is measured against first-load shape, so a small page of a large set
does not satisfy it. *Threshold:* **≤ 2 seconds**. *Load model:* **UNKNOWN** — no concurrent-user
model stated. *Evidence:* measurement against the composed directory route with a recorded
environment — **harness UNDECIDED** (**not** k6, **not** ACM-9, **not** P6), and **the harness
does not exist yet** (§8.1, category 4; §6, F-17; §10, U-24). *Failure semantics:* a
measured miss opens optimization as a separately gated story and may not claim the threshold met.
*Priority:* **P0** (§15.4).

**Contract B — ACM-9 AccessControl facade resolver.**
*Authority:* `docs/architecture/testing-strategy.md` § "ACM-9 operational measurement protocol —
`ACM9-MVP-v1`", binding. *Subject:* the **public facade call** end to end, including transaction
and result mapping — **not** an HTTP list route. *Dataset:* 500 **requested active targets**.
*Graph shape:* balanced depth-5 plus acyclic chains at depths 5/25/50/100/200/300/400/499, **each
an independent gate**; slow classes must not be aggregated away. *Environment:* recorded via
`ACM9-MANIFEST-v1` hashes. *Statistic:* p50/p95 by **nearest rank over 20 measured calls after 5
discarded warm-ups**, plus absolute worst case. *Threshold:* warm p95 **and** worst case ≤ 2 s,
per shape. *Evidence:* `measurement (ACM9-MVP-v1)`, artifacts under
`_bmad-output/test-artifacts/performance/`; tracked as blocker `QUALITY-GATE-AC-NFR`.
*Live conflation hazard, recorded not resolved:* `QUALITY-GATE-AC-NFR` is recorded **closed**
(2026-09-02) on an ACM-9 **facade-resolver** artifact, while `PMC-E1-S1.9` routes the
**directory-route** evidence at the same gate name. A gate closed by contract B's evidence must
not be read as satisfying contract A. Recorded as **§6, F-15** and opened as **§10, U-25**
(2026-09-10 — until then this hazard was "opened" in row prose under a number that already meant
something else). **The standing repository decision that the ACM-9 CI job stays informational is
not disturbed by this migration**, and Task 2 proposes no promotion of it.

**Contract C — P6 `resolveAudiences` measurement.**
*Authority:* `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md`, whose
own scope section states "Measurement only; **no production code or CI timing threshold
changed**". *Subject:* the `resolveAudiences` function. *Dataset:* 500 synthetic users. *Graph
shape:* balanced branching 4 at depth 5, plus acyclic chains at depths 25–499. *Environment:* as
recorded in that artifact. *Statistic:* cold/warm p50/p95/worst, in **milliseconds**. *Threshold:*
**none — P6 is a measurement record, not a gate**, and must never be treated as one. *Evidence:*
`measurement (P6)`; backend `test/measurement/resolve-audiences.measurement-spec.ts`.

**The rule that follows.** No P6 or ACM-9 result is evidence for contract A. In particular
ACM-9's "warm p95 and worst case" pass rule is **not** read into contract A's open statistic
question (U-3(i)) merely because contract A also requires p95 and worst case to be *recorded*;
recording a statistic and binding a threshold to it are different acts, and no authority
performs the second for contract A. Contract A's remaining unknowns stay unknown.

### 15.4 Checkbox 4 — UM P1 versus platform P0

**Resolved: P0.** Recorded rationale, in the order it was established:

1. **Severity does not decide it.** `legacy-um:R-005` is PERF **6**; `plat:PR-006` is PERF
   2×3 = **6**. Identical. Both scores are preserved unchanged; neither was re-scored to
   support a priority.
2. **The obligation is release-gated.** `plat:PG-04` gates release on it, over a normative v1.5
   §7 requirement (`docs/project-requirements.md:614`).
3. **P1 would contradict (2).** `legacy-um:S2#exit-criteria` — preserved by this migration —
   sets **P0 = 100% covered, P1 = ≥95%**. Labelling a release gate P1 makes it formally
   acceptable to ship it uncovered. P0 is the only value consistent with the exit criteria.
4. **The canonical story agrees.** `PMC-E1-S1.9`'s closing criterion: on a measured failure
   "this story does not claim the NFR-3 or SM-4 threshold is met" — blocking semantics.

**What was deliberately not done.** No P0 **percentage** was normalised. The `plat` P0 band
keeps exactly its eight rows, `P0-PLAT-01..08`; the `legacy-um` P1 statement is a **merge
origin** of `plat:P0-PLAT-08`, not a new P0 row, so no denominator moved. Risk-based severity
is preserved throughout: this resolves a *priority label*, not a risk score.

**`R-UM-04` (U-8), reconciled separately and on the same principle.** `R-UM-04` scores
3 × 2 = **6** but sits under a "Medium-Priority Risks (Score 3–4)" heading, while the same
document heads its first table "High-Priority Risks (Score ≥6)"
(`test-design-epic-user-management.md:73`, `:81`). Six satisfies the high band and falls outside
the medium band's stated range, so **the heading placement is the defect and the score is
authoritative**. In the destination it is filed under High-Priority Risks at score **6**,
unchanged. Neighbours were cross-checked so the correction is not over-applied: `R-UM-05` (4)
and `R-UM-06` (3) are both correctly inside "3–4", so exactly one row is misfiled. The source
document was **not** edited. *Consistency note for Task 3:* §4.3a routes `R-UM-04` to
`test-design-qa.md` § Execution strategy (backend isolation) because that is where its
*mitigation* lives; its **risk-register entry** belongs in `test-design-architecture.md` under
High-Priority Risks per the plan's ownership split. Both destinations are intended.

**Standing.** Both resolutions are QA determinations recorded by the migration, which the plan's
Task 2 explicitly asks for. Neither changes a product requirement, a risk score or an approval.

### 15.5 Checkbox 5 — execution constraints

**Reconciled against the *current* policy, not the old document.** The full recheck is recorded
inline at the head of §5.1 so it travels with the rows; summarised here.

*Authority:* `docs/architecture/testing-strategy.md` § "Test data isolation (DEC-UM-010)", lines
254–261, re-read at `76a7220`. It binds: one test worker now, collision-proof UUID namespace,
delete only owned data; `@concurrency` scenarios use `Promise.all` **inside one isolated test**
and need no extra workers; **one PostgreSQL schema per worker** is a **precondition of** enabling
parallel workers, and a `Date.now()` prefix alone is insufficient; isolation is platform
infrastructure, not per-story invention.

*Backend and frontend stay separate, for a mechanical reason:* the backend rule exists because
e2e suites share **one database**; the frontend rule exists because Playwright parallelises **by
file** over browsers with **no shared database**. The frontend does not inherit `--runInBand` or
the one-worker rule; the backend does not inherit `retries: 2`.

*Schema-per-worker is not scheduled work* and carries **no** estimate — the source's own
conclusion ("not needed at 90 seconds and should not be built until it is") agrees with
DEC-UM-010's ordering.

*Evidence distinctions preserved as four separate levels*, with one precision added: `contract
(Pact)`, `api-e2e (real HTTP + PostgreSQL)` and `integration-live` (a real external provider,
weekly/pre-release only) are never substituted for one another, and every `component` cell in
this ledger means **a component rendered in `jsdom` with the network mocked** — no browser
process, no HTTP, no database — which is *not* interchangeable with the frontend Playwright e2e
cases. That qualifier was missing from §1.5's vocabulary; it is recorded as a precision note
rather than a vocabulary edit, and **no row's `evidence_contract` cell was altered**.

*Discovered while rechecking:* the `testing-strategy.md:84` self-contradiction → **U-18**.

### 15.6 Checkbox 6 — regression map, time controls, fakes, and epic assignment

**Preserved.** The UM cross-epic regression map survives intact in §9 — access-control on every
PR, `UM-E1 → UM-E3` on profile mutation, `UM-E3 → M-E1` (re-pointed after `REL-04/05` moved to
mentorship), `UM-E2 → all suites` on the auth/session path — alongside the platform triggers.
The dedicated `um-epic:reg/TTL, time controls, outbound fakes, durable-state observability` row
is preserved with its scope stated: controllable clock and timezone seams serve the 15-minute,
4-hour, magic-link-expiry and departure-cutoff boundaries; outbound fakes serve dispatch and
sync observation; **durable-state observability applies to the departure worker and — after
DEC-UM-008 — to the magic-link dispatch path only**, which is the "applicable" qualifier doing
real work rather than decorating the sentence.

**Feature-specific cases assigned to actual current epics.** Every `→ Task 2` placement is now
resolved against a named authority: pagination arithmetic → `UM-E1-S1.5`; filter pruning **split**
`UM-E1-S1.5` (identity-field whitelist, `list/um-list-09`) / `UM-E7` (`PM-FR-5` anti-inference
including result-count differencing, on custom fields, enforced in the facade **before** filter
execution per PM/AD-32); `PersonPicker` risk and its 8 component cases → `PMC-E1-S1.3`, on
`user-management/epics.md:610`, where UM itself places substring/typeahead search **outside** its
scope; mutation hooks → `UM-E4` (the DEC-UM-005 optimistic-token contract), with the departure
`409` shapes staying on the error-extractor obligation where the source put them.

**Cross-cutting candidates stay in the QA improvement backlog, with owner and trigger, and do
not count as requirement coverage.** Counted at the time of writing: **32** frontend cases
(`http.ts` 9, `datetime.ts` 6, generic hooks 6, `StatePanel` 6, `MainHeader`/`SideMenu` 5) plus
the non-case items `R-FE-03` (frontend error handling), `R-FE-07` (route titles), `R-UM-05`
(unenforceable skip triggers) and `R-UM-07` (CI observability). The `PMC-E1-S1.2` re-home of nav
chrome was **declined** on that story's own scope note — it owns directory-*table* presentation,
not the app shell.

**`R-UM-07` — the boundary held.** Its mitigation is **not** to promote the informational
access-control CI job to a required check. That is a repository-governance decision outside this
migration, whose root changes are planning artifacts and workflow configuration only. The item
sits in the backlog with owner QA and trigger "the job's red-case count changes while it stays
informational."

**`R-UM-05` — count corrected upward, score not renormalised.** 18 → **31** `it.todo` cases,
statically counted at backend `f1eea3c` (`grep -rn 'it\.todo' test src | wc -l` = 31, all under
`services/backend/test/`, none under `src/`), corroborated by `platform/deferred-work.md:35`,
which records the same 31 and separately notes that `docs/ci.md`'s "19" is stale. This is a
**static source count, not an execution result**. The correction makes the risk larger; the score
was left alone.

**Loose end from Task 1, resolved — the citation is wrong, the tracking is real.**
`test-design-epic-user-management.md:64` says the five `UM-CT-03/04/05/06/09` `it.todo` cases are
"Tracked in `deferred-work.md`". Task 2 searched all three `deferred-work.md` files: **no
`UM-CT`-keyed item exists in any of them**, and the nearest, `platform/deferred-work.md:35`, is a
generic `it.todo`-count note, not a tracking entry for these five. **This ledger therefore does
not assert that link.** What the search *did* establish is that the deferral is genuinely
tracked, in three other places: (a) the scenario documents themselves —
`docs/test-cases/user-management/career-timeline/um-ct-0{3,4,5,6}-*.md` carry "**DEFERRED
(pending the FR-matrix grant)**" in their titles and `um-ct-09-*.md` carries "DEFERRED (pending
the DEC-UM-001 narrowing)"; (b) the spec files, where each case is an `it.todo` carrying its own
inline unblock trigger — `services/backend/test/user-management/epic-3/manual-events.e2e-spec.ts`
(`um-ct-03`, `um-ct-04`, `um-ct-09` and the DEC-UM-001 narrowing case) and
`.../edit-delete-events.e2e-spec.ts` (`um-ct-05`, `um-ct-06`); (c)
`_bmad-output/implementation-artifacts/access-control/deferred-work.md:45`, the `profile:timeline`
`canAccessSection` support item that is the enabling work. **Outcome:** the obligation is real,
traceable and correctly out of scope for the UM epic design; only the pointer is wrong. Task 3
should cite the scenario documents and the specs, **not** `deferred-work.md`. Recorded as a
citation defect, not opened as a decision — nobody needs to decide anything.

### 15.7 What the first pass had done, and what the second pass verified or added

Every item below was re-checked against its cited source before being counted; none was accepted
on the strength of its marker alone.

| Block | First pass | Second pass |
| --- | --- | --- |
| §4.3c legacy registration/deactivation | Re-adjudicated; five dispositions changed | **Verified.** DEC-UM-006 transport, DEC-UM-007 mapping and both RETIRED READMEs re-read; successor suites confirmed on disk. Confirmed as done. |
| §5.2 platform blockers | Adjudicated all eleven against `blockers.yaml` | **Verified.** Register spot-checked (`OQ-114/115/117/PERM-01`), the 31-entry count and the "17 open · 0 closeable" result line confirmed. Confirmed as done. |
| §5.6 access-control trace rows (D-1) | Block discharged, 23 rows re-pointed | **Verified.** 10 + 91 = **101** re-counted; `docs/test-cases/access-control/` confirmed absent. Confirmed as done. **Added:** U-19 and U-20 defined (the first pass cited them without ever defining them). |
| §4.3a `R-UM-04`, `R-UM-05` | U-8 resolved; 18 → 31 corrected | **Verified.** Headings at `:73`/`:81` and the 31-count re-run. **Added:** the Task 3 consistency note in §15.4 on `R-UM-04`'s two destinations. |
| §4.3b directory clusters | Pagination confirmed to `UM-E1`; filter pruning split | **Verified** against `UM-E1-S1.5` scope and `UM-E7`. Confirmed as done. |
| §5.1 execution constraints | First row rechecked | **Completed.** DEC-UM-010 re-read in full; the four-point recheck note added; the mocked-browser precision recorded; U-18 opened. |
| §7.1 performance contracts | Three rows separated with UNKNOWNs | **Completed.** `PMC-E1-S1.9` located and made the defining statement for contract A; six parameters closed, three left UNKNOWN; all three contracts stated in full in §15.3. |
| §4.4 frontend re-homing | Placements proposed, four left `→ Task 2` | **Completed.** All four resolved (`PersonPicker` ×2, nav chrome, mutation hooks) plus the `useAuth().userId` half → U-22. |
| §5.7 U-7 priority conflict | Untouched | **Completed.** Resolved as P0 with the four-step rationale (§15.4). |
| §8 estimates | Sources classified, no re-estimate | **Completed.** §8.1 written; five categories separated; the forbidden sums avoided; U-23 opened. |
| §10 decision register | Untouched — still Task 1 wording | **Completed.** §10.1 written: 5 resolved, 1 partial, 10 open, 7 newly opened. **Corrected 2026-09-10 to 9 newly opened** — two questions were cited in row prose under numbers that already had different definitions and so were never registered; they are now U-24 and U-25. |
| §15 | Claimed to exist; did not | **Written**, last, from counted facts. |

**Third pass — corrections applied 2026-09-10 after independent review.** The review verdict on
Task 2 was PASS WITH FINDINGS. Five findings were applied, and each is recorded where it lands
rather than only here:

| Finding | What was wrong | Where the correction lives |
| --- | --- | --- |
| Duplicate `U-nn` meanings | `U-19` and `U-20` each had a §10.1 definition **and** a conflicting "opened as …" use in row prose, so two genuine open questions sat in no register and "7 newly opened" undercounted | §10.1 numbering note; new **U-24**, **U-25**; citing cells in §4.3c and §5.8 repointed |
| Wrong row total | 564 / 95 `replace` was wrong; the true figures are **565 / 96** | §14 per-section table (§5.2 12→13, §5 total 223→224, grand total), §14.1, §14.2 |
| Malformed rows | `plat:PR-B-05` half 1 had 7 cells (missing `consumers`); `um-epic:R-UM-05` carried a pipe inside a `grep` command | both repaired; rule stated in **§1.1b** |
| Dangling `§6, F-nn` citations | five findings were cited and never written | **F-14..F-18** written into §6 with sources verified; former F-19/F-22/F-23 repointed |
| Contradictory evidence contracts | contract **A** asserted `load (k6)` in **8** `evidence_contract` cells and in §15.3's prose, while a ninth cell (`legacy-um:TD-UM-NFR-PERF-01`) and `plat:PG-04`'s own row prose said the harness is **undecided** — one row contradicted itself | all 8 cells plus §15.3 corrected to **UNDECIDED**; authority checked in **§6, F-17**; opened as **U-24**. *The review named four of these places; a full sweep found five more.* |

Two lower-severity reviewer notes were also applied: the §3.3/§3.4 rows that still called the
"171 files" correction *pending* now carry it, and §8.1's effort range is now inseparable from its
caveat.

### 15.8 Counts, machine-produced at the time of writing

| Count | Value | How obtained |
| --- | --- | --- |
| Task 1 open decisions | 16 | U-1..U-16 in §10 |
| Resolved with named authority | 5 | U-1, U-7, U-8, U-14, U-15 (§10.1) |
| Partially resolved | 1 | U-3 (§10.1) |
| Still open | 10 | U-2, U-4, U-5, U-6, U-9, U-10, U-11, U-12, U-13, U-16 (§10.1) |
| Newly opened by Task 2 | **9** | U-17..U-25 (§10.1). *Read 7 (U-17..U-23) until 2026-09-10; two questions were cited in row prose under numbers that already meant something else and so were never registered — now U-24 (undecided list harness) and U-25 (`QUALITY-GATE-AC-NFR` conflation).* |
| `PR-B-*` blockers closed at design | 6 of 9 | `blockers.yaml` (§15.2) |
| `PR-B-*`/`PR-S-*` closed at implementation | **0** | `blockers.yaml` `implementation_status` (§15.2) |
| Access-control scenario files | 101 (10 + 91) | `find <dir> -name '*.md' \| wc -l` at `76a7220` |
| Backend `it.todo` cases | 31 | `grep -rn 'it\.todo' test src \| wc -l` at `f1eea3c` |
| Net-new cases to epic plans | 112 (59 UM + 53 FE) | §8.1, counted from §4.3b and §4.4 |
| Net-new cases to the QA backlog | 32 | §8.1, counted from §4.4 |
| Remaining net-new authoring effort | ≈ 15–23 engineer-days — **category 2 only; unverified; uncalibrated; the sum of two same-basis source ranges; never to be added to any other estimate** | §8.1, which states the only form in which this figure may be quoted. Do not extract the number from this cell without the qualifier. |

---

## 16. Task 3e — final ledger-to-output reconciliation

**What this section is.** The plan's own Task 3 acceptance check, run mechanically:
*"Compare source disposition ledger to outputs and consumers. Each preserved/merged/replaced
item must resolve; every retired item must have authority/rationale. Require a reader to find
the relevant system and epic plan from the index without reading old files."*

It is designed to be **re-runnable by Task 5**. Every figure below was machine-counted at the
moment it was written, after the work it describes, and every count that §14 also certifies was
re-derived here independently rather than copied.

**It grants nothing.** No approval, no validation verdict, no coverage, no pass rate, no gate
result. It changes no disposition, no scenario file, no sprint status, no service file, no trace
artifact and no normative DEC.

### 16.1 Method, and the two hazards it is built around

1. **Two independently written parsers, not one.** §14.1 records why: a mechanical count inherits
   every defect in its parser. Parser **A** splits each line naively on `|` and detects a ledger
   table by the header prefix. Parser **B** is a character-level, escape-aware state machine that
   detects a ledger table by the *content* of its header cells. They were written separately and
   agree on every figure in §16.2.
2. **Non-self-contained target cells are resolved upward before anything is counted.** 19 rows
   carry a bare `same` or `same pattern` in `target_path_and_anchor`, inheriting the target of the
   row above. A naive search for the string `same pattern` finds only 6 of them. Every bare cell
   was resolved to the nearest preceding row *within the same table* before destinations were
   checked; the resolver reports where each came from and fails loudly if a bare cell is the first
   row of a table.

### 16.2 Ledger shape — re-derived, agrees with §14 and §14.1

| Property | Parser A | Parser B | §14 / §14.1 certifies | Verdict |
| --- | ---: | ---: | ---: | --- |
| Ledger rows | 565 | 565 | 565 | agree |
| Rows with exactly eight cells | 565 | 565 | all | agree |
| Cells containing a literal or escaped `\|` | 0 | 0 | 0 | agree |
| `preserve` | 328 | 328 | 328 | agree |
| `merge` | 90 | 90 | 90 | agree |
| `replace` | 96 | 96 | 96 | agree |
| `retire` | 51 | 51 | 51 | agree |
| Rows carrying any fifth disposition value | 0 | 0 | 0 | agree |

### 16.3 Bare target cells resolved upward

| Ledger section | Bare cells | Brief's expectation | Resolved |
| --- | ---: | ---: | --- |
| §4.2 `plat` risks | 6 | 6 | all to the §4.2 row above each |
| §4.3d source-to-successor scenario map | 5 | 5 | all to the §4.3d row above each |
| §9 cross-epic regression triggers | 8 | 8 | all to `test-design-qa.md` § Cross-epic regression map |
| **Total** | **19** | **19** | **19 resolved · 0 unresolvable** |

Of the 19, exactly **6** carry the literal string `same pattern` and **13** carry a bare `same`.
A search for `same pattern` alone would have missed 13 of 19.

### 16.4 Do all `preserve` / `merge` / `replace` items resolve to a destination that exists?

**514 non-retire rows.** Classification after upward resolution:

| Class | Rows | Exists today? |
| --- | ---: | --- |
| Target names a file that exists on disk now | 464 | **Yes** |
| Target names a section of an existing document without repeating its filename (`owning epic plans § …`, `QA improvement backlog § …`, `handoff § …`, `*(in place)*`) | 42 | **Yes** — the owning documents all exist |
| Target is a filename **pattern** (`test-design-progress-epic-user-management-{n}.md`) | 2 | **Yes** — all nine concrete checkpoints exist |
| Target is `— (no change required)` (§5.3, the trace-naming guard) | 1 | **n/a** — correctly needs no destination |
| Target is a **Task 4** deliverable | 5 | **No — and correctly so.** See 16.4a |
| **Rows whose destination is missing and should not be** | **0** | — |

Distinct destination files named across the ledger, each verified present:
`test-design-architecture.md` (57 rows) · `test-design-qa.md` (282) ·
`test-design-epic-user-management-1.md` (42) · `…-2.md` (18) · `…-3.md` (14) · `…-4.md` (9) ·
`…-0.md` (7) · `…-5.md` (7) · `…-7.md` (1) · `test-design-epic-mentorship-1.md` (5) ·
`test-design-epic-platform-capabilities-1.md` (3) · `test-design/people-management-handoff.md` (6) ·
`test-design/README.md` (6) · `test-design-progress-system.md` (5) ·
`test-design-validation-report.md` (2) · `test-design/migration-map.md` (2) ·
`docs/architecture/user-management-test-decisions.md` (14) ·
`docs/architecture/testing-strategy.md` (1). Fourteen further destinations are
`docs/test-cases/user-management/**` scenario files named as successors; **all 14 exist** and
**none is modified by this migration**.

#### 16.4a The five Task 4 forward references — recorded, not counted as failures

| Ledger row | Disposition | Target |
| --- | --- | --- |
| §5.1 `config:test_artifacts` / `test_design_output` (L862) | preserve | Task 4 contract |
| §5.3 `skills:dual-installation` (L923) | preserve | Task 4 contract |
| §5.3 `skills:epic-output-path` (L924) | replace | Task 4 contract — `epic-{domain}-{number}` identity |
| §5.3 `skills:system-output-paths` (L926) | preserve | Task 4 contract |
| §5.3 `skills:customize.toml` (L927) | preserve | Task 4 creates `_bmad/custom/bmad-testarch-test-design.toml` |

Neither `docs/test-design-workflow-contract.md` nor `_bmad/custom/bmad-testarch-test-design.toml`
exists yet. **This is the plan's own sequencing** — Task 4 ("Make workflow routing agree with the
artifact contract") runs after Task 3 — not a Task 3 defect. These five are the complete set of
open destinations, and Task 5 should re-run 16.4 after Task 4 and expect **0**.

#### 16.4b Per-file cross-check against each artifact's own Obligation trace

Each new epic plan states, in its own § Obligation trace, a machine-count of the ledger rows
targeting it. Those claims were re-derived here under a parser written for this section:

| Artifact | Claimed in the file | Re-derived here | Verdict |
| --- | --- | --- | --- |
| `test-design-epic-user-management-0.md` | 7 — 5 preserve, 1 merge, 1 replace | 7 — 5/1/1/0 | agree |
| `test-design-epic-user-management-1.md` | 42 — 25 preserve, 5 merge, 11 replace, 1 retire | 42 — 25/5/11/1 | agree |
| `test-design-epic-user-management-2.md` | 18 — 17 preserve, 1 retire | 18 — 17/0/0/1 | agree |
| `test-design-epic-user-management-3.md` | 14 — 12 preserve, 1 merge, 1 replace | 14 — 12/1/1/0 | agree |
| `test-design-epic-user-management-4.md` | 9 — 9 preserve | 9 — 9/0/0/0 | agree |
| `test-design-epic-user-management-5.md` | 7 — 5 preserve, 1 replace, 1 retire | 7 — 5/0/1/1 | agree |
| `test-design-epic-user-management-7.md` | 1 — 1 preserve | 1 — 1/0/0/0 | agree |
| `test-design-epic-mentorship-1.md` | 5 — 5 preserve | 5 — 5/0/0/0 | agree |
| `test-design-epic-platform-capabilities-1.md` | 3 — 2 preserve, 1 replace | 3 — 2/0/1/0 | agree |

Nine of nine agree exactly. No epic plan overstates or understates what the ledger routed to it.

#### 16.4c Anchor-name drift — five destinations whose *content* landed under a different heading

The destination document exists and carries the obligation in every case; only the section name
the ledger predicted differs from the heading actually written. Recorded so a future reader does
not read the mismatch as a lost obligation, and so the ledger is not silently "corrected" into
agreement with the output.

| Ledger target | Where the content actually is | Checked how |
| --- | --- | --- |
| `test-design/README.md` § Scope index (2 rows) | README §2 *Platform scope* + §3 *Epic scope* | both tables present |
| `test-design/README.md` § Current artifacts (2 rows) | the same two tables | present |
| `test-design/people-management-handoff.md` § Level-strategy handoff (2 rows) | the preserved rule is `test-design-qa.md:187` — *"No new unit or component case may claim requirement coverage it does not have."* | string located |
| `test-design-progress-system.md` § Inputs and outputs / § Summary (2 rows) | § *Inputs read, by path and content hash* + § *Outputs of this run* | headings present |
| epic plans § Story mapping (2 rows) | handoff § *Story mapping rules* + each plan's § Identity *"Stories in scope"* row | both present |

**No obligation was lost to drift.** No ledger cell was edited to hide it.

### 16.5 Do all `retire` items carry authority and rationale, and stay retired?

- **51 `retire` rows. 51 carry an authority and a reason in `authority_and_reason`**, including
  where there is no successor. The two shortest cells are still real authorities —
  `legacy-um:G-11` cites *"DEC-UM-008 RETIRED"* and `legacy-um:est/"Replaces/extends existing 28
  files"` cites *"Stale count (§6, F-4)"*.
- **21 distinct scoped identifiers** were extracted from those rows (the remainder are section
  anchors, not IDs) and searched across all **24** files of the new artifact set with a
  word-boundary matcher:

| Retired ID | Hits in the new set | Every hit is… |
| --- | ---: | --- |
| `A-04`, `G-02`, `G-03`, `G-09`, `G-11`, `TD-UM-REG-10` | 0 | — |
| `R-003`, `R-004`, `R-013`, `DG-05` | 5, 5, 5, 5 | the *Risks/gates retired at migration* tables in `test-design-architecture.md` and `test-design-qa.md`, the retired-obligation register at `test-design-qa.md:1624–1628`, and the handoff's source-to-successor map |
| `B-04`, `C-02`, `G-16`, `G-01` | 3, 2, 3, 1 | explicit "is **retired**" prose, the retired-obligation register, or an obligation-trace row |
| `TD-UM-REG-01`, `TD-UM-DEACT-01`, `TD-UM-EXP-02` | 4, 4, 1 | the source-to-successor map and § *Retired at migration — recorded so it is not reintroduced* |
| `TD-UM-REG-05`, `TD-UM-NFR-REL-01`, `R-FE-06`, `C-07` | 1, 1, 5, 1 | a **split** whose surviving half is labelled as such, with the retired half named as retired in the same cell |

**No retired identifier appears anywhere in the new set as an active obligation.** Every
occurrence is a labelled retirement, a historical map entry, an obligation-trace row, or the
surviving half of a declared split.

### 16.6 Splits resolve to every successor; merges resolve each origin to a common successor

**Five split families**, located by the `Split n of N` marker required by §1.3:

| Family | N | Rows found | Halves | All successors resolve? |
| --- | ---: | ---: | --- | --- |
| `legacy-um:TD-UM-REG-05` | 2 | 2 | 1 `replace` → `test-design-epic-user-management-1.md` § Coverage · 2 `retire` → — | yes |
| `legacy-um:TD-UM-REL-04` / `-05` / `-06` | 3 | 3 | 1, 2, 3 — all `preserve` → `test-design-epic-mentorship-1.md` § Coverage | yes |
| `legacy-um:TD-UM-REL-07` | 2 | 2 | 1 → `…-user-management-4.md` § Coverage · 2 → `…-mentorship-1.md` § Coverage | yes |
| `fe-epic:R-FE-06` | 2 | 2 | 1 `preserve` → `…-user-management-2.md` § Risk · 2 `retire` → — (open product question, §10 U-13) | yes |
| `plat:PR-B-05 / OQ-105` | 2 | 2 | 1 `replace` → `test-design-architecture.md` § Ratified design decisions · 2 `preserve` → § Open blockers, re-pointed to `OQ-PERM-01` | yes |

**Every declared successor of every split exists.** The `TD-UM-REL-04/05/06` family is a
three-row split across three distinct source IDs — halves 1 of 3, 2 of 3 and 3 of 3 — and is
complete; a grouper keyed on the source ID alone will report it as three incomplete families,
which it is not.

**90 `merge` rows.** 48 carry an explicit `Origins:` enumeration. 33 of the remaining 42 name
their converging sources through a `§`-crossref to the section-level merge row that enumerates
them, or through convergence prose. The final **9** enumerate their origins *inside the row*, as
the sub-items of one source section converging on one destination (for example
`legacy-um:S1#testability-concerns-gates-to-fast-feedback`, whose cell names row 1, row 3 and
row 4 individually). **Every merge row's origins are recoverable; none is a dangling merge.** The
absence of the literal keyword `Origins:` in those 9 is a wording inconsistency, recorded here
rather than repaired, because editing them would change cells Task 5 keys on.

### 16.7 Can a fresh reader reach the right documents from the index alone?

Checked mechanically against `test-design/README.md`:

- **46 distinct `.md` paths** are named in the index. Every one resolves, except nine that are
  deliberately not paths: five naming *patterns* (`test-design-epic-{domain}-{number}.md`,
  `test-design-validation-report-epic-{domain}-{number}.md`, the stock
  `{test_artifacts}/test-design/{project_name}-handoff.md` template, and two line-wrapped
  fragments) and `test-design-epic-user-management-6.md`, which §4 of the index names **precisely
  because it does not exist**.
- **9 of 9** epic plans on disk are indexed in §3. **0** are missing.
- **9 of 9** epic checkpoints on disk have a matching indexed plan. **0** orphans.
- Each of the nine superseded artifacts is mentioned **exactly once** in the index, and **all nine
  mentions are inside §6**, the section that states they "are **not indexed above and are not
  current inputs**". **Zero** mentions appear anywhere in the navigational body (§§1–5).

**Conclusion: the index is sufficient.** A reader reaches the platform pair from §1/§2, the right
epic plan and its checkpoint from §3, the unplanned scopes and their owners from §4, and never
needs to open a superseded file to do it.

### 16.8 Consumers — Task 3e treatment applied

| Consumer (§13.2 class) | Treatment applied | Verified |
| --- | --- | --- |
| `_bmad-output/planning-artifacts/platform/epics.md` Story 1.6 | Artifact references updated to the canonical set with a `76a7220` reading rule; a **Recorded debt** block added. Sprint status, gate identities (`QUALITY-GATE-AC`, `QUALITY-GATE-AC-NFR`, `TT-IDENTITY-01`, `TT-PMDM-01`), the historical `gate-decision.json` anchor at `c342138`, the timetracker evidence caveat, coverage fields and FR mappings are **unchanged**. The story is **not** declared complete. | `node scripts/epic-id-guard.cjs --root .` → *OK — 37 epic and 134 story definitions across 13 files, 140 tracking keys across 5 files* |
| `_bmad-output/implementation-artifacts/platform/sprint-status.yaml:55` | **No change** — re-verified: the line is the tracking key `1-6-platform-test-design-refresh-v1-2-v1-5: backlog`, an identity, not an artifact path. §13.2's assessment stands. | read at `:55` |
| `test/trace-artifact-naming.test.cjs:17` | **No change** — re-verified: the guard governs only the four trace families (`traceability-matrix.md`, `e2e-trace-summary.json`, `tea-trace-coverage-matrix.json`, `gate-decision.json`) and its `:17` comment explicitly exempts test-design progress documents. No filename this migration introduces begins with a canonical stem. | `node --test test/trace-artifact-naming.test.cjs` → 2 pass, 0 fail |
| `…/global-coverage/chain-fix/unmapped-stories-classification.md` (`:180`, `:187`, `:570`) | **No change** — re-verified: all three make a coverage argument about `PLAT-E1-S1.6` and name no artifact path. | read at all three lines |
| `.claude/` + `.agents/` `bmad-testarch-test-design/**` (34 files) | **Not touched.** Task 4 owns this via `_bmad/custom/bmad-testarch-test-design.toml`. | — |

### 16.9 Historical citations — commit anchors added, original claims preserved

Applied only where a reused or removed filename would change a historical statement's meaning.
**No historical claim was rewritten, and no prior review's evaluation was altered.**

| Document | Hits | Action | Original claim preserved? |
| --- | ---: | --- | --- |
| `docs/superpowers/plans/2026-08-25-test-design-validation-fixes.md` | 60 filename citations across the five reused names (12 architecture · 17 qa · 9 progress-system · 10 validation-report · 12 handoff) | A **Citation anchor** block added above `**Goal:**`, stating that every artifact path in the plan resolves at `76a7220…`, giving the link form, and stating that the 2026-08-25 approval and PASS verdict belong to the pinned files only. | **Yes — byte-for-byte.** Nothing below the added block changed; not one of the 60 citations was repointed, reworded or deleted. |
| `…/sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md:166` | 1 (`test-design-progress-system.md`) | A labelled parenthetical appended **after** the existing sentence, giving the `76a7220` link and stating the reused filename now holds a different document. | **Yes.** The supersession sentence — that the audit supersedes the `865df5f` characterisations — is unchanged and still reads first. |
| `_bmad-output/specs/spec-access-control-test-cases/.memlog.md` | 1 (`test-design-qa-platform`) | A new dated `(correction)` entry **appended** to the log, anchoring the input at `76a7220…`. The 2026-08-29 entry is untouched, so the primary evidence for §6 F-3 is preserved exactly. | **Yes.** No existing memlog line was edited. |
| `docs/superpowers/plans/2026-08-20-tea-environment-setup.md` (`:17`, `:102`) | 2 | **No change needed** — both are the workflow *name* `test-design` and a skill path, not an artifact citation. Nothing about them changes meaning. | n/a |
| `…/sprint-change-proposal-2026-08-27.md` (`:28`, `:48`, `:78`, `:153`, `:227`) | 5 | **No change needed** — all five are the work-item phrase "Platform test-design". No filename appears. | n/a |
| `…/correct-course-2026-08-29-file-inventory.md:5` | 1 | **No change needed** — "TEA/test-design artifacts" as a category. | n/a |
| `…/platform/reviews/review-cross-slice-seams-2026-09-02.md:66` | 1 | **No change needed** — "a test-design refresh" as a category. The `PM-FR-15` false-closure warning is carried forward into the Story 1.6 debt block instead of being rewritten here. | n/a |

### 16.10 Verdict

| Acceptance clause (plan, Task 3, last checkbox) | Result |
| --- | --- |
| Each `preserve` / `merge` / `replace` item resolves | **PASS** — 514 of 514, with 5 destinations correctly deferred to Task 4 and named in 16.4a |
| Every `retire` item has authority and rationale | **PASS** — 51 of 51 |
| No retired item remains an active obligation | **PASS** — 21 identifiers checked across 24 files; 0 active reoccurrences |
| Splits resolve to every declared successor | **PASS** — 5 families, 11 rows, every successor exists |
| Merges resolve each origin to their common successor | **PASS** — 90 rows, origins recoverable in all 90 |
| A reader finds the system document and the epic plan from the index alone | **PASS** — 9 of 9 plans and 9 of 9 checkpoints indexed; all nine superseded files confined to §6 as non-inputs |

**Nothing failed to resolve.** Open items, none of which is a reconciliation failure: the five
Task 4 destinations (16.4a), the five anchor-name drifts (16.4c), and the nine merge rows lacking
the literal `Origins:` keyword (16.6).

**This reconciliation is the precondition D-2 names.** It is what makes the authorized removals
safe to perform, and it is deliberately re-runnable so Task 5 can repeat it rather than trust it.

### 16.11 D-2 removal — completed only after the clean reconciliation

The reconciliation above completed before any source was removed. Immediately afterward, the
worktree performed one `git rm` over exactly these nine superseded artifacts:

1. `test-design-architecture-platform.md`
2. `test-design-qa-platform.md`
3. `test-design/people-management-platform-handoff.md`
4. `test-design-progress-platform.md`
5. `test-design-validation-report-platform.md`
6. `test-design-epic-user-management.md`
7. `test-design-progress-user-management.md`
8. `test-design-epic-frontend.md`
9. `test-design-progress-frontend.md`

Each file existed immediately before removal; all 25 current destinations used by the
reconciliation existed; and the active index named none of the nine. Their historical content is
available at `76a7220…`. This records a structural deletion only: it grants no approval, changes
no scenario, executes no test, and creates no coverage or release claim.

## 17. Task 4 — workflow-routing destinations closed

Task 4 created both destinations that §16.4a recorded as forward references:

- `docs/test-design-workflow-contract.md` — the binding selection contract for Create, context
  loading, Edit, Resume and Validate;
- `_bmad/custom/bmad-testarch-test-design.toml` — the sparse team override that loads that
  contract as a persistent fact and requires scope resolution before any output is selected.

The existing `test_artifacts` and `test_design_output` roots remain unchanged. The override was
resolved with `--project-root .` through both `.agents/skills/bmad-testarch-test-design` and
`.claude/skills/bmad-testarch-test-design`; the effective workflow blocks were identical, the
two installed skill trees still passed `diff -qr`, and no personal override was present. Thus
all five Task 4 forward-reference rows in §16.4a now resolve to existing destinations. This is a
configuration and document-routing result only; it is not evidence that an LLM followed the
contract. Behavioral exercise status belongs to the Task 5 verification report.

---

## Appendix A — raw preparatory command output

Run in the migration worktree
`/private/tmp/.../scratchpad/migration-wt` (branch `docs/2026-09-10-test-design-consolidation`).

```
$ git rev-parse HEAD
76a7220701ac6f16843dad8b303934f9a958b54c

$ git status --short
?? docs/superpowers/plans/2026-09-10-test-design-consolidation-review.md
?? docs/superpowers/plans/2026-09-10-test-design-consolidation.md

$ git submodule status
-f1eea3c048821011da96fba20d9b517f7d0e4f1b services/backend
-fa3d3198aa9921c26d22307542ab72834a03b899 services/frontend
```

The leading `-` means the submodule is not initialised **in this worktree**. Read-only
inspection in the user's live checkout:

```
$ git submodule status            # live checkout
 f1eea3c048821011da96fba20d9b517f7d0e4f1b services/backend (heads/main)
 fa3d3198aa9921c26d22307542ab72834a03b899 services/frontend (heads/main)

$ git -C services/backend rev-parse HEAD   → f1eea3c048821011da96fba20d9b517f7d0e4f1b
$ git -C services/backend status --short   → (empty)
$ git -C services/frontend rev-parse HEAD  → fa3d3198aa9921c26d22307542ab72834a03b899
$ git -C services/frontend status --short  → (empty)
```

Both match the plan's audit pins. **No user work was modified**; the only writes in this
task are `_bmad-output/test-artifacts/test-design/migration-map.md` and
`_bmad-output/test-artifacts/test-design/README.md`, both inside the isolated worktree.

Supporting read-only inventory commands and their results:

```
$ find docs/test-cases/user-management -name '*.md' | wc -l          → 152
$ find docs/test-cases/access-control -name '*.md' | wc -l           → 0   (directory does not exist)
$ find docs/test-cases/access-control-foundation -name '*.md' | wc -l → 10
$ find docs/test-cases/access-control-kernel -name '*.md' | wc -l     → 91
$ find docs/test-cases/mentorship -name '*.md' | wc -l                → 28
$ find docs/test-cases/frontend -name '*.md' | wc -l                  → 58
$ diff -qr .agents/skills/bmad-testarch-test-design \
           .claude/skills/bmad-testarch-test-design                   → (no differences)
$ ls _bmad/custom/                                                    → bmad-sprint-planning.toml
                                                                        bmad-testarch-trace.toml
                                                                        bmad-validate-prd.toml
                                                                        config.toml
                                                                        (no bmad-testarch-test-design.toml)
```

**Not executed in this task** (and therefore asserted nowhere in this ledger):
`node scripts/epic-id-guard.cjs`, `node --test test/trace-artifact-naming.test.cjs`,
`uv run python _bmad/scripts/resolve_customization.py`, any test suite, any trace run, any
measurement run, any ClickUp operation.

## Appendix B — preparatory reads

| Document | Why it was read | What it settled |
| --- | --- | --- |
| `AGENTS.md` | Required by the plan | Trace-artifact canonical-naming and commit-anchored-citation rules (§0); the dual skill installation rule (§5.3); root `npm test` is a stub; architecture-authority precedence (PM spine default, bare `AD-n` = PM, ACF is slice-scope, historical PRDs are not current requirements). |
| `docs/architecture/README.md` | Required by the plan | The binding rule index and the 17 non-negotiables. Supplied the retirement authority for the registration/deactivation family (10, 15, 16, 17 → PM/AD-16, AD-19, AD-20, AD-21, AD-22) and the facade rule (7). |
| `docs/architecture/user-management-test-decisions.md` | Binding doc named by the plan | DEC-UM-001..012, including **RETIRED** DEC-UM-006/008, **REFRAMED** DEC-UM-003, **KEPT-reconciled** DEC-UM-007/009, and **draft** DEC-UM-012. This is the authority behind most of §4.3c and all of §5.4. |
| `docs/architecture/testing-strategy.md` | Binding doc | DEC-UM-010 isolation progression (§5.1); the `ACM9-MVP-v1` measurement protocol and its 500-target absolute gate (§7.1); the 2026-09-04 stage-approval removal (§6 F-12). |
| `docs/project-requirements.md` | Normative product authority (v1.5) | §7 All Employees ≤2 s at 500+ records including permission resolution (§6 F-1, §7.1); §2.2 HR Admin grants no data access. |
| `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md` | To separate NFR subjects | P6 measures `resolveAudiences` in milliseconds across graph depths and states it changes no CI timing threshold (§7.1). |
| `docs/superpowers/plans/2026-09-09-epic-number-collision-verification.md` | Required by the plan | The prior identity migration's 9 renumbered identities, the guard's clean result, and the standing rule that ClickUp live state is unverified. Confirms **nothing may be renumbered here** (§12). |
| Twelve `_bmad-output/planning-artifacts/*/epics.md` | Canonical epic sources | The epic inventory in §12, including the absence of a `frontend` domain and the superseded `ENG-E3`/`ENG-E4`. |
| `_bmad-output/planning-artifacts/platform/epics.md` Story 1.6 | Named consumer | Its exact deliverable references, gate identities and evidence caveat (§13.2, §6 F-7). |
| `_bmad/config.toml`, both `workflow.yaml` copies, both `customize.toml` copies | Workflow contract inputs | Output roots, the `project_name` space problem, the epic-output derivation, and the unconditional validation-report path (§5.3, §13.2). |

## 2026-09-11 current-state clarification — formal package sign-off

This migration map remains a point-in-time record of its source migration and validation. Its
earlier `ungranted` statements describe that historical state and are not rewritten. Current
state is the [2026-09-11 PM memlog decision](../../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md): the user's explicit Product Owner + Architect approval grants sign-off for `PR-S-01` / `CC-04` and `PR-S-02` / `CC-06`. PM/AD-19 and PM/AD-20 remain directions, not the approval. This clarification does not close `CC-04`, `CC-06`, `CC-07`, `CC-08`, `CC-09`, or `OPERATIONAL-ENVELOPE`, and makes no implementation, production, evidence, or release-readiness claim.
