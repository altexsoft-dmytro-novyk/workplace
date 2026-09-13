# FE-DASH-01 · Unit Manager dashboard populated state with live reporting-line scope, headcount, and people table

**Trace:** `PMC-E2-S2.1` · `CAP-1` · PM/AD-33 · PM/AD-34 · `DESIGN.md` · `EXPERIENCE.md` · `dashboard-api-contract.md §2.1, §5`

## Scenario

**Given** an authenticated Unit Manager with active reporting-line direct reports and the dashboard-view functional permission.

**When** Workspace → Dashboards is opened.

**Then** the dashboard opens directly in the Unit Manager preset with People grouping active; the page header renders the `.pghd` band with eyebrow `WORKSPACE / DASHBOARDS`, `{colors.stretch-blue}` accent tick, and `.prov` tag stating `SCOPE RESOLVED LIVE PER REQUEST`; the active headcount card displays the count of active reporting-line employees in `{typography.data-stat}` mono with `.wscope` footer (`SCOPE: REPORTING_LINE`); the people table renders the scoped employee rows using Epic 1's shared `DashboardPersonRow` projection with its `.wscope` footer (`SCOPE: REPORTING_LINE`); navigation shortcuts to related modules are visible.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- default load opens Unit Manager preset with .pghd band, .prov tag, and people grouping active
- renders active headcount in data-stat mono with .wscope footer
- renders tier-projected people table rows for reporting-line employees with .wscope footer
- displays navigation shortcuts to related modules

**Preconditions:** The client consumes the agreed application read-model contract (`UnitManagerDashboardReadModel`) through `IDashboardDataSource`. The test suite mocks data at the data-source / network layer, and assertions verify visible user outcomes (role/label locators, typography classes, text contents) rather than component internals.
