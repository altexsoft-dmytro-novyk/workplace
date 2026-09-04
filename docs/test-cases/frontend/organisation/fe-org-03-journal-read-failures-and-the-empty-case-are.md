# FE-ORG-03 · Journal read failures and the empty case are distinguishable

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

"Nothing assigned" and "we could not read it" must not look alike — one is a fact about the employee, the other is a fact about the viewer's access.

## Scenario

**Given** a viewer on the Organisation screen.

**When** the journal read fails or returns nothing.

**Then** a `403` shows the explanatory panel **once** and the sections fall back to "not available"; a `404` shows a non-retryable not-found panel; a `200` with no `data` array renders the error panel rather than the empty state; an empty journal together with an empty relationships read shows the empty state and "none assigned" hints; a `500` renders the error panel whose retry refetches.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- a journal 403 shows the explanatory panel once and the sections fall back to "not available"
- a journal 404 shows a non-retryable "not found" panel
- a malformed journal body (200, no data array) renders the error panel, not the empty state
- an empty journal (200, data: []) plus an empty relationships read shows the empty state and "none assigned" hints
- a journal 500 renders the error panel and retry refetches

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
