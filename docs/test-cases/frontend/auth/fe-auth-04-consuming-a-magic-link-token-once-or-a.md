# FE-AUTH-04 · Consuming a magic-link token — once, or a single generic error

**Trace:** frontend flow suite [`auth.spec.ts`](../../../../services/frontend/e2e/flows/auth/auth.spec.ts) · backend counterpart: Epic 2 magic-link authentication (`um-auth-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** the consume route.

**When** it is opened with a valid token, an invalid token, or no token at all.

**Then** a valid token establishes the session, lands on Home, and is consumed exactly once (a second attempt does not re-establish it); an invalid token and a missing token both show the same single generic error and store no session.

## Test

Covered by these cases in `services/frontend/e2e/flows/auth/auth.spec.ts`:

- consuming a valid token establishes a session, lands on Home, and consumes once
- consuming an invalid token shows one generic error and stores no session
- visiting the consume route with no token shows the generic error

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
