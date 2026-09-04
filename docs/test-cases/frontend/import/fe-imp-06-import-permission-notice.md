# FE-IMP-06 · Import permission notice

**Trace:** frontend flow suite [`import.spec.ts`](../../../../services/frontend/e2e/flows/import/import.spec.ts) · backend counterpart: Epic 1 population import (`um-seed-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a viewer without the import capability.

**When** the import screen is opened.

**Then** the permission notice renders and the upload control is disabled.

## Test

Covered by these cases in `services/frontend/e2e/flows/import/import.spec.ts`:

- a 403 shows the permission notice and disables the upload control

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
