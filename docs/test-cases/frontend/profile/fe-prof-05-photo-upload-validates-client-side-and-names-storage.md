# FE-PROF-05 · Photo upload validates client-side and names storage failures

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

Size and type are checked before the request because the alternative is uploading megabytes to be told no.

## Scenario

**Given** the viewer's own profile.

**When** a photo is uploaded.

**Then** a valid photo uploads; a bad type is rejected client-side; a 6 MiB file is rejected client-side with **no** request; a `503` shows the storage-specific message rather than the generic error.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- uploads a valid photo and rejects a bad type client-side
- a 6 MiB photo is rejected client-side with no request
- a 503 on the photo upload shows the storage-specific message

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
