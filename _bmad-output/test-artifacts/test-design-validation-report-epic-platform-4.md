---
epicId: 'PLAT-E4'
epicDomain: 'platform'
epicNumber: 4
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicSourceHeading: '## Epic 4: Access Control Authorization Consolidation'
runKey: 'epic-platform-4'
validationScope: 'epic'
validationDate: '2026-09-12'
runBaselineHead: '367750e46861cbc43772ff701531cfa33801cfdd'
verdict: 'CONCERNS'
---

# Test Design Validation Report — Epic `PLAT-E4` (Access Control Authorization Consolidation)

**Scope kind:** `epic` · **Identity tuple:** `PLAT-E4` · domain `platform` · number `4` ·
`_bmad-output/planning-artifacts/platform/epics.md` `## Epic 4: Access Control Authorization Consolidation`
**Run key:** `epic-platform-4`
**Repository `HEAD` (captured before this run's first write, run baseline):** `367750e46861cbc43772ff701531cfa33801cfdd`

> **What this report is not.** It grants no approval, asserts no coverage achieved, records no
> execution result, and changes no sprint status, gate, scenario file, trace artifact, service code,
> gitlink, or ClickUp mapping. Per `docs/test-design-workflow-contract.md` §5, `workflowStatus:
> generated` on the plan's checkpoint means only that documents were written. This validation
> evaluates the plan's internal quality and its alignment with the epic's stated acceptance criteria
> and the canonical system pair — nothing more. The plan remains **approval-ungranted** after this
> report.

---

## Evaluated artifacts and content hashes

Working-tree content at the time of this validation. The repository has uncommitted changes on
several of these paths relative to the `HEAD` above; each hash is of what was actually read.

| Artifact | Role | SHA-256 |
| --- | --- | --- |
| `_bmad-output/test-artifacts/test-design-epic-platform-4.md` | Evaluated epic plan | `a2793d7d93530d82c067e2e9ada9f2790c0024685b3b1b22f2c5a991ba9986c1` |
| `_bmad-output/test-artifacts/test-design-architecture.md` | Canonical system pair (architecture) | `4fd5d91a6b47b347ba7056d963c7bb928828270cc94bb717cedab0955d44b565` |
| `_bmad-output/test-artifacts/test-design-qa.md` | Canonical system pair (QA) | `e4a4daaa70f8ed7e395b8863d85af344a667d02641da717be9b05901026d9bc7` |
| `_bmad-output/test-artifacts/test-design-progress-epic-platform-4.md` | Epic checkpoint (identity cross-check and step-record only; not itself evaluated for content quality) | `9052980da0328cb4e79ac2e2941a84f6c68c661b61a1721094e4c6b2ef491b06` |
| `_bmad-output/planning-artifacts/platform/epics.md` | Canonical epic source (`## Epic 4`, Story 4.1 / 4.2 acceptance criteria) | `9eff9d94aa9612b7c28efea772cef123886767f0182dbd177e914fbd4649e04e` |
| `_bmad-output/test-artifacts/test-design/README.md` | Current-artifact index (read for scope resolution; updated by this run — see §Index update) | `5fa647e8c61e609d46e8905837e635d24722941e5917cd650effe2b95e5c283c` |

**Also read, not hashed** (supporting context, not themselves evaluated outputs):
`docs/test-design-workflow-contract.md`; `docs/architecture/access-control.md`;
`docs/architecture/testing-strategy.md`; `_bmad-output/test-artifacts/test-design-epic-platform-3.md`;
`_bmad-output/planning-artifacts/platform/dept-epic.md`;
`_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md` and the
`spec-4-2b` / `spec-4-2d` increment specs;
`services/backend/src/user-management/infrastructure/career-timeline-access-facade.adapter.ts`;
the directory listings of `services/backend/test/access-control/` and
`services/backend/test/user-management/access-control-adoption/`.

**Note on the system-pair QA hash.** `test-design-qa.md` hashes `e4a4daa…` here, which differs from
the `df18614…` recorded in the system validation report of 2026-09-11. That difference is the
already-documented same-day post-PASS correction to § U-19 (index §2). It is expected, not a new
discrepancy.

**Identity cross-check.** Plan frontmatter, checkpoint frontmatter, and the canonical source heading
all agree on `PLAT-E4` / `platform` / `4` / `## Epic 4: Access Control Authorization Consolidation`.
The canonical source contains exactly one `## Epic 4` body. No mismatch found; validation was
permitted to proceed under contract §4.5.

---

## Scope resolution (contract §3)

1. Current-artifact index and routing contract read before any mode action.
2. The user named the exact target file `test-design-epic-platform-4.md`, which resolves uniquely to
   the `PLAT-E4` tuple. No bare epic number was used.
3. Canonical source located and verified: one matching authoritative epic body; domain, ID, number
   and heading agree.
4. `runKey` `epic-platform-4` derived once and carried unchanged.
5. Pre-write identity check passed on both plan and checkpoint.

**Files this run was allowed to change:** this report, and the `PLAT-E4` validation entry in the
current-artifact index. **Files that had to remain unchanged, and did:** the evaluated plan, the
checkpoint, the system pair, the system validation report, every other epic report and plan, and all
service, scenario, trace, and tracker artifacts.

---

## Verdict: **CONCERNS**

The plan is structurally sound, correctly routed, and disciplined about the distinctions this
repository cares most about — it asserts no coverage percentage, no gate, no execution result and no
approval; it keeps performance Contracts A, B and C separate; it preserves the ACM-9 job's
informational status; and its Execution Strategy uses the PR / Nightly / Weekly shape rather than the
smoke/P0/P1 tier structure the checklist flags against and that the `PLAT-E2` validation found.

It does not pass, for one substantive reason and several structural ones: **the plan's central P0
security claim has a live, sanctioned exception in shipped code that the plan never names** (F-1),
and two Story 4.1 acceptance criteria carry no verification obligation at all (F-2). A tester working
only from this document would write assertions that contradict accepted product behavior.

---

## Findings

### F-1 — HIGH. The `profile:timeline:write` deviation contradicts the plan's P0 premise and is absent

The plan's two highest-value security claims are that the audience-first dual gate holds (R01,
score 9) and that a functional role never confers target data write (R03, score 6), verified by P0
bundles E4-C03 and E4-C04 asserting `403` / `canEdit:false` on unrelated targets. Neither the risk
rows nor the coverage rows nor the Not-in-Scope table state any exception.

One exists, in shipped code:
`services/backend/src/user-management/infrastructure/career-timeline-access-facade.adapter.ts:60-76`
implements `canEditTimeline(viewerId, targetUserId)` as `isAllowed(viewer,
'profile:timeline:write')` alone. `targetUserId` is explicitly discarded (`void targetUserId`). There
is no audience half. `docs/architecture/access-control.md:81-88` records this as a **known, accepted,
time-boxed deviation** from §2.2/§2.3 under PO ruling AF-2, notes that a seeded `hr-admin` holder can
therefore write any employee's career timeline, and tracks closure as **DEPT-2** in
`_bmad-output/planning-artifacts/platform/dept-epic.md`, blocked on the department-manager audience.

Consequence for the plan as written: a scenario author implementing E4-C04 against the delegated-HR-
admin persona has no way to know that one write path is legitimately open. They will either omit it
(leaving the accepted deviation unpinned, so its eventual closure is untested) or assert a denial and
report a sanctioned behavior as a P0 security failure.

**Required:** name the deviation explicitly — either as a Not-in-Scope row with owner and the DEPT-2
closure reference, or as a stated boundary on R03 and E4-C04 with a pinning scenario that asserts the
current behavior *and* its closure trigger. The plan already does exactly this kind of careful
boundary work for the §2.4 full-profile overlay in R05/E4-C05; this deviation needs the same
treatment.

### F-2 — HIGH. Two Story 4.1 acceptance criteria have no verification obligation

Neither `dev-grant-root` nor `profile:timeline` appears anywhere in the plan or its checkpoint
(verified by grep over both files).

| Uncovered AC (Story 4.1) | Status in plan |
| --- | --- |
| "`scripts/dev-grant-root.ts` still gives root `canEdit: true` on every active card, with no adapter special case." | Absent. E4-C05 covers bootstrap grants and tree position; E4-C06 covers `db:dev:seed-org`. Neither names this script or its no-special-case property, which is precisely the regression this epic's `canEditS1` override removal could reintroduce. |
| "Closes the two access-control deferred-work entries ('Generalise section-access authorisation'; the `profile:timeline` rename follow-up)." | Absent. No repository-audit obligation verifies either closure. |

The second is the artifact-verification pattern `PLAT-E1` already established for
documentation-alignment criteria (`plat-e1:AV-*`, evidence level `repository-audit`). The mechanism
exists in this repository; the plan simply did not apply it.

Related, lower-weight: Story 4.2's AC "`db:dev:seed-org` … absent from `prisma/seed.ts` and
`bootstrap-access-control.ts`; ACM-1 invariant suite green" is only partly reached by E4-C06, which
states production refusal, spine shape, edge preservation, determinism and rerun safety but not the
absence-from-entrypoint check or the ACM-1 invariant condition.

### F-3 — HIGH. No acceptance-criterion-to-scenario traceability table

The epic states ten summary acceptance criteria across two stories (and directs readers to fuller
lists in both tickets). The plan offers eight coverage bundles whose mapping to those criteria must
be inferred by the reader. Checklist items "All requirements mapped to test levels" and "Risk linkage
documented" are therefore only partially satisfiable, and F-1 and F-2 are exactly the kind of gap an
explicit table would have surfaced during generation.

This repeats verbatim a finding from
`test-design-validation-report-epic-platform-2.md` (CONCERNS, 2026-09-11). Two consecutive platform
epic plans missing the same table is a template-level gap, not a one-off authoring slip; consider
adding the table to the epic plan template rather than patching each plan.

### F-4 — MEDIUM. The three-versus-six FR permission-set reconciliation routed here from `PLAT-E3` is unreceived

`test-design-epic-platform-3.md:162` records: *"This plan does not resolve or overwrite that later
scope: test the E3 CAP-3 invariants and retain the explicit E4-owned reconciliation as an open
cross-epic dependency."* The current-artifact index restates it in the `PLAT-E3` row. `PLAT-E4`'s
plan contains no risk, coverage ID, assumption, or Not-in-Scope row on the subject.

This matters concretely rather than bureaucratically. Per `docs/architecture/access-control.md:90-95`,
the drift lock is split across two suites and not yet reconciled: `acm1r-fr-foundation.e2e-spec.ts`
**still pins the stale three-key shape**, while `s42a-op-bootstrap-canonical-set.e2e-spec.ts` is the
intended post-4.2a replacement. The plan cites the second as P0 evidence for E4-C04 without noting
the first — and E4-C07 requires rerunning *all* access-control E2E on any facade change, which
includes both. The plan therefore designates as P0 evidence a suite whose stale counterpart it never
mentions.

Ownership is genuinely contestable: `access-control.md` tracks reconciliation as **DEPT-4**,
self-resolving when DEPT-2 returns the set to five, while `PLAT-E3` calls it E4-owned. The plan need
not resolve that — it needs to state it, with an owner, in one row.

### F-5 — MEDIUM. One risk carries three different priorities across the plan and its checkpoint

| Location | Statement about R06 |
| --- | --- |
| Plan line 30 (Executive Summary) | "six high risks … and one **P1** evidence gap around the proposed `seeded-two-level` ACM-9 measurement" |
| Plan lines 60-64 (Risk Assessment) | Filed under "**Medium**-priority risk (score 3–4)", scored 2 × 2 = **4** |
| Plan lines 127-133 (Coverage Plan) | Its only scenario, E4-C08, is **P2** |
| Checkpoint Step-3 table | "**P1** — Access Control" |

Two defects follow. First, "six high risks" contradicts the threshold the same document states ten
lines later ("score ≥6 is high") — five risks are high, not six. Second, a reader cannot tell whether
the ACM-9 evidence question is P1 or P2 work, which is the difference between scheduling it now and
deferring it behind a decision.

The Risk Assessment and Coverage Plan are mutually consistent (medium risk, P2 scenario) and appear
to be the intended reading. The Executive Summary and the checkpoint are the outliers. All other risk
arithmetic in the plan is correct: 3×3=9, 2×3=6 four times, 2×2=4.

### F-6 — MEDIUM. The ACM-9 evidence question is scoped more narrowly than the epic's own delivery requires

E4-C08 says to "measure the `seeded-two-level` shape under ACM9-MVP-v1 without changing resolver
behavior or CI blocking status." Two things are missing.

**Baseline comparability.** `docs/architecture/testing-strategy.md` §6 requires a final artifact to
reference the approved baseline run id and **match its protocol, fixture, and environment hashes**;
the fixture manifest covers the shape set and target count. Introducing a `seeded-two-level` shape
therefore changes `fixture_manifest_hash`, so the run cannot be compared against any existing ACM-9
baseline and needs its own baseline (or a new protocol version). The plan treats the measurement as a
drop-in addition. This is also the substance of the scope decision the plan correctly leaves open —
stating the constraint would help whoever makes that decision.

**The other half of E4's ACM-9 exposure.** `dept-epic.md:136` (GAP-2) records that this epic
net-adds per-request queries — `isActiveUser` per `DEFAULT_PERMISSIONS` key in the evaluator, and
`resolveJwtSubject` `findUnique` on every authenticated request — that the newest ACM-9 artifacts
predate, and that closure requires either a rerun or a written one-paragraph proof that the new
queries are O(1)-per-request. The plan's R06 and E4-C08 address only the fixture shape. The
inspection-proof route is cheap and is the likelier correct answer; it is not offered.

Correctly handled and worth recording: the plan's Contract B parameters (500 targets, five warm-ups,
twenty samples, warm p95 and worst case ≤ 2 s per shape) match `testing-strategy.md` §"ACM-9
operational measurement protocol" and `test-design-qa.md` Contract B exactly; Contract A (DIRA1) and
Contract C (P6) are excluded by name; and the plan states twice that it does not promote the ACM-9
job to blocking.

### F-7 — LOW. Evidence locations are inconsistently specified

E4-C01, E4-C02 and E4-C03 give repository-relative suite paths. E4-C04, E4-C05 and E4-C06 give bare
suite names, and E4-C01's "functional-role evaluator unit spec" gives no identifier at all. All
resolve — every named suite was located, and the unit spec is
`services/backend/src/access-control/domain/services/functional-role-evaluator.service.spec.ts` — but
the named suites span two directories (`test/access-control/` and
`test/user-management/access-control-adoption/`) without the plan saying which is which, and E4-C04
in particular names one suite from each.

### F-8 — LOW. Two checklist-mandated presentation items are missing

- **Timeline range.** Resource Estimates give hour intervals (~6–12, ~8–16, ~2–6, ~16–34) with no
  false precision — correct — but no week-range timeline, which the checklist requires alongside.
- **Priority section fields.** The checklist expects each priority section to carry "Criteria" and
  "Purpose". The plan conveys both through descriptive headers ("P0 — authorization boundaries") and
  correctly omits execution context from them, so the intent is met; the stated fields are not
  present.

### F-9 — LOW. Test-level distribution is near-uniformly E2E; confirm as deliberate

Seven of eight bundles are facade or real-HTTP E2E; one unit boundary is named. For authorization
this is defensible and the plan argues it explicitly ("a static check cannot substitute"). But the
`DEFAULT_PERMISSIONS` composition table and the unknown-key fail-closed path are algorithmic edge
cases that are cheaper and more exhaustively covered at unit level, and
`functional-role-evaluator.service.spec.ts` already exists to host them. Recorded as a trade-off to
confirm, not a defect.

---

## Checklist results

Epic-Level mode. System-level-only sections (two-document validation, BMAD handoff validation,
architecture-doc structure) are **not applicable** and were not executed; they are marked N/A with
reasoning rather than passed or failed.

| Checklist section | Result | Notes |
| --- | --- | --- |
| Prerequisites — Epic-Level Mode | **PASS** | Epic and both story tickets exist with acceptance criteria; system pair present and loaded; requirements testable. |
| Step 1 — Context Loading | **PASS** | Checkpoint records epic source, both tickets, sprint status, requirements, architecture, the system pair, and all seven knowledge fragments including `nfr-criteria.md`. Existing test inventory analyzed. |
| Step 2 — Risk Assessment | **PASS** | Six genuine risks (not feature restatements), categories SEC/OPS/PERF applied correctly, P and I within 1–3, all six scores arithmetically correct, ≥6 marked, mitigations with owners and timelines, residual risk documented. |
| Step 2A — NFR Planning | **PASS** | Categories scoped; Contract B threshold extracted verbatim from the binding protocol; unknowns marked UNKNOWN and not guessed; NFR risks mapped into the register as SEC/PERF/OPS/TECH. |
| Step 3 — Coverage Design | **CONCERNS** | Levels, priorities, data prerequisites, tooling and execution order are sound and non-duplicative. Atomic-scenario decomposition from acceptance criteria is incomplete — F-1, F-2. |
| Step 4 — Deliverables Generation | **PASS** | Risk matrix, coverage matrix, execution order, interval estimates, and gate criteria all present; output at the canonical path in template structure. |
| Output — Risk Assessment Matrix | **CONCERNS** | Unique IDs, categories, valid P/I, correct scores, actionable mitigations. High-priority marking is contradicted by the Executive Summary's "six high risks" — F-5. |
| Output — Coverage Matrix | **CONCERNS** | Priorities, risk linkage, realistic counts, owners, no duplicate coverage across levels. Requirement-to-scenario mapping not traceable — F-3; two ACs unmapped — F-2. |
| Output — Execution Strategy | **PASS** | PR / Nightly / Weekly, no tier structure, no test re-listing, philosophy stated in substance ("when they fit the established PR budget"). Playwright-parallelization item N/A — this is a backend Jest/supertest suite that runs serially by the platform isolation policy. |
| Output — Resource Estimates | **CONCERNS** | Intervals throughout, no false precision, setup and complexity accounted for. No week-range timeline — F-8. |
| Output — Quality Gate Criteria | **PASS (with accepted deviation)** | P0 100%, P1 ≥95%, high-risk mitigation ownership, NFR evidence expectation, verdict deferred to `nfr-assess`. The recommended ≥80% coverage target is **deliberately declined**, citing the absence of an approved per-epic percentage; this is correct under index §7 and §"What this index deliberately does not say", which forbid percentage claims. Recorded as a justified deviation, not a gap. |
| Quality — Evidence-Based Assessment | **CONCERNS** | Assumptions documented, no speculation on business impact, open questions preserved rather than promoted. One shipped-code fact material to the P0 claims was missed — F-1. |
| Quality — Risk Classification Accuracy | **PASS** | SEC for authorization boundaries, OPS for the seed script, PERF for the measurement gap. No miscategorization. |
| Quality — Priority Assignment Accuracy | **CONCERNS** | Priority/execution separation is correct: headers carry no execution context, no "Execution:" field, and the "priority, not execution timing" note is present at the top of the Coverage Plan. R06's priority is stated three ways — F-5; the "Criteria"/"Purpose" fields are implicit — F-8. P0 covers four of eight bundles, above the "<10% of scenarios" guidance; accepted here because every P0 bundle is a security boundary with no workaround, and bundles are not individual scenarios. |
| Quality — Test Level Selection | **PASS (trade-off noted)** | E2E confined to authorization-critical paths; no redundant coverage across levels. Unit-level opportunity noted — F-9. |
| Integration — Knowledge Base | **PASS** | `risk-governance`, `probability-impact`, `test-levels-framework`, `test-priorities-matrix`, `nfr-criteria` all recorded as loaded. The `playwright-utils` / `pactjs-utils` mandates are correctly recorded as non-binding: both config flags are true, but neither package is declared in the service manifests. |
| Integration — Status File | **N/A — not executed** | No "Quality & Testing Progress" status file exists in this repository; the only matches are the skill checklists themselves. The canonical checkpoint records scope, identity and completion date and serves this role under the routing contract. |
| Integration — Workflow Dependencies | **PASS** | `atdd` correctly treated as a separate, explicitly-invoked workflow; coverage plan is consumable by `automate`; risks feed `gate`; execution order feeds `ci`. |
| Accountability — Not in Scope | **PASS** | Six exclusions, each with reasoning and a mitigation or owner. Stakeholder acceptance of exclusions is not yet recorded — expected, since approval is ungranted. |
| Accountability — Entry Criteria | **PASS** | Environment, data, isolation, credentials, and the measurement-decision precondition all stated. |
| Accountability — Exit Criteria | **CONCERNS** | Pass/fail thresholds per priority and an explicit statement that generation grants neither approval nor validation. No bug-severity gate is defined. |
| Accountability — Project Team | **N/A** | Optional section; owners are assigned per risk and per coverage row instead. |
| Accountability — Tooling & Access | **PASS** | System-level-only item; the plan states its tooling and data prerequisites anyway, and correctly notes no browser, third-party, or Pact-broker access is required. |
| Accountability — Interworking & Regression | **PASS** | Four impacted components with per-component regression scope; cross-team coordination implied by paired owners. |
| Cross-document consistency (plan vs. canonical system pair) | **PASS** | Contract B parameters match `test-design-qa.md` and `testing-strategy.md` exactly. Contracts A and C excluded by name. ACM-9's informational CI status preserved and explicitly not promoted. Risk IDs are namespaced `PLAT-E4-R0*` with no collision against platform risk IDs, and the plan references rather than re-scores shared risks. Priority vocabulary consistent. No shared policy is restated in violation of the "platform pair is the source" rule. |
| Cross-document consistency (plan vs. sibling epic plans) | **CONCERNS** | The `PLAT-E3` → `PLAT-E4` cross-epic dependency is not received — F-4. |
| Document Quality (anti-bloat) | **PASS** | 202 lines; no repeated note; no emoji; no AI-slop enthusiasm; professional and direct; consistently cross-references rather than duplicating. |
| Completion Criteria | **NOT MET** | Output validations and quality checks do not all pass; see findings. Team review not yet scheduled. |

**Checks not executed, and why:** all System-Level Mode two-document checks, the BMAD handoff
validation block, and the Architecture Doc Structure block — this is an epic-level run, and under
contract §4.5 an epic validation may not evaluate or write system artifacts. The Status File
Integration block was not executed because the file it names does not exist in this repository.
No test was run, no measurement was taken, and no scenario document was executed as part of this
validation; suite existence was confirmed by directory listing only.

---

## Required to clear CONCERNS

1. Name the `profile:timeline:write` / AF-2 deviation and its DEPT-2 closure in the plan — F-1.
2. Add verification obligations for the `dev-grant-root.ts` and deferred-work-closure acceptance
   criteria, and complete E4-C06 against the absence-from-entrypoint and ACM-1 conditions — F-2.
3. Add an acceptance-criterion-to-scenario traceability table — F-3.
4. State the three-versus-six FR reconciliation with an owner (accept it, or exclude it citing
   DEPT-4) and note the stale `acm1r-fr-foundation` lock alongside the E4-C04 evidence — F-4.
5. Reconcile R06's priority across the Executive Summary, the Coverage Plan, and the checkpoint —
   F-5.
6. Record the fixture-manifest/baseline-comparability constraint on E4-C08 and add the GAP-2
   per-request-query question with its inspection-proof alternative — F-6.

Items 7–9 (F-7, F-8, F-9) are improvements, not blockers.

These are Edit-mode corrections to a single epic plan (contract §4.3). Re-run Epic Validate
afterwards for a byte-exact attestation; this report describes the plan at hash `a2793d7d…` and does
not update itself.

---

## Index update

Per contract §4.5, this run updates **only** the `PLAT-E4` validation entry in
`_bmad-output/test-artifacts/test-design/README.md`. It does not touch the system validation report,
the `PLAT-E2` epic report, any plan, any checkpoint, or any other index row.

**Validated by:** BMad TEA Test Design workflow, Validate / Epic-Level, acting as Master Test
Architect.
**Date:** 2026-09-12.
**Approval:** not granted by this report, and not grantable by it.
