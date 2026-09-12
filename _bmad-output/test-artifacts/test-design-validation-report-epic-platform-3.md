---
runScope: 'epic'
runKey: 'epic-platform-3'
epicId: 'PLAT-E3'
epicDomain: 'platform'
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicNumber: 3
operation: 'Epic Validate'
verdict: 'PASS'
supersedes: 'CONCERNS (2026-09-12), same path, pre-correction text'
date: '2026-09-12'
runBaseline: '83aeabfcd1a4679ffe952472eef4e5302ad85fac'
independence: 'self-validation — see Independence limitation'
---

# Epic Validation Report — PLAT-E3 Access Control Kernel MVP

**Verdict: PASS**, with three recorded WARNs and one independence limitation that materially
bounds what this verdict is worth. Read that section before relying on the verdict.

This run supersedes the CONCERNS report previously written to this same path. Per contract §5 it
inherits no verdict from its predecessor; per §4.5 it evaluates the corrected text at the hashes
below and writes only this report and the PLAT-E3 index entry.

## Identity and baseline

| Field | Value |
| --- | --- |
| Scope kind | `epic` |
| `runScope` / `runKey` | `epic` / `epic-platform-3` |
| Canonical epic ID | `PLAT-E3` |
| Domain | `platform` |
| Source path | `_bmad-output/planning-artifacts/platform/epics.md` |
| Epic heading | `## Epic 3: Access Control Kernel MVP` (one authoritative body; the `### Epic 3` at the Epic List is a summary) |
| Epic number | 3 |
| Run baseline (`HEAD` before first write) | `83aeabfcd1a4679ffe952472eef4e5302ad85fac` |

Identity metadata agrees across the plan, the checkpoint, the canonical source and the index. No
mismatch, so §3 permitted the run to proceed.

**Working tree was not clean at baseline.** Three files carried uncommitted edits from a
concurrent session — `test-design-epic-platform-1.md`,
`test-design-validation-report-epic-platform-1.md` and `test-design/README.md`. None is a PLAT-E3
evaluated output. The README is shared, so this run's index edit was applied on top of that
session's uncommitted PLAT-E1 entry rather than replacing it.

## Evaluated paths and content hashes

| Path | SHA-256 |
| --- | --- |
| `test-design-epic-platform-3.md` | `6829e6048f4b6369374b03db5ff24d63a5f5fc1b0c26518d8cb213f9521cd47c` |
| `test-design-progress-epic-platform-3.md` | `2ed800e21e80a854400f0042a84a49e2fb03450a523e75493c499e9e1e4fc202` |
| `test-design-architecture.md` | `133efa612ad55b012fc8be9bc6a77d1d6f55e4bbdba99a8ee0404acccb648ec5` |
| `test-design-qa.md` | `b9f95b0946054063df722f8b007577b37fa35893c0a2ba9cc35d5c6e69aad84c` |

The system pair is loaded as shared authority under §4.2. It is not re-validated here; its own
verdict remains `test-design-validation-report.md` (PASS, 2026-09-11).

## Independence limitation

**This is a self-validation.** The same session authored the corrections it is now validating.
That is not a formality:

- The first self-assessment of this plan declared all fourteen findings fixed. An independent
  audit then found **six defects**, two of them in the headline finding itself — the ACM-8
  conclusion was correct but both of its supporting citations were fabricated (wrong superseding
  story, wrong deletion commit), and the plan restated "no `AccessJournal` table exists" while
  `schema.prisma:106` defines it.
- Those six were fixed and each corrected citation was re-checked against primary sources
  (`git log --diff-filter=D`, `schema.prisma`, `blockers.yaml`, `user-management/epics.md`,
  `timetracker/epics.md`). The checklist evaluation below is clean **on that re-checked text**.
- The demonstrated failure mode was **provenance and attribution**, not design substance, and a
  self-validation is weakest exactly there.

**Recommendation:** treat this PASS as a checklist-completeness result, not as an independent
attestation. An independent Epic Validate, or a second audit of the citation layer, is advisable
before this plan is relied on as evidence.

## Checklist results

### Prerequisites — Epic-Level Mode · PASS

Canonical epic body with acceptance criteria present; platform system pair present and readable;
binding architecture documents available; requirements testable. `bmad-testarch-atdd` is not
auto-run.

### Step 1 · Context loading — PASS

Canonical epic source, system pair, `docs/project-requirements.md` v1.5, binding architecture
rules, `acm-4-disposition.yaml`, existing `test/access-control/` inventory and the ACM-9
measurement artifacts are all loaded and cited. Knowledge-base fragments are declared in the
plan's appendix and the checkpoint's `inputDocuments`. `nfr-criteria.md` is loaded; NFRs are in
scope.

### Step 2 · Risk assessment — PASS

Eight risks, all genuine failure modes rather than restated features. Categories use the
SEC/PERF/OPS/TECH/DATA/BUS vocabulary with a legend. Probability and impact are 1–3; every score
recomputed and correct (one 3×3=9, seven 2×3=6). Mitigations are specific, owners and timings
assigned. **Residual risk is documented** — the item the predecessor report flagged as missing —
and is honest where it matters: `R07` residual is stated as medium–high because the plan proves
same-process re-resolution only.

### Step 2A · NFR planning — PASS

Five categories in scope. Every stated threshold traces to a source rather than being invented:
the revocation wording is quoted from `project-requirements.md` §2.1 [NORMATIVE]; the ACM-9
figures come from the pair's Contract B definition including the per-shape independent-gate rule.
Unknown reliability and maintainability thresholds are marked UNKNOWN and not guessed.
NFR-derived risks (`R06`, `R07`) sit in the normal register.

### Step 3 · Coverage design — PASS

Acceptance criteria are decomposed to atomic scenarios and levels selected per boundary
(deploy-entrypoint, headless facade, module E2E, measurement) with no duplicate coverage. P0/P1
assigned with stated criteria. The **Acceptance-Criterion Traceability** table maps all 49
canonical acceptance criteria across Stories 3.1–3.8 to an obligation, an explicit superseded
marker, a named external owner, or an explicit scope exclusion — independently enumerated and
confirmed complete, with nothing invented.

*Checklist self-conflict, resolved:* Step 3 asks for "execution order (smoke → P0 → P1 → P2/P3)"
while Output Validation forbids exactly that tier ladder. The plan follows the Output Validation
rule (PR / Nightly / Weekly). Scored against the more specific rule.

### Step 4 · Deliverables — PASS

Risk matrix, coverage matrix, execution strategy, interval estimates, quality-gate criteria and
an NFR summary are present. Output written to the contract-resolved path.

### Output validation — risk matrix · PASS

IDs unique and domain-qualified (`PLAT-E3-R01`…`R08` rather than the generic `R-001`; consistent
and unambiguous). Categories, 1–3 scoring and arithmetic verified. Score-6+ risks marked.

### Output validation — coverage matrix · PASS with WARN

Requirements mapped to levels, priorities and risk links; owners assigned; no duplicate coverage.
**WARN — no test counts.** The checklist asks for realistic counts; the plan deliberately gives
scenario families and no counts, consistent with its no-coverage-percentage stance and `PR-009`.
Defensible, but it means the estimate cannot be checked against a scenario count.

### Output validation — execution strategy · PASS

Simple PR / Nightly / Weekly with no smoke/P0/P1 ladder, no test re-listing, and the "run
everything in PRs unless expensive" philosophy stated. Playwright parallelization is not noted
and is **not applicable** — PLAT-E3 is headless backend with no browser target.

### Output validation — resource estimates · PASS

All intervals: P0 ~40–64 h, P1 ~16–30 h, total ~56–94 h (~2–4 weeks). No false precision. The
execution-state caveat correctly reframes these as evidence work against already-shipped
behaviour rather than build effort.

### Output validation — quality gate criteria · PASS with WARN

P0 = 100 % covered and P1 = ≥ 95 % covered are carried verbatim from the pair, with the
access-control-suite clause restored and the *covered* ≠ *passes* distinction stated against the
`PR-009` coverage-state vocabulary. Bug-severity gate present as `PG-03`. Full NFR decision
deferred to `nfr-assess`.

**WARN — the pair's fourth bar is not carried.** `test-design-qa.md:1658` lists
"**≥ 80 % functional-requirement coverage**" in its Exit criteria. The plan quotes only the
three-threshold sentence from *Gate thresholds carried from the handoff* and never mentions the
80 % bar. Faithful to what it quoted, but a reader taking the plan's Design Quality Criteria as
the complete gate set would miss it.

### Quality checks — evidence, classification, priority, levels · PASS

Assessment is evidence-based with assumptions documented and open items named. Category
assignments match their definitions. Priority sections carry only criteria and purpose with no
execution context, and the note that priority ≠ execution timing is at the top of the coverage
plan. The P1-gates-P0 inversion is stated and reconciled against the Kernel Dependency Graph
rather than hidden. Level selection is appropriate with no redundancy.

### Integration points · PASS with WARN

Knowledge base: `risk-governance`, `probability-impact`, `test-levels-framework`,
`test-priorities-matrix` and `nfr-criteria` all consulted and cited in the appendix; the
not-applicable set is named with a reason.

**WARN — the checkpoint's input inventory is incomplete.** Six `pactjs-*` knowledge files exist;
`inputDocuments` lists five, omitting `pactjs-utils-zod-to-pact.md`. Immaterial to the design
(the whole Pact set is out of scope for a headless epic) but the inventory is not accurate.

### Accountability and logistics · PASS

Out-of-scope items are listed with reasoning and an owner or a named deferral identifier
(`UM-E0-S0.1`, `PM/AD-20`, `CC-07`, `FR-17` / `TT-E1-S1.2`, DEPT-2/DEPT-4). Entry criteria cover
environment, data and blocker prerequisites. Exit criteria define per-priority thresholds, the
`PG-03` defect gate and coverage sufficiency framing.

### Predecessor findings — all seven closed

| Finding | State |
| --- | --- |
| F-1 identifier collision | Closed. Plan and checkpoint both ACM-ordered (C01=ACM-0 … C08=ACM-9); all 84 plan and 20 checkpoint references resolve consistently. |
| F-2 unrecorded status caveat | Closed. Execution-state caveat records the tracker disagreement and reframes the estimate. |
| F-3 no AC traceability | Closed. All 49 ACs mapped; the five previously unnamed carry obligations. |
| F-4 restated thresholds | Closed in both files. The checkpoint line that still carried the *pass* conflation after the first pass is corrected. |
| F-5 priority inversion | Closed. Criteria stated, inversion reconciled with the dependency graph. |
| F-6 missing sections | Closed. Residual risk, `PG-03`, legend, per-priority criteria, KB appendix, `PR-001`/`PR-002`. |
| F-7 DEPT ownership / unpinned baseline | Closed. DEPT-2/DEPT-4 named; baseline pinned to the `3a3cd71` pair. |

## Checks not executed

- **Status File Integration** (test design logged in a "Quality & Testing Progress" section, epic
  number and completion timestamp recorded). Not executed: no such section exists in
  `platform/sprint-status.yaml`, and contract §5 forbids this workflow from changing sprint
  status. Recorded rather than silently skipped.
- **System-Level two-document validation**, the architecture/QA structural checklists, the
  anti-bloat and actionable-first structure checks, and **BMAD Handoff Validation**. Not
  applicable to an epic run (§4.1, §4.5); the pair's own structure was validated by
  `test-design-validation-report.md` (PASS, 2026-09-11).
- **Test execution.** No suite was run. Every statement here is document evaluation plus static
  source checking.
- **`PLAT-E4`.** Not evaluated — §4.2 forbids loading another epic's plan and §4.5 forbids writing
  another epic's report. Its `hr-admin` reconciliation remains open at both ends.
- **Rollback procedure.** Not applicable; the run succeeded.

## What this verdict does not grant

No approval. No coverage claim. No gate result. No release readiness. No assertion that any test
exists or passes. `approvalStatus` remains `ungranted`; human review is a separate act.

---

**Completed by:** Anna Pikula (session), acting as Master Test Architect
**Date:** 2026-09-12
**Epic:** `PLAT-E3` — Access Control Kernel MVP
