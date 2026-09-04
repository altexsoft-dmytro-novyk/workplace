# FE-PROF-08 · Profile card error surfaces never leave a blank screen

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

`403` and `404` deliberately render the same panel — the leak-free denial contract from the backend has to survive into the UI, or the frontend becomes the existence oracle the API refused to be.

## Scenario

**Given** a viewer opening a profile.

**When** the card request fails.

**Then** a `404` renders the unavailable panel with a link back to the directory; a `403` renders the same unavailable panel (the viewer learns nothing about existence); a `500` renders the error panel whose retry refetches; a `200` with no `data` body renders the error panel, never a blank screen.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- a 404 on the card renders the unavailable panel with a link back to the directory
- a 500 on the card renders the error panel and retry refetches
- a 403 on the card also renders the unavailable panel
- a 200 with no data body renders the error panel, never a blank screen

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
