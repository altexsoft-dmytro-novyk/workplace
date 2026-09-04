# FE-IMP-09 · A successful import invalidates the directory cache

**Trace:** frontend flow suite [`import.spec.ts`](../../../../services/frontend/e2e/flows/import/import.spec.ts) · backend counterpart: Epic 1 population import (`um-seed-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a directory already loaded in the client cache.

**When** an import succeeds.

**Then** the directory query is invalidated so the next visit refetches instead of serving the pre-import roster.

## Test

Covered by these cases in `services/frontend/e2e/flows/import/import.spec.ts`:

- a successful import invalidates the directory query so the next visit refetches

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
