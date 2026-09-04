# FE-DEP-05 · Departure status surfaces

**Trace:** frontend flow suite [`departure.spec.ts`](../../../../services/frontend/e2e/flows/departure/departure.spec.ts) · backend counterpart: Epic 5 departure (`um-dep-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a recorded departure in some server-side state.

**When** the status screen is opened.

**Then** `retry_wait` shows attempts and the last error, and "Retry now" calls the retry route; an `applied` status renders the terminal panel with no retry action; a retry answered `departure_not_retryable` shows the note and refetches; an unknown `?departure=` id shows "no longer available" with a path back to the form; a status `403` shows the forbidden panel.

## Test

Covered by these cases in `services/frontend/e2e/flows/departure/departure.spec.ts`:

- a retry_wait status shows attempts + last error and "Retry now" calls the retry route
- an applied status renders the terminal panel with no retry action
- retry returning departure_not_retryable shows the note and refetches
- an unknown ?departure= id shows "no longer available" with a path back to the form
- a status GET 403 shows the forbidden panel

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
