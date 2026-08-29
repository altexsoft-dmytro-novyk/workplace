---
stepsCompleted: [1]
inputDocuments:
  - docs/requirements-changelog-v1.2-to-v1.5.md
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-08-27.md
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
---

# Platform Spec v1.5 Alignment — Epic Breakdown

## Overview

Cross-cutting planning/test/architecture alignment to spec **v1.5** after research merge and partial update in commit `7ed0de3`. This is **not** a fifth user-management feature epic.

**Primary delta index:** [docs/requirements-changelog-v1.2-to-v1.5.md](../../../docs/requirements-changelog-v1.2-to-v1.5.md)  
**Normative SoT:** [docs/project-requirements.md](../../../docs/project-requirements.md)  
**Sprint Change Proposal:** [sprint-change-proposal-2026-08-27.md](../sprint-change-proposal-2026-08-27.md)

**Out of scope for this epic:** application code; UM Epics 2–4 feature work; `um-seed-01`..`03` (owned by UM Story 1.1).

**Weekend MVP gate:** Platform stories below agreed before platform-wide matrix engine / dashboard engine implementation. UM continues on seeded population.

## Epic: Platform Spec v1.5 Alignment

**Status:** backlog  
**Tracker:** `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`

### Story P-1: Changelog Traceability Matrix

As a planner,
I want every v1.2→v1.5 changelog row traced to artifact status,
So that weekend work knows what is done, gap, or N/A.

**Acceptance Criteria:**

- Matrix includes a row for **`docs/project-requirements.md` as SoT** (not only the changelog).
- Each Breaking + Roles/Departments/Profile/Risks/Resourcing/Sharing/Lifecycle/Integrations/DoD item maps to PRD / SPEC / architecture / test-design status: `done` | `gap` | `N/A`.
- Output lives under `_bmad-output/planning-artifacts/platform/` (or linked from this epic).

### Story P-2: Platform PRD + Addendum Drift Close

As a product owner,
I want the people-management PRD addendum and memlog aligned to v1.5,
So that DEC/v1.3 “pending” language does not contradict the SoT.

**Acceptance Criteria:**

- Addendum drift register updated (drop obsolete “pending v1.3” framing where v1.5 closed it).
- Pattern E states timetracker **required**, PeopleForce **good-to-have** prefill only.
- Memlog assumptions that still cite v1.2 as authoritative are corrected or struck.

### Story P-3: Access-Control SPEC + Stage-1 Suite Alignment

As a QA/architect partner,
I want access-control SPEC and scenarios to match v1.5 audiences and rules,
So that stage-2 E2E does not encode a single Manager line or HR Admin full matrix access.

**Acceptance Criteria:**

- Reporting line vs Project line split reflected in CAP intents/success criteria.
- HR Admin = configuration only; full-profile access = separate §2.4 grant mechanism.
- Never-share set `{S3, S7, S13, S14}`; cfg defaults per §4.8.
- Close or rewrite OQ2/OQ3/OQ4/OQ6 where v1.5 answers them; department-manager tier no longer “provisional-only because not in requirements.”

### Story P-4: Architecture Binding Updates

As an architect,
I want spine AD-10 and `docs/architecture/access-control.md` to describe three manager relations and split lines,
So that implementers do not build one transitive Manager-line graph as the v1.5 model.

**Acceptance Criteria:**

- ARCHITECTURE-SPINE AD-10 and access-control.md document Reporting vs Project line behavior.
- Department management as a manager-access relation is specified (even if implementation phasing is staged).
- Full-profile grant and journal scope are noted; revocation timing (platform next-request vs project 15m / 4h outage) referenced from SoT.

### Story P-5: Dashboards + §4.4 v1.5 Fixed Facts

As an architect,
I want `docs/architecture/dashboards.md` “already fixed” section to include v1.5 deltas,
So that engine design (when decided) does not miss Unassigned bucket / risk-active rules.

**Acceptance Criteria:**

- Document Unassigned bucket, risk “active” ≠ `low`, and project-line counter implications as fixed product facts.
- Engine/widget model remains **TBD** — no improvised implementation.

### Story P-6: Platform Test-Design Refresh (v1.2 → v1.5)

As a TEA owner,
I want platform test-design artifacts updated off PRD v1.2 assumptions,
So that PF vacancies SoT and dual-required integrations are not planned as mandatory.

**Acceptance Criteria:**

- `test-design-architecture-platform`, QA, handoff, and validation cite v1.5 / current SoT.
- PeopleForce = optional prefill; no PF vacancies SoT as required.
- Timetracker is the only required integration; DoD negatives for narrowed project-line noted; PR-B-04 re-gated.

### Story P-7: UM Planning Residual (Non–Epic-2–4 Scope)

As a UM planner,
I want SPEC/README CAP-1 retirement confirmed against Story 1.1,
So that test contracts do not still mandate HTTP registration.

**Acceptance Criteria:**

- `spec-user-management-test-cases` CAP-1 retired/superseded in favor of seed scenarios.
- Registration folder disposition matches Story 1.1 (retired pointer).
- Does **not** change UM Epics 2–4 feature scope.

### Story P-8: Doc Pass — Create-Path Removal from Binding Docs

As a platform doc owner,
I want binding docs to stop listing `POST /users` create,
So that AD-14 and api-conventions agree with v1.5.

**Acceptance Criteria:**

- `docs/architecture/api-conventions.md`: remove `POST /users` (create) from User resource shape.
- `docs/architecture/user-management-test-decisions.md`: retire/rewrite DEC-UM-003/006/008/009 (and um-reg traces); keep DEC-UM-001/002/004/005/007 as applicable.
- Code removal of `POST /users` remains **implementation handoff** (not this story’s deliverable).

### Story P-9: Register Epic in Platform Sprint Status

As a delivery lead,
I want platform stories tracked outside user-management sprint keys,
So that Alignment work is visible for the weekend build.

**Acceptance Criteria:**

- `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` lists this epic and P-1…P-9.
- No Platform stories nested under UM `epic-1`…`epic-4` keys.

## Epic: Access Control Foundation

Deliver a narrow, reusable audience-resolution boundary without taking ownership of User Management routes, profile projection, or UI. This is a two-day technical foundation; it does not replace the full Access Control facade program or its complete Stage-1 suite.

### Story ACF-1: Resolve Phase-0 Audiences

As a consuming bounded context,
I want a fail-closed Access Control facade that resolves Phase-0 relationship audiences for one or more employee targets,
So that User Management can later replace its interim target-access adapter without re-implementing relationship logic.

**Implementation gate:** The dedicated `spec-access-control-audience-foundation` Stage-1 scenarios must receive independent human AD-1 approval, then be translated to independently approved red E2E before production code begins.

**Acceptance Criteria:**

- `resolveAudiences(viewerId, employeeIds)` returns only Self, Reporting line, direct People Partner, or Colleague for every requested target; Self is exclusive of other audiences.
- Reporting line follows only live `Relationship type='direct'` edges; direct People Partner follows only the target's assigned `people_partner` edge.
- Empty input returns an empty result without database queries; broken or orphaned relationship data reduces access and never grants it.
- No User Management controller, guard, adapter, or frontend file changes are included.
- No Project, Department, PP HR-line, shared-link, full-profile, functional-permission, or section-matrix decision is enabled by this story.
