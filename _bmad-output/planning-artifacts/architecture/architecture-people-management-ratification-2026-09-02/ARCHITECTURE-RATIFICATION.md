---
title: People Management Architecture Ratification
status: ratified-with-transition-debt
date: 2026-09-02
revision: 2026-09-02-reviewer-gate-correction
ratification_type: documentation-only
binds_spine:
  path: ../architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  spine_id: PM
  commit: 0e703d19150b4727c1f2b42e2f359df9995735dc
  commit_date: '2026-09-01'
  note: >
    Working-tree spine is status approved-with-open-items, revision
    2026-09-02-reviewer-gate-correction. The SHA pin remains the last committed
    spine; this package's body is the working-tree overlay until the user
    authorizes a commit. Doc-cleanup overlay 2026-09-02-doc-cleanup reconciles
    editorial/status/traceability only (no new ADs).
binds_access_control_spine:
  path: ../architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md
  spine_id: ACF
  commit: 0e703d19150b4727c1f2b42e2f359df9995735dc
evidence_baseline:
  workplace: 0e703d19150b4727c1f2b42e2f359df9995735dc
  services_backend: 08931ad14778f1953ca551c0e25c782afa4ccb1b
  services_frontend: d06b977c714d69036eb9407dffaf33d953e6fa15
  pinned_at: '2026-09-02'
  reproducible: partial
  caveats:
    - >
      CODE evidence is reproducible. Both service submodules report dirty in the
      superproject, but only from untracked files (backend .claude/worktrees/ and
      AGENTS.md; frontend AGENTS.md); no tracked file is modified in either submodule,
      so every services/backend and services/frontend citation resolves at its pinned SHA.
    - >
      PLANNING evidence is NOT fully reproducible at the workplace pin. Seven tracked
      files are modified in the working tree relative to 0e703d19 (AGENTS.md and the
      three domain PRDs with their memlogs), and this ratification package, the
      global-coverage model, two 2026-09-02 sprint change proposals, two domain specs,
      and docs/integrations/ are untracked. Claims resting on those paths reflect the
      working tree at 2026-09-02, not the pinned commit.
    - >
      docs/integrations/timetracker-external-api.json is UNTRACKED and therefore does not
      exist at the workplace pin, yet it is the sole or partial evidence for
      TIMETRACKER-CONTRACT, TT-IDENTITY-01 (P0), TT-PMDM-01, and OPERATIONAL-ENVELOPE.
      Those findings are working-tree observations. Committing the contract is a
      precondition for this baseline being auditable.
    - >
      services/backend 08931ad is a detached submodule HEAD on no branch, no tag, and no
      remote, 45 commits ahead of origin/main. It is reproducible on this machine only and
      is garbage-collectable once HEAD moves. Pushing or tagging it is a precondition for
      third-party reproducibility.
    - >
      This ratification package was itself untracked at pin time and carries no
      self-referential SHA.
---

# People Management Architecture Ratification

## 1. Verdict

**Architecture correctness: PASS WITH OPEN ITEMS.** The People Management spine and rendered architecture rules form a coherent v1.5 target architecture. The approved Access Control foundation is valid within its Phase-0/kernel scope.

**Implementation completeness: FAIL / EXPECTED BROWNFIELD STATE.** This is not a release-gate failure: most product scope is not implemented, and the current User Management runtime still contains high-risk transition behavior. Ratification endorses the target decisions; it does not certify conformity, security, deployment readiness, or completion.

**Ratified state:** `ratified-with-transition-debt`. Spine status: `approved-with-open-items`. **Not release-ready.**

**Revision 2026-09-02-reviewer-gate-correction.** Reconciles remaining Reviewer Gate findings H1–H7 and H11 (H8 verified). PM/AD-1..PM/AD-35 preserved sequential. Architecture `OQ-118`/`CC-11` superseded by `ARCH-ENV-01`/`ARCH-PROJ-WRITER-01`. No application code. Not release-ready.

Prior design batch (retained): User-approved OQ-105, OQ-116, CC-05. Architect-owned CC-07, CC-09, ARCH-PROJ-WRITER-01, OQ-114, OQ-115, OQ-117, ARCH-ENV-01, DEPARTMENT-EDGE. OQ-PERM-01 stays open. PM/AD-26 through PM/AD-35 added.

This package:

- Does not change application code or behavior.
- Does not close implementation, operational, or reproducibility blockers.
- Does not convert red tests or sprint status into production evidence.
- Records user-approved design decisions in the spines and this package.

Machine-readable companions:

- `evidence-matrix.yaml`
- `transition-debt.yaml`
- `blockers.yaml`

## 2. Status model

Each architecture decision has two independent assessments:

- **Design status:** `ratified`, `partial`, `blocked`, or `open`.
- **Implementation status:** `conformant`, `partial`, `transition-debt`, `absent`, or `not-applicable`.

`ratified` never means implemented. `transition-debt` means the target decision is accepted while current code temporarily deviates under a named retirement trigger.

An AD that carries an open transition-debt item may not be rated `conformant`; the two values are mutually exclusive.

### 2.1 Vocabulary mapping (do not collapse distinct axes)

**Design-approved, implementation-pending** (same design axis; different spellings in companions):

| Phrase in companions | Maps to |
|---|---|
| `ratified` | design=`ratified` |
| `design approved YYYY-MM-DD` | design=`ratified` |
| `resolved-approved` (`blockers.yaml` `design_status`) | design resolved; blocker may still be `open` for implementation |
| `closed at design` | design resolved; retained as closed design-gate where listed |
| `Resolved YYYY-MM-DD` | design=`ratified` (implementation status unchanged unless stated) |

**Document lifecycle** (separate axis — never equate these to design/implementation cells):

| Status | Used on |
|---|---|
| `approved` / `approved-with-open-items` | architecture spines |
| `ratified-with-transition-debt` | this ratification package |
| `canonical` / `canonical-domain` | live product/domain authorities |
| `historical` | superseded PRDs retained for traceability |
| `draft` / `unapproved draft` | non-authoritative drafts |

Mechanical count for this package: `blockers.yaml` holds **30** entries — **18** open, **8** closed, **4** superseded.

## 3. Decision register

| PM/AD | Decision | Design | Implementation | Evidence-based disposition |
|---|---|---|---|---|
| PM/AD-1 | Three-stage scenario/test/code gate | ratified | partial | Scenario and red-E2E corpora exist; approval/completion varies by slice |
| PM/AD-2 | Hexagonal bounded-context boundaries | ratified | partial | User Management and Access Control mostly follow boundaries; planned contexts are absent |
| PM/AD-3 | Real API/database E2E with scoped external fakes | ratified | partial | Real PostgreSQL suites exist; many feature suites are intentionally red |
| PM/AD-4 | Gate and ownership per feature slice | ratified | partial | Workboard packages and context epics preserve ownership; not every product FR has a slice |
| PM/AD-5 | Bounded-context map | ratified | partial | `user-management`, `access-control`, and storage exist; `mentorship` and `action-items` are confirmed and unimplemented |
| PM/AD-6 | Access roles and functional roles remain separate | ratified | transition-debt | Kernel separates dimensions; interim User Management adapter checks `position === 'HR Admin'` |
| PM/AD-7 | Policy/permission data foundation | ratified | **partial** (was `conformant`) | Kernel data slice exists; catalog/runtime-editable FR policies do not; binding identity is `Permissions.key` (H4; ACF/AD-4); carries TD-08 |
| PM/AD-8 | Initial policy operators | ratified | **partial** (was `conformant`) | `operator` is unconstrained TEXT; evaluator does not read it; bootstrap drift throw covers one FR row |
| PM/AD-9 | Access Control facade is the authorization entry | ratified | transition-debt | Facade exists; User Management still binds the interim adapter |
| PM/AD-10 | Live audience and section resolution | partial | partial | Reporting/direct-PP Phase-0 exists; NFR evidenced only via ACM-9 protocol (`QUALITY-GATE-AC-NFR`) |
| PM/AD-11 | Organisational Relationship shape and cross-context transaction rule | ratified | partial | Relationship schema exists; mentorship/event/departure transaction paths do not |
| PM/AD-12 | Fail-closed authorization/bootstrap | ratified | transition-debt | Kernel fails closed; interim target checks are over-permissive |
| PM/AD-13 | Durable external identity (`ttId`) | ratified | partial | Field exists; required Timetracker synchronization does not; TT does not write employment state (AD-22) |
| PM/AD-14 | API router tree and context ownership | ratified | partial | Basic User controller exists; most routes are absent; legacy create/delete remain |
| PM/AD-15 | Fakes limited to external integrations | ratified | transition-debt | Dispatcher fake is bound in the production module; interim auth/AC adapters are cutover debt |
| PM/AD-16 | Seeded population, no employee creation/deactivation product CRUD | ratified | transition-debt | Root seed exists; legacy `POST`/`DELETE` remain independent `isActive` writers (PM/AD-22 debt) |
| PM/AD-17 | Mentorship as a separate durable workflow context | ratified | absent | Boundary/routes/contracts user-approved 2026-09-02; no source context |
| PM/AD-18 | Fixed facts bind deferred designs | ratified | not-applicable | No conflicting implementation found; future slices remain gated |
| PM/AD-19 | People Partner as organisational fact plus journaled mutation | ratified | partial | Live implementation gate is CC-07 (PM/AD-29) + CC-04 implementation. Not design-blocked by CC-04 (H8). HR-line predicate is PM/AD-35. |
| PM/AD-20 | Effective-date departure orchestration | ratified | absent | AD-22/AD-23 close prior design holes; executor still absent (CC-06/CC-08/CC-09 implementation) |
| PM/AD-21 | Brownfield cutover without dual-running | ratified | transition-debt | Access Control kernel is composed; User Management adoption is in progress |
| PM/AD-22 | Employment lifecycle owns employment state | ratified | absent | Design approved; CC-08 remains until re-import cannot restore access |
| PM/AD-23 | Shared `applyDepartureEffects` contract | ratified | absent | Signature approved; no participant implements it |
| PM/AD-24 | HTTP denial oracle | ratified | transition-debt | Design supersedes UMAC 403; handlers still split; historical scenarios stale |
| PM/AD-25 | Frontend authorization and cache contract | ratified | transition-debt | Stack preserved; global five-minute `staleTime` is TD-11 |
| PM/AD-26 | HR Admin lifecycle | ratified | transition-debt | Closes OQ-105. Runtime still uses `position === 'HR Admin'` |
| PM/AD-27 | Ordinary project membership | ratified | absent | Closes OQ-116. No member `targetRole` |
| PM/AD-28 | Self / full-profile overlay | ratified | absent | Closes CC-05 |
| PM/AD-29 | AccessJournal | ratified | absent | Closes CC-07 design. No table |
| PM/AD-30 | UserEvents owner + idempotency | ratified | absent | Closes CC-09 design. No model |
| PM/AD-31 | Sole writer of project membership | ratified | absent | Closes ARCH-PROJ-WRITER-01 design (architecture CC-11 ID superseded). Sync absent; TT-IDENTITY-01 remains |
| PM/AD-32 | Custom-field EAV | ratified | transition-debt | Closes OQ-114. jsonb bag is TD-12 |
| PM/AD-33 | Fixed dashboard read models | ratified | absent | Closes OQ-115 |
| PM/AD-34 | Profile assembly + envelope | ratified | partial | Closes OQ-117 and ARCH-ENV-01 (architecture OQ-118 ID superseded) |
| PM/AD-35 | Nested Department schema | ratified | absent | Closes DEPARTMENT-EDGE design. No table |

Existing PM/AD-1..PM/AD-25 identifiers are preserved. PM/AD-26..PM/AD-35 are new sequential IDs. No ID was reused or retired.

### 3.1 Dimension register

| Dimension | Owner | Design | Implementation | Blocker | Disposition |
|---|---|---|---|---|---|
| Operational envelope | **Architect** | open | absent | `OPERATIONAL-ENVELOPE` | Hosting, topology, observability, alert ownership, retry surface, timezone validation, workers, rollback, secrets. Open. Not a readiness claim. |
| Frontend architecture | **Architect** | ratified | transition-debt | TD-11 | PM/AD-25. Global five-minute cache is divergence, not the target. |

## 4. Implementation baseline

### 4.1 Confirmed present

- NestJS/Prisma backend with `user-management`, `access-control`, storage, and health modules.
- Access Control facade, Phase-0 audience resolver, functional-role evaluator, Prisma adapters, bootstrap, and schema.
- User, Relationship, Project, Policy, Permission, grant, attachment, and bootstrap models.
- Basic User list/read/edit/photo runtime surface.
- Scenario, E2E, workboard, and sprint artifacts for Access Control, User Management, and Mentorship.

### 4.2 Confirmed absent or incomplete

- User Management production adoption of the Access Control facade.
- Production magic-link authentication.
- Audience-safe S1 response envelope and broader section projections.
- UserEvents, EmploymentStatus, Departure, Department, MentorshipPair, and MentorshipAvailability models.
- Organisational mutation, career timeline, departure, and Mentorship routes.
- Project/department audience traversal and required Timetracker sync.
- Runtime role administration UI/API, directory engine, dashboards, resourcing, risks, campaigns, CDS, feedback, and most profile sections.
- People Management frontend features.

## 5. Risk assessment

### P0/P1 transition risks

- Interim target authorization permits **every** operation on **every** target, not only reads. `isAllowedForTarget` returns `Boolean(userId)` regardless of feature or target, and three handlers route through it: `GET /users/:id`, `PATCH /users/:id`, and `PUT /users/:id/photo`. The writes are as ungated as the read.
- The interim session resolver additionally **self-provisions a privileged account**: `Bearer <token:Root>` against a database with no seeded root creates a `User` with `position: 'HR Admin'`, which the interim access-control adapter then grants `user-management:create|deactivate|list`. This bypasses the Access Control spine's bootstrap contract and contradicts AD-12's stated Prevents and AD-16's no-provisioning rule. Tracked as TD-02 (re-scoped to P0) and blocker `SEC-AUTH-01`. It is **latent, not live** — the backend is not containerized in `docker-compose.yml` and is not deployed — which is a reason to sequence the fix before the first shared-environment deploy, not a reason to downgrade it. *(2026-09-03: implementation evidence for this fix exists on the unmerged `dn-um-implementation` branch — see `blockers.yaml`'s `SEC-AUTH-01` `status_note`. Not merged or independently verified; this description remains accurate for the code on this branch.)*
- Whole-row User serialization can expose technical/non-S1 fields on **all six** User handlers, including the `GET /users` list — not only `GET /users/:id`.
- Legacy create/deactivate routes preserve the wrong population and lifecycle model.
- A draft or red test can be mistaken for implemented behavior if delivery status is not checked.

### Delivery risks

- Missing section/audience increments block apparently independent feature stories.
- Open shared-transaction contracts block relationship, departure, and Mentorship implementation.
- Draft Mentorship artifacts must still pass AD-1; the context boundary is approved, feature delivery is not.
- Uncovered product FRs can disappear from local context plans without the global coverage model.

## 6. Accepted transition posture

Transition debt is accepted only as dated brownfield evidence, not as target behavior. Each item in `transition-debt.yaml` has an owner and expiry trigger. P0 items TD-01, **TD-02**, and TD-04 remain blockers for any claim that the User Management profile surface is production-secure — **reads and writes alike**.

No expiry is time-based unless an approved delivery plan supplies a date. The trigger is the named story/spec reaching independently approved production evidence.

## 7. Blocker register

`blockers.yaml` is authoritative (**30** entries: **18** open, **8** closed, **4** superseded). Design resolved in `2026-09-02-architect-design-batch` / `2026-09-02-reviewer-gate-correction` is recorded as `design_status: resolved-approved`; those rows stay **open** until their closure conditions are met with production evidence.

**P0 open (7).** `SEC-AUTH-01`, `CC-07` (design approved; journal table absent), `CC-08` (design approved, implementation + re-import proof), `CC-09` (design approved; UserEvents absent), `OPERATIONAL-ENVELOPE`, `TT-IDENTITY-01`, `QUALITY-GATE-AC` (closes only on `gate_status=PASS`, `p0_status=MET`, `critical_open=0`, ACM3-II-06 covered).

**P1 open (10).** `CC-06` (design approved), `CC-10-MENTORSHIP`, `ARCH-PROJ-WRITER-01` (design approved; sync absent; supersedes architecture `CC-11`), `CONFLICT-UM-01` (design superseded by PM/AD-24; implementation stale), `DEPARTMENT-EDGE` (design approved; schema absent), `AC-S9-S13`, `TT-PMDM-01`, `QUALITY-GATE-AC-NFR`, `OQ-PERM-01`, `OQ-AC-EDIT`.

**P2 open (1).** `CC-04` (implementation + CC-07 / PM/AD-29 journal enrolment). Not a design blocker on PM/AD-19.

**Closed at design (retained) (7).** `CC-05`, `OQ-105`, `OQ-114`, `OQ-115`, `OQ-116`, `OQ-117`, `ARCH-ENV-01`.

**Superseded, not closed (4).** `TIMETRACKER-CONTRACT` → `TT-IDENTITY-01` + `TT-PMDM-01`. `CC-10` → `CC-10-MENTORSHIP` + `ARCH-GOV-01`. Architecture `CC-11` → `ARCH-PROJ-WRITER-01`. Architecture `OQ-118` → `ARCH-ENV-01`.

**Also closed (register).** `ARCH-GOV-01` (spine `approved-with-open-items`, README cites it, qualified refs documented). `TD-10` retired in `transition-debt.yaml`.

### 7.1 CC-08 design resolved, implementation open

PM/AD-22 is the ownership rule. TimeTracker does not write employment state. Seed initializes only. Executor owns active→dismissed. `User.isActive` is a temporary projection updated in the same transaction. Legacy deactivate must not remain an independent writer. **Closure still requires proof that re-import cannot restore access** after departure, covering both `EmploymentStatus` and `isActive`. No application code was changed.

### 7.2 AD-24 supersedes UMAC 403 without rewriting history

Historical `approvals.yaml`, SPEC body, `umac-05`, and committed-red tests remain 403 evidence. They are marked superseded/stale. Regeneration is AD-1. Live architecture is 401 / 404 / 403 with hidden-target 404 first.

## 8. Historical artifact disposition

The following remain unchanged historical or point-in-time records except where `2026-09-02-reviewer-gate-correction` / `2026-09-02-doc-cleanup` added an explicit superseded/stale banner or annotation:

- Historical UMAC 2026-09-01 approval evidence (`approvals.yaml`, SPEC body 403 text, `umac-05` expectedResults). Not rewritten.
- Both architecture spines' pre-2026-09-02 history (new ADs appended; existing IDs preserved).
- All approved Sprint Change Proposals.
- Existing domain PRDs and epic files.
- Gate-decision.json FAIL record for ACM3-II-06.

Rendered files under `docs/architecture/` remain operational guidance within their declared scope. Where a rendered file conflicts with a later approved scoped package, the approved package controls that slice and the conflict must be recorded rather than silently merged.

## 9. Ratification conditions

This ratification is valid provided that:

1. Teams distinguish design correctness from implementation completeness.
2. Open blockers remain fail-closed and are not inferred away.
3. Transition debt is retired only with linked production evidence.
4. The global coverage model is maintained as the cross-product traceability source.
5. Any future architecture amendment uses a new approved decision/proposal and preserves this dated baseline.

## 10. Manual validation and automation candidates

Manual review remains required for:

- Product-owner acceptance of open business defaults.
- Architecture acceptance of shared transaction and context boundaries.
- Security review of audience/projection semantics.
- Cross-context and outage journeys.

Automation candidates:

- Verify every AD has evidence and implementation status.
- Verify transition-debt owners and expiry triggers are populated.
- Compare referenced sprint keys and paths with current artifacts.
- Alert when code evidence changes without ratification or coverage-model refresh.
- Cross-file AD status consistency: §3 against `evidence-matrix.yaml` against `transition-debt.yaml`, including reciprocal `decision_refs` links.
- The `conformant` versus `transition-debt` mutual-exclusion invariant.
- Blocker-ID reconciliation between §7 prose and `blockers.yaml` (current: 16 open / 10 closed / 4 superseded = 30).
- Evidence-path existence (file rather than directory) and gate IDs resolving in `blockers.yaml`.
- Spine/ratification frontmatter `revision` against the latest in-body revision heading.
- Pinned-SHA reachability and superproject/submodule cleanliness at pin time.

Not automatable, and deliberately kept manual: the authority-and-chronology arbitration that keeps `CONFLICT-UM-01` open on the implementation axis while product design is resolved, and the judgement about which dimensions an initiative-altitude ratification owns.

## 11. Revision log

Detailed history is retained in `.memlog.md` and `reviews/`. This section is a dated pointer list only.

| Revision | What it did | Where to read |
|---|---|---|
| `2026-09-02-reviewer-gate-update` | First Reviewer Gate corrections; blockers expanded; neither spine edited | `.memlog.md`; `reviews/review-*.md` |
| Second gate pass (same day) | Self-corrections after FAIL; open findings carried | `reviews/review-adversarial-seams.md`, `review-correction-verification.md` |
| `2026-09-02-batch-architecture-update` | User batch; PM/AD-22..PM/AD-25; mentorship/action-items confirmed | `.memlog.md` |
| `2026-09-02-architect-design-batch` | PM/AD-26..PM/AD-35; design closures listed in §3 | `.memlog.md` |
| `2026-09-02-reviewer-gate-correction` | H1–H7/H11 reconciliation; H8 verified; current package revision | `reviews/CORRECTION-VERIFICATION-PROMPT-2026-09-02-reviewer-gate.md` |
| `2026-09-02-doc-cleanup` | Editorial/status/traceability reconciliation from bmad-review §§1–2; no new ADs | `.memlog.md` (this update) |

Live open/closed/superseded surface: §7 and `blockers.yaml` (16 open / 10 closed / 4 superseded).
