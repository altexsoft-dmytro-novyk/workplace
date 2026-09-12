# Test Design — Epic: Platform 1, Platform Spec v1.5 Alignment

> ## Status: **written, approved, validation PASS (2026-09-12).** This document retains its
> Create-run baseline and inherits no earlier run's approval or verdict.
>
> - **Approval:** granted by the requester on 2026-09-12; recorded in
>   `test-design-progress-epic-platform-1.md`.
> - **Validation:** **PASS (2026-09-12)** in
>   `test-design-validation-report-epic-platform-1.md`, which supersedes the pre-edit
>   CONCERNS attestation after F-1 through F-4 were corrected.
> - **Coverage:** none asserted. This document plans and records; it does not state that any
>   test or audit exists, that any suite passes, or that any gate is green. **No pass rate and
>   no percentage appears anywhere in it.**
> - **Provenance:** **no obligation was transferred into this plan.** Zero rows of
>   `test-design/migration-map.md` name this file as a target (machine-counted: **0**). The
>   obligations below are **newly stated by this Create run** from the epic's own acceptance
>   criteria. They are not migrated, not inherited, and carry no prior approval.

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `PLAT-E1` |
| Epic title | Platform Spec v1.5 Alignment |
| `epicDomain` | `platform` |
| `epicNumber` | `1` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/platform/epics.md` |
| Source heading | `## Epic 1: Platform Spec v1.5 Alignment` (authoritative body, `:240`); summary entry `### Epic 1: Platform Spec v1.5 Alignment` (`:128`, under `## Epic List`) |
| Stories in scope | `PLAT-E1-S1.1` … `PLAT-E1-S1.9` (all nine; the epic body defines no others) |
| `runKey` | `epic-platform-1` |
| Run baseline `HEAD` | `b3cc6de8d6944f3d4e7d4f3f1d9a2618fe6264a3` at this run's first write; the branch advanced to `28d8e2049d457b103cd7eee31587add7a970f4fc` mid-run — see § Run baseline |
| Tracker | `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` |

**Date:** 2026-09-11
**Mode:** Create, Epic-Level (`bmad-testarch-test-design`), routed by `docs/test-design-workflow-contract.md` §2.2
**Status:** Approved — validation **PASS (2026-09-12)**

**`epic-platform-1` is not `epic-platform-capabilities-1`.** `platform` and
`platform-capabilities` are two different canonical domain slugs with two different `Epic 1`
bodies, two different canonical epic IDs (`PLAT-E1` and `PMC-E1`) and two different source
files. They share the number `1` and nothing else, and may never share a file.

---

## Run baseline, and a commit that landed mid-run

This run's first write happened at `HEAD` = `b3cc6de8d6944f3d4e7d4f3f1d9a2618fe6264a3`. While the
run was in progress the branch `cursor/dira1-measurement-contract-a` advanced by one commit,
`28d8e2049d457b103cd7eee31587add7a970f4fc` *"docs: require test design for active epics"*, which
changed **two lines of the current-artifact index and nothing else** (`README.md` §3 preamble).

**Every input this plan is derived from was re-hashed after that commit and is byte-identical** —
`platform/epics.md`, `test-design-architecture.md`, `test-design-qa.md` and
`docs/project-requirements.md` all unchanged. The commit therefore does not invalidate anything
below. It is recorded because a baseline that silently moves is how a document starts describing
a tree it was not written against.

## Why this plan exists, when the index said no plan would be created

Commit `28d8e20` replaced the index §3 opening rule — *"A plan exists **only** for an epic that
received real transferred obligations"* — with **"Every active canonical epic has exactly one
Epic-Level test-design plan and one matching checkpoint."** That is the same policy this run was
given: **every active canonical epic gets its own test-design plan, whether or not the 2026-09-10
consolidation routed obligations to it.**

That commit did **not** update the blanket sentence further down the same section — *"No plan is
created for `UM-E8`, any `PLAT-E*` … because no obligation in the superseded set transfers to
them."* — which left §3 contradicting itself. **This run retires that blanket rule** and updates
the index in the same run, as `docs/test-design-workflow-contract.md` §4.1 requires.

**What is retired is the rule, not the fact behind it.** The factual half of the old sentence is
re-verified here and still holds: **no obligation in the superseded set transfers to `PLAT-E1`.**
That is why this plan states obligations derived from the epic's own acceptance criteria rather
than migrated ones, and why its § Obligation trace records **0 rows**.

---

## What this plan owns, and what it does not

This plan owns **the artifact-verification and risk coverage specific to `PLAT-E1`**. Everything
shared is owned elsewhere and is **referenced, never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| The `TR-*` normative coverage map (119 rows) | `test-design-qa.md` § Normative coverage map |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation; `docs/test-design-workflow-contract.md` §2 |

### The fact that determines this entire plan

**`PLAT-E1` ships no application code.** Its own body says so twice — *"This is **not** a fifth
user-management feature epic"* (`platform/epics.md:24`) and application code heads its
out-of-scope list (`:26`) — and its FR Coverage Map row is self-referential,
`| PLAT-E1 | PLAT-E1 | PLAT-E1-S1.1–S1.9 |` (`:108`), which is that table's way of recording an
epic that maps to no functional requirement. `planning-artifacts/global-coverage/chain-fix/
unmapped-stories-classification.md` §3.1 classifies `S1.1`, `S1.3`, `S1.4`, `S1.6` and `S1.9`
as documentation-alignment work at **high confidence**, and explains why attaching
`PM-FR-36/37/38` to `S1.6` would break `verify-coverage.py` check 2.

Three consequences follow, and they are the reason this plan looks unlike a feature epic's plan:

1. **The evidence levels available to this epic are `repository-audit` and `manual-review`.**
   There is no `api-e2e`, no `component`, and no `unit` obligation here, because there is no
   runtime surface to exercise. Level definitions live in `test-design-qa.md` § Evidence levels
   and what each one proves; this plan invents none.
2. **The subject under test is a document set, not a behaviour.** An obligation below is
   satisfied by a checkable statement in a named artifact — not by a passing assertion.
3. **Verifying a document says the right thing is not evidence that the system does the right
   thing.** This is `PR-009` in miniature and is stated explicitly in § Risks.

**A documentation-alignment epic is still worth test-designing.** Its acceptance criteria are
unusually checkable — most name a file, an ID, or an exact phrase — and several of them are the
only thing standing between a retired claim and its silent reintroduction.

---

## Story status at the run baseline

Read from `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` at
`b3cc6de`. **Recorded, not changed.** No sprint key, status value or coverage field is
written by this run.

| Story | Sprint key | Status at baseline |
| --- | --- | --- |
| `PLAT-E1-S1.1` Changelog Traceability Matrix | `1-1-changelog-traceability-matrix` | `backlog` |
| `PLAT-E1-S1.2` Platform PRD + Addendum Drift Close | `1-2-platform-prd-addendum-drift-close` | `backlog` |
| `PLAT-E1-S1.3` Access-Control SPEC + Stage-1 Suite Alignment | `1-3-access-control-spec-stage-1-suite-alignment` | `backlog` |
| `PLAT-E1-S1.4` Architecture Binding Updates | `1-4-architecture-binding-updates` | `done` |
| `PLAT-E1-S1.5` Dashboards + §4.4 v1.5 Fixed Facts | `1-5-dashboards-4-4-v1-5-fixed-facts` | `done` |
| `PLAT-E1-S1.6` Platform Test-Design Refresh | `1-6-platform-test-design-refresh-v1-2-v1-5` | `backlog` |
| `PLAT-E1-S1.7` UM Planning Residual | `1-7-um-planning-residual-non-epic-2-4-scope` | `done` |
| `PLAT-E1-S1.8` Doc Pass — Create-Path Removal | `1-8-doc-pass-create-path-removal-from-binding-docs` | `done` |
| `PLAT-E1-S1.9` Register Epic in Platform Sprint Status | `1-9-register-epic-in-platform-sprint-status` | `done` |

**`done` here means the sprint tracker says `done`.** It is not an approval, not a validation,
and not evidence that the obligations below are satisfied. Two of the five `done` rows carry
explicit caveats in their own source: `S1.9`'s `done` status **predates the corrected AC
oracle** (`platform/epics.md:260` — *record, do not re-key*), and `S1.4`'s binding updates rest
on `ARCH-ENV-01` / `ARCH-PROJ-WRITER-01`, both **closed at design with implementation
partial or absent**.

---

## Risks carried by this epic

Scores and rationale are **defined** in `test-design-architecture.md` § Risk register. This table
records which of them this epic is a mitigation owner for, and **re-scores nothing**.

| Risk | Category / score | Statement | Mitigation direction here |
| --- | --- | --- | --- |
| `plat:PR-009` | OPS 2 × 3 = **6** | Counting unexecuted access-control scenario documents as coverage creates false release confidence. Open — **less mitigated than in 2026-08-29**; the end-to-end CI job is `continue-on-error`. | **This epic is a mitigation owner, and also its sharpest test case.** `S1.3` rewrites access-control SPEC and Stage-1 scenario prose; `S1.6` refreshes the test-design artifacts that *report* coverage. Both edit the exact surfaces where a present-but-unexecuted document can be mistaken for tested behaviour. Mitigation direction: every obligation below is written so that satisfying it produces a **document statement**, never a coverage claim. Evidence level: `repository-audit`. The three coverage states are defined in `test-design-qa.md` § Coverage-state vocabulary and are not redefined here. |
| `plat:PR-005` | TECH **9** | TimeTracker contract defects. Blocked on `PR-B-08` / `TT-IDENTITY-01` / `TT-PMDM-01`. | **Referenced, not owned.** `docs/integrations/timetracker-external-api.json` is tracked at ratification baseline `76a7220`; the former untracked-file caveat is retired. File presence does **not** resolve the substantive identity or project/delivery-manager contract defects, which remain open under the two successor gates. |

**A risk this epic cannot mitigate, stated so it is not mistaken for one it can.** `S1.4` and
`S1.6` document the `GET /users` whole-row serialization seam (`ARCH-ENV-01`, PM/AD-34
`partial`). **Documenting a seam does not close it.** `test-design-architecture.md` records it
as a live testability gap — *"a correct section decision in the kernel does not imply a correct
payload at the HTTP edge"* — and that gap is discharged by projection evidence owned elsewhere,
never by this epic.

---

## Coverage — artifact verification

**Nothing below is a coverage claim.** Each row is an obligation with a named subject, a named
authority and a named evidence level. **No row asserts that the verification has been performed,
that it passed, or that the artifact currently satisfies it.**

Identifiers are namespaced `plat-e1:AV-*` (*artifact verification*). **They are new in this
document.** They do not appear in `migration-map.md`, they supersede nothing, and they must not
be read as renamed legacy IDs.

### `repository-audit` — mechanical, checkable against named files

| Obligation | Story | Priority | Subject | Authority |
| --- | --- | --- | --- | --- |
| `plat-e1:AV-01` | `S1.1` | `P1` | Every live `gates:` ID in `global-fr-epic-story-coverage.yaml` resolves to an ID in `blockers.yaml` — and resolves to a **current** ID, not a superseded historical one (`TIMETRACKER-CONTRACT`, architecture `OQ-118`, architecture `CC-11`). | `platform/epics.md:255`. Mechanical: both files are machine-readable. |
| `plat-e1:AV-02` | `S1.1` | `P1` | Mechanical blocker counts match `blockers.yaml` open/closed/superseded **at execution time** — narrative counts are not accepted. | `platform/epics.md:254`. The AC itself forbids a narrative-only check. |
| `plat-e1:AV-03` | `S1.1` | `P2` | Every `PLAT-E1-S1.x` resolves to an entry in `global-fr-epic-story-coverage.yaml`, **or** is recorded there as decision/gate-serving work with no PM-FR owner, with the modelling gap called out explicitly. | `platform/epics.md:259`. `unmapped-stories-classification.md` §3.1 is the current instance of that explicit record; check 2 of `verify-coverage.py` is why the exemption exists rather than a forced mapping. |
| `plat-e1:AV-04` | `S1.1` | `P2` | The superseded-ID mapping is documented in full, including `P-1…P-9` → `PLAT-E1-S1.1…S1.9`, **without re-keying** `S1.9`'s pre-oracle `done` status and **without rewriting** the 2026-08-27 SCP. | `platform/epics.md:260`, `:389`. The "record, do not re-key" clause is the load-bearing half. |
| `plat-e1:AV-05` | `S1.8` | `P1` | `docs/architecture/api-conventions.md` states no `POST /users` create route exists (expected phrases *"There is no `POST /users` create route"* and *"no `POST /users` employee-creation route"*), **and** owned sub-collection `POST /users/:id/<collection>` routes remain. | `platform/epics.md` `S1.8` AC 1. A phrase-level check with an explicit must-not-delete companion. |
| `plat-e1:AV-06` | `S1.8` | `P0` | `docs/architecture/database-schema.md` departure transaction (CC-06 / PM/AD-23) contains the phrase **"only open Action Items assigned to the departing person"**, matching `docs/project-requirements.md` CC-06 condition 6. | `platform/epics.md` `S1.8` AC 4. **`P0` because a drift here silently widens a destructive departure side effect** — the phrase is the boundary between closing the departing person's items and closing items merely authored by them. |
| `plat-e1:AV-07` | `S1.8` | `P2` | `DEC-UM-006` / `DEC-UM-008` remain **RETIRED**, `DEC-UM-003` remains **REFRAMED**, and `DEC-UM-001`, `-002`, `-003`, `-004`, `-005`, `-007` and **`DEC-UM-009`** are **kept**. | `platform/epics.md` `S1.8` AC 2. `DEC-UM-009` is called out as load-bearing for ACM-0 root-row reuse and **must not be retired** — a negative check that is easy to lose in a bulk cleanup. |
| `plat-e1:AV-08` | `S1.9` | `P3` | `platform/sprint-status.yaml` lists Epic 1 with keys `1-1-…` … `1-9-…` and global IDs `PLAT-E1-S1.1` … `PLAT-E1-S1.9`, and **no** Platform story is nested under UM `epic-1`…`epic-4` keys. | `platform/epics.md:389` and `S1.9` AC 2. |

### `manual-review` — judgement required, not mechanically decidable

| Obligation | Story | Priority | Subject | Authority |
| --- | --- | --- | --- | --- |
| `plat-e1:AV-09` | `S1.3` | `P0` | **No live empty-audience `403`** is presented as the current oracle in the access-control SPEC, Stage-1 scenarios, binding architecture prose, `user-management/epics.md`, or UM PRD FR-16/FR-17 text. Historical UMAC `403` text may remain **only** with an explicit superseded-by-PM/AD-24 annotation. | `platform/epics.md` `S1.3` AC 6. **`P0`: the denial oracle is the access-control contract's observable surface**, and a stale `403` in binding prose is the defect that encodes a wrong oracle into Stage-2 E2E. The 2026-09-01 decision record is **annotated, never rewritten** — that constraint is part of the obligation. |
| `plat-e1:AV-10` | `S1.3` | `P1` | The PM/AD-24 denial oracle is stated completely: 401 invalid/inactive session; 404 missing **or hidden-existence** target; 403 visible resource, forbidden feature/action; lists omit invisible rows; **hidden-target 404 precedes mutation permission checks**. | `platform/epics.md` `S1.3` AC 5. The ordering clause is the half most often dropped when the rule is summarized. |
| `plat-e1:AV-11` | `S1.3` | `P1` | **PM/AD-28 honesty:** no live claim that `matrix/full-profile-access/` scenarios exist; documents state the scenarios are **not authored** and require AD-1 dispatch. | `platform/epics.md` `S1.3` AC 7. This is `PR-009` stated as a single checkable sentence: a claimed-but-absent scenario set is the purest form of the risk. |
| `plat-e1:AV-12` | `S1.3` | `P2` | **Cross-slice editing license is respected:** Platform may annotate UM- and mentorship-owned planning artifacts for PM/AD-24 alignment **only**. Gate-alias changes in `mentorship/epics.md` are **out of scope**; canonical gate IDs live in `spec-mentorship-domain/SPEC.md` and its coverage companions. | `platform/epics.md` `S1.3`, cross-slice clause. A scope **negative** — the obligation is partly that certain edits did *not* happen. |
| `plat-e1:AV-13` | `S1.4` | `P1` | `ARCHITECTURE-SPINE` AD-10 and `docs/architecture/access-control.md` document **Reporting vs Project line** behaviour and department management as a manager-access relation; `access-control.md`'s short denial summary **links to** the complete PM/AD-24 rule rather than partially duplicating it. | `platform/epics.md` `S1.4` AC 1, 2, 8. The "link, do not duplicate" clause exists so a second, drifting copy of the oracle cannot appear. Reporting-chain depth is a real-world 5–10 levels; the split-line model, not a single transitive Manager line, is what the binding prose must describe. |
| `plat-e1:AV-14` | `S1.4` | `P2` | `OQ-118` → `ARCH-ENV-01` and `CC-11` → `ARCH-PROJ-WRITER-01` entries are marked **`superseded` with a pointer**, and are **not rewritten**. | `platform/epics.md` `S1.4` AC 5, 6. "Marked, not rewritten" is checkable and is the difference between a preserved history and a falsified one. |
| `plat-e1:AV-15` | `S1.2` | `P2` | The addendum drift register drops obsolete "pending v1.3" framing where v1.5 closed it; Pattern E states timetracker **required** and PeopleForce **good-to-have prefill only**; memlog assumptions still citing v1.2 as authoritative are corrected or struck. | `platform/epics.md` `S1.2` AC 1–3. |
| `plat-e1:AV-16` | `S1.5` | `P3` | `docs/architecture/dashboards.md` records the Unassigned bucket, risk "active" ≠ `low`, and project-line counter implications as **fixed product facts**, while the engine/widget model remains **TBD** with no improvised implementation. | `platform/epics.md` `S1.5` AC 1, 2. The TBD half is an obligation: inventing an engine design would satisfy the first clause and violate the second. |
| `plat-e1:AV-17` | `S1.6` | `P1` | Platform test-design artifacts cite **v1.5 / current SoT**, name the post-consolidation canonical set exactly, and anchor any claim about what the superseded artifacts *said* to commit `76a7220701ac6f16843dad8b303934f9a958b54c`. | `platform/epics.md` `S1.6` AC 1. Four canonical filenames **reuse** a filename that previously held different content — the commit anchor is what stops a statement about the old document from silently describing the new one. |
| `plat-e1:AV-18` | `S1.6` | `P1` | **`QUALITY-GATE-AC` (P0)** is cited against `gate-decision.json` at `c342138` **with its current evaluated state recorded as open debt** — `gate_status=FAIL`, `p0_status=NOT_MET`, `critical_open: 1`, ACM3-II-06 uncovered — and not papered over. | `platform/epics.md` `S1.6` AC 4. The obligation is to **record a failing gate as failing**. Gate identity and thresholds are owned by `test-design-qa.md` § Release and design gates. **No gate is asserted green here, and none is invented.** |
| `plat-e1:AV-19` | `S1.6` | `P1` | **`QUALITY-GATE-AC-NFR`** ACM-9 Contract-B evidence is tracked **separately** from the functional P0 gate, with the [baseline JSON](https://github.com/altexsoft-dmytro-novyk/workplace/blob/3a3cd71884bf62d8c56577da1b4b36f2a8b327a3/_bmad-output/test-artifacts/performance/acm9-baseline-acm9-1788721821722-afd2fdac4a45.json) and [final JSON](https://github.com/altexsoft-dmytro-novyk/workplace/blob/3a3cd71884bf62d8c56577da1b4b36f2a8b327a3/_bmad-output/test-artifacts/performance/acm9-final-acm9-1788722145229-13b089a4cb9f.json) at commit `3a3cd71884bf62d8c56577da1b4b36f2a8b327a3`. | `platform/epics.md` `S1.6` AC 5, read with **U-25 resolved**: `QUALITY-GATE-AC-NFR` governs **contract B (ACM-9 facade) only**. Neither artifact discharges functional P0 or Contract A / `PG-04`. |
| `plat-e1:AV-20` | `S1.6` | `P2` | Live coverage gates use `TT-IDENTITY-01` and/or `TT-PMDM-01`, **not** superseded `TIMETRACKER-CONTRACT`; TimeTracker OpenAPI provenance is anchored at tracked baseline `76a7220`, while both successors remain substantively open. | `platform/epics.md` `S1.6` AC 6, 7. Pairs with `plat:PR-005` in § Risks; the former untracked-contract caveat is retired. |
| `plat-e1:AV-21` | `S1.7` | `P3` | `spec-user-management-test-cases` CAP-1 is retired/superseded in favour of seed scenarios and the registration folder disposition matches `S1.1`, **without changing UM Epics 0–5 feature scope**. | `platform/epics.md` `S1.7` AC 1–3. The scope negative is explicit in the AC: denial-oracle alignment belongs to `S1.3`, not here. |

**Priorities are this plan's own, derived from the consequence of the stated drift.** They are
not inherited from a legacy priority table and they re-score no risk. The `risk_threshold: p1`
configured in `_bmad/tea/config.yaml` is a reporting threshold, not an instruction to suppress
the `P2` / `P3` rows above.

---

## `S1.6` completion boundary

At the 2026-09-11 Create-run baseline, consolidation alone updated artifact identities and
dependency references only; it did not satisfy an S1.6 acceptance criterion. That historical
boundary remains true. The subsequent **U-16 resolution (2026-09-12)** records the story as
**satisfied for bounded documentation/evidence work**: the canonical artifacts record the
historical functional-P0 debt at `c342138`, paired Contract-B evidence at `3a3cd71`, and corrected
TimeTracker provenance. Its sprint key is therefore `done`.

This bounded completion does **not** close `QUALITY-GATE-AC`, `TT-IDENTITY-01`, `TT-PMDM-01`,
`PM-FR-15`, any product requirement, or a release condition. The warning against falsely using
documentation completion as product or runtime closure remains in force. This plan's original
Create run was not itself S1.6 execution; the later evidence refresh and explicit decision are
what close the documentation story.

---

## NFR

**This epic carries no epic-local NFR measurement obligation, and none is invented.** It ships
no runtime surface, so it has no latency, throughput or resource behaviour of its own to
measure. What it has are **documentation obligations about other scopes' NFR contracts**
(`plat-e1:AV-18`, `AV-19`, `AV-20`), which is a different thing.

**The three performance contracts must stay separate** — owned by `test-design-qa.md` § NFR
measurement contracts, referenced and not restated:

- **A** — the All Employees list including permission resolution (v1.5 §7, release gate
  `PG-04`), harness **`DIRA1-MVP-v1`**.
- **B** — the **ACM-9** AccessControl facade resolver: a binding protocol with its own
  thresholds, and the subject `QUALITY-GATE-AC-NFR` governs (**U-25 resolved**). Its CI job is
  **deliberately informational and must not be promoted to blocking** as a mitigation for
  anything in this plan.
- **C** — the **P6** `resolveAudiences` measurement, which is **not a gate** and cannot become
  one.

They share a "500" and a "2 seconds" and nothing else. **B and C are not evidence for A.** No
obligation in this plan runs a harness, records a measurement artifact, or reads one as
evidence.

---

## Gate

**No gate routes to this plan, and none is invented.** `plat-e1:AV-18` and `AV-19` are
obligations to *state a gate's identity and evaluated state correctly in a document* — they are
not the gate, they do not evaluate it, and satisfying them moves no gate.

Gate identity, thresholds and the `allow_gate=false` boundary are owned by `test-design-qa.md`
§ Release and design gates. **No gate is asserted green here.** The whole-repository trace
remains a planning audit with `allow_gate=false`.

**`PG-01` is not schedulable today**, and nothing in this plan changes that. Its
per-file-approval rationale is retired; its conclusion rests on three currently open blockers
(`SEC-AUTH-01` P0, `CC-07` P0, `AC-S9-S13` / `AC-SECTION-MATRIX-01` P1), and it is schedulable
when all four are closed **at implementation** (U-20 resolved).

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. **This plan states no
separate thresholds and ticks no boxes.**

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. **No trigger in that map names this
epic**, which is consistent with an epic that has no runtime surface: a documentation-alignment
change cannot regress a behaviour.

**The regression this epic can cause is different in kind, and is worth naming.** Its stories
edit *binding* documents — the denial oracle, the spine, `access-control.md`, `database-schema.md`,
`api-conventions.md`. A wrong edit there does not fail a test; it silently re-specifies the
system, and downstream Stage-2 E2E encodes the wrong oracle. That is precisely why
`plat-e1:AV-06` and `AV-09` are `P0` and why `AV-12` and `AV-14` are stated as negatives.

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-16** | **Resolved 2026-09-12** — `PLAT-E1-S1.6` is satisfied as bounded documentation/evidence work. Its closure records historical P0 debt, Contract-B evidence and corrected TimeTracker provenance; it does not close a gate, runtime dependency or product requirement. | Platform epic owner |
| **U-25** | **Resolved** — `QUALITY-GATE-AC-NFR` = contract **B** (ACM-9) only; `PG-04` = contract **A**. Recorded because `AV-19` depends on it. | Platform epic owner + QA |
| **U-24** | **Resolved** — harness `DIRA1-MVP-v1` (`docs/architecture/testing-strategy.md` § DIR-A1). | Platform / DevOps + QA |
| **U-18** | **Resolved 2026-09-11** by the document's owner (Architect): `testing-strategy.md:84` and `:117–119` now match the authority at lines 25–38. Recorded because `PR-009` and `plat:DG-01` both cite it; the matching record in `test-design-architecture.md` is also resolved. | Owner of `docs/architecture/testing-strategy.md` |
| **`PR-B-08`** | TimeTracker contract defects — `docs/integrations/timetracker-external-api.json` is tracked at ratification pin `76a7220`, but `TT-IDENTITY-01` and `TT-PMDM-01` remain open on substantive contract defects. Blocks `plat:PR-005`; scoped into `AV-20` as a successor-gate and provenance obligation. | Platform + Integration owner |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.**

**Machine-counted at the moment this section was written: `grep -c "test-design-epic-platform-1"
_bmad-output/test-artifacts/test-design/migration-map.md` → `0`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| — | **0** | — | — |

**Zero is the expected count, not an error.** The 2026-09-10 consolidation redistributed the
*superseded User Management and frontend* artifacts; `PLAT-E1` was never a source or a
destination in that set. `migration-map.md:1685` nevertheless reserves the canonical filename
form `test-design-epic-platform-{1..8}.md` for this domain, which is the name this plan uses.

**Net-new cases routed to this plan: 0.** The 21 `plat-e1:AV-*` obligations are
artifact-verification obligations, **not test cases**, and must never be added to the net-new
case counts in `test-design-qa.md` § Planning volume or § Effort. They contribute to no
category-1, category-2 or category-3 figure, and this plan changes none of those totals.
