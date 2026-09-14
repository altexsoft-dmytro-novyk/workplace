# FE-DASH-15 · People Partner dashboard complete absence of resourcing functionality by construction

**Trace:** `PMC-E2-S2.3` · `CAP-3` · PM/AD-33 · `PRD §4.5` · `FR-18` · `EXPERIENCE.md` · `dashboard-api-contract.md §2.2`

## Scenario

**Given** an authenticated People Partner viewing the active People Partner dashboard preset.

**When** the People Partner dashboard renders across all grid regions, widget slots, navigation shortcuts, and table sections.

**Then** resourcing functionality is **absent by construction within the People Partner preset**:
- No resourcing widget, card, slot, stat counter, or section exists inside the active People Partner preset panel.
- Resourcing is **NEVER** rendered inside the PP preset as an available widget, an explicit unavailable card, a measured `0`, a dash `—`, a blank container, or a disabled/coming-soon placeholder.
- Navigation shortcuts inside the People Partner panel omit any shortcut or link to resourcing (e.g. `resourcingUrl` is absent from `PeoplePartnerDashboardReadModel.navigation`).
- This design strictly contrasts with the Unit Manager preset (where resourcing exists as an explicit unavailable slot `resourcingRequests` per Story 2.2).
- The absence assertion is strictly scoped to the People Partner preset container; unrelated sidebar navigation, application-level menus, or inactive Unit Manager markup must not cause false failures.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `PeoplePartnerDashboardReadModel` via `IDashboardDataSource.getPeoplePartnerDashboard()`:
- **Scoped Preset Container Inspection:** Locate the active People Partner panel (e.g. `#preset-panel-people-partner` or active `[role="tabpanel"]`).
- **Absence of Resourcing Slot / Card:** Assert that no element matching `[data-slot="resourcingRequests"]`, `[data-widget="resourcing"]`, or resourcing card container exists within the People Partner panel.
- **Absence of Resourcing Shortcut:** Assert that inside the People Partner navigation shortcuts container, no link or button labeled "Resourcing" or with `href` pointing to a resourcing route is rendered.
- **Valid Grid Card Composition:** Assert that the PP widget grid renders only valid expected cards (`incompleteProfiles`, `riskCounts`, `assignedActionItems`, `cdsMilestones`, `campaignCompletion`) and contains no reserved resourcing placeholder slot. (Do not assert layout gaps via brittle pixel measurements).

### 2. Deferred Backend / Composer Verification
- Constructing the `PeoplePartnerDashboardReadModel` without a resourcing property or resourcing composer query is a **backend/composer verification responsibility**.

## Test

To be covered in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts` (Stage 2):

- resourcing widget slot is completely absent from the People Partner dashboard preset panel by construction
- no resourcing card, counter, unavailable placeholder, or reserved slot exists in the PP widget grid
- People Partner navigation shortcuts container does not render a link or shortcut to resourcing

**Preconditions:** The client consumes `PeoplePartnerDashboardReadModel` through `IDashboardDataSource.getPeoplePartnerDashboard()`. Assertions verify absence of resourcing selectors and navigation links strictly within the rendered People Partner preset panel.
