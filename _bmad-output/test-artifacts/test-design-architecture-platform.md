# Test Design for Architecture: People Management Platform

**Purpose:** Platform-level architectural testability contract. Defines cross-cutting risks, NFR gates, integration testability, and blockers that child bounded-context test designs must inherit. Does **not** replace or redo child artifacts.

**Date:** 2026-08-25  
**Author:** TEA (bmad-testarch-test-design)  
**Status:** Approved 2026-08-25 — platform planning baseline  
**Project:** People Management Platform — Iteration 2  
**PRD Reference:** `docs/project-requirements.md` v1.2  
**ADR Reference:** `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` (AD-1..AD-14)

---

## Executive Summary

**Scope:** System-level test architecture for the full People Management Platform — all normative features (§2–§5, §7, §9), confirmed and pending bounded contexts, and both required integrations (timetracker, PeopleForce).

**Child test designs (do not redo):**

| Child | Status | Artifacts |
| --- | --- | --- |
| **User Management** | Approved 2026-08-25 | `test-design-architecture.md`, `test-design-qa.md`, `test-design/people-management-handoff.md`, 46 stage-1 scenarios |
| **Access Control** | Partial child — scenario suite + SPEC (draft) | 202 scenario files, `spec-access-control-test-cases/SPEC.md`; consolidation TEA optional |

**Business context (§1, §7, §9):** Access-control correctness is the primary quality attribute. Platform serves 500+ employees. Iteration 2 requires real timetracker integration (not mock). Platform release is blocked until the access-control suite passes independently of feature workflows (§9).

**Architecture bindings:** AD-1 three-stage gate · AD-3 real HTTP + PostgreSQL, faked outbound ports · AD-9 AccessControl facade only · AD-10 bulk tier resolution · AD-13 integration identity · AD-14 four router shapes.

**Risk summary:** 12 platform risks identified (6 high ≥6, 4 medium, 2 low). Child UM risks R-001..R-014 remain authoritative within `user-management`; platform risks use **PR-** prefix.

---

## Quick Guide

### 🚨 BLOCKERS — Feature / Integration Domains (Do Not Block UM or Access Control)

**Scope rule (decided 2026-08-25):** PR-B-01, PR-B-02, PR-B-03, PR-B-05, PR-B-06, and PR-B-07 are scoped architecture/integration decisions. They block **downstream feature domains and delta child TEA** only — **not** User Management child ATDD or Access Control stage-1/stage-2 gate E2E.

1. **PR-B-01: Custom-field storage model** — §4.1/§3.3.5/§6 require arbitrary filter/sort on fields that do not exist yet. EAV vs JSONB undecided (ARCHITECTURE-SPINE Deferred). **Blocks:** All Employees saved views, export with custom columns, S16 **runtime** field definitions — **not** AC matrix S16 draft scenarios. Owner: Architect. **TBD.**

2. **PR-B-02: Dashboard engine & widget access model** — §4.4 requires one engine, four configurations; design not settled (`docs/architecture/dashboards.md`). **Blocks:** all dashboard E2E, widget-scoped access tests, PP/UM/DM/PM counter scenarios. Owner: Architect. **TBD.**

3. **PR-B-03: Timetracker integration contract** — §5.1 leaves/projects APIs are load-bearing for tier resolution (§2.1 relation 2) and S10/S11 display. API shapes, auth, sync semantics, and failure modes not documented. **Blocks:** project-derived Manager sync tests, leaves read path, resourcing approval→project sync — **not** AC tier-derivation draft scenarios (TD-*). Owner: Integration + Architect. **TBD.**

4. **PR-B-04: PeopleForce integration contract** — **Scope decided:** read-only integration covers **candidates and vacancies**; external link is **fallback only** when PF API unavailable. Endpoint/auth/rate-limit contract still undecided. **Blocks:** resourcing PF E2E and port-fake contract — **not** UM or AC. Owner: Integration. **Contract TBD.**

5. **PR-B-05: Pending bounded-context confirmation** — AD-5 lists `profile`, `resourcing`, `cds`, `mentorship`, `risk`, `feedback`, `campaigns` as pending. Router shapes exist (AD-14) but owning contexts are not confirmed. **Blocks:** child TEA runs for those domains — **not** UM or AC. Owner: Architect. **TBD.**

6. **PR-B-06: Department edge modeling** — TD-13 is provisional; `Policies.targetType:'department'` is syntactic only (AD-10). Non-manager project assignment semantics still with stakeholders. **Blocks:** department-manager tier path **final** E2E beyond draft scenario — **not** AC tier-derivation draft suite. Owner: Product + Architect. **TBD.**

7. **PR-B-07: Temporal employment model** — §6 requires grade, position, department, and employment type as time-bounded records (career timeline history depends on this). Storage shape undecided. **Blocks:** §4.9 auto-events for grade/department/FTE/extended-leave; employment section (S4) workflow tests — **not** UM partial §4.9 child scope. Owner: Architect. **TBD.**

### ⚠️ HIGH PRIORITY — Validate Before Platform Release

1. **PR-001 (SEC, 9):** §3.3.1 leak through any surface — API, export, list columns, filters, errors, notifications (if built). Mitigation: access-control `surfaces/` + matrix suite; extend when new surfaces ship. Owner: access-control feature owner.

2. **PR-002 (SEC, 6):** Stale or cached tier resolution (§6, AD-10). Mitigation: no persisted tiers; graph-change invalidation tests when caching is proposed. Owner: access-control + Platform.

3. **PR-003 (PERF, 6):** §7 NFR — All Employees ≤2 s @ 500+ rows including permission resolution. Mitigation: k6 on composed list endpoint; joint ownership access-control + list owner. Owner: Platform.

4. **PR-004 (TECH, 6):** Timetracker sync as sole writer of `managedBy:'sync'` rows (AD-13) — old+new coexistence window would violate non-sticky access (§2.1). Mitigation: transactional replace tests once sync exists. Owner: Integration. **Blocked on PR-B-03.**

5. **PR-005 (DATA, 6):** Identity resolution across PeopleForce candidate → platform User → timetracker user (§6). **Decided:** internal User ID is canonical; external system IDs stored explicitly; email is matching hint only. Mitigation: mapping contract tests + bootstrap E2E. Owner: Architect + Integration.

6. **PR-006 (SEC, 6):** Extensible functional roles never widen data access (§2.3). Partially covered by access-control UR-11; must re-run when each new FR permission ships. Owner: access-control.

### 📋 INFO ONLY — Platform-Wide Testing Conventions (Inherited by All Children)

1. **Gate model (AD-1):** scenario doc → red E2E → production code; negative `—` cells are first-class (§9).
2. **E2E definition (AD-3):** real HTTP, real PostgreSQL, outbound ports faked via DI tokens; no live third-party calls in gate suite.
3. **Isolation (DEC-UM-010, platform infra):** one worker + UUID-owned slices initially; schema-per-worker before parallel workers.
4. **Personas:** access-control canonical cast (Alice, Bob, Carol, Pete, Dave, Frank, Paula, Hana, Colin, Root, Ida, Eve) is the platform fixture baseline.
5. **Release gate (§9):** PG-01..PG-07 — **PG-07 decided:** list ≤2 s @ 500+ is a **release gate**; waiver only temporary and documented (see QA platform doc).
6. **Share links (OQ2, decided):** Shared links require **authentication** in Iteration 2 — anonymous viewer path out of scope.
7. **Delta-review (platform):** Future bounded contexts extend the platform coverage map; full platform TEA re-run only if §2/§3/§7/§9 change (see handoff).

---

## Platform Risk Register

**Legend:** P×I scoring 1–3 each. Categories: TECH · SEC · PERF · DATA · BUS · OPS.

### High-Priority (Score ≥6)

| Risk ID | Cat | Description | P | I | Score | Mitigation | Owner | Timeline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **PR-001** | SEC | Data leak via non-profile surfaces (export, filter inference, errors) | 3 | 3 | **9** | `surfaces/` SF-01..06; extend per new surface | access-control | Pre-release |
| **PR-002** | SEC | Stale permission cache / persisted tier | 2 | 3 | **6** | Ban caching without invalidation; add tests if proposed | Platform | Pre-release |
| **PR-003** | PERF | List SLA with bulk tier walk | 2 | 3 | **6** | k6 @ 500+ rows; TD-UM-NFR-PERF-01 is partial | Platform | Story list + AC tier |
| **PR-004** | TECH | Timetracker sync transactional replace | 2 | 3 | **6** | Integration tests post PR-B-03 | Integration | **Blocked** |
| **PR-005** | DATA | Cross-system identity mismatch | 2 | 3 | **6** | Canonical User ID + explicit external IDs; email hint only | Architect + Integration | Pre-release |
| **PR-006** | SEC | New FR permission widens colleague view | 2 | 3 | **6** | UR-11 pattern per new permission | access-control | Ongoing |

### Medium-Priority (Score 3–5)

| Risk ID | Cat | Description | P | I | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PR-007 | TECH | Resourcing writes `Relationship` outside user-management application layer (AD-2) | 2 | 2 | 4 | Seam test once resourcing confirmed | resourcing + UM |
| PR-008 | DATA | Career timeline event missed on cross-context mutation | 2 | 2 | 4 | AD-11 same-transaction pattern per hook; blocked on PR-B-07 for non-UM event types | Feature owners |
| PR-009 | BUS | PeopleForce fallback hides integration defects | 2 | 2 | 4 | Fallback is emergency-only; gate suite must exercise read-only PF port | Integration |
| PR-010 | OPS | Operational envelope undeployed (§9 DoD) | 2 | 2 | 4 | Deployed demo env for gate E2E | Platform |

### Low-Priority (Score 1–2)

| Risk ID | Cat | Description | Score | Action |
| --- | --- | --- | --- | --- |
| PR-011 | BUS | GOOD TO HAVE notifications leak matrix data (§4.13) | 2 | Out of scope; if built, matrix-aware tests |
| PR-012 | OPS | Real PII in non-prod (§7) | 2 | NFR-1 CI grep platform-wide |

---

## NFR Testability Requirements (Platform)

| NFR | Requirement (§7) | Design Support | Gap / Blocker | Planned Evidence |
| --- | --- | --- | --- | --- |
| Security | Access-control correctness primary | access-control suite + facade (AD-9) | Feature endpoints must compose | Full AC E2E green |
| Security | §3.3 strict matrix | Matrix + surfaces scenarios drafted | Implementation not started | Per-cell API assertions |
| Performance | List ≤2 s @ 500+ | AD-10 bulk SQL | k6 harness partial (UM) | k6 JSON report — **PG-07 release gate** |
| Performance | **Accessibility** responsive list/profile/dashboard | **Unknown** | No thresholds in §7 | **TBD — manual + axe/Lighthouse when UI exists** |
| Reliability | Integration failure graceful (NFR-3) | Port + fake pattern (AD-3) | Timetracker/PF contracts missing | Throwing-fake E2E per port |
| Data privacy | Pseudonymised non-prod (NFR-1) | Persona convention | Automated scan partial | CI grep report |
| Maintainability | AD-1 traceability | Supported | Pending contexts lack scenarios | Trace matrix post-children |

**Unknown thresholds:** Accessibility targets, notification delivery SLAs, analytics export limits — not in §7; do not invent.

**Assessment boundary:** Final PASS/CONCERNS/FAIL via `nfr-assess` after implementation evidence.

---

## Testability Concerns and Architectural Gaps

### 🚨 ACTIONABLE CONCERNS

| Concern | Impact | Architecture Must Provide | Owner | Timeline |
| --- | --- | --- | --- | --- |
| No test seed API | Slow parallel feature development | Fixture-backed seed scripts or documented Prisma seed contracts per context | Platform | Foundation |
| Profile context undecided | Duplicate or missing S2–S16 assembly tests | Confirm profile vs user-management split (AD-5 open question) | Architect | **TBD** |
| Timetracker fake contract | Cannot test tier revocation on project end | Port interface + deterministic fake matching real API shape | Integration | **Blocked PR-B-03** |
| Custom fields runtime | Cannot test §4.1 filter/column/export | Storage model + admin UI seam | Architect | **Blocked PR-B-01** |
| Share-link viewer auth (OQ2) | **Resolved** — auth required Iteration 2 | SL stage-2 asserts authenticated viewer; unauthenticated → 401 | access-control | **Decided 2026-08-25** |

### Testability Assessment Summary

**What works well**

- AD-1 gate and scenario corpus discipline already applied to user-management and access-control.
- AccessControl facade (AD-9) gives a single authorization seam for negative testing.
- Canonical personas and router tree (AD-14) reduce per-feature invention.

**Accepted trade-offs (Iteration 2)**

- PeopleForce read-only integration (candidates + vacancies) is in scope; external link is **fallback only** when PF API unavailable — gate suite must cover PF port fake, not waive to link-only.
- Notifications (§4.13) and analytics (§4.14) out of scope — no platform test plan entries unless scope changes.
- Department manager path (TD-13) remains provisional until PR-B-06 resolves.

---

## Risk Mitigation Plans (High-Priority)

### PR-001: Cross-Surface Data Leak (Score: 9)

1. Complete access-control stage-2 E2E for `surfaces/` and matrix negatives before feature UI ships.
2. Require each new list/export/filter endpoint to cite an existing SF scenario or add one before merge.
3. Platform release gate: zero open P0 on SF-01..06 and matrix `—` cells.

**Owner:** access-control lead · **Verification:** green gate E2E + manual spot-check export xlsx column set.

### PR-003: List Performance SLA (Score: 6)

1. Shared 500+ row seed owned by Platform.
2. k6 script against composed `GET /users` (or All Employees route when defined) with tier resolution enabled.
3. Nightly run; PR gate on regression threshold once baseline captured.

**Owner:** Platform · **Verification:** k6 summary JSON · **Partial child:** TD-UM-NFR-PERF-01 covers UM list only.

### PR-004: Timetracker Sync Atomicity (Score: 6) — BLOCKED

1. Document single-writer transactional replace (AD-13).
2. Fake port simulates partial failure and concurrent sync.
3. Assert project-unassignment revokes Manager access immediately (TD-11 pattern).

**Owner:** Integration · **Blocked on:** PR-B-03.

### PR-005: Cross-System Identity (Score: 6)

1. **Canonical model:** platform internal User ID is source of truth; PeopleForce and timetracker IDs stored as explicit external-ID fields.
2. Email used only as matching hint during bootstrap — never sole join key in tests or production assertions.
3. E2E: candidate import → User create → timetracker link asserts all three IDs present and resolvable.
4. Negative: email collision without explicit ID mapping must fail closed.

**Owner:** Architect + Integration · **Verification:** identity bootstrap E2E + schema contract review.

### PR-002: Stale Tier Cache (Score: 6)

1. No persisted tier rows without invalidation contract (AD-10).
2. If caching proposed: graph-change invalidation tests required before merge.
3. Regression: project unassignment revokes Manager access immediately (TD-11 pattern).

**Owner:** Platform + access-control · **Verification:** arch review + E2E when caching lands.

### PR-006: FR Permission Widening (Score: 6)

1. UR-11 pattern mandatory for every new FR permission before merge.
2. Each permission: assert colleague view unchanged for non-entitled fields.

**Owner:** access-control · **Verification:** UR-11 green + per-permission negative.

---

## Human Decisions Log

| ID | Decision (2026-08-25) | Test impact |
| --- | --- | --- |
| **PG-07** | List ≤2 s @ 500+ is a **release gate**; waiver only temporary and documented | k6 TR-7-01 promoted to P0; nightly + pre-release |
| **OQ2** | Shared links require **authentication** in Iteration 2 | TR-4.8-01; SL stage-2 asserts auth; no anonymous viewer |
| **PR-005** | Internal User ID canonical; external IDs explicit; email hint only | TR-6-02 scenarios unblocked at design level |
| **PR-B-04 scope** | PF read-only: candidates + vacancies; external link fallback only | TR-5.2-01/02 scope fixed; contract still PR-B-04 |
| **PR-B scope rule** | PR-B-01/02/03/05/06/07 do **not** block UM or Access Control | UM ATDD + AC stage-2 authorized independently |

---

## Assumptions and Dependencies

### Assumptions

1. Child User Management TEA remains approved baseline; platform doc references it without modification.
2. access-control stage-1 scenarios (202 files) are the authoritative AC test design until a formal TEA doc is run.
3. Stack per ARCHITECTURE-SPINE: NestJS 11, Prisma 7, PostgreSQL, TypeScript LTS.
4. Iteration 2 grading weights process (§8) — test architecture documentation is a scored deliverable.

### Dependencies

1. **Architect decisions** on PR-B-01, PR-B-02, PR-B-05, PR-B-07 — required before **delta child TEA** for affected domains; **not** required for UM ATDD or AC stage-2.
2. **Timetracker API package** — required before PR-004 mitigation and S10/S11 integration tests (PR-B-03).
3. **PeopleForce API contract** — required before resourcing PF E2E; scope decided (candidates + vacancies read-only); fallback link is emergency-only (PR-B-04).
4. **User Management ATDD + Access Control stage-2** — authorized independently of PR-B-01..07 resolution per human decision 2026-08-25.

### Risks to Plan

- **Parallel teams blocked on same architect decisions** — Impact: violates §8.2 · Contingency: time-box TBD domains; ship access-control + user-management first.

---

**Next steps for Architecture:** Resolve PR-B-01..07 in priority order. Confirm bounded-context list. Publish timetracker port contract.

**Next steps for QA:** See `test-design-qa-platform.md` for platform coverage map, §4 requirements trace appendix, and delta-review protocol. Access-control: delta-TEA optional; PG-01 requires per-file AD-1 approval then stage-2 P0 green.

**Child references:** `test-design-architecture.md` (UM) · `test-design-qa.md` (UM) · `docs/test-cases/access-control/README.md`

---

**Generated by:** BMad TEA Agent — Test Architect Module  
**Workflow:** `bmad-testarch-test-design` (system-level, platform scope)  
**Version:** 4.0 (BMad v6)
