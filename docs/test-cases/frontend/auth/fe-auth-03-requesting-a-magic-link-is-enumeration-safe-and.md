# FE-AUTH-03 · Requesting a magic link is enumeration-safe and validates before sending

**Trace:** frontend flow suite [`auth.spec.ts`](../../../../services/frontend/e2e/flows/auth/auth.spec.ts) · backend counterpart: Epic 2 magic-link authentication (`um-auth-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

The confirmation copy must not vary by whether the address exists — that is the enumeration guarantee, and it is the reason this is one scenario and not three.

## Scenario

**Given** the login form.

**When** an email is submitted, or a malformed one is typed.

**Then** a syntactically invalid email is blocked client-side with **no** request sent; a submitted address always yields the same confirmation regardless of whether it is registered; a failed request shows a generic error and re-enables the form so the user can retry.

## Test

Covered by these cases in `services/frontend/e2e/flows/auth/auth.spec.ts`:

- requesting a link shows the enumeration-safe confirmation
- a failed link request shows a generic error and re-enables the form
- an invalid email is blocked client-side with no request sent

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
