---
title: Sprint Change Proposal — People Management Documentation Re-baseline
status: approved-and-applied
date: 2026-09-02
mode: incremental
scope: moderate
change_type: documentation-only
approved_by: User
approved_on: 2026-09-02
---

# Sprint Change Proposal: People Management Documentation Re-baseline

## 1. Issue Summary

People Management currently has three draft PRDs, three context-local epic breakdowns, approved change proposals, and partially implemented features. These artifacts remain useful evidence, but their overlapping identifiers and mixed maturity make product authority and delivery coverage ambiguous.

The trigger is documentation drift discovered after implementation began:

- `docs/project-requirements.md` v1.5 is normative, but the People Management, User Management, and Mentorship PRDs can each be read as product authority.
- Bare `FR-*`, Epic, and Story identifiers collide across product and bounded-context documents.
- The Access Control kernel is implemented, User Management is in transition, Mentorship is design/test-only, and most broader platform scope is uncovered.
- Architecture intent is mostly coherent, but the parent spine is draft while rendered rules are described as binding.
- Existing code still contains known transition behavior: interim authorization/session adapters, legacy create/deactivate routes, and an over-broad profile response.
- The empty-audience profile-denial contract remains contradictory: approved adoption artifacts use `403`, while the User Management PRD and test-case specification use `404`.

This proposal re-baselines documentation only. It does not authorize or change application behavior, schemas, routes, dependencies, deployments, or service gitlinks.

## 2. Impact Analysis

### 2.1 Epic impact

- The platform, User Management, and Mentorship epic files remain valid bounded-context slices.
- They are not merged or rewritten because their histories, story references, compiled specifications, and sprint trackers remain useful.
- A new global model will provide the only cross-product FR → Epic → Story rollup.
- No epic or story is added, removed, renumbered, or resequenced by this correction.
- `sprint-status.yaml` changes are therefore not required.

### 2.2 Story impact

- Existing story bodies and acceptance criteria remain unchanged.
- Workboard identifiers `ACF-*`, `ACM-*`, and `UMAC-*` remain stable.
- Global aliases will namespace context-local story identifiers as `PLAT-E*`, `UM-E*`, and `M-E*`.
- Removed or retired work remains visible as `superseded`; it is not deleted.

### 2.3 Artifact conflicts

| Area | Conflict | Re-baseline response |
|---|---|---|
| Product requirements | Three draft PRDs appear authoritative | Promote the existing People Management PRD; preserve bounded-context PRDs as historical inputs |
| Domain detail | UM and Mentorship rules live in PRD-shaped artifacts | Create one domain spec per bounded context |
| Architecture | Draft parent spine, binding rendered rules, approved AC slice | Add a dated ratification overlay with separate correctness/completeness verdicts |
| Coverage | FR/Epic/Story collisions and no global rollup | Add a namespaced machine-readable coverage model |
| Denial semantics | `403` versus `404` for empty audience | Record as an open conflict; do not invent a rule |
| Departure | Product FR-41 adds project-management blocking not present in normative §4.16 | Align the canonical PRD to the normative manager/People Partner rule |

### 2.4 Technical impact

There is no intended runtime impact. Implementation paths are evidence sources only.

Highest-risk transition debt to expose:

- Interim Access Control target checks can allow over-broad profile access.
- `GET /users/:id` currently returns a broader user shape than the intended S1 projection.
- `POST /users` and `DELETE /users/:id` conflict with the v1.5 seeded-population and departure model.
- Project-line and department audience walks, lifecycle models, Mentorship, and most profile sections are absent.
- Frontend People Management functionality is not implemented.

## 3. Recommended Approach

Use a direct documentation adjustment:

1. Promote the current People Management PRD as the canonical product interpretation of the unchanged v1.5 normative assignment.
2. Create consolidated User Management and Mentorship domain specs.
3. Ratify architecture with explicit transition debt and blockers.
4. Create one global FR → Epic → Story coverage model.
5. Preserve existing bounded-context PRDs, epic files, approved proposals, compiled specs, retired tests, architecture spines, and prior memlogs.

### Alternatives considered

- **Potential rollback:** Not viable. No application rollback is needed to correct documentation authority.
- **MVP reduction:** Not selected. The trigger is traceability and authority drift, not evidence that the normative MVP should be reduced.
- **Rewrite all existing artifacts:** Rejected because it would erase point-in-time evidence and break downstream references.

### Effort and risk

- Documentation effort: Medium.
- Runtime-change risk: Low, because service code and behavior are excluded.
- Documentation-consistency risk: Medium.
- False-confidence risk: High unless uncovered scope, transition debt, and open decisions remain explicit.
- Timeline impact: No implementation schedule change is asserted; future planning gains a single coverage baseline.

## 4. Detailed Change Proposals

All four proposals were reviewed and approved individually in Incremental mode on 2026-09-02.

### 4.1 Canonical product PRD

**Artifact:** `prds/prd-people-management-2026-08-24/prd.md`

**OLD**

- Status is `draft`.
- Authority is described but not formalized as a canonical hierarchy.
- Product and domain FR namespaces can collide.
- Domain decomposition points to draft PRDs/epics.
- FR-41 includes a project-management departure block not stated in normative §4.16.
- Current gates and the denial-status conflict are not consolidated.

**NEW**

- Promote to `status: canonical`, dated 2026-09-02.
- Keep `docs/project-requirements.md` v1.5 as the upstream normative assignment.
- Add authority, preservation, bounded-context ownership, identifier, status, decision, and traceability sections.
- Keep `PM-FR-1..42`; use `UM-FR-*` and `M-FR-*` only as historical/domain aliases.
- Point decomposition to the new domain specs.
- Align FR-41 to the normative re-parenting rule.
- Record unresolved gates and `403`/`404` conflict without selecting behavior.
- Append a promotion event to the PRD memlog without altering prior entries.

### 4.2 Bounded-context domain specs

**Artifacts:**

- `specs/spec-user-management-domain/SPEC.md`
- `specs/spec-mentorship-domain/SPEC.md`

**OLD**

- Domain rules are held in draft PRDs that can be mistaken for product authority.
- Existing capability and test specs cover selected slices only.

**NEW**

- Create one consolidated domain spec per bounded context.
- Map each domain capability to canonical `PM-FR-*` parents and historical domain FR aliases.
- State boundaries, invariants, contracts, lifecycle/API/data expectations, implementation evidence, blockers, and references to existing specs.
- Mark User Management as partially implemented/in transition.
- Mark Mentorship as specified/blocked and not implemented.
- Add new append-only memlogs.
- Leave both source PRDs unchanged.

### 4.3 Architecture ratification overlay

**Artifact directory:** `architecture/architecture-people-management-ratification-2026-09-02/`

**OLD**

- Architecture correctness and implementation completeness are mixed across draft/approved documents and audits.
- Transition deviations and blockers are scattered.

**NEW**

- Add `ARCHITECTURE-RATIFICATION.md`.
- Add `evidence-matrix.yaml`, `transition-debt.yaml`, and `blockers.yaml`.
- Rate each AD independently for architecture correctness and implementation completeness.
- Record accepted transition debt with owner and expiry trigger.
- Record CC/OQ/external contract gates without closing them.
- Do not claim production readiness.
- Leave original architecture documents unchanged.

### 4.4 Global FR → Epic → Story coverage model

**Artifact directory:** `planning-artifacts/global-coverage/`

**OLD**

- Bare identifiers collide.
- No artifact covers the product globally.
- Sprint, spec, and implementation evidence is fragmented.

**NEW**

- Add `global-fr-epic-story-coverage.yaml`, `README.md`, and `.memlog.md`.
- Anchor product requirements to normative document sections.
- Namespace product/domain FRs, epics, and stories.
- Preserve existing workboard identifiers.
- Use statuses `implemented`, `in-progress`, `specified`, `deferred`, `superseded`, and `uncovered`.
- Record dependencies, gates, conflicts, sprint keys, specs, and evidence.
- Explicitly list uncovered normative scope.
- Keep all three epic files unchanged as bounded-context slices.

## 5. Implementation Handoff

### Scope classification

**Moderate** — product/backlog governance and documentation authority change, but application behavior does not.

### Responsibilities

- **Product Manager / Product Owner:** approve canonical product interpretation and retain ownership of unresolved business decisions.
- **Solution Architect:** accept or revise architecture transition debt and blockers; do not treat ratification as implementation completion.
- **Quality Engineering:** validate traceability completeness, identifier uniqueness, status evidence, unresolved conflicts, and absence of false coverage.
- **Developer:** no application implementation is authorized by this proposal.

### Success criteria

- Exactly one canonical product PRD exists beneath the unchanged normative assignment.
- User Management and Mentorship each have one consolidated domain spec.
- Architecture decisions have evidence-backed correctness and completeness statuses.
- Every canonical PM FR appears exactly once in the global inventory and has explicit mapped or uncovered status.
- Existing historical records remain unchanged, except the promoted canonical PRD and append-only new promotion log entry.
- No application code, service configuration, dependency, schema, route, test behavior, or gitlink changes occur.
- YAML and Markdown artifacts validate; all referenced paths exist or are explicitly marked planned/external.
- Open conflicts and gates remain visible.

## 6. Correct Course Checklist

| Item | Status | Result |
|---|---|---|
| 1.1 Triggering story | N/A | Cross-artifact brownfield drift, not one story |
| 1.2 Core problem | Done | Documentation authority and traceability fragmentation |
| 1.3 Evidence | Done | PRDs, epics, proposals, sprint status, code, tests, schemas |
| 2.1 Current epic viability | Done | Context epic slices remain viable |
| 2.2 Required epic changes | Done | No body changes; add global index |
| 2.3 Remaining epic impact | Done | Status/evidence rolled up globally |
| 2.4 Obsolete/new epics | Done | No new or removed epic proposed |
| 2.5 Ordering/priority | N/A | No resequencing |
| 3.1 PRD conflict | Done | Promote one canonical PRD |
| 3.2 Architecture conflict | Done | Dated ratification overlay |
| 3.3 UI/UX conflict | N/A | No standalone UX baseline; frontend is a shell |
| 3.4 Other artifacts | Done | Specs, test evidence, sprint trackers, history reviewed |
| 4.1 Direct adjustment | Viable | Medium effort, low runtime risk |
| 4.2 Rollback | Not viable | No runtime rollback required |
| 4.3 MVP review | Not selected | No scope reduction supported by trigger |
| 4.4 Recommended path | Done | Direct documentation re-baseline |
| 5.1 Issue summary | Done | §1 |
| 5.2 Impact | Done | §2 |
| 5.3 Path forward | Done | §3 |
| 5.4 MVP/action plan | Done | No MVP change; four documentation packages |
| 5.5 Handoff | Done | §5 |
| 6.1 Checklist review | Done | All applicable items addressed |
| 6.2 Proposal accuracy | Done | YAML, identifier, sprint-key, lint, and diff validation completed |
| 6.3 User approval | Done | User approved all Incremental proposals and final implementation on 2026-09-02 |
| 6.4 Sprint status update | N/A | No epic/story structural changes |
| 6.5 Next steps | Done | Documentation governance handoff recorded below |

## 7. Execution and Handoff Record

Applied on 2026-09-02:

- Promoted the existing People Management PRD and appended its re-baseline memlog entry.
- Created canonical User Management and Mentorship domain specs with new memlogs.
- Created the dated architecture ratification, evidence, transition-debt, and blocker artifacts.
- Created the global FR → Epic → Story coverage model, governance README, and memlog.
- Left domain PRDs, epic files, sprint trackers, architecture spines, approved proposals, compiled specs, retired tests, application code, and service gitlinks unchanged.

Handoff:

- Product Owner: resolve OQ-PERM-01 and CONFLICT-UM-01.
- Architect: resolve CC-04/05/06/07, Department/Timetracker contracts, and S9/S13 increments.
- Quality Engineering: maintain global coverage drift checks and validate that evidence supports status changes.
- Developers: use the canonical PRD, domain specs, architecture ratification, and global model as planning inputs; no code work is authorized by this proposal alone.

## 8. Verification Evidence

Documentation checks:

- PASS — all four new YAML artifacts parse.
- PASS — PM-FR-1 through PM-FR-42 exist exactly once and in order in the global model.
- PASS — every coverage/story status uses the approved enum.
- PASS — every mapped story ID is namespaced and every mapped sprint key exists in its context tracker.
- PASS — architecture evidence paths exist.
- PASS — canonical PRD contains the complete FR-1 through FR-42 set.
- PASS — `git diff --check`.
- PASS — IDE lint reported no errors in changed documentation.
- PASS — no tracked historical artifact, application file, or service gitlink changed.

Service regression checks:

- Backend build: PASS.
- Backend unit tests: PASS — 2 suites, 13 tests.
- Backend lint: FAIL on 12 pre-existing errors in test/measurement files. The lint script auto-fixed tracked files before reporting errors; that generated diff was fully reversed, and the backend returned to its pre-check tracked state.
- Frontend typecheck, lint, format check, and build: PASS.
- Frontend Playwright: NOT RUN — the required Chromium executable is absent. The sandbox blocked downloading it; no project dependency or code was changed.
- Full backend E2E: not used as a re-baseline pass gate because the repository intentionally contains committed-red future-feature suites and requires database orchestration. Existing gate state remains evidence in the architecture ratification.

