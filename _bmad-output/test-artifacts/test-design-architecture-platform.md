# Test Design for Architecture: People Management Platform

**Purpose:** System-level architectural testability contract for Architecture, Backend, DevOps, and Security. It identifies what must exist before reliable platform evidence can be produced; it does not replace child test designs or prescribe QA execution.

**Date:** 2026-08-29  
**Author:** TEA (bmad-testarch-test-design, Create mode)  
**Status:** Draft — refreshed v1.5 Create run; human review pending  
**Project:** People Management Platform — Iteration 2  
**PRD Reference:** `docs/project-requirements.md` v1.5 (normative), current People Management PRD plus addendum  
**ADR Reference:** `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` (AD-1–AD-21)

---

## Executive Summary

**Scope:** Cross-cutting architecture for access control, User Management interworking, profile/list projection, dashboards, resourcing, integrations, employment lifecycle, NFRs, and the v1.5 Definition of Done.

**Business context:** The platform serves 500+ employees. Access-control correctness is the primary quality attribute; a closed section leaking through an API, list, filter, export, error, shared link, or optional notification is critical. Timetracker leaves and project/people sync are required against its test environment. PeopleForce is good-to-have profile prefill by candidate ID; resourcing requests are platform-owned and vacancies are not synchronized.

**Architecture:** Hexagonal bounded contexts; AccessControl facade is the sole authorization entry; audiences are resolved live and in bulk; Reporting, Project, PP, Self, and Colleague remain distinct; platform-owned revocation is next-request, project-derived revocation is within 15 minutes. Requirements plus AD-19 and AD-20 effectively specify the PP and scheduled-departure solutions; both are ready for formal Product Owner/Architect sign-off rather than further design discovery.

**Ownership boundary:**

| Child / input | Current authority |
| --- | --- |
| User Management architecture + QA test designs | **Approved 2026-08-25; authoritative child baseline. Do not redo here.** Its own scope, risks, and approved scenarios remain child-owned. |
| Access Control Phase-1 suite | **171 v1.5 Stage-1 scenario drafts**, aligned 2026-08-29; each still requires independent human AD-1 approval. This is design inventory, **not approved coverage** and not permission to write Stage-2 E2E. |
| Deferred AC slices | Shared links, projection surfaces, role catalog, full-profile overlay, Project-line positives, Department positives, and integration-driven access remain outside the 171-file Phase-1 slice. |

**Risk summary:** 10 platform risks, all high (P×I ≥6): 5 critical score 9 and 5 score 6. Platform `PR-*` does not renumber child UM `R-*`.

---

## Quick Guide

### Ready Now

1. Apply AD-1 per feature: independently approve a scenario, then independently approve its red E2E, then implement. No agent or author may self-certify a stage.
2. Continue the approved User Management child according to its own artifacts; this platform refresh does not change its ownership.
3. Review and approve the 171 Access Control Phase-1 files one by one. Their implemented scope is limited to Self, Reporting line, direct PP, Colleague, withhold negatives, functional boundaries, fail-closed behavior, and authentication.
4. Build against established seams: real HTTP + PostgreSQL for E2E, outbound ports behind DI, AccessControl facade only, live bulk audience resolution, and synthetic seeded identities.

### 🚨 Explicit Product / Architecture Blockers

| ID | Decision required | Blocks | Owner | Required by / status |
| --- | --- | --- | --- | --- |
| **PR-B-01 / OQ-114** | EAV vs JSONB custom-field storage and indexed visibility-safe filter/sort plan; column-per-field is excluded | Runtime S16, full directory, saved views, exports | Architect | Before directory wave — **Open** |
| **PR-B-02 / OQ-115** | One dashboard engine's widget authorization, aggregation, and counter projection contract | UM/DM/PM/PP dashboard wave | Architect | Before dashboard wave — **Open** |
| **PR-B-03 / OQ-116** | Non-manager project-assignment semantics and resulting policy target roles | Final Department/project policy model and positive Project-line scope | Product + Security + Architect | Before affected AC/integration design — **Open** |
| **PR-B-04 / OQ-117** | Profile bounded-context boundary and ownership of S1–S16 projections | Profile/list child design and cross-context contracts | Architect | Before profile wave — **Open** |
| **PR-B-05 / OQ-105** | Who may grant/revoke the HR Admin functional role; confirm remaining default role-permission assignments | Admin delegation and bootstrap lifecycle | Product Owner + Security | Before role-admin implementation — **Open** |
| **PR-B-06 / CC-05** | Self versus full-profile overlay precedence and effective section mapping | Full-profile projection and its AC scenarios | Product Owner + Architect | Before full-profile Stage 1 — **Open** |
| **PR-B-07 / CC-07** | Immutable relationship/access journal schema, snapshots, reader authorization, and transaction enrollment | Journal-backed PP/full-access/organisational mutations | Architect + Security + Backend | Before affected Stage 2/implementation — **Open** |
| **PR-B-08** | Timetracker API/auth/identity/error contract; events vs state-at-sync; partial/intermittent success semantics | Project-line positives, S10/S11, sync/revocation evidence | Integration + Architect + Security | Before adapter Stage 1 — **Open** |
| **PR-B-09** | Hosting, environment topology, secrets, backup/restore, monitoring, alert ownership, and rollback envelope | Deployed/demonstrable DoD and production NFR evidence | DevOps + Architect + Security | Before first release — **Open** |

### Ready for Formal Sign-off

| ID | Sign-off package | Design status | What may proceed now | What still waits |
| --- | --- | --- | --- | --- |
| **PR-S-01 / CC-04** | Requirements + AD-19: one PP per employee; atomic optimistic create/replace/delete; next-request revocation; concurrency handling; journal direction | **READY FOR FORMAL PO/ARCHITECT SIGN-OFF** — solution specified | Access Control-owned direct-PP audience review and User Management-owned PP-mutation Stage-1 design/review | E2E/implementation require explicit sign-off, normal AD-1 approvals, and CC-07 where journal detail is required |
| **PR-S-02 / CC-06** | Requirements + AD-20: effective date/reason; relationship blockers and outcomes; durable, retrying, fail-closed executor | **READY FOR FORMAL PO/ARCHITECT SIGN-OFF** — solution specified | Employment-lifecycle Stage-1 design and review | E2E/implementation require explicit sign-off and normal AD-1 approvals; release operations also require PR-B-09 |

**Boundary:** CC-04 and CC-06 are not discovery/design gaps. AD-19 and AD-20 are the binding architecture directions for formal sign-off. CC-07 remains a separate open architecture dependency for immutable journal schema, readers, and transaction enrollment; PR-B-09 remains the separate operational envelope.

### AC Stage-1 / E2E Dependencies

- The 171 Phase-1 files may be reviewed now, but remain draft until each receives explicit human approval.
- Direct-PP Stage-1 files are reviewable within that draft scope; E2E/implementation waits for PR-S-01 sign-off, per-file AD-1 approvals, and PR-B-07/CC-07 where journal detail applies.
- Stage-2 E2E for any file starts only after that file's approval and must stop again for independent red-test approval before production code.
- Project-line positive cells require PR-B-08; Department positives and transitive PP HR-line require an approved Department/HR-boundary contract plus OQ-116 resolution.
- Shared-link, list/filter/export/search leakage, full-profile, and runtime role-catalog slices require separate Stage-1 artifacts; the 171 files do not cover them.
- Feature workflows remain owned by their feature children; an AC matrix response is not evidence that dashboards, resourcing, lifecycle, or profile workflows work.

### 📋 Established Architecture Constraints

- HR Admin is configuration-only and grants no employee-data audience. Full-profile access is separate.
- Both dimensions must permit mutation: functional capability plus target-scoped section write; dedicated relationship operations remain separate.
- PeopleForce stores/uses candidate ID and may optionally prefill candidate facts after preview and per-field confirmation. It is not a vacancy source of truth.
- Resourcing owns vacancies, headcount, Unassigned requests, candidate review, compensation visibility, and request-bound profile links.
- Notifications and analytics are good-to-have; if selected, their privacy/source-of-truth rules become binding before design.

---

## Platform Risk Assessment

**Scoring:** Probability 1 unlikely, 2 possible, 3 likely; Impact 1 minor, 2 degraded, 3 critical. Score = P×I. Evidence is v1.5 requirements, current PRD/addendum, architecture spine, and the present artifact status.

| Risk ID | Cat | Evidence-backed risk and consequence | P | I | Score | Architecture mitigation | Owner | Timeline | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **PR-001** | SEC | Distinct audiences, narrowed fields, flags, exports and filters create many leak paths; a leak exposes restricted employee data | 3 | 3 | **9** | Central facade plus projection contracts that only narrow; server-side omission on every surface | Security + AC + feature backend leads | Before each surface ships | Open; Phase-1 draft only | Approved Stage-1/2 evidence for matrix and each projection surface; security review |
| **PR-002** | SEC | Stale graph state can retain access after org change, sync delay, outage, or due departure | 3 | 3 | **9** | No persisted audiences; atomic graph writes; AD-20 request cutoff; 15m/4h sync controls | AC + Integration + Backend | Before access-bearing release | In progress by design; evidence absent | Clock-controlled revocation evidence, outage telemetry, transaction review |
| **PR-003** | DATA | Implementing the specified PP contract before formal sign-off, or without CC-07 journal detail, can create governance or audit inconsistency | 3 | 3 | **9** | Sign off PR-S-01; approve CC-07; enroll the PP fact and immutable journal write in one transaction with stable snapshots | Product + Architect + Security + Backend | Before PP E2E/implementation | **Sign-off ready; PR-B-07 open** | Sign-off trace, schema/authorization review, and rollback/concurrency evidence |
| **PR-004** | SEC | Unresolved full-profile precedence can expose Self-denied sections or create inconsistent grants | 3 | 3 | **9** | Product-approved overlay mapping and Self precedence; preserve separate grant lifecycle and last-holder guard | Product + Architect + Security | Before full-profile Stage 1 | **Blocked PR-B-06** | Decision trace and approved positive/negative projection evidence |
| **PR-005** | TECH | Unknown timetracker contract can create stale or mixed project policies; project assignment directly changes data access | 3 | 3 | **9** | Publish provider contract; sync sole-writer transactional replacement; define partial-success behavior and provenance | Integration + Architect + Security | Before adapter Stage 1 | **Blocked PR-B-08** | Contract review, deterministic adapter evidence, real test-environment demonstration |
| **PR-006** | PERF | Arbitrary visible fields plus live bulk graph resolution may breach ≤2s at 500+ rows | 2 | 3 | **6** | Approve indexed custom-field/query plan; one bulk resolution plan; representative seeded dataset and query observability | Architect + Profile Backend + DBA/DevOps | Before directory release | **Blocked PR-B-01** | Versioned report for 500+ rows showing ≤2s including permission resolution |
| **PR-007** | DATA | Dashboard/resourcing/campaign aggregates can diverge from projection rules and lifecycle facts, producing wrong decisions or leaks | 2 | 3 | **6** | Typed read models consume AccessControl and canonical facts; request/task transitions and counters update transactionally/idempotently | Dashboard + Resourcing + Campaign Backend leads | Before affected waves ship | **Blocked PR-B-02/04** | Contract review and cross-context invariant evidence |
| **PR-008** | OPS | Implementing the specified departure contract before formal sign-off, or operating it without the AD-20 deployment controls, can produce governance drift or delayed cutoff | 2 | 3 | **6** | Sign off PR-S-02; then use one validated business timezone/database plus worker lag/retry/lease/cutoff telemetry, alert owner, and retry surface | Product + Architect + DevOps + Backend + Security | Before lifecycle E2E/implementation and first release | **Sign-off ready; PR-B-09 open** | Sign-off trace plus deployment rehearsal, health/alert evidence, delayed-worker and rollback demonstration |
| **PR-009** | OPS | Treating 171 draft AC files as coverage bypasses human gates and creates false release confidence | 2 | 3 | **6** | Machine-readable approval/trace state per file; CI must distinguish draft, approved scenario, approved red E2E, and green code | Engineering leads + Repository maintainers | Before AC implementation | Open | Independent approval records and trace audit; no draft counted as coverage |
| **PR-010** | DATA | Seed/platform/timetracker/candidate identity mismatch or real PII use can attach access to the wrong person or expose client data | 2 | 3 | **6** | `ttId` and candidate ID are durable external keys; email is not sole key; synthetic seed-only controls and log redaction | Integration + Backend + Security/DevOps | Before imports/integrations | Partial design support | Reconciliation report, collision/fail-closed evidence, repository/log data scan |

**Residual-risk rule:** A mitigation is not complete because a design exists. Status changes only when the listed verification evidence is reviewed; accepted residual risk requires a named approver and expiry outside this planning document.

---

## NFR Testability Requirements

| Category | Source threshold / requirement | Current support | Architecture gap | Planned evidence |
| --- | --- | --- | --- | --- |
| Security | No unauthorized section fact through any surface; access correctness primary | AD-9/10/12 and v1.5 matrix | Deferred projections and unapproved AC drafts | Approved authorization evidence plus security review |
| Revocation | Owned relations: next request; project changes: ≤15m; failed sync: withdraw project access after 4h; due departure: request-time cutoff | AD-10/19/20 | Partial-sync contract and operational telemetry | Timestamped sync/cutoff traces and delayed-worker evidence |
| Performance | All Employees ≤2s with 500+ rows, arbitrary filters, permission resolution | Bulk-resolution direction | OQ-114 plan and representative environment | Versioned load/query report |
| Reliability | External integration failure must not take down core; last-known timetracker data is visibly stale | Ports/adapters and fixed stale rules | Timeout/retry/circuit thresholds **UNKNOWN**; partial-success behavior open | Deterministic failure evidence and operational metrics |
| Accessibility / responsive | List, profile, dashboard must be accessible and responsive | Requirement only | Standard, viewport set, and measurable thresholds **UNKNOWN** | Accessibility assessment and responsive evidence after criteria approval |
| Privacy | Delivered seeded population only; no real employee data in code, agents, logs, screenshots, or repository | Seed strategy and persona fixtures | Enforcement across environments/logs incomplete | Data-source attestation and automated/manual scans |
| Availability / recovery | Core degrades gracefully; AD-20 must converge without restoring access | Durable worker design | Availability %, RTO, RPO, backup frequency, restore and rollback thresholds **UNKNOWN** | Approved SLO/DR decision, restore and deployment rehearsal |
| Maintainability / process | AD-1 approved scenario → approved red E2E → production code; specs match shipped behavior | Strong documented rule | Per-file approval state and cross-child traceability | Repository trace/approval audit |
| Deployability | Module deployed and demonstrable; AD-20 migration before worker, same timezone and DB | AD-20 constraints | Hosting/topology/rollback envelope open | Environment inventory and deployment demonstration |

**Assessment boundary:** These are requirements for later evidence. Final PASS/CONCERNS/FAIL belongs to `nfr-assess`, not this document.

---

## Testability Concerns and Architectural Gaps

### 🚨 Blockers to Fast Feedback

| Concern | Impact | Architecture must provide | Owner | Timeline |
| --- | --- | --- | --- | --- |
| Projection ownership unresolved | No stable seam for S1–S16, directory, exports, or workflow-specific narrowing | Resolve OQ-117; version field/record projection contracts around AccessControl | Architect | Before profile/list wave |
| Dynamic query model unresolved | Hidden-value inference and performance cannot be proven reliably | Resolve OQ-114 with indexed authorization-aware query design | Architect + DBA | Foundation close / before directory |
| Provider contract absent | Fakes may encode the wrong security behavior; live sync cannot be explained historically | Resolve PR-B-08 against actual timetracker documentation | Integration + Security | Before integration Stage 1 |
| Journal contract detail absent | Journal-backed PP and grant changes cannot yet prove immutable snapshots, reader scope, or transaction enrollment | Approve CC-07 without reopening AD-19's specified PP behavior | Architect + Security + Backend | Before affected E2E/implementation |
| Operational environment undefined | Lifecycle cutoff, worker recovery, alerts, and DoD deployment remain unprovable | Resolve PR-B-09 without weakening AD-20 | DevOps + Architect | Before first release |
| Approval state not machine-visible | Draft scenarios may be mistaken for tested behavior | Per-file AD-1 metadata/trace contract | Engineering leads | Before AC Stage 2 |

### Architectural Improvements Needed

1. **Projection adapters per surface:** centralize field/record narrowing for profile, list/filter/export/search, shared links, dashboards, and optional notifications; direct policy reads remain forbidden.
2. **Controllable state and time:** provide synthetic idempotent seed/reset contracts, transaction-safe fixtures, and injected clock/timezone seams for 15-minute, four-hour, expiry, and departure boundaries.
3. **Observable security decisions:** emit correlation IDs and sanitized decision/sync/worker metrics without recording restricted values; exact retention and broader profile-read audit remain **UNKNOWN**.
4. **Cross-context consistency:** route resourcing, campaigns, mentorship, timeline, and lifecycle mutations through owning application layers with idempotency and explicit transaction boundaries.

### Testability Assessment Summary

**What works well**

- Hexagonal ports and AD-3 isolate external failure while preserving real HTTP/database behavior.
- AD-9/10 provide one live, bulk authorization seam suitable for profile, list, and dashboard consumers.
- Requirements plus AD-19/20 specify PP concurrency and fail-closed departure execution sufficiently for Stage-1 design; formal PR-S-01/02 sign-off remains before E2E/implementation.
- The approved User Management child preserves bounded ownership and can progress independently within its contract.

**Accepted scope boundaries**

- The 171 AC Phase-1 drafts deliberately exclude major slices; this is staged design, not a waiver.
- PeopleForce API prefill, notifications, and analytics are optional; candidate ID storage remains required for external candidates.
- No employee provisioning, AD/SSO, compensation profile data, leave balances, LMS, or project allocation percentages are added.

---

## Risk Mitigation Plans

| Risks | Required engineering actions | Owner / timeline | Status / verification |
| --- | --- | --- | --- |
| PR-001, PR-004 | Approve projection/overlay contracts; enforce facade and server-side omission; add a security review checkpoint per new surface | Security + Architect + feature backend; before surface Stage 2 | Open / reviewed contracts and authorized evidence |
| PR-002, PR-005 | Keep decisions live; make sync replacement atomic; enforce AD-20 cutoff before authorization; expose stale/lag/cutoff telemetry | AC + Integration + Backend; before access-bearing release | PR-005 blocked / deterministic and live-environment evidence |
| PR-003, PR-007 | Formally sign off PR-S-01, approve CC-07, then make journal and org mutation atomic and use canonical facts/idempotent cross-context commands | Product + Architect + Backend/Security leads; before dependent E2E/implementation | Sign-off ready; CC-07 open / approval trace, concurrency, rollback, and invariant evidence |
| PR-006 | Approve OQ-114; index graph/custom-field paths; instrument query plans and the composed directory endpoint | Architect + DBA/DevOps; before directory release | Blocked / 500+ row ≤2s report |
| PR-008 | Formally sign off PR-S-02; separately resolve the operational envelope, then deploy worker and app against one configured timezone/database with demonstrated alert/remediation ownership | Product + Architect, then DevOps + Backend + Security; before lifecycle E2E/implementation / first release | Sign-off ready; blocked by PR-B-09 for operations / sign-off trace plus deployment and failure rehearsal |
| PR-009 | Record independent approval at each AD-1 stage and prevent CI/reporting from counting drafts as coverage | Engineering leads; before AC implementation | Open / trace audit |
| PR-010 | Enforce durable external IDs, fail closed on ambiguous matches, prohibit real PII, and redact operational output | Integration + Security; before import/integration | Partial / reconciliation and data scans |

---

## Assumptions and Dependencies

### Architectural Assumptions

1. `docs/project-requirements.md` v1.5 overrides stale v1.2 planning claims; the current People Management PRD/addendum and spine refine it without weakening normative rules.
2. Stack remains TypeScript/Node LTS, NestJS 11.x, Prisma 7.x, and PostgreSQL.
3. Full-profile access, HR Admin, functional roles, and relationship-derived audiences remain four distinct concepts.
4. No unspecified latency, availability, recovery, accessibility, retention, retry, or rate-limit target is inferred.

### Dependencies

1. OQ-114/115/116/117 and OQ-105 decisions before their named waves.
2. CC-05 remains open before full-profile scenarios; PR-S-01 and PR-S-02 require formal sign-off before PP/departure E2E or implementation, while their Stage-1 design/review may proceed now; CC-07 / PR-B-07 remains open before journal-dependent E2E/implementation.
3. Actual timetracker contract before project-positive and sync scenarios; PeopleForce contract only if optional prefill is selected.
4. Approved operational envelope before deployed/demonstrable DoD evidence.
5. Per-file AD-1 approval before any of the 171 AC drafts can become Stage-2 work or counted coverage.

### Risks to This Plan

- **Architecture decisions land after feature work starts:** contracts and evidence will churn. Contingency: progress only ready slices and keep blocked contexts fail-closed.
- **Child/platform drift:** platform summaries could overwrite child decisions. Contingency: child artifacts remain authoritative within their scope; reconcile by references, not copied scenario detail.
- **Optional scope becomes implicit commitment:** capacity and security review are diluted. Contingency: require explicit scope approval before PeopleForce prefill, notifications, or analytics enter design.

---

**Architecture action:** Resolve PR-B-01–09, obtain PR-S-01/02 formal sign-off, and assign owners/dates to PR-001–010.  
**QA boundary:** Platform execution detail and coverage are in the refreshed companion `_bmad-output/test-artifacts/test-design-qa-platform.md`; approved child artifacts remain authoritative within their scope.

**Child references:** `_bmad-output/test-artifacts/test-design-architecture.md` · `_bmad-output/test-artifacts/test-design-qa.md` · `docs/test-cases/access-control/README.md`
