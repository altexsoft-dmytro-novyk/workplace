---
title: 'Unit Manager Dashboard — Scope, Headcount, and People Table'
type: 'feature'
created: '2026-09-13'
status: 'ready-for-dev'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-dashboards/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-dashboards/dashboard-api-contract.md'
  - '{project-root}/_bmad-output/specs/spec-dashboards/stories.yaml'
  - '{project-root}/docs/architecture/dashboards.md'
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/testing-strategy.md'
  - '{project-root}/docs/test-cases/frontend/dashboards/README.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A Unit Manager currently lacks a consolidated, people-grouped operational dashboard starting point scoped to their live Reporting-line direct reports. Navigating team rosters and headcount requires manual search, risks exposing unentitled employee data or fabricating missing capability states, and fails to declare the underlying authorization policies behind displayed figures.

**Approach:** Deliver Stage-1 behavioural scenario contracts and the frontend data-source boundary for the Unit Manager dashboard (PMC-E2-S2.1 / CAP-1). The dashboard consumes the agreed `UnitManagerDashboardReadModel` application contract via `IDashboardDataSource`, rendering live Reporting-line headcount (excluding dismissed, inactive, and request-time due departures), tier-projected people table rows from Epic 1's shared read model, `.pghd` band with `.prov` tag, and `.wscope` footers stating evaluated access policies. Frontend verification is decoupled from backend HTTP transport routes (`OQ-DASH-ROUTE-01`, `OQ-DASH-DTO-01`) and default permission grants (`OQ-PERM-01`).

## Boundaries & Constraints

**Always:**
- Frontend scenarios consume the agreed domain read model (`UnitManagerDashboardReadModel`) via `IDashboardDataSource`; do not require a live backend HTTP server.
- Scope resolves live through AccessControl audience resolution over transitive `Relationship type='direct'`; scope is NEVER inferred merely from holding a Unit Manager functional role or position title (PM/AD-9, PM/AD-10, PM/AD-33). Frontend Stage-2 tests assert faithful rendering of supplied rows, provenance labels, and absence of client-side employee fabrication; the actual correctness of graph traversal and AccessControl audience resolution is a backend/composer verification responsibility.
- Headcount counts strictly active employees in scope, excluding `dismissed` employees (`EmploymentStatus = 'dismissed'`), inactive users (`isActive = false`), and request-time due departures (`dueAt <= now()`) (PM/AD-16, PM/AD-20, PM/AD-22). Frontend Stage-2 tests assert faithful rendering of the supplied count; the aggregation/filtering computation is a backend/composer verification responsibility.
- Headcount value is rendered in `{typography.data-stat}` mono font with `.wscope` footer (`SCOPE: REPORTING_LINE`).
- A legitimate measured zero is rendered as `0` in `{typography.data-stat}` mono with `.wscope` footer; an empty scope renders the `.emptyst` empty state (`{components.empty-state}`). Zero is NEVER treated as unavailable or suppressed as `—`.
- People table delegates to Epic 1's shared row read model (`DashboardPersonRow`), projected per target tier; leak verification delegates to Epic 1's projection-level negative matrix.
- Columns with uncovered source FRs (`project` PM-FR-37, `leaveStatus` PM-FR-36, `riskLevel` PM-FR-21) are rendered with explicit unavailable indicators OR omitted per contract; they must NEVER be rendered as silently blank cells or fabricated mock values.
- Chrome uses Epic 1's `.pghd` band with eyebrow `WORKSPACE / DASHBOARDS`, `{colors.stretch-blue}` accent tick, and `.prov` tag (`SCOPE RESOLVED LIVE PER REQUEST`).
- Preset tab strip in this story contains the Unit Manager preset only; Delivery Manager and Project Manager presets are absent (Epic 3); tab strip is arrow-key navigable; grouping dimension displays People active.
- When loading, layout-matching `Skeleton` placeholders render; no fake numeric values or NaN flash.
- When `prefers-reduced-motion: reduce` is active, all transitions and animations are disabled.
- Customization affordances (customize mode, widget catalog, drag/remove handles, custom dashboard tabs) are absent by construction (PM/AD-33, SD-1).
- Authorization fails closed: access without the dashboard-view permission results in an access-denied state without relationship-derived fallback; an unauthenticated 401 response triggers the application's global unauthenticated redirect handler.

**Ask First:**
- Any proposed change that alters the `UnitManagerDashboardReadModel` or `IDashboardDataSource` interface signatures defined in `dashboard-api-contract.md`.

**Never:**
- No test code or production code written in Stage 1.
- Do not invent or resolve concrete REST endpoint paths (`OQ-DASH-ROUTE-01`).
- Do not invent or resolve concrete HTTP wire transport DTO shapes or envelopes (`OQ-DASH-DTO-01`).
- Do not seed, invent, or resolve unconfirmed default role-to-permission grants (`OQ-PERM-01`).
- Do not implement or author scenarios for Story 2.2 (full slot degradation engine), Story 2.3 (People Partner dashboard), or Story 2.4 (Department grouping).
- Do not introduce generic dashboard engines, customizable widgets, or drag-and-drop frameworks (PM/AD-33, SD-1).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| `FE-DASH-01` | Authenticated UM with direct/transitive reports & dashboard permission | UM preset opens; `.pghd` band + `.prov` tag rendered; active headcount in mono with `.wscope`; people table with scoped rows & `.wscope`; navigation shortcuts; People grouping active | N/A |
| `FE-DASH-02` | Dashboard query in pending / loading state | Layout-matching `Skeleton` placeholders render across widgets and table; no raw numbers or NaN displayed | N/A |
| `FE-DASH-03` | UM with 0 reporting-line employees | Headcount displays `0` in `{typography.data-stat}` mono with `.wscope`; people table renders `.emptyst` empty state; zero is not marked unavailable | N/A |
| `FE-DASH-04` | Mixed organization (direct reports, transitive reports, peers, unrelated staff) | Headcount and table contain ONLY direct & transitive reporting line; peers and other branches excluded; role title does not grant scope; frontend renders supplied rows without fabrication (traversal computation deferred to backend) | N/A |
| `FE-DASH-05` | Reporting line includes dismissed (`EmploymentStatus = 'dismissed'`), inactive (`isActive = false`), and due departure (`dueAt <= now()`) | Active headcount metric faithfully rendered in data-stat mono with `.wscope` footer (dismissed, inactive, and due departures excluded by backend aggregation) | N/A |
| `FE-DASH-06` | People table row assembly with uncovered columns (`project`, `leaveStatus`, `riskLevel`) | Scoped rows rendered with tier-projected fields; uncovered columns display explicit unavailable indicators or are omitted; no silent blanks or mock data | N/A |
| `FE-DASH-07` | Requester lacks dashboard-view permission OR is unauthenticated | Missing permission renders fail-closed access-denied state; unauthenticated (`401`) triggers global unauthenticated redirect handler | Fail-closed denial / redirect |
| `FE-DASH-08` | Accessibility settings & navigation interactions | Preset tab strip contains UM preset only (arrow-key navigable); People grouping active; `prefers-reduced-motion` disables animations; no customize controls exist | N/A |

</frozen-after-approval>

## Code Map

Read-only anchors — no code is written during Stage 1:

- `_bmad-output/specs/spec-dashboards/SPEC.md` -- Canonical specification for dashboards bounded context.
- `_bmad-output/specs/spec-dashboards/dashboard-api-contract.md` -- Domain read models (`UnitManagerDashboardReadModel`), widget availability states, and `IDashboardDataSource` interface.
- `docs/architecture/dashboards.md` -- PM/AD-33 binding architectural rules (fixed read models, no generic engine, pre-aggregation authz).
- `docs/architecture/access-control.md` -- AccessControl facade authorization rules (`isAllowed`, `resolveAudiences`).
- `docs/test-cases/frontend/dashboards/` -- Stage-1 scenario contracts (`FE-DASH-01` through `FE-DASH-08` + `README.md`).
- `services/frontend/src/` -- Target frontend client (React 19 + TypeScript + TanStack Query + Tailwind CSS).
- `services/frontend/e2e/flows/dashboards/` -- Future Stage-2 Playwright E2E suite location.

## Tasks & Acceptance

**Execution (prose & scenario contracts only):**
- [x] `docs/test-cases/frontend/dashboards/fe-dash-01-unit-manager-populated-dashboard-default-load.md` -- Author Stage-1 scenario for populated UM dashboard state (`FE-DASH-01`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-02-dashboard-loading-state-with-skeleton-placeholders.md` -- Author Stage-1 scenario for dashboard loading & skeleton state (`FE-DASH-02`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-03-legitimate-zero-headcount-and-empty-scope.md` -- Author Stage-1 scenario for legitimate measured zero & empty scope (`FE-DASH-03`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-04-scope-correctness-reporting-line-isolation.md` -- Author Stage-1 scenario for reporting-line audience isolation (`FE-DASH-04`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-05-active-headcount-filtering-excludes-dismissed-and-due.md` -- Author Stage-1 scenario for active headcount filtering (`FE-DASH-05`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-06-tier-safe-people-table-and-unavailable-columns.md` -- Author Stage-1 scenario for tier-safe people table & unavailable/omitted columns (`FE-DASH-06`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-07-dashboard-access-denial-fail-closed.md` -- Author Stage-1 scenario for fail-closed access denial and 401 unauthenticated redirect (`FE-DASH-07`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-08-preset-navigation-keyboard-motion-and-no-customization.md` -- Author Stage-1 scenario for preset navigation, keyboard/motion accessibility, and exclusion of customization (`FE-DASH-08`).
- [x] `docs/test-cases/frontend/dashboards/README.md` -- Author flow index and overview for dashboards Stage-1 scenarios.
- [x] `docs/test-cases/frontend/README.md` -- Update frontend flows directory table to include `dashboards/`.

**Acceptance Criteria:**
- Given the approved `SPEC.md` and `dashboard-api-contract.md`, when the Stage-1 scenario package is inspected, then `FE-DASH-01` through `FE-DASH-08` exist and adhere to the frontend behavioural scenario conventions.
- Given `FE-DASH-01`, when evaluated, then it covers default load in Unit Manager preset, `.pghd` band, `.prov` tag, active headcount in `{typography.data-stat}` mono with `.wscope` footer, people table with `.wscope` footer, and navigation shortcuts.
- Given `FE-DASH-02`, when evaluated, then it asserts layout-matching `Skeleton` placeholders without displaying fake numeric values or NaN.
- Given `FE-DASH-03`, when evaluated, then a measured zero headcount displays as `0` in mono typography with `.wscope` footer and empty scope displays `.emptyst`, distinct from unavailable widget states.
- Given `FE-DASH-04`, when evaluated, then only transitive reporting-line employees appear in scope, peers and unrelated employees are excluded, scope is never inferred from holding a role, the frontend faithfully renders supplied rows without client-side fabrication, and graph traversal correctness is separated as a backend/composer responsibility.
- Given `FE-DASH-05`, when evaluated, then the UI faithfully renders the active headcount supplied by the read model, and the active filtering logic (excluding dismissed, inactive, and request-time due departure employees) is separated as a backend/composer aggregation responsibility.
- Given `FE-DASH-06`, when evaluated, then people table rows delegate projection to Epic 1 shared read model and uncovered columns (`project`, `leaveStatus`, `riskLevel`) display explicit unavailable indicators or are omitted without silent blanks or mock values.
- Given `FE-DASH-07`, when evaluated, then absence of dashboard-view permission results in fail-closed access denial, and an unauthenticated 401 response triggers the application global unauthenticated redirect handler.
- Given `FE-DASH-08`, when evaluated, then preset tab strip contains Unit Manager preset only (arrow-key navigable), People grouping is active, `prefers-reduced-motion` disables animations, and customize affordances are absent.
- Given the Stage-1 dispatch constraints, when completed, then no test code, no production code, and no REST wire transport or unapproved permission grants were written or resolved.

## Spec Change Log

_None._

## Design Notes

### Decoupled Data-Source Boundary
Frontend UI components interact exclusively with the abstract `IDashboardDataSource` interface:
```ts
export interface IDashboardDataSource {
  getUnitManagerDashboard(): Promise<UnitManagerDashboardReadModel>;
  getPeoplePartnerDashboard(): Promise<PeoplePartnerDashboardReadModel>;
}
```
This enables full frontend implementation, mock data binding, and Playwright behavioural verification without depending on unresolved backend HTTP routes (`OQ-DASH-ROUTE-01`) or response envelope wire formats (`OQ-DASH-DTO-01`).

### Unresolved Decisions Preserved
- `OQ-PERM-01`: Default functional-role permission grants remain unseeded and fail-closed.
- `OQ-DASH-ROUTE-01`: Concrete REST route paths remain pending transport specification.
- `OQ-DASH-DTO-01`: Concrete wire transport DTO shapes and response envelopes remain pending transport specification.

## Verification

No build/test/lint commands apply — the deliverable is prose and scenario specification.

**Manual checks:**
- `docs/test-cases/frontend/dashboards/fe-dash-01`..`08.md` and `README.md` exist and conform to the frontend scenario specification format.
- Every acceptance criterion of canonical story `PMC-E2-S2.1` is covered.
- `git status` verifies no test code, no production code, and no backend files were modified.
