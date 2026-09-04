# FE-IMP-04 · The import confirm dialog

**Trace:** frontend flow suite [`import.spec.ts`](../../../../services/frontend/e2e/flows/import/import.spec.ts) · backend counterpart: Epic 1 population import (`um-seed-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a picked file.

**When** the confirm dialog is answered.

**Then** Cancel sends nothing; Confirm proceeds with the upload.

## Test

Covered by these cases in `services/frontend/e2e/flows/import/import.spec.ts`:

- the confirm dialog: Cancel sends nothing, Confirm proceeds

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
