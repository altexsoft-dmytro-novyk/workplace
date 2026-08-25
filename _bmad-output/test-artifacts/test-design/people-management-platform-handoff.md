---
title: 'TEA Platform Test Design → BMAD Handoff Document'
version: '1.3'
workflowType: 'testarch-test-design-handoff'
sourceWorkflow: 'testarch-test-design'
generatedBy: 'TEA Master Test Architect'
generatedAt: '2026-08-25'
projectName: 'people-management-platform'
status: 'approved'
approvedAt: '2026-08-25'
---

# TEA → BMAD Integration Handoff (Platform Level)

## Purpose

Bridges the **platform-level** test design with BMAD epic/story decomposition across all bounded contexts. User Management child TEA is **approved and unchanged** — this handoff adds platform rollup, coverage-map status, delta-review rules, and sequencing for remaining domains.

**Approved 2026-08-25** as the **platform planning baseline** for BMAD epic/story decomposition, coverage mapping, and release-gate planning. Runtime evidence (PG-01..PG-07) and PR-B contract resolution remain implementation-owned.

**Human decisions applied 2026-08-25:** PG-07 (release gate), OQ2 (auth required), PR-005 (canonical User ID), PR-B-04 scope (PF read-only candidates + vacancies), PR-B scope rule (does not block UM/AC).

---

## TEA Artifacts Inventory

| Artifact | Path | Scope | BMAD integration |
| --- | --- | --- | --- |
| Platform architecture test design | `_bmad-output/test-artifacts/test-design-architecture-platform.md` | Cross-cutting risks, PR-B blockers, NFR gates | Foundation stories, integration ADRs |
| Platform QA test design | `_bmad-output/test-artifacts/test-design-qa-platform.md` | Coverage map, Appendix C trace, delta-review | Epic prioritization, waiver tracking |
| Platform validation report | `_bmad-output/test-artifacts/test-design-validation-report-platform.md` | Validation + edit delta | Re-validation gate |
| **Child: UM architecture** | `_bmad-output/test-artifacts/test-design-architecture.md` | user-management | Epics 1–4 gates — **approved, do not redo** |
| **Child: UM QA** | `_bmad-output/test-artifacts/test-design-qa.md` | user-management | Story AC, TD-UM-* IDs — **approved** |
| **Child: UM handoff** | `_bmad-output/test-artifacts/test-design/people-management-handoff.md` | user-management | UM workflow sequence — **approved** |
| **Child: UM progress** | `_bmad-output/test-artifacts/test-design-progress-system.md` | user-management | UM workflow checkpoint (not platform) |
| Access Control partial child | `docs/test-cases/access-control/` (202 files) + SPEC | access-control | Stage-1 draft; delta-TEA optional |
| Progress (platform) | `_bmad-output/test-artifacts/test-design-progress-platform.md` | platform | Workflow state |

---

## Delta-Review Protocol (Future Epics)

**Baseline (stable):** Platform coverage map, Appendix C trace (`TR-*` IDs), PG-01..PG-07 gates, PR-* / PR-B-* registers. **User Management child TEA approved — never redo.**

| Trigger | Required action |
| --- | --- |
| New bounded context confirmed (AD-5) | **Delta child doc** only — new rows, context risks; map stories to `TR-*` IDs |
| access-control implementation | Optional consolidation TEA; per-file AD-1 approval → stage-2 P0; **no platform re-run** |
| §4.9 remaining auto-events | Delta scenarios when PR-B-05 + PR-B-07 resolve; **not** UM child scope today |
| §2 / §3 / §7 / §9 normative change | **Full platform TEA re-run** |
| Story acceptance criteria | Must cite `TR-*` or platform map row + `docs/project-requirements.md` § |

---

## Platform Quality Gates (Release — §9)

| Gate | Criterion | Owner context |
| --- | --- | --- |
| **PG-01** | access-control P0 gate E2E 100% green — every `—` cell, unflagged S7 vs employee and PM, colleague whitelist | access-control |
| **PG-02** | User Management child P0 100% green | user-management |
| **PG-03** | Timetracker real API integration (or documented waiver) | integration |
| **PG-04** | Extensible FR via UI without deploy (UR-01..03) | access-control |
| **PG-05** | No open PR-001..PR-006 without mitigation/waiver | platform |
| **PG-06** | Trace: each in-scope §4 feature → scenario or waiver (Appendix C) | platform QA |
| **PG-07** | List perf ≤2 s @ 500+ — **release gate**; waiver only temporary and documented | Product + Platform |

---

## Epic-Level Integration Guidance (Platform — Non-UM)

| Epic / domain | P0 gate | Status | Blocker |
| --- | --- | --- | --- |
| **Access Control** | Tier + surfaces + matrix `—` + S7/colleague negatives | Scenarios drafted | Per-file AD-1 before stage-2 |
| **Profile / All Employees** | TR-4.1-* + TR-4.2-* | Not started | PR-B-01, PR-B-05 |
| **Dashboards** | TR-4.4-*; widget data bounded by tier | Not started | PR-B-02 |
| **Timetracker integration** | TR-5.1-*; TD-11 revocation + real API smoke | Not started | PR-B-03 |
| **PeopleForce integration** | TR-5.2-* candidates + vacancies (read-only) | Not started | PR-B-04 **contract** (scope decided) |
| **Resourcing workflow** | TR-4.7-* | Not started | PR-B-05; PF scope fixed per PR-B-04 |
| **Risks — access** | TR-4.6-01 (S6 matrix) | AC draft | — |
| **Risks — dashboard** | TR-4.6-02, TR-4.6-03 | Not started | PR-B-05 |
| **CDS** | TR-4.10-* | Not started | PR-B-05 |
| **Campaigns / Action items** | TR-4.5-*, TR-4.12-* | Not started | PR-B-05 |
| **Feedback** | TR-4.15-* | Not started | PR-B-05 |
| **Mentorship hub** | TR-4.11-* (hub); TR-4.11-06 pairing in UM | UM pairing approved | PR-B-05 for hub |
| **Career timeline — remaining auto-events** | TR-4.9-03..06 | Not started | PR-B-05, PR-B-07 |

**User Management epics 1–4:** see approved `people-management-handoff.md` — unchanged. Platform note: UM child covers **partial** §4.9 only (TR-4.9-01, 02, 07, 08).

---

## Story-Level Guidance (Platform Blockers → Stories)

**Scope rule:** PR-B-01, PR-B-02, PR-B-03, PR-B-05, PR-B-06, PR-B-07 do **not** block UM or Access Control stories. Proceed with UM ATDD and AC stage-2 independently.

| Blocker | Stories must NOT start until | Required artifact | Does not block |
| --- | --- | --- | --- |
| PR-B-01 | TR-4.1-05..08 (custom fields, views, export columns) | Storage model AD + admin UI spec | UM, AC |
| PR-B-02 | TR-4.4-* (any dashboard widget) | Dashboard engine DESIGN.md | UM, AC |
| PR-B-03 | TR-4.3-05, TR-5.1-*, TR-4.7-06 | Timetracker port interface doc | UM, AC tier drafts |
| PR-B-04 | TR-5.2-*, TR-4.7-03 PF paths | PeopleForce port contract (scope decided: read-only candidates + vacancies; link fallback only) | UM, AC |
| PR-B-05 | Any pending-context HTTP routes / workflows | AD-5 context confirmation | UM, AC |
| PR-B-06 | TD-13 department manager final E2E | Department modeling AD | UM, AC tier drafts |
| PR-B-07 | TR-4.9-03..06, TR-6-01 | Temporal employment model AD | UM partial §4.9, AC |
| ~~OQ2~~ | — | **Decided:** auth required for share-link viewer | — |
| ~~PG-07~~ | — | **Decided:** release gate; temporary waiver only | — |

---

## Risk-to-Epic Mapping (Platform PR-*)

| Risk ID | Category | P×I | Epic / domain | Test level |
| --- | --- | --- | --- | --- |
| PR-001 | SEC | 9 | access-control surfaces + matrix | E2E API |
| PR-002 | SEC | 6 | access-control tier engine | E2E API + arch review |
| PR-003 | PERF | 6 | All Employees list + AC tier | k6 + E2E API |
| PR-004 | TECH | 6 | Timetracker sync | E2E API + integration | **Blocked** |
| PR-005 | DATA | 6 | Identity bootstrap | E2E API | **Decided** — canonical User ID |
| PR-006 | SEC | 6 | access-control roles | E2E API |
| PR-007 | TECH | 4 | resourcing → user-management seam | E2E API | **Blocked** |
| PR-008 | DATA | 4 | UserEvents hooks + PR-B-07 events | E2E API | **Blocked partial** |
| PR-009 | BUS | 4 | resourcing PeopleForce | Manual + E2E | **Blocked** |
| PR-010 | OPS | 4 | Platform CI/deploy | Infra | **TBD** |

**Child UM risks R-001..R-014:** see `people-management-handoff.md`.

---

## Recommended BMAD → TEA Workflow Sequence

1. ~~**Human approval**~~ — **Approved 2026-08-25** as platform planning baseline
2. **User Management ATDD** — approved child; proceed without redo
3. **Access Control ATDD** — delta-review optional; P0 tier + surfaces after per-file AD-1 approval
4. **Architect resolves PR-B-01..07 contracts** — unblocks delta child TEA for affected domains (does not block UM/AC)
5. **Delta child TEA** per confirmed context — map to Appendix C `TR-*` IDs
6. **Platform trace** — `/bmad-testarch-trace` against Appendix C
7. **nfr-assess** — after evidence exists; PG-07 enforced as release gate

---

## Phase Transition Quality Gates

| From | To | Gate |
| --- | --- | --- |
| Platform test design | Human approval | **Approved 2026-08-25** — planning baseline |
| Edit pass | Re-validation | C-01..C-05 documentation fixes applied |
| Approval | UM ATDD | Child already approved — no re-review |
| Approval | AC ATDD | AC SPEC + tier/surfaces scenarios approved per file (AD-1) |
| PR-B resolution | Delta child TEA | Decision recorded in architecture spine |
| Delta child TEA | Implementation | Red E2E per context P0 |
| Implementation | Platform release | PG-01..PG-07 (PG-07 = release gate; temporary waiver only) |

---

## Follow-up Actions

### Documentation / process (complete in edit pass)

- C-01..C-05 and W-01..W-10 addressed in platform artifacts — see validation report edit delta.

### Human-owned (remaining — post planning approval)

1. **PR-B-01, PR-B-02, PR-B-03, PR-B-05, PR-B-06, PR-B-07** — architecture/integration decisions (do **not** block UM or AC).
2. **PR-B-04 contract** — PF API endpoints/auth after scope decision (read-only candidates + vacancies).

### Decided 2026-08-25 (recorded in platform docs)

| ID | Decision |
| --- | --- |
| PG-07 | List ≤2 s @ 500+ = **release gate**; waiver temporary + documented |
| OQ2 | Shared links require **authentication** in Iteration 2 |
| PR-005 | Internal User ID canonical; external IDs explicit; email hint only |
| PR-B-04 scope | PF read-only: candidates + vacancies; external link fallback only |
| PR-B scope | PR-B-01/02/03/05/06/07 do **not** block UM or Access Control |

### Implementation-owned (evidence deferred to build / CI)

1. PG-01..PG-06 green E2E evidence (AC + UM stage-2 suites).
2. PG-03 timetracker real API smoke (post PR-B-03 contract).
3. k6 baseline for TR-7-01 — **PG-07 release gate** (TD-UM-NFR-PERF-01 partial today).
4. PR-001..PR-006 mitigation implementation evidence or waivers.
5. Deployed demonstrable environment (PR-010 / §9 DoD).
6. Per-file developer approval of 202 AC + 45 UM stage-1 scenarios before stage-2 E2E.

---

**Status:** Approved 2026-08-25 as platform planning baseline. UM ATDD + AC stage-2 authorized.
