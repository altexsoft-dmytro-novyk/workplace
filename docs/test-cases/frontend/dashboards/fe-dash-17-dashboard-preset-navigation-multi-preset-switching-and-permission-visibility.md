# FE-DASH-17 · Dashboard preset navigation, multi-preset switching, and permission-based visibility boundary

**Trace:** `PMC-E2-S2.3` · `CAP-3` · PM/AD-10 · PM/AD-33 · `EXPERIENCE.md` · `dashboard-api-contract.md §1, §2` · `OQ-PERM-01`

## Scenario

**Given** an authenticated user accessing the dashboards feature where multiple dashboard presets (Unit Manager and People Partner) are available.

**When** navigating between dashboard presets via the preset tab strip.

**Then** the UI enables smooth switching between presets while strictly preserving the independent read models and invariants of each:
- The preset tab strip renders "Unit Manager" and "People Partner" tabs with standard ARIA tablist semantics (`role="tablist"`, `role="tab"`, `aria-selected="true|false"`, `aria-controls`).
- When the **People Partner** tab is active:
  - The UI consumes and renders the `PeoplePartnerDashboardReadModel` via `IDashboardDataSource.getPeoplePartnerDashboard()`.
  - Active headcount displays direct PP caseload count with `.wscope` footer `SCOPE: PEOPLE_PARTNER_ASSIGNMENT`.
  - The people table renders PP-assigned employees with `.wscope` footer `SCOPE: PEOPLE_PARTNER_ASSIGNMENT`.
  - PP navigation shortcuts (`departuresUrl`, omitting resourcing) render.
  - Resourcing widget slot is **completely absent by construction**.
  - PP HR widget slots (`incompleteProfiles`, explicit unavailable cards for `riskCounts`, `assignedActionItems`, `cdsMilestones`, `campaignCompletion`) render.
- When the **Unit Manager** tab is active:
  - The UI consumes and renders the `UnitManagerDashboardReadModel` via `IDashboardDataSource.getUnitManagerDashboard()`.
  - Reporting-line scope, headcount, people table, and Story 2.1 / Story 2.2 widgets render (including the explicit unavailable `resourcingRequests` slot).
- The tab strip is fully keyboard-navigable using `ArrowLeft`, `ArrowRight`, `Home`, and `End` keys.

## Canonical Permission Source & Test Boundary Analysis

### 1. Investigation of Existing Frontend Permission Architecture
- **Session & Auth State:** `AuthContext` and `session.ts` manage only `{ token, userId, isAuthenticated }` rehydrated from `sessionStorage` (`pp.session`). The JWT payload carries only `sub` and `exp`. There are NO role or permission claims in the session token.
- **No Client-Side Permission Oracle:** Across existing flows (profile, departure, import, organisation), the frontend does not evaluate permissions pre-flight; authorization is enforced fail-closed by the backend/data-source returning `403 Forbidden`, which triggers localized permission notices or `AccessDeniedPanel`.
- **Decoupled from `OQ-PERM-01`:** `OQ-PERM-01` records that default functional role-to-permission grants remain unconfirmed.
- **Architectural Seam Gap Recorded:** The product requirement states that visible presets reflect held functional permissions (`epics.md` PMC-E2-S2.3). Authoritative UX/architecture dictates that unauthorized presets are **omitted** from the tab strip (similar to how DM/PM presets are currently omitted rather than rendered as broken tabs), and direct unauthorized access fails closed with a 403 `AccessDeniedPanel`. However, because **no canonical frontend permission source or preset discovery endpoint exists** in the frontend client, dynamic client-side filtering of preset tabs based on user permissions cannot be evaluated on the client without inventing an unauthorized test-only seam or fake permission API.

### 2. Stage-2 Verification Boundary
- **Testable in Stage 2:** Multi-preset tab strip rendering, keyboard switching between UM and PP presets, ARIA tablist/tab semantics, independent read-model consumption via `IDashboardDataSource`, and fail-closed access denial when a preset query fails.
- **Blocked / Gated for Stage 2:** Dynamic client-side omission of preset tabs based on pre-flight permission inspection is **blocked from test implementation** until an authoritative architecture specification introduces a canonical frontend permission source (e.g. a permissions query, session claims, or a preset discovery contract). Stage 2 must NOT invent a mock permission API, fake session claims, or ad-hoc read-model fields to simulate this.

## Test

To be covered in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts` (Stage 2):

- preset tab strip renders Unit Manager and People Partner preset tabs with proper ARIA tab semantics
- switching to People Partner preset renders PP read model with direct PP scope and no resourcing
- switching back to Unit Manager preset preserves Unit Manager reporting-line scope and Story 2.1/2.2 widgets
- preset tab strip supports keyboard arrow navigation (ArrowLeft, ArrowRight, Home, End)

**Preconditions:** The client consumes `IDashboardDataSource` supporting `getUnitManagerDashboard()` and `getPeoplePartnerDashboard()`. The test suite verifies tab interactions, ARIA attributes, keyboard focus movement, and resulting read-model DOM updates.
