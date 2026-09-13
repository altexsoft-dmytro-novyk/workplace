# FE-DASH-02 · Dashboard loading state renders layout-matching Skeleton placeholders without fake numbers

**Trace:** `PMC-E2-S2.1` · `EXPERIENCE.md` · `dashboard-api-contract.md §1, §9.1`

## Scenario

**Given** an authenticated Unit Manager requesting the dashboard.

**When** dashboard data is loading / pending from `IDashboardDataSource`.

**Then** layout-matching `Skeleton` placeholders render in place of the page header stats, widget cards, and people table rows; loading displays no flash of `0`, `—`, NaN, or fake numeric values.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- loading state renders Skeleton placeholders matching widget grid and table layout
- loading state does not render fake numeric values, NaN, or temporary zeros

**Preconditions:** The client consumes the agreed application read-model contract (`UnitManagerDashboardReadModel`) through `IDashboardDataSource`. The test suite holds the promise pending at the data-source / network layer, and assertions verify visible user outcomes (presence of skeleton elements, absence of raw text or numeric strings) rather than component internals.
