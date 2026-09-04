# FE-PROF-09 · A timeline denial is requested exactly once

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a viewer without timeline access.

**When** the profile loads.

**Then** the timeline request is made once and not retried.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- a timeline 403 is requested exactly once — no retry

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
