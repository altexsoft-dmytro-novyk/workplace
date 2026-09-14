# FE-DASH-16 · People Partner scope isolation and non-merging with reporting-line or other audiences

**Trace:** `PMC-E2-S2.3` · `CAP-3` · PM/AD-9 · PM/AD-10 · PM/AD-19 · PM/AD-33 · `dashboard-api-contract.md §2.2, §3, §4`

## Scenario

**Given** an authenticated user who holds dual roles and scopes within the organization:
- Direct People Partner assignment over employees A, B, and C (`Relationship type='people_partner'`).
- Direct Reporting-line management over employees D and E (`Relationship type='direct'`).
- Additional peers, Delivery Manager projects, or unrelated staff across other organizational branches.

**When** the user opens Workspace → Dashboards and views the People Partner preset.

**Then** the People Partner dashboard displays strictly the direct People Partner caseload supplied in the read model:
- The people table renders rows strictly for employees A, B, and C (with `tier: 'pp'`).
- Reporting-line fixture direct reports (employees D and E) do NOT appear in the People Partner people table.
- Displayed active headcount faithfully equals the count supplied by `PeoplePartnerDashboardReadModel.headcount.data.count`.
- The frontend does not merge, recalculate, or recompute headcount from the separate Unit Manager fixture dataset.
- Scope is never inferred on the frontend from Unit Manager relationships, positional titles, or holding a functional role name.
- The frontend faithfully renders the supplied `PeoplePartnerDashboardReadModel` without client-side scope expansion, filtering manipulation, or employee fabrication.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `PeoplePartnerDashboardReadModel` via `IDashboardDataSource.getPeoplePartnerDashboard()`:
- **People Table Row Fidelity:** Assert that the people table renders exactly the rows supplied in `PeoplePartnerDashboardReadModel.peopleTable.data.rows`.
- **Reporting-Line Employee Exclusion in Table:** Assert that named reporting-line fixture employees from the separate Unit Manager dataset do not appear in the People Partner people table DOM.
- **Faithful Headcount Rendering:** Assert that the rendered headcount metric strictly displays `PeoplePartnerDashboardReadModel.headcount.data.count` in `{typography.data-stat}` mono with `.wscope` footer `SCOPE: PEOPLE_PARTNER_ASSIGNMENT`.
- **No Client-Side Recomputation:** Assert that the client renders the supplied read-model values directly without client-side aggregation or merging across datasets.

### 2. Deferred Backend / Composer Verification
A frontend test cannot execute database relationship queries or graph traversal to determine individual headcount membership.
- Executing `resolveAudiences(viewerId, ...)` over direct `Relationship type='people_partner'`, isolating PP caseload from reporting lines and project memberships, ensuring pre-aggregation target resolution, and computing the active headcount total remain **backend/composer verification responsibilities**.

## Test

To be covered in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts` (Stage 2):

- People Partner people table renders exactly the PP rows supplied by the read model
- reporting-line fixture employees do not appear in the People Partner people table
- displayed People Partner headcount faithfully renders the count supplied by the read model without client-side merging
- scope is not inferred from holding a Unit Manager role or functional title

**Preconditions:** The test suite supplies mock read models where the PP dataset contains distinct employees (`Alice PP`, `Bob PP`) from the UM dataset (`Charlie Report`, `Dave Report`). Assertions verify that the People Partner view renders only PP table rows and faithfully displays the supplied PP headcount value without client-side merging.
