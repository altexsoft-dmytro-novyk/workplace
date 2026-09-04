# FE-PROF-10 · The account menu resolves to the viewer's own profile

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an authenticated session.

**When** "My profile" is chosen.

**Then** it resolves to `/employees/<my user id>`.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- the "My profile" account-menu item resolves to /employees/<my user id>

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
