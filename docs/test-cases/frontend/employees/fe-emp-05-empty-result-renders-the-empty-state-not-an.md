# FE-EMP-05 · Empty result renders the empty state, not an error

**Trace:** frontend flow suite [`employees.spec.ts`](../../../../services/frontend/e2e/flows/employees/employees.spec.ts) · backend counterpart: Epic 1 employee list (`um-list-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** filters that match nobody.

**When** the directory loads.

**Then** the empty state renders with a clear-filters action, so the user can recover without editing the URL.

## Test

Covered by these cases in `services/frontend/e2e/flows/employees/employees.spec.ts`:

- an empty result renders the empty state with a clear-filters action

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
