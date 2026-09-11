---
epicId: 'PLAT-E3'
epicDomain: 'platform'
epicNumber: 3
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicSourceHeading: '## Epic 3: Access Control Kernel MVP'
runKey: 'epic-platform-3'
validationScope: 'epic'
validationDate: '2026-09-12'
runBaselineHead: '367750e46861cbc43772ff701531cfa33801cfdd'
verdict: 'CONCERNS'
---

# Test Design Validation Report — Epic `PLAT-E3` (Access Control Kernel MVP)

**Scope kind:** `epic` · **Identity tuple:** `PLAT-E3` · domain `platform` · number `3` ·
`_bmad-output/planning-artifacts/platform/epics.md` `## Epic 3: Access Control Kernel MVP`
**Run key:** `epic-platform-3`
**Repository `HEAD` (captured before this run's first write, run baseline):** `367750e46861cbc43772ff701531cfa33801cfdd`

> **What this report is not.** It grants no approval, asserts no coverage achieved, states no pass
> rate, and changes no sprint status, gate, scenario file, trace artifact, service code, gitlink, or
> ClickUp mapping. Per `docs/test-design-workflow-contract.md` §5, `workflowStatus: generated` on the
> plan's checkpoint means only that documents were written. This validation evaluates the plan's
> internal quality and its alignment with the canonical epic's stated acceptance criteria and the
> platform pair's shared policy — nothing more. The plan remains **approval ungranted** after this
> run; validation and approval are separate states.

---

## Evaluated artifacts and content hashes

Working-tree content at the time of this validation. The evaluated plan and its checkpoint are
**untracked** relative to the baseline `HEAD` above; the hash is of what was actually read.

| Artifact | Role | SHA-256 |
| --- | --- | --- |
| `_bmad-output/test-artifacts/test-design-epic-platform-3.md` | Evaluated epic plan | `44a3dd6df3bc3d70fb5c457d2783b57aa4d407bd69ad94a3739f2e6d8bf38cb6` |
| `_bmad-output/test-artifacts/test-design-progress-epic-platform-3.md` | Epic checkpoint (identity cross-check **and** ID-consistency cross-check — see F-1) | `3081584ee6db8db037d13696301747832b9af7bc8ba4b79e7fb20dd72395ae1b` |
| `_bmad-output/test-artifacts/test-design-architecture.md` | Canonical system pair (architecture) | `4fd5d91a6b47b347ba7056d963c7bb928828270cc94bb717cedab0955d44b565` |
| `_bmad-output/test-artifacts/test-design-qa.md` | Canonical system pair (QA) | `e4a4daaa70f8ed7e395b8863d85af344a667d02641da717be9b05901026d9bc7` |
| `_bmad-output/planning-artifacts/platform/epics.md` | Canonical epic source (`## Epic 3`, Stories 3.1–3.8 = ACM-3/4/0/1/2/5/8/9) | `9eff9d94aa9612b7c28efea772cef123886767f0182dbd177e914fbd4649e04e` |
| `_bmad-output/test-artifacts/test-design/README.md` | Current-artifact index (read for scope resolution; updated by this run — see below) | `5fa647e8c61e609d46e8905837e635d24722941e5917cd650effe2b95e5c283c` |
| `docs/test-design-workflow-contract.md` | Binding routing contract | `1212e87968a6e08de455afd5f100bd862196b829bd4031677ea42d85fcc09151` |

Also read, not hashed (supporting context, not themselves evaluated outputs):
`docs/architecture/access-control.md`, `docs/architecture/testing-strategy.md`,
`_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml`, the ACM-9 artifact set
under `_bmad-output/test-artifacts/performance/`, and the directory listing of
`services/backend/test/measurement/acm9/`.

**Identity cross-check:** the plan's frontmatter, the checkpoint's frontmatter, and the canonical
source heading all agree on `PLAT-E3` / `platform` / `3` /
`## Epic 3: Access Control Kernel MVP`. **No identity mismatch.** (A *content* mismatch between the
same two files is recorded as F-1; it is not an identity mismatch and therefore not a contract §4.2
no-write refusal.)

---

## Scope resolution (contract §3)

1. Index and routing contract read before any mode action, per the resolved
   `workflow.activation_steps_prepend`.
2. The user named the target file `test-design-epic-platform-3.md`, which resolves uniquely to
   `runKey epic-platform-3` via the index §3 Epic-scope table.
3. Canonical source verified: `epics.md` contains exactly **one** authoritative body at line 416,
   `## Epic 3: Access Control Kernel MVP`. The `### Epic 3` occurrence at line 140 sits inside
   `## Epic List` and is a summary mention, not a second body.
4. Per contract §4.5 this is an **epic Validate**: it evaluates the canonical system pair plus the
   selected epic plan, and writes exactly
   `test-design-validation-report-epic-platform-3.md` (this file) plus this epic's validation entry
   in the index. It writes no system report, no other epic's report, and does not modify the
   evaluated plan or its checkpoint.

**Pre-write statement (contract §6).** Operation: epic Validate. Scope kind: `epic`. Domain
`platform`, canonical ID `PLAT-E3`, source `_bmad-output/planning-artifacts/platform/epics.md`,
number `3`. Run key `epic-platform-3`. Files allowed to change: this report and the `PLAT-E3`
validation entry in `_bmad-output/test-artifacts/test-design/README.md`. Files that must remain
unchanged: the epic plan, its checkpoint, the system pair and system validation report, every other
epic artifact, scenario files, trace and performance artifacts, service code, gitlinks, sprint
status, and ClickUp data.

---

## Checklist results

### Prerequisites (Epic-Level Mode)

| Item | Result |
| --- | --- |
| Story markdown with clear acceptance criteria exists | PASS — Stories 3.1–3.8 (`ACM-3/4/0/1/2/5/8/9`), `epics.md` lines 416–690 |
| PRD or epic documentation available | PASS — `## Epic 3` body plus the Kernel Dependency Graph |
| Architecture documents available (system pair) | PASS — both loaded; `docs/architecture/access-control.md` and `testing-strategy.md` also read |
| Requirements are testable and unambiguous | PASS with one exception — the canonical source's own **status caveat** (every Epic 3 story key `done`, two tracking artifacts disagreeing) is unresolved upstream; see **F-2** |

### Step 1 — Context Loading

| Item | Result |
| --- | --- |
| Epic documentation loaded | PASS |
| Acceptance criteria analyzed | PASS at story granularity; PARTIAL at individual-AC granularity — see **F-3** |
| Architecture documents reviewed | PASS |
| Existing test coverage analyzed | PASS — `test/access-control/`, `test/measurement/acm9/`, `docs/test-cases/access-control-kernel/` named as **inventory, not coverage**, which is the correct framing |
| Knowledge base fragments loaded | PASS in the checkpoint; **not** evidenced in the plan — see **F-6** |
| `nfr-criteria.md` loaded (NFRs in scope) | PASS — checkpoint records it; plan's NFR table is consistent with the fragment's shape |

### Step 2 — Risk Assessment

| Item | Result |
| --- | --- |
| Genuine risks identified (not features) | PASS — all six are failure modes, not restated stories |
| Risks classified by category | PASS — SEC/BUS, SEC/DATA, DATA/OPS, SEC/BUS, TECH/SEC, PERF/OPS |
| Probability / Impact scored 1–3 | PASS |
| Scores calculated correctly (P × I) | PASS — 3×3=9; five × 2×3=6. Arithmetic re-checked, all correct |
| High-priority risks (≥6) flagged | PASS — all six are ≥6 and marked as requiring mitigation |
| Mitigation plans defined | PASS — one named mitigation per risk |
| Owners assigned | PASS — "Platform backend" for all six (uniform but assigned) |
| Timelines set | PASS as sequencing anchors ("Before ACM-3 completion", "ACM-0/1"), not dates |
| Residual risk documented | **FAIL** — no residual-risk statement anywhere in the plan; see **F-6** |
| Medium (3–4) / low (1–2) risk tables | FAIL (minor) — absent, and not stated as deliberately empty; see **F-6** |
| Risk category legend | FAIL (minor) — absent; see **F-6** |

### Step 2A — NFR Planning

| Item | Result |
| --- | --- |
| NFR categories in scope identified | PASS — security, performance, reliability, maintainability; compliance/scalability/accessibility explicitly excluded |
| Thresholds extracted from sources, not invented | PASS — **verified**: the plan's `ACM9-MVP-v1` rule ("warm p95 **and** absolute worst case ≤ 2 s, stop on breach/timeout") matches `docs/architecture/testing-strategy.md` lines 178, 200 and 286 verbatim in substance |
| Unknown thresholds marked UNKNOWN, no guessing | PASS — "no numeric reliability or maintainability threshold is specified. No value is invented" |
| Missing thresholds converted into risks/assumptions/open items | PASS |
| Planned evidence sources identified for later `nfr-assess` | PASS |
| NFR-derived risks mapped into the register | PASS — R01–R06 carry the SEC/PERF/OPS/TECH/DATA categories |
| Performance contract attribution | PASS, and notably correct — Contract B only, never `PG-04`/DIR-A1 or P6, matching index §5.2 and `test-design-qa.md` § "The three performance contracts must stay separate" |

### Step 3 — Coverage Design

| Item | Result |
| --- | --- |
| Acceptance criteria broken into atomic scenarios | PARTIAL — atomic scenarios are enumerated inside each coverage row, but several individual ACs have no named obligation; see **F-3** |
| Test levels selected | PASS — deploy-entrypoint, headless facade, module E2E + audit, measurement |
| No duplicate coverage across levels | PASS — explicitly reasoned (no UI/API duplicate because the epic is headless) |
| Priority levels assigned | PASS |
| P0 scenarios meet strict criteria | CONCERNS — six of eight groups are P0 and the plan states no P0 criteria to justify it; see **F-5** |
| NFR-derived risks mapped to validation scenarios | PASS |
| Planned NFR evidence documented without final PASS/CONCERNS/FAIL | PASS — deferred to `nfr-assess` explicitly |
| Data prerequisites identified | PASS — migrated PostgreSQL, owned fixture cleanup, per-scenario `ROOT_WORK_EMAIL` |
| Tooling/access requirements documented | PASS — Pact MCP unreachable and `playwright-cli` absent are both recorded with a reason why neither blocks |
| Execution order defined | PASS — and correctly **not** a smoke/P0/P1 ladder |

### Step 4 — Deliverables Generation

| Item | Result |
| --- | --- |
| Risk assessment matrix created | PASS |
| Coverage matrix created | PASS |
| Execution order documented | PASS |
| Resource estimates calculated | PASS |
| Quality gate criteria defined | PARTIAL — thresholds present but restated from the platform pair with a semantic shift; see **F-4** |
| NFR planning summary included | PASS |
| Output file written to correct location | PASS — contract §2.2 canonical path |
| Output file uses template structure | PARTIAL — deliberate, defensible deviations (Execution Strategy replaces the template's tiered Execution Order, per the checklist's own anti-pattern rule) plus unintended omissions; see **F-6** |

### Output Validation — Risk Matrix / Coverage Matrix / Quality Gates

| Item | Result |
| --- | --- |
| Unique risk IDs | PASS — `PLAT-E3-R01..R06`, no collision with the platform register's `PR-001..PR-010` |
| Category / probability / impact / score columns correct | PASS |
| Mitigation strategies specific and actionable | PASS |
| All requirements mapped to test levels | PASS at story level — all 8 canonical stories have exactly one owning coverage group |
| Priorities assigned to all scenarios | PASS |
| Risk linkage documented | PASS — every coverage row carries a risk link |
| Test counts realistic | N/A — the plan deliberately states scenario **families**, not counts. Consistent with the index's no-number policy; recorded as not executed |
| Owners assigned where applicable | PASS |
| No duplicate coverage | PASS |
| P0 pass-rate threshold defined | PASS (100 %) — but see **F-4** on its provenance |
| P1 pass-rate threshold defined | PASS (≥ 95 %) — but see **F-4** |
| High-risk mitigation completion required | PASS |
| Coverage target ≥ 80 % specified | **Deliberate deviation, accepted.** The plan states "No aggregate coverage percentage is claimed". Authority: index "No percentage, pass rate or green gate appears anywhere", and `test-design-qa.md` § Gate thresholds ("computes, asserts and publishes no coverage percentage"). Not counted as a failure |
| NFR evidence expectation per category | PASS |
| Full NFR decision deferred to `nfr-assess` | PASS |

### Execution Strategy

| Item | Result |
| --- | --- |
| Simple PR / Nightly / Weekly structure | PASS — and a direct improvement over `PLAT-E2`, whose tiered ladder was flagged F-5 in its own report |
| PR execution of all functional tests | PASS |
| Nightly/Weekly limited to expensive work | PASS — ACM-9 only, with the reason stated |
| No redundancy (tests not re-listed) | PASS |
| Philosophy stated | PASS — "Run everything in PRs unless it is expensive or long-running" |
| Playwright parallelization noted | N/A — PLAT-E3 is headless backend/Jest; there is no browser target. Recorded as not applicable, not as a gap |

### Resource Estimates

| Item | Result |
| --- | --- |
| P0 effort as interval | PASS — ~40–64 h |
| P1 effort as interval | PASS — ~16–30 h |
| P2/P3 effort | PASS — "N/A", with the reason given |
| Total as interval | PASS — ~56–94 h, arithmetically consistent with its parts |
| Timeline as week range | PASS — ~2–4 weeks |
| Includes setup time / complexity variation | PASS — "Ranges include PostgreSQL fixture/cleanup work and evidence capture" |
| No false precision | PASS |
| Estimate framing | CONCERNS — the estimate is presented as forward work without recording the canonical source's `done` status caveat; see **F-2** |

### Priority Assignment Accuracy

| Item | Result |
| --- | --- |
| Priority sections carry no execution context | PASS — headers are "P0 — critical" / "P1 — high", no "Run on…" |
| Execution Strategy is a separate section | PASS |
| Note that P0..P3 = priority, not timing | PASS — stated at the top of the Test Coverage Plan |
| Priority sections state Criteria / Purpose | FAIL (minor) — neither is stated for P0 or P1; see **F-6** |
| P0/P1/P2/P3 definitions applied correctly | CONCERNS — see **F-5** |
| Risk score is supporting evidence, not a mandatory condition | PASS |
| Priority consistent with the epic's dependency graph | **FAIL** — two prerequisite→dependent inversions; see **F-5** |

### Test Level Selection

| Item | Result |
| --- | --- |
| E2E reserved for critical paths | PASS — module E2E used once, for ACM-8 composition |
| API/integration tests cover business logic | PASS — headless facade is the correct level for ACM-2/3/4/5 |
| Component tests for UI | N/A — no UI in scope, correctly excluded |
| Unit tests for edge cases | PARTIAL — "focused unit/static checks" is named in the Execution Strategy but no unit-level obligation appears in the coverage matrix |
| No redundant coverage | PASS |

### Evidence-Based Assessment

| Item | Result |
| --- | --- |
| Risk assessment based on documented evidence | PASS |
| No speculation on business impact | PASS |
| Assumptions clearly documented | PASS — five numbered dependencies/assumptions |
| Clarifications requested where needed | PASS — the FR-catalog drift is carried as an open cross-epic dependency rather than silently resolved. This is the correct handling; a precision correction is recorded as **F-7** |
| Factual claims verified against sources | PASS — spot-checked and **confirmed**: `acm-4-disposition.yaml` does record `disposition: no-gap` / `acm_5: unblocked`; a `status: PASS` `ACM9-MVP-v1` baseline artifact does exist; the ACM-9 two-second rule matches `testing-strategy.md`; the AD-1 per-stage approval retirement matches ruling `D-1`; the three-versus-six `hr-admin` permission drift and the stale three-key test lock match `docs/architecture/access-control.md` |

### Cross-Document Consistency

| Item | Result |
| --- | --- |
| Plan and checkpoint agree on identity | PASS |
| Plan and checkpoint agree on scenario IDs | **FAIL** — `E3-C05`, `E3-C06`, `E3-C07` denote different scenario families in the two documents; see **F-1** |
| Consistent priority levels | PASS within each document; the two documents agree on which families are P0/P1 even though the IDs are permuted |
| Epic risks linked to the platform risk register | FAIL (minor) — no reference to `PR-001`/`PR-002`, which are the platform-level statements of the same audience-leak and stale-graph-state concerns; see **F-6** |
| Shared rules referenced, not restated | PARTIAL — the plan asserts it "references rather than restates" platform-pair policy, then restates the pair's gate thresholds; see **F-4** |
| Dates and identity consistent | PASS — both documents dated 2026-09-12, both `runKey epic-platform-3` |

### Not in Scope / Entry / Exit Criteria

| Item | Result |
| --- | --- |
| Out-of-scope items listed with reasoning | PASS — the Scope and Boundaries table gives an owner or boundary for every exclusion |
| Mitigation noted for each excluded item | PASS — each exclusion names the owning consumer or story |
| Exclusions reviewed and accepted by stakeholders | NOT MET — approval is ungranted by design; recorded, not counted against the document |
| Entry: prerequisites clearly defined | PASS |
| Entry: environment readiness | PASS |
| Entry: test data readiness | PASS |
| Entry: pre-implementation blocker resolution referenced | PARTIAL — epic-local gates (`acm-4-disposition.yaml`, PASS ACM-9 baseline) are referenced; the index §5.3 open platform blockers are not mentioned even to say they do not bind PLAT-E3 |
| Exit: pass/fail thresholds per priority | PASS |
| Exit: bug severity gate | **FAIL** — no "no open P0/P1 defects" style gate is stated; see **F-6** |
| Exit: coverage sufficiency criteria | Deliberate deviation, accepted (same authority as the ≥ 80 % row above) |

### Interworking & Regression

| Item | Result |
| --- | --- |
| Impacted services/components identified | PASS — five rows including the system pair |
| Regression scope defined per component | PASS |
| Cross-team coordination noted | PASS — the User Management adoption story is named as the owner of rebinding and consumer E2E |

### Document Quality (Anti-Bloat)

| Item | Result |
| --- | --- |
| No note repeated 10+ times | PASS |
| Repeated information consolidated | PASS — the "not an approval / not coverage" framing is stated once in the Executive Summary and once at the Approval section, not per-section |
| No excessive detail | PASS |
| Professional tone, no AI-slop markers | PASS — no emoji, no enthusiasm markers |
| Length | PASS — 188 lines, appropriate for an epic plan |

---

## Findings

### F-1 (High, confirmed) — The plan and its own checkpoint assign three coverage IDs to different scenario families

`E3-C05`, `E3-C06` and `E3-C07` are **not stable between the two documents of the same run**:

| ID | Meaning in `test-design-progress-epic-platform-3.md` § Step 4 | Meaning in `test-design-epic-platform-3.md` § Test Coverage Plan |
| --- | --- | --- |
| `E3-C05` | ACM-4 audience merge disposition (P1) | ACM-5 base section decision (P0) |
| `E3-C06` | ACM-5 base section decision (P0) | ACM-8 composition boundary (P0) |
| `E3-C07` | ACM-8 composition boundary (P0) | ACM-4 merge disposition (P1) |

`E3-C01`–`E3-C04` and `E3-C08` agree. The two documents therefore describe the same eight families
with the same priorities, but a citation of "`E3-C05`" resolves to a P1 validation-only story in one
file and a P0 security-relevant section decision in the other.

This matters beyond tidiness. The checkpoint's own NFR evidence plan says security evidence comes
from "E3-C01 through E3-C07" and performance from "E3-C08" — a range that, read against the plan's
numbering, silently includes the ACM-4 merge family and excludes nothing, while read against the
checkpoint's own numbering it means something different again. Any downstream artifact (`atdd`,
`trace`, a gate record) that cites one of these three IDs will bind to whichever file it happened
to read.

**Fix:** make the plan's numbering canonical (it is the document that survives into downstream
work) and correct the checkpoint's Step 4 table to match, or vice versa. This is an Edit to the
losing document only; it changes no priority, no risk, and no estimate.

### F-2 (Medium–High) — The canonical source's Kernel-MVP status caveat is not recorded in the plan

`epics.md` lines 36–44 state, in the epic file's own preamble:

- SD-1: "Epics 2 and 3 are not modified by this pass — **their stories are implemented and their
  acceptance criteria are historical evidence**."
- "**every Epic 3 story key is `done`** in `platform/sprint-status.yaml`, but two tracking artifacts
  disagree with that": `sprint-status.yaml` still records `epic-3: in-progress` while every child
  key is `done`, and `global-fr-epic-story-coverage.yaml` disagrees with `sprint-status.yaml` on
  `PLAT-E2-S2.1`.
- "Both are recorded here so that '**PLAT-E3 is done' is not treated as mechanically verified** when
  one of the two tracking surfaces still contradicts it."

The plan records none of this. The Executive Summary does correctly frame existing suites as "an
inventory of intended **or historical** evidence, not a claim that tests pass", and the checkpoint
lists the existing Stage-2 suites — so the run was not blind to it. But the plan's operative
sections read as pre-implementation planning for unbuilt work: mitigation timing "Before ACM-3
completion", an entry criterion requiring a "committed-red Stage-2 change", and a `~56–94 hour`
effort estimate presented with no note that the canonical source records the underlying stories as
implemented and their evidence as historical.

This is a framing defect, not a false statement: nothing in the plan asserts the work is
outstanding, and the effort range is explicitly labelled "planning capacity, not time booked or
execution progress". But a reader scheduling from this plan would budget two to four weeks of work
whose status the epic source itself flags as needing verification first.

**Fix:** one paragraph in Dependencies/Assumptions recording SD-1, the `done`-versus-`in-progress`
tracking contradiction, and that the effort range is the cost of *establishing or re-establishing*
this evidence, not a claim that none exists. Do **not** resolve the tracking contradiction here —
`epics.md` assigns that reconciliation to Platform Story 1.1's traceability matrix, and contract §5
forbids this workflow from changing sprint status.

### F-3 (Medium) — No AC-to-scenario traceability, and specific acceptance criteria have no named obligation

The plan maps coverage groups to **stories** (`ACM-0`…`ACM-9`), not to individual acceptance
criteria, and contains no traceability table. This is the same class of finding as `PLAT-E2`'s F-2,
and it is what makes the gaps below invisible without a line-by-line re-read of the epic source.

Reconstructed here, the following ACs have no obligation naming them:

| Story / AC | Text (abridged) | Nearest coverage row | Status |
| --- | --- | --- | --- |
| 3.5 `ACM-2` AC1 | `isAllowed` "contains **no branch for `hr-admin`** or an individual permission name" | `E3-C03` | **Not named.** This is a source/structure obligation, not a behavioral one; it needs a static or review check, and it is precisely the invariant the E4 permission-set expansion (F-7) puts under pressure |
| 3.1 `ACM-3` AC2 | "Viewer identity validation runs **before** any audience derivation, Self included… where the target is the viewer, one confirmation settles both" | `E3-C04` | **Not named.** `E3-C04` names viewer/target state and cycles but not the ordering invariant, and Self exclusivity is carried only under `ACM-4` (`E3-C07`), a different story at a lower priority |
| 3.1 `ACM-3` AC8 | "otherwise **normal Colleague fallback** applies" | `E3-C04` | **Not named.** The Colleague floor appears only in the `ACM-4` row; `ACM-3`'s own fallback case has no obligation |
| 3.1 `ACM-3` AC1 | empty target list "returns an empty map **with no relationship-graph read**" | `E3-C04` | Partially named — the empty-map contract is covered, the no-read assertion is not |
| 3.8 `ACM-9` AC1 | baseline runs "**without changing behavior** under `services/backend/src/access-control/**`" | `E3-C08` | **Not named.** `testing-strategy.md:146` restates this as a measurement-only invariant; it is an audit obligation, not a metric |
| 3.8 `ACM-9` AC5 | "Treat any optimization as a **separate gated story**" | `E3-C08` | Not named (arguably process, not test) |
| 3.3 `ACM-0` AC4 | "Unrelated active employees never affect that count" | `E3-C01` | Implied by "exact-one-before-active order" but not named as its own case |

Everything else maps cleanly. `ACM-1` (`E3-C02`), `ACM-5` (`E3-C05`), `ACM-8` (`E3-C06`) and
`ACM-4` (`E3-C07`) cover their acceptance criteria without a gap I can identify.

**Fix:** add a compact AC→coverage-row table to the plan, and add the five "not named" rows above as
explicit obligations. Three of them (`ACM-2` no-hard-coded-branch, `ACM-9` no-behavior-change,
`ACM-3` no-graph-read) are audit or assertion obligations rather than new test scenarios and cost
nothing in the estimate.

### F-4 (Medium) — Gate thresholds are restated from the platform pair, with a semantic shift from *covered* to *pass*

`test-design-qa.md` § "Gate thresholds carried from the handoff" owns three thresholds:
**"P0 = 100 % covered · P1 = ≥ 95 % covered · the access-control suite passes."**

The plan's § Design Quality Criteria states "P0 functional evidence is required at 100 %; P1 evidence
target is at least 95 %", and its Exit Criteria state "All PLAT-E3 P0 scenarios **pass**". Three
problems, in increasing order of significance:

1. **Restatement.** The index rule is explicit: "If two documents state the same rule, the platform
   pair is the source and the epic plan has a defect." The plan's own Interworking table claims it
   "references rather than restates those policies" — an internal contradiction.
2. **Semantic shift.** The platform thresholds are **coverage** thresholds. The plan converts them
   into **pass-rate / evidence** thresholds. Those are different states under this repository's own
   vocabulary (`test-design-qa.md` § Coverage-state vocabulary), and the conversion is exactly the
   kind of drift the index's no-pass-rate policy exists to prevent.
3. **Dropped clause.** The third platform threshold — "the access-control suite passes" — is the one
   most directly binding on PLAT-E3 and does not appear in the plan at all.

**Fix:** replace the two restated numbers with a citation to `test-design-qa.md` § Gate thresholds,
preserve the word *covered* if the plan keeps them inline, and add the access-control-suite clause.

### F-5 (Medium) — Priority is inverted against the epic's own Kernel Dependency Graph, and P0 criteria are unstated

The epic's Kernel Dependency Graph makes two prerequisites explicit and artifact-checked:

- `ACM-4 → ACM-5`, gated on `acm-4-disposition.yaml` recording `disposition: no-gap`.
- `ACM-8` (and ACM-9-final) gated on an ACM-9 **baseline** artifact with `status: PASS`.

The plan prices `ACM-4` (`E3-C07`) and `ACM-9` (`E3-C08`) at **P1**, while their dependents `ACM-5`
(`E3-C05`) and `ACM-8` (`E3-C06`) are **P0**. Combined with the plan's own thresholds — P0 evidence
required at 100 %, P1 at ≥ 95 % "with any failure triaged" — a prerequisite may be waived at 95 %
while the work it gates is required at 100 %. The plan's own Immutable Operating Rules say the
opposite: a non-`no-gap` ACM-4 disposition or a non-`PASS` ACM-9 baseline **halts** the dependent.

Separately: six of eight groups are P0, well above the checklist's "P0 tests should cover < 10 % of
total scenarios" guidance, and neither priority section states its criteria. The high P0 share is
**defensible** for a fail-closed security kernel where every group carries security or data-integrity
impact with no workaround — the checklist's own P0 definition is met on the face of it — but the plan
never says so, which leaves the ratio looking unexamined.

**Fix:** either raise `E3-C07`/`E3-C08` to P0 on the grounds that they gate P0 work, or state
explicitly that their P1 rating is a *scenario-importance* rating that does not relax the artifact
gate. Add a one-line Criteria statement under each priority heading.

### F-6 (Low) — Checklist-required elements absent from the plan

Each is individually small; together they are the difference between a plan that passes a structural
review and one that needs a reader to supply context from elsewhere.

- **No residual-risk statement.** Required by Step 2; present in the system architecture doc, absent
  here.
- **No bug-severity exit gate.** Exit Criteria define pass thresholds but no "no open P0/P1 defects"
  condition.
- **No risk category legend**, and **no medium/low risk tables** — the correct content is "none; all
  identified risks score ≥ 6", but that should be stated rather than left to inference.
- **No Criteria/Purpose statement** under the P0 and P1 headings.
- **No knowledge-base appendix.** The fragments were loaded (the checkpoint lists all twelve) but the
  plan cites none, so a reader cannot see which governance rules it was built against.
- **No link to the platform risk register.** `PLAT-E3-R01` (audience leak) and `PLAT-E3-R02` are the
  epic-level instances of platform `PR-001` and `PR-002`; the plan does not say so, so the platform
  register cannot be traced down into this epic.
- **No unit-level obligation in the coverage matrix**, although "focused unit/static checks" appears
  in the Execution Strategy.

### F-7 (Low) — Two precision corrections

1. **FR-catalog drift ownership.** Dependencies item 3 says the reconciliation is "E4-owned".
   `docs/architecture/access-control.md` is more specific: the six-key set was added by
   `PLAT-E4-S4.2a`, but the **reconciliation of the count** is tracked as **DEPT-4** in
   `_bmad-output/planning-artifacts/platform/dept-epic.md`, and it "self-resolves when DEPT-2 takes
   the set back to five". The plan's substantive claims (three keys originally; six now;
   `acm1r-fr-foundation.e2e-spec.ts` still pins the stale three-key shape;
   `s42a-op-bootstrap-canonical-set.e2e-spec.ts` is the intended replacement) are all **accurate** —
   only the owner label is imprecise. Note also that `E3-C02`'s CAP-3 obligations are asserted
   against a three-key expectation that the architecture already calls stale.
2. **ACM-9 baseline selection is unpinned.** The plan says "select a baseline with `status: PASS`".
   Five PASS baselines exist under `_bmad-output/test-artifacts/performance/`, and
   `testing-strategy.md:232` already names a specific binding **final** artifact. Naming the selected
   baseline (or citing the rule that selects it) removes an avoidable ambiguity in a comparison
   protocol whose whole value is comparability.

---

## Overall verdict: CONCERNS

The plan is substantively sound. Its risk register is arithmetically correct and genuinely
risk-based; its NFR thresholds are traceable to `testing-strategy.md` rather than invented; its
performance-contract attribution (Contract B only, never `PG-04`/DIR-A1 or P6) is exactly right and
is the single most error-prone claim in this repository; its execution strategy is simple in the way
the checklist asks for and avoids the tiered-ladder anti-pattern `PLAT-E2` was flagged for; its
estimates are interval-based; and its status framing — approval ungranted, validation not run,
coverage none asserted, existing suites as inventory rather than evidence — holds throughout. Every
factual claim I spot-checked against source held up.

The concerns are addressable in a single Edit pass, in this order:

1. **F-1** — reconcile the `E3-C05/06/07` ID collision between plan and checkpoint. This one is a
   correctness defect with downstream reach, not a style point.
2. **F-2** — record the canonical source's Kernel-MVP status caveat (`done` keys, two disagreeing
   tracking artifacts, SD-1 "historical evidence") and frame the effort range against it.
3. **F-3** — add an AC→coverage traceability table and the five unnamed acceptance criteria.
4. **F-4** — cite the platform pair's gate thresholds instead of restating them, restore the word
   *covered*, and add the access-control-suite clause.
5. **F-5** — resolve the P1-gates-P0 inversion and state the P0/P1 criteria.
6. **F-6**, **F-7** — the structural omissions and the two precision corrections.

None of these requires new risk analysis, a changed risk register, a changed coverage decision, or a
changed estimate. **No finding here changes the plan's state:** it remains approval ungranted, and
this validation grants no approval.

## Checks not executed

- **No test suite was run.** This is a document-quality and AC-alignment review. The current pass
  state of `services/backend/test/access-control/**` and `test/measurement/acm9/**` was not
  re-verified, and no coverage percentage or pass rate was computed.
- **The ACM-9 artifacts were read for `role`/`status`/`protocol_version` only.** Their measured
  values were not re-validated against the `ACM9-MVP-v1` protocol, and no performance verdict is
  issued or implied.
- **`test-counts realistic`** — not executed. The plan deliberately states scenario families rather
  than counts, consistent with the index's no-number policy; there is nothing to check.
- **The `done`-versus-`in-progress` tracking contradiction (F-2) was read, not reconciled.**
  `epics.md` assigns that to Platform Story 1.1's traceability matrix, and contract §5 forbids this
  workflow from changing sprint status or coverage fields.
- **BMAD Handoff Validation** — not applicable: epic-level validation writes no handoff (system
  scope only, contract §4.1).
- **System-Level Mode two-document structural checklist** (Quick Guide tiers, Purpose-statement
  placement, architecture/QA separation) — not applicable to an epic plan. The system pair's own
  structure was last validated by `test-design-validation-report.md` (PASS, 2026-09-11) and is not
  re-validated here; note that report's own recorded caveat about the post-PASS correction to
  `test-design-qa.md`.
- **`PLAT-E4`** — `test-design-epic-platform-4.md` exists in the working tree and shares the open
  `hr-admin` permission-set question with this epic. It was **not** evaluated: contract §4.2 forbids
  loading another epic's plan, and §4.5 forbids this run from writing another epic's report.

---

**Completed by:** Anna Pikula (session), acting as Master Test Architect
**Date:** 2026-09-12
**Epic:** `PLAT-E3` — Access Control Kernel MVP
