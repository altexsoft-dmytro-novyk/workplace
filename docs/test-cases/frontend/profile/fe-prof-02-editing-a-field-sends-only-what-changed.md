# FE-PROF-02 · Editing a field sends only what changed

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an editable identity card.

**When** one field is edited.

**Then** the `PATCH` body carries **only** the changed key; editing the birth day sends a numeric value, not the string from the input.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- an editable card edits one field and PATCHes only the changed key
- editing the birth day PATCHes a numeric value

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
