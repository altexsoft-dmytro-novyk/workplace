# Test Design for QA: People Management Platform

**Purpose:** Platform-level test execution strategy and coverage map. Defines what the full platform must prove, how child test designs roll up, and what remains blocked. Does **not** replace User Management child scenarios or tests.

**Date:** 2026-08-25  
**Author:** TEA (bmad-testarch-test-design)  
**Status:** Approved 2026-08-25 — platform planning baseline  
**Project:** People Management Platform — Iteration 2

**Related:** `test-design-architecture-platform.md` (platform blockers, PR-* risks) · `test-design-qa.md` (User Management child — approved) · `test-design-architecture.md` (User Management child — approved)

---

## Executive Summary

**Scope:** Platform-wide coverage map for `docs/project-requirements.md` v1.2 — roles (§2), access model (§3), all functional areas (§4), integrations (§5), NFRs (§7), and Definition of Done (§9).

**Child test designs (inherit, do not redo):**

| Child domain | TEA status | Stage-1 scenarios | P0 focus |
| --- | --- | --- | --- |
| **User Management** | Approved 2026-08-25 | 45 files | ~8 P0 (see child QA doc) |
| **Access Control** | Partial child — scenario suite + SPEC (draft) | 202 files | Tier + matrix + surfaces (all P0-class) |

**Platform coverage summary (excluding approved UM detail):**

| Band | Approx. scenarios | Status |
| --- | --- | --- |
| P0 platform gates | ~220+ | AC suite + UM child P0 |
| P1 core workflows | ~80–120 | Partially blocked (see map) |
| P2 edge / NFR | ~30–50 | Mostly TBD pending contexts |
| P3 exploratory | ~10–20 | Post-MVP |
| **Remaining (blocked/TBD)** | **~150–250** | Requires architect/integration decisions |

**Effort (platform, all contexts):** ~12–20 weeks (1 QA engineer, parallel feature owners per AD-4) — wide interval reflects unresolved PR-B blockers.

> **Note:** P0/P1/P2/P3 = priority and risk focus, **not** execution timing.

---

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| User Management scenario detail | Child TEA approved | `test-design-qa.md` |
| Notifications (§4.13) | GOOD TO HAVE | Manual if built later |
| Analytics/reports (§4.14) | GOOD TO HAVE | Out of iteration |
| Compensation, pre-onboarding, LMS, mentorship goals | §10 out of scope | N/A |
| Live third-party calls in gate E2E | AD-3 | Fixture-backed port fakes |
| UI/visual regression | AD-3 API-first gate | Deferred until `bmad-ux` contracts exist |
| §8 engineering process (BMAD, parallelism, intelligent repo) | Graded by bootcamp process, not product gate E2E | Bootcamp grading / repo audit |

**Access-control governance:** The 202 stage-1 files + `spec-access-control-test-cases/SPEC.md` are the **partial approved child baseline** for access boundaries. A consolidation TEA doc is optional (delta-review). **PG-01** is enforceable only after per-file AD-1 approval and stage-2 P0 E2E green — not before.

---

## Dependencies & Test Blockers

**Scope rule (decided 2026-08-25):** PR-B-01, PR-B-02, PR-B-03, PR-B-05, PR-B-06, and PR-B-07 block **feature domains and delta child TEA only** — they **do not** block User Management child ATDD or Access Control stage-1/stage-2 gate E2E.

### Architecture / Product (Platform)

| Blocker ID | Blocks | Does not block | Owner | Status |
| --- | --- | --- | --- | --- |
| PR-B-01 | Custom fields, saved views, full §4.1 runtime | UM, AC (incl. S16 draft matrix) | Architect | **TBD** |
| PR-B-02 | All §4.4 dashboards | UM, AC | Architect | **TBD** |
| PR-B-03 | Timetracker leaves/projects, tier sync | UM, AC tier draft scenarios | Integration | **TBD** |
| PR-B-04 | PF port contract + resourcing PF E2E | UM, AC | Integration | **Scope decided** — read-only candidates + vacancies; external link fallback only; **contract TBD** |
| PR-B-05 | Child delta-TEA for 7 pending contexts | UM, AC | Architect | **TBD** |
| PR-B-06 | TD-13 department manager final E2E | UM, AC tier draft suite | Product + Architect | **TBD** |
| PR-B-07 | Temporal employment model (§6) | UM partial §4.9, AC | Architect | **TBD** |
| ~~OQ2~~ | — | — | — | **Decided 2026-08-25:** shared links require auth in Iteration 2 |

### QA Infrastructure (Platform — extends UM child)

1. **PostgreSQL test DB** — migrated; one worker + UUID isolation (DEC-UM-010); schema-per-worker before parallel CI.
2. **Canonical personas** — access-control README cast; tokens for all tier paths.
3. **Port fakes** — email (UM), timetracker leaves/projects (**TBD contract**), PeopleForce (**TBD contract**).
4. **k6** — 500+ row seed; nightly; owned by Platform.
5. **CI tiers** — PR: all gate E2E <15 min; nightly: k6 + `@concurrency`; weekly: trace audit.

---

## Platform Coverage Map

**Columns:** Req = `project-requirements.md` section · Context = bounded context (AD-5) · Child = existing test design · Scenarios = stage-1 file count · Priority = platform band · Status

### Cross-Cutting — Roles & Access (Normative)

| Feature | Req | Context | Child / artifact | Scenarios | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Two-dimensional role model | §2 | access-control | SPEC + `users/roles/` | 12 | P0 | Scenarios draft |
| Extensible FR via UI | §2.3 | access-control | UR-* scenarios | 12 | P0 | Scenarios draft |
| Tier derivation (reports-to + project) | §2.1 | access-control | `tier-derivation/` | 13 | P0 | Scenarios draft; TD-13 provisional |
| §3.2 matrix per section/audience | §3.2 | access-control | `matrix/sNN-*/` | 148 | P0 | Scenarios draft |
| Colleague whitelist exactness | §3.3.3 | access-control | SF-01, matrix negatives | 8+ | P0 | Scenarios draft |
| Custom field visibility rules | §3.3.5, S16 | access-control | `matrix/s16-*` | 10 | P0 | **Blocked PR-B-01** for runtime fields |
| Fail-closed / bootstrap admin | AD-11/12 | access-control | `fail-closed/` | 3 | P0 | Scenarios draft |
| HR Admin full access | §3.1 | access-control | `matrix/hr-admin/` | 3 | P0 | Scenarios draft |
| Profile sharing | §4.8 | access-control | `shared-link/` | 12 | P0 | Scenarios draft; **OQ2 decided** — auth required Iteration 2 |
| Cross-surface leak prevention | §3.3.1 | access-control | `surfaces/` | 8 | P0 | Scenarios draft |
| Unauthenticated rejection | §3.3.4 | access-control | `au-*`, SF-07/08 | 5+ | P0 | Scenarios draft |

### User Management (Child — Approved)

| Feature | Req | Context | Child artifact | Scenarios | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Registration / lifecycle | §4.1 partial, §4.2 S1 | user-management | `test-design-qa.md` | 45 | P0–P2 | **Approved child — ATDD next** |
| Magic-link auth | FR-2/3/7 | user-management | child QA | 6 | P0 | Approved child |
| Career timeline — UM child scope | §4.9 partial | user-management | child QA | 7 | P0–P1 | **Approved child** — `joined_company`, `position_change`, manual add/correct (DEC-UM-001) only |
| Career timeline — mentorship events | §4.9 | user-management | child QA REL-04/05 | 2 | P1 | Approved child — `mentorship_start`/`mentorship_end` via pairing |
| Career timeline — remaining auto-events | §4.9 | pending (**TBD**) | — | 0 | P0 | **Blocked PR-B-05, PR-B-07** — grade, department, FTE↔subcontractor, extended leave; no UM scenarios |
| Reports-to / mentorship pairing facts | §4.11 partial, AD-11 | user-management | child QA | 8 | P0–P1 | Approved child |
| Employee list (S1 filters) | §4.1 partial, NFR-2 | user-management | child QA | 4 | P1 | Approved child |

**Do not expand UM rows here** — see `test-design-qa.md` for TD-UM-* IDs and counts.

### Profile & All Employees (Blocked / Pending Context)

| Feature | Req | Context | Child | Scenarios | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Profile assembly (S1–S16) | §4.2 | profile (**TBD**) | — | 0 | P0 | **Blocked PR-B-05** |
| All Employees list (full) | §4.1 | profile + AC | — | 0 | P0 | **Blocked PR-B-01**, PR-B-05 |
| Saved views / tabs | §4.1 | profile (**TBD**) | — | 0 | P1 | **Blocked PR-B-01** |
| Export xlsx (entitled columns) | §4.1 | profile + AC | SF-02 partial | 0 feature | P0 | AC scenario only |
| Inline edit through list | §4.1 | profile (**TBD**) | SF-05 partial | 0 feature | P1 | **Blocked PR-B-01** |
| Colleague mode list + profile | §4.1, §3.3.3 | profile + AC | SF-01 partial | 0 feature | P0 | AC scenario only |
| Self-service (S2, S3, photo, etc.) | §4.3 | profile + UM | UM partial | partial | P1 | **Blocked PR-B-05** |
| Personal / emergency contacts | S2, S3 | profile (**TBD**) | matrix only | 0 feature | P1 | **Blocked PR-B-05** |
| Employment / documents sections | S4, S5 | profile (**TBD**) | matrix only | 0 feature | P1 | **Blocked PR-B-05** |

### Dashboards (Blocked)

| Feature | Req | Context | Child | Scenarios | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| UM dashboard (by people) | §4.4.1 | dashboards | — | 0 | P1 | **Blocked PR-B-02** |
| DM dashboard (by project, selector) | §4.4.2 | dashboards | — | 0 | P1 | **Blocked PR-B-02** |
| PM dashboard (scoped DM) | §4.4.3 | dashboards | — | 0 | P1 | **Blocked PR-B-02** |
| PP dashboard (no resourcing) | §4.4.4 | dashboards | — | 0 | P1 | **Blocked PR-B-02**; PP widgets **[DESIGN FREEDOM]** |
| Dashboard FR permission gate | §2.3 | access-control | UR-* partial | 0 feature | P0 | Permission scenario exists; dashboard TBD |

### Workflow Domains (Blocked — Context Pending)

| Feature | Req | Context | Child | Scenarios | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Action items — access (S14) | §4.5, S14 | access-control | matrix S14 | 12+ | P0 | AC scenario only |
| Action items — workflow | §4.5 | campaigns? (**TBD**) | — | 0 | P1 | **Blocked PR-B-05** — manual create, campaign spawn, cancel, overdue |
| Risk records — access (S6) | §4.6, S6 | access-control | matrix S6 | 10+ | P0 | AC scenario only — employee never sees risk |
| Risk dashboard — workflow | §4.6 | risk (**TBD**) | — | 0 | P0 | **Blocked PR-B-05** — trend arrow, counts, filters, drill-through |
| Resourcing — access (S15) | §4.7, S15 | access-control | matrix S15 | 6+ | P0 | AC scenario only |
| Resourcing — workflow | §4.7 | resourcing (**TBD**) | — | 0 | P1 | **Blocked PR-B-04, PR-B-05** — see Appendix C |
| CDS — access (S12) | §4.10, S12 | access-control | matrix S12 | 10+ | P1 | AC scenario only |
| CDS — registry + filters | §4.10 | cds (**TBD**) | — | 0 | P1 | **Blocked PR-B-05** — see Appendix C |
| Mentorship hub — pairing | §4.11 | user-management | UM REL | 8 | P1 | Approved child (pairing only) |
| Mentorship hub — workflow | §4.11 | mentorship (**TBD**) | — | 0 | P1 | **Blocked PR-B-05** — see Appendix C |
| Form campaigns | §4.12 | campaigns (**TBD**) | — | 0 | P1 | **Blocked PR-B-05** |
| Feedback — access (S8) | §4.15, S8 | access-control | matrix S8 | 10+ | P1 | AC scenario only |
| Feedback — workflow | §4.15 | feedback (**TBD**) | — | 0 | P1 | **Blocked PR-B-05** |

### Integrations (Blocked / Partial)

| Integration | Req | Port | Child | Scenarios | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Timetracker — leaves | §5.1, S10 | outbound adapter | — | 0 | P0 | **Blocked PR-B-03**; matrix read-only |
| Timetracker — projects/people/PM/DM | §5.1, §2.1, S11 | outbound adapter | TD-05..11 | 0 sync | P0 | **Blocked PR-B-03** |
| PeopleForce — candidates | §5.2, §4.7 | outbound adapter | — | 0 | P1 | **Blocked PR-B-04 contract**; scope: read-only PF; fallback link emergency-only |
| PeopleForce — vacancies SoT | §5.2 | outbound adapter | — | 0 | P1 | **Blocked PR-B-04 contract**; scope decided — vacancies in read-only PF integration |
| Sync replaces managedBy rows | AD-13 | integration | — | 0 | P0 | **Blocked PR-B-03** |
| Identity mapping PF→User→tt | §6 | cross-cutting | — | 0 | P0 | **Decided PR-005** — canonical User ID; external IDs explicit; email hint only; scenarios at ATDD |
| Temporal employment records | §6 | cross-cutting | — | 0 | P0 | **Blocked PR-B-07** |

### Non-Functional Requirements (Platform)

| NFR | Req | Validation | Tool | Evidence | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Access-control correctness | §7, §9 | Full AC gate E2E | Playwright API | Test report | P0 | Scenarios drafted |
| List performance ≤2 s | §7 | Load test composed list | k6 | JSON summary | **P0** | Partial — UM child; **PG-07 release gate** |
| Graceful integration failure | §7, NFR-3 | Port throw after success path | E2E + fake | UM dispatch test exists | P1 | Extend per port |
| Pseudonymised data | §7 | Fixture/log scan | CI grep | Lint report | P2 | TD-UM-NFR-PII-01 |
| Accessibility / responsive | §7 | **Threshold unknown** | **TBD** | **TBD** | P2 | **TBD — no §7 numeric target** |
| Extensible FR without deploy | §9 | UI create role + permission | E2E | UR-01..03 green | P0 | AC scenarios drafted |

---

## Risk Assessment (QA View — Platform)

| Risk ID | Score | QA coverage |
| --- | --- | --- |
| PR-001 | 9 | Complete AC surfaces + matrix negatives before release |
| PR-002 | 6 | Add cache-invalidation tests if architecture proposes caching |
| PR-003 | 6 | k6 platform list; child TD-UM-NFR-PERF-01 insufficient alone |
| PR-004 | 6 | **Blocked** — timetracker sync E2E post PR-B-03 |
| PR-005 | 6 | **Decided** — canonical User ID + explicit external IDs; identity bootstrap E2E at integration ATDD |
| PR-006 | 6 | Re-run UR-11 pattern per new FR permission |
| PR-007–PR-012 | 1–4 | See architecture-platform doc |

**Child UM risks (R-001..R-014):** authoritative within user-management; roll up to platform release gate but not re-documented here.

---

## NFR Test Coverage Plan (Platform)

| Category | Requirement | Planned validation | Tool | Evidence | Priority |
| --- | --- | --- | --- | --- | --- |
| Security | §3 strict matrix | AC gate E2E all `—` cells | Playwright API | Green suite | P0 |
| Security | §2.3 FR never widens data | UR-11 + per-permission | E2E API | Test report | P0 |
| Performance | 500+ / 2 s | k6 on production list route | k6 | Nightly + pre-release JSON | **P0** |
| Reliability | Port failure graceful | One throwing-fake test per outbound port | E2E API | Per-port report | P1 |
| Maintainability | §9 DoD traceability | Trace matrix FR→scenario→E2E | Manual + CI | Trace doc | P2 |
| Accessibility | §7 qualitative | **TBD** | **TBD** | **TBD** | P2 |

Missing thresholds: accessibility metrics, integration retry/backoff — mark **TBD**, do not invent.

---

## Execution Strategy

**Philosophy:** Run all gate E2E in PRs if total suite <15 min; defer expensive suites.

### Every PR

- User Management `@P0`–`@P2` gate E2E (child, one worker)
- Access Control `@P0` gate E2E as it lands (matrix + tier + surfaces first)
- Auth smoke (session token issuance)
- No `@blocked`, no k6, no live timetracker/PeopleForce

### Nightly

- k6 TD-UM-NFR-PERF-01; expand to platform list when route exists
- `@concurrency` tags (UM REG-08, REL-08)
- PII scan (NFR-1)

### Weekly / Pre-Release

- Platform trace audit: each §4 feature → ≥1 scenario or documented waiver
- PR-B blocker review: unblock child TEA runs as decisions land
- Manual accessibility spot-check when UI exists (**TBD**)

### Release Gate (§9)

1. **PG-01:** access-control P0 gate E2E 100% green — includes every `—` matrix cell, unflagged S7 vs employee and PM, colleague whitelist (§9)
2. **PG-02:** User Management child P0 100% green
3. **PG-03:** Timetracker integration against real API (or documented waiver scope)
4. **PG-04:** Extensible FR demonstrable via UI test (UR-01..03)
5. **PG-05:** No open PR-001..PR-006 without mitigation or waiver
6. **PG-06:** Trace — each in-scope §4 feature → scenario or documented waiver
7. **PG-07:** List performance ≤2 s @ 500+ rows — **release gate** (decided 2026-08-25). k6 TR-7-01 must pass on composed All Employees route before release. Waiver only **temporary** and **documented** with expiry and remediation owner.

---

## QA Effort Estimate (Platform — Remaining Work)

| Area | Priority | Effort | Notes |
| --- | --- | --- | --- |
| Access Control stage-2 E2E | P0 | ~4–6 weeks | 202 scenarios; matrix is bulk |
| User Management ATDD + green | P0 | ~3–5 weeks | Child plan approved |
| Profile / All Employees | P0–P1 | ~3–5 weeks | **Blocked PR-B-01/05** |
| Dashboards | P1 | ~2–4 weeks | **Blocked PR-B-02** |
| Integrations (TT + PF) | P0–P1 | ~2–4 weeks | **Blocked PR-B-03/04** |
| Workflow domains (6 contexts) | P1 | ~6–10 weeks | **Blocked PR-B-05** |
| Platform NFR (k6, a11y) | P1–P2 | ~1–2 weeks | a11y **TBD** |
| **Total platform** | — | **~12–20 weeks** | 1 QA; parallel dev per AD-4 |

Intervals widen until PR-B blockers resolve.

---

## Interworking & Regression (Platform)

| Component | Upstream / downstream | Regression scope |
| --- | --- | --- |
| access-control | All contexts use facade | Full AC suite every PR once stage-2 exists |
| user-management | Profile assembly, timeline events | UM P0 on every PR |
| timetracker sync | Tier derivation, S10/S11 | TD-11 + project-manager scenarios when sync lands |
| resourcing → user-management | Relationship writes via application layer | REL + TD-11 on resourcing merge |
| campaigns → action items | S14 generation | S14 matrix scenarios when campaigns ship |

---

## Delta-Review Protocol (Future Epics)

The platform coverage map (Appendix C) and PG gates are the **stable baseline**. User Management child TEA is **approved — do not redo**.

| Rule | Action |
| --- | --- |
| New bounded context confirmed (AD-5) | Produce **delta child doc** only: new rows + context-specific risks; reference platform PR-* / PR-B-* |
| access-control | Optional consolidation TEA on existing 202 scenarios; **no full platform re-run** |
| §4.9 remaining auto-events | Delta scenarios when employment/profile context + PR-B-07 resolve |
| §2/§3/§7/§9 normative change | **Full platform TEA re-run** required |
| Epic/story AC | Map to Appendix C trace ID or platform map row; cite § not invented FR-n |

---

## Recommended Child TEA Sequence

1. **User Management** — approved; proceed ATDD (`/bmad-testarch-atdd`) — **no redo**
2. **Access Control** — delta-review optional consolidation doc; ATDD tier + surfaces + fail-closed P0 first after per-file AD-1 approval
3. **Profile / All Employees** — delta child TEA after PR-B-01 + PR-B-05
4. **Integrations** — delta child TEA after PR-B-03/04 port contracts published
5. **Dashboards** — delta child TEA after PR-B-02
6. **Remaining contexts** — parallel **delta** child TEA per confirmed bounded context (risk, resourcing, cds, mentorship, feedback, campaigns)

---

## Appendix A: Coverage Map Legend

| Status | Meaning |
| --- | --- |
| Approved child | Formal TEA complete — inherit as-is |
| Scenarios draft | Stage-1 AD-1 files exist, not approved / no stage-2 |
| AC scenario only | access-control tests access boundary; feature workflow untested |
| Partial | Some coverage in child or matrix; incomplete for § requirement |
| **Blocked PR-B-*** | Cannot author scenarios until architecture decision |
| **TBD** | Requirement names test need; no decision or artifact yet |

## Appendix B: Knowledge Base References

- `test-levels-framework.md` — gate E2E vs unit split
- `test-priorities-matrix.md` — P0–P3
- `risk-governance.md` — PR-* scoring
- `nfr-criteria.md` — evidence planning; final verdict in `nfr-assess`
- `docs/architecture/testing-strategy.md` — AD-1 gate binding

## Appendix C: §4 Normative Requirements Trace

Atomic bullets from `docs/project-requirements.md` for delta-review. Status: **C** = covered (child/AC) · **B** = blocked · **T** = TBD · **N** = N/A out of scope.

| ID | § | Requirement | Status | Owner / artifact |
| --- | --- | --- | --- | --- |
| TR-4.1-01 | §4.1 | Sortable columns | B | PR-B-01, PR-B-05 |
| TR-4.1-02 | §4.1 | Any profile field as filter/column | B | PR-B-01 |
| TR-4.1-03 | §4.1 | Derived filters (years with company, join year) | B | PR-B-01, PR-B-05 |
| TR-4.1-04 | §4.1 | Filters: gender, risk, mentorship status, project | B | PR-B-05 + domain contexts |
| TR-4.1-05 | §4.1 | Custom fields runtime (HR Admin + manager define) | B | PR-B-01 |
| TR-4.1-06 | §4.1 | Saved views / shared tabs | B | PR-B-01 |
| TR-4.1-07 | §4.1 | Export xlsx entitled columns | C partial | SF-02 AC; feature B |
| TR-4.1-08 | §4.1 | Inline edit through list | B | PR-B-01; SF-05 AC partial |
| TR-4.1-09 | §4.1 | Colleague mode whitelist | C partial | SF-01 AC |
| TR-4.1-10 | §4.1 | S1 list filters (partial) | C | UM child LIST-* |
| TR-4.2-01 | §4.2 | Profile assembled per §3.2 | B | PR-B-05 |
| TR-4.2-02 | §4.2 | Header: manager, PP, mentor | B | PR-B-05 |
| TR-4.3-01 | §4.3 | Self read grade/position/seniority/type/English | B | PR-B-05; S4 matrix |
| TR-4.3-02 | §4.3 | Self edit contacts, emergency | B | PR-B-05; S2/S3 matrix |
| TR-4.3-03 | §4.3 | Self upload photo | C | UM child TD-UM-PF-02 |
| TR-4.3-04 | §4.3 | Self career timeline | C partial | UM child CT-* |
| TR-4.3-05 | §4.3 | Self leaves + timetracker link | B | PR-B-03 |
| TR-4.3-06 | §4.3 | Self CDS + mark IDP complete | B | PR-B-05; S12 matrix partial |
| TR-4.3-07 | §4.3 | Self mentorship status | C partial | UM REL; hub B |
| TR-4.3-08 | §4.3 | Self flagged feedback/notes only | C | AC matrix S7/S8 |
| TR-4.3-09 | §4.3 | Self action items complete | C | AC matrix S14 |
| TR-4.3-10 | §4.3 | Self upload certificates | B | PR-B-05; S5 matrix |
| TR-4.3-11 | §4.3 | Self cannot see risk/unflagged notes | C | AC matrix S6/S7 |
| TR-4.4-01..04 | §4.4 | Four dashboard configurations | B | PR-B-02 |
| TR-4.5-01 | §4.5 | Manual action item create | B | PR-B-05 |
| TR-4.5-02 | §4.5 | Campaign-generated action items | B | PR-B-05 |
| TR-4.5-03 | §4.5 | Cancel with reason | B | PR-B-05 |
| TR-4.5-04 | §4.5 | Overdue display | B | PR-B-05 |
| TR-4.5-05 | §4.5 | Assignee marks complete | C | AC matrix S14 |
| TR-4.6-01 | §4.6 | Risk never visible to employee | C | AC matrix S6 |
| TR-4.6-02 | §4.6 | Trend arrow | B | PR-B-05 |
| TR-4.6-03 | §4.6 | Risk dashboard page (counts, sort, filters, drill) | B | PR-B-05 |
| TR-4.7-01 | §4.7 | DM/PM create request | B | PR-B-05 |
| TR-4.7-02 | §4.7 | Unattached request (no project) normal | B | PR-B-05 |
| TR-4.7-03 | §4.7 | UM fulfil internal + PF external candidate | B | PR-B-04, PR-B-05 |
| TR-4.7-04 | §4.7 | DM approve/reject with reason | B | PR-B-05 |
| TR-4.7-05 | §4.7 | Profile sharing for DM candidate eval | C | AC SL-* + §4.8 |
| TR-4.7-06 | §4.7 | Approval → timetracker assign; S11 on sync | B | PR-B-03, PR-B-05 |
| TR-4.7-07 | §4.7 | S15 request history | C partial | AC matrix S15; workflow B |
| TR-4.8-01 | §4.8 | Share link rules | C draft | AC SL-01..12; **OQ2 decided** — auth required |
| TR-4.9-01 | §4.9 | Auto: joined_company | C | UM child CT-01 |
| TR-4.9-02 | §4.9 | Auto: position_change | C | UM child CT-02 |
| TR-4.9-03 | §4.9 | Auto: grade_change | B | PR-B-07, PR-B-05 |
| TR-4.9-04 | §4.9 | Auto: department_change | B | PR-B-07, PR-B-05 |
| TR-4.9-05 | §4.9 | Auto: FTE↔subcontractor | B | PR-B-07, PR-B-05 |
| TR-4.9-06 | §4.9 | Auto: extended_leave | B | PR-B-07, PR-B-03 |
| TR-4.9-07 | §4.9 | Auto: mentorship start/end | C | UM REL-04/05 |
| TR-4.9-08 | §4.9 | Manual add/correct (PP + direct UM only) | C | UM child CT-03..06; DEC-UM-001 |
| TR-4.10-01 | §4.10 | Matrix link dictionary | B | PR-B-05 |
| TR-4.10-02 | §4.10 | Assessment log + conclusion | B | PR-B-05 |
| TR-4.10-03 | §4.10 | IDP complete checkbox | B | PR-B-05; S12 self partial AC |
| TR-4.10-04 | §4.10 | Filter: never assessed distinct | B | PR-B-05 |
| TR-4.10-05 | §4.10 | Filter: has open IDP | B | PR-B-05 |
| TR-4.11-01 | §4.11 | Self open-to-mentor flag | B | PR-B-05; S13 partial |
| TR-4.11-02 | §4.11 | Hub list willing mentors | B | PR-B-05 |
| TR-4.11-03 | §4.11 | Status open→mentor; All Employees filter | B | PR-B-05 |
| TR-4.11-04 | §4.11 | End pair requires final feedback | B | PR-B-05 |
| TR-4.11-05 | §4.11 | Pair history view | B | PR-B-05 |
| TR-4.11-06 | §4.11 | Pairing fact | C | UM child REL-* |
| TR-4.12-01 | §4.12 | Create form + external link | B | PR-B-05 |
| TR-4.12-02 | §4.12 | Audience via All Employees filter | B | PR-B-01, PR-B-05 |
| TR-4.12-03 | §4.12 | Frozen audience on activation | B | PR-B-05 |
| TR-4.12-04 | §4.12 | Per-recipient action item | B | PR-B-05 |
| TR-4.12-05 | §4.12 | Extensible role campaign scope (§2.3) | C partial | AC UR-* |
| TR-4.13-01 | §4.13 | Notifications | N | GOOD TO HAVE |
| TR-4.14-01 | §4.14 | Analytics | N | GOOD TO HAVE |
| TR-4.15-01 | §4.15 | Feedback records + visibility flag | B | PR-B-05; S8 AC |
| TR-4.15-02 | §4.15 | Request feedback via campaign | B | PR-B-05 |
| TR-4.15-03 | §4.15 | Comparison between periods | B | PR-B-05 |
| TR-5.1-01 | §5.1 | Timetracker leaves | B | PR-B-03 |
| TR-5.1-02 | §5.1 | Timetracker projects/PM/DM → tier | B | PR-B-03; TD-* draft |
| TR-5.2-01 | §5.2 | PeopleForce candidates | B | PR-B-04 contract; scope: read-only PF |
| TR-5.2-02 | §5.2 | PeopleForce vacancies SoT | B | PR-B-04 contract; scope decided |
| TR-5.2-03 | §5.2 | PF fallback external link | C | Emergency-only when PF API unavailable |
| TR-6-01 | §6 | Temporal employment records | B | PR-B-07 |
| TR-6-02 | §6 | Cross-system identity | C partial | **PR-005 decided** — canonical User ID; external IDs explicit |
| TR-7-01 | §7 | List ≤2 s @ 500+ | C partial | k6; **PG-07 release gate** |
| TR-7-02 | §7 | Accessibility responsive | T | No numeric threshold in §7 |
| TR-9-01 | §9 | DoD access negatives | C draft | PG-01 AC suite |

---

**Generated by:** BMad TEA Agent  
**Workflow:** `bmad-testarch-test-design` (system-level, platform scope)  
**Version:** 4.0 (BMad v6)

**Approval required before:** treating blocked rows as in-scope for implementation; modifying child UM artifacts.
