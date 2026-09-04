# FE-PROF-07 · Deleting a timeline event

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an event on the timeline.

**When** deletion is attempted.

**Then** deletion goes through the confirm dialog; a failed delete keeps the row and shows an inline error rather than removing it optimistically.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- deletes an event through the confirm dialog
- a failed delete keeps the row and shows an inline error

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
