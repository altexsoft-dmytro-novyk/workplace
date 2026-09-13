# FE-DASH-04 · Scope correctness strictly isolates Reporting-line audience from unentitled employees

**Trace:** `PMC-E2-S2.1` · PM/AD-9 · PM/AD-10 · PM/AD-33 · `dashboard-api-contract.md §2.1, §3.1`

## Scenario

**Given** an organization with direct reports, transitive sub-reports, peers, and unassigned employees.

**When** a Unit Manager views their dashboard.

**Then** only employees belonging to the viewer's transitive Reporting line (`Relationship type='direct'`) appear in the headcount count and people table; colleagues outside the reporting line, peers of the manager, and employees reporting to other managers are excluded; scope is evaluated through live AccessControl audience resolution and is never inferred from holding a Unit Manager functional role or position title.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `UnitManagerDashboardReadModel` via `IDashboardDataSource`:
- **Faithful Row Rendering:** The UI renders all employee rows provided in `peopleTable.data.rows`.
- **No Client-Side Fabrication:** The frontend does not add, infer, or fabricate employee rows or counts outside the supplied read model.
- **Scope Label Rendering:** The UI correctly displays the evaluated scope policy metadata (`evaluatedScope.policyLabel` / `.wscope` footer: `SCOPE: REPORTING_LINE`).

### 2. Deferred Backend / Composer Verification
A frontend test using a mocked `IDashboardDataSource` cannot prove that `AccessControl.resolveAudiences` computed the reporting-line traversal correctly.
- The actual recursive walk of `Relationship type='direct'` (transitive closure) and per-target `AccessControl.resolveAudiences(viewerId, [targetId])` filtering remain a **backend/composer verification responsibility** when backend read-model composition is implemented.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- renders all reporting-line employee rows supplied by the read model
- does not add or fabricate employees outside the supplied read model
- renders the evaluated scope policy label and .wscope footer correctly

**Preconditions:** The client consumes `UnitManagerDashboardReadModel` through `IDashboardDataSource`. Assertions verify that the DOM displays exactly the scoped employees supplied by the read model and displays the `.wscope` footer without client-side data leaks or fabrication.
