# FE-AUTH-01 · Protected route without a session lands on /login

**Trace:** frontend flow suite [`auth.spec.ts`](../../../../services/frontend/e2e/flows/auth/auth.spec.ts) · backend counterpart: Epic 2 magic-link authentication (`um-auth-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** no session.

**When** a protected route is opened directly.

**Then** the guard redirects to `/login` instead of rendering the screen.

## Test

Covered by these cases in `services/frontend/e2e/flows/auth/auth.spec.ts`:

- unauthenticated visit to a protected route lands on /login

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
