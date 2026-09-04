# FE-DEP-03 · Blocking responsibilities and re-parenting

**Trace:** frontend flow suite [`departure.spec.ts`](../../../../services/frontend/e2e/flows/departure/departure.spec.ts) · backend counterpart: Epic 5 departure (`um-dep-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

The new key after a successful re-parent is the point: the payload changed, so reusing the old key would return the original 409 from the server's idempotency cache.

## Scenario

**Given** an employee who still holds responsibilities.

**When** a departure is recorded and the blockers are resolved.

**Then** a `409 blocked-by-responsibilities` renders the blocker panel **with names**; re-parenting to the default clears them and "record now" resubmits under a **new** idempotency key; re-parenting that leaves external blockers shows the timetracker message and does **not** resubmit; a stale blocker version reloads the blockers through a fresh record POST and shows a note; "choose someone else" re-parents to a picked target; a re-parent `404` shows the unknown-target copy.

## Test

Covered by these cases in `services/frontend/e2e/flows/departure/departure.spec.ts`:

- a 409 blocked-by-responsibilities response renders the blocker panel with names
- re-parent to the default clears blockers and "record now" resubmits with a NEW key
- re-parenting that leaves external blockers shows the timetracker message and does not resubmit
- a stale blocker version reloads the blockers (a fresh record POST) and shows a note
- the blocker panel "choose someone else" path re-parents to a picked target
- a re-parent 404 shows the unknown-target copy

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
