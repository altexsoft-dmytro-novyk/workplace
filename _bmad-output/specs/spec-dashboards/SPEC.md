---
id: SPEC-dashboards
companions:
  - dashboard-api-contract.md
  - ../../../docs/architecture/dashboards.md
  - ../../../docs/architecture/access-control.md
  - ../../../docs/architecture/api-conventions.md
  - ../../../docs/architecture/domain-driven-design.md
  - ../../../docs/architecture/ARCHITECTURE-SPINE.md
  - ../../planning-artifacts/ux-designs/ux-people-management-2026-09-02/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md
sources:
  - ../../../docs/project-requirements.md
  - ../../planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - ../../planning-artifacts/platform-capabilities/epics.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.
>
> **Sprint-entry gate notice (`OQ-PERM-01`):** PRD FR-6 and `PM-FR-1` require functional roles to govern feature availability. `OQ-PERM-01` remains open: default role-to-permission grants are unapproved. The AccessControl facade evaluates fail-closed (`isAllowed` returns `false` for absent grants). Implementation verification of availability states and read-model contracts proceeds at the contract layer without seeding unapproved grants (SD-2, PMC-E2-S2.2).
>
> **Architecture binding:** PM/AD-33 ratifies four fixed read models (UM, DM, PM, PP) composed by the `dashboards` bounded context, with AccessControl resolving targets before aggregation. No generic dashboard or widget framework exists in v1.5 (SD-1). PMC-E2-S2.4 (Department grouping) is gated on `DEPARTMENT-EDGE` and PM/AD-35 Department schema; it is non-dispatchable.

# People Management Dashboards (Unit Manager & People Partner)

## Why

A Unit Manager or People Partner needs an operational starting point grouped by people — their reporting line or assigned caseload — that delivers immediate visibility into their team headcount and people roster, states the evaluated access policy behind every number, and explicitly declares which source capabilities are not yet connected, rather than forcing managers to start Monday from a search box or concealing missing data behind misleading zeroes or empty charts.

## Capabilities

- **CAP-1 — Unit Manager Dashboard Scope, Headcount, and People Table**
  - **intent:** A Unit Manager holding the dashboard-view functional permission can open Workspace → Dashboards to view their team headcount and a tier-projected people table scoped to their live Reporting-line population.
  - **success:** Access is gated fail-closed on the dashboard-view functional permission via `isAllowed`; scope resolves live through `resolveAudiences` over `Relationship type='direct'`; headcount counts active employees in scope and excludes `dismissed` employees; people table renders rows projected per target tier using Epic 1's shared row read model; every widget displays a `.wscope` footer stating the evaluated access policy in mono uppercase.

- **CAP-2 — Explicit Unavailable Widget States and Honest Provenance Rendering**
  - **intent:** A Unit Manager or People Partner viewing a dashboard can immediately distinguish between a legitimate measured zero and an unavailable source capability without experiencing fabricated data.
  - **success:** Every widget slot with an uncovered source FR (`PM-FR-21` risks, `PM-FR-19` action items, `PM-FR-23` resourcing requests on UM, `PM-FR-20` campaigns, `PM-FR-37` project column, `PM-FR-36` leave column) declares availability from source provenance and renders an explicit unavailable state naming the missing capability; unavailable slots never render `0`, `—`, empty charts, or placeholder data; a legitimate measured zero renders as `0` in `{typography.data-stat}` mono with `.wscope` footer; an empty resolved scope renders the `.emptyst` empty state.

- **CAP-3 — People Partner Dashboard with Dedicated Scope and No Resourcing Block**
  - **intent:** A People Partner holding the dashboard-view functional permission can open a dashboard scoped to their assigned employees with HR-oriented widgets, with resourcing functionality excluded by construction.
  - **success:** The People Partner preset renders scoped strictly to employees where `Relationship type='people_partner'` matches the viewer; the dashboard contains no resourcing block, slot, counter, or placeholder by construction; people table renders rows projected against the viewer's tier per target; unavailable slots follow CAP-2 rules; preset tab strip allows switching between UM and PP presets based on held functional permissions.

## Constraints

- **No generic dashboard engine or customization:** No customize mode, widget catalog, drag handles, remove handles, or custom dashboard tabs (PM/AD-33, SD-1).
- **Fail-closed authorization via AccessControl facade:** Authorization is governed strictly by the AccessControl facade (`isAllowed` for FR capability check, `resolveAudiences` for target scoping); no relationship-derived fallback for feature permission; unseeded/unapproved grants return `false` (PM/AD-9, PM/AD-10, OQ-PERM-01).
- **Resourcing absent by construction on PP Dashboard:** The People Partner dashboard must contain NO resourcing block, slot, counter, or placeholder (PM/AD-33, PRD §4.5, FR-18).
- **Honest provenance rendering:** Uncovered source FRs must render explicit unavailable states and must never be converted into `0`, `—`, empty charts, or fake data (SD-2, PMC-E2-S2.2).
- **Distinguishable measured zero:** A legitimate measured zero must display as `0` in `{typography.data-stat}` mono with `.wscope` footer and must not be suppressed or confused with an unavailable state (PMC-E2-S2.2).
- **Shared read model delegation:** People table rows are assembled via Epic 1's shared row read model and projected per target tier; leak verification delegates to Epic 1's projection-level negative matrix (PM/AD-34, PMC-E2-S2.1).
- **Scope-resolution performance delta:** Performance claims for the dashboard people table must measure the reporting-line / PP-assignment scope resolution delta in addition to citing Epic 1's shared read model measurement (PMC-E2-S2.1).
- **UX and Provenance Chrome:** Must use Epic 1's `.pghd` band with eyebrow `WORKSPACE / DASHBOARDS`, `{colors.stretch-blue}` accent tick, `.prov` tag (stating scope is resolved per request), and per-widget `.wscope` footer in mono uppercase (DESIGN.md, EXPERIENCE.md).
- **Frontend caching:** Permission-sensitive queries use `staleTime: 0`, actor/session-scoped query keys, and no persistent personal-data query caching (PM/AD-25).
- **Non-dispatchable PMC-E2-S2.4:** Department grouping on the People Partner dashboard is gated behind `DEPARTMENT-EDGE` and `PM/AD-35` Department schema; it must not be dispatched for implementation.

## Non-goals

- Generic dashboard or widget customization engine, widget catalogs, configurable layouts, drag-and-drop, or custom dashboards (PM/AD-33, SD-1).
- Project-grouped Delivery Manager and Project Manager dashboards (Epic 3, blocked on `TT-IDENTITY-01` P0 per SD-7).
- Department-grouped People Partner dashboard (Story 2.4 gated on `DEPARTMENT-EDGE` and `PM/AD-35`).
- Implementing uncovered source capabilities (risks `PM-FR-21`, action items `PM-FR-19`, resourcing `PM-FR-23`, campaigns `PM-FR-20`, project column `PM-FR-37`, leave status column `PM-FR-36`).
- Inventing concrete REST route paths, DTO wire property names, or HTTP response envelopes without authoritative specifications.
- Seeding or inferring unconfirmed functional permission grants (OQ-PERM-01).

## Success signal

When an authenticated Unit Manager or People Partner with the dashboard-view permission opens Workspace → Dashboards, the dashboard renders immediately with the correct role-scoped shell (Reporting line for UM, assigned caseload for PP), displays verified headcount in mono typography excluding dismissed employees, shows a tier-projected people table with `.wscope` footers, displays explicit unavailable states naming missing capabilities for uncovered sources without fake data, and renders legitimate zeros as distinguishable numbers.

## Assumptions

- Frontend development will initially bind React dashboard UI components to local/mock data sources implementing the agreed Dashboard read-model contract before backend HTTP routes exist.
- Directory and profile projection services from Epic 1 provide the underlying row projection and leak testing for the dashboard people table.

## Open Questions

- **OQ-PERM-01 — Default functional-role permission matrix:**
  PRD FR-6 and `PM-FR-1` require functional roles to govern feature availability, but default role-to-permission grants remain unconfirmed by the Product Owner. Dashboard-view permission keys and grants remain unseeded and fail-closed.
- **OQ-DASH-ROUTE-01 — Concrete REST endpoint paths:**
  `api-conventions.md` does not specify concrete HTTP paths for dashboard read models (e.g. `GET /dashboards/unit-manager` vs `GET /dashboards/people-partner` vs `GET /dashboards/:preset`). Concrete REST route paths remain unresolved until an architecture/spec decision establishes them. Frontend Stage-1 scenarios may proceed without resolving this question because frontend implementation is based on the agreed Dashboard read-model and `IDashboardDataSource` contract. When backend HTTP implementation begins, unresolved transport route decisions must first be resolved through the appropriate architecture/spec amendment, which backend scenarios will then consume.
- **OQ-DASH-DTO-01 — Concrete HTTP transport DTOs and response envelopes:**
  Concrete wire DTO field naming and serialization wrappers for HTTP transport are unspecified in the architecture spine and remain unresolved until an architecture/spec decision establishes them. Frontend Stage-1 scenarios may proceed without resolving wire transport details because frontend implementation is based on the agreed Dashboard read-model contract. When backend HTTP implementation begins, unresolved wire DTO/envelope decisions must first be resolved through the appropriate architecture/spec amendment, which backend scenarios will then consume.
- **OQ-DASH-QUERYKEY-01 — Canonical TanStack Query key hierarchy:**
  While PM/AD-25 mandates actor-scoped query keys and `staleTime: 0`, the exact query-key tuple hierarchy across presets remains to be finalized during frontend integration.
