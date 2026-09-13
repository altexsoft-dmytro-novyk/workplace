# FE-DASH-10 · Prevention of fake zero, dashes, blank space, empty charts, or fabricated data in unavailable slots

**Trace:** `PMC-E2-S2.2` · `CAP-2` · `SD-2` · `PM-FR-19` · `PM-FR-20` · `PM-FR-21` · `PM-FR-23` · `dashboard-api-contract.md §6.2, §7`

## Scenario

**Given** dashboard widget slots whose source functional requirements are uncovered (`PM-FR-21`, `PM-FR-19`, `PM-FR-23`, `PM-FR-20`).

**When** the dashboard renders.

**Then** unavailable widget slots must **NEVER** render a numeric `0`, dashes (`—`), blank empty space, empty chart graphics/visualizations (e.g. chart canvas or chart visualization SVGs), fake risk level pills (e.g. "Low", "Medium", "High"), mock trend arrows, or synthetic placeholder list items; standard UI/status/decorative icons (such as Lucide status/information icons) are valid and permitted within unavailable cards; a viewer looking at the dashboard must never mistake an unimplemented source capability for a measured zero or an empty collection.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `UnitManagerDashboardReadModel` via `IDashboardDataSource`:
- **Absence of Numeric Counters in Unavailable Slots:** Assertions verify that unavailable slot containers do NOT contain `.data-stat` numeric values or `0`.
- **Absence of Placeholder Dashes:** Assertions verify that unavailable slot containers do NOT render `—` as a value placeholder.
- **Absence of Data Visualizations & Empty Chart DOM:** Assertions verify that unavailable slots do NOT render chart canvases (`<canvas>`), chart visualization components, or empty chart placeholder graphics. (Generic UI status/decorative icons such as Lucide status icons are permitted).
- **Absence of Fabricated Indicators:** Assertions verify that no mock risk chips, synthetic trend arrows, or placeholder tasks appear in the unavailable cards.

### 2. Deferred Backend / Composer Verification
A frontend test consuming `UnitManagerDashboardReadModel` cannot prove how the backend composer constructed the unavailable payload.
- The backend composer must emit clean `UnavailableWidgetState` without attaching fake data payloads, which is verified at the backend/composer contract layer.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- unavailable risk slot does not render numeric 0, trend arrows, or fake risk chips
- unavailable action items slots do not render numeric 0, dashes, or blank list containers
- unavailable resourcing slot does not render numeric 0, dashes, or empty chart visualizations
- unavailable campaigns slot does not render numeric 0, dashes, or synthetic items

**Preconditions:** The client consumes `UnitManagerDashboardReadModel` with `status: 'unavailable'` across slot widgets. Assertions verify the negative absence of numeric stat classes, dash characters, chart visualization elements, and placeholder lists within the unavailable slot card containers, while allowing standard status icons.
