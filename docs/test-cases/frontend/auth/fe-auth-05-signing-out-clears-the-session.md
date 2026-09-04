# FE-AUTH-05 · Signing out clears the session

**Trace:** frontend flow suite [`auth.spec.ts`](../../../../services/frontend/e2e/flows/auth/auth.spec.ts) · backend counterpart: Epic 2 magic-link authentication (`um-auth-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an authenticated session.

**When** sign out is chosen.

**Then** the stored session is cleared and the user returns to `/login`.

## Test

Covered by these cases in `services/frontend/e2e/flows/auth/auth.spec.ts`:

- signing out clears the session and returns to /login

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
