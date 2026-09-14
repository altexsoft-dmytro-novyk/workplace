# Test Design Validation Report — Platform (system-level)

> ## Verdict: **PASS** (documentation validation, 2026-09-13, fresh independent System Validate)
>
> System Validate was re-run against the canonical platform artifact set identified below, after
> the 2026-09-13 System Edit that registered `TR-3.2-SELF` (`ACF-TR-01`, option A) in
> `test-design-qa.md` § Normative coverage map. This run supersedes the 2026-09-11 PASS at this
> same path; that prior run remains historical evidence of what it evaluated at the time.
>
> - **Verdict:** **PASS** for documentation and workflow validation. Not a release verdict.
> - **Strict completion:** **CONCERNS** — open product decisions remain in the register (U-4,
>   U-5, U-6, U-9..U-13, U-16, U-17, U-21, U-22); `DEC-UM-012` remains draft; runtime gates and
>   product blockers are separate work.
> - **No coverage percentage and no test pass rate is asserted by this report.**
> - **This document inherits nothing** from the 2026-08-25 User Management validation PASS, and
>   this run's PASS does not inherit the 2026-09-11 run's checklist findings uncritically — every
>   criterion below was re-evaluated against current content, not carried forward. Read the
>   2026-08-25 superseded report at `76a7220…` for history only.

| Field | Value |
| --- | --- |
| Report scope | **Platform (system-level).** `runScope: system-level`, `runKey: system` |
| Verdict | **PASS** (documentation) · **CONCERNS** (strict completion — open decisions remain) |
| Date validated | **2026-09-13** (supersedes 2026-09-11 PASS at this same path) |
| Validated by | System Validate run (workspace); independent of the 2026-09-13 System Edit it evaluates |
| Repository `HEAD` (baseline, before this run's first write) | `e8681c90f7ece602d8ad65560a5f77828f2f4458` — `chore: refresh live verification results` |
| Migration baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (unchanged reference) |
| Matching checkpoint | `test-design-progress-system.md` (`workflowStatus: generated`, approval **granted**, validation **PASS**) |

---

## Scope of this report

**In scope.** Per `docs/test-design-workflow-contract.md` §4.5, system Validate evaluates only
the canonical architecture/QA pair and the literal handoff listed under
[Evaluated inputs](#evaluated-inputs). Epic plans, epic checkpoints, and per-epic validation are
**out of scope** here.

**Out of scope, explicitly.**

- **Product readiness.** This is document and workflow validation. It is not a release verdict.
- **Test execution.** No suite is run by this report and no pass rate is derived.
- **Per-epic validation.** Each epic requires `test-design-validation-report-epic-{domain}-{number}.md`.
  `epic-platform-2`'s own fresh Validate ran separately in this same session; see that report.
- **Runtime evidence** — separate from this document validation.
- **Re-opening the `ACF-TR-01` decision.** The user, acting as QA + Architect, already decided
  option A (register `TR-3.2-SELF` rather than fold Self into an existing `TR-3.2-S*` row). This
  report verifies the registration was carried out correctly; it does not re-adjudicate the choice.

---

## Evaluated inputs

Paths relative to `_bmad-output/test-artifacts/` unless shown in full. Hashes computed 2026-09-13
with `shasum -a 256` at repository `HEAD` above (working tree, uncommitted).

### Platform artifacts (evaluated)

| Path | SHA-256 | Evaluated? |
| --- | --- | --- |
| `test-design-architecture.md` | `133efa612ad55b012fc8be9bc6a77d1d6f55e4bbdba99a8ee0404acccb648ec5` | **Yes** |
| `test-design-qa.md` | `54338ca7cd72c6f88f431fb1ade4bcee2eaa7d34324806f4b262ea21cc300cef` | **Yes** |
| `test-design/people-management-handoff.md` | `b9ac44ecc1820071c266d811559c18ef3a43e4f72fcfda9707361271050c4e90` | **Yes** |

`test-design-architecture.md`'s hash is byte-identical to the one recorded in the 2026-09-13
`epic-platform-2` validation report (same session); it is **not** touched by the `ACF-TR-01`
System Edit. `test-design-qa.md`'s hash reflects the 2026-09-13 System Edit that added
`TR-3.2-SELF`; it differs from every prior recorded hash for this file, as expected.
`test-design/people-management-handoff.md` is unchanged by this Edit.

### Reference inputs

| Path | SHA-256 | Role |
| --- | --- | --- |
| `test-design/migration-map.md` | `4be9d20316249e3c4470f5a83416ad99e595108814d3256d2d78247fc32a9ccb` | Disposition ledger checked against outputs (unchanged; `TR-3.2-SELF` is a post-migration System Edit addition, not a ledger-routed row, and does not need a ledger entry) |
| `docs/project-requirements.md` | `495017d0bc2f1c01ae5c7b1cdd6d4753f9c32410eb2ba1e2e3ca88003f4bf0d8` | v1.5 normative authority — source for `TR-3.2-SELF`'s §1 roles table / §3.2 audiences citations |
| `docs/architecture/access-control.md` | `bdbe74a27a04a159b547c2a9c5ac990c2703a51cb504707e71568473661fee34` | Architecture-only source for the Self-exclusivity clause (§ Audience columns (3.2), rule 3, `PM/AD-28`) cited by the new row's dependency column |
| `docs/architecture/testing-strategy.md` | `5fef0505d9460430f503071f6fbb9bd69b91acfca063df85dc4f06110e0a3708` | Binding policy (incl. DIR-A1 / DIRA1-MVP-v1) |
| `docs/architecture/user-management-test-decisions.md` | `e361c88b276591adb48295133304efe28f91bb1ea70e2efdd7b152ff2d7dbed3` | `DEC-UM-001..012`; `DEC-UM-012` **draft** |
| `docs/test-cases/access-control-foundation/audience/acf-au-01-self.md` | `bea4521a72044186f73d777433108b8e888833e7fa0e318033053e1aaf845b97` | Primary U-19 evidence cited by `TR-3.2-SELF` |
| `docs/test-cases/access-control-kernel/multi-audience/acm4r-ma-02-self-exclusive-after-confirmation.md` | `1fda5988444cc626b2c7ec4c88e456d625a4fb77e57d5ec1ca654b2d60f9f2ed` | Component U-19 evidence cited by `TR-3.2-SELF` |

---

## Independent re-verification of the 2026-09-13 System Edit

Every claim the Edit added to `test-design-qa.md` was checked directly against its cited source,
not accepted on the Edit's own word.

- **Row uniqueness.** `grep -rn "TR-3.2-SELF"` across the repository returns only the newly added
  occurrences (the normative coverage map row, the U-19 mapping row, the System Edit note, the
  Correction Log entry in `test-design-epic-platform-2.md`, and the two scenario-document
  citations). No pre-existing use of `TR-3.2-SELF` or `TR-2.1-00` exists. **Claim holds.**
- **Requirement source.** `docs/project-requirements.md` §1 roles table states, for Employee:
  "Grants access to one's own profile (Self)"; §3.2 audiences list states "Self — the employee
  whose profile it is," and the §3.2 section matrix carries a Self column distinct from Reporting
  line/Project line/PP/Colleague through S1–S16. **Confirmed as read; the row's text does not
  overclaim v1.5 as stating exclusivity in those words.**
- **Exclusivity source is architecture-only, correctly labelled as such.** `docs/architecture/access-control.md`
  line 303 states verbatim: "When `viewerId === targetId`, Self is exclusive of Reporting,
  Project, PP, and Colleague (PM/AD-28)." The new row's dependency column cites this as an
  **architecture-only source**, not v1.5 normative text, and the row does not misattribute this
  clause to project-requirements.md. **Claim holds.**
- **Primary evidence.** `docs/test-cases/access-control-foundation/audience/acf-au-01-self.md`
  asserts `resolveAudiences(<alice-id>, [<alice-id>])` yields exactly `{self}` as the primary
  oracle (per its 2026-09-13 `ACF-AU-R1` rework), and its own line 5 now cites `TR-3.2-SELF`
  matching the phrasing pattern of `acf-au-02-reporting-direct.md:5`. **Confirmed.**
- **Component evidence.** `docs/test-cases/access-control-kernel/multi-audience/acm4r-ma-02-self-exclusive-after-confirmation.md`
  asserts `resolveAudiences(martaId, [martaId])` returns exactly `Set {'self'}`, containing
  neither `reporting`, `pp`, nor `colleague` — the mechanism-level proof of exclusivity after
  identity confirmation. Its own U-19 note was updated to also cite `TR-3.2-SELF`, alongside its
  pre-existing `TR-2.1-01` citation, without removing or contradicting that citation. **Confirmed.**
- **Orphan finding closure.** The prior text "`ACF-AU-01` (Self) has no corresponding `TR-*` row at
  all" is no longer present unqualified; it now reads as **resolved 2026-09-13** and names the
  decision (option A) and the new row. **Confirmed by direct read.**
- **Row-count arithmetic.** 119 → 120 total rows; `AC STAGE-1 DRAFT` 23 → 24; the other five
  planning-state counts (45/23/21/4/3) are unchanged, and 45+24+23+21+4+3 = 120. U-19 evidenced-row
  count 14 → 15 of 120; 120 − 15 = 105, matching the unchanged zero-evidence count stated
  elsewhere in the same section. **Arithmetic checks out.**
- **Decision attribution.** The System Edit note, the orphan-finding resolution, and the
  `test-design-epic-platform-2.md` Correction Log entry all attribute the choice of option A to
  "the user, acting as QA + Architect," consistently, and none claims this run made the decision.
  **Consistent.**
- **No retroactive rewrite of prior reports.** The System Edit note explicitly states it does not
  rewrite the 2026-09-11/2026-09-12 validation-report hashes. This report is the fresh Validate
  that note itself points to. **Consistent — no circular or self-contradictory claim found.**

---

## Validation results

| # | Criterion | State | Notes |
| --- | --- | --- | --- |
| 1 | Every ledger row's `target_path_and_anchor` resolves to a section that exists in the named output | **PASS** | Spot-checked migration targets; consolidation PR #52 canonical set in force. `TR-3.2-SELF` is a post-migration addition, outside the ledger's own row set, and does not disturb any ledger target |
| 2 | Every `retire` row's obligation is absent from the outputs as an active obligation | **PASS** | Retired scenarios and superseded gates not reintroduced as active |
| 3 | Every `merge` row's origins resolve to declared successor(s) | **PASS** | No orphan merge targets found in platform pair |
| 4 | Outputs do not falsely claim coverage or pass rates; approval/validation stated only after earned | **PASS** | `TR-3.2-SELF` states planned level and planning state (`AC STAGE-1 DRAFT`), not an achieved coverage; no pass rate is asserted for it |
| 5 | Architecture owns risk identity; QA owns evidence/execution; no duplicated shared rules | **PASS** | Ownership split preserved; the new row and its System Edit note live only in `test-design-qa.md`, not duplicated into `test-design-architecture.md` |
| 6 | Every epic plan has matching checkpoint | **OUT OF SYSTEM SCOPE** | Epic Validate |
| 7 | No missing/extra epic plans vs obligations | **OUT OF SYSTEM SCOPE** | Epic Validate + index audit |
| 8 | Index resolves every scope with owner | **OUT OF SYSTEM SCOPE** | Index audit |
| 9 | Three performance contracts separate; contract A bound to `DIRA1-MVP-v1` | **PASS** | Unaffected by this Edit |
| 10 | All Employees list NFR stated as **P0** | **PASS** | `P0-PLAT-08` / `PG-04`, unaffected |
| 11 | No per-scenario approval state; AC inventory **99 scenario documents** (9 foundation + 90 kernel; 101 raw Markdown files including READMEs) | **PASS** | Stage-approval removal respected; inventory count unaffected by citing two of those 99 files from a new `TR-*` row |
| 12 | Open decisions U-4..U-22 documented; U-19 resolved and now reflects the `ACF-AU-01` closure | **PASS** | U-19's orphan finding is updated in place, not left contradicting the new row |
| 13 | No consumer points at removed artifact with rewritten semantics | **PASS** | Historical citations use commit links |
| 14 | Migration boundary: no scenario/trace/sprint mutation by *this Validate run* | **PASS** | This Validate run itself writes only the report, index row, plan/checkpoint validation projections. The System Edit that preceded it (and that this run evaluates) did touch two scenario documents' inline U-19 notes, as the contract permits for a confirmed system-pair member's citations — no scenario **content** (scenario, expected result, or test) was altered, only the coverage-map cross-reference sentence in each |

---

## Two verdicts

| Verdict | Result | Meaning |
| --- | --- | --- |
| **Documentation validation** | **PASS** | Platform artifact set, including the 2026-09-13 `TR-3.2-SELF` registration, is internally consistent, correctly scoped, and ready for use as planning authority |
| **Strict completion** | **CONCERNS** | Human approval and Validate are recorded; product blockers, open U-* decisions, and runtime gates remain |

---

## Supersession history

- **2026-08-25** — User Management validation PASS. **Superseded** (historical at `76a7220…`).
- **2026-08-29** — Platform Create run carried no validation verdict. **Superseded.**
- **2026-09-10** — Consolidation migration established scope; verdict **NOT RUN**.
- **2026-09-11** — Human approval granted; system Validate **PASS** recorded. **Superseded** by
  this report for a byte-exact attestation of current content; its checklist findings remain
  accurate for what it evaluated at the time.
- **2026-09-13** — Fresh independent system Validate, evaluating the `ACF-TR-01` System Edit
  (`TR-3.2-SELF` registration). **PASS (this report).**

---

## Boundary

This report does **not** authorise deployment or assert product/release readiness. The
whole-repository trace remains a planning audit with `allow_gate=false`. Open product decisions,
runtime evidence, and epic-level validation are separate work.

## 2026-09-11 current-state clarification — formal package sign-off

This report's prior statement that both `PR-S-*` sign-offs were ungranted is point-in-time
validation evidence, not a rewritten historical claim. Current state is the
[2026-09-11 PM memlog decision](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md): the user's explicit Product Owner + Architect approval grants sign-off for `PR-S-01` / `CC-04` and `PR-S-02` / `CC-06`. PM/AD-19 and PM/AD-20 are directions, not approval. The decision does not close `CC-04`, `CC-06`, `CC-07`, `CC-08`, `CC-09`, or `OPERATIONAL-ENVELOPE`, and does not assert implementation, production, evidence, or release readiness.

## 2026-09-12 current-state clarification — Story 1.6 closure

The `U-16` item in the strict-completion summary is a 2026-09-11 validation snapshot. On
2026-09-12, Story 1.6 was resolved as a **documentation/evidence refresh only**: the canonical
QA document now pins the historical functional-P0 result and the ACM-9 Contract-B evidence, while
the architecture document corrects TimeTracker source provenance beside its live successor gates.
This removes Story 1.6's false product-FR attachment and changes its sprint key to `done`; it does
not close a runtime gate, product requirement, or release condition. This clarification does not
claim a new System Validate run or revise the hashes recorded above.

## 2026-09-13 clarification — `ACF-TR-01` / `TR-3.2-SELF`

This run's own PASS verdict already covers the `TR-3.2-SELF` registration (see § Independent
re-verification above); this note only restates the boundary for a reader who lands on this
section directly. Registering a normative-coverage row, and mapping existing scenario files to it,
is a documentation and catalog action. It does not itself execute a test, grant coverage, or
change `PG-01`'s schedulability, which stays governed solely by U-20 (`SEC-AUTH-01`, `CC-07`,
`AC-S9-S13`, `AC-SECTION-MATRIX-01`). It does not resolve any other open U-* item.
