# FE-SHELL-01 · Route guard — an anonymous visitor never reaches an app screen

**Trace:** frontend flow suite [`app.spec.ts`](../../../../services/frontend/e2e/app.spec.ts) · backend counterpart: Epic 2 magic-link authentication (`um-auth-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** no session is stored in the browser.

**When** any in-app route is opened directly, including one that matches no route.

**Then** the app shell renders and the visitor is sent to `/login`; an unknown path is resolved by the router first and then handed to the same guard, so it cannot be used to slip past it.

## Test

Covered by these cases in `services/frontend/e2e/app.spec.ts`:

- renders the app shell and sends anonymous visitors to /login
- routes unknown paths back through the guard to /login

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
