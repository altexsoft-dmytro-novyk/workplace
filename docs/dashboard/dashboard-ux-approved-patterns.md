# Dashboard UX Approved Patterns

**Date:** 2026-09-14  
**Owner:** Carlos Nunes (BA)  
**For:** Tamar Tchelidze (frontend)  
**Companion doc:** `dashboard-implementation-readiness.md`  
**Authoritative handoff:** `dashboard-feature-handoff-2026-09-11.md` (SRC-123)

**Purpose:** Layout guide for dashboard stories S2.1 to S2.3. Visual reference only. No new requirements.

**Rule:** If this doc conflicts with the handoff, the handoff wins.

**Visual source:** Team 5 Hi5 prototype at `03_DESIGN/current-state/team5-hi5-prototype/`. See `03_DESIGN/current-state/team5-hi5-prototype-vs-requirements.md` for the full gap analysis.

**Traceability:** SRC-123 companion (layout only). Not indexed in `Source Inventory.md` yet.

---

## 1. Global shell (approved)

Borrow from Team 5 `App.tsx`:

| Element | Pattern |
|---------|---------|
| Layout | Persistent left sidebar + top header |
| Style | Clean B2B SaaS, information-dense, subtle borders, restrained color |
| Navigation | Dashboard, All Employees, Resourcing, Risks, Mentorship, Campaigns, CDS, Reports, Settings |
| Header | Global search, notifications, current user, avatar |
| Demo only | Role switcher to preview UM vs PP views. Switcher changes which preset loads, not which data the server returns. |

Hide or disable nav items the current user cannot access.

---

## 2. Widget data states (required by handoff)

Every widget must support four distinct states. Team 5 only has two (number or empty). You must add the rest.

| State | When | What to show |
|-------|------|--------------|
| **Loading** | API in flight | Skeleton placeholder |
| **Measured zero** | Source exists, count is 0 | Show `0` with label |
| **Empty scope** | User has permission but no people in scope | Empty state message |
| **Unavailable** | Data source not built yet | Explicit "unavailable" label. No `0`, no `—`, no fake number |

**S2.2 focus:** Unsourced widgets (resourcing, campaigns, risks, action items if not built) must use the **unavailable** state.

---

## 3. Widget scope footer (required by handoff)

Every rendered widget needs a footer showing which access policy was evaluated.

| Property | Value |
|----------|-------|
| Style | Mono uppercase, small text |
| Content | Which access policy / scope was used for this widget |
| Source | Server returns scope metadata with each widget payload |

Team 5 has no footer. You must add it.

**Example format (illustrative; server metadata is authoritative):**

```
SCOPE: REPORTING_LINE · 12 EMPLOYEES
SCOPE: PP_ASSIGNMENT · 48 EMPLOYEES
```

---

## 4. Unit Manager dashboard (S2.1)

### Page structure

```
[Greeting header]
[5-column stat row]
[Two-column body: table (left) | sidebar 340px (right)]
```

### Greeting header (approved layout)

- Title: "Good morning, {first name}"
- Subtitle: "{Role} · {Department} · {full date}"
- Font: title 22px bold, subtitle 14px muted

### Stat row (approved labels)

5 equal columns, 14px gap:

| # | Label | S2.1 behavior |
|---|-------|---------------|
| 1 | Subordinates | Real headcount from server reporting-line scope |
| 2 | Active Risks | Count where risk ≠ `low` (v1.5 rule). Sub-text: "N high" if any |
| 3 | Open Actions | Count of open action items. Sub-text: "N overdue" if any |
| 4 | Open Resourcing | **Unavailable** until resourcing source is built |
| 5 | Active Campaigns | **Unavailable** until campaigns source is built |

**Team 5 bug to avoid:** Open Resourcing hardcodes `value={2}`. Never do this.

**Stat card layout (Team 5 `StatCard` in `Dashboard.tsx`):**

- 40×40px tinted icon box on the left (8px radius, icon color at ~10% opacity background)
- Right side: bold value (22px), muted label (12px), optional sub-text (11px)
- Card uses white surface on the gray page background (see §8)

### People table (left column, approved layout)

- Card with header: "My Team (N)" + "All Employees →" link
- Columns: Employee (avatar + name + position), Project, Grade, Risk, Leave, View action
- Row hover state, 13px font, light border between rows
- Data: server-authorized rows only. Reuse shared employee row projection.

### Permission denied (S2.1, no Team 5 pattern)

When the user lacks `dashboard-view` permission, the server denies access (fail-closed). The UI must not render dashboard widgets or fake empty data.

- Follow handoff and access-control denial rules (403 or preset omitted from server response)
- No Team 5 layout to copy. Show a standard access-denied state consistent with the rest of the app

### Right sidebar (approved layout)

Stack of cards, 16px gap:

1. **My Action Items** card
   - List open items with title, due date, overdue tag
   - Empty state: "No open action items"
   - Show **unavailable** if action-item source not built

2. **Risk alert** card (conditional)
   - Only show if high or leaver count > 0
   - Red/warning styling
   - "Open Risk Dashboard →" link

3. **Quick Links** card
   - All Employees
   - Resourcing Requests
   - Risk Dashboard
   - Mentorship Hub
   - Campaigns

**Deferred (not in Team 5, not in S2.1 scope):** "Saved views" appears in product §4.4.1 (`people-management-platform-test-assignment-v1.2.md`) but has no prototype screen. Add only when All Employees saved-views work exists.

---

## 5. People Partner dashboard (S2.3)

### Page structure

```
[Header]
[4-column stat row]
[Flat people table]
```

### Header (approved layout)

- Title: "People Partner Dashboard"
- Subtitle: "Managing N employees"

### Stat row (approved labels)

4 equal columns:

| # | Label | S2.3 behavior |
|---|-------|---------------|
| 1 | CDS Overdue | Count from server PP scope. Label matches Team 5: "CDS Overdue". Threshold comes from the backend contract, not prototype logic (prototype uses `>= 5` months but labels "6+ months") |
| 2 | Open IDPs | Count from server PP scope |
| 3 | New Joiners (3m) | Count from server PP scope. Rolling window comes from backend contract |
| 4 | Leavers | Count from server PP scope (leaver risk) |

Show **unavailable** for any stat whose source is not built.

### People table (approved layout)

Flat list (no grouping for S2.3 MVP):

- Columns: Employee (avatar + name), Position, Last CDS, IDP, Risk, Profile link
- CDS cell: date or "Never" badge (red)
- IDP cell: "Open" badge (amber) or muted dash
- Data: server PP-scoped rows only

### Rejected from Team 5 PP screen

| Team 5 pattern | Why rejected |
|----------------|--------------|
| Department/Project grouping toggle | Blocked until `DEPARTMENT-EDGE` closes (S2.4, not S2.3) |
| `filter(e => e.ppId === currentUser.id)` in React | Server resolves PP scope via `AccessControl` |
| Any resourcing widget or card | PP read model must not contain resourcing (handoff S2.3) |

---

## 6. Rejected patterns (do not copy from Team 5)

| # | Team 5 does this | You must do this instead |
|---|------------------|--------------------------|
| 1 | `EMPLOYEES.filter(...)` in React by `managerId` or `ppId` | Server authorizes via `AccessControl` before returning data |
| 2 | Hardcoded widget values (e.g. Open Resourcing = 2) | Unavailable state for unsourced widgets |
| 3 | All widgets show a number or blank | Four states: loading, zero, empty scope, unavailable |
| 4 | No widget footer | Scope/provenance footer on every widget |
| 5 | PP groups by department/project | Flat list for S2.3. Grouping is S2.4 (blocked) |
| 6 | Full DM and PM dashboard screens | Out of scope until `TT-IDENTITY-01` closes |
| 7 | Role switcher changes data scope directly | Role grants feature access. `AccessControl` sets data scope |

---

## 7. Frontend technical rules (from handoff)

| Rule | Detail |
|------|--------|
| Data fetching | TanStack Query hook only. Never fetch inside a component |
| Pages | `services/frontend/src/pages/DashboardsPage/` |
| i18n | All user-facing text via keys in `services/frontend/src/locales/en/` |
| Motion | Disable animation when `prefers-reduced-motion: reduce` |
| Tabs | Keyboard-accessible preset tabs (UM, PP, etc.) |
| Presets | Render only presets the server returns as available |
| Auth | Never filter or hide data in React. Server omits unauthorized rows |

---

## 8. Color and typography (from Team 5, layout only)

| Token | Value | Use |
|-------|-------|-----|
| Page background | `#f8fafc` | Main content area behind cards (`App.tsx` main) |
| Card / stat surface | `#ffffff` | Cards, stat cards, tables |
| Text primary | `#0f172a` | Headings, names |
| Text muted | `#64748b` | Subtitles, secondary labels |
| Text faint | `#94a3b8` | Empty states, hints |
| Card border | `#e2e8f0` | `.card` and `.stat-card` outer border (`index.css`) |
| Table row divider | `#f1f5f9` | Row separators inside tables |
| Table header bg | `#f8fafc` | Column headers |
| Accent blue | `#0093BE` | Links, primary actions |
| Risk red | `#ef4444` / `#dc2626` | Risk badges, alerts |
| Warning amber | `#d97706` | IDP, CDS overdue |
| Success green | `#16a34a` | Joiners, campaigns |
| Purple | `#7c3aed` | Resourcing (when available) |
| Card radius | 8px | Cards and stat cards |
| Stat value | 22px bold | Stat card number |
| Stat label | 12-13px muted | Below stat value |

---

## 9. Story-to-layout map

| Story | Layout sections to build |
|-------|--------------------------|
| **S2.1** | UM greeting, stat row (Subordinates real; others unavailable until built), people table, scope footers, permission denial |
| **S2.2** | Unavailable state component used on all unsourced stat widgets. Contract tests without permission grant |
| **S2.3** | PP greeting, 4-stat row, flat people table, no resourcing, scope footers |

---

## 10. Quick reference

**Copy from Team 5:** layout, grid, card structure, table density, stat card shape, color hierarchy.

**Copy from handoff:** data states, server auth, scope footers, i18n, TanStack Query, unavailable logic.

**Do not copy from Team 5:** client-side filters, hardcoded numbers, PP grouping toggle, DM/PM screens, missing footers.

**Read next:** `dashboard-implementation-readiness.md` for scope, gates, and repo sync steps.
