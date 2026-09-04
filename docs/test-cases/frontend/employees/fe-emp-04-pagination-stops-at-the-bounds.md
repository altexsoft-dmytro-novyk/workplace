# FE-EMP-04 · Pagination stops at the bounds

**Trace:** frontend flow suite [`employees.spec.ts`](../../../../services/frontend/e2e/flows/employees/employees.spec.ts) · backend counterpart: Epic 1 employee list (`um-list-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a result set spanning several pages.

**When** the pager is used.

**Then** the pages advance and the pager is disabled at the first and last page.

## Test

Covered by these cases in `services/frontend/e2e/flows/employees/employees.spec.ts`:

- paginates through the results and disables the pager at the bounds

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
