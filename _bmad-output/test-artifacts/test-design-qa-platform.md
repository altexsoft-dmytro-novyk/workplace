# Test Design for QA: People Management Platform

**Purpose:** System-level QA execution recipe and requirements coverage map for the People Management Platform. It plans evidence; it does not generate test cases or replace child test designs.

**Date:** 2026-08-29  
**Author:** TEA (`bmad-testarch-test-design`, Create mode)  
**Status:** Draft — refreshed v1.5 Create run; human review pending  
**Project:** People Management Platform — Iteration 2

**Normative source:** `docs/project-requirements.md` v1.5  
**Product context:** `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md` plus `addendum.md`  
**Architecture source:** `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`

---

## Executive Summary

**Scope:** All normative requirements in v1.5 §§2–9: access roles, functional roles, full-profile grants, S1–S16, directory/profile projections, required feature workflows, timetracker, data/identity, NFRs, engineering process, and Definition of Done.

**Coverage-state vocabulary used in every coverage row:**

- **READY NOW** — requirement and test intent are sufficiently defined for feature-owned Stage-1 design; it does not claim an approved scenario or implemented test.
- **READY FOR FORMAL SIGN-OFF** — requirements plus the binding architecture direction specify the solution sufficiently for Stage-1 design/review now; E2E and implementation still require explicit Product Owner/Architect sign-off and normal AD-1 approvals.
- **PRODUCT/ARCH BLOCKED** — design cannot safely proceed until the exact listed decision is approved.
- **AC STAGE-1 DRAFT (171 files, per-file AD-1 approval pending)** — one or more Phase-1 files apply. This is not test coverage.
- **E2E DEPENDENCY (approval/consumer/integration contract)** — requirement is defined, but executable evidence depends on an approved scenario, consuming feature, UI, environment, or integration contract.
- **OUT OF SCOPE (v1.5 GOOD TO HAVE/§10)** — only v1.5 GOOD TO HAVE or §10 exclusions.

**Child ownership:**

- **User Management:** approved child QA/architecture artifacts remain unchanged and are referenced, not duplicated. They describe 45 existing Stage-1 files but still contain pre-v1.5 registration/deactivation assumptions. Seed-import replacement and departure cutover are a targeted child follow-up under AD-16/AD-20/AD-21; this platform plan does not claim the child currently covers those v1.5 outcomes.
- **Access Control:** partial SPEC-led child with **171 v1.5 Phase-1 draft scenario files**. Per-file AD-1 approval is pending. Deferred: shared links, projection surfaces, full-profile overlay, role catalog, positive Project-line cells, Department walk, and PP HR-line propagation.

**Risk summary:** 10 platform risks, exactly matching the architecture test design: 5 critical score 9 and 5 high score 6. The dominant risks are authorization leakage, stale access, non-atomic access journals, unresolved full-profile precedence, the unknown timetracker contract, directory performance, cross-context aggregate drift, operational readiness, false confidence from draft scenarios, and identity/PII failure. Architecture controls and constraints are defined in `ARCHITECTURE-SPINE.md`, especially AD-1, AD-3, AD-9, AD-10, AD-13, AD-16, and AD-19–AD-21.

**Planning volume (not generated tests):**

| Priority | Planning rows | Focus |
| --- | ---: | --- |
| P0 | ~24–34 | Authentication, authorization, privacy, access revocation, departure, required timetracker |
| P1 | ~35–55 | Core profile, directory, dashboards, workflows, integration degradation |
| P2 | ~15–25 | Edge conditions, accessibility/responsive checks, process evidence |
| P3 | ~5–10 | Exploratory and documentation consistency |
| **Total** | **~79–124** | **~12–20 QA weeks for one engineer; parallel feature owners required by AD-4** |

> P0/P1/P2/P3 are priority and risk focus, not execution timing. Counts are planning intervals, not test-case counts and not evidence of coverage.

---

## Not in Scope

| Item | Reason | Mitigation |
| --- | --- | --- |
| Notifications | §4.13 GOOD TO HAVE | If selected later, apply its per-audience negative-content model before design |
| Analytics/reports | §4.14 GOOD TO HAVE | If selected later, use employment status as the sole departure source |
| PeopleForce API prefill | §5.2 GOOD TO HAVE | Required resourcing still stores candidate ID and link |
| Employee provisioning / AD / SSO | §4.17 and §10 exclude creation and Entra ID | Idempotent import of delivered seeded population; platform-owned authentication |
| Salary/profile compensation, leave balances, pre-onboarding, email templates, LMS, assessment execution, project allocation percentages | §10 | Keep vacancy compensation separate; link to owning external systems where required |
| Mentorship goals, sessions, progress | §10 | Cover pair creation, closure, visibility, and history only |
| Live third-party calls in gate E2E | AD-3 | Real HTTP/PostgreSQL with contract-faithful outbound-port fakes; live timetracker is separate integration evidence |

---

## Dependencies & Test Blockers

### Product and Architecture Decisions

| Blocker / decision ID | Blocked design | QA need |
| --- | --- | --- |
| **PR-B-01 / OQ-114** | Runtime custom-field persistence, arbitrary sort/filter, safe projection, full directory/saved views/export | Approved EAV/JSONB and indexed visibility-safe query/test-data contract; column-per-field is excluded |
| **PR-B-02 / OQ-115** | Shared dashboard engine, widget authorization, aggregation, and counters | Approved composition and projection contract |
| **PR-B-03 / OQ-116** | Non-manager project-assignment semantics and target roles | Final Department/project policy model and positive Project-line scope |
| **PR-B-04 / OQ-117** | Profile bounded-context ownership | Owning context and API responsibility for S1–S16 projections and list contracts |
| **PR-B-05 / OQ-105** | HR Admin grant/revoke chain and remaining default role-permission assignments | Approved admin delegation/bootstrap lifecycle |
| **PR-B-06 / CC-05** | Full-profile overlay when Self also applies | Approved precedence and effective section mapping |
| **PR-B-07 / CC-07** | Immutable relationship/access journal contract for journal-backed PP/full-access/organisational mutations | Approved immutable journal schema, snapshots, reader authorization, and transaction enrollment |
| **PR-B-08** | Timetracker API/auth/identity/error contract, events vs state, partial/intermittent success | Contract-faithful adapter and deterministic security/freshness evidence |
| **PR-B-09** | Hosting, environments, secrets, backup/restore, monitoring, alerts, rollback | Deployed/demonstrable and production NFR evidence |

### Ready for Formal Sign-off

| Sign-off ID | Specified solution package | What may proceed now | What still waits |
| --- | --- | --- | --- |
| **PR-S-01 / CC-04** | Requirements + AD-19: one PP per employee; atomic optimistic create/replace/delete; next-request revocation; concurrency and journal direction | Access Control-owned direct-PP audience review and User Management-owned PP-mutation Stage-1 design/review | E2E/implementation require explicit PO/Architect sign-off, normal AD-1 approvals, and PR-B-07 / CC-07 where journal details apply |
| **PR-S-02 / CC-06** | Requirements + AD-20: effective date/reason, relationship blockers/outcomes, durable retrying fail-closed executor | Scheduled-departure Stage-1 design/review | E2E/implementation require explicit PO/Architect sign-off and normal AD-1 approvals; PR-B-09 separately blocks operational/release evidence |

CC-04 and CC-06 are specified solution packages, not discovery gaps. AD-19/AD-20 are the binding architecture directions for formal sign-off, not substitutes for that sign-off.

### E2E and Integration Dependencies

1. **Access Control approvals:** the 171 files are drafts. No Stage-2 E2E may be written before the corresponding file receives independent human AD-1 approval. **PG-01 is not schedulable.**
2. **Timetracker contract — PR-B-08:** inspect the provider documentation and record events-versus-state-at-sync, authentication, pagination, partial/intermittent success, and deterministic identity mapping. This is an integration-contract dependency, not permission to invent behavior.
3. **Departure sign-off — PR-S-02 / CC-06:** Stage-1 design/review may proceed against requirements + AD-20; E2E/implementation waits for explicit PO/Architect sign-off and normal AD-1 approvals, while PR-B-09 separately gates operations.
4. **PP sign-off and journal — PR-S-01 / CC-04; PR-B-07 / CC-07:** Access Control's direct-PP audience review and User Management-owned PP-mutation Stage-1 design/review may proceed against requirements + AD-19. E2E/implementation waits for explicit sign-off and normal AD-1 approvals; journal-dependent execution also waits for CC-07.
5. **Feature consumers:** Access Control proves boundaries; profile, directory, export, dashboards, resourcing, campaigns, feedback, CDS, mentorship, risk, timeline, and lifecycle owners prove workflow outcomes.
6. **Operational envelope — PR-B-09:** required live timetracker evidence uses its test environment and delivered seeded population; deployment/worker/timezone/health/rollback evidence requires the approved environment contract. No real employee data.
7. **Test infrastructure:** migrated PostgreSQL, isolated seeded personas, fixture factories, controllable time for 15-minute/4-hour/effective-date checks, contract-faithful port fakes, XLSX reader, accessibility tooling, and a 500+ record performance dataset.

---

## Risk Assessment

Scoring is probability × impact on a 1–3 scale. Score 9 blocks; 6–8 requires mitigation. These are QA planning risks, not final gate verdicts.

### High-Priority Risks

| Risk ID | Category | Architecture-aligned meaning | P | I | Score | QA evidence plan | Owner / timing |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| **PR-001** | SEC | Distinct audiences, narrowed fields, flags, exports, and filters create leak paths that can expose restricted employee data | 3 | 3 | **9** | Approved matrix and per-surface projection negatives plus security review | Security + AC + feature backend / before each surface |
| **PR-002** | SEC | Stale graph state can retain access after org change, sync delay, outage, or due departure | 3 | 3 | **9** | Clock-controlled next-request/15-minute/4-hour/departure-cutoff evidence | AC + Integration + Backend / before access-bearing release |
| **PR-003** | DATA | Implementing the specified PP contract before formal sign-off, or without CC-07 journal detail, can create governance or audit inconsistency | 3 | 3 | **9** | PR-S-01 sign-off trace, CC-07 schema/reader review, rollback and concurrency evidence | Product + Architect + Security + Backend / before PP E2E/implementation |
| **PR-004** | SEC | Unresolved full-profile precedence can expose Self-denied sections or create inconsistent grants | 3 | 3 | **9** | Approved overlay decision and positive/negative projection evidence | Product + Architect + Security / before full-profile Stage 1 |
| **PR-005** | TECH | Unknown timetracker contract can create stale or mixed project policies because project assignment changes data access | 3 | 3 | **9** | Provider-contract review, deterministic adapter evidence, live test-environment demonstration | Integration + Architect + Security / before adapter Stage 1 |
| **PR-006** | PERF | Arbitrary visible fields plus live bulk graph resolution may breach ≤2 seconds at 500+ rows | 2 | 3 | **6** | Versioned 500+ row report from the composed directory route | Architect + Profile Backend + DBA/DevOps / before directory release |
| **PR-007** | DATA | Dashboard/resourcing/campaign aggregates can diverge from projection rules and lifecycle facts, producing wrong decisions or leaks | 2 | 3 | **6** | Contract and cross-context invariant evidence for canonical facts and projections | Dashboard + Resourcing + Campaign Backend / before affected waves |
| **PR-008** | OPS | Implementing the specified departure contract before formal sign-off, or operating it without AD-20 deployment controls, can cause governance drift or delayed cutoff | 2 | 3 | **6** | PR-S-02 sign-off trace plus PR-B-09 deployment rehearsal, health/alert, delayed-worker, and rollback evidence | Product + Architect + DevOps + Backend + Security / before lifecycle E2E/implementation and first release |
| **PR-009** | OPS | Treating 171 draft AC files as coverage bypasses human gates and creates false release confidence | 2 | 3 | **6** | Per-file approval state and trace audit proving drafts are not counted | Engineering leads + Repository maintainers / before AC implementation |
| **PR-010** | DATA | Seed/platform/timetracker/candidate identity mismatch or real PII use can attach access to the wrong person or expose client data | 2 | 3 | **6** | Reconciliation, collision/fail-closed evidence, and repository/log scans | Integration + Backend + Security/DevOps / before imports/integrations |

All 10 risks require mitigation evidence. A documented design does not reduce the score or close the risk; final disposition belongs to the later gate/assessment workflow.

---

## Normative Coverage Map

### §2–§3 Access and Role Boundaries

These rows own authorization boundaries only. Feature workflow success remains with the consuming feature rows below.

| Trace ID | Normative requirement | Planned evidence / level | Status | Dependency or ownership note |
| --- | --- | --- | --- | --- |
| TR-2.1-01 | Access roles and functional roles remain separate; strongest applicable audience is per section | API E2E + policy unit | **AC STAGE-1 DRAFT** | Phase-1 functional-boundary and audience files; approval pending |
| TR-2.1-02 | Transitive reports-to Reporting line; relationship-specific audiences in one session | API E2E | **AC STAGE-1 DRAFT** | Phase-1 direct graph only |
| TR-2.1-03 | Nested Department management grants Reporting-line access | API E2E | **PRODUCT/ARCH BLOCKED** | PR-B-03 / OQ-116 plus approved Department edge contract |
| TR-2.1-04 | Project PM/DM line is separate, transitive only through project path, and narrower | API E2E + timetracker integration | **PRODUCT/ARCH BLOCKED** | PR-B-03 / OQ-116 defines positive scope; PR-B-08 supplies assignment/freshness contract |
| TR-2.1-05 | Direct assigned-PP audience derivation | API E2E | **AC STAGE-1 DRAFT** | Draft review continues; E2E/implementation waits for PR-S-01 / CC-04 sign-off and normal AD-1 approvals |
| TR-2.1-05A | Recursive PP HR line follows the PP's HR reporting chain, never the employee delivery chain | API E2E | **PRODUCT/ARCH BLOCKED** | PR-B-03 / OQ-116 and approved Department/HR-boundary contract; PR-S-01 sign-off still precedes E2E |
| TR-2.1-06 | Manager, PP, department, department-manager changes use dedicated permission/screen, reject self-assignment, journal atomically, apply next request | API/UI E2E | **PRODUCT/ARCH BLOCKED** | User Management owns PP mutation; its Stage-1 is READY FOR FORMAL SIGN-OFF under PR-S-01 / CC-04. Journal execution waits for PR-B-07 / CC-07; Department mutations still need the approved Department contract |
| TR-2.1-06A | PP assignment create/replace/delete, concurrency, no self-assignment, journal direction, next-request effect | API/UI E2E | **READY FOR FORMAL SIGN-OFF** | User Management-owned Stage-1 design/review proceeds against requirements + AD-19; E2E/implementation waits for PR-S-01 / CC-04 sign-off, AD-1 approvals, and PR-B-07 / CC-07 journal details |
| TR-2.1-07 | Project access changes within 15 minutes; outage withdraws it after 4 hours | Integration E2E with controllable time | **E2E DEPENDENCY** | PR-B-08 timetracker contract |
| TR-2.2-01 | UM/DM/PM/PP feature sets; PP has no resourcing; HR Admin is configuration-only | API/UI E2E | **READY NOW** | Feature owners prove menus/actions; AC Phase-1 proves HR Admin has no default data grant |
| TR-2.3-01 | Runtime role/permission catalog CRUD and assignment through UI, no deploy/schema change | UI E2E + API contract | **E2E DEPENDENCY** | Deferred role-catalog child/consumer; no current approved UR suite |
| TR-2.3-02 | Every listed permission independently grantable; removal immediate | API/UI E2E | **E2E DEPENDENCY** | Role catalog plus each feature consumer |
| TR-2.3-03 | Functional permissions never widen data; campaign exception remains campaign-local | API E2E | **AC STAGE-1 DRAFT** | Base dual-gate only; campaign exception needs campaign consumer |
| TR-2.3-04 | HR Admin delegation and default starting-role permission assignments approved by PO | Configuration review + UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-05 / OQ-105 |
| TR-2.4-01 | Separate full-profile grant, holder-only grant, no self-assignment, seeded first holder, last-holder guard, journal | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-06 / CC-05 for overlay precedence; CC-07 for the shared journal contract. CC-04 is PP-only and does not apply here |
| TR-3.1-01 | No profile-level permission; server assembles sections per request | API E2E | **E2E DEPENDENCY** | AC base decisions plus profile projection consumer |
| TR-3.2-S01 | S1 identity-card matrix, photo exception, relationship fields not writable in S1 | API E2E | **AC STAGE-1 DRAFT** | Phase-1 audiences only; Project/full/shared overlays deferred |
| TR-3.2-S02 | S2 personal-contact matrix | API E2E | **AC STAGE-1 DRAFT** | Same limitation |
| TR-3.2-S03 | S3 emergency-contact matrix | API E2E | **AC STAGE-1 DRAFT** | Same limitation |
| TR-3.2-S04 | S4 employment matrix | API E2E | **AC STAGE-1 DRAFT** | Workflow and temporal records are feature-owned |
| TR-3.2-S05 | S5 document matrix including Project CV/cert narrowing and self certificate upload | API E2E | **AC STAGE-1 DRAFT** | Project positive cells deferred |
| TR-3.2-S06 | S6 risk matrix; Self/Colleague denial | API E2E | **AC STAGE-1 DRAFT** | Risk workflow separately owned |
| TR-3.2-S07 | S7 flags, PM read narrowing, employee record-level visibility | API E2E | **AC STAGE-1 DRAFT** | PM positive/flag behavior awaits Project-line suite |
| TR-3.2-S08 | S8 feedback visibility matrix | API E2E | **AC STAGE-1 DRAFT** | Feedback workflow separately owned |
| TR-3.2-S09 | S9 timeline matrix and functional write dual gate | API E2E | **AC STAGE-1 DRAFT** | Timeline workflow separately owned |
| TR-3.2-S10 | S10 leaves; colleague dates only | API E2E | **AC STAGE-1 DRAFT** | Data freshness/display requires timetracker |
| TR-3.2-S11 | S11 projects; colleague project name only | API E2E | **AC STAGE-1 DRAFT** | Positive Project-line and sync deferred |
| TR-3.2-S12 | S12 CDS matrix and self IDP completion exception | API E2E | **AC STAGE-1 DRAFT** | CDS workflow separately owned |
| TR-3.2-S13 | S13 mentorship matrix and self flag exception | API E2E | **AC STAGE-1 DRAFT** | Pair-note privacy also needs mentorship consumer |
| TR-3.2-S14 | S14 tasks matrix and self completion exception | API E2E | **AC STAGE-1 DRAFT** | Campaign exception needs campaign consumer |
| TR-3.2-S15 | S15 request-history matrix | API E2E | **AC STAGE-1 DRAFT** | Resourcing workflow separately owned |
| TR-3.2-S16 | S16 per-field visibility matrix | API E2E | **AC STAGE-1 DRAFT** | Runtime filter/projection is PRODUCT/ARCH BLOCKED by OQ-114 |
| TR-3.3-01 | `—`, narrowed, and flag-gated facts absent from UI/API/export/search/errors/notifications | API/UI/download E2E | **E2E DEPENDENCY** | Projection-surface suite deferred; each consumer must prove its surface |
| TR-3.3-02 | Colleague whitelist exactly S1 + S10 dates + S11 project name | API/UI E2E | **AC STAGE-1 DRAFT** | Base section projection only; list/profile consumers still required |
| TR-3.3-03 | Hidden custom values cannot be inferred through filters/columns | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-01 / OQ-114 |
| TR-3.3-04 | Campaign sender sees only recipient name and own campaign task status until close | API/UI E2E | **E2E DEPENDENCY** | Campaign workflow/consumer |
| TR-3.4-01 | Narrow journal event set, fields, and reader authorization | API E2E + DB transaction evidence | **PRODUCT/ARCH BLOCKED** | PR-B-07 / CC-07; PP Stage-1 design may proceed under PR-S-01, but journal-dependent E2E/implementation waits |
| TR-4.8-AC | Authenticated named-recipient, read-only shared-link overlay; cfg/default/never set; configurable expiry (24-hour default); creator recheck; revocation; access journal | API/UI E2E | **E2E DEPENDENCY** | Shared-link child deferred; never-share set `{S3,S7,S13,S14}` |
| TR-2.4-AC | Full-profile overlay over all sections and interaction with Self | API E2E | **PRODUCT/ARCH BLOCKED** | PR-B-06 / CC-05 |
| TR-2.3-AC | Full role/permission catalog authorization | API/UI E2E | **E2E DEPENDENCY** | Deferred role-catalog dispatch |
| TR-2.1-PROJ | Positive Project-line matrix cells | API E2E | **PRODUCT/ARCH BLOCKED** | PR-B-03 / OQ-116 and PR-B-08 |
| TR-2.1-DEPT | Positive Department walk | API E2E | **PRODUCT/ARCH BLOCKED** | PR-B-03 / OQ-116 plus approved Department edge contract |
| TR-2.1-PPHR | Positive PP HR-line walk with HR boundary negative | API E2E | **PRODUCT/ARCH BLOCKED** | PR-B-03 / OQ-116 plus AD-19 Department/HR-boundary contract |

### §4 Feature Workflows and Projection Ownership

| Trace ID | Normative requirement | Planned evidence / level | Status | Dependency or ownership note |
| --- | --- | --- | --- | --- |
| TR-4.1-01 | Sortable All Employees columns | API/UI component | **E2E DEPENDENCY** | Profile/directory consumer |
| TR-4.1-02 | Any profile/derived/custom field as filter and column | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-01 / OQ-114 |
| TR-4.1-03 | Years-with-company numeric filtering and listed standard filters | API + unit | **E2E DEPENDENCY** | Directory plus owning domain data |
| TR-4.1-04 | Runtime custom-field types, values, immediate filter/column use | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-01 / OQ-114 |
| TR-4.1-05 | Inline edits obey both gates; org relationships excluded | API/UI E2E | **E2E DEPENDENCY** | Directory/profile consumer plus AC |
| TR-4.1-06 | Owner-scoped saved views, multiple tabs, manager sharing | API/UI E2E | **E2E DEPENDENCY** | Directory consumer |
| TR-4.1-07 | Current entitled view exports `.xlsx` with no hidden columns/values | API/UI/download E2E | **E2E DEPENDENCY** | Projection-surface owner; use XLSX utility |
| TR-4.1-08 | Colleague list and click-through limited profile | API/UI E2E | **E2E DEPENDENCY** | Boundary draft is insufficient without projection consumer |
| TR-4.2-01 | Profile assembles S1–S16 and header manager/PP/mentor | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-04 / OQ-117 |
| TR-4.3-01 | Self-service reads/edits/uploads/completes only enumerated capabilities | API/UI E2E | **E2E DEPENDENCY** | Profile, document, CDS, mentorship, task consumers |
| TR-4.3-02 | Self never receives risk or unflagged notes | API/UI E2E | **AC STAGE-1 DRAFT** | Also prove through profile projection |
| TR-4.4-01 | UM dashboard people grouping, exact counters/table/tasks/navigation | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-02 / OQ-115 |
| TR-4.4-02 | DM project tables, all/single selector, recalculated totals, Unassigned, PM-created requests | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-02 / OQ-115 |
| TR-4.4-03 | PM dashboard equals DM shape within own projects | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-02 / OQ-115 |
| TR-4.4-04 | PP dashboard scoped/groupable and contains no resourcing block | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PR-B-02 / OQ-115; optional widget ideas are not acceptance requirements |
| TR-4.5-01 | Manual action-item creation within audience + permission | API/UI E2E | **READY NOW** | Action-item feature owner |
| TR-4.5-02 | Fields; open→completed; completion date; author cancellation reason; overdue everywhere | API + UI component/E2E | **READY NOW** | Action-item feature owner |
| TR-4.5-03 | Campaign activation creates exactly one action item per frozen recipient | Cross-context E2E | **E2E DEPENDENCY** | Campaign/action-item contract |
| TR-4.6-01 | Fixed risk ordering/history/current/trend; any transition; no closed state; leaver ≠ dismissed | API + unit + UI | **READY NOW** | Risk owner |
| TR-4.6-02 | Active excludes low; dashboard scope/count/sort/filter/drill-through | API/UI E2E | **READY NOW** | Risk owner; dashboard page is separate from OQ-115 shared engine |
| TR-4.7-01 | Platform-owned vacancy; creation fields, department routing, optional project, Unassigned, DM visibility | API/UI E2E | **READY NOW** | Resourcing owner; no PeopleForce vacancy |
| TR-4.7-02 | Vacancy compensation visible only to author/routed UM/reviewing DM and absent elsewhere | API/UI/export negative E2E | **E2E DEPENDENCY** | Resourcing plus projection consumers |
| TR-4.7-03 | UM proposes department employees or external candidate with required PeopleForce ID/link | API/UI E2E | **READY NOW** | Candidate ID storage is required; API prefill is not |
| TR-4.7-04 | Submission auto-creates request-bound DM link with exact evaluation section set and optional S6; link expires when the request is approved, rejected, or withdrawn | Cross-context E2E | **E2E DEPENDENCY** | Resourcing/shared-link contract |
| TR-4.7-05 | DM approve/reject with reason, headcount fill, explicit close only, repeated proposals | API/UI E2E + state-machine unit | **READY NOW** | Resourcing owner |
| TR-4.7-06 | S15 attempt history excludes compensation; approval waits for timetracker assignment | Cross-context E2E | **E2E DEPENDENCY** | Resourcing, profile projection, timetracker |
| TR-4.8-01 | Manual and automatic profile-sharing workflow | API/UI E2E | **E2E DEPENDENCY** | Shared-link dispatch; see TR-4.8-AC |
| TR-4.9-01 | Automatic join/grade/position/department/type/extended-leave/mentorship events | API integration + transaction checks | **E2E DEPENDENCY** | Multiple feature owners; UM child only partially covers legacy set |
| TR-4.9-02 | Manual add/edit/delete under both gates; timeline readable chronologically | API/UI E2E | **E2E DEPENDENCY** | Timeline consumer and role defaults |
| TR-4.9-03 | Departure never creates a timeline event | Cross-context negative E2E | **E2E DEPENDENCY** | Lifecycle/timeline contract |
| TR-4.10-01 | CDS dictionary by department entity+position; external matrix/result links; conclusions | API/UI E2E | **READY NOW** | CDS owner |
| TR-4.10-02 | IDP fields, own completion and date, open definition | API/UI E2E | **READY NOW** | CDS owner |
| TR-4.10-03 | Last-assessment before/after/between/never and open-IDP filters | API/UI E2E + query unit | **E2E DEPENDENCY** | CDS/directory interworking |
| TR-4.11-01 | Self open flag, mentor/mentees, unflag behavior with active pair | API/UI E2E | **READY NOW** | Mentorship owner |
| TR-4.11-02 | Company-wide willing pool exposes S1+flag only; mentee is access-scoped | API/UI E2E | **E2E DEPENDENCY** | Mentorship projection plus AC |
| TR-4.11-03 | Pair/status lifecycle, required pair closure note, privacy, durable history and timeline events | API/UI E2E + state-machine unit | **READY NOW** | Mentorship owner |
| TR-4.11-04 | Departure auto-closes with system note and bypasses manual-note gate | Cross-context E2E | **E2E DEPENDENCY** | Lifecycle/mentorship contract |
| TR-4.12-01 | Form metadata, external-only content, filter/saved-view audience preview and adjustment | API/UI E2E | **E2E DEPENDENCY** | Campaign/directory contract |
| TR-4.12-02 | Audience freezes on activation; recipients self-report completion; sender sees exact status/overdue | API/UI E2E | **READY NOW** | Campaign owner |
| TR-4.12-03 | Campaign is sole form distribution path, including requested feedback | Cross-context E2E | **E2E DEPENDENCY** | Campaign/feedback contract |
| TR-4.13-01 | Notifications and their negative-content metric | Deferred design | **OUT OF SCOPE** | §4.13 GOOD TO HAVE |
| TR-4.14-01 | Current-state/event analytics and XLSX export | Deferred design | **OUT OF SCOPE** | §4.14 GOOD TO HAVE |
| TR-4.15-01 | Feedback fields, management default, employee share flag, chronology/period filter | API/UI E2E | **READY NOW** | Feedback owner |
| TR-4.15-02 | Joining interview is feedback; requested feedback is manually entered after campaign; no period comparison | API/UI/cross-context E2E | **E2E DEPENDENCY** | Feedback/campaign contract |
| TR-4.16-01 | Time-bounded active/dismissed status is sole departure source and filter | API/UI E2E + temporal unit | **READY FOR FORMAL SIGN-OFF** | Stage-1 design/review proceeds against requirements + AD-20; E2E/implementation waits for PR-S-02 / CC-06 sign-off and AD-1 approvals |
| TR-4.16-02 | Effective-date read-only/list/task/mentorship/account/access effects are atomic | API E2E + worker evidence | **READY FOR FORMAL SIGN-OFF** | PR-S-02 / CC-06 sign-off precedes E2E/implementation; PR-B-09 separately blocks operational/release evidence |
| TR-4.16-03 | Recording blocked for all manager/PP responsibilities; explicit re-parent and external PM/DM remediation | API/UI E2E | **READY FOR FORMAL SIGN-OFF** | PR-S-02 / CC-06 sign-off precedes E2E/implementation; timetracker-owned PM/DM remediation separately depends on PR-B-08 |
| TR-4.17-01 | Seed-only population import, platform auth, no user-create flow, no real data | API/import E2E + route negative | **E2E DEPENDENCY** | Targeted UM child seed-import follow-up; AD-16/AD-21 |
| TR-4.17-02 | Exactly one nested department; manager grants access; department maintenance/routing/timeline/CDS key | API/UI/cross-context E2E | **PRODUCT/ARCH BLOCKED** | PR-B-03 / OQ-116 plus approved Department edge contract |

### §5–§9 Integration, Data, NFR, Process, and DoD

| Trace ID | Normative requirement | Planned evidence / level | Status | Dependency or ownership note |
| --- | --- | --- | --- | --- |
| TR-5.1-01 | Pull leaves/type/dates/status for seeded users and self-service link | Contract + live test-env integration | **E2E DEPENDENCY** | PR-B-08 timetracker contract/environment |
| TR-5.1-02 | Pull projects/people/PM/DM; sync solely owns sync-managed policy rows | Contract + integration E2E | **E2E DEPENDENCY** | PR-B-08 timetracker contract/environment |
| TR-5.1-03 | Security freshness: ≤15 minutes; visible stale banner; last-known data; Project access gone after 4 failed hours | Integration/reliability E2E | **E2E DEPENDENCY** | PR-B-08; controllable clock and failure-capable adapter |
| TR-5.2-01 | Store PeopleForce candidate ID/link for external proposals | API/UI E2E | **READY NOW** | Required resourcing data, no API call needed |
| TR-5.2-02 | Optional candidate prefill preview, per-field acceptance/conflict, mapping, authorization, idempotency, forbidden fields | Deferred design | **OUT OF SCOPE** | §5.2 GOOD TO HAVE; platform vacancy remains authoritative |
| TR-6-01 | Runtime custom fields survive arbitrary filtering/sorting | API/query evidence | **PRODUCT/ARCH BLOCKED** | PR-B-01 / OQ-114 |
| TR-6-02 | Three-part role model and live split graph resolution | API E2E + architecture review | **E2E DEPENDENCY** | AC approvals plus Project/Department consumers |
| TR-6-03 | Grade/position/department/type/status are time-bounded records | API + DB integration | **E2E DEPENDENCY** | AD-16/AD-20 and owning feature models |
| TR-6-04 | Seeded user, timetracker user and optional candidate use durable IDs; email insufficient | Contract + API/integration negatives | **E2E DEPENDENCY** | `ttId` and candidate-ID mapping contract |
| TR-7-01 | Access correctness directly tested per audience/path/section | API E2E | **AC STAGE-1 DRAFT** | Phase 1 only; full DoD requires deferred suites |
| TR-7-02 | Only seeded test population; no real PII in contexts/logs/screenshots/repository | CI scan + manual provenance audit | **READY NOW** | Use synthetic identifiers and delivered seed only |
| TR-7-03 | All Employees with 500+ records and permission resolution responds within 2 seconds | k6 | **E2E DEPENDENCY** | Composed directory route and 500+ dataset |
| TR-7-04 | Integration failures do not take down app within §5.1 limits | Reliability E2E | **E2E DEPENDENCY** | Timetracker failure contract |
| TR-7-05 | Accessible and responsive list/profile/dashboard | Automated accessibility + manual viewport/keyboard review | **E2E DEPENDENCY** | No numeric WCAG target is sourced; do not invent one |
| TR-8-01 | BMAD use and deliberate migration decisions | Repository/process audit | **READY NOW** | Manual evidence, not product E2E |
| TR-8-02 | Parallel feature ownership without serial QA bottleneck | Branch/review/process audit | **READY NOW** | AD-4 feature-owner gate evidence |
| TR-8-03 | Intelligent repository contains specs/decisions/transcripts/API docs/rules | Repository audit | **READY NOW** | Manual evidence |
| TR-8-04 | Foundation topics have named owners and written alignment before implementation | Repository/review audit | **READY NOW** | Manual evidence |
| TR-8-05 | Communication and status are captured | Repository/process audit | **READY NOW** | Manual evidence |
| TR-9-01 | Shipped behavior matches §§2–3 and all required functionality | Trace audit + release regression | **E2E DEPENDENCY** | Requires all child evidence |
| TR-9-02 | Every `—`, narrowed Project-line cell, S7 employee/PM flags, colleague whitelist/campaign exception proven | API/projection E2E | **E2E DEPENDENCY** | 171 drafts do not cover all deferred DoD slices |
| TR-9-03 | Runtime role creation/permission UI works without deploy | UI E2E | **E2E DEPENDENCY** | Role-catalog consumer |
| TR-9-04 | Org changes/full grants reject self-assignment and journal | API/UI E2E | **PRODUCT/ARCH BLOCKED** | PP Stage-1 is PR-S-01 sign-off ready; journal execution remains PR-B-07 / CC-07, full-profile remains PR-B-06 / CC-05, and Department scope remains PR-B-03 / OQ-116 |
| TR-9-05 | Shared link named/authenticated, creator rechecked, always revocable | API/UI E2E | **E2E DEPENDENCY** | Shared-link child |
| TR-9-06 | Timetracker runs against test environment and seeded population | Live integration demonstration | **E2E DEPENDENCY** | PR-B-08 provider access/contract |
| TR-9-07 | Foundation test architecture is applied and specs equal behavior | Trace/history audit | **E2E DEPENDENCY** | Approved AD-1 chain per feature |
| TR-9-08 | Product is deployed and demonstrable | Deployment smoke + evidence | **PRODUCT/ARCH BLOCKED** | PR-B-09 operational envelope |

---

## NFR Test Coverage Plan

Only thresholds explicitly sourced from v1.5/architecture are used.

| Category | Sourced requirement / threshold | Planned validation | Tool / level | Evidence artifact | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Security | No restricted fact through any surface; access checked per request | Audience/path/section negatives plus consumer projection probes | Playwright API/E2E | Trace report and test report | P0 | **E2E DEPENDENCY** |
| Security | Platform relationships apply next request | Mutate relationship, issue next independent request, assert old scope absent | API E2E | Revocation report | P0 | **AC STAGE-1 DRAFT** |
| Security | Project changes ≤15 minutes; withdraw after 4 hours failed sync | Controllable-clock integration scenarios | API/integration E2E | Timed sync evidence | P0 | **E2E DEPENDENCY** |
| Security | Due departure denies actor on every request | Request-time cutoff before worker completion | API E2E | Lifecycle report | P0 | **READY FOR FORMAL SIGN-OFF** — PR-S-02 / CC-06; AD-20 supplies the design and PR-B-09 separately blocks operational evidence |
| Performance | All Employees ≤2 seconds at 500+ records including permission resolution | Representative filters, derived/custom projection where available | k6 | JSON summary and environment record | P0 | **E2E DEPENDENCY** |
| Reliability | Integration failure never takes down core; stale banner/last-known/cutoff rules | Success→failure→cutoff→recovery sequence | E2E with port fake; live smoke | Test report | P1 | **E2E DEPENDENCY** |
| Data privacy | Delivered seeded population only | Fixture provenance and repository/log/screenshot scan | CI + manual | Scan report | P0 | **READY NOW** |
| Accessibility/responsive | Qualitative requirement for list/profile/dashboards | Keyboard, semantics, focus, zoom and viewport review | Accessibility scanner + manual | Report/screenshots using synthetic data | P2 | **E2E DEPENDENCY** |
| Maintainability/process | AD-1 scenario→human approval→red E2E→code; specs match | History and trace audit | CI + manual | Trace matrix | P1 | **READY NOW** |
| Deployment | Demonstrable environment; AD-20 same timezone/shared DB/worker health | Startup configuration and operational smoke | Deployment checks | Release record | P0 | **PRODUCT/ARCH BLOCKED — PR-B-09** |

**Unknown and not guessed:** WCAG conformance level, viewport set, concurrent-user/load model, percentile definition for the 2-second result, retry/backoff counts, uptime SLO, retention period, and non-departure observability thresholds. These need explicit decisions before final `nfr-assess`; no final PASS/CONCERNS/FAIL is assigned here.

---

## Entry Criteria

- [ ] Human review accepts this v1.5 platform plan.
- [ ] Each selected feature has an approved AD-1 Stage-1 scenario; the 171 AC drafts are approved per file before Stage 2.
- [ ] Exact product/architecture gate for the selected slice is resolved.
- [ ] Real route/schema/consumer contract is available; no placeholder API is invented.
- [ ] Migrated isolated PostgreSQL, synthetic personas, authentication fixtures, and required port fakes are ready.
- [ ] Timetracker live checks have test-environment access and confirmed contract.
- [ ] 500+ seeded performance dataset and environment recording are ready before TR-7-03.
- [ ] No real client/employee data is present.

## Exit Criteria

- [ ] P0 approved executable scope is 100% passing; P1 is ≥95% or has explicit owner/expiry waiver.
- [ ] No open critical data leak, stale-access, identity, or due-departure defect.
- [ ] Every normative row has approved evidence or a still-explicit blocker/dependency; no draft is counted as coverage.
- [ ] Access boundaries and feature workflows both have evidence; one is not substituted for the other.
- [ ] Required live timetracker demonstration passes on the seeded population.
- [ ] All Employees meets ≤2 seconds at 500+ records in the recorded target environment.
- [ ] Accessibility/responsive manual and automated evidence exists, with limitations recorded.
- [ ] Specs match shipped behavior and the product is deployed/demonstrable.

---

## P0–P3 Coverage Plan

These are planning rows, not generated test cases.

### P0

**Criteria:** Security, privacy, identity, data-integrity, access-revocation, and no-workaround lifecycle paths.

| Planning ID | Requirement cluster | Level | Risk | Status | Note |
| --- | --- | --- | --- | --- | --- |
| P0-PLAT-01 | §2–§3 audience derivation and S1–S16 negatives | API E2E | PR-001/PR-009 | **AC STAGE-1 DRAFT** | Phase 1 only; approvals pending |
| P0-PLAT-02 | Project/Department/PP-HR/full/shared overlays | API/integration E2E | PR-001/PR-002/PR-004/PR-005 | **PRODUCT/ARCH BLOCKED** | PR-B-03/06/08 and consumer contracts |
| P0-PLAT-03 | Projection leak prevention across list/filter/export/profile/errors | API/UI/download E2E | PR-001 | **E2E DEPENDENCY** | Consumer-owned |
| P0-PLAT-04 | Runtime permission removal and no data widening | API/UI E2E | PR-001/PR-007 | **E2E DEPENDENCY** | Role catalog + consumers |
| P0-PLAT-05 | Timetracker identity, atomic sync, freshness and outage cutoff | Integration E2E | PR-002/PR-005/PR-010 | **E2E DEPENDENCY** | PR-B-08 contract/live environment |
| P0-PLAT-06 | Departure cutoff and atomic effective-date effects | API/worker E2E | PR-002/PR-008 | **READY FOR FORMAL SIGN-OFF** | Stage-1 design/review proceeds; E2E/implementation waits for PR-S-02 / CC-06 sign-off and AD-1 approvals; PR-B-09 separately blocks operations |
| P0-PLAT-07 | Seed import/auth cutover; no create/deactivate legacy surface | API/import E2E | PR-009/PR-010 | **E2E DEPENDENCY** | Targeted UM child follow-up |
| P0-PLAT-08 | 500+ directory ≤2 seconds | k6 | PR-006 | **E2E DEPENDENCY** | Composed route |

### P1

**Criteria:** Core workflows, cross-context state changes, and required integration degradation.

| Planning ID | Requirement cluster | Level | Risk | Status | Note |
| --- | --- | --- | --- | --- | --- |
| P1-PLAT-01 | Directory/profile/self-service workflows | API/UI E2E | PR-001/PR-006 | **PRODUCT/ARCH BLOCKED** | PR-B-01/OQ-114 and PR-B-04/OQ-117 |
| P1-PLAT-02 | Four dashboards | API/UI E2E | PR-001/PR-007 | **PRODUCT/ARCH BLOCKED** | PR-B-02/OQ-115 |
| P1-PLAT-03 | Action items, campaigns, feedback | API/UI/cross-context E2E | PR-001/PR-007 | **READY NOW** | Interworking still needs approved scenarios |
| P1-PLAT-04 | Risks and risk dashboard | API/UI + unit | PR-001/PR-007 | **READY NOW** | Include leaver/dismissed negative |
| P1-PLAT-05 | Resourcing, sharing, request history | API/UI/cross-context E2E | PR-001/PR-005/PR-007/PR-010 | **E2E DEPENDENCY** | Shared-link and PR-B-08 timetracker consumers |
| P1-PLAT-06 | Timeline, CDS, mentorship | API/UI/cross-context E2E | PR-003/PR-007 | **E2E DEPENDENCY** | Cross-context events and journal-backed mutations |
| P1-PLAT-07 | Integration graceful degradation/recovery | API/integration E2E | PR-002/PR-005 | **E2E DEPENDENCY** | PR-B-08 port/provider contract |
| P1-PLAT-08 | AD-1 trace/spec conformance | CI/manual | PR-009 | **READY NOW** | Evidence review |

### P2

**Criteria:** Secondary and edge behavior with narrower reach or workable fallback.

| Planning ID | Requirement cluster | Level | Risk | Status | Note |
| --- | --- | --- | --- | --- | --- |
| P2-PLAT-01 | Responsive/accessibility validation | Scanner + manual | — | **E2E DEPENDENCY** | Thresholds unspecified |
| P2-PLAT-02 | Sorting stability, empty states, correction and concurrency edges | Unit/API/UI | PR-006/PR-007 | **READY NOW** | Define per feature Stage 1 |
| P2-PLAT-03 | Repository PII/seed provenance audit | CI + manual | PR-010 | **READY NOW** | No real data |
| P2-PLAT-04 | BMAD/parallelism/intelligent-repository evidence | Manual audit | PR-009 | **READY NOW** | §8 |

### P3

**Criteria:** Exploratory checks and non-binding presentation/document consistency.

| Planning ID | Requirement cluster | Level | Status | Note |
| --- | --- | --- | --- | --- |
| P3-PLAT-01 | Cross-browser/viewport exploratory review beyond agreed set | Manual | **E2E DEPENDENCY** | Select once UI/browser support is decided |
| P3-PLAT-02 | Terminology/drift audit: Reporting vs Project line, leaver vs dismissed, vacancy vs PeopleForce candidate | Manual | **READY NOW** | Prevent stale assumptions |
| P3-PLAT-03 | Notifications, analytics, PeopleForce API prefill | Deferred | **OUT OF SCOPE** | Only if scope is explicitly promoted |

---

## Execution Strategy

**Philosophy:** Run all stable functional checks in PRs when the parallelized Playwright suite remains under ~15 minutes; defer only expensive, live, or long-running evidence.

### Every PR (~10–15 minutes target)

- Approved functional API/E2E/component checks using real HTTP and PostgreSQL.
- Access-boundary regression for routes changed by the PR.
- Feature workflow checks owned by the changed consumer.
- Trace validation that no draft scenario is presented as approved.

### Nightly (~30–60 minutes)

- k6 500+ directory run when the composed route exists.
- Concurrency, controllable-clock sync/departure, and broader accessibility scans.
- Repository/log synthetic-data and PII-pattern scan.

### Weekly / Pre-Release (hours where necessary)

- Live timetracker test-environment sync, outage/recovery drill, and identity reconciliation.
- Full cross-context regression and requirements trace audit.
- Manual keyboard/responsive/accessibility review.
- Deployment/worker/timezone/health demonstration for AD-20.

No live PeopleForce run is required unless the good-to-have prefill is promoted into release scope.

---

## QA Effort Estimate

| Priority | Planning volume | QA effort interval | Main uncertainty |
| --- | ---: | --- | --- |
| P0 | ~24–34 rows | ~5–8 weeks | AC approvals, PR-S-01/02 sign-off, PR-B-07 journal, PR-B-08 timetracker, PR-B-09 operations |
| P1 | ~35–55 rows | ~5–8 weeks | Consumer context readiness and cross-context fixtures |
| P2 | ~15–25 rows | ~1.5–3 weeks | UI and accessibility scope |
| P3 | ~5–10 rows | ~0.5–1 week | Exploratory scope |
| **Total** | **~79–124 rows** | **~12–20 weeks** | One QA engineer; feature owners parallelize Stage 1–3 under AD-4 |

Estimates include design, implementation, debugging, fixtures, and CI integration. PP and departure Stage-1 design can proceed now; E2E/implementation effort remains conditional on PR-S-01/02 formal sign-off and normal AD-1 approvals. CC-07 may separately delay journal-dependent execution, and PR-B-09 still gates operational evidence. Estimates exclude development/architecture effort and do not make PG-01 schedulable.

---

## Interworking & Regression

| Component seam | Risk | Regression evidence |
| --- | --- | --- |
| AccessControl facade → every consumer | Bypassed or inconsistent authorization | Boundary E2E plus consumer projection/workflow E2E |
| User Management → Access Control | Org change not reflected next request | Relationship mutation followed by independent audience request |
| Timetracker → policies/profile/dashboards | Wrong identity or stale Project access | Atomic sync, S10/S11 projection, 15-minute/4-hour checks |
| Directory → profile/custom fields/export/campaigns | Hidden value inference or audience drift | Same filter/view exercised as colleague and entitled manager |
| Resourcing → shared links → S15 → timetracker | Candidate data leak or false assignment | Request lifecycle, request-bound link expiry, later sync only |
| Campaigns → action items → feedback | Duplicate tasks or widened sender view | Frozen audience, one task each, campaign-local visibility |
| Mentorship/lifecycle → timeline | Missing/incorrect events or closure notes | Pair start/end and departure auto-close transaction checks |
| Departure → auth/AC/tasks/mentorship | Partial offboarding | Request cutoff plus atomic worker effects/retry |
| CDS → Department/directory | Wrong matrix link or filter result | Entity+position lookup and directory filter integration |

**Manual validation:** accessibility/responsive behavior, deployed demonstration, repository/process evidence, and live timetracker operational drill.

**Automation candidates:** stable API authorization matrices after approval, feature state machines, projection negatives, contract-faithful failure paths, XLSX entitlement checks, k6 threshold, PII-pattern scan, and trace validation. Automation does not replace exploratory privacy review or live integration validation.

---

## Release and Design Gates

1. **DG-01 — AD-1:** no Stage-2 E2E before independent human approval of its actual Stage-1 file; no production code before independently approved red E2E.
2. **DG-02 — Blockers:** do not design through PR-B-01/OQ-114, PR-B-02/OQ-115, PR-B-03/OQ-116, PR-B-04/OQ-117, PR-B-05/OQ-105, PR-B-06/CC-05, PR-B-07/CC-07, PR-B-08, or PR-B-09.
3. **DG-03 — Sign-off ready:** PR-S-01/CC-04 and PR-S-02/CC-06 permit Stage-1 design/review now against requirements + AD-19/20. E2E/implementation waits for explicit PO/Architect sign-off and normal AD-1 approvals; CC-07 and PR-B-09 keep their separate scopes.
4. **DG-04 — Integration:** PR-B-08 requires the timetracker contract to be inspected; event/state semantics and identity mapping must be recorded before adapter Stage 1.
5. **DG-05 — Child ownership:** approved UM files remain unchanged; seed-import/registration/departure drift gets a targeted child follow-up.
6. **PG-01 — Access control:** **not schedulable** while the 171 Phase-1 files await per-file approval and deferred DoD slices have no approved Stage-1 artifacts.
7. **PG-02 — Required integration:** after PR-B-08, live timetracker leaves/projects/people evidence over the seeded test population.
8. **PG-03 — Security/lifecycle:** PR-S-01/02 sign-off and AD-1 approvals precede PP/departure E2E; zero unresolved leak, stale-access, self-assignment, or due-departure cutoff defect; CC-07 and PR-B-09 evidence apply separately.
9. **PG-04 — Performance:** All Employees ≤2 seconds at 500+ records including permission resolution.
10. **PG-05 — Product completeness:** every required v1.5 trace row has accepted evidence; OUT OF SCOPE is used only for GOOD TO HAVE/§10.
11. **PG-06 — Deployment/process:** after PR-B-09, deployed demonstrable product, AD-1 history, parallel ownership, and current intelligent-repository specs.

---

## Appendix A: Playwright-Utils Pattern

No code is included. This Create run is a planning artifact, and the user explicitly forbids test generation. Stage-2 authors must use `apiRequest` from the project’s merged fixtures (or `@seontechnologies/playwright-utils/api-request/fixtures`) and `expect` from `@playwright/test`; raw `request.<method>` is not permitted when `tea_use_playwright_utils=true`.

## Appendix B: Knowledge Base References

- `.agents/skills/bmad-testarch-test-design/resources/knowledge/risk-governance.md`
- `.agents/skills/bmad-testarch-test-design/resources/knowledge/probability-impact.md`
- `.agents/skills/bmad-testarch-test-design/resources/knowledge/test-levels-framework.md`
- `.agents/skills/bmad-testarch-test-design/resources/knowledge/test-priorities-matrix.md`
- `.agents/skills/bmad-testarch-test-design/resources/knowledge/nfr-criteria.md`
- `.agents/skills/bmad-testarch-test-design/resources/knowledge/playwright-utils-mandate.md`

---

**Generated by:** BMad TEA Agent  
**Workflow:** `bmad-testarch-test-design` — system-level Create mode  
**Version:** 4.0 (BMad v6)
