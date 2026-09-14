# Frontend — Dashboards Flow (`dashboards/`)

**Trace:** `SPEC-dashboards` · `PMC-E2-S2.1` (Story 2.1) · `PMC-E2-S2.2` (Story 2.2) · `PMC-E2-S2.3` (Story 2.3) · `dashboard-api-contract.md`

## Overview

This directory contains Stage-1 behavioural scenario contracts for the People Management Dashboards (Unit Manager preset in Story 2.1, explicit unavailable widget states in Story 2.2, and People Partner preset in Story 2.3).

The frontend scenarios consume the agreed application read-model contracts (`UnitManagerDashboardReadModel`, `PeoplePartnerDashboardReadModel`, `IDashboardDataSource`) defined in `_bmad-output/specs/spec-dashboards/dashboard-api-contract.md`. They decouple UI presentation, access evaluation, skeleton loading, tier projection, preset switching, and explicit availability rendering from backend HTTP transport decisions (`OQ-DASH-ROUTE-01`, `OQ-DASH-DTO-01`, `OQ-PERM-01`).

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

## Scenarios (Story 2.2 / PMC-E2-S2.2)

| Scenario ID | Title | File | Focus |
|---|---|---|---|
| `FE-DASH-09` | Explicit unavailable widget slots | [`fe-dash-09-explicit-unavailable-widget-slots-with-missing-capability-messaging.md`](fe-dash-09-explicit-unavailable-widget-slots-with-missing-capability-messaging.md) | Explicit unavailable cards for uncovered slots (`PM-FR-21`, `PM-FR-19`, `PM-FR-23`, `PM-FR-20`) with permission-literate copy naming missing capability and explanation |
| `FE-DASH-10` | Prevention of fake representations | [`fe-dash-10-prevention-of-fake-zero-dashes-or-fabricated-data-in-unavailable-slots.md`](fe-dash-10-prevention-of-fake-zero-dashes-or-fabricated-data-in-unavailable-slots.md) | Strict prevention of numeric `0`, dashes `—`, blank containers, chart visualization DOM, fake risk chips, mock trend arrows, or synthetic placeholder data in unavailable slots (decorative/status icons permitted) |
| `FE-DASH-11` | Multi-widget coexistence and slot isolation | [`fe-dash-11-independent-slot-availability-and-multi-widget-coexistence.md`](fe-dash-11-independent-slot-availability-and-multi-widget-coexistence.md) | Coexistence of available and all five approved unavailable widgets; independent slot metadata rendering; no cross-slot corruption |
| `FE-DASH-12` | State disambiguation | [`fe-dash-12-state-disambiguation-unavailable-vs-zero-emptyst-loading-and-denial.md`](fe-dash-12-state-disambiguation-unavailable-vs-zero-emptyst-loading-and-denial.md) | Strict visual and semantic separation across unavailable source, legitimate measured zero (`data-stat` mono + `.wscope`), empty reporting scope (`.emptyst`), loading (`Skeleton`), and access denial (`AccessDeniedPanel`), reusing existing Story 2.1 tests for baseline behavior |
| `FE-DASH-13` | Unavailable card semantics and layout | [`fe-dash-13-unavailable-widget-card-semantics-accessibility-and-layout.md`](fe-dash-13-unavailable-widget-card-semantics-accessibility-and-layout.md) | Accessible headings and screen-reader readable text, responsive grid stability, keyboard navigation without focus traps, and absence of card-level customization affordances |

## Scenarios (Story 2.3 / PMC-E2-S2.3)

| Scenario ID | Title | File | Focus |
|---|---|---|---|
| `FE-DASH-14` | People Partner populated dashboard state | [`fe-dash-14-people-partner-populated-dashboard-default-load.md`](fe-dash-14-people-partner-populated-dashboard-default-load.md) | Direct PP caseload scope, `.pghd` band, `.prov` tag, `.wscope` footers (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`), headcount, people table, PP navigation shortcuts, HR widgets |
| `FE-DASH-15` | Complete absence of resourcing by construction | [`fe-dash-15-people-partner-dashboard-absence-of-resourcing-by-construction.md`](fe-dash-15-people-partner-dashboard-absence-of-resourcing-by-construction.md) | Strict absence of resourcing widget, slot, counter, card, or placeholder; navigation shortcuts omit resourcing URL |
| `FE-DASH-16` | Scope isolation vs reporting lines | [`fe-dash-16-people-partner-scope-isolation-and-non-merging-with-reporting-line.md`](fe-dash-16-people-partner-scope-isolation-and-non-merging-with-reporting-line.md) | Direct PP assignment caseload isolation; strictly excludes and does not merge reporting-line direct reports; scope not inferred from UM relationships or titles |
| `FE-DASH-17` | Multi-preset navigation & switching | [`fe-dash-17-dashboard-preset-navigation-multi-preset-switching-and-permission-visibility.md`](fe-dash-17-dashboard-preset-navigation-multi-preset-switching-and-permission-visibility.md) | Unit Manager / People Partner multi-preset switching, independent UM and PP read-model rendering, ARIA tab semantics, and keyboard navigation. While product requirements require unauthorized presets to ultimately be omitted, dynamic pre-flight preset omission based on held permissions is blocked/deferred for Stage 2 because the frontend currently has no canonical permission/preset-discovery source (Stage 2 must not invent a fake permission API, session permission claim, or ad-hoc read-model permission field). |
| `FE-DASH-18` | People Partner explicit unavailable HR widgets | [`fe-dash-18-people-partner-explicit-unavailable-hr-widgets.md`](fe-dash-18-people-partner-explicit-unavailable-hr-widgets.md) | Explicit unavailable cards for PP slots (`riskCounts`, `assignedActionItems`, `cdsMilestones`, `campaignCompletion`, `incompleteProfiles` if unavailable) in permission-literate register; no fake data |
| `FE-DASH-19` | PP measured zero, empty caseload, skeletons & errors | [`fe-dash-19-people-partner-legitimate-zero-headcount-empty-scope-and-loading-error-states.md`](fe-dash-19-people-partner-legitimate-zero-headcount-empty-scope-and-loading-error-states.md) | Measured `0` in mono with `.wscope`, `.emptyst` for empty caseload, PP skeleton layout (no resourcing slot), fail-closed 403 denial, 401 redirect |
| `FE-DASH-20` | Grouping dimension boundary & accessibility | [`fe-dash-20-people-partner-grouping-dimension-boundary-accessibility-and-reduced-motion.md`](fe-dash-20-people-partner-grouping-dimension-boundary-accessibility-and-reduced-motion.md) | People grouping active, Department grouping strictly gated (Story 2.4), keyboard navigation, reduced motion, no customization controls |

## Test Suite Counterpart

These scenarios map to the Playwright E2E suite at `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`.
Mocks operate at the application data-source boundary (`IDashboardDataSource` / `MockDashboardDataSource`), asserting user-visible behaviors and accessibility semantics through typed read models without depending on or implying concrete backend HTTP routes (`OQ-DASH-ROUTE-01`) or transport DTOs (`OQ-DASH-DTO-01`).
