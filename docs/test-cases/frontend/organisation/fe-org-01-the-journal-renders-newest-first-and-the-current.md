# FE-ORG-01 · The journal renders newest-first and the current values come from the authoritative read

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

The journal is history and the relationships read is truth. Deriving "current" from the newest journal row is wrong whenever a change was made outside this screen.

## Scenario

**Given** an employee with a relationship journal and current edges.

**When** the Organisation screen loads.

**Then** journal rows render newest-first with formatted cells, and the current manager / People Partner are shown **by name** from the relationships read — not inferred from the newest journal row; while that read is in flight the current value shows a loading state rather than a stale or guessed value.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- renders the journal newest-first with formatted cells and shows the authoritative current manager / PP by name
- shows the loading state for the current value while the relationships read is in flight

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
