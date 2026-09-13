# FE-DASH-05 · Active headcount filtering excludes dismissed, inactive, and request-time due departures

**Trace:** `PMC-E2-S2.1` · PM/AD-16 · PM/AD-20 · PM/AD-22 · `dashboard-api-contract.md §2.1, §3.2`

## Scenario

**Given** a reporting line containing active employees, a dismissed employee (`EmploymentStatus = 'dismissed'`), an inactive user account (`User.isActive = false`), and an employee with a request-time due departure (`dueAt <= now()`).

**When** the Unit Manager dashboard headcount computes and renders.

**Then** only currently active, non-departed employees are counted in the active headcount metric; dismissed, inactive, and request-time due departure employees are strictly excluded from the active headcount stat.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `UnitManagerDashboardReadModel` via `IDashboardDataSource`:
- **Faithful Metric Rendering:** The UI faithfully renders the numeric value supplied in `headcount.data.count` using `{typography.data-stat}` mono typography.
- **Scope & Presentation Decorators:** The UI renders the associated `.wscope` footer (`SCOPE: REPORTING_LINE`) without altering or recalculating the supplied value on the client.

### 2. Deferred Backend / Composer Verification
A frontend test consuming a completed `UnitManagerDashboardReadModel` cannot prove how the aggregate headcount number was calculated.
- The actual filtering logic—excluding employees with `EmploymentStatus = 'dismissed'`, `User.isActive = false`, and active departures where `dueAt <= now()`—remains a **backend/composer verification responsibility** when backend read-model aggregation is implemented.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- faithfully renders the active headcount value supplied by the read model
- renders the headcount metric in data-stat mono with .wscope footer
- does not recompute or alter the supplied headcount value on the client

**Preconditions:** The client consumes `UnitManagerDashboardReadModel` through `IDashboardDataSource`. Assertions verify that the rendered headcount metric equals the count provided in the read model and displays with the required typography and `.wscope` footer.
