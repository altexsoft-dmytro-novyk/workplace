# FE-DASH-08 · Preset tab strip navigation, keyboard accessibility, reduced motion, and exclusion of customization affordances

**Trace:** `PMC-E2-S2.1` · PM/AD-33 · SD-1 · `EXPERIENCE.md` · `dashboard-api-contract.md §1`

## Scenario

**Given** a viewer on the Unit Manager dashboard.

**When** navigating the preset tab strip, grouping controls, and interacting under accessibility settings.

**Then** the preset tab strip renders only the Unit Manager preset in this story's scope (no Delivery Manager or Project Manager tabs leading to broken views); the tab strip and controls are keyboard and arrow-key navigable; grouping dimension displays People as active; when `prefers-reduced-motion: reduce` is active, all transitions and animations are disabled; no customize affordances (customize mode toggle, widget catalog sidebar, drag handles, remove handles, custom dashboard tabs) exist.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- preset tab strip displays Unit Manager preset only and is arrow-key navigable
- grouping dimension displays People as active
- prefers-reduced-motion disables transitions and animations
- customization affordances (customize mode, widget catalog, drag/remove handles, custom tabs) are absent

**Preconditions:** The test suite renders the Unit Manager dashboard component tree and verifies DOM elements for role accessibility (`role="tab"`, `aria-selected`), media query responsiveness (`prefers-reduced-motion`), and absence of customization markup.
