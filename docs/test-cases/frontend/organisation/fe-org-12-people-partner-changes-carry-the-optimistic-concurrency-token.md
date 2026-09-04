# FE-ORG-12 · People Partner changes carry the optimistic-concurrency token

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

The token is what turns a blind overwrite into a detected conflict when two people edit the same employee; the refresh action is the only honest recovery.

## Scenario

**Given** an employee with a current People Partner.

**When** the PP is changed or removed.

**Then** both carry `expectedCurrentTargetId` — the removal sends it as a query parameter — and a `409` shows the stale-token copy with a refresh action.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- a People Partner change and removal carry expectedCurrentTargetId
- removing a People Partner sends the expectedCurrentTargetId query param
- a 409 on a People Partner change shows the stale-token copy with a refresh action

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
