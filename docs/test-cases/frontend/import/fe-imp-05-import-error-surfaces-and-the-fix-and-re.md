# FE-IMP-05 · Import error surfaces and the fix-and-re-upload loop

**Trace:** frontend flow suite [`import.spec.ts`](../../../../services/frontend/e2e/flows/import/import.spec.ts) · backend counterpart: Epic 1 population import (`um-seed-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

Verbatim is the requirement: the backend names the offending row and column, and paraphrasing it makes the file unfixable.

## Scenario

**Given** a submitted file.

**When** the import fails.

**Then** a `400` shows the backend message **verbatim**, renders no summary, and leaves the picker usable; picking a corrected file clears the `400` and resubmits to a `200`; a `500` shows the generic server error and re-enables the picker; a `200` carrying a malformed body is treated as a server error rather than a result.

## Test

Covered by these cases in `services/frontend/e2e/flows/import/import.spec.ts`:

- a 400 shows the backend message verbatim, no summary, and the picker stays usable
- the fix-and-re-upload loop: picking a corrected file clears the 400 and resubmits to a 200
- a 500 shows the generic server error and re-enables the picker
- a 200 with a malformed body is treated as a server error, not a result

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
