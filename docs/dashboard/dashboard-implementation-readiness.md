# Dashboard Implementation Readiness

**Date:** 2026-09-14  
**Owner:** Carlos Nunes (BA)  
**For:** Tamar Tchelidze (frontend), Anna Pikula (QA)  
**Authoritative handoff:** `docs/dashboard/dashboard-feature-handoff-2026-09-11.md`

This doc tells you what to build and what blocks you. It does not replace the handoff, the PRD, the epic, or the UX specs. Where they differ, those win.

All paths below are relative to this repository root and resolve on `main`.

---

## 1. Scope

Implement **3 stories only**, in this order:

| Order | Story ID | What to deliver |
|-------|----------|-----------------|
| 1 | `PMC-E2-S2.1` | Unit Manager dashboard: reporting-line scope, headcount, people table, permission denial, empty scope, widget scope footer |
| 2 | `PMC-E2-S2.2` | Unsourced widget slots show explicit **unavailable** state. Never fake a number. |
| 3 | `PMC-E2-S2.3` | People Partner dashboard: PP-assigned scope only. No resourcing block. |

**Do not start:**
- `PMC-E2-S2.4` (PP department grouping) until `DEPARTMENT-EDGE` closes
- Epic 3
- Delivery Manager or Project Manager dashboards until `TT-IDENTITY-01` closes
- Widget builder, custom dashboards, drag-and-drop, resize handles

---

## 2. Delivery sequence (mandatory per story)

1. Write test scenarios
2. Commit a failing backend E2E test (real PostgreSQL)
3. Implement backend
4. Update Pact contract if API shape changes
5. Implement frontend (TanStack Query + Playwright)
6. Review, then move to the next story

No skipping steps. No starting the next story before review.

---

## 3. Backend rules

- New bounded context: `services/backend/src/dashboards/`
- Check dashboard functional permission before returning data
- Resolve authorized targets through `AccessControl` **before** counting or aggregating
- Reuse the existing employee-list row projection for tables
- Return only server-authorized fields and rows
- Distinguish four states: measured zero, empty scope, unavailable source, and normal data
- Consume other contexts via `application/` exports only. Never import their `domain/` or `infrastructure/`
- One dashboard composition capability, not separate per-role apps

---

## 4. Frontend rules

- TanStack Query hook for all data. Never fetch inside a component
- Pages under `services/frontend/src/pages/DashboardsPage/`
- i18n keys in `services/frontend/src/locales/en/`
- Four UI states: loading skeleton, measured zero, empty scope, unavailable source
- Scope/provenance footer on every rendered widget
- Keyboard-accessible preset tabs
- Disable motion when `prefers-reduced-motion: reduce` is active
- Render only presets the server returns as available
- **Never authorize in React.** The server omits unauthorized rows and fields.

---

## 5. Verification commands

**Backend:**
```bash
nvm use
npm run db:up
npm run test:e2e
npm run test:contract
npm run build
```

**Frontend:**
```bash
nvm use
npm run test:unit
npm run test:contract
npm run test
npm run build
```

Run a fresh code review after each story. Push backend and frontend in separate commits.

---

## 6. Permission gate (read before coding)

**Gate ID:** `OQ-PERM-01`  
**Question:** Who gets the `dashboard-view` functional permission by default?  
**Status (last verified 2026-09-14 on `main`):** **`status: open`** in `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml`

**This is not a BMad workflow.** Do not run PRD, architecture, epic-creation, or sprint-planning skills for this.

| Story | Can start while gate is open? |
|-------|-------------------------------|
| `PMC-E2-S2.1` | **No.** Stop and ask Product Owner. |
| `PMC-E2-S2.2` | **Yes.** Contract checks for unavailable states do not need dashboard permission. |
| `PMC-E2-S2.3` | **No.** Stop and ask Product Owner. |

**PO question to resolve (for Vitaliy / Dmytro):**

> For bootcamp demo, can we seed `dashboard-view` permission for UM and PP test users in the seed list?

Until answered:
- Tamar may start **S2.2 only**
- Do not seed, bypass, or infer permission grants yourself

---

## 7. Authoritative sources

All of these are on `main`. Read them instead of any summary, including this one.

| Asset | Path | Use it for |
|-------|------|------------|
| Developer handoff | `docs/dashboard/dashboard-feature-handoff-2026-09-11.md` | Full implementation rules |
| PRD **v1.5** §4.4 | `docs/project-requirements.md` | UM/PP dashboard feature list, risk model (§4.6) |
| v1.2 → v1.5 changelog | `docs/requirements-changelog-v1.2-to-v1.5.md` | Access-model split, active risk ≠ `low`, `leaver` is a forecast |
| Epic 2 stories and AC | `_bmad-output/planning-artifacts/platform-capabilities/epics.md` | Binding acceptance criteria for S2.1–S2.3 |
| UX experience spec | `_bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md` | Screen behavior, states, copy register |
| UX design tokens | `_bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/DESIGN.md` | `.pghd`, `.prov`, `.wscope`, `.emptyst`, token names |
| Dashboard architecture | `docs/architecture/dashboards.md` | AD-33 binding rule — fixed read models, no widget framework |
| Access control | `docs/architecture/access-control.md` | Scope resolution before aggregation |
| Gate registry | `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml` | `OQ-PERM-01`, `DEPARTMENT-EDGE`, `TT-IDENTITY-01` |
| Story status | `_bmad-output/implementation-artifacts/platform-capabilities/sprint-status.yaml` | Sprint keys and current state |

**UI comes from `EXPERIENCE.md` and `DESIGN.md`.** Reference tokens by name. Do not copy hex values or layouts from any cross-team prototype, and do not write a second UX spec.

---

## 8. Story status and sprint keys

Source: `_bmad-output/implementation-artifacts/platform-capabilities/sprint-status.yaml` on `main`, verified 2026-09-14.

| Story | Sprint key | Status |
|-------|------------|--------|
| PMC-E2-S2.1 | `2-1-unit-manager-dashboard-scope-headcount-and-people-table` | `backlog` |
| PMC-E2-S2.2 | `2-2-unsourced-widget-slots-render-explicit-unavailable-states` | `backlog` |
| PMC-E2-S2.3 | `2-3-people-partner-dashboard-pp-assigned-scope-with-no-resourcing-block` | `backlog` |

Read the sprint key from the YAML rather than from this table. Update status only through the normal sprint-status flow.

### Availability at sprint entry (epics.md, Epic 2 source audit)

S2.2 exists to make this distinction visible rather than paper over it.

| Available today | Unavailable — must render an explicit unavailable state |
|-----------------|----------------------------------------------------------|
| Headcount, people-table identity columns, navigation shortcuts, People Partner scope, resourcing-absent-by-construction | Risk counts and the risk/trend column (`PM-FR-21`), action items (`PM-FR-19`), resourcing requests (`PM-FR-23`), campaigns (`PM-FR-20`), project column (`PM-FR-37`, also `TT-IDENTITY-01`), leave status (`PM-FR-36`) |

Per S2.2, while `PM-FR-21` is uncovered, **no risk level, count, or trend arrow appears anywhere on the dashboard.**


---

## 10. Do not do these things

- Do not create a new epic or new story IDs
- Do not create or rewrite PRD, architecture, UX spec, test strategy, or traceability matrix
- Do not show a risk level, count, or trend arrow anywhere on the dashboard while `PM-FR-21` is uncovered
- Do not present `leaver` as a departure. It is a risk forecast; the fact of departure is `dismissed` employment status (PRD §4.6)
- Do not run BMad PRD, architecture, epic-creation, test-design, or sprint-planning workflows
- Do not edit planning artifacts to make implementation easier
- Do not self-close, bypass, seed, or infer an open permission gate
- Do not build a widget framework, builder, catalog, or customize mode
- Do not implement DM/PM dashboards
- Do not implement PP department grouping until `DEPARTMENT-EDGE` closes
- Do not authorize in React
- Do not aggregate first and filter later
- Do not use a functional role as data scope
- Do not show `0`, `—`, or empty chart for an unavailable source
- Do not add a resourcing card to the PP dashboard
- Do not duplicate the employee projection for dashboard tables
- Do not use fakes for behavior owned by the current story
- Do not mark `PM-FR-15` or `PM-FR-18` fully done while widget sources remain unavailable

---

## 11. Who does what

| Person | Role |
|--------|------|
| **Tamar** | Implements S2.1, S2.2, S2.3 per handoff |
| **Anna** | Test scenarios, PASS gate, verification |
| **Carlos** | This readiness doc, gate escalation, traceability support |
| **Dmytro / Vitaliy** | Resolve `OQ-PERM-01`, branch merge strategy |

---

## 12. Start checklist for Tamar

- [ ] Read `docs/dashboard/dashboard-feature-handoff-2026-09-11.md`
- [ ] Read Epic 2 in `_bmad-output/planning-artifacts/platform-capabilities/epics.md` — the AC are binding
- [ ] Read `_bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md` and `DESIGN.md` for layout, states, and token names
- [ ] Confirm `OQ-PERM-01` status in `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml`
- [ ] If gate open: start **S2.2 only**. Wait for PO answer before S2.1 and S2.3.
- [ ] If gate closed: start S2.1 → S2.2 → S2.3 in order
- [ ] Follow delivery sequence in Section 2 for every story

**Demo date:** 2026-09-15 (DEC-126)

---

## 13. Files in this folder

| File | Purpose |
|------|---------|
| `docs/dashboard/dashboard-feature-handoff-2026-09-11.md` | Authoritative handoff |
| `docs/dashboard/dashboard-implementation-readiness.md` | This doc — scope, gates, source pointers |

Layout guidance is not duplicated here. Use `EXPERIENCE.md` and `DESIGN.md` (Section 7).
