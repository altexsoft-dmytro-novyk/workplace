# FE-DASH-19 · People Partner legitimate zero headcount, empty scope, loading skeletons, and access denial

**Trace:** `PMC-E2-S2.3` · `CAP-2` · `CAP-3` · `SD-2` · PM/AD-24 · PM/AD-25 · `dashboard-api-contract.md §2.2, §6, §7, §8`

## Scenario

**Given** a People Partner accessing their dashboard under edge, boundary, loading, or unauthenticated conditions.

**When** the dashboard evaluates empty caseloads, pending queries, permission denials, or unauthenticated sessions.

**Then** the UI renders the correct state with absolute disambiguation between all possible UI states:
1. **Legitimate Measured Zero Headcount:** When a People Partner has zero assigned employees (`headcount.data.count = 0`), the headcount card renders `0` in `{typography.data-stat}` mono font with its `.wscope` footer (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`). It is **NEVER** replaced with dashes (`—`) or converted into an unavailable card.
2. **Empty Caseload Scope:** When the resolved caseload contains 0 employee rows (`peopleTable.data.rows = []`), the people table section renders the `.emptyst` empty-state component (`{components.empty-state}`) with clear guidance rather than an empty table or unavailable placeholder.
3. **Loading State:** When the People Partner dashboard query is pending, layout-matching `Skeleton` placeholders render across the header, metrics, shortcuts, grid, and table areas without displaying raw numeric flashes or `NaN`.
4. **Access Denial (Fail-Closed):** When an authenticated user lacks the dashboard-view permission, the UI renders the fail-closed `AccessDeniedPanel` without relationship-derived fallback.
5. **Unauthenticated Session (401):** When a request returns `401 Unauthorized`, the session is cleared and the global unauthenticated redirect handler triggers navigation to `/login`.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming `PeoplePartnerDashboardReadModel` via `IDashboardDataSource.getPeoplePartnerDashboard()`:
- **Measured Zero Assertion:** Assert that `0` is visible in data-stat mono and accompanied by `SCOPE: PEOPLE_PARTNER_ASSIGNMENT` footer; assert that no unavailable card is rendered in the headcount container.
- **Empty State Assertion:** Assert that `.emptyst` component is visible in the people table container when `rows` is empty.
- **Skeleton Structure:** Assert that `Skeleton` components appear across the dashboard layout during pending load without raw numeric flashes or `NaN`. (Stage 2 must not infer semantic domain labels for generic anonymous skeleton blocks).
- **Access Denial Rendering:** Assert that `AccessDeniedPanel` is visible when `isError` with 403 status is received.
- **Unauthenticated Handling:** Assert that a 401 response clears session and invokes the global login redirect.

### 2. Deferred Backend / Composer Verification
- Executing backend permission evaluations and returning appropriate HTTP error codes (`403`, `401`) or empty read models remain **backend/composer verification responsibilities**.

## Test

To be covered in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts` (Stage 2):

- renders legitimate zero caseload headcount as 0 in data-stat mono with .wscope footer
- renders .emptyst empty-state component for zero assigned employees in people table
- renders layout-matching Skeleton placeholders during pending load
- renders fail-closed AccessDeniedPanel when dashboard permission is missing
- triggers global unauthenticated redirect handler when API returns 401 Unauthorized

**Preconditions:** The test suite supplies mock read models representing zero headcount, empty row arrays, pending promises, 403 forbidden errors, and 401 unauthorized errors through `IDashboardDataSource.getPeoplePartnerDashboard()`. Assertions verify DOM state, accessibility roles, and redirect behavior.
