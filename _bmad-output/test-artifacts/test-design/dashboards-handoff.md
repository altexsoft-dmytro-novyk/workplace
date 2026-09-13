---
title: 'TEA Test Design → BMAD Handoff Document (Dashboards & Widget Engine)'
version: '1.0'
workflowType: 'testarch-test-design-handoff'
sourceWorkflow: 'testarch-test-design'
generatedBy: 'TEA Master Test Architect'
generatedAt: '2026-08-25'
projectName: 'people management'
status: 'approved'
---

# TEA → BMAD Integration Handoff: Dashboards & Widget Engine

## Purpose

Bridges the TEA test design for the **Dashboards & Widget Engine** (`dashboards` bounded context) with BMAD epic/story decomposition and downstream ATDD/automation workflows. Formalizes test coverage, risk classifications, quality gates, and scenario mappings before writing stage-2 E2E code.

---

## TEA Artifacts Inventory

| Artifact | Path | BMAD Integration Point |
| --- | --- | --- |
| **Architecture Test Design** | `_bmad-output/test-artifacts/test-design-architecture-dashboards.md` | Architectural risks, scoped engineering gates, ASRs, and NFRs for backend/platform stories |
| **QA Test Design** | `_bmad-output/test-artifacts/test-design-qa-dashboards.md` | Test execution recipe, P0–P3 test distribution, tooling setup, and acceptance criteria |
| **Traceability Matrix** | `_bmad-output/test-artifacts/traceability/dashboards-traceability-matrix.md` | Requirements-to-scenario traceability mapping covering all 20 stage-1 scenario files |
| **Validation Report** | `_bmad-output/test-artifacts/test-design-validation-report-dashboards.md` | Checklist validation and quality compliance verification |
| **Progress Checkpoint** | `_bmad-output/test-artifacts/test-design-progress-dashboards.md` | TEA workflow execution state |

---

## Epic & Feature-Level Integration Guidance

### Quality Gates per Feature Domain

| Feature Domain | P0 Quality Gates (Must Pass Before Merge) | Scoped Engineering Gates & Approved Invariants |
| --- | --- | --- |
| **Authentication & Permissions** | `DB-AU-01`, `DB-AU-02`, `DB-AU-03`, `DB-AU-05` | Rejection with `401 Unauthorized` on missing/invalid token across `/api/dashboards` and all `/api/widgets/:type/data`. Rejection with `403 Forbidden` for users lacking `view-dashboard` permission (`DB-AU-05`). |
| **Dashboard CRUD & User Isolation** | `DB-DS-04` | Multi-user isolation: Bob's custom dashboards are never returned in Paula's dashboard list. `GET /api/dashboards` returns structure only without embedded business data (`DB-DS-01`). |
| **Role Presets** | `DB-PR-04` | 4 role presets (`unit-manager`, `delivery-manager`, `project-manager`, `people-partner`) seeded per AD-18. People Partner preset strictly excludes `my-resourcing-requests` (`DB-PR-04`). |
| **Widget Data Providers & Tier Scoping** | `DB-WG-03` | Data providers evaluate viewer's computed access tier through `AccessControl` facade (AD-9..AD-12). Bob sees subordinate Alice; unrelated peer Colin is strictly absent (`DB-WG-03`). Unknown widget types return `404 Not Found` (`DB-WG-07`). |

---

## Story-Level Acceptance Criteria Mapping

| Story / Scenario Group | Stage-1 Scenarios to Implement | Required Acceptance Criteria & Invariants |
| --- | --- | --- |
| **Auth & Permission Guards** | `DB-AU-01`..`DB-AU-05` | Global 401 on empty auth token; 403 on missing `view-dashboard`; Mock HR Admin (`Bearer <token:root>`) passes via AccessControl facade (AD-19). |
| **Dashboard Retrieval & Structure** | `DB-DS-01` | Returns array of dashboards with metadata and widgets (`id`, `dashboardId`, `type`, `config`). Zero business payloads embedded. |
| **Custom Dashboard Creation** | `DB-DS-02`, `DB-DS-03` | `POST /api/dashboards` creates custom dashboard with `accessRole: null`, `createdBy: currentUserId`. Empty title returns `400 Bad Request`. |
| **Custom Dashboard Isolation** | `DB-DS-04` | Custom dashboard visible only to creator; invisible to other authenticated users. |
| **Unit Manager Preset** | `DB-PR-01`, `DB-WG-01`, `DB-WG-03`, `DB-WG-04` | `unit-manager` preset contains `summary-counters`, `people-table`, `my-action-items`, `quick-nav`. Counters accurate for reporting tree; people table bounded by tier; action items sorted ascending by due date. |
| **Delivery Manager Preset** | `DB-PR-02`, `DB-WG-02`, `DB-WG-05` | `delivery-manager` preset contains `project-selector`, `summary-counters`, `project-people-tables`, `my-resourcing-requests`, `quick-nav`. Summary counters aggregate across all managed projects by default; filterable by `?projectId=...`. Resourcing requests scoped to managed projects. |
| **Project Manager Preset** | `DB-PR-03` | `project-manager` preset contains identical widget types to DM; scoped to PM's assigned project. |
| **People Partner Preset** | `DB-PR-04`, `DB-WG-06` | `people-partner` preset strictly omits `my-resourcing-requests`. HR widgets (`incomplete-profiles`, `upcoming-cds`) scoped to assigned employees. |
| **Widget Registry & Error Handling** | `DB-WG-07` | Unregistered widget type string fails closed with `404 Not Found`. |

---

## Risk-to-Story Mapping

| Risk ID | Category | Score ($P \times I$) | Target Feature Scope | Verification Test Level |
| --- | --- | --- | --- | --- |
| **R-DB-001** | `SEC` | **9** | Widget Data Providers (`widgets/`) | E2E API (`DB-WG-03`, `DB-WG-06`) |
| **R-DB-002** | `SEC` | **6** | Role Presets (`presets/`) | E2E API (`DB-PR-04`) |
| **R-DB-003** | `SEC` | **6** | Custom Dashboards (`dashboards-crud/`) | E2E API (`DB-DS-04`) |
| **R-DB-004** | `SEC` | **6** | Auth & Permissions (`auth/`) | E2E API (`DB-AU-01..05`) |
| **R-DB-005** | `PERF` | **4** | Performance & Scale | k6 Load (`TD-DB-NFR-PERF-01`) |
| **R-DB-006** | `TECH` | **4** | AD-19 Mock Auth Seam | E2E API (`DB-AU-04`) |
| **R-DB-007** | `DATA` | **4** | Hexagonal Query Ports | Domain Port Contract Tests |
| **R-DB-008** | `TECH` | **3** | Widget Registry (`widgets/`) | E2E API (`DB-WG-07`) |
| **R-DB-009** | `BUS` | **4** | Delivery Manager Scoping | E2E API (`DB-WG-02`) |
| **R-DB-010** | `DATA` | **2** | Action Items Provider | E2E API (`DB-WG-04`) |

---

## Data-TestId Guidance for Future Frontend Implementation

When frontend dashboard UI stories (`services/frontend`) are implemented, adhere to the following naming conventions:
- `data-testid="dashboard-preset-{accessRole}"` (e.g. `dashboard-preset-unit-manager`)
- `data-testid="dashboard-custom-{id}"`
- `data-testid="widget-card-{type}"` (e.g. `widget-card-summary-counters`)
- `data-testid="widget-summary-counters-headcount"`
- `data-testid="widget-people-table-row-{userId}"`
- `data-testid="widget-action-item-{id}"`
- `data-testid="widget-resourcing-request-{id}"`
- `data-testid="project-selector-dropdown"`
