# Reconcile — people-platform-prototype

**Source:** `imports/people-platform-prototype/` (7 artboards, `canvas.json`, `design-notes.md`, `README.md`)  
**Run:** ux-people-management-2026-09-02 · reconciliation · 2026-09-02

## Adopted into spines

| Import artifact | Lifted to | Decisions captured |
|---|---|---|
| `design-notes.md` | `DESIGN.md` (stretch delta), `EXPERIENCE.md` (system moves) | Geist Mono data layer; `.pghd` page header band; `.prov` provenance tags; per-screen accent hues; 140ms motion; `.emptyst` empty states; presentation-only guardrails |
| `Main.dc.html` | `EXPERIENCE.md` IA + Component Patterns | All Employees directory: saved-view tabs, filter bar, column picker, Colleague-view toggle, bulk selection bar, synced leave/project columns |
| `Dashboards.dc.html` | `EXPERIENCE.md` IA + Component Patterns | UM/DM/PM/PP presets; customize mode; widget catalog; per-widget access scope footer (`.wscope`) |
| `Roles.dc.html` | `EXPERIENCE.md` IA + Component Patterns | Derived access roles (read-only) vs functional roles (permission toggles); DERIVED tag; zero-grant hint |
| `CustomFields.dc.html` | `EXPERIENCE.md` IA + Component Patterns | Field CRUD form; visibility badges; column toggle; empty state |
| `Profile.dc.html` | `EXPERIENCE.md` IA + Component Patterns | HR Admin access preview only; 6-audience segment; per-section access matrix (`.amx`); section assembly summary |
| `MyLeaves.dc.html` | `EXPERIENCE.md` IA + State Patterns | Pull-only timetracker sync; stale banner demo; link-out to timetracker |
| `TeamCalendar.dc.html` | `EXPERIENCE.md` IA + Component Patterns | Org-wide month grid; multi-day bars; department/name filters; same sync/stale pattern as MyLeaves |
| `canvas.json` annotations | `EXPERIENCE.md` Interaction notes | Per-artboard behavioral annotations preserved as spine guidance |

## Visual tokens extracted (not invented)

All color values trace to `services/frontend/src/index.css` (primary blue `oklch(0.488 0.243 264.376)`) or artboard CSS:

- `--ink-2`, `--ink-3` — secondary/tertiary text
- `--blue`, `--amber`, `--green`, `--violet` — semantic accent hues in stretch layer
- `.prov.synced`, `.prov.access`, `.prov.derived`, `.prov.feature` — provenance tag variants
- Page title 22px / eyebrow 10px mono / lead 12.5px — from `.pgrow h1`, `.eyebrow`, `.pglead`
- Transition `0.14s ease` on interactive elements; `prefers-reduced-motion` disables all

## Dropped or deferred from import

| Item | Disposition |
|---|---|
| Cross-screen navigation wiring | Not in prototype; each artboard is independent per `canvas.json` intro note |
| `MyLeaves` "Request time off" panel | **Proposed** — beyond PM-FR-36 pull-only spec; retained in import, flagged `[PROPOSED]` in EXPERIENCE.md |
| Sidebar **Departments** nav item | Nav chrome only — no artboard; PM-FR-7 / PM-FR-42 remain spine-only |
| Roles footer note on open OQ-PERM-01 defaults | Logged as open product question; does not block UX spine |
| Published Claude Artifact URL | External live copy per `README.md`; folder import is the reconciliation source |

## Conflicts with upstream

None. Prototype aligns with PRD §3.3 assembly model, §4.1 directory, §4.4 dashboards, §4.5 leaves integration (read path). Access preview is an administration overlay consistent with HR Admin scope (DEC-108).
