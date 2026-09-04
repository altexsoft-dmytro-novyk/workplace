# FE-DEP-01 · Recording a clean departure

**Trace:** frontend flow suite [`departure.spec.ts`](../../../../services/frontend/e2e/flows/departure/departure.spec.ts) · backend counterpart: Epic 5 departure (`um-dep-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** an employee with no blocking responsibilities.

**When** a departure is recorded.

**Then** the POST carries an `Idempotency-Key` header and the body, and a `201` moves the screen to the status view with the `?departure=` id in the URL.

## Test

Covered by these cases in `services/frontend/e2e/flows/departure/departure.spec.ts`:

- records a clean departure: Idempotency-Key header + body, 201 → status view + ?departure=

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
