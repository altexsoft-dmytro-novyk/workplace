# PRD Addendum — People Management Platform

Overflow from PRD drafting: technical and architectural context that informs delivery but does not belong in the product-requirements narrative.

---

## Architecture invariants (from spine)

These constrain implementation; they are not product capabilities:

| ID | Rule | PRD touchpoint |
|----|------|----------------|
| AD-1 | Scenario → E2E test → production code gate per feature | Bootcamp process, SM-5 |
| AD-6 | Never collapse access roles and functional roles in naming or storage | FR-1 |
| AD-7 | Unified policy attachment engine for both role dimensions | FR-1–FR-4 |
| AD-9 | AccessControl facade sole authorization entry | FR-4 |
| AD-10 | Bulk live tier resolution; no stale cache | NFR-3, FR-4 |
| AD-12 | Fail-closed; bootstrap HR Admin via seeded functional role | FR-6 |
| AD-13 | `User.ttId` from day one; timetracker sync sole writer of sync policies | FR-37 |

Full text: `ARCHITECTURE-SPINE.md`, `docs/architecture/access-control.md`.

---

## Deferred architecture topics (do not implement until decided)

| Topic | Open question | Risk if improvised |
|-------|---------------|-------------------|
| Custom-field storage (EAV vs JSONB) | OQ-114 | Breaks FR-8 filter/column model at scale |
| Dashboard engine & widget access | OQ-115 | Inconsistent tier checks across widgets |
| Department edge modeling | OQ-101, OQ-116 | Wrong manager walk / resourcing routing |
| Profile bounded context boundary | OQ-117 | Team collision in repo structure |
| Operational envelope (hosting, envs) | Spine Deferred | Blocks Definition of Done deploy criterion |

---

## Rejected / excluded inputs

| Source | Disposition |
|--------|-------------|
| `SiennaCharles-DiscoveryPhaseFullScope Estimate (1).xlsm` | **Excluded** — unrelated client discovery template (vendor/client/back-office scope). User confirmed 2026-08-24. |

---

## Spec–architecture drift register

Items where workspace sources disagree; PRD took a working position tagged `[ASSUMPTION]` until owner resolves:

| Topic | Spec says | Architecture / Q&A says | PRD position |
|-------|-----------|---------------------------|--------------|
| HR Admin data access | §3.1 full access | Q&A leaned permissions-only | Open — OQ-104; FR-3 applies full matrix until amended |
| Career timeline writers | §4.9 "PP and UM" | Q&A: PP + direct manager only | A-4: PP + UM; exclude DM/PM write |
| Departments | Not explicit in v1.2 | Spine models departments as new scope | Out of MVP until OQ-101 closed |
| Shared link auth | §4.8 silent | DEC-101: authenticated only | FR-27 enforces DEC-101 |

---

## Engineering process (bootcamp normative)

From test assignment §8 — graded, not optional:

1. BMAD framework for project start; migrations recorded if changed.
2. Strict parallel feature ownership — no serial blocking between teammates.
3. Intelligent repository mandatory (specs, decisions, transcripts, architecture, test scenarios).
4. Foundation phase before feature development: design approach, testing architecture, technology choices — aligned and written down.
5. Communication captured for bootcamp analysis.

Three-stage quality gate (AD-1) applies per feature owner: approved scenario doc → approved E2E test → production code until green.

---

## Stack reference (team choice within constraints)

| Layer | Selection |
|-------|-----------|
| Backend | NestJS 11.x, Prisma 7.x, PostgreSQL, hexagonal DDD |
| Frontend | React 19 + Vite 8 (team repo) |
| IDs | uuidv7 |
| UI language | English only (DEC-104) |

Application code lives in `services/backend` and `services/frontend` submodules — not the workspace root.
