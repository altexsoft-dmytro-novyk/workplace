# FE-ORG-14 · Write denials disable the whole editing surface

**Trace:** frontend flow suite [`organisation.spec.ts`](../../../../services/frontend/e2e/flows/organisation/organisation.spec.ts) · backend counterpart: Epic 4 + Epic 6 relationships (`um-rel-*`) · UI contract observed from the shipped suite (see the folder [README](../README.md) on stage ordering)

One capability governs both relationship kinds, so a denial on either write means neither is editable — leaving the other section live would invite a second denial.

## Scenario

**Given** a viewer without the relationships write capability.

**When** a write is attempted.

**Then** a `403` on the manager `POST`, on the People Partner `PUT`, or on the People Partner `DELETE` each disables **both** sections and shows the permission notice; a `403` from the directory disables the person picker.

## Test

Covered by these cases in `services/frontend/e2e/flows/organisation/organisation.spec.ts`:

- a write 403 on the manager POST disables both sections and shows the permission notice
- a write 403 on the People Partner PUT disables both sections
- a write 403 on the People Partner DELETE disables both sections
- a 403 from the directory disables the person picker

**Preconditions:** the suite mocks the API at the network layer (flow `helpers.ts`)
and Playwright starts Vite itself (`playwright.config.ts` `webServer`), so no
backend runs. Assertions are user-visible outcomes — role/label locators and
observed requests — never component internals.
