# FE-DASH-14 · People Partner dashboard populated state with live direct PP assignment scope, headcount, people table, and HR widgets

**Trace:** `PMC-E2-S2.3` · `CAP-3` · PM/AD-10 · PM/AD-19 · PM/AD-33 · PM/AD-34 · `DESIGN.md` · `EXPERIENCE.md` · `dashboard-api-contract.md §2.2, §3, §4, §5`

## Scenario

**Given** an authenticated People Partner with active assigned employees (`Relationship type='people_partner'`) holding the dashboard-view functional permission.

**When** Workspace → Dashboards is opened and the People Partner preset is active.

**Then** the dashboard renders the People Partner preset with People grouping active:
- The page header renders the `.pghd` band with eyebrow `WORKSPACE / DASHBOARDS`, `{colors.stretch-blue}` accent tick, and `.prov` tag stating `SCOPE RESOLVED LIVE PER REQUEST`.
- The evaluated scope metadata confirms direct People Partner caseload resolution (`type: 'PEOPLE_PARTNER_ASSIGNMENT'`, `policyLabel: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT (DIRECT)'`).
- The active headcount card displays the count of active assigned employees in `{typography.data-stat}` mono with `.wscope` footer (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`).
- The people table renders the assigned employee rows using Epic 1's shared `DashboardPersonRow` projection with its `.wscope` footer (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`).
- Navigation shortcuts to related modules (`allEmployeesUrl`, `savedViewsUrl`, `campaignsUrl`, `departuresUrl`) are visible and strictly exclude resourcing.
- When `incompleteProfiles` is available, it renders the metric in `{typography.data-stat}` mono with `.wscope` footer (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`).
- Uncovered HR widget slots (`riskCounts`, `assignedActionItems`, `cdsMilestones`, `campaignCompletion`, or `incompleteProfiles` when unavailable) render explicit unavailable cards naming the missing capability and reason per Story 2.2 rules (without a `.wscope` footer).

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `PeoplePartnerDashboardReadModel` via `IDashboardDataSource.getPeoplePartnerDashboard()`:
- **Header Chrome & Provenance:** `.pghd` band with eyebrow `WORKSPACE / DASHBOARDS`, accent tick, and `.prov` tag displaying `SCOPE RESOLVED LIVE PER REQUEST`.
- **Direct PP Headcount:** Count value rendered in `{typography.data-stat}` mono with `.wscope` footer `SCOPE: PEOPLE_PARTNER_ASSIGNMENT`.
- **People Table Rows:** Scoped rows rendered with tier projection (`tier: 'pp'`) and `.wscope` footer `SCOPE: PEOPLE_PARTNER_ASSIGNMENT`.
- **Navigation Shortcuts:** Shortcuts container renders links to All Employees, Saved Views, Campaigns, and Departures; strictly excludes any link to resourcing.
- **Available Incomplete Profiles:** Incomplete profiles metric (when available) renders count in mono with `.wscope` footer `SCOPE: PEOPLE_PARTNER_ASSIGNMENT`.
- **Unavailable Cards:** Uncovered HR widget slots follow Story 2.2 card presentation (`missingCapability` + `unavailableReason`, no scope footer).

### 2. Deferred Backend / Composer Verification
A frontend test using `IDashboardDataSource` cannot evaluate database relationships, AccessControl audience resolution, or filter execution.
- Querying `Relationship type='people_partner'`, excluding dismissed/inactive/due departures from headcount, assembling `DashboardPersonRow` projections, and constructing `PeoplePartnerDashboardReadModel` remain **backend/composer verification responsibilities**.

## Test

To be covered in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts` (Stage 2):

- default load or selection opens People Partner preset with .pghd band, .prov tag, and people grouping active
- renders active caseload headcount in data-stat mono with .wscope footer (SCOPE: PEOPLE_PARTNER_ASSIGNMENT)
- renders tier-projected people table rows for PP-assigned employees with .wscope footer
- displays People Partner navigation shortcuts (including departures and excluding resourcing)
- renders available incomplete profiles metric with .wscope footer (SCOPE: PEOPLE_PARTNER_ASSIGNMENT)
- renders uncovered HR widget slots as Story-2.2 unavailable cards without scope footers

**Preconditions:** The client consumes the agreed application read-model contract (`PeoplePartnerDashboardReadModel`) through `IDashboardDataSource.getPeoplePartnerDashboard()`. The test suite supplies mock data at the application data-source boundary, and assertions verify visible user outcomes (role/label locators, typography classes, text contents) rather than component internals.
