---
name: People Management Platform
status: final
updated: 2026-09-02
sources:
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
---

# People Management Platform — Experience Spine

> Reconciliation pass from `imports/people-platform-prototype/` (7 artboards). Visual identity in `DESIGN.md`. Spines win on conflict with mocks.

## Foundation

**Form factor:** Responsive web application (desktop-primary). Sidebar navigation on `lg+`; collapses per existing frontend shell (`--sidebar-width`, `--sidebar-collapsed-width`).

**UI system:** shadcn/ui — `radix-nova` style, zinc base, lucide icons — configured in `services/frontend/components.json`. Tokens from `services/frontend/src/index.css` (102 CSS variables). `DESIGN.md` specifies the stretch delta (Geist Mono data layer, `.pghd`, `.prov`, semantic accent hues).

**Architecture posture:** Server-assembled responses per PM-FR-4 — absent sections are omitted from API payloads, not merely hidden in UI. Functional roles unlock features; derived access roles govern data visibility (PM-FR-1). HR Admin configures the system without default employee-data access (DEC-108).

## Information Architecture

| Surface | Artboard | Nav path | Primary PM-FR coverage |
|---|---|---|---|
| All Employees | `Main.dc.html` | People → All Employees | PM-FR-4, PM-FR-5†, PM-FR-8, PM-FR-10, PM-FR-11, PM-FR-34‡, PM-FR-36‡, PM-FR-37‡ |
| Configurable dashboards | `Dashboards.dc.html` | Workspace → Dashboards | PM-FR-4, PM-FR-15, PM-FR-16, PM-FR-17, PM-FR-18, PM-FR-19‡, PM-FR-21‡ |
| Roles & permissions | `Roles.dc.html` | Administration → Roles & permissions | PM-FR-1, PM-FR-6† |
| Custom fields | `CustomFields.dc.html` | Administration → Custom fields | PM-FR-5†, PM-FR-8† |
| Access preview | `Profile.dc.html` | Administration → Access preview | PM-FR-3, PM-FR-4, PM-FR-12, PM-FR-13‡, PM-FR-14, PM-FR-28‡, PM-FR-32‡, PM-FR-36‡ |
| My time off | `MyLeaves.dc.html` | Workspace → My time off | PM-FR-13‡, PM-FR-36 |
| Absence calendar | `TeamCalendar.dc.html` | Workspace → Absence calendar | PM-FR-36‡ |

† FR marked `deferred` or `uncovered` in global-coverage — surface exists in prototype as design intent, implementation not committed.  
‡ Partial — widget, column, or section slice only; full FR lifecycle not on this surface.

**Sidebar items without artboards:** Departments (PM-FR-7, PM-FR-42), employee profile (non-preview), organisational-relationships, resourcing, risks, campaigns, feedback, sharing, departure — see §FR gaps below.

→ Composition reference: `imports/people-platform-prototype/canvas.html` (self-contained viewer), individual `imports/people-platform-prototype/*.dc.html`. Spine wins on conflict.

### PM-FR → surface mapping (7 artboards)

| FR | Summary | Surface(s) | Coverage depth |
|---|---|---|---|
| PM-FR-1 | Derived vs functional roles | Roles | Full — derived list read-only, functional permissions editable |
| PM-FR-2 | Transitive access resolution | — | **No surface** — behaviour is backend; Access preview shows audience outcome, not graph traversal |
| PM-FR-3 | S1–S16 section matrix | Access preview | Full — per-section matrix dots + visible/hidden states |
| PM-FR-4 | Server-assembled responses | All Employees (Colleague view), Access preview, Dashboards (widget scope) | Demonstrated — whitelist columns, section omission, tier-bounded widgets |
| PM-FR-5 | Custom field visibility | Custom fields, All Employees (columns) | Prototype — FR deferred in coverage |
| PM-FR-6 | Functional role admin | Roles | Prototype — FR deferred (`OQ-PERM-01`) |
| PM-FR-7 | Org relationship controls | — | **No surface** — dedicated screen not in prototype |
| PM-FR-8 | Universal filters/columns | All Employees | Full — sort, filter, column picker, custom-field columns |
| PM-FR-9 | Inline directory editing | — | **No surface** — table is read-only in prototype |
| PM-FR-10 | Saved/shared directory views | All Employees | Full — view tabs + "New view" |
| PM-FR-11 | Visibility-safe XLSX export | All Employees | Button present — export flow not interactively demonstrated |
| PM-FR-12 | Section-based profile | Access preview | Full for assembly model; normal profile view not a separate artboard |
| PM-FR-13 | Employee self-service | My time off, Access preview (Self audience) | Partial — leaves read path only; S2/S3 edit not mocked |
| PM-FR-14 | Sourced relationships | Access preview header | Partial — manager, PP, mentor shown as sourced |
| PM-FR-15 | Unit Manager dashboard | Dashboards (UM preset) | Widget composition — FR uncovered for implementation |
| PM-FR-16 | Delivery Manager dashboard | Dashboards (DM preset) | Widget composition — FR uncovered |
| PM-FR-17 | Project Manager dashboard | Dashboards (PM preset) | Widget composition — FR uncovered |
| PM-FR-18 | People Partner dashboard | Dashboards (PP preset) | Widget composition — no resourcing block shown — FR uncovered |
| PM-FR-19 | Action item lifecycle | Dashboards (widget) | Widget only — **no dedicated lifecycle surface** |
| PM-FR-20 | Form campaigns | — | **No surface** |
| PM-FR-21 | Risk record/history | Dashboards, All Employees (risk column) | Display only — **no risk management surface** |
| PM-FR-22 | Scoped risk dashboard | — | **No surface** |
| PM-FR-23 | Create/route resourcing requests | — | **No surface** (permission keys in Roles only) |
| PM-FR-24 | Fulfil requests | — | **No surface** |
| PM-FR-25 | Review/close requests | — | **No surface** |
| PM-FR-26 | Resourcing history on profile | — | **No surface** |
| PM-FR-27 | Profile sharing | — | **No surface** |
| PM-FR-28 | Auto career timeline events | Access preview (S9 section) | Section slice only |
| PM-FR-29 | Manual timeline maintenance | — | **No surface** |
| PM-FR-30 | CDS registry | Access preview (S12 section) | Section slice only |
| PM-FR-31 | CDS directory filtering | — | **No surface** |
| PM-FR-32 | Mentorship self-service | Access preview (S13), All Employees (mentor column) | Partial |
| PM-FR-33 | Mentorship assignment/closure | — | **No surface** |
| PM-FR-34 | Willing pool, mentor header, directory status | All Employees, Access preview | Partial — directory column + S13 |
| PM-FR-35 | Feedback records/campaigns | — | **No surface** |
| PM-FR-36 | Timetracker leaves integration | My time off, Absence calendar, All Employees, Access preview S10 | Read path demonstrated; write path **[PROPOSED]** in MyLeaves only |
| PM-FR-37 | Timetracker projects/people | All Employees, Dashboards, Access preview | Column/widget display — gates `TT-IDENTITY-01`, `TT-PMDM-01` |
| PM-FR-38 | PeopleForce prefill | — | **No surface** (deferred) |
| PM-FR-39 | Full-profile grant lifecycle | — | **No surface** (deferred) |
| PM-FR-40 | Relationship/grant journal | — | **No surface** |
| PM-FR-41 | Departure lifecycle | — | **No surface** |
| PM-FR-42 | Nested department management | — | **No surface** (nav item only) |

### PM-FR without UX surface in this prototype (19)

`PM-FR-2`, `PM-FR-7`, `PM-FR-9`, `PM-FR-20`, `PM-FR-22`, `PM-FR-23`, `PM-FR-24`, `PM-FR-25`, `PM-FR-26`, `PM-FR-27`, `PM-FR-29`, `PM-FR-31`, `PM-FR-33`, `PM-FR-35`, `PM-FR-38`, `PM-FR-39`, `PM-FR-40`, `PM-FR-41`, `PM-FR-42`

Plus **partial-only** (need future surfaces): `PM-FR-19`, `PM-FR-21`, `PM-FR-28`, `PM-FR-30`, and normal (non-preview) employee profile editing flows for `PM-FR-12` / `PM-FR-13`.

## Voice and Tone

Microcopy posture: **direct, honest, permission-literate**. The product explains what the API returns and where data comes from — not motivational HR language.

| Do | Don't |
|---|---|
| "512 people. Leave and project data comes from the timetracker." | "Welcome to your people hub!" |
| "Colleague view — the API returns only the whitelist columns." | "Restricted mode enabled." |
| "Synced · timetracker" (provenance tag) | "Up to date ✓" without source |
| "This role grants no features yet." | "Get started by adding permissions!" |
| "Leave balances are not shown — check entitlement in the timetracker." | Hide the gap silently |

## Component Patterns

Behavioral. Visual specs in `DESIGN.md`.

| Pattern | Surface | Behavioral rules |
|---|---|---|
| Page header band (`.pghd`) | All 7 | Eyebrow names area/screen + provenance tag; title + one-line lead; right actions. Accent tick colour follows screen semantic mode (`{colors.stretch-blue}` / amber / violet). |
| Provenance tag (`.prov`) | All 7 | SYNCED = external timetracker data; ACCESS = per-request resolution; DERIVED = computed role; FEATURE = functional permission. Always visible in header, not tooltip-only. |
| Directory table | All Employees | Sortable columns; multi-select filters; name search; saved-view tabs; Colleague-view toggle simulates API whitelist; row select → bulk action bar. Row hover shows left accent inset. |
| Colleague-view banner | All Employees | When on: explains whitelist columns; risk/grade/closed sections never sent. |
| Dashboard preset tabs | Dashboards | UM / DM / PM / PP / custom dashboards; grouping dimension switches (people vs project). |
| Dashboard customize mode | Dashboards | Toggle adds remove handles, drag handles, widget catalog sidebar; changes save to current dashboard only. |
| Widget scope footer (`.wscope`) | Dashboards | Every widget states access policy evaluated (mono uppercase). Widget never widens viewer entitlement. |
| Derived vs functional roles | Roles | Left rail: access roles read-only with DERIVED tag. Right: functional role permissions toggles; Save disabled until dirty; zero-grant hint when no permissions on. |
| Custom field form | Custom fields | Add field: label, type, visibility, options (select types), column toggle. Visibility drives filter/column eligibility. |
| Access preview audience switch | Access preview | HR Admin only. Segment: Self / Reporting / Project / PP / Colleague / Full. Sections appear, drop to read-only, or show "not returned" with lock. |
| Section access matrix (`.amx`) | Access preview | Six dots per section header — whole S1–S16 model at a glance; ringed = current audience. |
| Leaves read table | My time off | Upcoming/Past tabs; type, dates, working days, status from timetracker; link-out to manage in timetracker. No balances in platform. |
| Stale sync banner | My time off, Absence calendar | Demo toggle shows banner: last sync time, paused requests, 4h project-access fallback per architecture. |
| Absence month grid | Absence calendar | Multi-day bars with avatar initials; leave type colour; cancelled = dashed/strikethrough; moved working day = single-day marker; dept/name filters; Today jumps to current month. |
| Empty state (`.emptyst`) | Dashboards, Custom fields | Icon + bold line + direction + action when no widgets / no fields. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Loading | All data surfaces | shadcn `Skeleton` matching table/card layout |
| Empty directory filter | All Employees | Zero rows + "No people match these filters" + clear-filters action |
| No widgets | Dashboards | `{components.empty-state}` — add from catalog |
| No custom fields | Custom fields | `{components.empty-state}` — add field CTA |
| Zero grants on role | Roles | `.zerogrant` info panel — derived access unchanged |
| Colleague view active | All Employees | Banner + reduced column set |
| Section not returned | Access preview | Collapsed row, lock icon, "not returned" badge, hidden body with reason |
| S10 colleague narrowing | Access preview | Colleague audience: dates only, leave type hidden (per matrix note) |
| Timetracker stale | My time off, Absence calendar | Amber stale banner; sync timestamp; project-access fallback warning |
| Unsaved role changes | Roles | Dirty dot + Save enabled |
| [PROPOSED] Request time off | My time off | Flagged panel — not normative for v1.5; documents scope discussion only |

## Interaction Primitives

**Navigation:** Sidebar groups — People (directory), Workspace (dashboards, time off, calendar), Administration (roles, custom fields, departments, access preview). Cross-artboard navigation not wired in prototype; production uses client router.

**Directory:** Click column header → sort toggle. Filter selects → immediate filter. Colleague toggle → instant column whitelist. Row checkbox → bulk bar. Name link → employee profile (not mocked).

**Dashboards:** Tab → switch preset. Customize → edit mode. Add widget → catalog panel. Remove → instant layout update (save on exit customize).

**Roles:** Role select → load permissions. Checkbox toggle → dirty state. Save → persist (mock). Add role → inline create.

**Access preview:** Audience segment → re-resolve all sections; matrix dots update; count summary refreshes.

**Timetracker surfaces:** Read-only data. External link opens timetracker for write operations. Demo "Sync down" toggle for stale-state QA only — not a production control.

**Banned:** Client-side section hiding as substitute for server omission; functional role used to widen data access; inferring hidden custom-field values via filter side channels.

## Accessibility Floor

- WCAG 2.2 AA — contrast inherits shadcn defaults; stretch violet/amber provenance tags verified against backgrounds in artboards.
- Provenance tags include text labels, not colour-only (SYNCED, ACCESS, etc.).
- Access matrix dots paired with `title` tooltips and legend (`.amxleg`).
- `prefers-reduced-motion`: all 140ms transitions disabled per `DESIGN.md`.
- Keyboard: shadcn focus rings (`{colors.ring}` / `--ring`); tab order follows visual layout; segment controls arrow-key navigable.
- Screen reader: page header announces area + screen from eyebrow; Colleague-view banner uses `role="status"` when toggled; stale banner is assertive.

## Responsive & Platform

| Breakpoint | Behavior |
|---|---|
| `≥ lg` (1024px+) | Full sidebar + multi-column dashboard grid |
| `md` (768–1023px) | Sidebar collapses to icons; dashboard grid 2-column |
| `< md` | Sidebar → `Sheet`; directory table horizontal scroll; dashboard stacks single column |

Desktop-primary. Mobile supports read + light filter; bulk actions and dashboard customize are degraded but functional.

## Key Flows

### Flow 1 — Kateryna verifies colleague visibility (Kateryna, HR Admin, access audit)

1. Kateryna opens **Access preview** from Administration.
2. She searches Amelia Rho (pre-loaded) and leaves audience on **Colleague**.
3. Summary reads "8 of 16 sections returned" — S6 Risk shows "not returned" with lock; S10 Leaves shows dates only.
4. She clicks **Reporting** segment — S6 appears read-only; S7 Management notes appear.
5. **Climax:** She expands S10 under Colleague — only date ranges render, type column absent. The section header matrix showed the narrowing before she opened it. She screenshots the summary line for the compliance packet.

Failure: API returns 403 for preview tool → shadcn `Toast` destructive: "Access preview requires HR Admin."

### Flow 2 — Tamar checks her upcoming leave (Tamar, engineer, self-service)

1. Tamar opens **My time off** from Workspace.
2. Page header shows `{colors.stretch-amber}` accent and `.prov.synced` tag.
3. Upcoming tab lists approved vacation Sep 12–19; footer links to timetracker.
4. **Climax:** She sees exactly what the platform knows — synced timestamps, no phantom balances — and clicks through to timetracker to request a change. No false impression that the platform owns leave approval.

Failure: Timetracker stale → amber banner explains last sync and 4h fallback; no write attempted in platform.

### Flow 3 — Bohdan scans his unit from the directory (Bohdan, Unit Manager, Monday morning)

1. Bohdan opens **All Employees**, selects saved view "My unit".
2. He filters Risk = high, sorts by trend descending.
3. He toggles **Colleague view** off — risk and grade columns return.
4. He selects two rows → bulk bar offers "Assign people partner".
5. **Climax:** Leave status column shows synced away dates for one report — provenance tag on page header already said "Synced · leave & projects". He opens the employee profile (production route) without questioning data freshness.

Failure: Colleague view left on → risk column absent by design; banner explains why.

## Open Items

| ID | Item | Disposition |
|---|---|---|
| OQ-UX-01 | `MyLeaves` "Request time off" panel | `[PROPOSED]` — beyond PM-FR-36 pull-only; needs write-path AD before design normative |
| OQ-PERM-01 | Default permission grants for new roles | Noted in Roles artboard footer; blocks PM-FR-6 seeding, not UX spine |
| OQ-UX-02 | Departments + organisational-relationships screens | Nav chrome present; artboards needed for PM-FR-7, PM-FR-42 |
| OQ-UX-03 | Normal employee profile (non-preview) | Access preview covers assembly model; production profile needs own surface for PM-FR-12/13 edit flows |
