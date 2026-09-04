# FE-EMP-03 · Filtering is reflected in the URL and validated before it is sent

**Trace:** frontend flow suite [`employees.spec.ts`](../../../../services/frontend/e2e/flows/employees/employees.spec.ts) · backend counterpart: Epic 1 employee list (`um-list-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

The page reset matters: keeping page 5 while narrowing the result set is how a filtered directory renders an empty page that is not the empty state.

## Scenario

**Given** the loaded directory.

**When** a filter is applied.

**Then** the filter appears in the URL, the list refetches, and the page resets to the first page; a valid birth-month value is forwarded and an out-of-range one is dropped rather than sent; filtering by dismissed status shows dismissed rows carrying a badge.

## Test

Covered by these cases in `services/frontend/e2e/flows/employees/employees.spec.ts`:

- applying a filter reflects it in the URL, refetches, and resets the page
- forwards a valid birth-month filter but drops an out-of-range one
- filtering by dismissed status shows dismissed rows with a badge

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
