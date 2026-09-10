# Test-Design Artifact Index

> ## Read this first
>
> This is the **current-artifact index** for `_bmad-output/test-artifacts/`. A reader should be
> able to reach the right system document and the right epic plan from here **without opening
> any superseded file**.
>
> - **No row grants an approval, a validation verdict, or coverage.** Every artifact listed
>   below is **approval ungranted** and **validation NOT RUN**. A new document never inherits
>   an old document's human approval or validation PASS.
> - **No percentage, pass rate or green gate appears anywhere in this index.**
> - Nothing here is a release-readiness statement. The whole-repository trace remains a
>   planning audit with `allow_gate=false`.
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
| **Platform (system-level)** | **Not an epic.** Sources: `docs/project-requirements.md` v1.5 (normative) · `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md` + `addendum.md` · `…/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` (PM spine) · the binding rendered rules under `docs/architecture/` | `test-design-architecture.md` · `test-design-qa.md` · `test-design/people-management-handoff.md` | `test-design-progress-system.md` (`runScope: system-level`, `runKey: system`, `workflowStatus: generated`) | **WRITTEN.** Approval **ungranted**. Validation **NOT RUN**. Coverage: none asserted. |
| **Platform validation** | — | `test-design-validation-report.md` | — | **WRITTEN — scope only. Verdict: NOT RUN.** It identifies its evaluated inputs by path **and SHA-256 content hash** plus the baseline commit. No epic validation may overwrite it. |
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

A plan exists **only** for an epic that received real transferred obligations. Empty plans for
every epic are forbidden. Every plan has exactly one matching checkpoint.

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

**Epic validation reports do not exist.** `test-design-validation-report-epic-{domain}-{number}.md`
is written **when an epic is actually validated**, and **no epic has been validated**. An epic
validation report never overwrites the system report.

**No plan is created** for `UM-E8`, any `PLAT-E*`, `RA-E*`, `TT-E*`, `RS-E*`, `RISK-E*`,
`CDS-E*`, `PSH-E*`, `FB-E*` or `ENG-E*` epic, because no obligation in the superseded set
transfers to them. Their platform-level coverage lives in the `TR-*` normative coverage map in
`test-design-qa.md`. `ENG-E3` and `ENG-E4` are marked *(superseded)* in their source and no
plan may be created for them. **A domain with no plan is not a statement that the domain needs
no test design.** `UM-E6` is a separate case — see [§4](#4-unplanned-scopes-and-owners).

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
| Access-control scenario suites — `docs/test-cases/access-control-foundation/` (10 files) and `docs/test-cases/access-control-kernel/` (91 files), **101 in total** | Owned by the access-control slice, not by this migration. **Not an approval state:** `docs/architecture/testing-strategy.md:25–38` removed per-file approval status from `docs/test-cases/**` on 2026-09-04, so "draft", "pending approval" and "unapproved" are no longer meaningful states for these files. **Correction, explicitly labelled:** the superseded artifacts cite "171 files" under `docs/test-cases/access-control/`; that path does not exist and that count is wrong. A present scenario document is still **not** coverage | Access Control owners + Engineering leads | Which file covers which `TR-*` row is **U-19**, open | `test-design-qa.md` § Normative coverage map; ledger §5.6, §6 F-3, §10 U-15/U-19 |
| Performance measurement harnesses ACM-9 and P6 | Measurement protocols owned by `docs/architecture/testing-strategy.md` and the backend service | Platform / Backend | A protocol version change | Referenced from `test-design-qa.md` § NFR measurement contracts; **not** duplicated, and **never** conflated with the All Employees list requirement |

---

## 5. Three things this index states so they are not re-derived wrongly

1. **The All Employees list ≤ 2-second requirement is P0.** Not P1. Authority:
   `docs/project-requirements.md:614`, release gate `PG-04`, and `PMC-E1-S1.9`'s closing
   criterion. Both underlying risk scores stay **6**; no P0 percentage was normalised.
2. **Three performance contracts stay separate.** **A** = the All Employees list including
   permission resolution (v1.5 §7, `PG-04`) — **statistic, environment and load model UNKNOWN,
   harness UNDECIDED (U-24)**, and **no measurement of this subject exists**. **B** = the ACM-9
   AccessControl facade resolver, a binding protocol with its own thresholds, whose CI job is
   **informational and is not promoted here**. **C** = the P6 `resolveAudiences` measurement,
   **not a gate**. B and C are not evidence for A.
3. **`PG-01` is not schedulable.** Its per-file-approval rationale is retired, and its
   conclusion is carried on a replaced rationale — three currently open blockers
   (`SEC-AUTH-01` P0, `CC-07` P0, `AC-S9-S13`/`AC-SECTION-MATRIX-01` P1), none of which is an
   approval state. What recorded condition would make it schedulable is **U-20**, open.

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
  **U-2, U-4, U-5, U-6, U-9, U-10, U-11, U-12, U-13, U-16** remain open from Task 1 and
  **U-17..U-25** were opened by the reconciliation. Still open and answered nowhere in this
  index: both `PR-S-*` sign-offs; the implementation work behind the six `PR-B-*` blockers that
  closed **at design only** (none closed at implementation); contract A's statistic,
  environment, load model and harness (U-3, U-24); whether `QUALITY-GATE-AC-NFR` — recorded
  closed on ACM-9 resolver evidence — also governs the directory-list requirement (U-25); WCAG
  level and viewport set (U-4); and draft `DEC-UM-012` (U-6).
- It does not treat ACM-9 or P6 measurements as evidence for the All Employees list requirement.
- It does not carry any retired obligation forward as an active one.
- It changes no epic number, story ID, sprint key, ClickUp mapping, sprint status, coverage
  field, scenario file, stored execution result, trace artifact, service file or gitlink.
