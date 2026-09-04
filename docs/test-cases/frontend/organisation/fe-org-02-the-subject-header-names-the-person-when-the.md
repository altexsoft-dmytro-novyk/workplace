# FE-ORG-02 · The subject header names the person when the card is readable

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a viewer who can read the subject's S1 card.

**When** the Organisation screen loads.

**Then** the header shows the person's name.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- the subject header shows the person name when the S1 card is readable

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
