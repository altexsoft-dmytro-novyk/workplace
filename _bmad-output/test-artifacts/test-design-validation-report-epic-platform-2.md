---
epicId: 'PLAT-E2'
epicDomain: 'platform'
epicNumber: 2
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicSourceHeading: '## Epic 2: Access Control Foundation'
runKey: 'epic-platform-2'
validationScope: 'epic'
validationDate: '2026-09-11'
runBaselineHead: '28d8e2049d457b103cd7eee31587add7a970f4fc'
verdict: 'CONCERNS'
---

# Test Design Validation Report — Epic `PLAT-E2` (Access Control Foundation)

**Scope kind:** `epic` · **Identity tuple:** `PLAT-E2` · domain `platform` · number `2` ·
`_bmad-output/planning-artifacts/platform/epics.md` `## Epic 2: Access Control Foundation`
**Run key:** `epic-platform-2`
**Repository `HEAD` (captured before this run's first write, run baseline):** `28d8e2049d457b103cd7eee31587add7a970f4fc`

> **What this report is not.** It grants no approval, asserts no coverage achieved, and changes no
> sprint status, gate, ClickUp mapping, or service code. Per `docs/test-design-workflow-contract.md`
> §5, `workflowStatus: generated` on the plan's checkpoint means only that documents were written;
> this validation evaluates the plan's internal quality and its alignment with the epic's stated
> requirements and Story `ACF-1` acceptance criteria — nothing more.

**Focus requested:** validate the plan against the epic's requirements and story acceptance
criteria; identify coverage gaps, missing scenarios, and misalignment with acceptance criteria.

---

## Evaluated artifacts and content hashes

Working-tree content at the time of this validation (the repository has uncommitted changes on
several of these paths relative to `HEAD` above; the hash is of what was actually read).

| Artifact | Role | SHA-256 |
| --- | --- | --- |
| `_bmad-output/test-artifacts/test-design-epic-platform-2.md` | Evaluated epic plan | `4785169572be84330d954b07afed4220252657575d40374fdfafae68a40b736f` |
| `_bmad-output/test-artifacts/test-design-architecture.md` | Canonical system pair (architecture) | `4fd5d91a6b47b347ba7056d963c7bb928828270cc94bb717cedab0955d44b565` |
| `_bmad-output/test-artifacts/test-design-qa.md` | Canonical system pair (QA) | `df186148b1b5e3c128c991362f09c791a524030c8518904e277221ca4f1a37fd` |
| `_bmad-output/test-artifacts/test-design-progress-epic-platform-2.md` | Epic checkpoint (identity cross-check only, not itself evaluated for content quality) | `a6a273de395368f59ae43d0510bef9118b5ab0c3f03c315970c61346aeff330e` |
| `_bmad-output/planning-artifacts/platform/epics.md` | Canonical epic source (`## Epic 2`, Story 2.1 / `ACF-1` acceptance criteria) | `45cc660d3adffb0d67012367d340ba0611bc5be11e4824be1de2657408b6c7aa` |
| `_bmad-output/test-artifacts/test-design/README.md` | Current-artifact index (read for scope resolution; updated by this run — see below) | `04158caa3d7026c42c6cb3a59b11f7447cfc26de04de8c34c0c100732534a0c9` |

Also read, not hashed (supporting context, not themselves evaluated outputs): `SPEC.md` for
`spec-access-control-audience-foundation`, the 9 Stage-1 scenario documents under
`docs/test-cases/access-control-foundation/` and their README, and the epic checkpoint's identity
metadata.

**Identity cross-check:** the plan's frontmatter, the checkpoint's frontmatter, and the canonical
source heading all agree on `PLAT-E2` / `platform` / `2` / `## Epic 2: Access Control Foundation`.
No mismatch found.

---

## Scope resolution (contract §3)

1. Index and routing contract read.
2. User supplied the exact target file `test-design-epic-platform-2.md`, which resolves uniquely to
   `runKey epic-platform-2` per the index's §3 Epic-scope table.
3. Canonical source verified: `epics.md` contains exactly one authoritative body at `## Epic 2:
   Access Control Foundation` (the `### Epic 2` occurrence inside `## Epic List` is a summary
   mention, not a second body).
4. Per contract §4.5, this is an **epic Validate**: evaluates the canonical system pair plus the
   selected epic plan, writes `test-design-validation-report-epic-platform-2.md` (this file) and
   the epic's index entry. No system or other-epic report is written or modified.

---

## Checklist results

### Prerequisites (Epic-Level Mode)

| Item | Result |
| --- | --- |
| Story markdown with clear acceptance criteria exists | PASS — Story 2.1 (`ACF-1`), 5 acceptance criteria, `epics.md` lines 400–414 |
| PRD or epic documentation available | PASS — `epics.md` `## Epic 2`; `SPEC.md` for `spec-access-control-audience-foundation` |
| Architecture documents available (system pair) | PASS — both loaded |
| Requirements are testable and unambiguous | PASS, with one exception — see **Finding F-1** (Self-exclusivity phrasing) |

### Step 1 — Context Loading

PASS. Index, contract, canonical epic source, canonical system pair, `SPEC.md`, the 9 scenario
documents, and cross-epic evidence sources were all loaded per the checkpoint's own Step 2 record,
and independently re-verified for this validation.

### Step 2 — Risk Assessment

PASS. 9 risks, unique IDs, correct category assignment (SEC/TECH/PERF/OPS), P and I both in
{1,2,3}, scores computed correctly (spot-checked: `R-PLAT2-01` 3×3=9, `R-PLAT2-02` 3×2=6,
`R-PLAT2-07` 3×1=3), high-priority (≥6) risks flagged and given owners/timelines, residual risk
stated for `R-PLAT2-01` (open until `SEC-AUTH-01` closes — consistent with `blockers.yaml` and both
system-pair documents; see Cross-Document Consistency below).

### Step 2A — NFR Planning

PASS. Contracts A/B/C kept separate and consistently described against the system pair. Two
thresholds (DB-timeout headroom, `SQLSTATE 57014` classification) are explicitly `UNKNOWN` rather
than invented.

### Step 3 — Coverage Design

**CONCERNS.** See **Findings F-1 through F-4** below — this is the section the requested review
targeted, and it is where the substantive gaps live. Positive findings: no duplicate coverage across
levels (explicit non-duplication with `PLAT-E3`'s kernel suites), priorities assigned to every
scenario, P0 criteria correctly applied to genuinely blocking items, execution order defined.

### Step 4 — Deliverables Generation

PASS. Risk matrix, coverage tables, execution order, interval-based resource estimates, quality
gate criteria, and NFR summary are all present; output was written to the contract-mandated path.

### Output Validation — Risk Assessment Matrix / Coverage Matrix / Quality Gate Criteria

PASS for the Risk Assessment Matrix (see Step 2 above). **CONCERNS** for the Coverage Matrix's "all
requirements mapped to test levels" criterion — see Finding F-1/F-2. Quality Gate Criteria: PASS
(100% P0 / ≥95% P1 / ≥90% P2-P3, high-risk mitigation required, NFR evidence deferred to
`nfr-assess`, none evaluated by this document as required).

### Execution Strategy

**CONCERNS.** See **Finding F-5**: the plan's "Execution Order" section is structured as
Smoke/P0/P1/P3+measurement tiers, not the PR/Nightly/Weekly structure the checklist specifies for
this section, and the checklist's own "Common Issues" note ("Don't create smoke/P0/P1/P2/P3 tier
structure") names exactly this pattern.

### Resource Estimates

PASS. All four priority bands and the total use interval ranges (e.g. "~14–22 h", "~25–42 h"); no
false-precision exact numbers found.

### Priority Assignment Accuracy

PASS. P0–P3 section headers carry only "Criteria," no execution-timing language; execution timing is
correctly isolated to the separate Execution Order section.

### Test Level Selection

PASS. Facade/component-level assertions used throughout in preference to HTTP/E2E, consistent with
`R-PLAT2-01`'s finding that the HTTP layer is not trustworthy evidence for this epic; no misuse of
E2E for non-critical paths.

### Evidence-Based Assessment

PASS. Every risk and mitigation cites a concrete artifact (commit hash, blocker ID, scenario
document, or measurement file); no speculative business-impact language found.

### Cross-Document Consistency

PASS, with one asymmetry noted for information. `SEC-AUTH-01` is referenced identically (P0, open,
blocks shared-environment deployment) across the epic plan, `test-design-qa.md`, and
`blockers.yaml`. The epic plan's account of the `test-design-qa.md` § U-19 same-day correction
(removing the `(invalidated)` markers on `ACF-FC-01`/`ACF-FC-02`) matches that document's own
"Post-validation correction" note. **Asymmetry (not a defect):** `test-design-architecture.md`
contains zero references to `PLAT-E2`, `ACF-`, or `epic-platform-2` — the architecture doc is a
system-level, cross-epic risk/testability baseline and is not required to name every epic by ID, so
this is recorded as an observation, not a finding.

### Not in Scope / Entry / Exit Criteria

PASS. Each excluded item carries reasoning and a mitigation pointer; entry/exit criteria are stated
as checkboxes with three already correctly ticked to reflect the same-session `ACF-RW-01..03`
completion, and the plan correctly marks `SEC-AUTH-01` closure as explicitly **not** an exit
criterion for this epic's test design.

### Document Quality (Anti-Bloat)

PASS. No repeated boilerplate notes, professional tone, no AI-slop markers, length proportionate to
a single-story rework plan.

---

## Findings — coverage gaps, missing scenarios, and AC misalignment

These are ranked by how directly they affect whether Story `ACF-1`'s 5 acceptance criteria are
actually covered by the plan's Test Coverage Plan (P0–P3 tables), which is what was asked.

### F-1 (Medium) — Acceptance Criteria 4 and 5 have no verification mechanism in the plan at all

Story 2.1's acceptance criteria include two boundary/non-goal clauses:

- AC4: *"No User Management controller, guard, adapter, or frontend file changes are included."*
- AC5: *"No Project, Department, PP HR-line, shared-link, full-profile, functional-permission, or
  section-matrix decision is enabled by this story."*

The plan's "Not in Scope" table gives reasoning for each excluded capability, and `ACF-FC-02`
provides scenario evidence for the PP HR-line sub-clause of AC5 specifically. But nothing in the
Test Coverage Plan (P0–P3) verifies AC4 at all, and nothing verifies the remaining five sub-clauses
of AC5 (Project line, Department, shared-link, full-profile, functional-permission, section-matrix)
beyond narrative assertion. This repository has a working precedent for exactly this class of
acceptance criterion: `test-design-epic-platform-1.md` states 21 `plat-e1:AV-*`
artifact-verification obligations at `repository-audit` / `manual-review` evidence level for
documentation-alignment claims that are not runtime behavior. `PLAT-E2` has no equivalent obligation
for AC4/AC5, so a reader cannot tell from the plan itself what evidence would satisfy them, or that
any is planned.

**Recommendation:** add one or two lightweight `repository-audit` obligations (e.g., "confirm no
file under `services/backend/src/user-management/**` or a frontend path changed in the `ACF-1`
delivery commit(s)") to the P2/P3 band, mirroring the `plat-e1:AV-*` pattern, or explicitly state in
the plan that AC4/AC5 are considered self-evidencing by the absence of such commits and name where
that absence is recorded.

### F-2 (Medium) — No acceptance-criteria-to-scenario traceability table inside the epic plan itself

The plan traces its P0–P3 test rows to **risk IDs** (`R-PLAT2-*`) and, indirectly through the
scenario documents' own `**Trace:**`/`**U-19 normative coverage:**` lines, to **PRD-level `TR-*`
rows** in `test-design-qa.md`. It never states, in one place, which of Story 2.1's five acceptance
criteria each planned test row satisfies. Manually reconstructing that mapping for this validation:

| AC | Coverage |
| --- | --- |
| AC1 (audience restricted to the 4 values; **Self exclusive**) | `ACF-AU-R1` (Self/direct/transitive/PP), `ACF-RW-01` (colleague) — see **F-1's sibling, F-4** below on Self-exclusivity specifically |
| AC2 (Reporting only live `direct` edges; PP only the assigned edge, not the PP's own chain) | Well covered: `ACF-FC-01` (broken edge doesn't bridge), `ACF-FC-02` (PP doesn't inherit through Paula's manager chain) |
| AC3 (empty input → no DB query; broken/orphaned data reduces, never grants) | Well covered: `ACF-FC-03` (zero queries), `ACF-FC-01`/`ACF-FC-02`/`ACF-FC-04` (fail-closed family) |
| AC4 (no UM file changes) | **Not covered** — F-1 |
| AC5 (no Project/Department/…/section-matrix decision enabled) | **Partially covered** (PP HR-line only) — F-1 |

AC2 and AC3 are genuinely well covered; the gap is concentrated in AC4/AC5 and the exclusivity half
of AC1. This table itself is offered as a starting point for the plan's own Edit pass, not as a
replacement for one.

### F-3 (Low) — `PLAT-E2` risk register score cross-check

Independently recomputed: all nine `P × I` products match the stated scores, and every ≥6 score
appears in the High-Priority table with none omitted or misplaced into Medium. No defect found;
recorded to show the check was actually performed rather than assumed.

### F-4 (Low) — Self-exclusivity assertion strength is unstated

AC1's clause "Self is exclusive of other audiences" is a distinct, testable claim: even where a
person could independently qualify for another audience toward themselves (a self-referencing edge,
however unlikely given the schema's CHECK constraint), Self must still be the only label returned.
The existing `ACF-AU-01` scenario and the planned `ACF-AU-R1` rework both describe the Self case only
as "the read is allowed" / "re-express as a facade audience-set assertion" — unlike `ACF-RW-01..03`,
whose Notes explicitly commit to an exact-set assertion ("yields `{colleague}`, not `403`"), `ACF-AU-
R1`'s Notes column does not say whether the Self case will assert the resolved set equals exactly
`{self}` (satisfying "exclusive") or merely contains `self` (which would not). This is plausible,
not confirmed, since the test does not yet exist.

**Recommendation:** when `ACF-AU-R1` is implemented, its Self case assertion should be
`expectAudienceLabels(...) === {self}` (exact-set equality), and the plan's Notes column should say
so explicitly so the exclusivity clause of AC1 is traceably covered rather than incidentally covered.

### F-5 (Low, process) — Execution Order section uses tiered structure the checklist flags as an anti-pattern

The plan's "Execution Order" section is organized as Smoke / P0 (<5 min) / P1 (<5 min) / P3 +
measurement, mirroring its own priority bands. The workflow checklist's Execution Strategy section
is explicit that this section should use a simple PR / Nightly / Weekly structure "NOT complex
smoke/P0/P1/P2 tiers," and separately lists "smoke/P0/P1/P2/P3 tier structure" under Common Issues
as something to avoid. The plan's content is not wrong (everything functional does fit the PR
budget, and the one opt-in measurement item is correctly kept out of any gate), only its structure —
relabeling the same four groups as "Every PR" and "Nightly/on-demand" would satisfy the checklist
without changing what is planned.

---

## Overall verdict: CONCERNS

No finding here contradicts the plan's own stated state (approval ungranted, validation previously
not run, coverage none asserted), and none invalidates the `ACF-RW-01..03` rework already completed
and evidenced same-day. The risk register, NFR handling, resource estimates, and fail-closed/AC2/AC3
coverage are sound. The concerns are specific and addressable in a single Edit pass before human
approval:

1. Add explicit (even minimal) verification for AC4 and the non-PP-HR-line clauses of AC5 (F-1).
2. Add an AC-to-scenario traceability note inside the plan itself so F-2's table does not have to be
   reconstructed by a future reader (F-2).
3. Commit `ACF-AU-R1`'s Self case to an exact-set assertion in the Notes column (F-4).
4. Relabel the Execution Order section's tiers to PR / Nightly-or-on-demand (F-5).

None of these require new risk analysis or a change to the risk register, coverage counts, or
resource estimates already stated.

## Checks not executed

- No test suite was run; this validation is a document-quality and AC-alignment review, not test
  execution. `services/backend/test/access-control/audience-resolution.e2e-spec.ts`'s current pass
  state was not re-verified here.
- The `plat-e1:AV-*` precedent cited in F-1 was read for pattern comparison only; `PLAT-E1`'s own
  validation status was not re-evaluated.
- BMAD Handoff Validation checklist section: not applicable — epic-level validation writes no
  handoff (system-scope only, per contract §4.1).
- System-Level Mode two-document structural checklist (Quick Guide tiers, Purpose statement
  placement, etc.): not applicable to an epic plan; the system pair's own structure was last
  validated by `test-design-validation-report.md` (PASS, 2026-09-11) and is not re-validated here.

---

**Completed by:** Anna Pikula (session), acting as Master Test Architect
**Date:** 2026-09-11
**Epic:** `PLAT-E2` — Access Control Foundation
