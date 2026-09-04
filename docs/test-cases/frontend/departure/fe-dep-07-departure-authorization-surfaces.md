# FE-DEP-07 · Departure authorization surfaces

**Trace:** frontend flow suite [`departure.spec.ts`](../../../../services/frontend/e2e/flows/departure/departure.spec.ts) · backend counterpart: Epic 5 departure (`um-dep-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a viewer without the write capability, or with an unresolved session.

**When** the departure screen is used.

**Then** a write `403` collapses the form to a permission notice; a `401` anywhere triggers the global redirect to `/login`.

## Test

Covered by these cases in `services/frontend/e2e/flows/departure/departure.spec.ts`:

- a write 403 collapses the form to a permission notice
- a 401 anywhere triggers the global redirect to /login

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
