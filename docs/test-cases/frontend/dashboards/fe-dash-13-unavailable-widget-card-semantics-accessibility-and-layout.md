# FE-DASH-13 · Semantic structure, accessibility, responsive layout, and lack of customization for unavailable widget cards

**Trace:** `PMC-E2-S2.2` · `CAP-2` · PM/AD-33 · `SD-1` · `DESIGN.md` · `EXPERIENCE.md`

## Scenario

**Given** a Unit Manager viewing the dashboard containing unavailable widget cards under standard and accessibility modes (screen readers, keyboard navigation, `prefers-reduced-motion: reduce`).

**When** the user navigates the dashboard interface.

**Then** each unavailable widget card is structured with a semantic container, accessible heading, and descriptive text clearly conveying the missing capability to assistive technology; the cards integrate cleanly into the responsive grid layout without overflowing, causing layout shifts, or clipping; keyboard navigation traverses the page in a logical tab sequence without trapping focus in unavailable cards; when `prefers-reduced-motion: reduce` is active, all animations and transitions are disabled; no customization affordances (customize mode toggle, widget catalog, drag handles, remove buttons, custom tabs) are present anywhere on the dashboard.

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming the agreed `UnitManagerDashboardReadModel` via `IDashboardDataSource`:
- **Semantic Card Structure:** The UI renders unavailable cards with proper heading levels (`h3` or `h4`) and descriptive text readable by screen readers.
- **Responsive Grid Layout Stability:** Assertions verify that unavailable cards fit within the dashboard grid columns without breaking layout constraints or causing layout shifts.
- **Keyboard Navigation & Focus Trapping:** Tab key navigation proceeds sequentially across interactive elements without getting trapped in static unavailable cards.
- **No Card-Level Customization Affordances:** Assertions verify the absence of card-level edit affordances (drag handles `.drag`, remove buttons `.rm`, or add-widget controls).
- **Delegation of Page-Level Reduced Motion to Story 2.1:** General page-level preset navigation, reduced-motion stylesheet compliance, and shell-level customization absence are already verified in green Story 2.1 tests (`FE-DASH-08`) and are not redundantly duplicated in Story 2.2 test cases.

### 2. Deferred Backend / Composer Verification
None. This scenario pertains strictly to frontend DOM structure, styling, accessibility, and layout rendering.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- unavailable widget cards have semantic structure and accessible headings readable by screen readers
- unavailable widget cards maintain responsive grid layout without layout shifts or overflow
- keyboard navigation traverses the dashboard smoothly without trapping focus in unavailable cards
- no customize handles, drag affordances, or remove buttons exist on unavailable cards

*(Note: Page-level reduced-motion and shell customization absence delegate to `FE-DASH-08`).*

**Preconditions:** The client consumes `UnitManagerDashboardReadModel` through `IDashboardDataSource`. Assertions verify DOM accessibility attributes (`role`, heading tags, text content), keyboard tab order, and absence of card-level customization elements, delegating page-level reduced-motion computed CSS assertions to `FE-DASH-08`.
