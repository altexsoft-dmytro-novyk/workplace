# Test Design for Architecture: User Management

**Purpose:** Architectural concerns, testability gaps, and NFR requirements for review by Architecture/Dev teams. Contract between QA and Engineering on what must be addressed before test development begins.

**Date:** 2026-08-25  
**Author:** User (TEA workflow)  
**Status:** Approved — 2026-08-25 (human approval; normative propagation complete)  
**Project:** people management — `user-management` bounded context  
**PRD Reference:** `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md`  
**ADR Reference:** `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` (AD-1..AD-14)

---

## Executive Summary

**Scope:** System-level test design for the `user-management` bounded context — User lifecycle, magic-link auth, career timeline (`UserEvents`), and organizational relationships (`Relationship`). Access-matrix enforcement remains in `access-control`.

**Business Context (from project-requirements.md):**
- Primary quality attribute: **access-control correctness** (§7, §9).
- Platform target: 500+ employees; list endpoints ≤2 s including permission resolution (NFR-2).
- Iteration 2 requires timetracker projects/people/PM/DM integration eventually; user-management defers that sync. Reports-to remains a separate manual relationship (AD-10/AD-13).

**Architecture (AD-1, AD-3, AD-11, AD-14):**
- Three-stage gate: scenario → red E2E → production code.
- E2E = real HTTP + PostgreSQL; outbound ports faked via DI tokens.
- Org facts in `Relationship`; timeline events synchronous in same transaction as mutation.
- Router shapes fixed: `/users`, `/auth`, `/users/:id/events`, `/users/:id/relationships`.

**Risk Summary:**
- **Total risks:** 14 (5 high ≥6, 5 medium, 4 low)
- **Test effort:** ~45–75 gate E2E scenarios + NFR suites (~3–5 weeks QA, 1 engineer)

**Decision basis:** Dmytro's workspace/backend branches are used as delivery-intent evidence, not as normative requirements or proof of implementation. The user approved the reconciled planning decisions on 2026-08-25; `critical-review-existing-artifacts.md` records the evidence and the remaining normative-propagation work.

---

## Quick Guide

### 🚨 SCOPED GATES — Team Must Honor (No Global Decision Blockers)

This intentionally preserves the checklist's actionable first tier while distinguishing conditional engineering gates from unresolved product decisions; R-001 remains a release blocker until mitigated or waived.

1. **B-03 resolved as a CI progression rule (OQ5):** run E2E with one worker, collision-proof UUID namespaces, and owned-slice cleanup initially. Before enabling parallel workers, provision one PostgreSQL schema per worker. Dmytro's `Date.now()` prefix alone is not sufficient.
2. **B-04 resolved as a reliability rule (OQ3):** registration commits the `User`, `joined_company` event, and durable dispatch intent, then returns `201`. A downstream email transport failure is observable and retryable and does not roll back the employee.

Schema-per-worker is a gate only for **parallel-worker CI**. The email-failure test requires a throwing fake plus observable pending/failed delivery state. Neither item blocks implementation of the core lifecycle.

### ✅ APPROVED PLANNING DECISIONS — Normative Propagation Pending

1. **B-01 / C-01: Timeline audience** — full Manager line + PP read S9; only assigned PP + direct UM manually add/correct/delete. DM/PM and transitive managers are read-only.
2. **B-02 / A-02: Deactivation gate** — a no-target AccessControl feature capability held by HR Admin; no role-name check in user-management code. Ida is the primary generic denial persona.
3. **B-05 / A-03: `customFields`** — database default `{}`; registration payload omits it.
4. **R-003 / A-01: Magic-link security** — enumeration-safe response, zero dispatch for unknown email, expiring single-use token. TTL is configuration-owned and boundary-tested with a controllable clock; no production duration is invented here.
5. **R-004 / A-06: Reports-to reassignment** — explicit `DELETE` then `POST`; a second `POST` while a direct edge exists returns `409`.
6. **OQ1: Server-owned create fields** — client-supplied `id`, `createdAt`, or `createdBy` returns `400`; do not silently strip.
7. **OQ2: Email identity** — trim outer whitespace and lowercase before validation, storage, lookup, and uniqueness comparison.
8. **OQ3: Dispatch durability** — store retryable dispatch intent with the registration transaction; email transport failure does not undo the User.
9. **OQ4: Rehire** — reactivate the existing User and preserve identity/history; never create a second User for the normalized email. Dedicated rehire endpoint shape is outside this design.
10. **OQ5: Test isolation** — one worker + UUID-owned data initially; schema-per-worker before parallel workers.

---

### ⚠️ HIGH PRIORITY — Team Should Validate

1. **R-001 (SEC, 9):** AccessControl bypass in user-management controllers — validate every mutating endpoint calls facade (NFR-4). (Backend lead)
2. **R-002 (DATA, 6):** User create + `joined_company` event not atomic — partial failure corrupts timeline. (Backend — AD-11 transaction pattern)
3. **R-003 (SEC, 6):** Approved auth behavior is absent from baseline requirements. Propagate enumeration-safe responses plus configurable-TTL, single-use tokens into the security decision log. (Product + Security)
4. **R-004 (DATA, 6):** Approved reject-then-retry reports-to behavior is not yet normative. Propagate it before Epic 4 implementation approval. (Product + Architect)
5. **R-005 (PERF, 6):** NFR-2 list SLA — confirm k6 target environment and 500-row seed ownership. (Platform)

---

### 📋 INFO ONLY — Solutions Provided

1. **Test strategy:** AD-1 gate E2E for workflow; domain unit tests below gate for immutability/uniqueness mappers; access-control owns §3.2 matrix.
2. **Tooling evidence:** See `test-design-qa.md` for QA tooling guidance; Architecture requires a versioned load report for NFR-2 and a fake outbound port for delivery assertions.
3. **CI:** Gate E2E initially run with one test worker; race scenarios create parallel HTTP requests inside one isolated test. Enable parallel test workers only after schema-per-worker support. k6 runs nightly; no live third-party calls (AD-3).
4. **Coverage:** ~45–75 scenarios P0–P3 — see `test-design-qa.md`.
5. **Critical review of existing 28 files:** `critical-review-existing-artifacts.md`.

---

## Risk Assessment

**Total risks:** 14 (5 high ≥6, 5 medium, 4 low)

**Risk categories:** `TECH` architecture/integration · `SEC` security/auth/access · `PERF` performance/scalability · `DATA` integrity/consistency · `BUS` business/workflow · `OPS` CI/deployment/operability.

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **R-001** | SEC | Controller bypasses AccessControl facade (NFR-4) | 3 | 3 | **9** | Lint/arch review; contract test per controller | Backend | Pre-Epic 1 |
| **R-002** | DATA | User mutation without paired `UserEvents` write | 2 | 3 | **6** | AD-11 explicit call in same transaction | Backend | Epic 3 |
| **R-003** | SEC | Approved auth security behavior not yet in normative requirements | 2 | 3 | **6** | Propagate enumeration-safe + configurable expiry + single-use | Product | Pre-Epic 2 implementation approval |
| **R-004** | DATA | Approved reject-then-retry behavior not yet normative | 2 | 3 | **6** | Propagate explicit DELETE→POST and second-POST `409` | Architect | Pre-Epic 4 implementation approval |
| **R-005** | PERF | NFR-2 untestable without load harness | 2 | 3 | **6** | k6 script + 500-row seed fixture | Platform | Story 1.5 |

### Medium-Priority Risks (Score 3–5)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-006 | TECH | Prisma unique violation → `500` not `409` | 2 | 2 | 4 | Global exception filter | Backend |
| R-007 | DATA | Normalization rule may drift between API and DB | 2 | 2 | 4 | Shared trim/lowercase normalization + normalized DB uniqueness | Backend |
| R-008 | OPS | Parallel E2E state collision | 2 | 2 | 4 | Keep one worker until schema-per-worker; UUID-owned slices in both modes | Platform |
| R-009 | BUS | Deactivated user can still request magic link | 2 | 2 | 4 | Explicit deny rule | Product |
| R-010 | TECH | AD-11 CHECK/UNIQUE raw SQL migration drift | 1 | 3 | 3 | Single documented migration pattern | Backend |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | Score | Action |
| --- | --- | --- | --- | --- |
| R-011 | BUS | Rehire could accidentally create a second identity | 2 | Reactivate the existing User; preserve normalized-email uniqueness and history |
| R-012 | OPS | PII in test fixtures/logs (NFR-1) | 2 | CI grep + review |
| R-013 | TECH | Epic 2 blocked on Epic 1 HTTP for User row | 1 | AD-3 Prisma seed in Epic 2 module |
| R-014 | BUS | Manual `mentorship_end` backfill can be mistaken for the automatic Epic 4 path | 1 | State explicitly that manual backfill accepts documented types independently of trigger readiness |

---

## NFR Testability Requirements

| NFR Category | Threshold / Requirement | Design Support | Gap / Decision | Planned Evidence |
| --- | --- | --- | --- | --- |
| Security | AccessControl on every endpoint (NFR-4); approved auth behaviors (R-003) | Partial — facade exists | Propagate capability/auth rules; TTL configuration seam | E2E + static review |
| Performance | `GET /users` ≤2 s @ 500+ rows (NFR-2) | Unknown | R-005; seed data | k6 report |
| Reliability | Integration failure must not crash app (NFR-3) | Ports + fakes (AD-3) | Durable dispatch state + retry observability | E2E with throwing fake |
| Maintainability | AD-1 traceability scenario → test → code | Supported | Existing suite gaps Epic 4/1.5 | Trace matrix post-approval |
| Data privacy | Pseudonymised non-prod data (NFR-1) | Persona convention | Automated PII scan | CI check |

**Configuration-owned thresholds:** Production magic-link TTL, rate limits, retry count, and retry backoff. Tests inject deterministic values and verify boundaries/transition behavior; these settings do not block scenario approval.

**Assessment boundary:** Final PASS/CONCERNS/FAIL via `nfr-assess` after implementation evidence.

---

## Testability Concerns and Architectural Gaps

### 🚨 ACTIONABLE CONCERNS

#### Gates to Fast Feedback

| Concern | Impact | Architecture Must Provide | Owner | Timeline |
| --- | --- | --- | --- | --- |
| Parallel-worker isolation not yet implemented | Flaky tests if worker count is raised prematurely | Keep one worker now; add schema-per-worker before raising worker count | Platform | Parallel-CI enablement |
| Email delivery observability | Cannot prove FR-3 dispatch or graceful failure | DI fake with dispatch log + queryable durable pending/failed delivery state | Backend | Epic 1 Story 1.1 |
| No list endpoint (Story 1.5) | `um-deact-02` blocked | Implement `GET /users` with filters | Backend | Epic 1 |
| Approved timeline rule not yet normative | Rule may drift between artifacts | Propagate PP + direct UM write; full Manager-line read | Product + Architect | Pre-Epic 3 implementation approval |

#### Architectural Improvements Needed

1. **Exception mapping for uniqueness (R-006)**
   - Problem: Unmapped Prisma `P2002` → `500`
   - Change: Global filter → `409` with stable error body
   - Impact: `um-reg-08` passes for wrong reason
   - Owner: Backend | Timeline: Epic 1

2. **Transaction boundary helper (R-002)**
   - Problem: Manual event wiring easy to forget
   - Change: Use-case template wrapping mutation + event write
   - Owner: Backend | Timeline: Epic 3

---

### Testability Assessment Summary

#### What Works Well

- AD-3 fake-backed ports enable reliable auth/email tests.
- AD-14 fixed routes reduce scenario ambiguity.
- Separating access-control suite from workflow suite is correct layering.
- Immutable-fact timeline model is testable via multi-step E2E.

#### Accepted Trade-offs

- **Unit tests below gate** for pure domain rules — acceptable if E2E remains authoritative for release.
- **Access matrix not in user-management** — acceptable; platform DoD requires access-control suite pass.

---

## Risk Mitigation Plans (High-Priority ≥6)

### R-001: AccessControl Bypass (Score: 9)

1. Code review checklist: no direct policy reads in user-management.
2. One E2E per controller proving `403` when facade denies.
3. Optional: arch-unit test forbidding imports of policy repository.

**Owner:** Backend | **Timeline:** Epic 1 | **Status:** Planned — controller and architecture-test evidence pending | **Verification:** E2E + review sign-off

### R-002: Non-Atomic Event Writes (Score: 6)

1. Enforce AD-11 pattern in every mutating use-case.
2. E2E asserts event exists in same request as mutation.
3. Integration test simulating mid-transaction failure.

**Owner:** Backend | **Timeline:** Epic 3 | **Status:** Planned — transaction pattern and failure-path evidence pending | **Verification:** E2E TD-UM-CT-01/02/REL-01

### R-003: Auth Intent Not Yet Normative (Score: 6)

1. Propagate the approved enumeration-safe response, zero-dispatch unknown-email behavior, expiry, and single-use replay prevention into the security decision log.
2. Treat token TTL as configuration-owned; tests inject a deterministic TTL and backdate/use a controllable clock rather than waiting in real time.
3. Approve stage-1 auth scenarios after the decision is recorded in the normative location.

**Owner:** Product | **Timeline:** Pre-Epic 2 | **Status:** Decision approved — normative security record and implementation evidence pending | **Verification:** Decision log entry

### R-004: Reports-To Reassignment Integrity (Score: 6)

1. Propagate the approved explicit `DELETE` → `POST` workflow and second-`POST` `409` rule into the normative API/decision record.
2. Enforce at most one active `direct` reports-to edge per employee with a database constraint and stable `409` exception mapping.
3. Approve and automate TD-UM-REL-01..03 against the real HTTP + PostgreSQL path.

**Owner:** Architect + Backend | **Timeline:** Pre-Epic 4 implementation approval | **Status:** Decision approved — normative propagation and implementation evidence pending | **Verification:** Decision-log trace + schema review + green TD-UM-REL-01..03

### R-005: Employee-List Performance Evidence (Score: 6)

1. Name the representative test environment and provision a pseudonymised 500+ User dataset with permission-resolution data.
2. Implement TD-UM-NFR-PERF-01 in k6 against `GET /users`, measuring the normative ≤2 s threshold including permission resolution.
3. Store the baseline report and rerun the load check nightly or under an explicitly documented waiver.

**Owner:** Platform + Backend | **Timeline:** Story 1.5 before release evidence | **Status:** Planned — target environment, seed, and baseline pending | **Verification:** Versioned k6 summary showing the 500+ row dataset and ≤2 s result, or an approved release waiver

### Residual Risk After Planned Mitigation

| Risk | Residual risk | Disposition |
| --- | --- | --- |
| R-001 | A newly added controller can omit the facade until review/architecture checks cover it. | Keep controller-level contract checks and release review. |
| R-002 | A new mutation path can omit its paired event or fail across a boundary not covered by the local transaction. | Require the AD-11 pattern and a failure-path integration test for every new mutation. |
| R-003 | Configurable expiry and single-use do not address rate abuse or theft of an unconsumed link. | Track rate limiting and delivery-channel hardening separately; do not weaken enumeration/replay tests. |
| R-004 | Two-call reassignment can temporarily leave an employee without a direct manager if `DELETE` succeeds and the new `POST` fails. | Accept for the approved reject-then-retry workflow; revisit an atomic replace command only if the workflow proves operationally unsafe. |
| R-005 | A non-production 500-row baseline may not reproduce production topology, cache state, or future scale. | Keep the result as baseline evidence and monitor production-like environments before raising the scale claim. |

---

## Assumptions and Dependencies

### Assumptions

1. `access-control` context is available for tier/permission resolution in E2E (real, not mocked).
2. Bootstrap HR Admin (FR-1) tested in access-control `fc-03`, not duplicated.
3. Timetracker/PeopleForce sync remains out of scope for this test design.
4. Test DB uses pseudonymised personas only (NFR-1).
5. Planning proceeds with the approved rules recorded above; they do not supersede the baseline until propagated into normative artifacts.

### Dependencies

1. PostgreSQL test instance with migrated schema — required before any gate E2E.
2. Email outbound port DI token — required Epic 1 Story 1.1 / Epic 2.
3. 500-row seed dataset — required for NFR-2 k6 (Story 1.5+).

### Risks to Plan

- **Risk:** The approved B-01 planning rule is copied incorrectly or omitted from normative artifacts.
  - **Impact:** Epic 3 permission-negative scenarios drift from the intended audience model.
  - **Contingency:** Keep audience assertions isolated and require the decision-log trace before Epic 3 implementation approval.

---

**End of Architecture Document**

**Next Steps for Architecture Team:** Propagate the approved decision set; implement durable dispatch intent; keep CI at one worker until schema-per-worker exists; assign R-001..R-005 owners.

**Next Steps for QA Team:** Review `test-design-qa.md` and `critical-review-existing-artifacts.md`; await approval before modifying scenario files.
