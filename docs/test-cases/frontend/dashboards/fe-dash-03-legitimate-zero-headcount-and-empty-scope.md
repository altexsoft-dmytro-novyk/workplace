# FE-DASH-03 · Legitimate zero headcount and empty reporting-line scope render distinctly from unavailable states

**Trace:** `PMC-E2-S2.1` · `PMC-E2-S2.2` · `SD-2` · `EXPERIENCE.md §Empty state` · `dashboard-api-contract.md §6, §7`

## Scenario

**Given** an authenticated Unit Manager with zero reporting-line employees (empty resolved scope).

**When** the Unit Manager dashboard loads.

**Then** the headcount metric is an available measured value of `0`, rendered in `{typography.data-stat}` mono with `.wscope` footer (`SCOPE: REPORTING_LINE`); the people table renders the `.emptyst` empty state (`{components.empty-state}`) indicating no direct reports are assigned; the zero is never suppressed as `—` and never confused with an unavailable source state.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- measured zero headcount renders as 0 in data-stat mono with .wscope footer
- empty reporting scope renders the empty-state component instead of an error or table rows
- zero is distinguishable from unavailable widget states

**Preconditions:** The client consumes the agreed application read-model contract (`UnitManagerDashboardReadModel`) through `IDashboardDataSource` with `headcount.data.count = 0` and `peopleTable.data.rows = []`. Assertions verify visible user outcomes (presence of literal '0', empty-state component presence, absence of unavailable warning banners for headcount/table).
