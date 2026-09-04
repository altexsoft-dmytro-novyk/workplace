# FE-DEP-04 · Idempotency-key semantics across resubmits

**Trace:** frontend flow suite [`departure.spec.ts`](../../../../services/frontend/e2e/flows/departure/departure.spec.ts) · backend counterpart: Epic 5 departure (`um-dep-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a departure request that has already been submitted once.

**When** it is resubmitted unchanged, or with a changed value.

**Then** an unchanged resubmit reuses the key; a changed value mints a new one; a `409 idempotency_key_payload_mismatch` shows the reload copy.

## Test

Covered by these cases in `services/frontend/e2e/flows/departure/departure.spec.ts`:

- an unchanged resubmit reuses the idempotency key; a changed value mints a new one
- a 409 idempotency_key_payload_mismatch shows the reload copy

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
