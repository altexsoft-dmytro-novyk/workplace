---
title: 'Unsourced Widget Slots Render Explicit Unavailable States'
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

**Problem:** When dashboard widget slots or table columns depend on source capabilities that are not yet implemented or connected (Risks `PM-FR-21`, Action items `PM-FR-19`, Resourcing `PM-FR-23`, Campaigns `PM-FR-20`, Projects `PM-FR-37`, Leave `PM-FR-36`), displaying `0`, `—`, blank content, or empty visualizations misleads managers into assuming there is "nothing to worry about" rather than understanding that the source capability is not implemented.

**Approach:** Deliver Stage-1 behavioural scenario contracts and frontend presentation specifications for explicit unavailable states (PMC-E2-S2.2 / CAP-2). The UI keys availability on source FR provenance (`status: 'unavailable'`) from the read model, rendering explicit unavailable cards naming what is missing in a permission-literate register without fake values (`0`, `—`, blank, or fake charts), while strictly preserving legitimate measured zeros as `0` in `{typography.data-stat}` mono with `.wscope` footer, empty reporting scopes as `.emptyst`, and maintaining responsive layout stability and accessibility without introducing a generic widget framework.

## Boundaries & Constraints

**Always:**
- Availability is provenance-based, keyed strictly on source FR implementation status (`status: 'unavailable'`), never inferred from numeric values or empty collections (SD-2, PMC-E2-S2.2).
- Unavailable slots (`riskCounts` PM-FR-21, `unitActionItems` PM-FR-19, `myActionItems` PM-FR-19, `resourcingRequests` PM-FR-23, `openCampaigns` PM-FR-20) render explicit unavailable cards naming the missing capability and reason in permission-literate register without motivational or apologetic filler. Internal requirement identifiers (`PM-FR-*`) are read-model provenance metadata (`sourceFr`) and are not required to be visible in the user interface.
- Unavailable slots never display `0`, `—`, blank content, chart visualizations / empty chart DOM, fake risk chips, mock trend arrows, or synthetic placeholder data (decorative/status icons are permitted).
- A legitimate measured zero displays as `0` in `{typography.data-stat}` mono with `.wscope` footer and is visually distinguishable from an unavailable slot.
- A legitimate empty scope renders the `.emptyst` empty-state component (`{components.empty-state}`) and is distinct from unavailable states.
- All five unavailable slots coexist within the grid alongside available Story-2.1 widgets, and each slot renders independently from its own dedicated read-model property without inventing unavailable-to-available conversions not supported by the read model.
- People table uncovered columns (`project` PM-FR-37, `leaveStatus` PM-FR-36, `riskLevel` PM-FR-21) display explicit unavailable badges or are omitted; never silently blank.
- Layout matches responsive grid and respects `prefers-reduced-motion: reduce`.
- Customization affordances (customize mode, widget catalog, drag/remove handles, custom tabs) are absent by construction (PM/AD-33, SD-1).
- Verification of availability states is demonstrable at the application data-source contract layer (`IDashboardDataSource`) without seeding unapproved permission grants (`OQ-PERM-01`).

**Ask First:**
- Any proposed change that alters the `UnitManagerDashboardReadModel`, `UnavailableWidgetState`, or `IDashboardDataSource` interface signatures defined in `dashboard-api-contract.md`.

**Never:**
- No test code or production code written in Stage 1.
- Do not infer availability from numeric values or empty collections.
- Do not convert unavailable slots into `0`, `—`, empty charts, or fabricated mock data.
- Do not invent an available widget contract for slots typed only as `UnavailableWidgetState` in `UnitManagerDashboardReadModel`.
- Do not create a generic dashboard or widget customization engine.
- Do not implement uncovered backend capabilities (PM-FR-19, PM-FR-20, PM-FR-21, PM-FR-23, PM-FR-36, PM-FR-37).
- Do not start Story 2.3 (People Partner Dashboard) or Story 2.4 (Department Grouping).
- Do not resolve `OQ-PERM-01`, `OQ-DASH-ROUTE-01`, or `OQ-DASH-DTO-01`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| `FE-DASH-09` | Populated UM dashboard with uncovered slot FRs (`PM-FR-21`, `PM-FR-19`, `PM-FR-23`, `PM-FR-20`) | Explicit unavailable cards rendered for each slot naming missing capability & reason in permission-literate register | N/A |
| `FE-DASH-10` | Unavailable widget slots inspection | No `0`, `—`, blank containers, chart visualization DOM, fake risk chips, or mock items rendered (status icons allowed) | N/A |
| `FE-DASH-11` | Coexisting available & all 5 approved unavailable widgets | All 5 unavailable slots coexist alongside headcount and people table; each renders from own slot without cross-slot metadata corruption | N/A |
| `FE-DASH-12` | Comparative evaluation of all 5 UI states (unavailable, measured 0, empty scope, loading skeleton, 403 denial) | Clear disambiguation: unavailable card != data-stat 0 != .emptyst != Skeleton != AccessDeniedPanel (reuses Story 2.1 green tests for baseline state behavior) | State-specific rendering |
| `FE-DASH-13` | Semantic accessibility, screen reader, reduced motion, grid layout | Accessible headings/labels, responsive grid stability, no keyboard trapping, motion disabled under reduced motion, no card-level customize controls | N/A |

</frozen-after-approval>

## Code Map

Read-only anchors — no code is written during Stage 1:

- `_bmad-output/specs/spec-dashboards/SPEC.md` -- Canonical specification for dashboards bounded context (CAP-2).
- `_bmad-output/specs/spec-dashboards/dashboard-api-contract.md` -- Domain read models (`UnavailableWidgetState`, `UnitManagerDashboardReadModel`), widget availability states, and `IDashboardDataSource` interface.
- `docs/architecture/dashboards.md` -- PM/AD-33 binding architectural rules (fixed read models, no generic engine).
- `docs/test-cases/frontend/dashboards/` -- Stage-1 scenario contracts (`FE-DASH-09` through `FE-DASH-13` + `README.md`).
- `services/frontend/src/` -- Target frontend client (React 19 + TypeScript + TanStack Query + Tailwind CSS).
- `services/frontend/e2e/flows/dashboards/` -- Future Stage-2 Playwright E2E suite location.

## Tasks & Acceptance

**Execution (prose & scenario contracts only):**
- [x] `docs/test-cases/frontend/dashboards/fe-dash-09-explicit-unavailable-widget-slots-with-missing-capability-messaging.md` -- Author Stage-1 scenario for explicit unavailable widget slots and missing-capability copy (`FE-DASH-09`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-10-prevention-of-fake-zero-dashes-or-fabricated-data-in-unavailable-slots.md` -- Author Stage-1 scenario for prevention of fake 0, dashes, blank space, chart visualization DOM, or mock data (`FE-DASH-10`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-11-independent-slot-availability-and-multi-widget-coexistence.md` -- Author Stage-1 scenario for multi-widget coexistence and independent slot metadata isolation (`FE-DASH-11`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-12-state-disambiguation-unavailable-vs-zero-emptyst-loading-and-denial.md` -- Author Stage-1 scenario for state disambiguation across unavailable, measured 0, empty scope, loading skeleton, and access denial, reusing Story 2.1 baseline coverage (`FE-DASH-12`).
- [x] `docs/test-cases/frontend/dashboards/fe-dash-13-unavailable-widget-card-semantics-accessibility-and-layout.md` -- Author Stage-1 scenario for unavailable widget card semantics, accessibility, layout stability, and absence of customization (`FE-DASH-13`).
- [x] `docs/test-cases/frontend/dashboards/README.md` -- Update flow index and overview for dashboards Stage-1 scenarios with Story 2.2 additions and accurate data-source boundary description.
- [x] `docs/test-cases/frontend/README.md` -- Update frontend flows directory table to reflect `fe-dash-01…13`.

**Acceptance Criteria:**
- Given the approved `SPEC.md` and `dashboard-api-contract.md`, when the Stage-1 scenario package for Story 2.2 is inspected, then `FE-DASH-09` through `FE-DASH-13` exist and adhere to the frontend behavioural scenario conventions.
- Given `FE-DASH-09`, when evaluated, then it covers rendering explicit unavailable cards for uncovered slots (`riskCounts` PM-FR-21, `unitActionItems` PM-FR-19, `myActionItems` PM-FR-19, `resourcingRequests` PM-FR-23, `openCampaigns` PM-FR-20), stating missing capability and explanation in permission-literate register without apologetic or motivational filler, without requiring internal `PM-FR-*` code strings to be rendered in the UI.
- Given `FE-DASH-10`, when evaluated, then unavailable slots never display `0`, `—`, blank content, chart visualization DOM / canvas, fake risk chips, mock trend arrows, or synthetic placeholder data, while allowing standard status/decorative icons.
- Given `FE-DASH-11`, when evaluated, then all five unavailable widget slots coexist alongside available widgets, each slot derives its rendering strictly from its own read-model property in `widgets`, and no slot borrows, leaks, or corrupts another slot's capability title or reason.
- Given `FE-DASH-12`, when evaluated, then the UI maintains strict distinction between unavailable source, legitimate measured zero (`0` in data-stat mono with `.wscope`), empty reporting scope (`.emptyst`), loading state (`Skeleton`), and access denial (`AccessDeniedPanel`), referencing existing Story 2.1 tests for baseline behavior.
- Given `FE-DASH-13`, when evaluated, then unavailable cards provide accessible headings and screen-reader readable text, maintain responsive grid layout without layout shifts, support keyboard navigation without traps, respect `prefers-reduced-motion`, and contain no card-level customization controls.
- Given the Stage-1 dispatch constraints, when completed, then no test code, no production code, and no REST wire transport or unapproved permission grants were written or resolved.

## Spec Change Log

_None._

## Design Notes

### Provenance-Based Availability
Widget availability is determined strictly by the read model's source FR metadata (`status: 'unavailable'`), never by client-side inspection of numeric values:
```ts
export interface UnavailableWidgetState {
  status: 'unavailable';
  missingCapability: string;
  sourceFr: string;
  unavailableReason: string;
}
```
This guarantees that an unavailable integration is never concealed behind misleading zeroes or blank UI cards.

### Permission-Literate Register
Unavailable copy names the missing capability and its explanation plainly:
- "Risk Tracking is unavailable — risk records are not implemented"
- "Action Items is unavailable — action item lifecycle is not implemented"
- "Resourcing is unavailable — resourcing workflow is not implemented"
- "Campaigns is unavailable — campaigns lifecycle is not implemented"
No apologetic ("We're sorry...") or motivational ("Coming soon!") text is used. Internal identifiers (`PM-FR-21`, etc.) remain in read-model metadata (`sourceFr`).

## Verification

No build/test/lint commands apply — the deliverable is prose and scenario specification.

**Manual checks:**
- `docs/test-cases/frontend/dashboards/fe-dash-09`..`13.md` and updated `README.md` exist and conform to the frontend scenario specification format.
- Every acceptance criterion of canonical story `PMC-E2-S2.2` is covered.
- `git status` verifies no test code, no production code, and no backend files were modified.
