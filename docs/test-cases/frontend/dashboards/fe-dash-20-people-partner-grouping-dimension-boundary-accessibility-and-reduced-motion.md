# FE-DASH-20 · People Partner grouping dimension boundary, absence of gated department controls, and baseline accessibility reuse

**Trace:** `PMC-E2-S2.3` · `PMC-E2-S2.4 (GATED)` · PM/AD-33 · PM/AD-35 · SD-1 · `EXPERIENCE.md` · `dashboard-api-contract.md §1`

## Scenario

**Given** an authenticated People Partner viewing the People Partner dashboard preset.

**When** the user inspects grouping dimensions, keyboard interactions, and accessibility behavior on the People Partner view.

**Then** the UI adheres to the following architectural and interaction rules:
1. **Grouping Dimension Boundary:**
   - **People grouping** is active and available (`aria-selected="true"`, `aria-pressed="true"`, or `data-state="active"`).
   - **Department grouping is strictly GATED (Story 2.4 / PMC-E2-S2.4):** In Story 2.3, Department grouping is **absent** from the interactive grouping control. No disabled department placeholder, department hierarchy, department mock tree, or department data is rendered. (Project grouping belongs to Epic 3 and is also absent).
2. **Exclusion of Customization Affordances (PM/AD-33, SD-1):**
   - No customization controls (customize mode toggle, widget catalog sidebar, drag/remove handles, custom preset tabs) exist in the DOM.
3. **Accessibility & Reduced Motion Alignment:**
   - Multi-preset keyboard switching and ARIA tablist semantics are covered under `FE-DASH-17`.
   - General page-level reduced motion behavior and global customization exclusion reuse existing green baseline evidence from `FE-DASH-08`.
   - Static unavailable-card focus and accessibility semantics reuse existing green baseline evidence from `FE-DASH-13`.
   - Story 2.3 does not duplicate redundant computed-style reduced-motion tests.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming `PeoplePartnerDashboardReadModel` via `IDashboardDataSource.getPeoplePartnerDashboard()`:
- **People Grouping Active:** Assert that People grouping is rendered and active.
- **Absence of Gated Department UI:** Assert that no interactive or mock department grouping control/view is rendered on the People Partner dashboard.
- **Absence of Customization Controls:** Assert that no customization mode or drag-and-drop affordances exist on the PP dashboard.
- **Coverage Reuse:** Page-level reduced-motion and static card accessibility are anchored to existing green Story 2.1/2.2 suite tests (`FE-DASH-08`, `FE-DASH-13`).

### 2. Deferred Backend / Composer Verification
- Nested department aggregation and schema support depend on `DEPARTMENT-EDGE` and `PM/AD-35` for future Story 2.4.

## Test

To be covered in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts` (Stage 2):

- grouping dimension control displays People grouping as active and does not render gated department grouping controls
- People Partner dashboard contains no customization affordances (reusing FE-DASH-08 baseline)

**Preconditions:** The test suite verifies grouping controls, ARIA states, and absence of customization markup on the People Partner preset.
