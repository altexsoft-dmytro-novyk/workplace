# FE-EMP-02 · Entry point — the sidebar opens the directory

**Trace:** frontend flow suite [`employees.spec.ts`](../../../../services/frontend/e2e/flows/employees/employees.spec.ts) · backend counterpart: Epic 1 employee list (`um-list-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** any in-app screen.

**When** the sidebar "All Employees" link is followed.

**Then** the directory opens.

## Test

Covered by these cases in `services/frontend/e2e/flows/employees/employees.spec.ts`:

- the sidebar "All Employees" link opens the directory

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
