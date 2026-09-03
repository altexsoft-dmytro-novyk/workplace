---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md
status: final
slice: platform-capabilities
id_namespace: PMC-E{epic}-S{story}
updated: 2026-09-03
---

# People Management — Platform Capabilities (Directory + Dashboards) — Epic Breakdown

## Overview

This document is a **new bounded-context slice** decomposing **8 canonical PRD requirements** into implementable stories: the All Employees directory (`PM-FR-8`, `PM-FR-10`, `PM-FR-11`, `PM-FR-9`) and the four role-configured dashboards (`PM-FR-15`, `PM-FR-16`, `PM-FR-17`, `PM-FR-18`).

> **Amendment (2026-09-03, `bmad-create-epics-and-stories` re-entry).** `PM-FR-9` (inline directory editing) was originally recorded **out of scope** below because it carried `coverage_status: uncovered` **and no committed UX surface** — the opposite of this slice's own selection rule, which required *both* conditions. EXPERIENCE.md still records "No surface" for it; that has not changed. It enters this slice now as **Epic 4** because covering the three remaining unowned PM-FRs (`PM-FR-5`, `PM-FR-6`, `PM-FR-9`) was requested directly, and `PM-FR-9`'s data/access-control behaviour genuinely belongs on this directory surface rather than anywhere else. The UX gap is not resolved by this amendment — Epic 4 states plainly, per story, where it had to specify interaction and error states with no mock to draw from.

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) — `PM-FR-*` IDs and §-refs are taken from there and nowhere else.

**Selection rule:** these 7 FRs are simultaneously (a) `coverage_status: uncovered` with `stories: []` in [global-fr-epic-story-coverage.yaml](../global-coverage/global-fr-epic-story-coverage.yaml), and (b) carry a committed UX surface in [EXPERIENCE.md](../ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md) §Information Architecture. The remaining 35 PM-FRs stay outside this slice — either owned by another bounded context (`access-control`, `user-management`, `mentorship`, timetracker integration) or carrying **no** UX surface.

**UX contract:** [EXPERIENCE.md](../ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md) (information architecture, behaviour, states, accessibility, flows) and [DESIGN.md](../ux-designs/ux-people-management-2026-09-02/DESIGN.md) (visual identity and tokens) are **one contract, read together**. Stories reference design tokens **by name** (`{colors.stretch-blue}`, `{components.widget-scope-footer}`, …); token values are never restated in a story.

**Architecture authority:** [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md) — `ratified-with-transition-debt`. Design ratification is **not** implementation evidence (§2). Both surfaces in this slice are listed in ratification §4.2 *Confirmed absent or incomplete* ("directory engine, dashboards", "People Management frontend features").

### Identifier namespace

Stories in this slice use **`PMC-E{epic}-S{story}`**.

> **REGISTRATION GAP (must be closed before this slice enters a sprint):** `PMC-E*` is **not** currently a registered namespace. PRD §0.2 enumerates only `PLAT-E*`, `UM-E*`, `M-E*` as context-qualified epic/story identifiers, and `global-fr-epic-story-coverage.yaml` declares neither `PMC-E*` under `namespace_rules` nor a `platform-capabilities` entry under `source_slices`. `PMC-E*` follows the *pattern* of §0.2 but is a new registration, not an existing one. Closing this requires a PRD §0.2 amendment plus a coverage-model `namespace_rules` / `source_slices` addition.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers (PRD §0.2) and are **never** reassigned or reused by this slice. No story here claims one.

**Out of scope for this slice:** all resourcing, risk-management, campaign, action-item, CDS, feedback, sharing, and departure *lifecycle* FRs; the Roles, Custom fields, Access preview, My time off, and Absence calendar surfaces. *(`PM-FR-9` moved into scope as Epic 4 — see the 2026-09-03 amendment in Overview above; it no longer belongs in this list.)*

### Scope decisions (product owner, 2026-09-02)

Seven decisions. SD-1 through SD-5 were taken at Step 1 confirmation; SD-6 was added at Step 2 after a steelmanning pass on the epic structure; SD-7 at Step 3. They bind epic and story design and are not re-opened downstream without a new decision.

- **SD-1 — Dashboard composability is an open conflict, not scope.** PM/AD-33 ratifies **four fixed read models** with **no generic widget engine**, while EXPECTED UX (EXPERIENCE.md §Component Patterns) shows `Dashboard customize mode`, a widget catalog, drag handles, and a `custom dashboards` tab. **Disposition: recorded as an open UX↔architecture conflict; no story in this slice implements or designs dashboard customization.** Neither side is declared the winner here — resolving it requires a PM/AD-33 amendment or a UX spine revision, owned outside this slice.
- **SD-2 — Dashboard stories deliver shell + read-model contract only.** Because every `PM-FR-15` widget except headcount sources from a `uncovered` FR (`PM-FR-19`–`PM-FR-22`, `PM-FR-23`–`PM-FR-25`, `PM-FR-36`, `PM-FR-37`) and PM/AD-10 lacks project/department traversal, dashboard stories deliver: the role-scoped shells (two in Epic 2, two in Epic 3 per SD-6), the fixed read-model **contract**, and only those widgets whose source data exists today. Every absent source renders an **explicit degraded or empty state** per UX-DR12/UX-DR16 — never a fabricated or zero-valued counter presented as real.
- **SD-3 — Extended precondition set.** Stories carry the four named inherited gates **plus** the architecture-derived preconditions (see *Precondition set* below). The four named gates are labelled `inherited` with their source FR, because `PM-FR-8`/`10`/`11`/`15`–`18` carry **empty `gates:`** in the coverage model.
- **SD-4 — Bulk People Partner assignment is excluded.** UX-DR24 (Flow 3, step 4) shows a bulk bar offering "Assign people partner". PRD FR-7 states the four organisational facts "are **not writable through S1 or inline directory editing**" and must change on a dedicated organisational-relationships screen; `PM-FR-7` is outside this slice and has no UX surface. **The bulk action bar in this slice exposes no organisational-relationship mutation.** Recorded as a UX contract defect.
- **SD-5 — Shared views carry configuration, not results.** PRD `PM-FR-10` states views are "shareable with other managers" but is silent on a recipient with a narrower tier. **Decision: a shared view transports only the filter+column configuration.** Rows and columns re-resolve against the *recipient's* tier on every open; a column or filter the recipient is not entitled to is dropped with an explicit indication rather than silently applied. A shared view never replays the owner's result set, and never becomes a side channel for values the recipient's own tier would withhold (UX-DR23).
- **SD-6 — Epics split on the PRD's own grouping axis, and the response-projection cutover is a slice-level precondition.** An initial two-epic structure (directory / all dashboards) was rejected on two grounds. First, a single dashboards epic could not "deliver COMPLETE functionality for its domain" under SD-2, making it a technical-contract deliverable rather than an epic. Second, its boundary was drawn on delivery readiness rather than product structure. **Decision: three epics, split on PRD §4.5's own sentence — "Grouping dimension differs: people (UM, PP) vs project (DM, PM)"** — which coincides exactly with where the access gates fall (people-grouped runs on existing Phase-0 reporting-line and direct-PP traversal; project-grouped is blocked on `TT-IDENTITY-01` P0, `TT-PMDM-01`, and absent PM/AD-31 sync). **Additionally: the `GET /users` response-projection and `SEC-AUTH-01` target-auth cutover is a precondition of the whole slice, not an Epic 1 deliverable** — so no epic depends on another epic's precondition work while claiming to be standalone.

- **SD-7 — Epic 3 carries no stories until its P0 closes.** Story creation for `PM-FR-16`/`PM-FR-17` was deliberately **not** performed. With PM/AD-10 lacking project traversal, PM/AD-31 leaving project membership with no writer, and `TT-IDENTITY-01` open as a P0, acceptance criteria for the project axis would be written against a data model that does not exist and would be rewritten on contact with the real one. **Disposition: Epic 3 is specified at epic level only. `PM-FR-16` and `PM-FR-17` are covered by an epic but by no story, deliberately.** Story creation for Epic 3 is a separate exercise, triggered by `TT-IDENTITY-01` closing. This is a recorded gap, not an oversight — see the Epic 3 section.

### Slice-level preconditions (per SD-6)

These are **not** deliverables of any epic in this slice, and no epic is standalone with respect to them. Every epic here consumes them, so they are stated once.

| Precondition | Severity / status | Why it precedes every epic |
|---|---|---|
| `SEC-AUTH-01` — interim target-auth cutover | **P0 open** | `isAllowedForTarget` returns `Boolean(userId)`, permitting every operation on every target, and the interim session resolver self-provisions a privileged `position: 'HR Admin'` account. Any directory or dashboard read surface built on the interim adapter inherits both. |
| Audience-safe response projection | ratification §4.2 `absent`; PM/AD-34 `partial` | Whole-row `User` serialization can expose technical/non-S1 fields on **all six** existing handlers, **including `GET /users`** — the exact endpoint a directory engine extends and dashboard people-tables read through. |

Owner: `user-management` / `access-control` contexts. This slice does not schedule the cutover; it declares the dependency and fails closed without it.

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
| `QUALITY-GATE-AC` | **closed 2026-09-02** | Was P0. `gate-decision.json` shows `gate_status=PASS`, `p0_status=MET`, `critical_open=0`; ACM3-II-04/05/06 each carry independently approved Stage-2 evidence. No longer a precondition on any story here |
| `QUALITY-GATE-AC-NFR` | **closed 2026-09-02** | Was P1. NFR-3 / SM-4 proven by ACM-9 final (`acm9-final-…ff94a3e685d1.json`, PASS, 500 targets, warm p95 11.603 ms). **Closure is pinned to resolver revision `f89e034`** — any change under `services/backend/src/access-control/**` invalidates it and requires an ACM-9 rerun |
| `OQ-PERM-01` | P1 open | "view each dashboard type" is an FR-6 permission; default grants unapproved — **do not seed or infer grants** |
| `CONFLICT-UM-01` | P1 open (implementation stale) | PM/AD-24 "list endpoints omit invisible rows"; runtime still diverges |
| `PM/AD-32` | design closed, impl `transition-debt` (TD-12) | Custom-field storage behind `PM-FR-8` |
| `PM/AD-33` | design closed, impl **`absent`** | The four dashboard read models |
| `PM/AD-35` | design closed, impl **`absent`** (no table) | Department entity behind `PM-FR-18` grouping |

**Additional leak precondition (finding, not a registered gate):** `PM-FR-8` requires custom-field columns and filters, UX-DR23 bans inferring hidden custom-field values through filter side channels, but `PM-FR-5` (custom-field visibility inheritance) — `specified` 2026-09-03 via `user-management/epics.md` `UM-E6`/`UM-E7` — has not shipped `UM-E7` yet. Custom-field filtering cannot ship ahead of `UM-E7`'s visibility enforcement without a NFR-1 critical leak.

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
| `PM-FR-8` — Universal filter and column model | Epic 1 | Sortable columns, multi-select filters, name search, column picker over entitled standard and derived fields; custom-field columns/filters sequenced last behind the `PM-FR-5` visibility precondition (`specified` 2026-09-03 via `UM-E6`/`UM-E7`; unshipped `UM-E7` is the live blocker) |
| `PM-FR-10` — Saved and shared directory views | Epic 1 | Named owner-scoped view tabs, "New view", share-with-manager, per-viewer re-resolution on open |
| `PM-FR-11` — Visibility-safe XLSX export | Epic 1 | `.xlsx` of the current view containing only exporter-entitled columns; flow specified in-story (UX-DR8 records the mock as button-only) |
| `PM-FR-15` — Unit Manager dashboard | Epic 2 | People-grouped shell over existing reporting-line traversal + read-model contract + source-backed widgets; absent sources render explicit degraded/empty states (SD-2) |
| `PM-FR-18` — People Partner dashboard | Epic 2 | Direct-PP scope, people grouping, **resourcing block absent by construction**; department grouping is a `DEPARTMENT-EDGE`-gated story, project grouping defers to Epic 3's axis |
| `PM-FR-16` — Delivery Manager dashboard | Epic 3 | Project-grouped shell, project selector recalculating page counters, **Unassigned** bucket included in All-project counters; per SD-2 |
| `PM-FR-17` — Project Manager dashboard | Epic 3 | DM configuration scoped to the PM's own projects; per SD-2 |
| PRD §4.5 feature NFR — tier resolution per referenced employee | Epic 2 + Epic 3 | Every widget resolves tier per referenced employee; `.wscope` footer states the policy evaluated |
| NFR-1 (leak = critical), NFR-2 (seeded data only) | All epics | Negative tests per audience on list rows, export columns, and widget payloads; seeded population only |
| NFR-3 / SM-4 (2s at 500+ rows incl. permission resolution) | Epic 1 **+ Epic 2** | Binds both, because the `PM-FR-15` people-table is the same read model as the directory (see *Shared read model* below). Evidence is measured **once on the shared read model**, not per surface; `QUALITY-GATE-AC-NFR` precondition |
| NFR-4 (graceful integration degradation) | Epic 1 + Epic 3 | Timetracker-stale amber banner with 4h project-access fallback (UX-DR16); Epic 3 owns the project-access withdrawal path |
| NFR-5 (responsive + accessible), NFR-6 (English only) | All epics | UX-DR17–UX-DR21 |
| NFR-7 (revocation timing) | All epics | Immediate functional-permission revocation and next-request relationship effect; PM/AD-25 TD-11 five-minute `staleTime` recorded as the divergence to close. The 15-minute project-derived window and 4-hour withdrawal are Epic 3's. |
| UX-DR1–UX-DR3 (nav, page header band, provenance) | Epic 1 | Shared chrome **delivered** here; Epics 2–3 consume it read-only without modifying it |
| UX-DR4 (directory table) | Epic 1 — **partial** | Sort, filters, search, view tabs, Colleague toggle, and row-hover accent covered. **Row selection and bulk action bar deferred** — SD-4 removes their only specified action; see the Epic 1 UX-DR4 disposition |
| UX-DR5–UX-DR8, UX-DR14, UX-DR15 | Epic 1 | Column picker, saved views, Colleague-view banner, export action, empty-filter state |
| UX-DR24 (Flow 3) | Epic 1 — **partial** | Steps 1–3, 5 and the failure path covered across 1.1/1.3/1.5/1.6. **Step 4 (bulk bar) deferred** per SD-4 |
| UX-DR16 (timetracker stale) | Epic 1 + Epic 3 | Extended to the directory in Story 1.2 as an addition beyond EXPERIENCE.md (NFR-4 binds Epic 1); Epic 3 owns the four-hour project-access withdrawal |
| UX-DR9–UX-DR13 | Epic 2 + Epic 3 | Epic 2 establishes preset tabs, `.wscope`, mono stat values, and the empty state; Epic 3 adds the project grouping-dimension switch |
| UX-DR17–UX-DR23 | All epics | Accessibility floor, responsive behaviour, microcopy register, banned patterns as negative tests |
| **Slice-level preconditions (no epic)** | — | `SEC-AUTH-01` target-auth cutover; audience-safe response projection (SD-6) |
| **Not covered in this slice** | — | `PM-FR-9` (no UX surface); dashboard customization (SD-1); bulk organisational-relationship mutation (SD-4); every widget source FR (`PM-FR-19`–`PM-FR-27`, `PM-FR-30`, `PM-FR-31`, `PM-FR-35`–`PM-FR-37`) |

## Epic List

Four epics. The first three split on two product-sourced boundaries rather than on delivery readiness (SD-6); the fourth (added 2026-09-03) is a write capability layered onto Epic 1's read surface.

**Boundary 1 — audience.** PRD §4.3 makes the directory a "single list page for **all authenticated employees**", serving every tier down to Colleague. PRD §4.5 dashboards serve only functional-role holders (UM/DM/PM/PP). Different user populations with different jobs-to-be-done (§2.1), so the directory is its own epic.

**Boundary 2 — grouping dimension.** PRD §4.5 states it directly: *"Grouping dimension differs: people (UM, PP) vs project (DM, PM)."* That line also coincides exactly with where the access gates fall — people-grouped scope runs on the reporting-line and direct-PP traversal that **exists** in PM/AD-10 Phase-0, while project-grouped scope is blocked on `TT-IDENTITY-01` (P0), `TT-PMDM-01`, and absent PM/AD-31 sync. Splitting here keeps the people-grouped epic genuinely completable and makes the P0 blockage visible at epic altitude instead of buried in a story precondition.

Within each epic the FRs target the same core files, so none is split further. `PM-FR-15`/`PM-FR-18` and `PM-FR-16`/`PM-FR-17` remain "one dashboard engine" per §4.5 — Epic 3 extends Epic 2's read models with a second grouping axis rather than building a parallel engine.

### Shared read model (Epic 1 ↔ Epic 2)

`PM-FR-15` specifies a "people table with risk and trend, project, leave status". That is the **same read model** the directory serves under `PM-FR-8`, scoped to the viewer's reporting line — a Unit Manager's dashboard people-table is effectively a saved view (`PM-FR-10`) of the directory over their own unit. Epics 1 and 2 therefore share more than page chrome; they share the row read model itself.

Consequences that bind story design:

- **NFR-3 binds Epic 2 as well as Epic 1.** The 2-second/500-row budget including permission resolution applies wherever this read model is served.
- **The 500-row performance evidence is produced once**, against the shared read model, and referenced by both epics. Two per-surface measurements of the same query path are duplicate evidence, not independent coverage.
- **Epic 2's people-table is substantially cheaper than a from-scratch widget** once Epic 1's projection and view engine exist — but cost is not the boundary rationale. `PM-FR-18` still scopes on PP assignment, groups by department, and excludes resourcing by construction, so the two epics remain distinct user outcomes (SD-6).
- Divergence between the directory row projection and the dashboard people-table row projection is a **defect**, not a design choice.

### Epic 1: Permission-Safe People Directory

Any authenticated employee — down to Colleague tier — can find and review people through a single All Employees list whose columns, filters, sorting, saved views, and export never exceed their resolved access tier, and which states where its data came from.

**FRs covered:** `PM-FR-8`, `PM-FR-10`, `PM-FR-11`

**Audience:** all authenticated employees (PRD §4.3). This is the only surface in the slice available below functional-role level.

**Also delivers, as named deliverables consumed read-only by Epics 2–3:** the shared page chrome — `.pghd` page header band (`{components.page-header-band}`) and `.prov` provenance tags (`{components.provenance-tag}`) per UX-DR2/UX-DR3. Later epics consume this chrome without modifying it, so the sharing is incidental rather than a cross-epic dependency.

**Also delivers:** the **shared row read model** that Epic 2's people-table consumes (see *Shared read model*); the Colleague-view whitelist demonstration surface; the NFR-3 two-second/500-row budget with measured evidence produced **once** here and referenced by Epic 2; UX-DR24 (Flow 3) end-to-end.

**Standalone:** yes, given the slice-level preconditions. Extends the existing `GET /users` surface over the seeded population and requires no dashboard, resourcing, or risk-management work to be useful.

**Enables (without depending on):** the page chrome for Epics 2–3; and, outside this slice, `PM-FR-20` campaign audience selection and `PM-FR-31` CDS directory filters, both of which the PRD routes through this filter engine.

**Implementation notes:** custom-field columns and filters are ordered **last**, behind the `PM-FR-5` visibility precondition — `PM-FR-8` filtering on custom fields ahead of visibility enforcement is an NFR-1 critical leak via the side channel UX-DR23 bans. Export must be specified in-story rather than inferred from the mock, which is button-only (UX-DR8). Shared views transport configuration and re-resolve per recipient (SD-5). The bulk action bar exposes no organisational-relationship mutation (SD-4).

> **Coverage-model note.** Epic 1 can plausibly carry `PM-FR-10` and `PM-FR-11` to full coverage. `PM-FR-8` reaches full coverage only for standard and derived fields; its custom-field clause stays partial until `user-management`'s `UM-E7` ships (`PM-FR-5` itself moved `deferred`→`specified` 2026-09-03, but a specified owner is not a shipped dependency).

### Epic 2: People-Grouped Dashboards (Unit Manager, People Partner)

A Unit Manager or People Partner opens a dashboard grouped by **people** — their reporting line or their assigned employees — that states the access policy behind every number and is explicit about which data sources are not yet connected.

**FRs covered:** `PM-FR-15`, `PM-FR-18`, plus the PRD §4.5 feature NFR

**Why these two together:** both group by people (§4.5), and both run on audiences that **already exist** in PM/AD-10 Phase-0 — reporting line for UM, direct People Partner for PP. Neither needs project traversal or timetracker sync to resolve its population.

**Scope per SD-2:** the two role-scoped shells, the PM/AD-33 fixed read-model **contract**, and only those widgets whose source data exists. Every absent source renders an explicit degraded or empty state (UX-DR12/UX-DR16) — never a fabricated or zero-valued counter presented as real.

**Scope per SD-1:** no customize mode, no widget catalog, no drag-and-drop, no custom dashboards.

**Standalone:** yes, given the slice-level preconditions. Consumes Epic 1's chrome read-only; requires none of Epic 1's saved views or export, and requires nothing from Epic 3.

**Implementation notes:** the UM people-table consumes Epic 1's shared row read model rather than defining its own — divergence between the two projections is a defect, and NFR-3 binds this epic through that shared model. The PP dashboard's **resourcing block is absent by construction**, not hidden — PRD §4.5 excludes it from the PP configuration. PP department grouping is a single `DEPARTMENT-EDGE`-gated story (PM/AD-35 has no table); PP project grouping defers to Epic 3's axis. UM scope over department-managed people is likewise `DEPARTMENT-EDGE`-gated, while UM scope over the reporting line is not. "View each dashboard type" is an FR-6 permission whose default holders are unapproved (`OQ-PERM-01`) — grants must not be seeded or inferred. Risk-active ≠ `low` is already a fixed product fact and is not re-decided here.

> **Coverage-model honesty requirement.** Completing Epic 2 does **not** make `PM-FR-15` or `PM-FR-18` `implemented`. Their PRD §4.5 widget sets source from `PM-FR-19`–`PM-FR-22`, `PM-FR-36`, and `PM-FR-37`, all `uncovered`. Record partial coverage with an evidence pointer and an explicit list of unsourced widgets — not completion.

### Epic 3: Project-Grouped Dashboards (Delivery Manager, Project Manager)

> ## 🛑 NOT STARTABLE — DO NOT ENTER A SPRINT
>
> **`TT-IDENTITY-01` is an open P0.** PM/AD-10 has no project traversal and PM/AD-31 leaves project membership with no writer. This epic has an epic number for traceability **only**.
>
> **Binding rule:** no story in this epic may be registered in `sprint-status.yaml`, assigned, or estimated until `TT-IDENTITY-01` is closed in `blockers.yaml` **and** a project-membership writer exists. An epic number is not a schedule. If this epic appears in a sprint plan while the P0 is open, that plan is wrong.
>
> This banner exists because giving blocked work an epic number is itself a way for a blocker to stop feeling like a blocker.

A Delivery Manager or Project Manager opens a dashboard grouped by **project** — one table per project, with a project selector that filters the whole page — scoped to the projects they are responsible for.

**FRs covered:** `PM-FR-16`, `PM-FR-17`

**Why separate from Epic 2:** the entire project axis is blocked. PM/AD-10 lacks project traversal, PM/AD-31 leaves project membership with no writer, and `TT-IDENTITY-01` is an open **P0**. Placing this work in its own epic makes that blockage visible at epic altitude, and Epic 2's read-model contract is legitimate early feedback that could change this epic's direction — which is exactly the condition under which the workflow permits a split.

**Scope per SD-2 and SD-1:** as Epic 2 — shells and read models extending Epic 2's contract with the project grouping axis; no customization surface.

**Standalone:** yes in scope, but **not startable** until `TT-IDENTITY-01` (P0) closes and a project-membership writer exists. It requires no later epic.

**Implementation notes:** `PM-FR-17` is the DM configuration scoped to the PM's own projects, so it is a scope narrowing of `PM-FR-16` rather than a second engine. The **Unassigned** bucket for project-less requests, and its inclusion in All-project counters, is a fixed product fact. This epic owns the NFR-7 project-derived timing behaviour: 15-minute propagation, last-known data behind the stale banner, and withdrawal of all project-derived access after four hours of failed sync (UX-DR16). Resourcing-request widgets on both dashboards source from `PM-FR-23`–`PM-FR-25`, all `uncovered`.

> **Coverage-model honesty requirement.** As Epic 2, and stronger: with `TT-IDENTITY-01` open, `PM-FR-16` and `PM-FR-17` cannot reach even partial *runtime* coverage. Until that P0 closes, this epic's artifacts are specification evidence only.

### Epic 4: Inline Directory Editing

*(added 2026-09-03 — see the Overview amendment above)*

An authenticated employee with edit rights on a field changes it directly from the All Employees table, without opening the full profile, and the write is enforced by the same access matrix that governs reading it.

**FRs covered:** `PM-FR-9`

**Why this epic exists.** `PM-FR-9` was recorded in this slice's own original scope decisions as explicitly out of scope, because EXPERIENCE.md's prototype table is read-only and the requirement carried no surface. That gap has not been designed since; this epic covers the requirement's data and access-control behaviour and states plainly where the UX contract still has nothing to say.

**Depends on (outside this slice):** `role-administration/epics.md` Epic RA-E1 — the permission catalog and `isAllowed` must exist, carrying the `user-management:edit` key, before this epic's dual-gate check has anything to evaluate. `user-management/epics.md` Epic UM-E7 — custom-field columns must be visibility-safe before they can also become editable (Story 4.3).

**Standalone:** partially. Stories 4.1–4.2 (standard and derived field editing) require only RA-E1. Story 4.3 (custom-field editing) additionally requires UM-E7.

**Implementation notes:** the write path reuses Epic 1's `canEdit` envelope contract (AD-34) for section-level gating, but the three access-switch fields (manager, People Partner, department — PM-FR-7) are excluded by an explicit, hard-coded rule independent of section `RW` — AD-34 as adopted expresses section-granularity only, and this epic must not assume it silently produces field-level carve-outs. Denial follows the platform's single HTTP oracle (PM-FR-4): `404` for a field absent from the response body entirely, `403` for a field that is visible but not editable, revealing nothing about the actor's own permission set beyond that. No UX flow exists for this epic's interaction, error, or conflict states — EXPERIENCE.md records the prototype table as read-only — so Story 4.2 specifies them directly rather than inferring them from a mock, matching the standard this slice already applied to Story 1.7's export flow (UX-DR8).

> **Coverage-model note.** Completing Epic 4 alone does not make `PM-FR-9` fully evidenced end-to-end: it depends on RA-E1 (permission catalog) existing and, for the custom-field clause specifically, on UM-E7 (anti-inference) as well. Record `PM-FR-9` as `specified`, not `implemented`, until both dependencies close.

### Epic Dependency Graph

- Slice-level preconditions (`SEC-AUTH-01`, audience-safe projection) → **all epics**
- Epic 1 → delivers shared chrome → consumed read-only by Epic 2, Epic 3
- Epic 1 → delivers the **shared row read model** + its single NFR-3 evidence run → consumed by Epic 2's people-table
- Epic 1 → delivers the `canEdit` envelope contract (AD-34) → consumed by Epic 4
- Epic 2 → establishes the PM/AD-33 read-model contract → extended by Epic 3
- `TT-IDENTITY-01` (P0) + project-membership writer → **Epic 3 only — hard sprint-entry block**
- `DEPARTMENT-EDGE` → Epic 2's PP department-grouping story and UM department-managed scope only
- `role-administration/epics.md` Epic RA-E1 (external slice) → **Epic 4 — hard dependency**, catalog and `isAllowed` must exist before any dual-gate check has an evaluator
- `user-management/epics.md` Epic UM-E7 (external slice) → **Epic 4 Story 4.3 only**

No epic requires a later epic to function. Epic 3 is not startable while its P0 is open.

---

## Epic 1: Permission-Safe People Directory

**Status:** backlog
**Slice-level preconditions:** `SEC-AUTH-01` target-auth cutover and audience-safe response projection (see *Slice-level preconditions*). No story below may reach production evidence while either is open.

Any authenticated employee — down to Colleague tier — can find and review people through a single All Employees list whose columns, filters, sorting, saved views, and export never exceed their resolved access tier, and which states where its data came from.

**FRs covered:** `PM-FR-8`, `PM-FR-10`, `PM-FR-11`
**NFRs engaged:** NFR-1, NFR-2, NFR-3/SM-4, NFR-4, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** UX-DR1–UX-DR8, UX-DR13–UX-DR15, UX-DR17–UX-DR24

**Accessibility posture:** UX-DR17–UX-DR21 are acceptance criteria on stories, not a trailing polish story. The floor lands in Story 1.2; each later story adds only the criteria its own new pattern introduces.

**UX-DR4 disposition — row selection and the bulk action bar are DEFERRED, not dropped.** UX-DR4 specifies row-checkbox selection raising a bulk action bar, and UX-DR24 (Flow 3, step 4) gives its only specified action: "Assign people partner". SD-4 removes that action, because PRD FR-7 forbids changing organisational facts through inline directory editing. No other in-scope action remains, so shipping the control would deliver an empty affordance. **UX-DR4 is therefore recorded as partially covered in this slice**, with row selection and the bulk bar deferred until an in-scope bulk action exists. This is a recorded reduction against the UX contract, not an oversight.

**NFR-4 extension beyond the UX contract.** EXPERIENCE.md places the stale sync banner only on My time off and Absence calendar, yet the directory renders timetracker-sourced leave and project columns behind a "Synced · leave & projects" provenance tag. Story 1.2 therefore extends the stale banner to this surface. **This is an addition beyond EXPERIENCE.md §Component Patterns**, made because NFR-4 binds Epic 1, and should be reconciled into the UX spine on its next revision. Epic 3 still owns the four-hour project-access withdrawal behaviour itself.

> **Registration items still open for this slice** (not stories — they serve no PM-FR): the `PMC-E*` namespace is unregistered in PRD §0.2 and in the coverage model's `namespace_rules` / `source_slices`, and no `_bmad-output/implementation-artifacts/platform-capabilities/sprint-status.yaml` tracker exists yet. Both must be closed before any story here enters a sprint.

### Story 1.1: Tier-Safe Directory Rows

**ID:** `PMC-E1-S1.1` · **Sprint key:** `1-1-tier-safe-directory-rows`

As an authenticated employee,
I want to open All Employees and see a list of people assembled from only what my access tier permits,
So that I can find colleagues without the platform ever showing me — or telling me about — data outside my entitlement.

**Note:** split at Step 4 validation. This story owns the shared row projection, its authoritative leak matrix, and pagination; Story 1.2 owns page chrome and the presentation floor over these rows.

**Acceptance Criteria:**

**Given** I am an authenticated active employee with no functional role and no reporting-line, project-line, or People Partner relationship to anyone
**When** I open All Employees
**Then** every row renders exactly the Colleague whitelist — S1 identity, S10 dates only, S11 project name only
**And** risk, grade, and every other non-whitelist field is absent from the API response body rather than hidden in the client

**Given** the list is assembled for any viewer
**When** the response is built
**Then** rows the viewer may not see are omitted from the payload entirely, not returned as nulls or denial markers
**And** the row projection is the single shared read model that Epic 2's people-table consumes, with no second projection of the same fields

**Given** this projection is the single coupling point consumed by Stories 1.3, 1.4, 1.6, 1.7, 2.1, and 2.3
**When** its leak behaviour is verified
**Then** an exhaustive negative matrix over audience × field × target-tier is executed **against the projection itself**, and that matrix — not any per-surface check — is the authoritative NFR-1 leak test
**And** consumer stories assert only that they delegate to this projection and add no field access of their own, because several shallow per-surface assertions about one function can all pass while the function is wrong in a case none of them exercises
**And** the matrix covers the Colleague whitelist boundary, closed-section fields, and mixed-tier result sets in which one viewer holds different tiers over different targets within a single response

**Given** a viewer holding Reporting-line tier over some targets and Colleague tier over others in one list
**When** the response is assembled
**Then** each row is projected against that viewer's tier **for that specific target**, resolved per target rather than once per request

**Given** an employee whose employment status is `dismissed` with a past effective date
**When** I open All Employees with no filters
**Then** that employee is absent from the default list
**And** they remain reachable through an explicit employment-status filter

**Given** an entitled result set larger than one page
**When** the list is served
**Then** results are paginated with a defined page size, and filtering and sorting are applied to the whole entitled set **before** paging rather than within a page
**And** ordering is stable across pages, so no row is duplicated or skipped when paging through an unchanged result set
**And** the total count reflects the entitled set, not the current page

**Given** the list has resolved
**When** rows render
**Then** each row displays its entitled fields in a table, sufficient for me to find a person — page chrome, responsive behaviour, and the accessibility floor arrive with Story 1.2 and are not preconditions of this story

### Story 1.2: Directory Page Chrome and Presentation Floor

**ID:** `PMC-E1-S1.2` · **Sprint key:** `1-2-directory-page-chrome-and-presentation-floor`

As an employee using the directory on any device or with assistive technology,
I want the page to state which area I am in and where its data came from, and to work at every breakpoint with a keyboard and a screen reader,
So that I can use the directory regardless of device or assistive technology, and can tell what is synced rather than authoritative.

**Note:** split from Story 1.1 at Step 4 validation. Story 1.1 owns the row projection, its leak matrix, and pagination; this story owns everything presentational over those rows. The accessibility floor lands here rather than in a trailing polish story, and later stories add only the criteria their own new patterns introduce.

**Acceptance Criteria:**

**Given** the page is loading
**When** data has not resolved
**Then** a shadcn `Skeleton` matching the table layout renders, not a spinner or blank region

**Given** the page has rendered
**When** I inspect the page header band
**Then** `.pghd` shows a mono eyebrow `PEOPLE / ALL EMPLOYEES` in `{typography.page-eyebrow}`, a title in `{typography.page-title}`, a one-line lead in `{typography.page-lead}`, and a `{colors.stretch-blue}` accent tick
**And** a `.prov` provenance tag is visible in the header carrying a text label stating that leave and project data comes from the timetracker — not colour-only and not tooltip-only
**And** this chrome is the shared deliverable that Epics 2 and 3 consume read-only without modifying it

**Given** any viewport
**When** I navigate by keyboard only
**Then** focus rings use `{colors.ring}`, tab order follows visual layout, and the header announces area and screen from the eyebrow to a screen reader

**Given** `prefers-reduced-motion: reduce`
**When** I interact with rows, buttons, or navigation
**Then** every transition and animation is disabled

**Given** viewport widths at `≥lg`, `md`, and `<md`
**When** the page renders
**Then** `≥lg` shows the full sidebar, `md` collapses it to icons, and `<md` moves it to a `Sheet` with the table scrolling horizontally

**Given** microcopy anywhere on the page
**When** it references synced or access-gated data
**Then** it names the source or the rule in the permission-literate register, and never uses motivational HR phrasing or an unsourced freshness claim

**Given** timetracker sync is stale and the list carries leave or project columns
**When** the page renders
**Then** an amber stale banner states the last sync time and warns that project-derived access falls back after four hours, announced assertively to screen readers
**And** stale timetracker data never takes the directory down — last-known values render behind the banner rather than erroring the page

**Given** an employee name containing Cyrillic characters, diacritics, bidirectional text, or a length at the field maximum
**When** the row renders
**Then** the name renders intact without breaking column alignment or overflowing its cell, truncating visibly with the full value available rather than clipping silently

**Given** a table row
**When** I hover it
**Then** a left accent inset (`box-shadow: inset 2px 0 0 var(--accent)`) renders, and no drop shadow is used

**Given** any list state in this slice
**When** rows render
**Then** no row-selection checkbox and no bulk action bar are present — both are deferred out of this slice (see the epic's UX-DR4 disposition)

### Story 1.3: Sort, Filter, and Search the Directory

**ID:** `PMC-E1-S1.3` · **Sprint key:** `1-3-sort-filter-and-search-the-directory`

As a directory user,
I want to sort, filter, and search the list by the fields I am entitled to see,
So that I can narrow 500+ people to the ones I actually need.

**Acceptance Criteria:**

**Given** the directory has rendered
**When** I click a sortable column header
**Then** the sort toggles ascending then descending, applied server-side across my entire entitled row set rather than only the loaded page

**Given** a field I am entitled to see for no target
**When** I inspect sort and filter options
**Then** the field is absent from both — not present and disabled

**Given** a multi-select filter
**When** I select one or more values
**Then** the list filters immediately with no separate apply step

**Given** any filter is applied
**When** the result set is computed
**Then** filtering runs over the row set already produced by Story 1.1's shared projection, and this story adds no field access of its own
**And** leak verification for those fields is the projection-level negative matrix rather than a filter-specific assertion

**Given** a derived field such as years with company
**When** I sort or filter on it
**Then** it behaves as a first-class sortable column and filter

**Given** a derived date-based field and a threshold filter such as five or more years
**When** membership is computed
**Then** the computation uses a single declared timezone rather than the viewer's local timezone, so the same filter returns the same set for every viewer and for the same saved view opened anywhere
**And** an employee hired on 29 February has a defined anniversary rule, so their membership does not depend on whether the current year is a leap year

**Given** I type a name search term matching no entitled row
**When** results return
**Then** the table shows zero rows, the message "No people match these filters", and a clear-filters action restoring the default view

**Given** a name search term matching an employee whose existence is hidden from me
**When** results return
**Then** that employee is absent
**And** the property is **falsified by procedure rather than asserted**: a request for a known-hidden target must return an identical response shape, an identical total count, and a timing envelope indistinguishable from a request for a non-existent identifier
**And** because `CONFLICT-UM-01` records the runtime still diverging from PM/AD-24's list-omission rule, this test runs against the runtime and not only against the intended contract

### Story 1.4: Entitled Column Picker

**ID:** `PMC-E1-S1.4` · **Sprint key:** `1-4-entitled-column-picker`

As a directory user,
I want to choose which columns the list shows from the fields I am entitled to see,
So that I can shape the table around the question I am answering.

**Acceptance Criteria:**

**Given** I open the column picker
**When** the available column list is built
**Then** it offers every standard and derived profile field I am entitled to see for at least one target, and no field I am entitled to see for none

**Given** I hold Colleague tier over every target
**When** I open the column picker
**Then** only whitelist columns are offered — S1, S10 dates only, S11 project name only

**Given** custom fields exist in the system
**When** I open the column picker in this story's scope
**Then** custom fields are not offered; they arrive with Story 1.8 behind its gate

**Given** I select and deselect columns
**When** the selection changes
**Then** the table renders the chosen set, and the change does not alter which rows are returned

**Given** I attempt to deselect every column
**When** the selection would reach zero columns
**Then** at least one identity column remains selected and cannot be removed, so neither the table nor an export can reach a column-less state

**Given** I have selected columns
**When** the page re-renders within my session
**Then** the selection persists for the session; durable named persistence is Story 1.6's saved views, not this story

**Given** the column picker is open
**When** I operate it by keyboard
**Then** it is arrow-key navigable and returns focus to its trigger on close

### Story 1.5: Colleague-View Toggle and Whitelist Banner

**ID:** `PMC-E1-S1.5` · **Sprint key:** `1-5-colleague-view-toggle-and-whitelist-banner`

As any directory user,
I want to switch the list into Colleague view and see exactly what a colleague would see,
So that I can confirm for myself that restricted data does not leak to colleagues.

**Acceptance Criteria:**

**Given** I am any authenticated employee viewing the directory
**When** I toggle Colleague view on
**Then** the list re-renders with the Colleague whitelist column set, and the control is available to every viewer as self-inspection rather than being restricted to an administrative role

**Given** Colleague view is on
**When** the response is assembled
**Then** the narrowing is applied server-side — the payload carries only whitelist fields, and the client never receives restricted values and then hides them

**Given** Colleague view is on
**When** I look for sort or filter options on non-whitelist fields
**Then** they are absent

**Given** Colleague view is on
**When** the banner renders
**Then** it explains which columns are whitelisted, states that risk, grade, and closed sections are never sent, and carries `role="status"` when toggled

**Given** Colleague view is on and I toggle it off
**When** the list re-renders
**Then** columns return only to my own entitled set — the toggle can narrow my view and can never widen it beyond my resolved tier

**Given** I hold only Colleague tier over every target
**When** I toggle Colleague view off
**Then** the column set does not change

**Given** I have left Colleague view on and expect a risk column
**When** I look for it
**Then** it is absent by design and the banner states why

### Story 1.6: Saved and Shared Directory Views

**ID:** `PMC-E1-S1.6` · **Sprint key:** `1-6-saved-and-shared-directory-views`

As a manager,
I want to save a filter and column configuration as a named tab and share it with another manager,
So that I can return to a recurring question without rebuilding it, and hand it to a peer.

**Acceptance Criteria:**

**Given** I have applied filters, a sort, and a column selection
**When** I choose "New view" and name it
**Then** the configuration is saved as a named tab owned by me and appears alongside the default view

**Given** a saved view I own
**When** I open it
**Then** filters, sort, and columns are restored, and rows are re-resolved through Story 1.1's shared projection against my current tier at open time rather than replayed from a stored result set

**Given** I share a saved view with another manager
**When** the recipient opens it
**Then** the view transports only the filter and column configuration, and rows and columns re-resolve against the **recipient's** tier

**Given** a shared view whose configuration references a column or filter the recipient is not entitled to
**When** the recipient opens it
**Then** that column or filter is dropped, and the recipient sees an explicit indication that part of the configuration did not apply — never silently applied, and never used to surface a withheld value

**Given** a saved or shared view whose configuration references a field that **no longer exists**
**When** the view is opened by its owner or a recipient
**Then** the missing field is dropped with the same explicit indication used for unentitled fields, and the view opens successfully rather than erroring
**And** the indication distinguishes "you are not entitled to this column" from "this column no longer exists", because the two have different remedies
**And** the rule is field-type agnostic, so it needs no change when Story 1.8 makes administratively deletable custom fields referenceable in a view

**Given** a shared view and a recipient whose tier over some subjects later narrows
**When** the recipient next opens the view
**Then** the narrowed tier is reflected without any action by the owner
**And** the open performs a **server-side revalidation** and is not satisfiable from client cache — PM/AD-25's TD-11 five-minute `staleTime` would otherwise let a cached response satisfy this criterion while violating NFR-7 for up to five minutes
**And** TD-11 is named in this story as the specific divergence the criterion exists to catch

**Given** a saved view I own and have shared
**When** I delete it
**Then** recipients no longer see it in their tab list on next load
**And** no recipient retains a stored result set, which follows from configuration-only sharing

**Given** the view tab strip
**When** I operate it by keyboard
**Then** tabs are arrow-key navigable as a segment control

### Story 1.7: Visibility-Safe XLSX Export

**ID:** `PMC-E1-S1.7` · **Sprint key:** `1-7-visibility-safe-xlsx-export`

As a directory user,
I want to export the current view to `.xlsx`,
So that I can work with the list outside the platform without exporting anything I am not entitled to see.

**Note:** UX-DR8 records the prototype as button-only, so this story specifies the flow rather than inferring it from the mock.

**Acceptance Criteria:**

**Given** a directory view with a column selection and active filters
**When** I trigger export
**Then** the generated `.xlsx` contains exactly the columns I am entitled to see and exactly the rows in my current filtered, entitled result set
**And** the column and row set is assembled from Story 1.1's shared projection with no export-specific field access
**And** because an exported file is durable and cannot be recalled by a deploy, a green projection-level negative matrix is a **release precondition for this story specifically**

**Given** the export has been generated
**When** the file is inspected
**Then** it contains no column absent from my rendered view, and no hidden sheet, cell comment, defined name, or file metadata carrying withheld values

**Given** entitlement for the export
**When** the file is built
**Then** entitlement is re-resolved server-side at export time rather than trusting the client's rendered column list

**Given** an export whose generation takes measurable time and my functional permission or relationship access is revoked partway through
**When** generation completes
**Then** entitlement is re-checked immediately before delivery and the file is **discarded undelivered** if entitlement no longer holds
**And** no partially-entitled file reaches me, because NFR-7 requires functional revocation to take effect immediately rather than at the next export

**Given** a view whose entitled result set exceeds the export row cap
**When** I trigger export
**Then** the request is refused with a message stating the cap and the current row count, and directs me to narrow the filters
**And** no truncated file is delivered, because a silently truncated export is indistinguishable from a complete one

**Given** an employee name containing Cyrillic characters, diacritics, bidirectional text, or a length at the field maximum
**When** the file is written
**Then** the value is written intact with correct encoding
**And** any value used in a sheet name is sanitized against the spreadsheet format's own restrictions without altering the corresponding cell value

**Given** Colleague view is on
**When** I export
**Then** the file contains only whitelist columns

**Given** I trigger an export
**When** generation does not complete immediately
**Then** the UI shows an explicit progress state and the trigger is disabled against double submission

**Given** export generation fails
**When** the failure surfaces
**Then** a shadcn destructive `Toast` states what failed in the permission-literate register, no partial file is delivered, and the view is unchanged

**Given** an export is produced
**When** the file is named
**Then** the filename identifies the view and the export timestamp and contains no employee personal data

**Given** an export at the 500+ row seeded scale
**When** it completes
**Then** its duration is recorded as this story's baseline measurement

### Story 1.8: Custom-Field Columns and Filters

**ID:** `PMC-E1-S1.8` · **Sprint key:** `1-8-custom-field-columns-and-filters`

> 🛑 **GATED — do not start.** Requires `user-management/epics.md` Epic `UM-E7` (visibility-safe filtering) to ship — `PM-FR-5` moved `deferred`→`specified` 2026-09-03 via `UM-E6`/`UM-E7`, but `UM-E7` itself is unshipped — **and** PM/AD-32 typed EAV storage to have replaced the TD-12 `User.customFields` jsonb bag. Shipping custom-field filtering ahead of visibility enforcement is an NFR-1 critical leak through the side channel UX-DR23 bans. Sequenced last in the epic for this reason.

As an HR Admin who has added a custom field,
I want that field usable as a directory column and filter without developer involvement,
So that the directory adapts to organisational data the product did not ship with.

**Acceptance Criteria:**

**Given** an HR Admin has added a custom field with visibility management, employee, or colleague
**When** any directory user opens the column picker
**Then** the field is offered only to viewers whose tier satisfies its visibility level, with no developer action or deploy required

**Given** a custom field whose visibility excludes me
**When** I inspect columns, sort options, and filter options
**Then** the field is absent from all three

**Given** a custom field whose visibility excludes me for a target
**When** I apply any combination of filters
**Then** no combination lets me infer that target's value for the excluded field, including by comparing result counts across filter permutations
**And** the differencing attack is **executed as a test rather than asserted as a property**: filter permutations that partition the excluded field's value space must produce result counts that do not vary with that field's value
**And** permutations are enumerated mechanically rather than sampled, because a sampled subset can pass while an unsampled permutation leaks

**Given** a custom field of a select type
**When** I filter on it
**Then** the offered option list contains only values I am entitled to see

**Given** a column or filter reads a custom field
**When** storage is accessed
**Then** it reads typed EAV storage per PM/AD-32 and not the `User.customFields` jsonb bag

### Story 1.9: Directory Performance Evidence at 500+ Rows

**ID:** `PMC-E1-S1.9` · **Sprint key:** `1-9-directory-performance-evidence-at-500-rows`

As a delivery team,
I want measured evidence that the shared directory read model meets the two-second budget at 500+ rows including permission resolution,
So that the NFR-3 claim rests on measurement rather than assumption — once, for every surface that consumes the model.

**Acceptance Criteria:**

**Given** a seeded population of 500+ employees with representative relationship breadth and depth, and no real personal data
**When** the shared directory read model is exercised across arbitrary filter, sort, and column combinations including permission resolution
**Then** p50, p95, and worst case are recorded together with query count, fixture breadth and depth, PostgreSQL version, and `EXPLAIN (ANALYZE, BUFFERS)` output

**Given** the list is paginated per Story 1.1
**When** the two-second budget is measured
**Then** the measured shape is stated explicitly — page size, whether the total count query is included, and whether the figure covers one page or the full entitled set
**And** the budget is measured against the shape the user actually experiences on first load, so "2 seconds at 500+ rows" cannot be satisfied by measuring a small page of a large set

**Given** the measurement run
**When** results are recorded
**Then** the first filter, sort, or column shape exceeding two seconds is identified explicitly, or the run records that none did within the tested envelope

**Given** the recorded evidence artifact
**When** `QUALITY-GATE-AC-NFR` is evaluated
**Then** the artifact is cited by path and the gate state reflects the measured result rather than a narrative claim

**Given** the evidence artifact exists
**When** Epic 2's people-table consumes the same read model
**Then** this run is the single evidence source for both surfaces and is referenced rather than repeated

**Given** a measured failure to meet two seconds
**When** the result is recorded
**Then** optimization opens as a separately gated story, and this story does not claim the NFR-3 or SM-4 threshold is met

---

## Epic 2: People-Grouped Dashboards (Unit Manager, People Partner)

**Status:** backlog

> ## 🛑 SPRINT-ENTRY BLOCKED — `OQ-PERM-01`
>
> PRD FR-6 lists "view each dashboard type" as a **functional permission**, and `PM-FR-1` requires functional roles to govern feature availability. `OQ-PERM-01` is open and states: *"Default role-to-permission matrix is not approved. Do not seed or infer grants."*
>
> `isAllowed` correctly returns `false` for unknown keys and absent grants. Gating the dashboard on its proper permission while seeding no grant therefore produces **working, correct, unreachable software** — a dashboard nobody can open.
>
> **Decision: the gate is implemented fail-closed, and this epic does not enter a sprint until the Product Owner approves dashboard-view grants.** No story below may seed or infer a permission grant to work around this. Deriving dashboard access from relationships instead was rejected — it contradicts `PM-FR-1`.

A Unit Manager or People Partner opens a dashboard grouped by **people** — their reporting line or their assigned employees — that states the access policy behind every number and is explicit about which data sources are not yet connected.

**FRs covered:** `PM-FR-15`, `PM-FR-18`, plus the PRD §4.5 feature NFR
**UX-DRs covered:** UX-DR9–UX-DR13, UX-DR16–UX-DR23
**Consumes from Epic 1:** the `.pghd` / `.prov` chrome (read-only, unmodified) and the shared row read model with its single NFR-3 evidence run.

**Source audit under SD-2.** Available today: headcount, the people table's identity columns, navigation shortcuts, People Partner scope, and resourcing-absent-by-construction. Unavailable: risk counts and the risk/trend column (`PM-FR-21`), action items (`PM-FR-19`), resourcing requests (`PM-FR-23`), campaigns (`PM-FR-20`), the project column (`PM-FR-37`, additionally `TT-IDENTITY-01`), and leave status (`PM-FR-36`). Story 2.2 exists to make that distinction visible to the user rather than to paper over it.

### Story 2.1: Unit Manager Dashboard — Scope, Headcount, and People Table

**ID:** `PMC-E2-S2.1` · **Sprint key:** `2-1-unit-manager-dashboard-scope-headcount-and-people-table`

As a Unit Manager,
I want a dashboard grouped by people that shows my headcount and a table of the people I am responsible for,
So that I can start Monday from my unit rather than from a search box.

**Acceptance Criteria:**

**Given** I am a Unit Manager holding the dashboard-view functional permission
**When** I open Workspace → Dashboards
**Then** the people-grouped Unit Manager dashboard renders scoped to the people I hold Reporting-line access over
**And** scope is resolved through the Access Control facade per target, never inferred from holding a functional role

**Given** I do not hold the dashboard-view functional permission
**When** I request the dashboard
**Then** access is denied fail-closed through `isAllowed`, with no fallback to relationship-derived access

**Given** the headcount widget renders
**When** it computes its value
**Then** it counts exactly the employees in my resolved Reporting-line scope, excludes `dismissed` employees, and displays the value in `{typography.data-stat}` mono

**Given** the people table renders
**When** rows are assembled
**Then** they come from Epic 1's shared row read model with no second projection of the same fields
**And** each row is projected against my tier for that specific target
**And** leak verification for those fields is Story 1.1's projection-level negative matrix; this story asserts delegation only

**Given** any widget on the dashboard
**When** it renders
**Then** a `.wscope` footer (`{components.widget-scope-footer}`) states in mono uppercase which access policy was evaluated for that widget

**Given** any widget on the dashboard
**When** its data is assembled
**Then** it returns no field and no person outside my resolved entitlement — a widget can never widen tier

**Given** the dashboard page header
**When** it renders
**Then** it uses Epic 1's `.pghd` band with eyebrow `WORKSPACE / DASHBOARDS`, a `{colors.stretch-blue}` accent tick, and a `.prov` tag stating that scope is resolved per request
**And** the chrome is consumed from Epic 1 unmodified

**Given** the dashboard preset tab strip
**When** it renders in this story's scope
**Then** it contains the Unit Manager preset only — Delivery Manager and Project Manager presets are absent until Epic 3, so no tab leads to an unavailable dashboard
**And** the strip is arrow-key navigable

**Given** the grouping-dimension control
**When** it renders for this preset
**Then** people grouping is the active dimension

**Given** the dashboard is loading
**When** data has not resolved
**Then** shadcn `Skeleton` placeholders matching the widget and table layout render

**Given** the people table at the 500+ seeded scale
**When** a performance claim is made
**Then** Story 1.9's evidence artifact is cited for the shared read model itself
**And** this story additionally measures its **scope-resolution delta** — the reporting-line walk that precedes the read model and that the directory's default view does not perform — because citing 1.9 wholesale would inherit a claim for work this surface does not do
**And** the fixture carries representative reporting-line depth, since deduplicated evidence also deduplicates any error in a shallow fixture

**Given** `prefers-reduced-motion: reduce`
**When** I interact with widgets or tabs
**Then** all transitions and animations are disabled

**Given** the customize affordances shown in the UX prototype
**When** the dashboard renders
**Then** no customize mode, widget catalog, drag handle, remove handle, or custom-dashboard tab is present

### Story 2.2: Unsourced Widget Slots Render Explicit Unavailable States

**ID:** `PMC-E2-S2.2` · **Sprint key:** `2-2-unsourced-widget-slots-render-explicit-unavailable-states`

As a Unit Manager or People Partner,
I want widget slots whose data source does not exist yet to say so plainly,
So that I never mistake "not implemented" for "nothing to worry about".

**Acceptance Criteria:**

**Given** the PRD §4.5 widget set specified for my dashboard
**When** the dashboard renders
**Then** each specified slot declares its availability from its source FR's state, and **the rendering rule keys on that provenance rather than on the value** — a zero means different things depending on whether it was measured or stood in for a missing source

**Given** a slot whose source FR is `uncovered`
**When** it renders
**Then** it shows an explicit unavailable state naming what is missing
**And** it never displays `0`, `—`, an empty chart, or any other value a reader could interpret as a measured result

**Given** a slot whose source data exists and whose measured value is legitimately zero — a Unit Manager with no direct reports, or a People Partner with no current assignments
**When** it renders
**Then** it displays `0` as a normal measured value in `{typography.data-stat}` with its `.wscope` footer
**And** it is visually distinguishable from an unavailable slot
**And** the measured zero is never suppressed, because suppressing it would make an empty scope indistinguishable from a broken dashboard

**Given** my resolved scope contains nobody
**When** the people table renders
**Then** it shows the empty state rather than an unavailable state, because the scope resolved successfully and is genuinely empty

**Given** the risk counts slot with `PM-FR-21` uncovered
**When** it renders
**Then** it states that risk records are not implemented
**And** no risk level, count, or trend arrow appears anywhere on the dashboard

**Given** the action-item slots with `PM-FR-19` uncovered
**When** they render
**Then** both the unit's open/overdue slot and my own action-items slot state that action items are not implemented

**Given** the campaigns slot with `PM-FR-20` uncovered and the resourcing slot with `PM-FR-23` uncovered
**When** they render on the Unit Manager dashboard
**Then** each declares its own unavailability independently, so closing one source does not silently change another slot's state

**Given** the project and leave-status columns with `PM-FR-37` and `PM-FR-36` uncovered
**When** the people table renders
**Then** those columns are either absent or explicitly marked unavailable, never rendered blank as though the data were legitimately empty

**Given** an unavailable slot
**When** its copy is written
**Then** it uses the permission-literate register, naming the missing capability and its source, with no motivational or apologetic filler

**Given** a dashboard region where no slot is available at all
**When** it renders
**Then** the empty state (`.emptyst`, `{components.empty-state}`) is used, with icon, bold line, direction, and action

**Given** a source FR later becomes implemented
**When** its slot is enabled
**Then** enabling it requires no change to any other slot's availability declaration

**Given** `OQ-PERM-01` blocks dashboard access, so no viewer can open the rendered dashboard
**When** these availability states are verified
**Then** each slot's availability declaration and its resulting state are verifiable at the read-model contract layer **without seeding a permission grant**
**And** verification does not wait on the epic's sprint-entry gate closing, because this story is the SD-2 honesty mechanism and must not ship unverified if grants are later seeded under delivery pressure

### Story 2.3: People Partner Dashboard — PP-Assigned Scope with No Resourcing Block

**ID:** `PMC-E2-S2.3` · **Sprint key:** `2-3-people-partner-dashboard-pp-assigned-scope-with-no-resourcing-block`

As a People Partner,
I want a dashboard scoped to the people assigned to me, with no resourcing content at all,
So that I work from my own caseload and am never shown a function my role does not hold.

**Acceptance Criteria:**

**Given** I am a People Partner holding the dashboard-view functional permission
**When** I open the People Partner preset
**Then** the dashboard renders scoped to the employees for whom I am the assigned People Partner, resolved through the direct People Partner audience

**Given** the People Partner dashboard
**When** any region renders
**Then** no resourcing block, slot, counter, or unavailable-state placeholder for resourcing exists — resourcing is **absent by construction**, neither hidden nor marked unavailable

**Given** I hold People Partner assignment over some employees and Reporting-line access over others
**When** the People Partner dashboard renders
**Then** it scopes to People Partner-assigned people only and does not merge in my Reporting-line population

**Given** the preset tab strip
**When** this story completes
**Then** it contains the Unit Manager and People Partner presets, and the presets available to me reflect the functional permissions I actually hold

**Given** the People Partner people table
**When** rows are assembled
**Then** they use Epic 1's shared row read model, projected against my tier per target
**And** leak verification is Story 1.1's projection-level negative matrix; this story asserts delegation only

**Given** widget slots on the People Partner dashboard
**When** they render
**Then** unavailable slots follow Story 2.2's rules and every rendered widget carries its `.wscope` footer

**Given** the grouping-dimension control on this preset
**When** it renders in this story's scope
**Then** people grouping is available and active; department grouping arrives with Story 2.4 behind its gate, and project grouping belongs to Epic 3's axis

**Given** the HR-oriented widget freedom in PRD §4.5
**When** a widget such as incomplete profiles is added
**Then** it sources only from data already available in the shared read model
**And** any widget requiring `PM-FR-30` CDS or `PM-FR-20` campaigns follows Story 2.2's unavailable rules

### Story 2.4: People Partner Department Grouping

**ID:** `PMC-E2-S2.4` · **Sprint key:** `2-4-people-partner-department-grouping`

> 🛑 **GATED — do not start.** Requires `DEPARTMENT-EDGE` to close and PM/AD-35's nested Department schema to exist. The design is ratified; **no Department table exists.**

As a People Partner,
I want to group my dashboard by department as well as by people,
So that I can see my caseload the way the organisation is actually structured.

**Acceptance Criteria:**

**Given** the Department entity exists per PM/AD-35 with nesting
**When** I switch the grouping dimension to department
**Then** my People Partner-assigned people group under their departments, and each employee appears under exactly one department

**Given** nested departments
**When** the grouped view renders
**Then** a parent department's group reflects that managing a department covers its sub-departments, without granting me access I do not hold

**Given** a department containing employees outside my People Partner assignment
**When** the grouped view renders
**Then** those employees are absent and the department's counts reflect only my entitled population

**Given** department grouping is active
**When** widgets recalculate
**Then** counters recalculate for the grouped scope and each `.wscope` footer still states the policy evaluated

**Given** the grouping control
**When** I switch between people and department
**Then** the switch is arrow-key navigable and the change is announced to screen readers

---

## Epic 3: Project-Grouped Dashboards (Delivery Manager, Project Manager)

**Status:** blocked — **no stories, deliberately (SD-7)**

> ## 🛑 NO STORIES EXIST FOR THIS EPIC
>
> **This is a recorded decision, not an incomplete document.** Per SD-7, story creation for `PM-FR-16` and `PM-FR-17` was deliberately not performed, because `TT-IDENTITY-01` is an open **P0**, PM/AD-10 has no project traversal, and PM/AD-31 leaves project membership with no writer. Acceptance criteria written now would be specified against a data model that does not exist and would be rewritten on contact with the real one.
>
> **Trigger for story creation:** `TT-IDENTITY-01` closing in `blockers.yaml` **and** a project-membership writer existing. At that point this epic returns to Step 3 of `bmad-create-epics-and-stories` as a separate exercise.
>
> **Consequence to carry forward honestly:** `PM-FR-16` and `PM-FR-17` are covered by an epic but by **no story**. They must be recorded in the coverage model as epic-assigned and story-uncovered — not as covered, and not as unassigned.

Epic-level scope, rationale, and preconditions are specified in the *Epic List* section above and are not restated here.

---

## Epic 4: Inline Directory Editing

*(added 2026-09-03 — see the Overview amendment and Epic List section above for scope, rationale, and dependencies)*

### Story 4.1: Inline-Editable Columns Write Through to the Profile

**ID:** `PMC-E4-S4.1` · **Sprint key:** `4-1-inline-editable-columns-write-through-to-the-profile`

As an employee viewing the All Employees table with edit rights on a field,
I want to edit that field's value directly in the table,
So that I don't have to open the full profile to make a small change.

**Acceptance Criteria:**

**Given** a column is marked inline-editable for the viewer's resolved tier
**When** the viewer edits a cell
**Then** the write goes through the same `data`/`canEdit` envelope (AD-34) the full profile uses — not a separate write path

**Given** the manager, People Partner, or department column
**When** rendered in the directory table for any viewer
**Then** it is never inline-editable, regardless of the section it would otherwise fall under (§2.1, §4.1, PM-FR-7) — these change only through the dedicated organisational-relationships screen

**Given** manager, People Partner, and department are access-switch fields (PM-FR-7) that may sit inside an otherwise section-write-entitled row
**When** `canEdit` is computed for any column
**Then** these three are forced non-editable by an explicit exclusion independent of the section-level dual gate AD-34 defines — their inline editability is never derived from section `RW`, only ever hard-denied

**Given** the `user-management:edit` permission key
**When** a write is attempted
**Then** it is denied unless the actor holds that permission (role-administration's catalog) **and** the target field is within the actor's resolved access tier for that section — both halves of the §2.2 dual gate are enforced, neither substitutes for the other

### Story 4.2: Inline Edit Denial and Conflict States

**ID:** `PMC-E4-S4.2` · **Sprint key:** `4-2-inline-edit-denial-and-conflict-states`

As a viewer attempting an inline edit I'm not entitled to make,
I want a clear, leak-free denial rather than a silent failure,
So that I understand the edit didn't apply without learning anything I'm not entitled to know.

**Acceptance Criteria:**

**Given** a field the viewer cannot see at all
**When** they load the directory row
**Then** the field and its edit affordance are both absent from the response — consistent with the leak-free-body rule for entitlement (PM-FR-4, §3.3 rule 1)

**Given** a field the viewer can see but not edit
**When** they attempt an inline edit
**Then** the response is `403` (a visible resource, a forbidden action) per the platform's single denial oracle, revealing nothing about the actor's own permission set beyond that

**Given** a due departure on the target employee (AD-20 cutoff)
**When** an inline edit targets that profile
**Then** the write is denied regardless of the actor's own permissions

**Given** two viewers edit the same cell concurrently
**When** the second write commits
**Then** the conflict is resolved by last-write-wins with the row's current value returned in the response, so the second editor sees what actually persisted rather than their own stale assumption

**Given** no UX source flow exists for this interaction (EXPERIENCE.md records the prototype table as read-only — "No surface")
**When** these denial and conflict states are designed
**Then** they are specified here directly, not inferred from a mock, and recorded as an addition beyond the UX spine — the same standard this slice already applied to Story 1.7's export flow (UX-DR8)

### Story 4.3: Custom-Field Columns Become Inline-Editable

**ID:** `PMC-E4-S4.3` · **Sprint key:** `4-3-custom-field-columns-become-inline-editable`

As a viewer entitled to a custom field,
I want to inline-edit it the same way as a standard field,
So that custom fields aren't second-class citizens in the directory.

**Acceptance Criteria:**

**Given** `user-management/epics.md` Epic UM-E7 has shipped (custom-field columns exist and respect visibility)
**When** a custom field is also marked inline-editable
**Then** editing it writes through to typed `CustomFieldValue` storage (PM/AD-32) under the same dual gate as Story 4.1

**Given** a custom field whose visibility excludes the viewer
**When** the directory renders
**Then** no edit affordance for that field exists — extending UM-E7's "absent from all three" rule to editability as a fourth surface

**Given** this story
**When** it is scheduled
**Then** it is sequenced strictly after `UM-E7` — editing a field the viewer cannot even see would be a leak this story must not create

---

## Story Coverage Status

Honest state of story-level coverage for the 7 in-scope FRs at the end of Step 3.

| FR | Epic | Stories | Story coverage |
|---|---|---|---|
| `PM-FR-8` | 1 | 1.1, 1.3, 1.4, 1.5, **1.8 (gated)** | Standard + derived fields covered. **Custom-field clause gated** behind `user-management`'s `UM-E7` (`PM-FR-5` itself `specified` 2026-09-03, but `UM-E7` unshipped) |
| `PM-FR-10` | 1 | 1.6 | Covered, including per-recipient re-resolution (SD-5) |
| `PM-FR-11` | 1 | 1.7 | Covered, with the export flow specified in-story rather than inferred from the mock |
| `PM-FR-15` | 2 | 2.1, 2.2 | **Partial by construction (SD-2).** Headcount, people table, navigation covered. Risk, action items, resourcing, campaigns, project and leave columns render explicit unavailable states pending `PM-FR-19`–`21`, `23`, `36`, `37` |
| `PM-FR-18` | 2 | 2.3, 2.2, **2.4 (gated)** | **Partial by construction (SD-2).** PP scope and resourcing-absent covered. **Department grouping gated** on `DEPARTMENT-EDGE`; project grouping belongs to Epic 3's axis |
| `PM-FR-16` | 3 | **none** | **Epic-assigned, story-uncovered (SD-7).** Blocked on `TT-IDENTITY-01` P0 |
| `PM-FR-17` | 3 | **none** | **Epic-assigned, story-uncovered (SD-7).** Blocked on `TT-IDENTITY-01` P0 |
| `PM-FR-9` | 4 | 4.1, 4.2, 4.3 | Covered at data/access-control level. **Depends on `role-administration` Epic RA-E1 (catalog) and `user-management` Epic UM-E7 (custom-field clause), both outside this slice** |

**Totals (through Epic 3, at Step 3 close 2026-09-02):** 3 epics · 13 stories · 107 acceptance criteria · 3 stories gated (1.8, 2.4, and all of Epic 3 by absence).

**Epic 4 addition (2026-09-03, `bmad-create-epics-and-stories` re-entry for `PM-FR-9`):** +3 stories, +12 acceptance criteria. None gated on an in-slice blocker; two of three carry hard cross-slice dependencies (RA-E1; RA-E1 + UM-E7) recorded above rather than a `blockers.yaml` gate. **Updated totals: 4 epics · 16 stories · 119 acceptance criteria.**

## Step 4 Validation Results

Six checks run. **Four pass, two fail.** The failures are recorded rather than resolved, because each rests on a decision already taken.

| Check | Result | Detail |
|---|---|---|
| 1. FR coverage | ❌ **FAIL** | `PM-FR-16` and `PM-FR-17` have no stories (SD-7). The slice delivers **5 of 7** in-scope FRs at story level. The step's rule is "no FRs should be left uncovered", so this is a fail, not a qualified pass |
| 2. Architecture implementation | ✅ Pass | Brownfield codebase, so no starter-template setup story is required. No story creates entities upfront: typed EAV arrives only with Story 1.8, which needs it |
| 3. Story quality | ✅ Pass | Story 1.1 was split at this step (see below). Distribution is now 5–13 criteria, median 8. Every story references its FRs and carries testable criteria |
| 4. Epic structure / file churn | ✅ Pass with rationale | Overlap between Epics 1↔2 and 2↔3 is significant and **documented**, not incidental — see *Shared read model* and SD-6, where consolidation was explicitly considered and rejected |
| 5. Dependency validation | ❌ **FAIL** on completeness · ✅ pass on ordering | Epic 2 cannot deliver COMPLETE functionality for its domain (SD-2 caps it at the sourced subset). Ordering is clean: no story is blocked by a later story, and no epic requires a later epic |
| 6. Placeholders and formatting | ✅ Pass | No unresolved placeholders |

**Story 1.1 split at this step.** It had accumulated 16 criteria against a median of 8 after two elicitation passes, spanning the projection, the leak matrix, pagination, chrome, breakpoints, the accessibility floor, the stale banner, and name rendering. It is now Story 1.1 (row projection, authoritative leak matrix, pagination) and Story 1.2 (page chrome, provenance, responsive behaviour, accessibility floor, name rendering). Former stories 1.2–1.8 renumbered to 1.3–1.9. The accessibility floor moved with the presentation story rather than becoming a trailing polish story.

### Validation findings carried forward

**Stories 2.1 and 2.2 must ship in the same release.** They pass the dependency check — each is independently completable — but 2.1 alone renders a dashboard silently missing most of its PRD §4.5 widgets, which is precisely the misleading state 2.2 exists to prevent. Correct ordering, dangerous release boundary. Treat them as one release unit even though they are two stories.

**No story in this slice creates the Department table.** Story 2.4 requires PM/AD-35's nested Department schema and is gated on `DEPARTMENT-EDGE`, but the entity itself has **no owner named in this document or in any story here**. If `DEPARTMENT-EDGE` closes without someone building the schema, 2.4 unblocks on paper while remaining unbuildable. Ownership must be assigned in the `user-management` or `access-control` context before 2.4 is scheduled.

**Authoritative leak test.** NFR-1 verification lives at the shared projection in Story 1.1 as an exhaustive negative matrix over audience × field × target-tier. Stories 1.3, 1.4, 1.6, 1.7, 2.1, and 2.3 assert **delegation only** and add no field access of their own. This is deliberate: several shallow per-surface assertions about one function can all pass while the function is wrong in a case none of them exercises. Story 1.7 additionally names a green matrix as a release precondition, because an exported file is durable and cannot be recalled by a deploy.

**Step 3 elicitation pass (Boundary & Edge Case Sweep).** Eight findings applied. One was a defect: Story 2.2's zero-rule forbade rendering a *measured* zero, which would have made an empty unit indistinguishable from a broken dashboard — the rule now keys on provenance rather than on the glyph. One closed a leak window: export entitlement is now re-checked at delivery, not only at generation start, since NFR-7 requires immediate revocation. One closed a structural gap: pagination was implied by the sort criteria but never specified, which also left Story 1.9's measurement target ambiguous. The remainder added an export row cap, a minimum-column floor, non-existent-field handling in saved views, a timezone and leap-day rule for derived date fields, and name-rendering bounds for Cyrillic, diacritics, bidirectional text, and maximum length.

**Step 3 elicitation pass (Cascading Failure Simulation).** Six changes applied, two of them structural. The leak test was relocated from seven per-surface assertions to one exhaustive matrix at the shared projection (see *Authoritative leak test*). Story 2.1's performance criterion was narrowed: it still cites Story 1.9 for the read model, but now measures its own **scope-resolution delta**, because a Unit Manager dashboard walks the reporting line before reaching the model and the directory's default view does not — citing 1.9 wholesale would inherit a claim for work the surface does not perform. Beyond those: the hidden-existence property in 1.3 and the count-differencing property in 1.8 were the two most security-critical criteria in the slice and neither named a procedure that could falsify it, so both now specify an executed attack rather than an asserted property; Story 1.6's revocation criterion now requires server-side revalidation, since PM/AD-25's TD-11 five-minute `staleTime` made the previous wording satisfiable by a stale cache; and Story 2.2's availability states became verifiable at the contract layer without a permission grant, because `OQ-PERM-01` otherwise leaves the SD-2 honesty mechanism unverifiable until the moment grants are seeded under delivery pressure.

**Schedulable today:** Epic 1 only. Epic 2 is sprint-entry blocked on `OQ-PERM-01`; Epic 3 on `TT-IDENTITY-01`.

**UX-DR reductions recorded against the contract:** UX-DR4 row selection and bulk action bar deferred (SD-4 removes their only action); UX-DR24 Flow 3 step 4 deferred for the same reason; dashboard customization excluded entirely (SD-1). One addition beyond the contract: the stale sync banner extended to the directory in Story 1.2 (NFR-4).
