# FE-ORG-08 · Without the relationships read, the screen degrades to assign-only

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a viewer whose relationships read returns 403.

**When** the Organisation screen loads.

**Then** the screen falls back to the journal-derived hint and offers **assign only** — no reassign, because reassignment needs the `relationshipId` that only the authoritative read supplies.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- relationships 403 falls back to the journal-derived hint (assign only, no reassign)

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
