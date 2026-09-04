# FE-DEP-08 · Entry point — profile links through to Departure

**Trace:** frontend flow suite [`departure.spec.ts`](../../../../services/frontend/e2e/flows/departure/departure.spec.ts) · backend counterpart: Epic 5 departure (`um-dep-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an employee profile.

**When** the departure link is followed.

**Then** the Departure screen opens for that employee.

## Test

Covered by these cases in `services/frontend/e2e/flows/departure/departure.spec.ts`:

- the profile screen links through to the Departure screen

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
