# FE-ORG-13 · People Partner assignment error copy (no current PP, so no confirm)

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an employee with no current People Partner.

**When** the assignment fails.

**Then** each server outcome has its own copy: `404` unknown target, `422` inactive target, plain `409` generic, `409 target_has_scheduled_departure` its own, a non-self `400` the generic copy rather than the self copy, and a transport failure the network copy.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- 404 → unknown-target copy
- 422 → inactive-target copy
- plain 409 → generic copy
- 409 target_has_scheduled_departure → its own copy
- non-self 400 → generic copy, not the self copy
- transport failure → network copy

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
