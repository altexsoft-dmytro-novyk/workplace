# Dashboard Feature — Developer Handoff Plan

## Assignment

Implement the existing **People-Grouped Dashboards** epic. Do not redesign, re-plan, or expand the product.

Work only from these existing stories in `_bmad-output/planning-artifacts/platform-capabilities/epics.md`:

1. `PMC-E2-S2.1` — Unit Manager dashboard.
2. `PMC-E2-S2.2` — explicit unavailable states for unsourced widgets.
3. `PMC-E2-S2.3` — People Partner dashboard.

Do not start `PMC-E2-S2.4` or `PMC-E3` until their recorded gates close.

## Step 1 — Read the minimum required context

Read these files in order. Treat them as requirements; do not create replacements:

1. `AGENTS.md`
2. `services/backend/AGENTS.md`
3. `services/frontend/AGENTS.md`
4. `docs/architecture/README.md`
5. `docs/architecture/dashboards.md`
6. `docs/architecture/access-control.md`
7. `docs/architecture/domain-driven-design.md`
8. `docs/architecture/testing-strategy.md`
9. `docs/project-requirements.md` §§2.3, 4.4, 8, and 9
10. `_bmad-output/planning-artifacts/platform-capabilities/epics.md`, Epic 2

The UX prototype is a visual reference only. Where it conflicts with PM/AD-33, PM/AD-33 wins.

## Step 2 — Check whether work may start

Inspect the existing blocker registry before changing code:

`_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml`

- If `OQ-PERM-01` is open, stop and ask the Product Owner for the approved dashboard permission assignment. Do not close or work around the gate yourself.
- `PMC-E2-S2.2` read-model contract checks may be prepared without granting dashboard access, as its existing acceptance criteria explicitly allow this.
- Do not start `PMC-E2-S2.4` while `DEPARTMENT-EDGE` is open.
- Do not start Delivery Manager or Project Manager dashboards while `TT-IDENTITY-01` is open or the project-membership writer is absent.

## Step 3 — Implement each existing story through the required delivery sequence

Complete one story at a time in this order: `S2.1` → `S2.2` → `S2.3`.

For every story:

1. Create story-specific scenarios under `docs/test-cases/dashboards/` using the existing test-case format.
2. Commit a failing real HTTP/PostgreSQL E2E test under `services/backend/test/dashboards/`.
3. Implement only enough backend behavior to make that test pass.
4. Record or update the frontend Pact contract when the API response shape changes.
5. Implement the frontend query hook, page behavior, and Playwright coverage.
6. Run verification and send the story to review before starting the next story.

This is **scenario → committed-red E2E → production code**. There is no intermediate approval gate, but the order is mandatory.

## Step 4 — Backend responsibilities

Create the new bounded context under `services/backend/src/dashboards/`.

The backend must:

- compose fixed UM and PP read models from owning contexts' `application/` exports;
- check the independently grantable dashboard functional permission;
- resolve authorized target IDs through `AccessControl` **before** counting or aggregating;
- reuse the existing employee-list row projection for people tables;
- return only server-authorized fields and rows;
- distinguish measured zero, genuinely empty scope, and unavailable source data;
- keep each widget slot's availability tied to its owning FR;
- expose one dashboard composition capability, not unrelated per-role applications.

For `PMC-E2-S2.1`, deliver:

- Unit Manager reporting-line scope;
- measured headcount;
- the scoped people table;
- denied access without the functional permission;
- empty-scope behavior;
- scope metadata used by the widget footer.

For `PMC-E2-S2.2`, deliver explicit unavailable states for sources that are not implemented. Never return a fabricated numeric value for them.

For `PMC-E2-S2.3`, deliver direct People Partner scope. The PP read model must contain no resourcing region or slot.

## Step 5 — Frontend responsibilities

Add the implementation under:

- `services/frontend/src/api/`
- `services/frontend/src/pages/DashboardsPage/`
- `services/frontend/src/router/`
- `services/frontend/src/locales/en/`
- `services/frontend/e2e/`

The frontend must:

- fetch through a TanStack Query hook, never directly from a component;
- render loading skeletons, measured zero, empty scope, and unavailable sources as different states;
- show a scope/provenance footer on every rendered widget;
- provide keyboard-accessible preset tabs;
- disable motion when `prefers-reduced-motion: reduce` is active;
- use i18n keys for all user-facing text;
- render only the presets returned as available to the viewer.

## Step 6 — Verification

Backend:

```bash
nvm use
npm run db:up
npm run test:e2e
npm run test:contract
npm run build
```

Frontend:

```bash
nvm use
npm run test:unit
npm run test:contract
npm run test
npm run build
```

Run a fresh code review after each story. When saving completed work, commit and push backend and frontend separately, then update the workspace gitlinks.

> [!CAUTION]
> ## 🔴 DO NOT DO THESE THINGS
>
> - **Do not create a new epic.** Use `PMC-E2`.
> - **Do not create new story IDs.** Use `PMC-E2-S2.1`, `S2.2`, and `S2.3`.
> - **Do not create or rewrite a PRD, product brief, architecture, solution design, or UX specification.** The existing artifacts are authoritative.
> - **Do not create a new test strategy, test-design plan, traceability matrix, or quality-gate framework.** Write only the story scenarios and executable tests required by the existing testing strategy.
> - **Do not run PRD, architecture, epic-creation, test-design, or sprint-planning workflows for this assignment.** This is implementation of already-planned work.
> - **Do not edit requirements or planning artifacts to make the implementation easier.** If a required contract is genuinely missing, stop and ask the owning Product Owner or Architect.
> - **Do not self-close, bypass, seed, or infer an open permission gate.**
> - **Do not build a generic widget framework, custom dashboards, dashboard builder, widget catalog, drag-and-drop, resize, remove handles, or customize mode.**
> - **Do not implement Delivery Manager or Project Manager dashboards as part of this assignment.**
> - **Do not implement PP department grouping until `DEPARTMENT-EDGE` closes.**
> - **Do not authorize in React.** The server must omit unauthorized rows and fields.
> - **Do not aggregate first and filter later.** Resolve authorized targets before aggregation.
> - **Do not use a functional role as data scope.** Functional permission enables the feature; `AccessControl` determines which people are visible.
> - **Do not display `0`, `—`, or an empty chart for an unavailable source.** Show an explicit unavailable state.
> - **Do not add a hidden or disabled resourcing card to the PP dashboard.** Resourcing is absent from the PP read model by construction.
> - **Do not duplicate the employee projection for dashboard tables.** Reuse the existing shared row model.
> - **Do not import another context's `domain/` or `infrastructure/`.** Consume its `application/` exports only.
> - **Do not use fakes for behavior owned by the current story.** E2E uses the real router, Access Control, and PostgreSQL.
> - **Do not put backend or frontend application code in the workspace root.**
> - **Do not mark `PM-FR-15` or `PM-FR-18` fully implemented while required widget sources remain unavailable.** Record partial coverage honestly.
