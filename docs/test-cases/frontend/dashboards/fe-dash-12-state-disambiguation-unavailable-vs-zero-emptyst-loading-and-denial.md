# FE-DASH-12 · State disambiguation across unavailable source, legitimate measured zero, empty scope, loading skeleton, and access denial

**Trace:** `PMC-E2-S2.1` · `PMC-E2-S2.2` · `CAP-1` · `CAP-2` · `SD-2` · `EXPERIENCE.md §Empty state` · `dashboard-api-contract.md §6, §7, §8`

## Scenario

**Given** the distinct operational states a dashboard and its widgets can encounter:
1. An **unavailable source capability** (`status: 'unavailable'`)
2. A **legitimate measured zero** (`headcount.data.count = 0`)
3. A **legitimate empty scope** (`peopleTable.data.rows = []`)
4. A **loading / pending state** (`isLoading: true`)
5. A **fail-closed access denial** (`403 Forbidden` / missing permission)

**When** the dashboard renders under each respective state.

**Then** the UI maintains clear, unambiguous visual, semantic, and structural separation between all five states:
- An unavailable source renders an explicit unavailable card naming what is missing and why, never displaying `0` or `.emptyst`.
- A legitimate measured zero renders as `0` in `{typography.data-stat}` mono with its `.wscope` footer, never displaying an unavailable banner or dash `—`.
- A legitimate empty scope renders the `.emptyst` empty-state component (`{components.empty-state}`) with guidance copy, never an unavailable card or error panel.
- A loading query renders layout-matching `Skeleton` pulse placeholders without premature zeroes, dashes, NaN, or error panels.
- An access denial renders the `AccessDeniedPanel` without rendering dashboard widgets or employee data.

None of these five states is ever collapsed into, substituted for, or confused with any other.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `UnitManagerDashboardReadModel` via `IDashboardDataSource`:
- **Reuse of Existing Story 2.1 Verification:** Baseline behavior for loading skeletons (`FE-DASH-02`), legitimate measured zero & empty scope (`FE-DASH-03`), and fail-closed access denial (`FE-DASH-07`) is already verified in green Story 2.1 tests and is not duplicated redundantly.
- **Story 2.2 Cross-State Distinction:** Stage-2 tests focus on cross-state negative assertions:
  - Asserts that unavailable widget slots render explicit unavailable cards and never render as `.emptyst` or numeric `.data-stat` counters.
  - Asserts that when headcount is measured zero, the headcount card renders `0` with `.wscope` and does not display an unavailable banner.
  - Asserts that when people table scope is empty, the table card renders `.emptyst` and is not replaced with an unavailable card.

### 2. Deferred Backend / Composer Verification
A frontend test consuming mocked data-source responses cannot prove backend state detection logic.
- Accurate distinction between zero results, empty audiences, uncovered capabilities, and 403 authorization decisions remains a **backend/composer verification responsibility**.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- unavailable widget slots render unavailable cards and never display .emptyst empty state or numeric 0
- legitimate zero headcount (FE-DASH-03) does not render an unavailable card in headcount slot
- empty reporting scope (FE-DASH-03) renders .emptyst empty-state component and does not replace the table with an unavailable card

*(Note: Baseline loading skeleton verification delegates to `FE-DASH-02`; baseline access denial verification delegates to `FE-DASH-07`).*

**Preconditions:** The client consumes `UnitManagerDashboardReadModel` via `IDashboardDataSource` under varying fixture conditions (populated, zero headcount, empty scope, pending promise, and 403 error). Assertions verify distinct DOM signatures for each state.
