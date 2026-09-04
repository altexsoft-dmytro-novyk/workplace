# FE-IMP-02 · A partial import is a result, not an error

**Trace:** frontend flow suite [`import.spec.ts`](../../../../services/frontend/e2e/flows/import/import.spec.ts) · backend counterpart: Epic 1 population import (`um-seed-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

A partially successful import is the common case for a real population file; presenting it as a failure would push the user to re-upload data that already landed.

## Scenario

**Given** a CSV where some rows are rejected.

**When** the import returns 200 with skipped rows.

**Then** the errors table renders with a copy action, and the screen stays a **result** — not an error panel.

## Test

Covered by these cases in `services/frontend/e2e/flows/import/import.spec.ts`:

- a 200 with skipped rows shows the errors table (with a copy action) and is not an error panel

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
