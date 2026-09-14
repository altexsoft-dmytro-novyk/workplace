---
title: 'People Partner Dashboard — PP-Assigned Scope with No Resourcing Block'
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

**Problem:** A People Partner currently lacks a dedicated operational dashboard view scoped to their direct assigned employee caseload. Without a distinct preset, HR partners risk viewing inappropriate operational scopes (such as reporting-line or project views), seeing functions irrelevant to HR roles (such as resourcing requests), or having missing HR capabilities concealed behind misleading zeroes or blank cards.

**Approach:** Deliver Stage-1 behavioural scenario contracts and frontend presentation specifications for the People Partner dashboard (PMC-E2-S2.3 / CAP-3). The dashboard consumes the agreed `PeoplePartnerDashboardReadModel` application contract via `IDashboardDataSource.getPeoplePartnerDashboard()`, rendering live direct People Partner caseload headcount, tier-projected people table rows from Epic 1's shared read model, HR-oriented widgets (`incompleteProfiles` when available, explicit unavailable states for `riskCounts`, `assignedActionItems`, `cdsMilestones`, `campaignCompletion`), `.pghd` band with `.prov` tag, `.wscope` footers stating evaluated access policies (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`) on available metrics, and multi-preset switching between Unit Manager and People Partner presets, while ensuring resourcing functionality is strictly absent by construction from the People Partner preset, Department grouping is absent from Story 2.3 controls (gated behind Story 2.4), and permission-specific preset tab filtering is documented as an implementation/test-seam gap pending a canonical frontend permission source.

## Boundaries & Constraints

**Always:**
- Frontend scenarios consume the agreed domain read model (`PeoplePartnerDashboardReadModel`) via `IDashboardDataSource`; do not require a live backend HTTP server or transport route resolution.
- Scope is strictly direct People Partner assignment (`Relationship type='people_partner'` where `reportsToUserId = viewerUserId`). Scope is NEVER inferred from reporting lines, Unit Manager relationships, delivery/project manager relationships, or functional role labels (PM/AD-9, PM/AD-10, PM/AD-19, PM/AD-33).
- Scope isolation: When a viewer holds both People Partner assignments and Reporting-line direct reports, the People Partner dashboard scopes strictly to PP-assigned employees and NEVER merges or leaks reporting-line direct reports.
- Evaluated scope metadata reflects `type: 'PEOPLE_PARTNER_ASSIGNMENT'`, `policyLabel: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT (DIRECT)'`.
- Available metrics carry `.wscope` footers displaying `SCOPE: PEOPLE_PARTNER_ASSIGNMENT` (headcount, people table, and available `incompleteProfiles`). Unavailable HR widget cards follow Story 2.2 rules (`missingCapability` + `unavailableReason`) and do NOT render `.wscope` footers.
- Resourcing is ABSENT BY CONSTRUCTION from the People Partner preset: Within the People Partner preset container, no resourcing widget, slot, counter, card, or placeholder exists (PM/AD-33, PRD §4.5, FR-18). It is neither rendered as available, unavailable, zero, blank, nor disabled placeholder. PP navigation shortcuts contain `departuresUrl` and omit `resourcingUrl`. Absence assertions are scoped strictly to the PP preset container; unrelated sidebar navigation or inactive UM markup must not cause false failures.
- Headcount counts strictly active employees in the direct PP caseload, excluding `dismissed` employees (`EmploymentStatus = 'dismissed'`), inactive users (`isActive = false`), and request-time due departures (`dueAt <= now()`) (PM/AD-16, PM/AD-20, PM/AD-22). Frontend Stage-2 tests assert faithful rendering of the supplied count; the aggregation/filtering computation is a backend/composer verification responsibility.
- A legitimate measured zero displays as `0` in `{typography.data-stat}` mono font with `.wscope` footer (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`); an empty caseload scope renders the `.emptyst` empty-state component (`{components.empty-state}`). Zero is NEVER treated as unavailable or suppressed as `—`.
- People table delegates to Epic 1's shared row read model (`DashboardPersonRow`), projected per target tier (`tier: 'pp'`); leak verification delegates to Epic 1's projection-level negative matrix.
- People table uncovered columns (`project` PM-FR-37, `leaveStatus` PM-FR-36, `riskLevel` PM-FR-21) display explicit unavailable indicators or are omitted; never silently blank.
- HR widgets follow Story 2.2 availability rules: `incompleteProfiles` displays count in mono with `.wscope` when available or explicit unavailable card when unavailable; uncovered slots (`riskCounts` PM-FR-21, `assignedActionItems` PM-FR-19, `cdsMilestones` PM-FR-30, `campaignCompletion` PM-FR-20) render explicit unavailable cards naming the missing capability and plain explanation in permission-literate register without apologetic or motivational filler.
- Preset tab strip supports multi-preset switching: Unit Manager and People Partner presets are accessible and navigable via arrow keys; selecting People Partner renders `PeoplePartnerDashboardReadModel` while selecting Unit Manager renders `UnitManagerDashboardReadModel` preserving Story 2.1/2.2 behavior. (Dynamic client-side tab filtering based on pre-flight permissions is blocked for Stage 2 as an implementation/test-seam gap pending a canonical frontend permission source).
- Grouping dimension control displays People grouping active. Department grouping is absent from the interactive Story 2.3 control (gated behind Story 2.4 / `DEPARTMENT-EDGE` and `PM/AD-35`); no disabled department placeholder or mock tree is rendered.
- Page header uses `.pghd` band with eyebrow `WORKSPACE / DASHBOARDS`, `{colors.stretch-blue}` accent tick, and `.prov` tag (`SCOPE RESOLVED LIVE PER REQUEST`).
- Loading state renders layout-matching `Skeleton` placeholders conforming to the PP layout (without resourcing block); accessibility reuses existing green baseline evidence from `FE-DASH-08` (reduced motion, customization exclusion) and `FE-DASH-13` (unavailable card semantics), adding new verification for multi-preset tab switching (`FE-DASH-17`).
- Authorization fails closed: missing dashboard permission renders `AccessDeniedPanel`; unauthenticated 401 triggers the application global unauthenticated redirect handler.

**Ask First:**
- Any proposed change that alters the `PeoplePartnerDashboardReadModel` or `IDashboardDataSource` interface signatures defined in `dashboard-api-contract.md`.

**Never:**
- No test code or production code written in Stage 1.
- Do not invent or resolve concrete REST endpoint paths (`OQ-DASH-ROUTE-01`).
- Do not invent or resolve concrete HTTP wire transport DTO shapes or envelopes (`OQ-DASH-DTO-01`).
- Do not seed, invent, or resolve unconfirmed default role-to-permission grants (`OQ-PERM-01`).
- Do not invent a fake permission API, session claims, or ad-hoc read-model fields to simulate pre-flight permission checking.
- Do not render any resourcing block, card, slot, counter, or placeholder within the People Partner preset.
- Do not merge reporting-line employees into the People Partner scope or table.
- Do not calculate PP scope or graph traversal on the frontend.
- Do not render a disabled Department control or mock department hierarchy for Story 2.4.
- Do not create a generic dashboard or widget customization engine (PM/AD-33, SD-1).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| `FE-DASH-14` | Authenticated PP with active caseload & dashboard permission | PP preset opens; `.pghd` band + `.prov` tag; active headcount in mono with `.wscope` (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`); PP people table with `.wscope`; PP navigation shortcuts (`departuresUrl`, no resourcing); HR widgets | N/A |
| `FE-DASH-15` | People Partner dashboard preset panel inspection | Resourcing is ABSENT BY CONSTRUCTION within the PP panel: no resourcing widget, slot, counter, card, or placeholder exists; navigation shortcuts omit resourcing URL; scoped to PP panel | N/A |
| `FE-DASH-16` | User with dual scope (direct PP caseload + separate UM reporting line) | PP preset displays strictly PP-assigned employees; reporting-line direct reports are excluded and not merged; switching to UM preset shows reporting line; traversal computation deferred to backend | N/A |
| `FE-DASH-17` | Multi-preset tab navigation & switching between UM and PP | Preset tab strip enables smooth switching between UM and PP presets; selecting PP renders PP read model, selecting UM preserves Story 2.1/2.2; arrow-key navigable; pre-flight tab filtering blocked as seam gap | Fail-closed per preset |
| `FE-DASH-18` | PP read model with uncovered HR widgets (`riskCounts`, `assignedActionItems`, `cdsMilestones`, `campaignCompletion`) | Explicit unavailable cards rendered for each uncovered slot naming missing capability & plain explanation (no `.wscope` on unavailable cards); `incompleteProfiles` rendered as available data with `.wscope` or unavailable card without `.wscope` | N/A |
| `FE-DASH-19` | PP with 0 caseload employees, loading state, or missing permission / unauthenticated | Measured 0 displays `0` in data-stat mono with `.wscope`; empty caseload renders `.emptyst`; loading renders layout-matching `Skeleton` (no resourcing slot); missing permission renders `AccessDeniedPanel`; 401 triggers global redirect | Fail-closed denial / redirect |
| `FE-DASH-20` | Grouping dimension boundary & baseline accessibility reuse | People grouping active; Department grouping absent from Story 2.3 controls (Story 2.4 gated); tab strip arrow-key navigable; reuses FE-DASH-08 / FE-DASH-13 green baseline for reduced motion and static card accessibility | N/A |

</frozen-after-approval>

## Code Map

Read-only anchors — no code is written during Stage 1:

- `_bmad-output/specs/spec-dashboards/SPEC.md` -- Canonical specification for dashboards bounded context (CAP-3).
- `_bmad-output/specs/spec-dashboards/dashboard-api-contract.md` -- Domain read models (`PeoplePartnerDashboardReadModel`, `UnitManagerDashboardReadModel`), widget availability states, and `IDashboardDataSource` interface.
- `_bmad-output/specs/spec-dashboards/stories.yaml` -- Story metadata for PMC-E2-S2.3.
- `_bmad-output/planning-artifacts/platform-capabilities/epics.md` -- Canonical acceptance criteria for PMC-E2-S2.3.
- `docs/architecture/dashboards.md` -- PM/AD-33 binding architectural rules (fixed read models, no generic engine, no resourcing for PP).
- `docs/architecture/access-control.md` -- AccessControl facade authorization rules (`isAllowed`, `resolveAudiences`).
- `docs/test-cases/frontend/dashboards/` -- Stage-1 scenario contracts (`FE-DASH-14` through `FE-DASH-20` + `README.md`).
- `services/frontend/src/` -- Target frontend client (React 19 + TypeScript + TanStack Query + Tailwind CSS).
- `services/frontend/e2e/flows/dashboards/` -- Target Stage-2 Playwright E2E suite location.

## Tasks & Acceptance

**Execution (prose & scenario contracts only):**
- [x] `docs/test-cases/frontend/dashboards/fe-dash-14-people-partner-populated-dashboard-default-load.md` -- Author Stage-1 scenario for populated PP dashboard state (`FE-DASH-14`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-15-people-partner-dashboard-absence-of-resourcing-by-construction.md` -- Author Stage-1 scenario for absolute absence of resourcing functionality by construction scoped to PP preset (`FE-DASH-15`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-16-people-partner-scope-isolation-and-non-merging-with-reporting-line.md` -- Author Stage-1 scenario for PP scope isolation and non-merging with reporting line (`FE-DASH-16`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-17-dashboard-preset-navigation-multi-preset-switching-and-permission-visibility.md` -- Author Stage-1 scenario for preset navigation, multi-preset switching, and permission boundary analysis (`FE-DASH-17`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-18-people-partner-explicit-unavailable-hr-widgets.md` -- Author Stage-1 scenario for PP-specific explicit unavailable HR widget slots and `.wscope` rules (`FE-DASH-18`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-19-people-partner-legitimate-zero-headcount-empty-scope-and-loading-error-states.md` -- Author Stage-1 scenario for measured 0 headcount, empty caseload scope, loading skeleton, and access denial (`FE-DASH-19`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-20-people-partner-grouping-dimension-boundary-accessibility-and-reduced-motion.md` -- Author Stage-1 scenario for grouping dimension boundary, department gating, and accessibility baseline reuse (`FE-DASH-20`).
- [x] `docs/test-cases/frontend/dashboards/README.md` -- Update flow index and overview for dashboards Stage-1 scenarios with Story 2.3 additions.
- [x] `docs/test-cases/frontend/README.md` -- Update frontend flows directory table to reflect `fe-dash-01…20`.

**Acceptance Criteria:**
- Given the approved `SPEC.md` and `dashboard-api-contract.md`, when the Stage-1 scenario package for Story 2.3 is inspected, then `FE-DASH-14` through `FE-DASH-20` exist and adhere to the frontend behavioural scenario conventions.
- Given `FE-DASH-14`, when evaluated, then it covers default/selected load in People Partner preset, `.pghd` band, `.prov` tag, direct PP caseload headcount in `{typography.data-stat}` mono with `.wscope` footer (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`), people table with `.wscope` footer (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`), navigation shortcuts (`departuresUrl`, no resourcing), available `incompleteProfiles` with `.wscope`, and unavailable HR cards without scope footers.
- Given `FE-DASH-15`, when evaluated, then it asserts that resourcing functionality is absent by construction from the active People Partner preset panel — no resourcing block, card, slot, counter, or placeholder exists in the PP preset contract or component tree, without false failures from unrelated application chrome.
- Given `FE-DASH-16`, when evaluated, then it asserts that PP scope is strictly direct PP assignment (`Relationship type='people_partner'`), never merges reporting-line direct reports, never infers scope from Unit Manager relationships or role titles, and frontend faithfully renders supplied rows without client-side fabrication.
- Given `FE-DASH-17`, when evaluated, then the preset tab strip supports multi-preset switching between Unit Manager and People Partner presets, selecting People Partner renders `PeoplePartnerDashboardReadModel`, selecting Unit Manager renders `UnitManagerDashboardReadModel` preserving Story 2.1/2.2 behavior, and dynamic pre-flight tab filtering is recorded as an implementation/test-seam gap pending a canonical frontend permission source.
- Given `FE-DASH-18`, when evaluated, then uncovered PP-specific widget slots (`riskCounts` PM-FR-21, `assignedActionItems` PM-FR-19, `cdsMilestones` PM-FR-30, `campaignCompletion` PM-FR-20, `incompleteProfiles` when unavailable) render explicit unavailable cards naming missing capability and explanation in permission-literate register without fake 0, dashes, blank containers, fake charts, or `.wscope` footers.
- Given `FE-DASH-19`, when evaluated, then a measured zero caseload headcount displays as `0` in data-stat mono with `.wscope` footer, empty caseload scope renders `.emptyst`, loading state renders layout-matching `Skeleton` placeholders conforming to PP layout, missing permission renders fail-closed `AccessDeniedPanel`, and 401 unauthenticated triggers global redirect handler.
- Given `FE-DASH-20`, when evaluated, then People grouping is active, Department grouping is absent from Story 2.3 controls (gated behind Story 2.4), preset tab strip and controls are arrow-key navigable, and page-level reduced motion / static card accessibility reuse existing green baseline evidence from `FE-DASH-08` and `FE-DASH-13`.
- Given the Stage-1 dispatch constraints, when completed, then no test code, no production code, and no REST wire transport or unapproved permission grants were written or resolved.

## Spec Change Log

_None._

## Design Notes

### Direct People Partner Assignment Caseload
Unlike Unit Manager scope which evaluates the transitive closure of `Relationship type='direct'`, People Partner scope resolves strictly direct assignments where `Relationship type='people_partner'` matches the viewer:
```ts
evaluatedScope: {
  type: 'PEOPLE_PARTNER_ASSIGNMENT';
  viewerUserId: string;
  targetCount: number;
  evaluatedAt: string; // ISO 8601 UTC
  policyLabel: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT (DIRECT)';
}
```

### Absence of Resourcing by Construction
A fundamental architectural invariant is that resourcing does NOT exist on the People Partner dashboard (PM/AD-33, PRD §4.5, FR-18). It is not an unavailable slot; it is completely omitted from the read model and UI tree.
In contrast, Unit Manager includes resourcing as an explicit unavailable slot (`resourcingRequests` PM-FR-23).

### Gated Department Grouping (Story 2.4)
Department grouping requires the nested Department schema (`PM/AD-35`) and `DEPARTMENT-EDGE` closure. Story 2.4 remains gated. Story 2.3 activates People grouping only, and Department grouping is absent from the interactive controls without mock placeholders or data.
