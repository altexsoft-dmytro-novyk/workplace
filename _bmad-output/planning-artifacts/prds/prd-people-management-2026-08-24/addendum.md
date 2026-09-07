# PRD Addendum — People Management Platform

Overflow from PRD drafting: technical and architectural context that informs delivery but does not belong in the product-requirements narrative.

---

## Market landscape research (2026)

**Source:** *People Management, Talent, and Engineering Resourcing Market Landscape, 2026* (research cut-off 2026-08-20).

**Primary conclusion:** No reviewed COTS product publicly demonstrates the full normative access matrix. Recommended pattern is **Pattern E — composable platform**: build policy/profile core; integrate the internal **timetracker as the one required integration** (SoT §5.1 `[REQUIRED]`; mock data is not acceptable for it, SoT §0); treat **PeopleForce as good-to-have — a single candidate-prefill button only** (SoT §5.2 `[GOOD TO HAVE]`), with no synchronisation and **no vacancy exchange in either direction** (SoT §4.7, §10); use enterprise/mid-market products as benchmarks.

**Key capability gaps in market (target strengths):**

| Capability | Market maturity | Target |
|------------|-----------------|--------|
| Relationship-derived section-level authorization | Low | Very high (primary differentiator) |
| Visibility-safe arbitrary filter/export | Medium | Very high |
| Expiring configurable profile share | Low | High |
| Machine-readable authorization regression matrix | Low | Very high (SM-1, AD-1) |

**Vendor shortlists (reference only — not procurement decisions):**

- Enterprise HCM: Oracle Fusion (role/data-scope separation), SAP SuccessFactors (Opportunity Marketplace), Workday (skills/mobility)
- Mid-market HRIS: HiBob, PeopleForce, Personio
- Resource management: Kantata (staffing requests), Runn (capacity)
- Open-source: Frappe HR, OrangeHRM, MintHCM, Odoo/OCA

Full vendor matrix and RFP validation questions remain in the landscape document — not duplicated here.

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
| AD-12 | Fail-closed; bootstrap HR Admin via seeded functional role | FR-6, DEC-108 |
| AD-13 | `User.ttId` from day one; timetracker sync sole writer of sync policies | FR-37 |

Full text: `ARCHITECTURE-SPINE.md`, `docs/architecture/access-control.md`.

---

## Deferred architecture topics (do not implement until decided)

| Topic | Open question | Risk if improvised | Escalation |
|-------|---------------|-------------------|------------|
| Custom-field storage (EAV vs JSONB) | OQ-114 | Breaks FR-8 filter/column model at scale | Architect: AD by foundation-phase close; column-per-field excluded (requirements §6) |
| Dashboard engine & widget access | OQ-115 | Inconsistent tier checks across widgets | Architect: AD by foundation-phase close; blocks dashboard Wave |
| Department edge modeling | Department **entity and manager-walk are now `[NORMATIVE]`** (SoT §2.1, §4.17) as of v1.5 — the "pending v1.3" framing is closed; only the schema/edge **representation** is still open | Wrong manager walk / resourcing routing | Architect; tracked as blocker `DEPARTMENT-EDGE` (P1 open). No v1.3 spec was issued — the SoT went v1.2 → v1.5 |
| Profile bounded context boundary | OQ-117 | Team collision in repo structure | Architect |
| Operational envelope (hosting, envs) | Spine Deferred | Blocks Definition of Done deploy criterion | Team |

---

## Rejected / excluded inputs

| Source | Disposition |
|--------|-------------|
| `SiennaCharles-DiscoveryPhaseFullScope Estimate (1).xlsm` | **Excluded** — unrelated client discovery template. User confirmed 2026-08-24. |

---

## Spec–architecture drift register

> **Read with the v1.5 reconciliation column.** The first four columns are the original 2026-08-24 record, preserved verbatim. Iteration 2 issued **no v1.3 spec**: `docs/project-requirements.md` went **v1.2 → v1.5**, and several of these items are now settled in the SoT itself rather than by a PRD-local override. The rightmost column records that reconciliation (PLAT-E1-S1.2, 2026-09-07); it annotates the history rather than deleting it.

| Topic | Spec says | Q&A / DEC | PRD position (2026-08-24) | v1.5 SoT reconciliation (2026-09-07, PLAT-E1-S1.2) |
|-------|-----------|-----------|---------------------------|---------------------------------------------------|
| HR Admin data access | §3.1 full access | DEC-108: config only v1 | **DEC-108** supersedes §3.1 for v1 | **Closed by SoT.** v1.5 §2.2 "HR Admin grants no data access" is `[NORMATIVE]` — feature administration only; data access is governed by §2.1 / §2.4, never by a functional role. DEC-108 now *matches* the SoT; it is no longer a PRD-local override of §3.1. (The runtime `position === 'HR Admin'` check is tracked as ratification transition debt — TD-02 per the 1.1 traceability matrix — not as a drift in this register.) |
| Career timeline writers | §3.2 Manager line RW on S9 | DEC-106: PP + direct UM write only | **DEC-106** supersedes §3.2 S9 write for v1 | **Superseded by SoT.** v1.5 §3.2 grants S9 `RW` to **both** Reporting line and Project line (§3.3 rule 2: everything except S2/S3/S5 is identical across the two manager tiers); the DEC-106 "PP + direct UM only" narrowing is not in v1.5. The write is the §2 dual gate — applicable S9 access **and** the runtime *edit the career timeline* permission (§2.3), whose default holders are explicitly left to PO confirmation (§2.3, tracked as `OQ-PERM-01`). OQ-106 is resolved (prd.md:710); canonical position prd.md:468–472. |
| Departments | Not in v1.2 | DEC-107: confirmed pending v1.3 | **In scope** per DEC-107 | **Closed by SoT.** No v1.3 spec was issued; v1.5 makes departments `[NORMATIVE]` — §2.1 (department management is a reporting-line relation, transitive over nested departments) and §4.17 (every employee in exactly one department, departments nest, *manage departments* permission, department / department-manager changes are journaled access switches). "Pending v1.3" is obsolete. Schema/edge representation stays open as blocker `DEPARTMENT-EDGE` (P1). |
| Shared link auth | §4.8 silent | DEC-101: authenticated only | FR-27 enforces DEC-101 | **Closed by SoT.** v1.5 §4.8 is no longer silent: "Links are not anonymous `[NORMATIVE]`" — authenticated user only, recipient explicitly named at creation, no "anyone with the link" mode. DEC-101 now matches the SoT. |
| S14 shared link | Matrix `—` | — | FR-27: never shareable | **Confirmed by SoT.** v1.5 §4.8 fixes the never-share set as **{S3, S7, S13, S14}** and §3.2 shows the S14 Shared-link cell as `never`. (The original "Matrix `—`" note referenced a v1.2 cell; v1.5 uses `never` for this column.) No drift. |

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
