# FE-AUTH-02 · Session lifecycle — expiry, reload survival, and the already-signed-in redirect

**Trace:** frontend flow suite [`auth.spec.ts`](../../../../services/frontend/e2e/flows/auth/auth.spec.ts) · backend counterpart: Epic 2 magic-link authentication (`um-auth-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

Expiry is decided client-side from the stored token, so a stale tab does not present itself as signed in.

## Scenario

**Given** a session token in browser storage.

**When** the app boots, or an authenticated user opens `/login`.

**Then** an expired token is treated as logged out; an unexpired one survives a reload without a new round trip; an authenticated user who opens `/login` is redirected Home rather than shown the form again.

## Test

Covered by these cases in `services/frontend/e2e/flows/auth/auth.spec.ts`:

- an expired stored token is treated as logged out
- a stored, unexpired session survives a reload
- an authenticated user visiting /login is redirected to Home

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
