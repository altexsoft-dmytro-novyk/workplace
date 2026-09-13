# FE-DASH-09 · Explicit unavailable state rendering for uncovered widget slots with permission-literate messaging

**Trace:** `PMC-E2-S2.2` · `CAP-2` · `SD-2` · `PM-FR-19` · `PM-FR-20` · `PM-FR-21` · `PM-FR-23` · `EXPERIENCE.md` · `dashboard-api-contract.md §2.1, §6`

## Scenario

**Given** an authenticated Unit Manager viewing their dashboard where source functional requirements for specific widget slots are uncovered:
- Risk counts (`PM-FR-21`)
- Unit open & overdue action items (`PM-FR-19`)
- Manager's own action items (`PM-FR-19`)
- Active resourcing requests (`PM-FR-23`)
- Open campaigns (`PM-FR-20`)

**When** the Unit Manager dashboard renders.

**Then** each unsourced widget slot renders an explicit unavailable card displaying the missing capability title (e.g., "Risk Tracking", "Action Items", "Resourcing", "Campaigns") and an informative reason/explanation in a permission-literate register; the user-facing copy contains no apologetic or motivational filler (e.g. no "Sorry for the inconvenience", "Coming soon!", or "We are working on this"); each unavailable card clearly and plainly informs the viewer that the underlying capability is not implemented without requiring internal PM-FR identifier strings to be visibly rendered in the UI.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `UnitManagerDashboardReadModel` via `IDashboardDataSource`:
- **Unavailable Card Rendering:** The UI renders an unavailable card/slot for each widget with `status: 'unavailable'` in `data.widgets`.
- **Missing Capability Messaging:** The UI displays the `missingCapability` name and `unavailableReason` explanation supplied by the read model.
- **Permission-Literate Copy:** Assertions verify that user-facing text uses plain, factual phrasing and excludes apologetic or cheerleading filler. (Internal requirement identifiers such as `PM-FR-21` are read-model provenance metadata in `sourceFr` and are not required to be visible in the rendered UI).

### 2. Deferred Backend / Composer Verification
A frontend test using `IDashboardDataSource` cannot prove whether backend services for risk, action items, resourcing, or campaigns actually exist or evaluate access rules.
- The actual determination of source FR availability, composer aggregation, and construction of `UnavailableWidgetState` objects (including setting `sourceFr`) remain a **backend/composer verification responsibility**.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- renders explicit unavailable card for uncovered risk counts slot (PM-FR-21)
- renders explicit unavailable card for uncovered unit action items and my action items slots (PM-FR-19)
- renders explicit unavailable card for uncovered resourcing requests slot (PM-FR-23)
- renders explicit unavailable card for uncovered open campaigns slot (PM-FR-20)
- displays missing capability name and explanation without apologetic or motivational filler

**Preconditions:** The client consumes `UnitManagerDashboardReadModel` through `IDashboardDataSource` where `widgets.riskCounts`, `widgets.unitActionItems`, `widgets.myActionItems`, `widgets.resourcingRequests`, and `widgets.openCampaigns` carry `status: 'unavailable'`. Assertions verify visible card containers, missing-capability headings, and reason copy in the DOM.
