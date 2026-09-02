---
name: People Management Platform
description: Brand-layer delta on shadcn/ui (radix-nova, zinc, lucide) + Geist for the People Management web app. Base tokens inherited from services/frontend; this file records the stretch pass only.
status: final
updated: 2026-09-02
colors:
  # Inherited from services/frontend/src/index.css — reference by name, do not override:
  # background, foreground, card, popover, primary, primary-foreground, secondary, muted,
  # muted-foreground, accent, destructive, border, input, ring, chart-1..5, sidebar-*
  ink-2: 'oklch(0.44 0.008 286)'
  ink-3: 'oklch(0.57 0.010 286)'
  line: 'oklch(0.898 0.003 286)'
  stretch-blue: 'oklch(0.52 0.20 264)'
  stretch-amber: 'oklch(0.58 0.12 66)'
  stretch-green: 'oklch(0.55 0.13 155)'
  stretch-violet: 'oklch(0.54 0.17 300)'
  prov-synced-bg: 'oklch(0.972 0.028 66)'
  prov-synced-fg: 'oklch(0.47 0.10 60)'
  prov-access-bg: 'oklch(0.968 0.03 264)'
  prov-access-fg: 'oklch(0.44 0.15 264)'
  prov-derived-bg: 'oklch(0.969 0.022 300)'
  prov-derived-fg: 'oklch(0.46 0.13 300)'
typography:
  body:
    fontFamily: 'Geist, Geist Variable, system-ui, sans-serif'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.45'
  mono:
    fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, monospace'
  page-title:
    fontFamily: '{typography.body.fontFamily}'
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.15'
    letterSpacing: -0.02em
  page-eyebrow:
    fontFamily: '{typography.mono.fontFamily}'
    fontSize: 10px
    fontWeight: '500'
    letterSpacing: 0.15em
    textTransform: uppercase
  page-lead:
    fontFamily: '{typography.body.fontFamily}'
    fontSize: 12.5px
    lineHeight: '1.45'
  data-stat:
    fontFamily: '{typography.mono.fontFamily}'
    fontWeight: '500'
rounded:
  # Base --radius inherited from index.css (0.625rem). Stretch uses:
  prov: 5px
  emptyst: 11px
spacing:
  pghd-padding-left: 15px
  pghd-accent-width: 3px
  pghd-bottom-gap: 16px
components:
  page-header-band:
    accent-bar: '{spacing.pghd-accent-width} solid {colors.stretch-blue}'
    border-bottom: '1px solid {colors.line}'
    padding-left: '{spacing.pghd-padding-left}'
  provenance-tag:
    fontFamily: '{typography.mono.fontFamily}'
    fontSize: 9px
    fontWeight: '500'
    letterSpacing: 0.06em
    textTransform: uppercase
    border-left: '2px solid currentColor'
    border-radius: '{rounded.prov}'
  empty-state:
    border: '1px dashed {colors.line}'
    border-radius: '{rounded.emptyst}'
    icon-color: 'oklch(0.72 0.01 286)'
  widget-scope-footer:
    fontFamily: '{typography.mono.fontFamily}'
    fontSize: 9px
    fontWeight: '500'
    letterSpacing: 0.04em
    textTransform: uppercase
    color: '{colors.ink-3}'
---

## Brand & Style

People Management Platform is an enterprise people-operations web application where **honesty about data provenance and access** is the visual signature — not decorative branding. The product inherits shadcn/ui (`radix-nova`, zinc base, lucide icons) and Geist from `services/frontend`. `DESIGN.md` records only the **stretch pass** layered on top of `services/frontend/src/index.css` and `components.json`.

The stretch pass makes permission and sync semantics visible at a glance: mono eyebrows name the area and screen; provenance tags (`.prov`) state where data comes from and who may see it; page-header accent ticks colour-code the screen's primary semantic mode. Presentation layer only — no changes to render control flow or API contracts.

→ Visual reference: `imports/people-platform-prototype/*.dc.html`, `imports/people-platform-prototype/design-notes.md`. Spine wins on conflict.

## Colors

**Inherited (do not restate):** All shadcn CSS variables in `services/frontend/src/index.css` — zinc neutrals, blue primary (`--primary: oklch(0.488 0.243 264.376)`), destructive, ring, sidebar, chart palette. Dark mode via `.dark` class on `document.documentElement`.

**Stretch semantic hues** (artboard-local `--accent`):

| Token | Value | Used for |
|---|---|---|
| `{colors.stretch-blue}` | `oklch(0.52 0.20 264)` | Default chrome accent — directory, dashboards, roles, custom fields |
| `{colors.stretch-amber}` | `oklch(0.58 0.12 66)` | Timetracker-synced surfaces — My time off, Absence calendar |
| `{colors.stretch-violet}` | `oklch(0.54 0.17 300)` | Access-inspection mode — Access preview (HR Admin) |
| `{colors.stretch-green}` | `oklch(0.55 0.13 155)` | Leave-type colour coding in calendar bars (by type, not chrome) |

**Ink ramp:** `{colors.ink-2}` for lead copy and secondary labels; `{colors.ink-3}` for eyebrows, scope footers, meta. `{colors.line}` for dividers and dashed empty-state borders.

**Provenance tags** (`.prov` family — mono, left-bar, uppercase):

| Variant | Background / foreground | Meaning |
|---|---|---|
| `.prov.synced` | `{colors.prov-synced-bg}` / `{colors.prov-synced-fg}` | Data from timetracker; can go stale |
| `.prov.access` | `{colors.prov-access-bg}` / `{colors.prov-access-fg}` | Resolved per-request access policy |
| `.prov.derived` | `{colors.prov-derived-bg}` / `{colors.prov-derived-fg}` | Computed access role, not assignable |
| `.prov.feature` | same as access | Functional permission — unlocks features, not data |

Blue is the default accent everywhere **except** where amber (sync) or violet (access inspection) carries meaning. Do not use accent hues decoratively.

## Typography

**Body:** Geist Sans at `{typography.body.fontSize}` — matches prototype base 13px / 1.45 line height.

**Geist Mono** (`{typography.mono.fontFamily}`) — in-family data voice for:
- Page eyebrows (`{typography.page-eyebrow}`)
- Provenance tags, widget scope footers, grant counts, dates, IDs, permission keys
- Dashboard stat values
- Table data keys (`.pk` on permission rows)

**Page header hierarchy** (`.pghd` band):
1. Eyebrow — `{typography.page-eyebrow}`, colour `{colors.ink-3}`, format `AREA / SCREEN` + optional `.prov` tag
2. Title — `{typography.page-title}`
3. Lead — `{typography.page-lead}`, colour `{colors.ink-2}`, max-width ~720px
4. Right actions — primary/secondary shadcn `Button` variants

App chrome title (top bar) stays at 19px semibold — distinct from page-band title.

## Layout & Spacing

Inherited from frontend: `--header-height: 3rem`, `--sidebar-width: 15rem`, `--sidebar-collapsed-width: 3.75rem`, `--transition-sidebar: width 200ms`.

**Page header band** (`.pghd`): `{spacing.pghd-padding-left}` left padding; 3px accent tick (`::before`) aligned to title block; `{spacing.pghd-bottom-gap}` margin below; bottom rule `{colors.line}`.

**Content surfaces:** Full-width within main column beside sidebar. Directory and admin tables use card wrapper (`.cw`) with horizontal scroll on narrow viewports. Dashboard widget grid uses 4-column layout with span modifiers.

Tailwind / shadcn spacing scale inherited for component internals.

## Elevation & Depth

Inherited from shadcn — no custom shadow tokens. Stretch layer uses:
- `box-shadow: inset 2px 0 0 var(--accent)` on hovered table rows and selected role items (left accent bar, not drop shadow)
- Avatar initials and calendar event bars use subtle `hover` lift (translate/shadow in artboards) — disable under `prefers-reduced-motion`

## Shapes

**Base radius:** `--radius: 0.625rem` from `index.css` — shadcn default for buttons, inputs, cards.

**Stretch radii:** provenance tags `{rounded.prov}` (5px); empty states `{rounded.emptyst}` (11px); toggles and pills use `9999px` (full).

## Components

**shadcn components used as-is** (visual spec = library defaults): `Button`, `Card`, `Table`, `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `Tabs`, `Badge`, `Avatar`, `Separator`, `Checkbox`, `Select`, `Input`, `Switch`, `Toast`, `Skeleton`.

**Stretch components** (brand-layer):

| Component | Visual spec | Notes |
|---|---|---|
| `{components.page-header-band}` | Accent tick + eyebrow + title + lead + actions | `.pghd` on every artboard |
| `{components.provenance-tag}` | Mono uppercase chip with left colour bar + lucide glyph | SYNCED / DERIVED / PLATFORM / ACCESS / FEATURE variants |
| `{components.empty-state}` | Centred icon + bold line + direction + action; dashed border | `.emptyst` |
| `{components.widget-scope-footer}` | Mono uppercase scope line below dashboard widgets | `.wscope` — replaces hidden access tooltips |
| Access matrix dots | 6px circles; violet = RW, grey = R, hollow = not returned; ring on current audience | `.amx` on Profile section headers only |
| Colleague-view banner | Info icon + explanatory copy | Blue-tinted banner when directory simulates API whitelist |

**Motion:** `transition: all 0.14s ease` on `.btn`, `.nav`, `.tab`, table rows, cards, toggles. `@media (prefers-reduced-motion: reduce)` disables all transitions and animations. No page-load theatrics.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Inherit shadcn/zinc/blue tokens from `index.css` | Invent new primary palette colours |
| Use Geist Mono for data, eyebrows, provenance, scope footers | Set body copy in mono for decoration |
| Show provenance (`.prov`) wherever data is synced or access-gated | Hide sync staleness or access scope in tooltips only |
| Use amber accent only on timetracker-sync surfaces | Use amber for generic highlights |
| Use violet accent only on access-preview / matrix inspection | Use violet as a second primary brand colour |
| Respect `prefers-reduced-motion` | Add entrance animations or parallax |
| Keep stretch changes presentation-only | Alter renderVals control flow or API response shape in mocks |
