# FE-IMP-08 · Entry points into import from the directory

**Trace:** frontend flow suite [`import.spec.ts`](../../../../services/frontend/e2e/flows/import/import.spec.ts) · backend counterpart: Epic 1 population import (`um-seed-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

The empty state qualifies on **no filters**: an empty filtered result means the filter is wrong, not that the population needs importing.

## Scenario

**Given** the directory.

**When** the import affordances are looked for.

**Then** the unfiltered empty state leads with the Import-population CTA; the toolbar carries an Import-population button that routes to the import screen; the directory `403` panel hides that button.

## Test

Covered by these cases in `services/frontend/e2e/flows/import/import.spec.ts`:

- the directory empty state (no filters) leads with the Import population CTA
- the directory toolbar Import population button routes to the import screen
- the directory 403 panel hides the toolbar Import population button

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
