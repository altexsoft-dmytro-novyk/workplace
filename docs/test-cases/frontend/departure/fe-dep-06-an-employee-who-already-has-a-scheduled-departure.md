# FE-DEP-06 · An employee who already has a scheduled departure

**Trace:** frontend flow suite [`departure.spec.ts`](../../../../services/frontend/e2e/flows/departure/departure.spec.ts) · backend counterpart: Epic 5 departure (`um-dep-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an employee whose departure is already scheduled.

**When** another departure is recorded.

**Then** the `409 departure_already_scheduled` shows its own copy rather than the generic error.

## Test

Covered by these cases in `services/frontend/e2e/flows/departure/departure.spec.ts`:

- a 409 departure_already_scheduled shows the "already has a scheduled departure" copy

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
