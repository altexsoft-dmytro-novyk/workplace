# FE-DASH-11 · Multi-widget coexistence and independent slot metadata isolation

**Trace:** `PMC-E2-S2.2` · `CAP-2` · `SD-2` · `PM-FR-19` · `dashboard-api-contract.md §2.1, §6.1, §6.2`

## Scenario

**Given** a Unit Manager dashboard containing a mixture of available widgets (`headcount`, `peopleTable`) and all five approved unavailable widget slots (`riskCounts`, `unitActionItems`, `myActionItems`, `resourcingRequests`, `openCampaigns`).

**When** the dashboard renders.

**Then** all available and unavailable widgets coexist cleanly in the dashboard layout grid; each of the five unavailable slot cards resolves and renders strictly from its own dedicated read-model property (`widgets.riskCounts`, `widgets.unitActionItems`, `widgets.myActionItems`, `widgets.resourcingRequests`, `widgets.openCampaigns`); each card displays the metadata actually supplied by its corresponding property; metadata from one property is not accidentally substituted or leaked into another property; two properties (such as `unitActionItems` and `myActionItems` from `PM-FR-19`) are permitted to contain identical metadata when the read model legitimately supplies identical capability and reason values without requiring artificial textual uniqueness.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `UnitManagerDashboardReadModel` via `IDashboardDataSource`:
- **Multi-Widget Coexistence:** The UI renders the active headcount widget, the navigation shortcuts panel, all five unavailable slot cards, and the tier-projected people table simultaneously in the dashboard grid.
- **Dedicated Property-to-Slot Mapping:** The UI maps each slot (`riskCounts`, `unitActionItems`, `myActionItems`, `resourcingRequests`, `openCampaigns`) to its designated card container based on slot identity.
- **Property Isolation & Integrity:** Assertions verify that each slot card displays the metadata supplied by its corresponding fixture property, without cross-slot substitution. Two slots with identical source FRs (e.g. `unitActionItems` and `myActionItems` both derived from `PM-FR-19`) legitimately display identical capability name and reason text as supplied by the read model, while distinct slots (`riskCounts`, `resourcingRequests`, `openCampaigns`) display their respective distinct metadata.

### 2. Deferred Backend / Composer Verification
A frontend test using `IDashboardDataSource` cannot prove how the backend composer orchestrates calls to independent domain services.
- Independent querying of domain contexts and isolated construction of each `UnavailableWidgetState` property in `widgets` remain a **backend/composer verification responsibility**.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- renders all five unavailable widget slots coexisting alongside available headcount and people table widgets
- each unavailable widget slot renders from its own dedicated read-model property
- displays metadata supplied by each corresponding property without cross-slot substitution (allowing identical metadata where legitimately shared, such as PM-FR-19 action items)

**Preconditions:** The client consumes `UnitManagerDashboardReadModel` through `IDashboardDataSource`. Assertions verify that available widgets render with their active data/counts while all five unavailable slots simultaneously display their individual unavailable cards mapped faithfully to their respective read-model properties.
