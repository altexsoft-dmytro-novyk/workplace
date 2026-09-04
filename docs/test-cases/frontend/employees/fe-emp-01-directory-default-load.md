# FE-EMP-01 · Directory default load

**Trace:** frontend flow suite [`employees.spec.ts`](../../../../services/frontend/e2e/flows/employees/employees.spec.ts) · backend counterpart: Epic 1 employee list (`um-list-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

## Scenario

**Given** a viewer with directory access.

**When** the directory is opened with no filters.

**Then** the roster, its cells and the footer count render from a single clean request — no duplicate or speculative calls.

## Test

Covered by these cases in `services/frontend/e2e/flows/employees/employees.spec.ts`:

- default load renders the roster, cells, footer count and a clean request

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
