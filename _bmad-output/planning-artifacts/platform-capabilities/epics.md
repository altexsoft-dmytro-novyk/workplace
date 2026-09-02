---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md
status: draft
slice: platform-capabilities
id_namespace: PMC-E{epic}-S{story}
updated: 2026-09-02
---

# People Management — Platform Capabilities (Directory + Dashboards) — Epic Breakdown

## Overview

This document is a **new bounded-context slice** decomposing exactly **7 canonical PRD requirements** into implementable stories: the All Employees directory (`PM-FR-8`, `PM-FR-10`, `PM-FR-11`) and the four role-configured dashboards (`PM-FR-15`, `PM-FR-16`, `PM-FR-17`, `PM-FR-18`).

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) — `PM-FR-*` IDs and §-refs are taken from there and nowhere else.

**Selection rule:** these 7 FRs are simultaneously (a) `coverage_status: uncovered` with `stories: []` in [global-fr-epic-story-coverage.yaml](../global-coverage/global-fr-epic-story-coverage.yaml), and (b) carry a committed UX surface in [EXPERIENCE.md](../ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md) §Information Architecture. The remaining 35 PM-FRs stay outside this slice — either owned by another bounded context (`access-control`, `user-management`, `mentorship`, timetracker integration) or carrying **no** UX surface.

**UX contract:** [EXPERIENCE.md](../ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md) (information architecture, behaviour, states, accessibility, flows) and [DESIGN.md](../ux-designs/ux-people-management-2026-09-02/DESIGN.md) (visual identity and tokens) are **one contract, read together**. Stories reference design tokens **by name** (`{colors.stretch-blue}`, `{components.widget-scope-footer}`, …); token values are never restated in a story.

**Architecture authority:** [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md) — `ratified-with-transition-debt`. Design ratification is **not** implementation evidence (§2). Both surfaces in this slice are listed in ratification §4.2 *Confirmed absent or incomplete* ("directory engine, dashboards", "People Management frontend features").

### Identifier namespace

Stories in this slice use **`PMC-E{epic}-S{story}`**.

> **REGISTRATION GAP (must be closed before this slice enters a sprint):** `PMC-E*` is **not** currently a registered namespace. PRD §0.2 enumerates only `PLAT-E*`, `UM-E*`, `M-E*` as context-qualified epic/story identifiers, and `global-fr-epic-story-coverage.yaml` declares neither `PMC-E*` under `namespace_rules` nor a `platform-capabilities` entry under `source_slices`. `PMC-E*` follows the *pattern* of §0.2 but is a new registration, not an existing one. Closing this requires a PRD §0.2 amendment plus a coverage-model `namespace_rules` / `source_slices` addition.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers (PRD §0.2) and are **never** reassigned or reused by this slice. No story here claims one.

**Out of scope for this slice:** `PM-FR-9` (inline directory editing — EXPERIENCE.md records **No surface**; prototype table is read-only); all resourcing, risk-management, campaign, action-item, CDS, feedback, sharing, and departure *lifecycle* FRs; the Roles, Custom fields, Access preview, My time off, and Absence calendar surfaces.

### Scope decisions (product owner, 2026-09-02)

Four decisions taken at Step 1 confirmation. They bind epic and story design and are not re-opened downstream without a new decision.

- **SD-1 — Dashboard composability is an open conflict, not scope.** PM/AD-33 ratifies **four fixed read models** with **no generic widget engine**, while EXPECTED UX (EXPERIENCE.md §Component Patterns) shows `Dashboard customize mode`, a widget catalog, drag handles, and a `custom dashboards` tab. **Disposition: recorded as an open UX↔architecture conflict; no story in this slice implements or designs dashboard customization.** Neither side is declared the winner here — resolving it requires a PM/AD-33 amendment or a UX spine revision, owned outside this slice.
- **SD-2 — Dashboard stories deliver shell + read-model contract only.** Because every `PM-FR-15` widget except headcount sources from a `uncovered` FR (`PM-FR-19`–`PM-FR-22`, `PM-FR-23`–`PM-FR-25`, `PM-FR-36`, `PM-FR-37`) and PM/AD-10 lacks project/department traversal, dashboard stories deliver: the four role-scoped shells, the fixed read-model **contract**, and only those widgets whose source data exists today. Every absent source renders an **explicit degraded or empty state** per UX-DR12/UX-DR16 — never a fabricated or zero-valued counter presented as real.
- **SD-3 — Extended precondition set.** Stories carry the four named inherited gates **plus** the architecture-derived preconditions (see *Precondition set* below). The four named gates are labelled `inherited` with their source FR, because `PM-FR-8`/`10`/`11`/`15`–`18` carry **empty `gates:`** in the coverage model.
- **SD-5 — Shared views carry configuration, not results.** PRD `PM-FR-10` states views are "shareable with other managers" but is silent on a recipient with a narrower tier. **Decision: a shared view transports only the filter+column configuration.** Rows and columns re-resolve against the *recipient's* tier on every open; a column or filter the recipient is not entitled to is dropped with an explicit indication rather than silently applied. A shared view never replays the owner's result set, and never becomes a side channel for values the recipient's own tier would withhold (UX-DR23).
- **SD-4 — Bulk People Partner assignment is excluded.** UX-DR24 (Flow 3, step 4) shows a bulk bar offering "Assign people partner". PRD FR-7 states the four organisational facts "are **not writable through S1 or inline directory editing**" and must change on a dedicated organisational-relationships screen; `PM-FR-7` is outside this slice and has no UX surface. **The bulk action bar in this slice exposes no organisational-relationship mutation.** Recorded as a UX contract defect.

### Precondition set (per SD-3)

**Inherited from dependency FRs** (not present on the 7 in-scope coverage rows):

| Gate | Inherited from | Binds |
|---|---|---|
| `AC-S9-S13` | `PM-FR-3`, `PM-FR-29`, `PM-FR-32`–`34` | Section-matrix columns beyond the S1/S10/S11 kernel |
| `TT-IDENTITY-01` (P0) | `PM-FR-2`, `PM-FR-14`, `PM-FR-37` | Project column, project grouping, project-line audience |
| `TT-PMDM-01` (P1) | `PM-FR-2`, `PM-FR-14`, `PM-FR-37` | PM/DM mappings behind `PM-FR-16`/`PM-FR-17` scoping |
| `DEPARTMENT-EDGE` (P1) | `PM-FR-2`, `PM-FR-7`, `PM-FR-42` | Department column/filter and `PM-FR-18` department grouping |

**Architecture-derived, added under SD-3:**

| Precondition | Severity / status | Binds |
|---|---|---|
| `SEC-AUTH-01` | **P0 open** | Any new read surface on the interim adapter inherits `Boolean(userId)` target auth and whole-row `GET /users` serialization |
| `QUALITY-GATE-AC` | **P0 open** | Closes only at `gate_status=PASS`, `p0_status=MET`, `critical_open=0`, ACM3-II-06 covered |
| `QUALITY-GATE-AC-NFR` | P1 open | NFR-3 / SM-4 — 2s at 500+ rows including permission resolution |
| `OQ-PERM-01` | P1 open | "view each dashboard type" is an FR-6 permission; default grants unapproved — **do not seed or infer grants** |
| `CONFLICT-UM-01` | P1 open (implementation stale) | PM/AD-24 "list endpoints omit invisible rows"; runtime still diverges |
| `PM/AD-32` | design closed, impl `transition-debt` (TD-12) | Custom-field storage behind `PM-FR-8` |
| `PM/AD-33` | design closed, impl **`absent`** | The four dashboard read models |
| `PM/AD-35` | design closed, impl **`absent`** (no table) | Department entity behind `PM-FR-18` grouping |

**Additional leak precondition (finding, not a registered gate):** `PM-FR-8` requires custom-field columns and filters, UX-DR23 bans inferring hidden custom-field values through filter side channels, but `PM-FR-5` (custom-field visibility inheritance) is `deferred` with `stories: []`. Custom-field filtering cannot ship ahead of `PM-FR-5` visibility enforcement without a NFR-1 critical leak.

## Requirements Inventory

### Functional Requirements

Exactly 7, verbatim-sourced from PRD §4.3 (Directory) and §4.5 (Dashboards). Testable consequences are the PRD's own.

**Directory — All Employees (PRD §4.3)**

- **PM-FR-8** *[PRD §4.3 FR-8]*: Universal filter and column model. Any profile field — including derived fields (e.g. years with company) and runtime custom fields — can be used as a sortable column and as a filter.
  - Consequence: a custom field added by HR Admin is filterable and column-selectable **without developer action**.
  - Consequence: Colleague mode shows **whitelist columns only** (S1, S10 dates only, S11 project name only — PRD §3 glossary).
- **PM-FR-10** *[PRD §4.3 FR-10]*: Saved and shared views. Users save filter+column configurations as named tabs; views are owner-scoped and shareable with other managers.
- **PM-FR-11** *[PRD §4.3 FR-11]*: Export. The current view exports to `.xlsx` containing **only** columns the exporter is entitled to see.

**Dashboards (PRD §4.5)** — "One dashboard engine; four configurations by functional role. Grouping dimension differs: people (UM, PP) vs project (DM, PM). PP dashboard excludes resourcing block."

- **PM-FR-15** *[PRD §4.5 FR-15]*: Unit Manager dashboard. Grouped by **people**: headcount; **active** risk counts by level (active = above `low`); open/overdue action items; active resourcing requests; open campaigns; people table with risk and trend, project, leave status; the manager's own action items; navigation shortcuts.
- **PM-FR-16** *[PRD §4.5 FR-16]*: Delivery Manager dashboard. Grouped by **project**: one table per project (people, risk, leave); top counters across all DM projects; a project selector that filters the entire page and recalculates counters; shows own **and PM-created** resourcing requests. Requests without a project appear in an explicit **Unassigned** bucket and are included in All-project counters.
- **PM-FR-17** *[PRD §4.5 FR-17]*: Project Manager dashboard. Same as the DM dashboard, scoped to the PM's projects only.
- **PM-FR-18** *[PRD §4.5 FR-18]*: People Partner dashboard. Same building blocks scoped to PP-assigned people; groupable by **department or project**; **no resourcing block**; HR-oriented widgets (incomplete profiles, CDS deadlines, campaign completion) encouraged as design freedom.

**Feature-specific NFR carried with the dashboard FRs** *[PRD §4.5]*: dashboard data respects tier resolution for **every** referenced employee.

### NonFunctional Requirements

From PRD §8 (cross-cutting) and §7 (success metrics), filtered to what actually binds this slice.

- **NFR-1** *[PRD §8 NFR-1]*: Access-control correctness is the primary quality attribute; a leak in any section, API surface, export, search result, or notification path is a **critical defect**.
- **NFR-2** *[PRD §8 NFR-2]*: Use only the delivered seeded test population. No real employee data, and no real PII in agent contexts, logs, screenshots, fixtures, or the repository.
- **NFR-3** *[PRD §8 NFR-3, SM-4]*: All Employees returns within **2 seconds at 500+ rows with arbitrary filters, including permission resolution**.
- **NFR-4** *[PRD §8 NFR-4]*: External integration failure degrades gracefully and never takes down the core application.
- **NFR-5** *[PRD §8 NFR-5]*: Responsive layout and accessibility for list and dashboard pages.
- **NFR-6** *[PRD §8 NFR-6]*: English UI only (**DEC-104**).
- **NFR-7** *[PRD §8 NFR-7]*: Functional-permission revocation is **immediate**; platform-owned relationship changes apply on the **next request**; project-derived access changes within **15 minutes** and is **withdrawn after 4 hours** of failed sync.

### Additional Requirements

Architecture and delivery-state constraints from ARCHITECTURE-RATIFICATION.md that bind these 7 FRs. **Design status ≠ implementation status** (ratification §2) — both axes are recorded.

**Directly load-bearing architecture decisions**

- **PM/AD-32 — Custom-field EAV** *(design `ratified`; implementation `transition-debt`)*: closes `OQ-114`. Typed EAV is the target; `User.customFields` jsonb bag is **TD-12** transition debt. This is the storage substrate `PM-FR-8` requires for custom-field columns and filters.
- **PM/AD-33 — Fixed dashboard read models** *(design `ratified`; implementation **`absent`**)*: closes `OQ-115`. **Four fixed read models. Explicitly no generic widget engine** (coverage-model notes on `PM-FR-15`–`PM-FR-18`). `platform/epics.md` Story 1.5 additionally records the engine/widget model as **TBD — no improvised implementation**.
- **PM/AD-34 / ARCH-ENV-01 — Profile assembly + envelope** *(design `ratified`; implementation `partial`)*: closes `OQ-117`. Governs the response envelope directory rows and widget payloads are assembled into.
- **PM/AD-10 — Live audience and section resolution** *(design `partial`; implementation `partial`)*: only **Reporting line and direct People Partner** Phase-0 audiences exist. **Project, department, and PP HR-line traversal are incomplete.** Every project-grouped dashboard (`PM-FR-16`, `PM-FR-17`) and department-grouped view (`PM-FR-18`) depends on the missing traversal.
- **PM/AD-31 / ARCH-PROJ-WRITER-01 — Sole writer of project membership** *(design `ratified`; implementation `absent`)*: timetracker sync absent. Project grouping, the project selector, and the project column have no data writer.
- **PM/AD-35 — Nested Department schema** *(design `ratified`; implementation `absent`)*: closes `DEPARTMENT-EDGE` design; **no table exists**. Required for `PM-FR-18` department grouping and any department column/filter in `PM-FR-8`.
- **PM/AD-24 — HTTP denial oracle** *(design `ratified`; implementation `transition-debt`)*: `401` invalid/inactive session; `404` missing **or hidden-existence** target; `403` visible resource with forbidden feature/action. **List endpoints omit invisible rows** — directly binds the directory and every dashboard table.
- **PM/AD-25 — Frontend authorization and cache contract** *(design `ratified`; implementation `transition-debt`)*: the global **five-minute `staleTime` is TD-11** divergence, not the target. It conflicts with NFR-7's immediate-revocation requirement on both surfaces.
- **PM/AD-14 — API router tree** *(implementation `partial`)*: a basic `User` list/read/edit/photo surface exists; **most routes are absent**. No directory-engine or dashboard route exists.
- **PM/AD-5 — Bounded-context map**: `mentorship` and `action-items` contexts are **confirmed and unimplemented**. Dashboard widgets source from them.

**Delivery-state facts (ratification §4.2, §5)**

- Directory engine and dashboards are **confirmed absent**; People Management frontend features are **confirmed absent**. This slice is greenfield behaviour on a brownfield runtime.
- **No starter/greenfield template is specified** by the architecture. Epic 1 Story 1 therefore carries **no** starter-template setup obligation; the frontend shell, shadcn/ui config, and 102 CSS variables already exist in `services/frontend`.
- **P0 `SEC-AUTH-01`**: the interim target-authorization adapter returns `Boolean(userId)` — it permits **every** operation on **every** target — and the interim session resolver **self-provisions a privileged `position: 'HR Admin'` account**. Latent (not deployed), but any new read surface built on the interim adapter inherits the hole.
- **Whole-row `User` serialization** can expose technical/non-S1 fields on **all six** existing `User` handlers, **including `GET /users`** — the exact endpoint a directory engine would extend.

**Fixed product facts already ratified for dashboards** *(`platform/epics.md` Story 1.5)*: the **Unassigned** bucket, risk "active" ≠ `low`, and project-line counter implications are fixed product facts, not open design.

### UX Design Requirements

Extracted from EXPERIENCE.md §Information Architecture, §Component Patterns, §State Patterns, §Accessibility Floor, §Responsive & Platform, §Voice and Tone, §Interaction Primitives, and the 3 Key Flows — scoped to the two in-scope surfaces (`Main.dc.html` All Employees, `Dashboards.dc.html` Dashboards). Visual values live in DESIGN.md and are referenced **by token name only**.

**Information architecture and page chrome**

- **UX-DR1**: All Employees is reachable at **People → All Employees**; Dashboards at **Workspace → Dashboards**. Sidebar groups are People / Workspace / Administration. Cross-surface navigation uses the production client router (the prototype leaves it unwired).
- **UX-DR2**: Both surfaces carry the page header band (`.pghd`, `{components.page-header-band}`): mono eyebrow in `{typography.page-eyebrow}` formatted `AREA / SCREEN`, title in `{typography.page-title}`, one-line lead in `{typography.page-lead}` capped at ~720px, right-aligned shadcn `Button` actions, and a `{spacing.pghd-accent-width}` accent tick. Both surfaces use the default chrome accent `{colors.stretch-blue}` (amber and violet carry other meanings and must not be used decoratively).
- **UX-DR3**: Provenance tags (`.prov`, `{components.provenance-tag}`) are **always visible in the header, never tooltip-only**, and carry **text labels, not colour alone**: `SYNCED` (external timetracker data, can go stale), `ACCESS` (resolved per-request), `DERIVED` (computed role), `FEATURE` (functional permission).

**Directory component patterns**

- **UX-DR4**: Directory table supports sortable column headers (click → sort toggle), multi-select filters applying immediately, name search, saved-view tabs, a Colleague-view toggle, row-checkbox selection raising a bulk action bar, and a left accent inset on row hover (`box-shadow: inset 2px 0 0 var(--accent)` — no drop shadow).
- **UX-DR5**: A column picker exposes all entitled fields **including custom-field columns**; this is the `PM-FR-8` surface at *Full* coverage depth.
- **UX-DR6**: Saved-view tabs plus a **"New view"** affordance; this is the `PM-FR-10` surface at *Full* coverage depth.
- **UX-DR7**: The Colleague-view toggle **simulates the API whitelist instantly**; a Colleague-view banner explains which columns are whitelisted and states that risk, grade, and closed sections **are never sent**. Banner uses `role="status"` when toggled.
- **UX-DR8**: An export action is present in the header. EXPERIENCE.md records the export flow as **"Button present — export flow not interactively demonstrated"** — the `PM-FR-11` interaction beyond the button is **undesigned** and must be specified in the story, not inferred from the mock.

**Dashboard component patterns**

- **UX-DR9**: Dashboard preset tabs for **UM / DM / PM / PP**, with a grouping-dimension switch (**people vs project**).
- **UX-DR10**: Every widget carries a scope footer (`.wscope`, `{components.widget-scope-footer}`) stating, in mono uppercase, the access policy evaluated. **A widget never widens viewer entitlement.** This replaces hidden access tooltips.
- **UX-DR11**: Dashboard stat values render in `{typography.data-stat}` (Geist Mono).
- **UX-DR12**: The no-widgets condition uses the empty state (`.emptyst`, `{components.empty-state}`): icon + bold line + direction + action.

**State patterns**

- **UX-DR13**: Loading on all data surfaces uses shadcn `Skeleton` **matching the target table/card layout** (not a generic spinner).
- **UX-DR14**: Empty directory filter renders zero rows plus "No people match these filters" and a **clear-filters** action.
- **UX-DR15**: Colleague-view-active state renders the banner plus the reduced column set.
- **UX-DR16**: Timetracker-stale state renders an **amber** banner with the last-sync timestamp and the **4-hour project-access fallback** warning, announced **assertively** to screen readers.

**Accessibility floor**

- **UX-DR17**: **WCAG 2.2 AA.** Contrast inherits shadcn defaults; stretch provenance-tag hues are verified against their backgrounds.
- **UX-DR18**: `prefers-reduced-motion` disables **all** transitions and animations (the 140ms `.btn` / `.nav` / `.tab` / row / card transitions and the hover lift). No entrance animations or parallax at any time.
- **UX-DR19**: Keyboard — shadcn focus rings (`{colors.ring}` / `--ring`); tab order follows visual layout; **segment/preset controls are arrow-key navigable**.
- **UX-DR20**: Screen reader — the page header announces area + screen from the eyebrow; the Colleague-view banner is `role="status"`; the stale banner is assertive.

**Responsive**

- **UX-DR21**: `≥ lg` (1024px+) full sidebar + multi-column dashboard grid; `md` (768–1023px) sidebar collapses to icons + 2-column dashboard grid; `< md` sidebar becomes a `Sheet`, directory table scrolls horizontally, dashboard stacks to a single column. Desktop-primary: mobile supports read + light filter; **bulk actions and dashboard customize are degraded but functional**.

**Voice, tone, and prohibitions**

- **UX-DR22**: Microcopy is **direct, honest, permission-literate** — it explains what the API returns and where data came from. Required register: "Colleague view — the API returns only the whitelist columns."; "512 people. Leave and project data comes from the timetracker."; "Synced · timetracker". Forbidden register: "Welcome to your people hub!"; "Restricted mode enabled."; "Up to date ✓" without a source. Gaps are stated, never hidden silently.
- **UX-DR23**: **Banned, and testable as negatives**: client-side section hiding as a substitute for server omission; a functional role used to widen data access; inferring hidden custom-field values through **filter side channels**.

**Key flow (the only one landing on an in-scope surface)**

- **UX-DR24** *[Flow 3 — Bohdan, Unit Manager, Monday morning]*: Bohdan opens All Employees → selects saved view **"My unit"** → filters Risk = high → sorts by trend descending → toggles Colleague view **off**, and the risk and grade columns **return** → selects two rows, raising the bulk bar → the leave-status column shows synced away dates, with the header provenance tag already reading "Synced · leave & projects". **Failure path:** Colleague view left on → the risk column is **absent by design** and the banner explains why.

> **UX coverage gaps recorded, not resolved.** Key Flows 1 (Kateryna / Access preview) and 2 (Tamar / My time off) target out-of-scope surfaces. **No Key Flow exercises the Dashboards surface**, which carries 4 of this slice's 7 FRs — there is no UX-validated end-to-end dashboard journey. `PM-FR-11`'s flow is a button only (UX-DR8). Both are flagged for Step 2/3 rather than invented here.

### FR Coverage Map

| Requirement | Epic | Coverage in this slice |
|---|---|---|
| `PM-FR-8` — Universal filter and column model | Epic 1 | Sortable columns, multi-select filters, name search, column picker over entitled standard and derived fields; custom-field columns/filters sequenced last behind the `PM-FR-5` visibility precondition |
| `PM-FR-10` — Saved and shared directory views | Epic 1 | Named owner-scoped view tabs, "New view", share-with-manager, per-viewer re-resolution on open |
| `PM-FR-11` — Visibility-safe XLSX export | Epic 1 | `.xlsx` of the current view containing only exporter-entitled columns; flow specified in-story (UX-DR8 records the mock as button-only) |
| `PM-FR-15` — Unit Manager dashboard | Epic 2 | People-grouped shell + read-model contract + source-backed widgets; absent sources render explicit degraded/empty states (SD-2) |
| `PM-FR-16` — Delivery Manager dashboard | Epic 2 | Project-grouped shell, project selector recalculating page counters, **Unassigned** bucket included in All-project counters; per SD-2 |
| `PM-FR-17` — Project Manager dashboard | Epic 2 | DM configuration scoped to the PM's own projects; per SD-2 |
| `PM-FR-18` — People Partner dashboard | Epic 2 | PP-assigned scope, department **or** project grouping, **resourcing block absent by construction**; per SD-2 |
| PRD §4.5 feature NFR — tier resolution per referenced employee | Epic 2 | Every widget resolves tier per referenced employee; `.wscope` footer states the policy evaluated |
| NFR-1 (leak = critical), NFR-2 (seeded data only) | Epic 1 + Epic 2 | Negative tests per audience on list rows, export columns, and widget payloads; seeded population only |
| NFR-3 / SM-4 (2s at 500+ rows incl. permission resolution) | Epic 1 | Measured directory evidence; `QUALITY-GATE-AC-NFR` precondition |
| NFR-4 (graceful integration degradation) | Epic 1 + Epic 2 | Timetracker-stale amber banner with 4h project-access fallback (UX-DR16) |
| NFR-5 (responsive + accessible), NFR-6 (English only) | Epic 1 + Epic 2 | UX-DR17–UX-DR21 |
| NFR-7 (revocation timing) | Epic 1 + Epic 2 | Immediate functional-permission revocation and next-request relationship effect; PM/AD-25 TD-11 five-minute `staleTime` recorded as the divergence to close |
| UX-DR1–UX-DR3 (nav, page header band, provenance) | Epic 1 | Shared chrome delivered here; Epic 2 consumes it |
| UX-DR4–UX-DR8, UX-DR14, UX-DR15, UX-DR24 | Epic 1 | Directory table, column picker, saved views, Colleague-view banner, export action, empty-filter state, Flow 3 |
| UX-DR9–UX-DR13, UX-DR16 | Epic 2 | Preset tabs, grouping switch, `.wscope`, mono stat values, empty state, stale banner |
| UX-DR17–UX-DR23 | Epic 1 + Epic 2 | Accessibility floor, responsive behaviour, microcopy register, banned patterns as negative tests |
| **Not covered in this slice** | — | `PM-FR-9` (no UX surface); dashboard customization (SD-1); bulk organisational-relationship mutation (SD-4); every widget source FR (`PM-FR-19`–`PM-FR-27`, `PM-FR-30`, `PM-FR-31`, `PM-FR-35`–`PM-FR-37`) |

## Epic List

Two epics. Split at the one genuine risk boundary in this slice: the directory's solution design is UX- and architecture-validated, while the dashboard surface carries an unresolved UX↔architecture conflict (SD-1) and mostly absent data sources (SD-2). Within each surface the FRs target the same core files, so neither is split further — PRD §4.5 itself specifies "one dashboard engine; four configurations by functional role".

### Epic 1: Permission-Safe People Directory

Any authenticated employee can find and review people through a single All Employees list whose columns, filters, sorting, saved views, and export never exceed their resolved access tier — and which states where its data came from.

**FRs covered:** `PM-FR-8`, `PM-FR-10`, `PM-FR-11`

**Also delivers:** the shared page chrome (`.pghd` band, `.prov` provenance tags) that Epic 2 consumes; the Colleague-view whitelist demonstration surface; the NFR-3 2-second/500-row budget with measured evidence; UX-DR24 (Flow 3) end-to-end.

**Standalone:** yes. Extends the existing `GET /users` runtime surface over the seeded population and requires no dashboard, no resourcing, and no risk-management work to be useful.

**Enables (without depending on):** Epic 2's page chrome and tier-safe row projection; and, outside this slice, `PM-FR-20` campaign audience selection and `PM-FR-31` CDS directory filters, both of which the PRD routes through this filter engine.

**Implementation notes:** `SEC-AUTH-01` and whole-row `User` serialization both sit on the exact endpoint this epic extends — the projection and target-auth cutover is a precondition, not a follow-up. Custom-field columns and filters are ordered last behind the `PM-FR-5` visibility precondition. Export must be specified in-story rather than inferred from the mock (UX-DR8). Shared views re-resolve per viewer rather than replaying the owner's result set.

### Epic 2: Role-Scoped Operational Dashboards

A Unit Manager, Delivery Manager, Project Manager, or People Partner opens a dashboard configured for how they organise work — grouped by people or by project — that states the access policy behind every number and is explicit about which data sources are not yet connected.

**FRs covered:** `PM-FR-15`, `PM-FR-16`, `PM-FR-17`, `PM-FR-18`, plus the PRD §4.5 feature NFR

**Scope per SD-2:** the four role-scoped shells, the PM/AD-33 fixed read-model **contract**, and only those widgets whose source data exists. Every absent source renders an explicit degraded or empty state — never a fabricated or zero-valued counter presented as real.

**Scope per SD-1:** no customize mode, no widget catalog, no drag-and-drop, no custom dashboards.

**Standalone:** yes. Builds on Epic 1's chrome and row projection but does not require Epic 1's saved views or export, and requires no later epic.

**Implementation notes:** project grouping, the project selector, and PM/DM scoping depend on PM/AD-10 project traversal and PM/AD-31 sync, which are absent — `TT-IDENTITY-01` (P0) and `TT-PMDM-01` gate them. Department grouping depends on PM/AD-35, which has no table (`DEPARTMENT-EDGE`). "View each dashboard type" is an FR-6 permission whose default holders are unapproved (`OQ-PERM-01`) — grants must not be seeded or inferred. The **Unassigned** bucket and risk-active ≠ `low` are already fixed product facts and are not re-decided here.

> **Coverage-model honesty requirement.** Completing Epic 2 does **not** make `PM-FR-15`–`PM-FR-18` `implemented`. Under SD-2 these FRs reach at most partial coverage — the full PRD §4.5 widget sets remain blocked on their source FRs. The coverage-model update for this slice must record partial status with an evidence pointer, not completion.
