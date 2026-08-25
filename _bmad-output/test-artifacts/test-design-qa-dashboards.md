# Test Design for QA: Dashboards & Widget Engine

**Purpose:** Test execution recipe, scenario prioritization, and automation strategy for the QA team. Maps all 20 stage-1 scenario test cases in `docs/test-cases/dashboards/` into an actionable, zero-gap test plan before writing stage-2 E2E automation code.

**Date:** 2026-08-25  
**Author:** TEA Master Test Architect (`bmad-testarch-test-design`)  
**Status:** QA Execution Ready — 2026-08-25  
**Project:** people management — `dashboards` bounded context  
**Related Documents:** `test-design-architecture-dashboards.md` (Architecture test contract) · `traceability/dashboards-traceability-matrix.md` (Traceability matrix) · `docs/test-cases/dashboards/README.md` (Stage-1 scenarios)

---

## Executive Summary

**Scope:** Formalized test design and coverage plan for the Dashboards & Widget Engine (PRD §4.4, AD-14..AD-19). Covers 4 functional groups across 20 stage-1 scenario documents:
1. **Authentication & Authorization (`auth/`):** 5 test cases (`DB-AU-01`..`DB-AU-05`)
2. **Dashboard CRUD & User Isolation (`dashboards-crud/`):** 4 test cases (`DB-DS-01`..`DB-DS-04`)
3. **Role Presets (`presets/`):** 4 test cases (`DB-PR-01`..`DB-PR-04`)
4. **Widget Data Providers & Scoping (`widgets/`):** 7 test cases (`DB-WG-01`..`DB-WG-07`)

**Risk & Coverage Overview:**
- **Total Scenarios Planned:** 24 (20 stage-1 functional scenarios + 4 NFR/exploratory scenarios)
- **Priority Breakdown:**
  - **P0 (Critical Gates):** 6 scenarios (~25% of functional core — security gates, isolation, tier boundaries, PP resourcing exclusion)
  - **P1 (Core Features):** 11 scenarios (~46% — role presets, widget data providers, DM filtering, custom dashboard creation)
  - **P2 (Validation & Edge Cases):** 5 scenarios (~21% — invalid payloads, action item sorting, 404 unknown widget handling, PII audit)
  - **P3 (Exploratory / Resilience):** 2 scenarios (~8% — dashboard shell widget failure resilience, concurrent widget combinations)
- **Estimated Effort:** ~2–3 weeks for 1 QA Engineer (covering Stage-2 E2E Playwright test implementation, fixture seeding, and CI integration).

---

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| **Grid/Pixel Widget Layout Persistence** | AD-14 explicitly defines widget placement and visual arrangement as frontend CSS/component concerns, not stored in the database. | Visual regression testing in frontend repo; backend stores only widget membership and config JSON. |
| **Cross-User Custom Dashboard Sharing** | Architecture spine defers dashboard sharing (by link/group) beyond preset `accessRole`. | Custom dashboards are strictly isolated by `createdBy` (`DB-DS-04`). |
| **Direct Policy Table Modification** | Access permissions are managed by `access-control` bounded context; dashboards consume the `AccessControl` facade. | `access-control` test suite independently verifies policy assignments. |
| **Complex Custom Fields in Dashboards** | Full dynamic custom field widgets are deferred until PR-B-01 custom field storage model is finalized. | Widget data providers test standard S1 fields and core operational metrics. |

---

## Dependencies & Scoped Test Gates

### Backend / Architecture Dependencies (Pre-Implementation)
1. **Seeded Presets Available:** Database migration or seed runner must insert the 4 system presets (`unit-manager`, `delivery-manager`, `project-manager`, `people-partner`) with their respective widget definitions.
2. **AccessControl Facade Ready:** `AccessControl.isAllowed(userId, permission)` and tier evaluation query ports must be operational (mocked via AD-19 or real).
3. **Bounded Context Ports:** Sibling domain queries (people, risks, action items, resourcing) must be available through NestJS DI tokens / application query ports.

### QA Infrastructure Setup
1. **Test Runner:** Playwright Test configured for backend API testing with `@seontechnologies/playwright-utils`.
2. **Persona Fixtures:** Seeded canonical test users from `access-control/README.md`:
   - `Bob`: Unit Manager of Alice.
   - `Dave`: Delivery Manager for project Phoenix (Alice is member) and Orion (Bob is member).
   - `Pete`: Project Manager for project Phoenix.
   - `Paula`: People Partner assigned to Alice.
   - `Alice`: Team member on Phoenix, reporting to Bob, PP is Paula.
   - `Colin`: Independent colleague (peer) with no relationship over Alice.
   - `Root`: HR Admin principal (mock session token per AD-19).
   - `Eve`: Unprivileged user lacking `view-dashboard` permission.
3. **Database Isolation:** Single worker with UUID-owned data slices during local runs; clean test database per CI run.

### Factory Pattern Example (`@seontechnologies/playwright-utils`)

```typescript
import { test } from '@seontechnologies/playwright-utils/api-request/fixtures';
import { expect } from '@playwright/test';

test('@P0 @API dashboards returns structure only without business payloads @DB-DS-01', async ({ apiRequest }) => {
  const { status, body } = await apiRequest({
    method: 'GET',
    path: '/api/dashboards',
    headers: { authorization: 'Bearer <token:bob>' },
  });

  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  
  const umPreset = body.find((d: any) => d.accessRole === 'unit-manager');
  expect(umPreset).toBeDefined();
  expect(umPreset.widgets.length).toBeGreaterThan(0);
  
  // Verify architectural invariant: structure only, no business data embedded
  expect(umPreset).not.toHaveProperty('employees');
  expect(umPreset).not.toHaveProperty('risks');
  expect(umPreset).not.toHaveProperty('counts');
  for (const widget of umPreset.widgets) {
    expect(widget).toHaveProperty('id');
    expect(widget).toHaveProperty('type');
    expect(widget).toHaveProperty('config');
    expect(widget).not.toHaveProperty('data');
  }
});
```

---

## Risk Assessment (QA View)

| Risk ID | Score | QA Test Coverage Mapping |
| --- | --- | --- |
| **R-DB-001** | **9** | `DB-WG-03` (people table tier-bounded) & `DB-WG-06` (PP HR widgets scoped) — negative multi-persona assertions. |
| **R-DB-002** | **6** | `DB-PR-04` — strict structural assertion that `my-resourcing-requests` is absent from People Partner preset. |
| **R-DB-003** | **6** | `DB-DS-04` — Bob creates custom dashboard; Paula verifies zero visibility of Bob's dashboard. |
| **R-DB-004** | **6** | `DB-AU-05` — Eve with valid token but lacking `view-dashboard` gets 403 Forbidden. |
| **R-DB-005** | **4** | `TD-DB-NFR-PERF-01` — k6 concurrent load test verifying parallel widget requests $\le 2\text{ s}$. |
| **R-DB-006** | **4** | `DB-AU-04` — Mock HR Admin token succeeds via standard AccessControl facade contract. |
| **R-DB-007** | **4** | Architecture seam tests verifying widget providers interact via application query ports. |
| **R-DB-008** | **3** | `DB-WG-07` — Unregistered widget type string fails closed with 404 Not Found. |
| **R-DB-009** | **4** | `DB-WG-02` — DM summary counters test unparameterized (all projects) vs `?projectId=...`. |
| **R-DB-010** | **2** | `DB-WG-04` — Action items provider sorting by `dueDate` ascending and `isOverdue` calculation. |

---

## NFR Test Coverage Plan

| NFR ID | Requirement | Validation Method | Tool / Level | Evidence Artifact | Priority |
| --- | --- | --- | --- | --- | --- |
| **NFR-DB-01** | Pseudonymised test data; zero real PII | Fixture & log static scan | CI grep audit | CI PII Audit Log | P2 |
| **NFR-DB-02** | Widget & dashboard latency $\le 2\text{ s}$ @ 500+ org | Concurrent load test | k6 | k6 Summary JSON | P1 |
| **NFR-DB-03** | Auth fail-closed (401 on empty token, 403 on missing perm) | API security suite | Playwright API (`DB-AU-01..05`) | Playwright HTML Report | P0 |
| **NFR-DB-04** | Widget isolation failure resilience | Malformed widget data test | Playwright E2E | Error Boundary Report | P2 |

---

## Entry & Exit Criteria

### Entry Criteria (Pre-Testing Gate)
- [x] All 20 stage-1 scenario documents drafted and traced in `docs/test-cases/dashboards/`.
- [x] Test architecture contract (`test-design-architecture-dashboards.md`) reviewed and accepted.
- [x] Seed fixture personas (Bob, Dave, Pete, Paula, Alice, Colin, Root, Eve) defined.
- [ ] Database migration for `Dashboard` and `Widget` tables deployed to test environment.
- [ ] Seed script executes and populates the 4 standard presets.

### Exit Criteria (Quality Release Gate)
- [ ] **P0 Pass Rate:** 100% passing (0 failures allowed).
- [ ] **P1 Pass Rate:** $\ge 95\%$ passing (any failure must have an approved tracking ticket and waiver).
- [ ] **P2/P3 Pass Rate:** $\ge 90\%$ passing.
- [ ] **Traceability:** 100% of the 20 scenario test cases mapped to automated Playwright tests.
- [ ] **Security Validation:** All 5 auth scenarios (`DB-AU-01`..`DB-AU-05`) pass against production build.
- [ ] **Zero High-Severity Defects:** No unresolved Blocker or Critical bugs in the `dashboards` context.

---

## Detailed Test Coverage Plan

### P0: Critical Security & Invariant Gates (6 Scenarios)

| Test ID | Scenario Document | Method & Path | Persona | Key Invariant & Assertion | Risk Ref |
| --- | --- | --- | --- | --- | --- |
| **DB-AU-01** | `auth/au-01-dashboards-unauthenticated.md` | `GET /api/dashboards` | Unauthenticated | Returns `401 Unauthorized`; empty/error body | R-DB-004 |
| **DB-AU-02** | `auth/au-02-create-dashboard-unauthenticated.md` | `POST /api/dashboards` | Unauthenticated | Returns `401 Unauthorized`; zero records created | R-DB-004 |
| **DB-AU-03** | `auth/au-03-widget-data-unauthenticated.md` | `GET /api/widgets/summary-counters/data` | Unauthenticated | Returns `401 Unauthorized`; zero metrics returned | R-DB-004 |
| **DB-AU-05** | `auth/au-05-view-dashboard-permission-denied.md` | `GET /api/dashboards` | Eve (No perm) | Returns `403 Forbidden` due to missing `view-dashboard` | R-DB-004 |
| **DB-DS-04** | `dashboards-crud/ds-04-custom-dashboard-isolation.md` | `GET /api/dashboards` | Paula vs Bob | Bob creates "Bob Private View"; Paula's list completely omits it | R-DB-003 |
| **DB-PR-04** | `presets/pr-04-people-partner-preset-no-resourcing.md` | `GET /api/dashboards` | Paula (PP) | PP preset contains people/HR widgets; `my-resourcing-requests` STRICTLY ABSENT | R-DB-002 |
| **DB-WG-03** | `widgets/wg-03-people-table-tier-bounded.md` | `GET /api/widgets/people-table/data` | Bob (UM) | Returns subordinate Alice; unrelated peer Colin is strictly absent | R-DB-001 |

---

### P1: Core Features, Presets & Data Providers (11 Scenarios)

| Test ID | Scenario Document | Method & Path | Persona | Key Invariant & Assertion | Risk Ref |
| --- | --- | --- | --- | --- | --- |
| **DB-AU-04** | `auth/au-04-mock-hr-admin-unblocks-dashboards.md` | `GET /api/dashboards` | Root (HR Admin Mock) | Returns `200 OK` with dashboards array via AccessControl facade | R-DB-006 |
| **DB-DS-01** | `dashboards-crud/ds-01-get-dashboards-structure-only.md` | `GET /api/dashboards` | Bob (UM) | Returns dashboard + widget metadata; business payloads absent | — |
| **DB-DS-02** | `dashboards-crud/ds-02-create-custom-dashboard-success.md` | `POST /api/dashboards` | Bob (UM) | Returns `201 Created` with `accessRole: null`, `createdBy: bob.id` | — |
| **DB-PR-01** | `presets/pr-01-unit-manager-preset.md` | `GET /api/dashboards` | Bob (UM) | Contains `unit-manager` preset with `summary-counters`, `people-table`, `my-action-items`, `quick-nav` | — |
| **DB-PR-02** | `presets/pr-02-delivery-manager-preset.md` | `GET /api/dashboards` | Dave (DM) | Contains `delivery-manager` preset with `project-selector`, `summary-counters`, `project-people-tables`, `my-resourcing-requests`, `quick-nav` | — |
| **DB-PR-03** | `presets/pr-03-project-manager-preset.md` | `GET /api/dashboards` | Pete (PM) | Contains `project-manager` preset with same widget set as DM | — |
| **DB-WG-01** | `widgets/wg-01-summary-counters-um.md` | `GET /api/widgets/summary-counters/data` | Bob (UM) | Returns accurate headcount, risks by level, open/overdue action items, resourcing requests for reporting line | — |
| **DB-WG-02** | `widgets/wg-02-summary-counters-dm-all-and-filtered.md` | `GET /api/widgets/summary-counters/data` | Dave (DM) | Aggregates across Phoenix + Orion; `?projectId=phoenix` recomputes counters for Phoenix only | R-DB-009 |
| **DB-WG-05** | `widgets/wg-05-my-resourcing-requests-dm-scope.md` | `GET /api/widgets/my-resourcing-requests/data` | Dave (DM) | Returns requests for Dave's managed projects (Phoenix); unrelated project R3 absent | — |
| **DB-WG-06** | `widgets/wg-06-pp-hr-widgets-scoped.md` | `GET /api/widgets/incomplete-profiles/data` | Paula (PP) | Returns data for assigned Alice only; Colin is absent | R-DB-001 |
| **TD-DB-NFR-PERF-01** | NFR Performance Test | Concurrent widget queries | Bob / Dave | 5 concurrent widget requests complete in $\le 2\text{ s}$ on 500+ org graph | R-DB-005 |

---

### P2: Validation, Edge Cases & Data Hygiene (5 Scenarios)

| Test ID | Scenario Document | Method & Path | Persona | Key Invariant & Assertion | Risk Ref |
| --- | --- | --- | --- | --- | --- |
| **DB-DS-03** | `dashboards-crud/ds-03-create-dashboard-invalid-body.md` | `POST /api/dashboards` | Bob (UM) | Missing title returns `400 Bad Request` with field validation errors | — |
| **DB-WG-04** | `widgets/wg-04-my-action-items-sorted.md` | `GET /api/widgets/my-action-items/data` | Bob (UM) | Returns Bob's items sorted ascending by `dueDate`, overdue items flagged `isOverdue: true` | R-DB-010 |
| **DB-WG-07** | `widgets/wg-07-unknown-widget-type-404.md` | `GET /api/widgets/non-existent-widget-type/data` | Bob (UM) | Unrecognized type string fails closed with `404 Not Found` | R-DB-008 |
| **TD-DB-NFR-PII-01** | NFR PII Scan | Audit test seed files & logs | System | Asserts zero unpseudonymised emails, real phone numbers, or PII | — |
| **TD-DB-NFR-SEC-01** | Negative Auth Sweep | All dashboard & widget endpoints | Unauthenticated | Probes every route with empty/malformed token; asserts `401` on all | R-DB-004 |

---

### P3: Exploratory & Error Resilience (2 Scenarios)

| Test ID | Description | Level | Target Focus | Expected Outcome |
| --- | --- | --- | --- | --- |
| **TD-DB-EXP-01** | Custom Dashboard Complex Configs | E2E API / UI | Custom dashboards with 10+ widgets, nested JSON config objects | Correctly persisted and returned without truncation |
| **TD-DB-EXP-02** | Partial Widget Failure Handling | Integration | One widget provider throws 500 or 404 | Dashboard shell renders error state for failed widget while other widgets render successfully |

---

## Execution Strategy

### 1. Pull Request (PR) Gate (< 5 minutes)
- Full API automated test suite (all 20 stage-1 scenarios: `DB-AU-01..05`, `DB-DS-01..04`, `DB-PR-01..04`, `DB-WG-01..07`).
- Fast, deterministic execution against local PostgreSQL container.

### 2. Nightly Regression & Performance Gate (< 20 minutes)
- Full functional suite across all bounded contexts (`user-management`, `access-control`, `dashboards`).
- `TD-DB-NFR-PERF-01` k6 performance benchmark on 500+ employee test database.
- `TD-DB-NFR-PII-01` automated fixture and log audit.

### 3. Weekly Soak & Quality Audit
- Long-running exploratory fuzzing on custom dashboard widget JSON configs.
- Full platform traceability matrix reconciliation.

---

## Resource & Effort Estimates

| Priority Group | Scenarios | Estimated Effort (Hours) | Timeline (1 QA) |
| --- | --- | --- | --- |
| **P0 (Critical Gates)** | 6 | ~15–25 hours | Week 1 |
| **P1 (Core Features)** | 11 | ~25–40 hours | Week 1–2 |
| **P2 (Validation & NFR)** | 5 | ~10–15 hours | Week 2 |
| **P3 (Exploratory)** | 2 | ~4–8 hours | Week 3 |
| **Total** | **24** | **~54–88 hours** | **~2–3 weeks** |

---

## Traceability Summary

All 20 scenario test cases in `docs/test-cases/dashboards/` are fully mapped into the requirements traceability matrix in `_bmad-output/test-artifacts/traceability/dashboards-traceability-matrix.md` with **zero unmapped scenarios** and **zero requirement gaps**.
