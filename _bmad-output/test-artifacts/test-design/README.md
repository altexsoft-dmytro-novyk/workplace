# Test-Design Artifact Index

> ## Read this first
>
> This is the **current-artifact index** for `_bmad-output/test-artifacts/`. A reader should be
> able to reach the right system document and the right epic plan from here **without opening
> any superseded file**.
>
> - **Platform (system-level) artifacts are approved and validated PASS (2026-09-11).** Epic
>   plans remain **approval ungranted** and **validation NOT RUN** until separately approved and
>   validated. A new document never inherits an old document's human approval or validation PASS.
> - **No percentage, pass rate or green gate appears anywhere in this index.**
> - Nothing here is a release-readiness statement. The whole-repository trace remains a
>   planning audit with `allow_gate=false`.
> - `PR-S-01` / `CC-04` and `PR-S-02` / `CC-06` have formal Product Owner + Architect sign-off
>   [recorded in the PM memlog](../../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md). This does not close their implementation or evidence blockers.
> - Five of these filenames **reuse** a filename that previously held different,
>   human-approved content. See [§6](#6-historical-artifacts--read-at-their-commit-not-by-filename).

**Baseline commit:** `76a7220701ac6f16843dad8b303934f9a958b54c`
**Backend pin:** `f1eea3c048821011da96fba20d9b517f7d0e4f1b` · **Frontend pin:** `fa3d3198aa9921c26d22307542ab72834a03b899`
**Output root:** paths below are relative to `_bmad-output/test-artifacts/` unless shown in full.
**Written by:** the test-design consolidation migration, `docs/superpowers/plans/2026-09-10-test-design-consolidation.md`, 2026-09-10.

---

## 1. How to find what you need

1. **This index** — pick your scope.
2. **The platform pair** — `test-design-architecture.md` (risk identity, scores and rationale;
   architecture seams; testability gaps; NFR contract references) and `test-design-qa.md`
   (execution and coverage strategy, evidence contracts, isolation policy, gates, risk →
   evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog).
3. **One epic plan** — `test-design-epic-{domain}-{number}.md` for the epic you are working on
   ([§3](#3-epic-scope)).
4. **That scope's checkpoint**, if you need run state.
5. **`test-design/people-management-handoff.md`** if you are decomposing epics and stories.

The platform pair owns *shared policy*. Epic plans own *specific scenario and risk coverage*
and reference the shared rules rather than restating them. **If two documents state the same
rule, the platform pair is the source and the epic plan has a defect.**

**Identity rule.** A scope is `system` or `epic-{domain}-{number}`. **A bare epic number is not
an identity** — Epic 1 exists in at least ten of the twelve domain sources. Epic identities are
reused verbatim from `_bmad-output/planning-artifacts/<domain>/epics.md`; **nothing is
renumbered** and no ClickUp mapping is touched.

---

## 2. Platform scope

| Scope | Canonical epic ID / source | Outputs | Checkpoints | Status |
| --- | --- | --- | --- | --- |
| **Platform (system-level)** | **Not an epic.** Sources: `docs/project-requirements.md` v1.5 (normative) · `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md` + `addendum.md` · `…/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` (PM spine) · the binding rendered rules under `docs/architecture/` | `test-design-architecture.md` · `test-design-qa.md` · `test-design/people-management-handoff.md` | `test-design-progress-system.md` (`runScope: system-level`, `runKey: system`, `workflowStatus: generated`) | **WRITTEN.** Approval **granted 2026-09-11**. Validation **PASS** (2026-09-11). Coverage: none asserted. **`test-design-qa.md` was edited the same day, after the PASS below was recorded** — a System Edit (contract §4.3) correcting three stale `(invalidated)` cross-references in § U-19 to match the `ACF-FC-01`/`ACF-FC-02` rework. See that file's own "Post-validation correction" note. |
| **Platform validation** | — | `test-design-validation-report.md` | — | **PASS (2026-09-11).** System Validate (contract §4.5) evaluated the architecture/QA pair and literal handoff at the content hashes recorded in the report. No epic validation may overwrite it. **That hash for `test-design-qa.md` no longer matches current content** after the same-day post-PASS correction noted above; the report itself is unchanged and still accurately describes what it evaluated at the time. Re-validate for a byte-exact current attestation. |
| **Migration record** | — | `test-design/migration-map.md` | — | **WRITTEN.** A disposition ledger — not a strategy, not coverage, not an approval. 565 rows; findings F-1..F-18; decision register U-1..U-25. |
| **Workflow routing** | — | `docs/test-design-workflow-contract.md` · `_bmad/custom/bmad-testarch-test-design.toml` | — | **ACTIVE TEAM POLICY.** Resolves system and domain-qualified epic identities consistently for Create, context loading, Edit, Resume and Validate. It grants no approval or evidence. |
| **This index** | — | `test-design/README.md` | — | **WRITTEN.** Current as of 2026-09-10. |

**The handoff path is explicitly selected.** `_bmad/config.toml:14` sets
`project_name = "people management"` (with a space), while the stock workflow derives
`{test_artifacts}/test-design/{project_name}-handoff.md`. The hyphenated
`test-design/people-management-handoff.md` is the **only** handoff and is not derivable from
that template; the workflow contract pins it so a display-name space cannot create a second one.

---

## 3. Epic scope

Every active canonical epic has exactly one Epic-Level test-design plan and one matching
checkpoint. Superseded epics are excluded.

| Scope | Canonical epic ID · source | Plan | Checkpoint (`runKey`) | Status |
| --- | --- | --- | --- | --- |
| User Management — Access Control Adoption | `UM-E0` · `planning-artifacts/user-management/epics.md` `### Epic 0` | `test-design-epic-user-management-0.md` | `test-design-progress-epic-user-management-0.md` (`epic-user-management-0`) | **WRITTEN.** Holds `legacy-um:TD-UM-AC-01`, `legacy-um:R-001` (epic half), `um-epic:R-UM-02` and the permission-key cluster. Ungranted · NOT RUN. |
| User Management — Employee Record Management | `UM-E1` · `### Epic 1` | `test-design-epic-user-management-1.md` | `…-epic-user-management-1.md` (`epic-user-management-1`) | **WRITTEN.** Largest recipient: import/seed obligations, identity-card projection (backend **and** frontend subsections), list pagination and filters, `legacy-um:R-006/007/011`, `um-epic:R-UM-06`, `fe-epic:R-FE-02`. Ungranted · NOT RUN. |
| User Management — Magic-Link Authentication | `UM-E2` · `### Epic 2` | `test-design-epic-user-management-2.md` | `…-epic-user-management-2.md` (`epic-user-management-2`) | **WRITTEN.** Holds `TD-UM-AUTH-01..06`, `legacy-um:R-009`, `fe-epic:R-FE-01` and the predicate half of `R-FE-06`. **Carries a draft decision: `DEC-UM-012` is proposed, not approved.** Ungranted · NOT RUN. |
| User Management — Career Timeline | `UM-E3` · `### Epic 3` | `test-design-epic-user-management-3.md` | `…-epic-user-management-3.md` (`epic-user-management-3`) | **WRITTEN.** Holds `TD-UM-CT-02..08`, `legacy-um:R-002`, `legacy-um:R-014` (cross-referenced with mentorship). Ungranted · NOT RUN. |
| User Management — Organizational Relationships | `UM-E4` · `### Epic 4` | `test-design-epic-user-management-4.md` | `…-epic-user-management-4.md` (`epic-user-management-4`) | **WRITTEN.** Holds `TD-UM-REL-01/02/03/07/08`, `legacy-um:R-010`. Ungranted · NOT RUN. |
| User Management — Employment Lifecycle | `UM-E5` · `### Epic 5` | `test-design-epic-user-management-5.md` | `…-epic-user-management-5.md` (`epic-user-management-5`) | **WRITTEN.** Holds the departure state machine, `dueAt` computation, blocker digest, `um-epic:R-UM-03`, and the successor obligations of the retired deactivation family. Ungranted · NOT RUN. |
| User Management — Visibility-Safe Filtering and Columns | `UM-E7` · `### Epic 7` | `test-design-epic-user-management-7.md` | `…-epic-user-management-7.md` (`epic-user-management-7`) | **WRITTEN.** Holds the anti-inference half of the directory filter cluster; the `UM-E1-S1.5` / `UM-E7` boundary is settled (identity-field whitelist → `UM-E1-S1.5`; `PM-FR-5` anti-inference including result-count differencing → `UM-E7`). Ungranted · NOT RUN. |
| Mentorship — Mentorship Hub | `M-E1` · `planning-artifacts/mentorship/epics.md` `### Epic 1` | `test-design-epic-mentorship-1.md` | `test-design-progress-epic-mentorship-1.md` (`epic-mentorship-1`) | **WRITTEN.** Holds the mentorship split of `TD-UM-REL-04/05/06` and half of `REL-07`, re-homed out of the `legacy-um` `REL-*` family. Ungranted · NOT RUN. |
| Platform Capabilities — Permission-Safe People Directory | `PMC-E1` · `planning-artifacts/platform-capabilities/epics.md` `### Epic 1` | `test-design-epic-platform-capabilities-1.md` | `…-epic-platform-capabilities-1.md` (`epic-platform-capabilities-1`) | **WRITTEN.** Holds `fe-epic:R-FE-05` / `PersonPicker`, directory sort stability and directory search. Ungranted · NOT RUN. |
| Platform — Platform Spec v1.5 Alignment | `PLAT-E1` · `planning-artifacts/platform/epics.md` `## Epic 1` | `test-design-epic-platform-1.md` | `…-epic-platform-1.md` (`epic-platform-1`) | **WRITTEN 2026-09-11.** First plan created under the active-epic policy (below). **Carries no transferred obligation — 0 ledger rows target it**; its 21 `plat-e1:AV-*` artifact-verification obligations are newly stated from the epic's own acceptance criteria and are **not test cases**. Documentation-alignment epic: evidence levels are `repository-audit` / `manual-review` only. Ungranted · NOT RUN. |
| Platform — Access Control Foundation | `PLAT-E2` · `planning-artifacts/platform/epics.md` `## Epic 2: Access Control Foundation` | `test-design-epic-platform-2.md` | `test-design-progress-epic-platform-2.md` (`epic-platform-2`) | **WRITTEN (2026-09-11).** Created under the one-plan-per-active-epic policy, **not** from a transferred obligation — the ledger routes zero rows here. A rework/evidence-integrity plan for `ACF-1`. **`ACF-RW-01..03` (the Stage-1/Stage-2 divergence at `da7d1fa`) executed and closed the same day** — `ACF-AU-05`/`ACF-FC-01`/`ACF-FC-02` carry a rework/attribution marker — **not** an approval state: AD-1 stage approval was retired 2026-09-04 (`docs/architecture/testing-strategy.md:25–38`), consistent with the "Not an approval state" row in §Ownership below. Still open: the four allow cases that assert `200` on an unwired route, and the Contract C (P6) reading. Approval **ungranted**. Validation **CONCERNS (2026-09-11)** — [`test-design-validation-report-epic-platform-2.md`](../test-design-validation-report-epic-platform-2.md): AC4/AC5 (no-UM-file-changes; no Project/Department/shared-link/full-profile/FR/section-matrix decision) lack an explicit verification obligation, no AC-to-scenario traceability table exists in the plan, and the Execution Order section uses a smoke/P0/P1 tier structure the checklist flags against. **Plan corrected 2026-09-11** for retired-gate framing (Entry/Exit/Quality-Gate/estimates had treated AD-1 stage approval as live) and a stale regression count (`13` → all suites under `test/access-control/`, 21 files at `28d8e20`); the validation report's Entry/Exit, Quality-Gate and Cross-Document rows and its recorded plan hash `4785169…` therefore describe the **pre-correction** text. Coverage: none asserted. |
| Platform — Access Control Kernel MVP | `PLAT-E3` · `planning-artifacts/platform/epics.md` `## Epic 3: Access Control Kernel MVP` | `test-design-epic-platform-3.md` | `test-design-progress-epic-platform-3.md` (`epic-platform-3`) | **WRITTEN (2026-09-12).** Created under the one-plan-per-active-epic policy. Covers headless kernel risks and test design for ACM-0/1/2/3/4/5/8/9; it neither asserts execution evidence nor changes the User Management adoption boundary. It records the later E4 three-versus-six `hr-admin` permission-set drift as an open cross-epic dependency rather than resolving it — the `PLAT-E4` validation below records that reconciliation as **unreceived** at E4. Approval **ungranted**. Validation **CONCERNS (2026-09-12)** — [`test-design-validation-report-epic-platform-3.md`](../test-design-validation-report-epic-platform-3.md): the plan and its own checkpoint assign `E3-C05`/`E3-C06`/`E3-C07` to **different** scenario families (ACM-5/ACM-8/ACM-4 in the plan; ACM-4/ACM-5/ACM-8 in the checkpoint), so a citation of one of those three IDs resolves differently per file; the canonical source's Kernel-MVP status caveat (every Epic 3 story key `done` in `platform/sprint-status.yaml`, two tracking artifacts disagreeing, SD-1 "historical evidence") is not recorded, leaving a ~56–94 h estimate framed as forward work; no AC-to-scenario traceability table exists — the same table `PLAT-E2` and `PLAT-E4` were flagged for — and five acceptance criteria carry no named obligation (`ACM-2` no-hard-coded-`hr-admin`-branch, `ACM-3` viewer-validation ordering and Colleague fallback, `ACM-3` empty-list no-graph-read, `ACM-9` baseline-changes-no-behaviour); the platform pair's gate thresholds are restated with *covered* silently becoming *pass* and the access-control-suite clause dropped; and P1 `ACM-4`/`ACM-9` gate P0 `ACM-5`/`ACM-8`, inverting the epic's own Kernel Dependency Graph. Its Contract B-only performance attribution, source-traceable `ACM9-MVP-v1` thresholds, risk-score arithmetic, interval estimates and PR/Nightly/Weekly execution strategy validated clean. **Plan and checkpoint corrected 2026-09-12** against all seven findings plus an independent requirements review — the largest of which was outside the validation's own scope: the plan re-asserted the canonical ACM-8 criterion "`ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`" as a **P0** obligation, though PLAT-E4-S4.1/S4.2 bound the port to `AccessControlFacadeAdapter`, backend `37a339a` deleted the interim adapter, and `ACM8-KC-02` already asserts the facade-backed one. Also added: requirements §2.1 revocation timing (`R07`) and the §3.2 note ¹ relationship-field carve-out (`R08`), neither of which had any obligation. Following the `PLAT-E2` precedent, the validation report is **not** rewritten — it carries an appended remediation record, and its recorded hashes describe the **pre-correction** text. Coverage: none asserted. |
| Platform — Access Control Authorization Consolidation | `PLAT-E4` · `planning-artifacts/platform/epics.md` `## Epic 4: Access Control Authorization Consolidation` | `test-design-epic-platform-4.md` | `test-design-progress-epic-platform-4.md` (`epic-platform-4`) | **WRITTEN (2026-09-12).** Creates the canonical plan for the human section-key, audience-first authorization, root-bootstrap, and dev-seed evidence boundary. It records the residual `seeded-two-level` ACM-9 decision as an open P2 evidence question; it does not conflate it with DIRA1 or P6. Approval **ungranted**. Validation **CONCERNS (2026-09-12)** — [`test-design-validation-report-epic-platform-4.md`](../test-design-validation-report-epic-platform-4.md): the plan's P0 audience-first claims do not name the shipped, PO-accepted `profile:timeline:write` deviation (`canEditTimeline` has no audience half — `access-control.md:81–88`, closure tracked as DEPT-2); two Story 4.1 acceptance criteria (`scripts/dev-grant-root.ts`; the deferred-work/`profile:timeline` rename closures) carry no verification obligation; no AC-to-scenario traceability table exists — the same table `PLAT-E2` was flagged for; the three-versus-six `hr-admin` reconciliation that `PLAT-E3` routed here is unreceived; and R06's priority is stated three ways (P1 in the Executive Summary, medium/P2 in the Risk and Coverage sections, P1 in the checkpoint). Its Contract A/B/C separation, ACM-9 informational status, interval estimates and PR/Nightly/Weekly execution strategy validated clean. Coverage: none asserted. |

**Epic validation reports are written when an epic is actually validated.**
`test-design-validation-report-epic-{domain}-{number}.md` is written per epic, on that epic's own
schedule. **Three exist: `epic-platform-2`** (verdict CONCERNS, 2026-09-11, see the `PLAT-E2` row
above), **`epic-platform-3`** (verdict CONCERNS, 2026-09-12, see the `PLAT-E3` row above) **and
`epic-platform-4`** (verdict CONCERNS, 2026-09-12, see the `PLAT-E4` row above).
No other epic has been validated. An epic validation report never overwrites the system
report or another epic's report.

**The blanket "no plan is created" rule is retired (2026-09-11).** It previously read: *"No plan
is created for `UM-E8`, any `PLAT-E*`, `RA-E*`, `TT-E*`, `RS-E*`, `RISK-E*`, `CDS-E*`, `PSH-E*`,
`FB-E*` or `ENG-E*` epic, because no obligation in the superseded set transfers to them."* Under
the active-epic policy stated at the top of this section, **absence of a transferred obligation is
no longer a reason not to plan an epic**, and that sentence contradicted the section's own opening
rule. `PLAT-E1` is the first scope re-planned under the new policy and is indexed above.

**What is retired is the rule, not the fact.** No obligation in the superseded set transfers to
those epics; that remains true and is why `PLAT-E1`'s plan states obligations derived from its own
acceptance criteria rather than migrated ones. Their platform-level coverage continues to live in
the `TR-*` normative coverage map in `test-design-qa.md`, which no epic plan restates.

**Still unplanned, and now simply _not yet created_ rather than forbidden:** `UM-E8`,
`PLAT-E5`–`PLAT-E8`, `RA-E*`, `TT-E*`, `RS-E*`, `RISK-E*`, `CDS-E*`, `PSH-E*`, `FB-E*` and the
active `ENG-E*` epics. Each needs its own Create run, and **each run asserts nothing about the
others.** `PLAT-E1`, `PLAT-E2`, `PLAT-E3`, and `PLAT-E4` are now planned under this policy; `ENG-E3` and `ENG-E4` are marked *(superseded)* in their
source and remain excluded — the active-epic policy covers active epics only. **A domain with no
plan is not a statement that the domain needs no test design.** `UM-E6` is a separate case — see
[§4](#4-unplanned-scopes-and-owners).

**`frontend` is not a domain and not an epic.** The `frontend` epic identity is retired.
Frontend obligations live in the product epic they serve, as a test-level subsection inside
that epic's plan, or in the QA improvement backlog when no product epic owns them.

---

## 4. Unplanned scopes and owners

Scopes that carry real obligations but have **no owning epic plan**. Tracked so they are not
silently lost. **None of them counts as requirement coverage.**

| Unplanned scope | Why there is no plan | Owner | Trigger to revisit | Where it lives |
| --- | --- | --- | --- | --- |
| **`UM-E6` Current-State Read Endpoints** (`planning-artifacts/user-management/epics.md` `### Epic 6`) | **An open item, not a settled exclusion.** `UM-E6` is a canonical epic and the ledger names it **twice** as a consumer of the `PersonPicker` obligation — but **no ledger row targets `test-design-epic-user-management-6.md`**, so nothing routed to it and no plan was written; `test-design-architecture.md` § Domain navigation also omits it from its plan list. Its batch identity-lookup endpoint is exactly what `PersonPicker` consumes, so the `PMC-E1` placement records `UM-E6` as a **consumer**, not an owner. **This migration did not invent a plan for it and did not decide whether one is needed.** | User Management epic owner + QA | Any obligation routes to `UM-E6`, or the `PersonPicker` consumer link is re-adjudicated | Consumer cross-reference in `test-design-epic-platform-capabilities-1.md` § Risk / § Coverage; ledger §4.4 and §4.3d |
| Frontend shared error handling (`lib/http.ts` extractors, per-panel error copy) | Spans every flow; no single product epic states it | DEV | A new documented failure body is added to any endpoint | QA improvement backlog in `test-design-qa.md` |
| Frontend shared utilities (`datetime.ts`, `useDebounce`, `useLocalStorage`) | Cross-cutting helpers with no product requirement | DEV | A helper gains a product-visible behaviour | QA improvement backlog |
| Shared UI surfaces (`StatePanel`, `MainHeader`, `SideMenu`) | Rendered by every flow, owned by none. The `PMC-E1-S1.2` re-home was **declined**: that story owns the directory *table's* presentation and the accessibility floor, not the application shell | DEV | A product requirement states global navigation or active-route behaviour | QA improvement backlog |
| Frontend route titles (`fe-epic:R-FE-07`) | No requirement states a title convention | DEV | A route-title requirement is stated | QA improvement backlog |
| Skipped-test trigger enforcement (`um-epic:R-UM-05`; **31** `it.todo` cases, statically counted at backend `f1eea3c`, **not executed**) | "Make skipped-test triggers enforceable" is tooling, not product | QA | A trace run reports a `skipped` row whose stated unblock condition is met | QA improvement backlog |
| CI observability of the informational e2e job (`um-epic:R-UM-07`) | Repository governance, not a product epic | QA | The job's red-case count changes while it remains informational. **The job is deliberately informational and must not be promoted to blocking as a "mitigation"** | QA improvement backlog |
| Concurrent `PATCH` on the same field (`legacy-um:G-15` residue) | No successor case exists | QA | A concurrent-write defect, or a new same-field mutation route | QA improvement backlog |
| Access-control scenario suites — `docs/test-cases/access-control-foundation/` (9 scenario documents) and `docs/test-cases/access-control-kernel/` (90 scenario documents), **99 in total** (101 raw Markdown files including both READMEs) | Owned by the access-control slice, not by this migration. **Not an approval state:** `docs/architecture/testing-strategy.md:25–38` removed per-file approval status from `docs/test-cases/**` on 2026-09-04, so "draft", "pending approval" and "unapproved" are no longer meaningful states for these files. **Correction, explicitly labelled:** the superseded artifacts cite "171 files" under `docs/test-cases/access-control/`; that path does not exist and that count is wrong. A present scenario document is still **not** coverage | Access Control owners + Engineering leads | **U-19 resolved:** 14 of 119 rows receive partial evidence from the 99 scenario documents; 105 receive none | `test-design-qa.md` § U-19 normative coverage — scenario file mapping; ledger §5.6, §6 F-3, §10 U-15/U-19 |
| Performance measurement harnesses ACM-9 and P6 | Measurement protocols owned by `docs/architecture/testing-strategy.md` and the backend service | Platform / Backend | A protocol version change | Referenced from `test-design-qa.md` § NFR measurement contracts; **not** duplicated, and **never** conflated with the All Employees list requirement |

---

## 5. Three things this index states so they are not re-derived wrongly

1. **The All Employees list ≤ 2-second requirement is P0.** Not P1. Authority:
   `docs/project-requirements.md:614`, release gate `PG-04`, and `PMC-E1-S1.9`'s closing
   criterion. Both underlying risk scores stay **6**; no P0 percentage was normalised.
2. **Three performance contracts stay separate.** **A** = the All Employees list including
   permission resolution (v1.5 §7, `PG-04`) — harness **`DIRA1-MVP-v1`** (U-24 resolved).
   **PASS**, recorded 2026-09-10/11:
   [`performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json`](../performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json)
   (comparable baseline `dira1-1789080425159-ab0a0a57396f`; local PostgreSQL environment;
   binding since 2026-09-11 — `PG-04` row in `test-design-qa.md` § Release and design gates).
   **B** = the ACM-9
   AccessControl facade resolver, a binding protocol with its own thresholds, whose CI job is
   **informational and is not promoted here**. **C** = the P6 `resolveAudiences` measurement,
   **not a gate**. B and C are not evidence for A, and a PASS on A is not evidence for either.
3. **`PG-01` is not schedulable today.** Its per-file-approval rationale is retired; its
   conclusion rests on three currently open blockers (`SEC-AUTH-01` P0, `CC-07` P0,
   `AC-S9-S13`/`AC-SECTION-MATRIX-01` P1). **Schedulable when all four are closed at
   implementation** (U-20 resolved); evaluated by Platform epic owner + Architect.

---

## 6. Historical artifacts — read at their commit, not by filename

Five current filenames **reuse** a filename that at `76a7220` held different, human-approved
content. Any statement about what one of these files *said* must cite the commit, or it
silently starts describing the new document.

Link form: `https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/<path>`

| Filename | What it held at `76a7220` | What it holds now |
| --- | --- | --- |
| [`test-design-architecture.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-architecture.md) | User Management system-level architecture design, **approved 2026-08-25** | Platform testability and risk baseline, **ungranted** |
| [`test-design-qa.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-qa.md) | User Management system-level QA design, **approved 2026-08-25** | Platform execution and coverage strategy, **ungranted** |
| [`test-design-progress-system.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-progress-system.md) | UM child checkpoint, `runScope: 'user-management-child'`, `workflowStatus: 'approved'`, 12 of 14 validation boxes ticked | Platform run state, `runScope: system-level`, `workflowStatus: generated`, approval **ungranted**, every box reset |
| [`test-design-validation-report.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-validation-report.md) | Validate run of 2026-08-25: "PASS — Approved for ATDD"; strict completion FAIL | Fresh migration-era validation **scope**; verdict **NOT RUN** |
| [`test-design/people-management-handoff.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design/people-management-handoff.md) | UM handoff, `status: 'approved'` (2026-08-25) | The single platform handoff, **ungranted** |

**D-2 removal is complete.** After the Task 3e ledger-to-output reconciliation passed, the
following superseded artifacts were removed from the current tree with `git rm`. Their content
remains citable at `76a7220…`; removal does not withdraw, approve, or rewrite any historical
claim.
[`test-design-architecture-platform.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-architecture-platform.md),
[`test-design-qa-platform.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-qa-platform.md),
[`test-design-epic-user-management.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-user-management.md),
[`test-design-epic-frontend.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-frontend.md),
[`test-design/people-management-platform-handoff.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design/people-management-platform-handoff.md),
[`test-design-progress-platform.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-progress-platform.md),
[`test-design-progress-user-management.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-progress-user-management.md),
[`test-design-progress-frontend.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-progress-frontend.md) and
[`test-design-validation-report-platform.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-validation-report-platform.md) are **not indexed above and are not current
inputs**. The removal was deliberately sequenced after the reconciliation proved every
destination exists.

Documents that stay in place as history and are **not** rewritten:

- `_bmad-output/test-artifacts/critical-review-existing-artifacts.md` — the 2026-08-25 audit of
  the then-existing scenario suite. Several of its counts are stale; read it as a dated snapshot.
- `docs/superpowers/plans/2026-08-25-test-design-validation-fixes.md` — how the 2026-08-25
  artifacts reached their state.
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-27.md` and
  `-2026-09-01-user-management-access-control-alignment.md`.
- `_bmad-output/specs/spec-access-control-test-cases/.memlog.md`.
- The two 2026-09-06 epic progress files' citation of a dated coverage matrix "as of commit
  `1edec31`" — a correctly anchored historical statement that must **not** be repointed at the
  canonical filename.

Untouched by this migration, and not indexed here as test-design artifacts:
`traceability-matrix.md`, the dated audits, `ci-pipeline-progress.md`, everything under
`performance/`, and all trace and coverage JSON.

---

## 7. What this index deliberately does not say

- It does not say any test passes, any gate is green, or any coverage percentage.
- It resolves no open decision. The register is `test-design/migration-map.md` §10:
  **U-4, U-5, U-6, U-9, U-10, U-11, U-13, U-16** remain open from Task 1 and
  **U-17, U-21, U-22** remain open from the reconciliation (**U-2**, **U-12**, **U-18**, **U-19**,
  **U-20**, **U-23**, **U-24**, and **U-25** resolved). **U-12** was resolved by DEV (2026-09-11): co-located
  `*.test.ts`/`*.test.tsx`, second vitest config, `@testing-library/react` — implemented on
  `services/frontend` branch `feat/u-12-unit-component-testing` (`60bc882`), not yet merged.
  Still open and answered nowhere in this index: both `PR-S-*` sign-offs; the
  implementation work behind the six `PR-B-*` blockers that closed **at design only** (none
  closed at implementation); contract A's WCAG level and viewport set (U-4); and draft
  `DEC-UM-012` (U-6).
- It does not treat ACM-9 or P6 measurements as evidence for the All Employees list requirement.
- It does not carry any retired obligation forward as an active one.
- It changes no epic number, story ID, sprint key, ClickUp mapping, sprint status, coverage
  field, scenario file, stored execution result, trace artifact, service file or gitlink.
