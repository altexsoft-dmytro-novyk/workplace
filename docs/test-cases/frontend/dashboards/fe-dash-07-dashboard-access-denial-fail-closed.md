# FE-DASH-07 · Dashboard access denial fails closed at the application data-source boundary

**Trace:** `PMC-E2-S2.1` · PM/AD-9 · PM/AD-24 · `OQ-PERM-01` · `dashboard-api-contract.md §8, §9` · Frontend global unauthenticated redirect contract ([`FE-AUTH-01`](../auth/fe-auth-01-protected-route-without-a-session-lands-on-login.md), [`FE-SHELL-01`](../app-shell/fe-shell-01-route-guard-an-anonymous-visitor-never-reaches-an.md), [`FE-EMP-07`](../employees/fe-emp-07-directory-401-redirects-globally.md), `spec-frontend-foundation-and-magic-link-login.md`)

## Scenario

**Given** a user requesting the dashboard who does not hold the dashboard-view functional permission.

**When** the dashboard query evaluates.

**Then** `IDashboardDataSource` returns an access denial (e.g. `403 Forbidden` / permission denied error) and the UI renders the fail-closed access-denied state with no fallback to relationship-derived views; an unauthenticated visitor receiving a `401 Unauthorized` rejection triggers the frontend application's global unauthenticated redirect handler (redirecting to `/login` per `FE-AUTH-01` / `FE-EMP-07`).

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- renders access-denied panel when dashboard-view permission is not held
- unauthenticated 401 response triggers the application global unauthenticated redirect handler

**Preconditions:** The application/test boundary models the fail-closed access state without defining unapproved default role-to-permission grants (preserving `OQ-PERM-01`). The unauthenticated 401 redirect behavior delegates to the existing frontend global unauthenticated handler. Assertions verify rendering of the access-denied error boundary/panel and absence of dashboard widgets or employee data.
