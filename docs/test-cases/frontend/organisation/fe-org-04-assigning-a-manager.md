# FE-ORG-04 · Assigning a manager

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an employee with no current manager.

**When** a manager is assigned.

**Then** the POST body is exactly `{ type, targetId }` and the journal refetches; the picker excludes the subject and the current manager so a no-op or self-assignment cannot be chosen.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- assigns a manager: POST body is exactly { type, targetId } and the journal refetches
- the reassign picker excludes the subject and the current manager

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
