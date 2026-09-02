# Stretch pass — design plan (2026-09-01)

Brief: "more user friendly, not boring, more useful" — stay in shadcn/Geist/zinc, stretch it, all 7 artboards.

## System moves (apply to every artboard)
1. **Type**: add Geist Mono (in-family). Roles — eyebrow kicker, big stats, data keys, dates, IDs.
2. **Page header band** `.pghd`: mono eyebrow (AREA / SCREEN + provenance tag) · 22px title · one-line lead · right actions · 3px accent tick · bottom rule.
3. **Signature = provenance tag** `.prov` (mono, left-bar, glyph): SYNCED / DERIVED / PLATFORM / ACCESS. The product's identity is honesty about where data comes from + who may see it.
4. **Accent hue**: blue everywhere (matches chrome) EXCEPT where it carries meaning —
   MyLeaves + TeamCalendar = amber (synced, can go stale); Profile = violet (access-inspection mode).
5. **Motion**: 140ms transitions on interactive elements; `prefers-reduced-motion` respected. No page-load theatrics.
6. **Empty states** `.emptyst`: icon + bold line + direction + action.

## Per-screen extras
- TeamCalendar: avatar initials in bars, hover lift, today tint.
- Dashboards: mono stats; per-widget "scope" footer (mono) instead of hidden access text.
- Profile: 6-audience mini access-matrix on every section header (current audience ringed) — see whole model at a glance.
- Roles: DERIVED tag on access-roles block; 0-grant hint.
- CustomFields: visibility badges → prov family; empty state.

## Guardrails
Presentation layer only. Do not touch renderVals control flow / holes / state shape. Additive fields in renderVals are OK (ini, access, matrix, noWidgets...).
