# Dashboard Implementation Readiness

**Date:** 2026-09-14  
**Owner:** Carlos Nunes (BA)  
**For:** Tamar Tchelidze (frontend), Anna Pikula (QA)  
**Authoritative handoff:** `dashboard-feature-handoff-2026-09-11.md` (SRC-123)  
**UX patterns (separate doc):** `dashboard-ux-approved-patterns.md`

This doc tells you what to build, what blocks you, and what is in the workspace vs the team repo. It does not replace the handoff. Where they differ, the handoff wins.

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
**Status (last verified 2026-09-14):** **OPEN** in team repo `blockers.yaml`

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

## 7. What is in this workspace

| Asset | Workspace path | Use it for |
|-------|----------------|------------|
| Developer handoff | `06_REQUIREMENTS_WORKSPACE/dashboard-feature-handoff-2026-09-11.md` | Full implementation rules |
| Product §4.4 requirements | `06_REQUIREMENTS_WORKSPACE/people-management-platform-test-assignment-v1.2.md` §4.4 | UM/PP dashboard feature list |
| v1.5 deltas | `06_REQUIREMENTS_WORKSPACE/spec-changelog-v1.2-to-v1.5.md` | Active risk ≠ `low`; access model changes |
| Team 5 UX prototype | `03_DESIGN/current-state/team5-hi5-prototype/` | Layout reference only |
| Team 5 gap analysis | `03_DESIGN/current-state/team5-hi5-prototype-vs-requirements.md` | What to copy vs reject |
| UX approved patterns | `06_REQUIREMENTS_WORKSPACE/dashboard-ux-approved-patterns.md` | Tamar layout guide (SRC-123 companion) |
| Implementation readiness | `06_REQUIREMENTS_WORKSPACE/dashboard-implementation-readiness.md` | This doc |

**Stale. Do not use:**
- `workplace-old/docs/architecture/dashboards.md` says "NOT YET DECIDED." The team repo `dashboard` branch has the updated version.

---

## 8. What is missing from this workspace

These files live in the **team repo** (`workplace`), on the **`dashboard` branch**, not on `main` and not in this bootcamp workspace.

| Missing file | Why you need it |
|--------------|-----------------|
| `_bmad-output/planning-artifacts/platform-capabilities/epics.md` | Full story acceptance criteria for Epic 2 |
| `_bmad-output/implementation-artifacts/platform-capabilities/sprint-status.yaml` | Story status tracking |
| `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml` | Gate statuses (`OQ-PERM-01`, etc.) |
| `docs/test-cases/dashboards/` | Test scenarios (Anna's side) |
| `docs/architecture/dashboards.md` (updated) | Replaces stale `workplace-old` stub |

### How to get them

1. Open or clone the team repo: `https://github.com/altexsoft-dmytro-novyk/workplace`
2. Run: `git fetch origin && git checkout dashboard`
3. Read or copy the files listed above
4. Work from the `dashboard` branch, not `main`

**Sprint keys on the dashboard branch:**

| Story | Sprint key |
|-------|------------|
| PMC-E2-S2.1 | `2-1-unit-manager-dashboard-scope-headcount-and-people-table` |
| PMC-E2-S2.2 | `2-2-unsourced-widget-slots-render-explicit-unavailable-states` |
| PMC-E2-S2.3 | `2-3-people-partner-dashboard-pp-assigned-scope-with-no-resourcing-block` |

All epic-2 stories are `backlog` as of 2026-09-14.


---

## 10. Do not do these things

- Do not create a new epic or new story IDs
- Do not create or rewrite PRD, architecture, UX spec, test strategy, or traceability matrix
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
| **Carlos** | This readiness doc, UX patterns doc, gate escalation, traceability support |
| **Dmytro / Vitaliy** | Resolve `OQ-PERM-01`, branch merge strategy |

---

## 12. Start checklist for Tamar

- [ ] Read `dashboard-feature-handoff-2026-09-11.md`
- [ ] Read `dashboard-ux-approved-patterns.md` for layout. Use `team5-hi5-prototype-vs-requirements.md` for gap detail.
- [ ] Checkout team repo `dashboard` branch
- [ ] Confirm `OQ-PERM-01` status in `blockers.yaml`
- [ ] If gate open: start **S2.2 only**. Wait for PO answer before S2.1 and S2.3.
- [ ] If gate closed: start S2.1 → S2.2 → S2.3 in order
- [ ] Follow delivery sequence in Section 2 for every story

**Demo date:** 2026-09-15 (DEC-126)

---

## 13. Share for team review

**Copy-paste PR commands:** `06_REQUIREMENTS_WORKSPACE/workplace-pr/PR-COMMANDS.md`

**Team repo copy:** `/Users/work/AI-Training/workplace/docs/dashboard/`

| File | Purpose |
|------|---------|
| `dashboard-implementation-readiness.md` | This doc |
| `dashboard-ux-approved-patterns.md` | Layout guide |
| `dashboard-feature-handoff-2026-09-11.md` | Authoritative handoff |

Run the commands in `PR-COMMANDS.md` to branch, commit, push, and open the PR for Tamar, Anna, and Dmytro.
