# FE-DASH-18 · People Partner explicit unavailable HR widget slots and honest availability rendering

**Trace:** `PMC-E2-S2.3` · `CAP-2` · `CAP-3` · `SD-2` · `PM-FR-19` · `PM-FR-20` · `PM-FR-21` · `PM-FR-30` · `dashboard-api-contract.md §2.2, §6`

## Scenario

**Given** an authenticated People Partner viewing the People Partner dashboard preset where source functional requirements for specific HR widget slots are uncovered:
- Risk records / counts (`PM-FR-21`)
- Assigned action items (`PM-FR-19`)
- CDS milestones (`PM-FR-30`)
- HR form campaigns / completion (`PM-FR-20`)
- Incomplete profiles (`incompleteProfiles` when declared unavailable)

**When** the People Partner dashboard renders.

**Then** each unsourced HR widget slot renders an explicit unavailable card naming the missing capability title (e.g. "Risk Tracking", "Assigned Action Items", "CDS Milestones", "Campaign Completion", "Incomplete Profiles") and an informative explanation in a permission-literate register:
- The user-facing copy contains no apologetic or motivational filler (e.g. no "Sorry", "Coming soon!", or cheerleading phrases).
- Unavailable cards follow the Story 2.2 presentation standard: displaying `missingCapability` + `unavailableReason` without fake data (`0`, `—`, blank container spaces, empty chart DOM / canvas elements, or fake status chips).
- **Scope Footer Presentation Standard:** Conforming to the application contract and Story 2.2 presentation standard, available metrics (`headcount`, `peopleTable`, and available `incompleteProfiles`) carry `.wscope` footers (`SCOPE: PEOPLE_PARTNER_ASSIGNMENT`), whereas `UnavailableWidgetState` cards display `missingCapability` + `unavailableReason` without `.wscope` footers.
- Incomplete profiles widget renders as a live count in `{typography.data-stat}` mono with `.wscope` footer `SCOPE: PEOPLE_PARTNER_ASSIGNMENT` when marked `available`, or as an explicit unavailable card (without scope footer) when marked `unavailable`.
- All People Partner widget slots coexist within the responsive grid without colliding or borrowing title/reason metadata across slots.
- The widget configuration strictly reflects the People Partner contract (`cdsMilestones`, `campaignCompletion`, `assignedActionItems`, `incompleteProfiles`) and does NOT copy the Unit Manager widget list (`unitActionItems`, `myActionItems`, `openCampaigns`, `resourcingRequests`).

## Verification Boundary & Test Responsibilities

### 1. Frontend Stage-2 Verification (Playwright)
Consuming `PeoplePartnerDashboardReadModel` via `IDashboardDataSource.getPeoplePartnerDashboard()`:
- **Unavailable Cards:** Assert that an explicit unavailable card renders for each slot carrying `status: 'unavailable'` in `data.widgets` (`riskCounts`, `assignedActionItems`, `cdsMilestones`, `campaignCompletion`).
- **Missing Capability Titles & Copy:** Assert that headings ("Risk Tracking", "Assigned Action Items", "CDS Milestones", "Campaign Completion") and plain explanations render in the DOM.
- **Absence of Fake Data & Scope Footers:** Assert that no element inside an unavailable slot contains `0`, `—`, empty chart SVG/canvas, or mock item lists; assert that unavailable cards do not render `.wscope` footers.
- **Incomplete Profiles Dual State:** Assert that when `incompleteProfiles` is available, it renders the data count with `.wscope` footer; when unavailable, it renders an explicit unavailable card.
- **Slot Distinction:** Assert that CDS milestones and campaign completion render distinct slot containers without cross-slot text leakage.

### 2. Deferred Backend / Composer Verification
- Determining whether underlying CDS, campaigns, risk, and action-item bounded contexts are implemented and assembling `UnavailableWidgetState` objects remain **backend/composer verification responsibilities**.

## Test

To be covered in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts` (Stage 2):

- renders explicit unavailable card for uncovered PP risk counts slot (PM-FR-21)
- renders explicit unavailable card for uncovered assigned action items slot (PM-FR-19)
- renders explicit unavailable card for uncovered CDS milestones slot (PM-FR-30)
- renders explicit unavailable card for uncovered HR form campaigns completion slot (PM-FR-20)
- renders incomplete profiles widget as available count with .wscope footer when available and as unavailable card when unavailable
- prevents fake zero, dashes, blank containers, or chart DOM in PP unavailable slots
- renders distinct PP HR widget slots coexisting in the grid without metadata cross-contamination

**Preconditions:** The client consumes `PeoplePartnerDashboardReadModel` through `IDashboardDataSource.getPeoplePartnerDashboard()`. Assertions verify DOM elements, card headings, and reason copy across PP widget slots.
