# FE-PROF-01 · The identity card renders read-only unless the viewer may edit

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

Dashes rather than blanks: an empty cell reads as a rendering failure, a dash reads as "not set".

## Scenario

**Given** a viewer reading an employee's profile.

**When** the card loads.

**Then** the identity card renders with dashes for null fields and **no** edit affordance when the viewer cannot edit; on the viewer's own profile the photo-upload control is present.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- read-only view renders the identity card, dashes for nulls and no edit affordance
- my own profile shows the photo-upload control

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
