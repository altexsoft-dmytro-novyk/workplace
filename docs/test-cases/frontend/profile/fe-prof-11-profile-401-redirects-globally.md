# FE-PROF-11 · Profile 401 redirects globally

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an unresolved session.

**When** any profile request returns 401.

**Then** the global handler redirects to `/login`.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- a 401 anywhere on the profile triggers the global redirect to /login

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
