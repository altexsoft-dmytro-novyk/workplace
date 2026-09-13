# Requirements Traceability Matrix: Dashboards & Widget Engine

**Document:** Requirements Traceability Matrix (RTM)  
**Bounded Context:** `dashboards`  
**Date:** 2026-08-25  
**Author:** TEA Master Test Architect (`bmad-testarch-test-design`)  
**Status:** Approved Baseline — Zero Gaps Verified  

---

## Traceability Summary

- **Total Scenario Test Cases in `docs/test-cases/dashboards/`:** 20
- **Total Mapped Test Scenarios:** 20 Functional + 4 NFR/Exploratory = **24 Scenarios**
- **Requirements Coverage:** 100% of PRD §4.4 (Dashboards & Widget Engine) and Architecture Decisions AD-14..AD-19 covered.
- **Unmapped Scenarios:** 0
- **Requirement Gaps:** 0

---

## Traceability Matrix Table

| Scenario ID | Scenario Source File | Requirement Ref | Architecture Ref | HTTP Method & Path | Persona | Priority | Risk (Cat / Score) | Test Level | Verification / Assertion Summary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **DB-AU-01** | `docs/test-cases/dashboards/auth/au-01-dashboards-unauthenticated.md` | Global Auth Rule (§7) | AD-19 | `GET /api/dashboards` | Unauthenticated (`""`) | **P0** | `SEC` / 6 | E2E API | Returns `401 Unauthorized`; empty/error body |
| **DB-AU-02** | `docs/test-cases/dashboards/auth/au-02-create-dashboard-unauthenticated.md` | Global Auth Rule (§7) | AD-19 | `POST /api/dashboards` | Unauthenticated (`""`) | **P0** | `SEC` / 6 | E2E API | Returns `401 Unauthorized`; zero dashboards created |
| **DB-AU-03** | `docs/test-cases/dashboards/auth/au-03-widget-data-unauthenticated.md` | Global Auth Rule (§7) | AD-17, AD-19 | `GET /api/widgets/summary-counters/data` | Unauthenticated (`""`) | **P0** | `SEC` / 6 | E2E API | Returns `401 Unauthorized`; zero widget metrics returned |
| **DB-AU-04** | `docs/test-cases/dashboards/auth/au-04-mock-hr-admin-unblocks-dashboards.md` | §4.4, AD-19 | AD-9, AD-19 | `GET /api/dashboards` | Root (`token:root`) | **P1** | `TECH` / 4 | E2E API | Returns `200 OK` with dashboards array; calls through AccessControl facade |
| **DB-AU-05** | `docs/test-cases/dashboards/auth/au-05-view-dashboard-permission-denied.md` | §2.3 Functional Roles | AD-9, AD-17 | `GET /api/dashboards` | Eve (`token:eve`) | **P0** | `SEC` / 6 | E2E API | Returns `403 Forbidden` for user without `view-dashboard` permission |
| **DB-DS-01** | `docs/test-cases/dashboards/dashboards-crud/ds-01-get-dashboards-structure-only.md` | §4.4 Engine Architecture | AD-14, AD-15, AD-17 | `GET /api/dashboards` | Bob (`token:bob`) | **P1** | `TECH` / 4 | E2E API | Returns dashboard and widget metadata; business payloads (`employees`, `counts`, `risks`) absent |
| **DB-DS-02** | `docs/test-cases/dashboards/dashboards-crud/ds-02-create-custom-dashboard-success.md` | §4.4 Custom Dashboards | AD-15, AD-17 | `POST /api/dashboards` | Bob (`token:bob`) | **P1** | `BUS` / 4 | E2E API | Returns `201 Created` with `accessRole: null`, `createdBy: bob.id`, widgets attached |
| **DB-DS-03** | `docs/test-cases/dashboards/dashboards-crud/ds-03-create-dashboard-invalid-body.md` | §4.4 Input Validation | AD-15 | `POST /api/dashboards` | Bob (`token:bob`) | **P2** | `TECH` / 2 | E2E API | Missing title returns `400 Bad Request` with field validation errors |
| **DB-DS-04** | `docs/test-cases/dashboards/dashboards-crud/ds-04-custom-dashboard-isolation.md` | §4.4 Custom Isolation | AD-15, AD-17 | `GET /api/dashboards` | Paula vs Bob | **P0** | `SEC` / 6 | E2E API | Bob's custom dashboard is completely absent from Paula's dashboard list |
| **DB-PR-01** | `docs/test-cases/dashboards/presets/pr-01-unit-manager-preset.md` | §4.4.1 Unit Manager Preset | AD-18 | `GET /api/dashboards` | Bob (`token:bob`) | **P1** | `BUS` / 4 | E2E API | Includes `unit-manager` preset with `summary-counters`, `people-table`, `my-action-items`, `quick-nav` |
| **DB-PR-02** | `docs/test-cases/dashboards/presets/pr-02-delivery-manager-preset.md` | §4.4.2 Delivery Manager Preset | AD-18 | `GET /api/dashboards` | Dave (`token:dave`) | **P1** | `BUS` / 4 | E2E API | Includes `delivery-manager` preset with `project-selector`, `summary-counters`, `project-people-tables`, `my-resourcing-requests`, `quick-nav` |
| **DB-PR-03** | `docs/test-cases/dashboards/presets/pr-03-project-manager-preset.md` | §4.4.3 Project Manager Preset | AD-18 | `GET /api/dashboards` | Pete (`token:pete`) | **P1** | `BUS` / 4 | E2E API | Includes `project-manager` preset with identical widget types to DM |
| **DB-PR-04** | `docs/test-cases/dashboards/presets/pr-04-people-partner-preset-no-resourcing.md` | §4.4.4 People Partner Preset | AD-18 | `GET /api/dashboards` | Paula (`token:paula`) | **P0** | `SEC` / 6 | E2E API | Includes `people-partner` preset; `my-resourcing-requests` is STRICTLY ABSENT |
| **DB-WG-01** | `docs/test-cases/dashboards/widgets/wg-01-summary-counters-um.md` | §4.4.1 UM Counters | AD-17 | `GET /api/widgets/summary-counters/data` | Bob (`token:bob`) | **P1** | `BUS` / 4 | E2E API | Returns accurate metrics for Bob's direct reporting line (headcount, risks by level, action items, resourcing) |
| **DB-WG-02** | `docs/test-cases/dashboards/widgets/wg-02-summary-counters-dm-all-and-filtered.md` | §4.4.2 DM Counters | AD-17 | `GET /api/widgets/summary-counters/data` | Dave (`token:dave`) | **P1** | `DATA` / 4 | E2E API | Unparameterized aggregates across Phoenix + Orion; `?projectId=phoenix` recomputes for Phoenix only |
| **DB-WG-03** | `docs/test-cases/dashboards/widgets/wg-03-people-table-tier-bounded.md` | §2.3, §4.4.1 Tier Boundary | AD-9, AD-10, AD-17 | `GET /api/widgets/people-table/data` | Bob (`token:bob`) | **P0** | `SEC` / 9 | E2E API | Returns subordinate Alice with status/profile; unrelated peer Colin is strictly absent |
| **DB-WG-04** | `docs/test-cases/dashboards/widgets/wg-04-my-action-items-sorted.md` | §4.4.1, §4.5 Action Items | AD-17 | `GET /api/widgets/my-action-items/data` | Bob (`token:bob`) | **P2** | `BUS` / 2 | E2E API | Returns Bob's items sorted ascending by `dueDate`, overdue items flagged `isOverdue: true` |
| **DB-WG-05** | `docs/test-cases/dashboards/widgets/wg-05-my-resourcing-requests-dm-scope.md` | §4.4.2 Resourcing Scope | AD-17 | `GET /api/widgets/my-resourcing-requests/data` | Dave (`token:dave`) | **P1** | `SEC` / 4 | E2E API | Returns requests for Dave's managed projects (Phoenix); unrelated project R3 absent |
| **DB-WG-06** | `docs/test-cases/dashboards/widgets/wg-06-pp-hr-widgets-scoped.md` | §4.4.4 PP HR Widgets | AD-17 | `GET /api/widgets/incomplete-profiles/data` | Paula (`token:paula`) | **P1** | `SEC` / 4 | E2E API | Returns HR widget data for assigned Alice only; Colin is strictly absent |
| **DB-WG-07** | `docs/test-cases/dashboards/widgets/wg-07-unknown-widget-type-404.md` | §4.4 Extensible Registry | AD-16, AD-17 | `GET /api/widgets/non-existent/data` | Bob (`token:bob`) | **P2** | `TECH` / 3 | E2E API | Unrecognized type string fails closed with `404 Not Found` |
| **TD-DB-NFR-PERF-01** | *NFR Performance Test* | §7 NFR Performance | AD-17 | Concurrent widget queries | Multi-persona | **P1** | `PERF` / 4 | k6 Load | 5 concurrent widget requests complete in $\le 2\text{ s}$ on 500+ org graph |
| **TD-DB-NFR-PII-01** | *NFR Compliance Test* | §7 NFR Personal Data | — | Fixtures & Logs Audit | System | **P2** | `SEC` / 2 | CI Grep | Asserts zero unpseudonymised emails or PII in test seed files or logs |
| **TD-DB-NFR-SEC-01** | *NFR Security Sweep* | §7, §9 Quality Gate | AD-9, AD-19 | All dashboard & widget routes | Unauthenticated | **P0** | `SEC` / 6 | E2E API | Global sweep asserting 401 on missing or invalid Bearer tokens across all endpoints |
| **TD-DB-EXP-01** | *Exploratory / Resilience* | §4.4 Error Resilience | AD-14, AD-16 | UI / API Dashboard Shell | Bob / Dave | **P3** | `TECH` / 1 | Integration | Partial widget failure (404/500) renders error state in shell without crashing page |

---

## Requirement Coverage Analysis

### 1. PRD Functional Coverage (§4.4)
- **§4.4.1 Unit Manager Dashboard:** Covered by `DB-PR-01`, `DB-WG-01`, `DB-WG-03`, `DB-WG-04`.
- **§4.4.2 Delivery Manager Dashboard:** Covered by `DB-PR-02`, `DB-WG-02`, `DB-WG-05`.
- **§4.4.3 Project Manager Dashboard:** Covered by `DB-PR-03`, `DB-WG-05`.
- **§4.4.4 People Partner Dashboard:** Covered by `DB-PR-04`, `DB-WG-06` (including strict exclusion of resourcing widgets).
- **Custom Dashboards:** Covered by `DB-DS-01`, `DB-DS-02`, `DB-DS-03`, `DB-DS-04`.

### 2. Architectural Invariants Coverage (AD-14..AD-19)
- **AD-14 (One engine, not four pages):** Verified by `DB-DS-01`, `DB-PR-01`..`04`.
- **AD-15 (Data model - Dashboard & Widget):** Verified by `DB-DS-01`, `DB-DS-02`, `DB-DS-03`, `DB-DS-04`.
- **AD-16 (Extensible code-based widget registry):** Verified by `DB-WG-07`.
- **AD-17 (Per-widget data fetching & AccessControl tier boundaries):** Verified by `DB-DS-01`, `DB-AU-03`, `DB-WG-01`..`06`.
- **AD-18 (Role presets):** Verified by `DB-PR-01`..`04`.
- **AD-19 (Temporary auth mock strategy):** Verified by `DB-AU-01`..`05`.

---

## Gap Analysis & Verification Gate Sign-Off

- **Stage-1 Scenario Approval:** All 20 scenarios validated against `docs/architecture/dashboards.md` and `docs/project-requirements.md`.
- **Stage-2 Ready:** Every scenario has unambiguous Given/When/Then steps, input URLs, JSON request headers/bodies, and expected HTTP status codes.
- **Zero Gaps Certified:** Ready for immediate Stage-2 E2E Playwright test implementation.
