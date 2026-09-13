# Frontend — Dashboards Flow (`dashboards/`)

**Trace:** `SPEC-dashboards` · `PMC-E2-S2.1` (Story 2.1) · `PMC-E2-S2.2` (Story 2.2) · `PMC-E2-S2.3` (Story 2.3) · `dashboard-api-contract.md`

## Overview

This directory contains Stage-1 behavioural scenario contracts for the People Management Dashboards (Unit Manager preset in Story 2.1).

The frontend scenarios consume the agreed application read-model contract (`UnitManagerDashboardReadModel`, `IDashboardDataSource`) defined in `_bmad-output/specs/spec-dashboards/dashboard-api-contract.md`. They decouple UI presentation, access evaluation, skeleton loading, and tier projection from backend HTTP transport decisions (`OQ-DASH-ROUTE-01`, `OQ-DASH-DTO-01`, `OQ-PERM-01`).

## Scenarios (Story 2.1 / PMC-E2-S2.1)

| Scenario ID | Title | File | Focus |
|---|---|---|---|
| `FE-DASH-01` | Unit Manager dashboard populated state | [`fe-dash-01-unit-manager-populated-dashboard-default-load.md`](fe-dash-01-unit-manager-populated-dashboard-default-load.md) | Default load, `.pghd` band, `.prov` tag, `.wscope` footers, headcount, people table, navigation shortcuts |
| `FE-DASH-02` | Dashboard loading state | [`fe-dash-02-dashboard-loading-state-with-skeleton-placeholders.md`](fe-dash-02-dashboard-loading-state-with-skeleton-placeholders.md) | `Skeleton` placeholders matching widget and table layout, no fake numeric values |
| `FE-DASH-03` | Legitimate zero headcount and empty scope | [`fe-dash-03-legitimate-zero-headcount-and-empty-scope.md`](fe-dash-03-legitimate-zero-headcount-and-empty-scope.md) | Available measured `0` in `{typography.data-stat}` mono with `.wscope` footer, `.emptyst` empty state |
| `FE-DASH-04` | Scope correctness | [`fe-dash-04-scope-correctness-reporting-line-isolation.md`](fe-dash-04-scope-correctness-reporting-line-isolation.md) | Transitive Reporting-line scoping, faithful rendering of supplied rows, no client-side fabrication; traversal computation deferred to backend |
| `FE-DASH-05` | Active headcount filtering | [`fe-dash-05-active-headcount-filtering-excludes-dismissed-and-due.md`](fe-dash-05-active-headcount-filtering-excludes-dismissed-and-due.md) | Active headcount rendering, exclusion of dismissed (`EmploymentStatus = 'dismissed'`), inactive (`isActive = false`), and request-time due departures (`dueAt <= now()`) deferred to backend aggregation |
| `FE-DASH-06` | Tier-safe people table rendering | [`fe-dash-06-tier-safe-people-table-and-unavailable-columns.md`](fe-dash-06-tier-safe-people-table-and-unavailable-columns.md) | Shared row projection delegation, explicit unavailable column states or omission for uncovered sources (`project`, `leaveStatus`, `riskLevel`), never silently blank |
| `FE-DASH-07` | Dashboard access denial | [`fe-dash-07-dashboard-access-denial-fail-closed.md`](fe-dash-07-dashboard-access-denial-fail-closed.md) | Fail-closed access denial when dashboard-view functional permission is missing, global unauthenticated handler triggered on 401 |
| `FE-DASH-08` | Preset navigation and accessibility | [`fe-dash-08-preset-navigation-keyboard-motion-and-no-customization.md`](fe-dash-08-preset-navigation-keyboard-motion-and-no-customization.md) | Unit Manager preset tab, keyboard/arrow-key navigation, `prefers-reduced-motion`, no customize affordances |

## Test Suite Counterpart

These scenarios map to the Playwright E2E suite at `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`.
Mocks operate at the data-source / network layer using typed helpers, asserting user-visible behaviors and accessibility semantics without depending on live backend HTTP endpoints.
