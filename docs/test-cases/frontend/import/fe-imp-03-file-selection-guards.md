# FE-IMP-03 · File-selection guards

**Trace:** frontend flow suite [`import.spec.ts`](../../../../services/frontend/e2e/flows/import/import.spec.ts) · backend counterpart: Epic 1 population import (`um-seed-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

The extension hint is deliberately soft — the server decides by content, and a correctly formed CSV named `.txt` should not be blocked by the browser.

## Scenario

**Given** the import picker.

**When** a file is chosen.

**Then** picking a second, different file replaces the shown selection; a non-`.csv` name shows a soft hint but still allows submitting; an empty file is blocked before any request.

## Test

Covered by these cases in `services/frontend/e2e/flows/import/import.spec.ts`:

- picking a second, different file replaces the shown selection
- a non-.csv name shows the soft hint but still allows submitting
- an empty file is blocked before any request

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
