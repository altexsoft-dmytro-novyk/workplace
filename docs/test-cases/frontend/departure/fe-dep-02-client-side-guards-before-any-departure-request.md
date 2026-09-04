# FE-DEP-02 · Client-side guards before any departure request

**Trace:** frontend flow suite [`departure.spec.ts`](../../../../services/frontend/e2e/flows/departure/departure.spec.ts) · backend counterpart: Epic 5 departure (`um-dep-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** the departure form.

**When** a past effective date is entered, or the confirm dialog is cancelled.

**Then** neither sends a request — a past date is rejected in the form, and Cancel closes the dialog with no call.

## Test

Covered by these cases in `services/frontend/e2e/flows/departure/departure.spec.ts`:

- a past effective date is blocked client-side — no request is sent
- the confirm dialog Cancel sends no request

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
