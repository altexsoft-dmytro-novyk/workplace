# FE-PROF-03 · A conflicting email edit leaves the card unchanged

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an editable card.

**When** the email edit returns 409.

**Then** the conflict error is shown and the card is left as it was — no optimistic value survives the rejection.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- a 409 on the email edit shows a conflict error and leaves the card unchanged

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
