---
title: 'TEA Platform Test Design → BMAD Handoff'
version: '2.0'
workflowType: 'testarch-test-design-handoff'
sourceWorkflow: 'testarch-test-design'
generatedBy: 'Test-design consolidation migration, Task 3'
generatedAt: '2026-09-10'
projectName: 'people management'
runScope: 'system-level'
runKey: 'system'
approval: 'granted'
approvedAt: '2026-09-11'
validation: 'PASS'
validatedAt: '2026-09-11'
status: 'approved — validation PASS (system-level, 2026-09-11)'
baselineCommit: '76a7220701ac6f16843dad8b303934f9a958b54c'
---

# TEA → BMAD Integration Handoff (Platform)

> ## Status: **approved**. This document inherits nothing from the two documents it replaces.
>
> This path previously held the **User Management** handoff, whose frontmatter read
> `status: 'approved'` and whose footer read "**Status:** Approved 2026-08-25. Stage-1
> scenarios updated; ATDD is the next workflow." **That approval does not transfer to this
> document.** The second source,
> [`test-design/people-management-platform-handoff.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design/people-management-platform-handoff.md), was an
> explicitly unapproved 2026-08-29 v1.5 draft.
>
> - **Approval:** **granted 2026-09-11** (explicit stakeholder confirmation in workspace).
> - **Validation:** **PASS** — system Validate recorded in `test-design-validation-report.md`
>   (2026-09-11). Not a release verdict.
> - **Coverage:** none asserted. No pass rate, no percentage and no green gate appears
>   anywhere in it.
> - **Scope changed with the filename.** The old document at this path was scoped to the
>   `user-management` bounded context. This one is the **single platform handoff**.
>
> Because the filename is reused, any statement written before 2026-09-10 about "what
> `people-management-handoff.md` says" describes the old document. Read either superseded
> handoff at its commit:
> [`people-management-handoff.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design/people-management-handoff.md)
> ·
> [`people-management-platform-handoff.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design/people-management-platform-handoff.md)

**Path selection.** This is the **only** handoff. `_bmad/config.toml:14` sets
`project_name = "people management"` (with a space) while the stock workflow derives the
handoff path as `{test_artifacts}/test-design/{project_name}-handoff.md`. The hyphenated
path above is **explicitly selected** and is not derivable from that template; the workflow
contract (plan Task 4) pins it so that a display-name space cannot create a second handoff.

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Baseline commit:** `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`)
**Migration record:** `_bmad-output/test-artifacts/test-design/migration-map.md`
**Index:** `_bmad-output/test-artifacts/test-design/README.md`

---

## Purpose and boundary

This handoff translates the platform test design into BMAD epic and story planning guidance.
It carries **authority order, planning states, story mapping rules, phase-transition gates and
the source-to-successor ID map** forward. It does **not** generate test cases, prescribe
implementation, grant an approval, issue a validation verdict, or assert coverage.

Two sources collapsed into it:

| Source at `76a7220` | Was | Became |
| --- | --- | --- |
| [`test-design/people-management-handoff.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design/people-management-handoff.md) | UM handoff, `status: approved` 2026-08-25 | this document (scope replaced), plus the epic plans and `test-design-qa.md` for its per-ID content |
| [`test-design/people-management-platform-handoff.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design/people-management-platform-handoff.md) | platform handoff, `status: draft`, 2026-08-29 v1.5 Create run | this document, plus `test-design/README.md` and `test-design-qa.md` |

Neither source is deleted by this document. Their removal is a separate, sequenced step
(plan Task 3e) that runs only after every destination is proved to exist.

**Manual review remains necessary** for architecture and product decisions, accessibility and
responsive behaviour, live Timetracker operation, deployment rehearsal, and residual-risk
acceptance. Automation candidates remain stable authorization regression, feature state
machines, projection negatives, contract-failure paths, XLSX entitlement checks, performance
thresholds, privacy scans, and trace-state validation.

---

## Authority order

1. `docs/project-requirements.md` **v1.5** is the normative product authority.
2. `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md` plus
   `addendum.md` provide current product context without weakening v1.5. Historical PRDs —
   including `prd-user-management-2026-08-20`, cited by the superseded UM handoff — are **not**
   current requirements.
3. `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`
   (PM/AD-1..AD-34+) and the binding rendered rules under `docs/architecture/` bind architecture.
4. `test-design-architecture.md` and `test-design-qa.md` are the current TEA planning
   authorities. Both are **ungranted**.
5. Epic plans own their epic's specific scenario and risk coverage and reference, never restate,
   the shared rules.

**The child/parent framing is dissolved.** There is no longer an "approved User Management
child" whose approval shields it from this baseline. Its obligations are now nine
domain-qualified epic plans, all **ungranted**.

---

## Current artifacts

The authoritative inventory is the index, `test-design/README.md`. Reproduced here only far
enough to route a reader:

| Artifact | Path (under `_bmad-output/test-artifacts/`) | BMAD integration point |
| --- | --- | --- |
| Platform architecture test design | `test-design-architecture.md` | Risk identity, scores and rationale; architecture seams; testability gaps; NFR contract references |
| Platform QA test design | `test-design-qa.md` | Evidence contracts, execution and isolation policy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog |
| Epic plans (nine) | `test-design-epic-{domain}-{number}.md` | Per-epic scenario and risk coverage for story acceptance criteria |
| System checkpoint | `test-design-progress-system.md` | Platform run state (`runScope: system-level`, `runKey: system`) |
| Epic checkpoints (nine) | `test-design-progress-epic-{domain}-{number}.md` | Per-epic run state |
| Validation report | `test-design-validation-report.md` | Migration-era validation **scope**; currently **NOT RUN** |
| Index | `test-design/README.md` | Scope index, unplanned scopes and owners |
| Migration record | `test-design/migration-map.md` | Where every obligation went, and on whose authority |

---

## Planning states

Every platform story records **exactly one** planning state. The definitions are owned by
`test-design-qa.md` § Coverage-state vocabulary; the summary is:

| State | Meaning |
| --- | --- |
| **READY NOW** | Design intent is sufficiently defined for Stage-1 work. It does **not** mean a scenario, test, implementation or release outcome is approved. |
| **READY FOR FORMAL SIGN-OFF** | Specified sufficiently for Stage-1 design and review; E2E and implementation wait for explicit Product Owner / Architect sign-off. |
| **PRODUCT/ARCH BLOCKED** | An open decision blocks it. Do not design through an unresolved decision. |
| **E2E DEPENDENCY** | Defined, but cannot claim executable evidence until its named dependency exists. |

> **`AC STAGE-1 DRAFT` is retired as a planning state, under ruling D-1.** The 23 rows that
> carried it recorded a **source** state, and they survive only as history in the migration map.
> `docs/architecture/testing-strategy.md:25–38` removed per-file approval status from
> `docs/test-cases/**` on 2026-09-04: "draft", "pending approval" and "unapproved" are no longer
> meaningful states for a scenario document, which is either present or absent. **No story may
> carry `AC STAGE-1 DRAFT` as an active state, and no work item may ask anyone to establish or
> reconstruct an approval state for a `docs/test-cases/**` file.** What survives unchanged is the
> separate rule that a **present scenario document is not coverage**.

**Open blockers and sign-off packages** are owned by `test-design-architecture.md` § Open
blockers and § Formally signed-off packages with implementation blockers. Six of the nine `PR-B-*` blockers are closed **at
design only**; **none is closed at implementation**, and both `PR-S-01` and `PR-S-02` sign-offs are
[recorded in the PM memlog](../../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md). A design artifact is not mitigation completion; neither approval closes an implementation or evidence blocker.

---

## Story mapping rules

Every platform story must:

1. Cite at least one stable `TR-*` row from `test-design-qa.md` § Normative coverage map and the
   applicable v1.5 section. Migrated User Management stories cite their `TD-UM-*` identifiers as
   carried into the owning epic plan — **not** as approved coverage.
2. Record exactly one planning state from the table above.
3. Link applicable `PR-*` risks, `PR-B-*` blockers and `PR-S-*` sign-off packages **without
   renumbering** the User Management `R-*` or the epic-scoped `R-UM-*` / `R-FE-*` identifiers.
   These are different risks in different scopes; the migration map's scope keys
   (`legacy-um:`, `plat:`, `um-epic:`, `fe-epic:`) exist to keep them apart.
4. State the owning domain and any consumer or integration evidence owner. Do not assign
   feature-workflow proof to Access Control; an access-boundary response is not substitute
   evidence for a consumer surface.
5. Preserve omitted, narrowed and flag-gated data across API, UI, list, filter, export, search,
   errors, shared links and selected optional notifications. Restricted values are **absent, not
   `null`**, and must not be inferable through another surface.
6. **Avoid invented thresholds**, provider behaviour, role grants, APIs or business rules. Where
   a parameter is unknown, it stays unknown.

Acceptance intent to carry into stories, without generating cases:

- Functional capability never widens data audience; a mutation needs **both** gates.
- Platform-owned relationship revocation is **next request**; project-derived change is within
  **15 minutes** and access is withdrawn after **four failed hours**; a due departure cuts off
  **at request time**.
- Direct-PP audience and PP-mutation Stage-1 design and review may use requirements plus AD-19
  now. E2E and implementation wait for `PR-S-01` sign-off; journal-dependent execution also
  waits for `PR-B-07 / CC-07`.
- Scheduled-departure Stage-1 design and review may use requirements plus AD-20 now. E2E and
  implementation wait for `PR-S-02` sign-off; `PR-B-09` remains the distinct operational
  evidence gate.
- HR Admin is **configuration-only** and has no blanket employee-data audience.
- Timetracker is the required live integration. PeopleForce vacancy synchronisation is **not** a
  requirement; required PeopleForce behaviour is candidate ID and link storage. Resourcing
  vacancies are platform-owned.
- **The All Employees list ≤ 2-second requirement is P0.** It is a distinct subject from the
  ACM-9 facade-resolver measurement and from the P6 `resolveAudiences` measurement. See below.

---

## The three performance contracts stay separate

Owned in full by `test-design-qa.md` § The three performance contracts must stay separate.
Restated here only because a story author reading a handoff is exactly who conflates them.

| Contract | Subject | State |
| --- | --- | --- |
| **A** | The **All Employees list** at 500+ records with arbitrary filters and derived fields, including permission resolution, ≤ 2 seconds (v1.5 §7). Release gate `PG-04`. **Priority P0.** | Harness **`DIRA1-MVP-v1`**. **PASS** — `performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json` (local env). |
| **B** | The **AccessControl facade resolver** at 500 requested active targets, per-shape gates, `ACM9-MVP-v1`. | A binding protocol with its own thresholds. Its CI job is **informational** and this migration proposes no promotion of it to a blocking check. |
| **C** | The **`resolveAudiences` function**, P6 measurement in milliseconds. | A measurement record, **not a gate**, and must never be treated as one. |

**B and C are not evidence for A.** A story that cites an ACM-9 or P6 artifact against the
All Employees requirement is citing the wrong subject. **`QUALITY-GATE-AC-NFR` governs contract B
only** (U-25 resolved). Directory-list evidence is evaluated against release gate **`PG-04`** /
contract **A**; `PMC-E1-S1.9` cites `PG-04`, not `QUALITY-GATE-AC-NFR`.

---

## Phase transition gates

Merged from both sources' gate tables. **Every gate is ungranted — naming a gate is not
passing it.** The gate register itself is `test-design-qa.md` § Release and design gates.

| From | To | Gate criteria |
| --- | --- | --- |
| Create run (this migration) | Human review | Current v1.5 authorities and inventory reconciled; superseded planning assumptions removed. **This document carries no approval, and the migration issues no verdict.** |
| Human review | BMAD epic/story creation | Review accepts handoff use; every story cites stable trace and risk IDs and exactly one planning state |
| Epic/story creation | Stage-1 design | The exact blocker for the slice is resolved, or the story is READY NOW; owner and evidence boundary are named |
| `PR-S-01 / CC-04` package | PP Stage-1 design and review | May proceed now against requirements plus AD-19. No E2E or implementation authorization is implied |
| `PR-S-02 / CC-06` package | Scheduled-departure Stage-1 design and review | May proceed now against requirements plus AD-20. No E2E or implementation authorization is implied |
| PP or departure Stage-1 | Stage-2 red E2E | Explicit `PR-S-01`/`PR-S-02` Product Owner / Architect sign-off as applicable; PP journal execution also requires `PR-B-07 / CC-07` |
| Any Stage-1 scenario document | Implementation | **`DG-01` ordering:** a scenario document exists, then a **committed-red** Stage-2 test, then production code written until it passes. **The per-stage human-approval clause is retired** (ruling D-1; `testing-strategy.md:25–38`). The **no-self-certification** principle survives as a review norm, as do the narrow validation-only evidence exception and the Kernel MVP exception |
| Implementation | Automated / integration evidence | Feature acceptance behaviour is green; consumer and provider contracts are available; synthetic seeded data only |
| Evidence collection | Trace / NFR assessment | Required v1.5 rows have current evidence or an explicit blocker/dependency; NFR thresholds are sourced, not guessed |
| Trace / NFR assessment | Release | `PG-01`..`PG-06`, with any explicit waiver or accepted residual risk recorded. See the note below |

**Thresholds carried from the superseded gate tables:** P0 = 100 % covered · P1 = ≥ 95 %
covered · the access-control suite passes. The fourth, "k6 baseline or waiver", is restated as
**"All-Employees-list performance baseline or a recorded waiver, harness undecided"**. *These
are carried as thresholds only; this document computes, asserts and publishes no coverage
percentage against any of them.*

> **`PG-01` — access control is NOT schedulable, on a replaced rationale.** The superseded
> rationale ("while the **171** Phase-1 files await **per-file approval**") is retired in full:
> the per-file approval gate was removed on 2026-09-04 and was the gate's only stated support,
> and the 171-file subject does not exist. **Correction, explicitly labelled and not a current
> input:** the real inventory is **99 scenario documents** — `docs/test-cases/access-control-foundation/`
> (9) and `docs/test-cases/access-control-kernel/` (90), with **101** raw Markdown files when both READMEs are included. The cited path
> `docs/test-cases/access-control/` does not exist. The gate is nevertheless **not** promoted to
> schedulable: three currently open blockers (`SEC-AUTH-01` P0, `CC-07` P0,
> `AC-S9-S13`/`AC-SECTION-MATRIX-01` P1) independently keep it unschedulable, none of which is
> an approval state. **Schedulable condition (U-20 resolved):** all four blockers closed at
> implementation in the current blocker register; evaluated by Platform epic owner + Architect with
> a current re-verification record.

> **The whole-repository trace remains a planning audit run with `allow_gate=false`.** Its
> aggregate percentage is never release readiness. This migration issues no verdict and
> regenerates no trace artifact.

---

## Recommended BMAD → TEA workflow sequence

**No step below is marked complete.** The superseded UM handoff marked steps 1–3 complete as of
2026-08-25; those completions describe the 2026-08-25 run and do not transfer.

1. **Human review of the migrated artifact set** — the architecture design, the QA design, this
   handoff, the epic plans and the index. Do not reuse any superseded validation verdict.
2. **Validate run** — a separate workflow. `test-design-validation-report.md` currently records
   scope only, with verdict **NOT RUN**.
3. **BMAD epic/story decomposition** — map stories to stable `TR-*`, `PR-*` and exact
   blocker/dependency states through the index and the owning epic plan.
4. **Progress sign-off-ready Stage-1 design** — PP work under `PR-S-01` with AD-19; scheduled
   departure under `PR-S-02` with AD-20. Obtain formal sign-off before E2E or implementation.
5. **Record implementation and evidence work for ratified decisions and remaining open blockers**
   — For design-closed items (`PR-B-01`..`04`, `PR-B-06`, and the HR-Admin half of `PR-B-05`),
   complete the named successor work in `test-design-architecture.md` § Ratified design decisions
   without reopening design discovery. For live blockers (`PR-B-05` default-role half,
   `PR-B-07 / CC-07`, `PR-B-08`, `PR-B-09`), satisfy the closure conditions in § Open blockers,
   each only within its stated boundary.
6. **TEA ATDD as a separate explicit workflow** — produce committed-red Stage-2 evidence under
   the current `DG-01` ordering.
7. **BMAD implementation** — only against red evidence and current architecture contracts.
8. **TEA Automate / integration evidence** — stable regression, consumer, contract, performance
   and operational evidence, when the dependencies exist.
9. **TEA Trace and NFR assessment** — verify required v1.5 rows and assess sourced NFR evidence.
   Do not infer final status from planning.
10. **Release gate review** — apply `PG-01`..`PG-06` and record any explicit waiver or accepted
    residual risk.

---

## Source-to-successor ID map

**Migration metadata, not coverage.** It lets a reader resolve any identifier from either
superseded handoff to where its obligation now lives. Per-ID rows are in
`test-design/migration-map.md`; this table resolves **families**.

### Risk identifiers

| Source family | Source | Successor location | Note |
| --- | --- | --- | --- |
| `R-001`..`R-014` (scope key `legacy-um:`) | UM handoff § Risk-to-Story Mapping | `test-design-architecture.md` § Risk register and the owning epic plans; per-ID in migration map §4.1 | **Not renumbered.** `R-003`, `R-004`, `R-013` are **retired** (their decisions became normative: DEC-UM-004, DEC-UM-005; and PM/AD-16 removes the create path). `R-005` **merges into `PR-006`** — same All Employees latency risk, different stated subject. `R-008` merges into `test-design-qa.md` § Execution strategy. `R-012` merges into `PR-010`. |
| `PR-001`..`PR-010` (scope key `plat:`) | platform handoff § Risk-to-Domain Mapping | `test-design-architecture.md` § Risk register, with evidence in `test-design-qa.md` § Risk → evidence map | All ten keep their identifier, score and P×I. **No score is renormalised.** `PR-009`'s subject is restated against the real 99-scenario-document access-control inventory; `PR-006` absorbs `legacy-um:R-005`; `PR-010` absorbs `legacy-um:R-012`. |
| `R-UM-*`, `R-FE-*` | the retired area plans, not the handoffs | the owning epic plans, or the QA improvement backlog where no product epic owns them | Listed here because handoff readers meet them next. `R-UM-04` scores **6**; its "Medium (Score 3–4)" heading was the defect, not the score. |

### Test and trace identifiers

| Source family | Source | Successor location | Note |
| --- | --- | --- | --- |
| `TD-UM-AUTH-01..06` | UM handoff § Story-Level | `test-design-epic-user-management-2.md` | `TD-UM-AUTH-06` is the subject of **draft** `DEC-UM-012`, which stays draft and does not inherit the DEC-UM-001..011 approval (U-6). |
| `TD-UM-PF-01..04` | UM handoff § Story-Level | `test-design-epic-user-management-1.md` | Survive. |
| `TD-UM-REG-01..13` | UM handoff § Story-Level | largely **retired**; surviving identity invariants in `test-design-epic-user-management-1.md` | Retired under the v1.5 no-create-path cutover (PM/AD-16, AD-21; DEC-UM-006 and DEC-UM-008 RETIRED). **Retired obligations must not reappear as active ones.** |
| `TD-UM-DEACT-01..03` | UM handoff § Story-Level | **retired or replaced**; successors in `test-design-epic-user-management-5.md` | PM/AD-21, AD-22. |
| `TD-UM-CT-01` | UM handoff § Story-Level | `test-design-epic-user-management-1.md` | **Re-homed** under DEC-UM-008 (`joined_company` in import row transaction); cross-references `UM-E3`. |
| `TD-UM-CT-02..08` | UM handoff § Story-Level | `test-design-epic-user-management-3.md` | Survive. |
| `TD-UM-LIST-01..04` | UM handoff § Story-Level | `test-design-epic-user-management-1.md`, with the visibility-safe half in `test-design-epic-user-management-7.md` | Net-new on 2026-08-25. |
| `TD-UM-REL-01..08` | UM handoff § Story-Level | `test-design-epic-user-management-4.md`; the mentorship split (`REL-04/05/06` and half of `REL-07`) to `test-design-epic-mentorship-1.md` | Mentorship became its own domain; the re-home is not inheritance. |
| `TD-UM-AC-01` | UM handoff cross-epic gate | `test-design-epic-user-management-0.md` | With `legacy-um:R-001`'s epic half. |
| `TD-UM-NFR-*` | UM handoff / QA design | `test-design-qa.md` § NFR measurement contracts | `TD-UM-NFR-PERF-01` becomes **contract A**; harness **`DIRA1-MVP-v1`** (U-24 resolved). `TD-UM-EXP-02` stays **retired** — its "if limits specified" trigger is unmet (U-11). |
| `TR-*` (119 rows) | platform handoff and QA design | `test-design-qa.md` § Normative coverage map | Identifiers unchanged. |

### Gate, blocker and decision identifiers

| Source family | Successor location | Note |
| --- | --- | --- |
| `PG-01`..`PG-06` | `test-design-qa.md` § Release and design gates | Identifiers unchanged. `PG-01` keeps its conclusion on a **replaced** rationale with a recorded schedulable condition (U-20 resolved). `PG-04` is bound to contract A; `QUALITY-GATE-AC-NFR` is contract B only (U-25 resolved). |
| `DG-01`..`DG-04` | `test-design-qa.md` § Design gates | `DG-01` restated under D-1. **`DG-05` is retired with no successor** — it was a child-ownership gate premised on the split this migration dissolves. |
| `PR-B-01`..`PR-B-04`, `PR-B-06`, HR-Admin half of `PR-B-05` | `test-design-architecture.md` § Ratified design decisions | Closed **at design**; implementation or evidence work may remain. |
| `PR-B-05` (default-role half), `PR-B-07`..`PR-B-09` | `test-design-architecture.md` § Open blockers | Open at design and/or implementation; none closed at implementation. |
| `PR-S-01 / CC-04`, `PR-S-02 / CC-06` | `test-design-architecture.md` § Formally signed-off packages with implementation blockers | **Granted** by the [recorded PO + Architect decision](../../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); independent implementation blockers remain open. |
| `DEC-UM-001`..`DEC-UM-012` | `docs/architecture/user-management-test-decisions.md` (unchanged by this migration) | `DEC-UM-012` stays **draft**. `DEC-UM-006` and `DEC-UM-008` are RETIRED. |
| Legacy story numbers `1.1`..`4.2` | canonical `UM-E{n}-S{n.m}` identities in the epic plans | Nothing is renumbered; the old bare numbers were never canonical epic identities. Story 1.4 "Deactivate" has **no** canonical successor under PM/AD-16 / AD-22. |
| `frontend` as an epic identity | **retired** | `frontend` is not a domain and not an epic. Its obligations re-home to epic plans or the QA improvement backlog. |

### Where the old handoff's other sections went

| Superseded section | Destination |
| --- | --- |
| UM § TEA Artifacts Inventory · platform § Authority and Artifact Inventory | `test-design/README.md` § Current artifacts (this document keeps a routing copy) |
| UM § Epic-Level Integration Guidance · platform § Epic and Domain Integration Guidance | `test-design/README.md` § Scope index and the nine epic plans |
| UM § Recommended Quality Gates · platform release gates | `test-design-qa.md` § Release and design gates |
| UM § Data-TestId Requirements | `test-design-qa.md` § Frontend. The "deferred — API-first gate" framing is stale; the frontend exists |
| UM § Risk-to-Story Mapping · platform § Risk-to-Domain Mapping | `test-design-qa.md` § Risk → evidence map |
| platform § Planning-State Boundaries | `test-design-qa.md` § Coverage-state vocabulary, summarised above |
| UM § Follow-up Actions for Product / Architecture | items 1–5 are propagated as DEC-UM-001..011; **item 6 asked for an approval this migration explicitly does not carry** and is retired |
| UM workflow steps marked complete (2026-08-25) | **retired as current statements**, pinned as history at `76a7220` |

---

## Open questions this handoff does not answer

Recorded so a story author does not mistake silence for resolution. Full register:
`test-design/migration-map.md` §10.

**U-2** resolved — `PR-S-*` sign-off closure rule · **U-4** WCAG level and viewport set · **U-5** uptime SLO,
RTO, RPO, backup and retry envelope · **U-6** draft `DEC-UM-012` · **U-9** whether the three
permission keys get seeded · **U-10** browser support beyond Chromium · **U-11** frontend
budgets, accessibility requirements and photo-upload limits · **U-12** resolved by DEV
(2026-09-11) — co-located `*.test.ts`/`*.test.tsx`, second vitest config,
`@testing-library/react`; `services/frontend` branch `feat/u-12-unit-component-testing`
(`60bc882`), not yet merged · **U-13** proactive logout · **U-16** whether platform Story 1.6 is satisfied ·
**U-17** what closes the six design-closed blockers at implementation · **U-18** the
self-contradiction in `docs/architecture/testing-strategy.md` · **U-19** which access-control
scenario file covers which `TR-*` row · **U-21** the
20 history-only retired scenario files · **U-22** the `useAuth().userId` consumption gap ·
**U-23** resolved — implemented-test inventory in `test-design-qa.md` § Implemented-test inventory ·
**U-24** resolved — contract A's harness is `DIRA1-MVP-v1` · **U-25** resolved — the
`QUALITY-GATE-AC-NFR` conflation (governs contract B only; contract A uses `PG-04`).

---

## Handoff boundary

This document provides **planning integration only**. It does not create scenarios, test cases,
automation, implementation tasks, validation approval or release approval. It changes no
product requirement, scenario file, stored execution result, sprint status, coverage field,
trace artifact, service file or service gitlink.
