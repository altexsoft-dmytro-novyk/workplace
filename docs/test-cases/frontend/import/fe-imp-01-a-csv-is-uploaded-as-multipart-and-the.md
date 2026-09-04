# FE-IMP-01 · A CSV is uploaded as multipart and the summary renders

**Trace:** frontend flow suite [`import.spec.ts`](../../../../services/frontend/e2e/flows/import/import.spec.ts) · backend counterpart: Epic 1 population import (`um-seed-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a viewer holding the import capability.

**When** a CSV is picked and submitted.

**Then** the request is `multipart/form-data` with a **single** `file` part, and the `200` summary renders; a clean import shows the "everything imported" copy.

## Test

Covered by these cases in `services/frontend/e2e/flows/import/import.spec.ts`:

- a picked CSV is POSTed as multipart with a single "file" part and the 200 summary renders
- a clean 200 shows the "everything imported" copy

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
