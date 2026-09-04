# FE-ORG-06 · Reassigning a manager is DELETE-then-POST and recovers from a half-done state

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

DEC-UM-005 makes reassignment an explicit DELETE-then-POST, so the client owns a two-step transaction and must be able to resume the half-applied state.

## Scenario

**Given** an employee with a current manager.

**When** the manager is reassigned.

**Then** the client sends `DELETE` with the current `relationshipId` then `POST` with the new target, and both reads refetch; if the POST fails after the DELETE succeeded the recovery copy is shown and retry re-POSTs **only** — it does not repeat the DELETE.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- reassigns a manager: DELETE (current relationshipId) then POST (new target), and both reads refetch
- a reassignment that fails after the delete shows the recovery copy; retry re-POSTs only

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
