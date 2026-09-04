# FE-ORG-11 · Removing a People Partner

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an employee with a current People Partner.

**When** removal is chosen.

**Then** `DELETE` is sent and the section shows none; cancelling the confirm sends no `DELETE`; a `404` explains there is nothing to remove.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- removes a People Partner: DELETE is sent and the section shows none
- cancelling the People Partner remove confirm sends no DELETE
- a 404 on People Partner removal explains there is nothing to remove

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
