# FE-PROF-04 · Identity-card validation blocks the request

**Trace:** frontend flow suite [`profile.spec.ts`](../../../../services/frontend/e2e/flows/profile/profile.spec.ts) · backend counterpart: Epic 1 profile / photo / timeline (`um-pf-*`, `um-photo-*`, `um-ct-*`) and the S1 adoption gates (`umac-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

Day and month are a pair — half a birthday is not a partial value, it is an invalid one — which is why clearing one is an error and clearing both is handled separately.

## Scenario

**Given** an editable identity card.

**When** an invalid value is entered.

**Then** no `PATCH` is sent: a malformed email shows a field error; birth month 13 shows a range error; clearing only the birth month shows the pair error; clearing both birthday halves is blocked with an inline message.

## Test

Covered by these cases in `services/frontend/e2e/flows/profile/profile.spec.ts`:

- a malformed email shows a field error and sends no PATCH
- birth month 13 shows a range error and sends no PATCH
- clearing only the birth month shows the pair error and sends no PATCH
- clearing both birthday halves is blocked with an inline message

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
