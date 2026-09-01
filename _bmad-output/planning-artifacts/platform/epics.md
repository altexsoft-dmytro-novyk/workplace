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

## Epic 1: Platform Spec v1.5 Alignment

**Status:** in-progress  
**Tracker:** `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`

### Story 1.1: Changelog Traceability Matrix

As a planner,
I want every v1.2→v1.5 changelog row traced to artifact status,
So that weekend work knows what is done, gap, or N/A.

**Acceptance Criteria:**

- Matrix includes a row for **`docs/project-requirements.md` as SoT** (not only the changelog).
- Each Breaking + Roles/Departments/Profile/Risks/Resourcing/Sharing/Lifecycle/Integrations/DoD item maps to PRD / SPEC / architecture / test-design status: `done` | `gap` | `N/A`.
- Output lives under `_bmad-output/planning-artifacts/platform/` (or linked from this epic).

### Story 1.2: Platform PRD + Addendum Drift Close

As a product owner,
I want the people-management PRD addendum and memlog aligned to v1.5,
So that DEC/v1.3 “pending” language does not contradict the SoT.

**Acceptance Criteria:**

- Addendum drift register updated (drop obsolete “pending v1.3” framing where v1.5 closed it).
- Pattern E states timetracker **required**, PeopleForce **good-to-have** prefill only.
- Memlog assumptions that still cite v1.2 as authoritative are corrected or struck.

### Story 1.3: Access-Control SPEC + Stage-1 Suite Alignment

As a QA/architect partner,
I want access-control SPEC and scenarios to match v1.5 audiences and rules,
So that stage-2 E2E does not encode a single Manager line or HR Admin full matrix access.

**Acceptance Criteria:**

- Reporting line vs Project line split reflected in CAP intents/success criteria.
- HR Admin = configuration only; full-profile access = separate §2.4 grant mechanism.
- Never-share set `{S3, S7, S13, S14}`; cfg defaults per §4.8.
- Close or rewrite OQ2/OQ3/OQ4/OQ6 where v1.5 answers them; department-manager tier no longer “provisional-only because not in requirements.”

### Story 1.4: Architecture Binding Updates

As an architect,
I want spine AD-10 and `docs/architecture/access-control.md` to describe three manager relations and split lines,
So that implementers do not build one transitive Manager-line graph as the v1.5 model.

**Acceptance Criteria:**

- ARCHITECTURE-SPINE AD-10 and access-control.md document Reporting vs Project line behavior.
- Department management as a manager-access relation is specified (even if implementation phasing is staged).
- Full-profile grant and journal scope are noted; revocation timing (platform next-request vs project 15m / 4h outage) referenced from SoT.

### Story 1.5: Dashboards + §4.4 v1.5 Fixed Facts

As an architect,
I want `docs/architecture/dashboards.md` “already fixed” section to include v1.5 deltas,
So that engine design (when decided) does not miss Unassigned bucket / risk-active rules.

**Acceptance Criteria:**

- Document Unassigned bucket, risk “active” ≠ `low`, and project-line counter implications as fixed product facts.
- Engine/widget model remains **TBD** — no improvised implementation.

### Story 1.6: Platform Test-Design Refresh (v1.2 → v1.5)

As a TEA owner,
I want platform test-design artifacts updated off PRD v1.2 assumptions,
So that PF vacancies SoT and dual-required integrations are not planned as mandatory.

**Acceptance Criteria:**

- `test-design-architecture-platform`, QA, handoff, and validation cite v1.5 / current SoT.
- PeopleForce = optional prefill; no PF vacancies SoT as required.
- Timetracker is the only required integration; DoD negatives for narrowed project-line noted; PR-B-04 re-gated.

### Story 1.7: UM Planning Residual (Non–Epic-2–4 Scope)

As a UM planner,
I want SPEC/README CAP-1 retirement confirmed against Story 1.1,
So that test contracts do not still mandate HTTP registration.

**Acceptance Criteria:**

- `spec-user-management-test-cases` CAP-1 retired/superseded in favor of seed scenarios.
- Registration folder disposition matches Story 1.1 (retired pointer).
- Does **not** change UM Epics 2–4 feature scope.

### Story 1.8: Doc Pass — Create-Path Removal from Binding Docs

As a platform doc owner,
I want binding docs to stop listing `POST /users` create,
So that AD-14 and api-conventions agree with v1.5.

**Acceptance Criteria:**

- `docs/architecture/api-conventions.md`: remove `POST /users` (create) from User resource shape.
- `docs/architecture/user-management-test-decisions.md`: retire/rewrite DEC-UM-003/006/008/009 (and um-reg traces); keep DEC-UM-001/002/004/005/007 as applicable.
- Code removal of `POST /users` remains **implementation handoff** (not this story’s deliverable).

### Story 1.9: Register Epic in Platform Sprint Status

As a delivery lead,
I want platform stories tracked outside user-management sprint keys,
So that Alignment work is visible for the weekend build.

**Acceptance Criteria:**

- `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` lists this epic and P-1…P-9.
- No Platform stories nested under UM `epic-1`…`epic-4` keys.

## Epic 2: Access Control Foundation

Deliver a narrow, reusable audience-resolution boundary without taking ownership of User Management routes, profile projection, or UI. This is a two-day technical foundation; it does not replace the full Access Control facade program or its complete Stage-1 suite.

### Story 2.1: Resolve Phase-0 Audiences (ACF-1)

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

## Epic 3: Access Control Kernel MVP

Deliver a deployable, headless Access Control kernel without changing User
Management or frontend code. The kernel is imported into `AppModule` and proven
through its public facade on real PostgreSQL, but it does not enforce `/users`.
The product gate stays open until a separate User Management-owned integration
story supplies production rebinding, projection, and real-consumer HTTP E2E.

No canonical ACM definitions existed in Git before the approved
`sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md`; the definitions
below adopt the human-provided workboard IDs and must not be reassigned.

### Story 3.1: Inactive Viewer, Bridge, and Target Fail-Closed Behavior (ACM-3)

As a kernel consumer,
I want inactive identities to reduce audience resolution deterministically,
So that deactivation cannot create or preserve an authorization path.

**Dependency:** ACF-1.

**Acceptance Criteria:**

- Preserve a map entry for every distinct requested target; duplicate targets
  collapse to one key, and an empty target list returns an empty map with no
  relationship-graph read.
- Viewer identity validation runs before any audience derivation, Self
  included. Self is exclusive only after both viewer and target are confirmed
  present and active; where the target is the viewer, one confirmation settles
  both.
- An inactive or missing viewer maps every requested target to an empty
  audience `Set` — never Self, never the Colleague floor.
- An inactive or missing target maps to an empty audience `Set` and never falls
  back to Colleague.
- An absent manager edge terminates the chain cleanly. An edge whose endpoint is
  inactive is unusable and is treated as absent for traversal: before viewer
  proof the viewer is unproven and Reporting is denied; after viewer proof the
  chain has terminated without a repeat and Reporting is granted, with nothing
  above the dead node reachable. An edge whose endpoint row is missing is
  unreachable in supported operation — the shape `CHECK` requires a non-null
  endpoint and the foreign key restricts deletion — so it is a defensive rule,
  not a constructible scenario.
- An inactive PP endpoint grants no PP audience and bridges into no other chain.
- Reaching the viewer is provisional. The walk continues to chain termination,
  and Reporting is granted only when that target's whole walked chain terminates
  without repeating a node. A repeated node anywhere in the chain, before or
  after viewer proof, denies Reporting for that target only, so a viewer inside
  a cycle is denied rather than proven.
- For an active viewer and active target, other independently valid audiences
  may still apply; otherwise normal Colleague fallback applies.
- This story ends at the audience-resolution result. It owns no
  `canAccessSection` behavior and no dismissed-target projection.

### Story 3.2: Multi-Audience Merge (ACM-4)

As a kernel consumer,
I want every applicable audience retained for an active viewer and target,
So that a later section evaluator can combine the applicable matrix columns.

**Dependency:** ACF-1.

**Acceptance Criteria:**

- Reporting and direct PP may coexist in one target's audience `Set`.
- Self remains exclusive, and is reached only after both viewer and target are
  confirmed present and active; Colleague appears only when no stronger
  audience applies.
- Duplicate facts do not duplicate results and functional permissions never
  participate in audience merging.
- This story ends at retaining and merging the audience inputs required by
  ACM-5. It owns no `canAccessSection` behavior.
- ACM-4 is validation-only and changes no production code, so it runs under the
  named validation-only evidence exception in `testing-strategy.md`. Any missing
  approved scenario coverage or concrete behavior gap halts Stage 2 onward,
  opens a separately approved AD-1 sequence, and requires a Story Breakdown
  re-run before the package resumes.

### Story 3.3: Deploy-Time Root User Prerequisite (ACM-0)

As a deployer,
I want the normalized root User to exist and be unambiguously identified before
the functional-role bootstrap runs,
So that ACM-1 has a real root identity on a fresh migrated database instead of
an assumed one.

**Dependency:** approved FR architecture. Runs immediately before ACM-1.

**Production entrypoint:** `services/backend/prisma/seed.ts`, invoked by
`npm run db:seed`.

**Acceptance Criteria:**

- Normalize `ROOT_WORK_EMAIL` under DEC-UM-007 — trim outer whitespace and
  lowercase — before validation, write, and lookup.
- Create the root User row with the normalized value stored, so the stored
  `workEmail` is itself canonical, then validate eligibility.
- Count every row whose normalized `workEmail` equals the normalized
  `ROOT_WORK_EMAIL` **first**; a count other than one fails as unmatched or
  ambiguous **before** active state is consulted. Only then is the single row
  checked for `isActive`.
- Unrelated active employees never affect that count.
- A blank, unmatched, ambiguous, or inactive root identity fails with
  actionable diagnostics. A normalized match that is not the intended root is
  never adopted, mutated, or reactivated.
- Concurrent runs converge: the loser of the insert race takes the unique
  violation on `users_workEmail_key`, re-reads, and re-runs the exact-one
  validation. No partial state is left behind.
- Create no permission, FR policy, grant, or attachment, and add no User
  Management API, route, controller, handler, or runtime role management. The
  CRUD prohibition bars that surface, not the single deploy-time root row this
  story exists to write. This story does not implement User Management Story
  1.1's population import. That import is not blocked, but DEC-UM-009 already
  constrains it: no writer may create a second row for a normalized email that
  already exists, so an import covering the root person reuses the root `User`
  id this story created.
- Deliberate behavior change: the current seed warns and skips when
  `ROOT_WORK_EMAIL` is unset. This story replaces that with an actionable
  failure, so a deployment can no longer silently come up with no root
  identity.
- Stage-2 evidence invokes this exact production entrypoint against migrated
  PostgreSQL; re-implementing the logic inline in a test does not satisfy it.

### Story 3.4: Minimal Functional-Role Data Foundation (ACM-1)

As the Access Control kernel,
I want its minimum functional-role permissions and bootstrap attachment stored
as data,
So that feature decisions no longer depend on position strings.

**Dependency:** an independently approved FR architecture amendment resolving
OQ-3, OQ-4, OQ-6, OQ-7, and OQ-11, then a completed ACM-0.

**Production entrypoint:**
`services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`,
wrapped by `services/backend/scripts/bootstrap-access-control.ts` and invoked by
`npm run db:bootstrap:access-control`. Deployment order is `db:deploy` →
`db:seed` (ACM-0) → `db:bootstrap:access-control` (ACM-1) → `start:prod`.

**Acceptance Criteria:**

- Seed exactly `user-management:create`, `user-management:deactivate`, and
  `user-management:list`.
- Seed exactly one `hr-admin` role granting exactly those permissions, and
  exactly one bootstrap attachment.
- Resolve the bootstrap user only through the DEC-UM-007-normalized
  `ROOT_WORK_EMAIL` that ACM-0 established; never use `position === 'HR Admin'`,
  first-user selection, or another fallback.
- An absent, blank, unmatched, ambiguous, inactive, or drifted root identity
  fails the bootstrap clearly and atomically.
- Stage-1 and Stage-2 cover every CAP-3 database invariant: non-null `FR|AR`
  policy type; the FR/AR row-shape `CHECK`; the partial unique FR role key; the
  `Policies(id, type)` support key; unique immutable `Permissions.key`;
  `PolicyPermissions` pair uniqueness; the `policyType='FR'` discriminator and
  its restrictive composite foreign key rejecting an AR grant; the restrictive
  `Permissions` foreign key; the permission-first `(permissionId, policyId)`
  index, asserted against `pg_indexes`; `UserPolicies` integrity including
  rejected bad-user, bad-policy, and duplicate attachments; the
  `AccessControlBootstrap` singleton constraints; and `ON DELETE RESTRICT`
  behavior on all four functional-role-side foreign keys.
- With the `AccessControlBootstrap` singleton absent, ACM-1 adopts an existing
  FR `hr-admin` policy by natural key and an existing attachment only when that
  attachment already belongs to the located root, then writes the singleton;
  attachments belonging to anyone else stay non-bootstrap administrator state
  and are neither adopted nor transferred. With the singleton present, a changed
  normalized root is conflicting drift that fails atomically.
- An AR policy row carrying `targetRole='hr-admin'` is a different object: it is
  never adopted, mutated, counted, or reported as drift, and it is preserved.
- Create no `/roles` or `/users` route and no other role, permission,
  attachment, or default grant.

### Story 3.5: Evaluate `isAllowed` (ACM-2)

As a consuming context,
I want a live functional-permission decision through the Access Control facade,
So that feature checks use persisted FR data without widening profile access.

**Dependency:** ACM-1.

**Acceptance Criteria:**

- `isAllowed(userId, permissionKey)` reads live FR data and contains no branch
  for `hr-admin` or an individual permission name.
- Inactive or missing users, unknown keys, absent grants, and orphaned data
  return `false`.
- Evaluation reads no audience data, persists/caches no decision, and grants no
  profile audience or section access by itself.

### Story 3.6: Base Section Access for S1, S10, and S11 (ACM-5)

As a consuming context,
I want a narrow base section decision over the Phase-0 audiences,
So that future projection can consume a stable decision without being built in
this MVP.

**Dependency:** ACM-4, gated on a recorded ACM-4 disposition of `no-gap`
(`_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml`,
field `disposition`).

**Acceptance Criteria:**

- Support only S1, S10, and S11; every other section returns `none`.
- An absent target entry or empty audience `Set` returns `none`.
- S1 is `read` for Self and Colleague, and `write` for Reporting and direct PP.
- S10 and S11 are `read` for every Phase-0 audience.
- Multiple audiences merge `write > read > none`.
- S1 photo mutation and the S10/S11 colleague field subsets remain owning-
  consumer projection/command rules.

### Story 3.7: Compose the Deployable Kernel (ACM-8)

As the backend application,
I want the complete kernel available in the production dependency graph,
So that future consumers can adopt it without rebinding User Management now.

**Dependencies:** ACM-2, ACM-3, and ACM-5, gated on an ACM-9 baseline artifact
whose `status` field is `PASS`.

**Acceptance Criteria:**

- `AppModule` imports `AccessControlModule` and resolves
  `AccessControlFacade`.
- No file under `services/backend/src/user-management/**` changes.
- `ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`.
- No `/users` behavior changes and no Access Control HTTP, test-only, or debug
  endpoint is introduced.

### Story 3.8: PostgreSQL 500-Target Performance Evidence (ACM-9)

As a delivery team,
I want measured PostgreSQL evidence for the resolver's 500-target workload,
So that kernel performance risk is visible before and after composition.

**Dependencies:** baseline after ACF-1; final verification after ACM-8.

**Acceptance Criteria:**

- Run the baseline in parallel after ACF-1 without changing behavior under
  `services/backend/src/access-control/**`.
- Record p50, p95, worst case, fixture breadth/depth, query count, PostgreSQL
  version, and `EXPLAIN (ANALYZE, BUFFERS)`.
- Identify the first target-count/depth shape that breaks two seconds.
- Separately determine whether `SET LOCAL statement_timeout = '2s'` becomes the
  earlier failure point.
- Rerun the same evidence after ACM-8. Treat any optimization as a separate
  gated story and do not claim the full `/users` list/projection NFR.

### Kernel Dependency Graph

- ACF-1 → ACM-3
- ACF-1 → ACM-4 → ACM-5
- Approved FR architecture → ACM-0 → ACM-1 → ACM-2
- ACM-2 + ACM-3 + ACM-5 → ACM-8
- ACM-9 baseline runs in parallel after ACF-1; final verification reruns after
  ACM-8.

Two dependencies are conditional and are checked against persisted artifact
state, not free-text ordering:

- ACM-5 requires
  `_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml`
  to exist with `disposition: no-gap`.
- ACM-8 and ACM-9-final require the ACM-9 baseline artifact to exist with
  `status: PASS`. A `FAIL` or `INCOMPLETE` baseline halts both and opens
  separately AD-1-gated remediation; a rerun that omits the failing shape does
  not supersede it.

Every new behavior follows AD-1 in separate dispatches: Stage-1 scenario prose,
human approval, Stage-2 approved red kernel integration evidence, then
production. No dispatch may span two stages.
