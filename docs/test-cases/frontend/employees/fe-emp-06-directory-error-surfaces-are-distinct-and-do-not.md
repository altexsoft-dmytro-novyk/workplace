# FE-EMP-06 · Directory error surfaces are distinct and do not retry-loop

**Trace:** frontend flow suite [`employees.spec.ts`](../../../../services/frontend/e2e/flows/employees/employees.spec.ts) · backend counterpart: Epic 1 employee list (`um-list-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a viewer on the directory.

**When** the list request fails.

**Then** a `400` keeps the filter bar and shows the bad-request panel **without** a retry (retrying an invalid query cannot succeed); a `403` renders the no-access panel with no retry loop; a `500` renders the error panel and its retry button refetches.

## Test

Covered by these cases in `services/frontend/e2e/flows/employees/employees.spec.ts`:

- a 400 keeps the filter bar and shows the bad-request panel without a retry
- a 403 renders the no-access panel with no retry loop
- a 500 renders the error panel and the retry button refetches

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
