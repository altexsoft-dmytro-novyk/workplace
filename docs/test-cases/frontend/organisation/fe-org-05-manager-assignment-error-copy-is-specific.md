# FE-ORG-05 · Manager assignment error copy is specific

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a manager assignment.

**When** the request fails.

**Then** a plain `409` shows the "already has a manager" copy; a `409 target_has_scheduled_departure` shows its own copy; a non-self `400` shows the generic copy and **not** the self-assignment copy; a transport failure shows the network copy and does not refetch the journal.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- a plain 409 on manager assignment shows the "already has a manager" copy
- a 409 target_has_scheduled_departure on manager assignment shows its own copy
- a non-self 400 on manager assignment shows the generic copy, not the self copy
- a transport failure on manager assignment shows the network copy and does not refetch the journal

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
