# FE-EMP-07 · Directory 401 redirects globally

**Trace:** frontend flow suite [`employees.spec.ts`](../../../../services/frontend/e2e/flows/employees/employees.spec.ts) · backend counterpart: Epic 1 employee list (`um-list-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an unresolved session.

**When** the list request returns 401.

**Then** the global handler redirects to `/login`.

## Test

Covered by these cases in `services/frontend/e2e/flows/employees/employees.spec.ts`:

- a 401 on the list request triggers the global redirect to /login

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
