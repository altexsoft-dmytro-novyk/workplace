# Test Design for Architecture: Dashboards & Widget Engine

**Purpose:** Architectural testability contract, cross-cutting concerns, testability gaps, and NFR requirements for the `dashboards` bounded context. Serves as a contract between QA and Engineering before E2E code and backend implementation begin.

**Date:** 2026-08-25  
**Author:** TEA Master Test Architect (`bmad-testarch-test-design`)  
**Status:** Architecture Review Ready — 2026-08-25  
**Project:** people management — `dashboards` bounded context  
**PRD Reference:** `docs/project-requirements.md` §4.4 (Dashboards & Widget Engine), §2.3 (Functional Roles & Permissions), §7 (NFRs), §9 (Quality & Access-Control Verification Gate)  
**ADR Reference:** `docs/architecture/dashboards.md`, `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` (AD-1..AD-3, AD-5, AD-9, AD-10, AD-14..AD-19)

---

## Executive Summary

**Scope:** Architectural test design for the **Dashboards & Widget Engine** (`dashboards` bounded context). Covers dashboard metadata CRUD, custom dashboard creation and tenant isolation, role preset provisioning (`unit-manager`, `delivery-manager`, `project-manager`, `people-partner`), per-widget independent data fetching (`/api/widgets/:type/data`), tier boundary enforcement via the `AccessControl` facade, and temporary auth mock integration (AD-19).

**Business & Architectural Context:**
- **One Engine, Not Four Pages (AD-14):** A single configurable engine serves Unit Managers, Delivery Managers, Project Managers, and People Partners. Presets are seeded widget sets, not separate controller routes or page implementations.
- **Per-Widget Data Fetching (AD-17):** `GET /api/dashboards` returns structure only (dashboard metadata + widget list with `type` and `config`). Business payloads (people, risks, action items, resourcing) are fetched independently by each widget via `GET /api/widgets/:type/data`.
- **Access Control & Tier Boundaries (AD-9..AD-12, §2.3):** Dashboards never widen data access. Every widget data provider filters returned entities through the `AccessControl` facade based on the viewer's computed access tier.
- **Extensible Code-Based Registry (AD-16):** Widget `type` is a string identifier mapped in code (frontend component + backend data provider). Unknown types fail closed with `404 Not Found` without database schema migrations.
- **Temporary Auth Strategy (AD-19):** Until real User Management auth is linked, testing principal is mocked with HR Admin permissions, calling through canonical `AccessControl` shapes.

**Risk Summary:**
- **Total Risks Identified:** 10 (4 High ≥6, 4 Medium 3–5, 2 Low 1–2)
- **High-Priority Critical Risks:**
  - `R-DB-001` (SEC, 9): Widget data provider bypasses AccessControl facade / leaks unauthorized entities.
  - `R-DB-002` (SEC, 6): Resourcing requests / counters exposed to People Partner (violating §4.4.4).
  - `R-DB-003` (SEC, 6): Custom dashboard tenant/user isolation failure (`createdBy` boundary leak).
  - `R-DB-004` (SEC, 6): Missing `view-dashboard` functional permission check allows unprivileged access.
- **Testing Effort:** 20 stage-1 scenario tests + 4 NFR/exploratory scenarios (~2–3 weeks, 1 QA engineer).

---

## Quick Guide

### 🚨 SCOPED GATES — Engineering Team Must Honor

1. **Gate DB-G01: Seeded Presets Integrity (AD-18):**
   - The database migration/seed script must seed the 4 canonical presets (`unit-manager`, `delivery-manager`, `project-manager`, `people-partner`) with their exact specified widget types before running preset E2E tests.
   - People Partner preset must strictly omit `my-resourcing-requests` (`DB-PR-04`).
2. **Gate DB-G02: AccessControl Facade Calling Discipline (AD-9, AD-19):**
   - Dashboard and widget controllers must strictly invoke `AccessControl.isAllowed(userId, 'view-dashboard')` and query filters through `AccessControl` ports.
   - Code must not contain hardcoded role bypasses (`if (user.role === 'admin')`) or mock shortcuts that bypass facade execution.
3. **Gate DB-G03: Hexagonal Context Separation (AD-5):**
   - Widget providers (`summary-counters`, `people-table`, `my-action-items`, `my-resourcing-requests`) must query other bounded contexts via application query ports, never via direct cross-schema database joins.
4. **Gate DB-G04: Fail-Closed Unknown Widget Handling (AD-16):**
   - Backend widget router must handle unrecognized `type` strings gracefully by throwing a typed `NotFoundException` (`404`), preventing unhandled server crashes or `500` errors (`DB-WG-07`).

---

## Testability Assessment & Architecture Gaps

### 1. Controllability (State Seeding & Mockability)
- **Fixtures:** Standard canonical test personas from `access-control/README.md` (Bob [UM], Dave [DM], Pete [PM], Paula [PP], Alice [Team Member], Colin [Peer], Root [HR Admin], Eve [Unprivileged]) are used for deterministic fixture seeding.
- **Auth Tokens:** Auth headers formatted as `Bearer <token:persona>` allow precise simulation of session identities and role contexts.
- **Mock Principal (AD-19):** Allows independent execution of dashboard E2E tests prior to User Management authentication finalization.

### 2. Observability (Assertions & Payloads)
- **Payload Separation:** Clear architectural separation between structure payloads (`GET /api/dashboards`) and data payloads (`GET /api/widgets/:type/data`) allows deterministic contract assertions.
- **Error Transparency:** Strict HTTP status codes (`401` for unauthenticated, `403` for missing permission, `404` for unknown widget type, `400` for invalid dashboard body).
- **Absence is Absence:** Enforces the platform invariant that unauthorized or nonexistent fields/entities are omitted from JSON payloads rather than returned as `null` or empty arrays.

### 3. Reliability & Isolation
- **Custom Dashboard Isolation:** Custom dashboards are scoped by `createdBy: <userId>` with `accessRole: null`, ensuring multi-tenant safety.
- **Action Item Ordering:** Ascending sort by `dueDate` with `isOverdue` boolean ensures deterministic UI rendering.
- **Project Filter Scope:** `?projectId=<uuid>` query parameter deterministically filters multi-project delivery managers down to project-scoped counts.

---

## Architecturally Significant Requirements (ASRs)

| ASR ID | Architectural Requirement | Classification | Impact on Testing |
| --- | --- | --- | --- |
| **ASR-DB-01** | Single engine serves all 4 managerial roles via seeded presets (AD-14) | **ACTIONABLE** | Presets tested as data configuration on the same router/service, not distinct endpoints |
| **ASR-DB-02** | Dashboard CRUD returns structure only; widgets fetch data independently (AD-17) | **ACTIONABLE** | Contract assertion verifies business fields (`employees`, `risks`) are absent from `/api/dashboards` |
| **ASR-DB-03** | Widget data is strictly filtered by viewer AccessControl tier (AD-9, AD-17) | **ACTIONABLE** | Multi-persona negative tests verify peers (Colin) are excluded from manager tables (Bob) |
| **ASR-DB-04** | People Partner preset strictly excludes resourcing widgets (§4.4.4, AD-18) | **ACTIONABLE** | Negative assertion that `my-resourcing-requests` is absent from PP dashboard payload |
| **ASR-DB-05** | Extensible widget registry fails closed on unknown types with 404 (AD-16) | **ACTIONABLE** | Negative test with unregistered widget type string verifies 404 response |
| **ASR-DB-06** | Temporary HR Admin mock session principal (AD-19) | **FYI / SEAM** | Integration harness uses mock principal; test suite will re-run against real auth when ready |

---

## Risk Assessment Matrix

**Scoring:** Probability ($P \in [1..3]$) $\times$ Impact ($I \in [1..3]$) $=$ Risk Score ($1..9$). High risk $\ge 6$.  
**Categories:** `SEC` Security · `TECH` Technical/Architecture · `PERF` Performance · `DATA` Data Integrity · `BUS` Business Logic · `OPS` Operations.

### High-Priority Risks (Score $\ge 6$)

| Risk ID | Cat | Description | P | I | Score | Mitigation Strategy | Owner | Verification Gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **R-DB-001** | SEC | Widget data provider bypasses AccessControl tier filtering, leaking unauthorized employee records | 3 | 3 | **9** | Mandatory AccessControl tier resolution inside widget provider query ports; `DB-WG-03` & `DB-WG-06` | Backend Lead | Stage-2 Gate E2E |
| **R-DB-002** | SEC | `my-resourcing-requests` or resourcing metrics exposed in People Partner preset or to PP actor | 2 | 3 | **6** | Structural preset verification (`DB-PR-04`) + widget provider role entitlement check | Architect / QA | Stage-2 Gate E2E |
| **R-DB-003** | SEC | Custom dashboard isolation failure — User A views or modifies User B's private dashboard | 2 | 3 | **6** | Enforce `WHERE createdBy = :userId OR accessRole IS NOT NULL` in dashboard repository; `DB-DS-04` | Backend | Stage-2 Gate E2E |
| **R-DB-004** | SEC | User lacking `view-dashboard` functional permission accesses dashboards or widget endpoints | 2 | 3 | **6** | Guard all `/api/dashboards` and `/api/widgets/:type/data` routes with AccessControl permission check (`DB-AU-05`) | Backend | Stage-2 Gate E2E |

### Medium-Priority Risks (Score $3..5$)

| Risk ID | Cat | Description | P | I | Score | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **R-DB-005** | PERF | Concurrent fetching of multiple widgets causes database connection pool saturation / high latency | 2 | 2 | **4** | Index foreign keys (`Widget.dashboardId`, `Dashboard.createdBy`, `Dashboard.accessRole`); k6 load test | Platform / Backend |
| **R-DB-006** | TECH | AD-19 mock auth implementation leaks hardcoded role flags into dashboard domain logic | 2 | 2 | **4** | Restrict mock to test module/DI container; verify calls go through standard `AccessControl` ports (`DB-AU-04`) | Architecture |
| **R-DB-007** | DATA | Widget providers perform direct cross-schema database joins instead of calling domain ports (AD-5) | 2 | 2 | **4** | Code review and architectural linting to preserve bounded-context boundaries | Architecture |
| **R-DB-009** | BUS | Delivery Manager `?projectId=...` filtering fails to recalculate summary counters accurately | 2 | 2 | **4** | Test both unparameterized (all projects) and parameterized query variants (`DB-WG-02`) | QA / Backend |

### Low-Priority Risks (Score $1..2$)

| Risk ID | Cat | Description | P | I | Score | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **R-DB-008** | TECH | Unknown widget type throws uncaught 500 exception instead of failing closed with 404 | 1 | 3 | **3** | Centralized exception filter mapping unknown registry types to `NotFoundException` (`DB-WG-07`) | Backend |
| **R-DB-010** | DATA | Action items `dueDate` sorting or `isOverdue` calculation fails around UTC midnight | 1 | 2 | **2** | Deterministic UTC date handling in action items provider and boundary tests (`DB-WG-04`) | QA |

---

## NFR Planning & Verification Strategy

| NFR ID | Category | Requirement & Threshold | Verification Tool & Method | Planned Evidence | Priority |
| --- | --- | --- | --- | --- | --- |
| **NFR-DB-01** | SEC / Compliance | All responses must use pseudonymised test data; zero real PII in fixtures or logs | Static CI grep + fixture audit | CI Test Log Audit | P2 |
| **NFR-DB-02** | PERF | Dashboard structure and widget data endpoints must respond within $\le 500\text{ ms}$ individually, and full dashboard concurrent widget fetches $\le 2\text{ s}$ under 500+ employee load | k6 load testing against seed dataset | k6 Performance Summary JSON | P1 |
| **NFR-DB-03** | SEC | Every endpoint must reject unauthenticated requests with `401 Unauthorized` and unprivileged users with `403 Forbidden` | Playwright API test suite (`DB-AU-01..05`) | E2E Test Execution Report | P0 |
| **NFR-DB-04** | REL / OPS | Widget data provider failure or unknown widget type must fail isolatedly without bringing down dashboard shell | API error response assertion (`DB-WG-07`) + frontend boundary test | E2E Error Handling Report | P2 |

---

## Sign-off & Next Steps

1. **Architecture Approval:** Engineering Lead confirms database schema (`Dashboard`, `Widget`), widget registry pattern, and AccessControl integration points.
2. **Preset Verification:** Seed scripts reviewed for exact compliance with §4.4 role presets and PP resourcing exclusion.
3. **Transition to QA Execution:** QA test recipe in `test-design-qa-dashboards.md` and traceability matrix in `traceability/dashboards-traceability-matrix.md` are approved for stage-2 red E2E test authoring.
