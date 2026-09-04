# FE-ORG-07 · Removing an authoritative manager

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an employee whose current manager came from the authoritative read.

**When** the manager section is used.

**Then** Remove is offered, and removing leaves the section showing "none".

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- an authoritative manager offers Remove; removing shows "none"

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
