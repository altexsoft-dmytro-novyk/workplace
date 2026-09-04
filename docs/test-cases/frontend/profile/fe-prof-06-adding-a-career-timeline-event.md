# FE-PROF-06 · Adding a career-timeline event

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an employee timeline.

**When** an event is added.

**Then** the empty timeline state renders first, adding an event refetches the timeline; invalid JSON in the details field blocks the `POST`; valid details JSON is carried in the `POST` body.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- shows the empty timeline state, then adds an event and refetches
- invalid JSON in the add-event details blocks the POST
- valid details JSON is carried in the add-event POST body

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
