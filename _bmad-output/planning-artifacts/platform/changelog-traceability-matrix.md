---
artifact: Changelog Traceability Matrix
epic: Platform Epic 1 — Platform Spec v1.5 Alignment
story: PLAT-E1-S1.1 (sprint key `1-1-changelog-traceability-matrix`)
status: in-review
produced: 2026-09-07
updated: 2026-09-07 — Stories 1.2–1.6 executed; §9 carries each gap's resolution, §12 the carry-forward
normative_source: docs/project-requirements.md v1.5 (Amendment 2026-09-02)
primary_delta_index: docs/requirements-changelog-v1.2-to-v1.5.md
blocker_register: _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml (revision 2026-09-03-section-matrix-gate-registration)
coverage_companion: _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml (version 1, baseline 2026-09-02)
sprint_tracker: _bmad-output/implementation-artifacts/platform/sprint-status.yaml
review: bmad-review (verification-gap + structure lenses) folded in 2026-09-07 — see §11
---

# Changelog Traceability Matrix — v1.2 → v1.5

This matrix traces every v1.2→v1.5 change to its current status in the four downstream artifact
families, so the weekend build knows what is `done`, what is a `gap` (and which Story 1.2–1.6
closes it), and what is `N/A`.

**Acceptance-criteria coverage:** Story 1.1 AC bullets are answered in §2 (SoT row), §3 (Breaking +
themed deltas), §4 (ratification-folder companion status), §5 (blocker counts), §6 (coverage
`gates:` ID resolution), §7 (`PLAT-E1-S1.x` resolution), §8 (superseded-ID mapping). §9 is the
gap register with each gap's 2026-09-07 resolution; §10 records what could not be verified; §12
lists the residuals that outlived Epic 1.

## 1. Conventions

- **Status values:** `done` (verified aligned text exists), `gap` (drift confirmed, or required
  content absent), `N/A` (the artifact family does not own this delta), `unknown` (could not be
  verified from the pinned tree — treated as `gap` for scheduling).
- **Artifact families:**
  - **PRD** = `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/` — `prd.md`
    (canonical since 2026-09-02), plus `addendum.md` and `.memlog.md`.
  - **SPEC** = `_bmad-output/specs/spec-access-control-*`, `spec-user-management-*`,
    `spec-mentorship-domain`.
  - **architecture** = `docs/architecture/*`, `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`,
    and the `architecture-people-management-ratification-2026-09-02/` package.
  - **test-design** = `_bmad-output/test-artifacts/test-design-*-platform.md` (the 2026-08-29 v1.5
    refresh).
- Every non-`done` cell names the file that would carry the fix and the owning story.
- No cell is marked `done` on inference. Where the delta is a *product decision* that the artifact
  family does not restate, the cell is `N/A`, not `done`.
- **Citation anchors:** cells cite `file:line` where the aligned text sits at a locatable line.
  Where v1.5 alignment is diffuse across a spec or test-design artifact (structure, scope
  statements, multiple sections) the cell cites the file and the section/scope it was read against
  rather than a single line — spot-verified, not asserted. §10 lists which cells this applies to.

**Shortfalls at a glance (full detail in §10):** the PRD and architecture families were verified
against every delta; a handful of SPEC / test-design cells in §3.2, §3.3, §3.9 are `unknown`→`gap`
because the owning slice spec or non-`-platform` test-design child was not exhaustively read. AC
bullet 6 is satisfied by reporting a negative (no `PLAT-E1-S1.x` appears in the coverage companion —
§7). No file other than this one was created or edited.

---

## 2. Source-of-truth row (AC bullet 1)

| Item | Path | State | Evidence |
|---|---|---|---|
| **Normative SoT** | `docs/project-requirements.md` | `done` — header reads **Version: 1.5**, Previous baseline v1.2, with a **2026-09-02 Amendment** (assignee-only action-item cancel; mentorship availability/pool on departure; HTTP denial oracle 401/404/403; version stays 1.5) | `docs/project-requirements.md:3-8` |
| **Delta index** (not itself SoT) | `docs/requirements-changelog-v1.2-to-v1.5.md` | `done` — dated 2026-08-25, in-repo 2026-08-26; self-declares "sufficient on its own" for the two Q&A teams | `docs/requirements-changelog-v1.2-to-v1.5.md:1-8` |
| **Retired baseline** | `docs/project-requirements-v1.2.md` | `N/A` — retained as the linked previous baseline; not SoT | `docs/project-requirements.md:4` |
| **Canonical product PRD** | `prd-people-management-2026-08-24/prd.md` | `done` — promoted to canonical product PRD 2026-09-02 under unchanged normative v1.5; FR-41 aligned to §4.16; unresolved gates + UM denial conflict preserved | `prd.md` header; `.memlog.md:18` |
| **Coverage companion** | `global-fr-epic-story-coverage.yaml` | `done` as an artifact (canonical, `normative_source: docs/project-requirements.md`); carries one unreconciled status (see §7) | `global-fr-epic-story-coverage.yaml:1-4` |

The matrix treats `docs/project-requirements.md` v1.5 as SoT throughout; the changelog is used only
to enumerate deltas.

---

## 3. Delta → artifact-status matrix (AC bullet 2)

### 3.1 Breaking changes (`docs/requirements-changelog-v1.2-to-v1.5.md:11-27`)

| # | Breaking item (§ ref) | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|---|
| B1 | New audience column: "Manager line" splits into **Reporting line** + **Project line** (§3.1, §3.2) | `done` — `prd.md:172-178,222-233` | `done` — `spec-access-control-test-cases/SPEC.md:22` ("refreshed v1.5 stage-1 contract" replacing the 202-file merged-Manager-line suite); `spec-access-control-facade-audience-resolution/SPEC.md:30` | `done` — SPINE `AD-10` amended 2026-08-28 (`ARCHITECTURE-SPINE.md:122-134`); `docs/architecture/access-control.md:247-273` | `done` — `test-design-architecture-platform.md:9,179`; `test-design-qa-platform.md:10` | — |
| B2 | Project line sees less: PM/DM-via-project lose S2 and S3 entirely; S5 = CV + certificates only; rest identical incl. S6 (§3.3.2) | `done` (concept) — `prd.md:227` | `gap` — Phase-1 stage-1 suite defers **positive Project-line cells**; the S2/S3-absent and S5-narrowed cell scenarios are not in the stage-1 contract (`spec-access-control-test-cases/SPEC.md` deferred list) → **Story 1.3** (CAP intents/success criteria must state the split); deeper cell coverage is PLAT-E6 / `AC-SECTION-MATRIX-01`, not Epic 1 | `done` — `access-control.md:288`; `ARCHITECTURE-SPINE.md:130` | `gap` — DoD negatives for the narrowed project-line cells not yet enumerated → **Story 1.6** | 1.3 (SPEC), 1.6 (test-design) |
| B3 | Manager access derives from **three** relations: reports-to, department management, project assignment (§2.1) | `done` — `prd.md:222` | `done` — `spec-access-control-test-cases/SPEC.md:84` (OQ3: "department management is a Reporting-line relation") | `done` — `ARCHITECTURE-SPINE.md:126-128` (three relations, two audiences); `access-control.md:262-273` | `done` — `test-design-architecture-platform.md` scope; `test-design-qa-platform.md:18` | — (department *walk* implementation is `DEPARTMENT-EDGE`, not Epic 1) |
| B4 | "HR Admin" is no longer an audience — configuration role, no data access; full-profile access is a separate grant (§2.2, §2.4, §3.1) | `done` — `prd.md:174,239,259,271` (DEC-108) | `done` — `spec-access-control-test-cases/SPEC.md:60,79`; `spec-access-control-facade-audience-resolution/SPEC.md:34` | `done` — `access-control.md:260` ("HR Admin is not an audience column"); `ARCHITECTURE-SPINE.md` AD-26 | `done` — `test-design-qa-platform.md:18` (full-profile grants in scope, HR Admin config-only) | — (runtime still checks `position === 'HR Admin'` = TD-02; grant/revoke chain = OQ-105, design-closed) |
| B5 | Manager, People Partner, department **not writable through S1** — access switches with their own permission + screen (§2.1, §3.2 fn 1) | `done` — `prd.md:277,281` | `done` — `spec-user-management-domain` organisational-mutation scope; `spec-access-control-facade-audience-resolution/SPEC.md` (PP is `Relationship type='people_partner'`, not S1) | `done` — `access-control.md:17`; `ARCHITECTURE-SPINE.md:107` | `done` — `test-design-qa-platform.md` §§2–9 scope (dedicated controls) | — |
| B6 | Shared links are **not anonymous** — authenticated, explicitly named recipient; no "anyone with the link" (§4.8) | `done` — `prd.md:444,451` | `done` (as boundary) — `spec-access-control-test-cases/SPEC.md:55` (OQ2 decided: auth required); link engine deferred to `deferred-work.md` / PSH slice | `done` — `access-control.md:327` (recipient matches, creator re-checked) | `done` — deferred slice noted `test-design-qa-platform.md:32` | link engine capability = PM-FR-27 (PSH-E*), not Epic 1 |
| B7 | Every `cfg` section off by default; only S1 on. Never-share set = **{S3, S7, S13, S14}** (§4.8) | `done` — `prd.md:444` | `done` — `spec-access-control-test-cases/SPEC.md:78` | `done` — `access-control.md:328-330` | `gap` — shared-link projection negatives deferred; not yet a platform test-design row → **Story 1.6** (tracked as deferred slice) | 1.6 (test-design, low) |
| B8 | Colleagues no longer see the leave **type** — only the fact + dates of an absence (§3.3.4, S10) | `done` — `prd.md:188,238,607` | `done` — `spec-user-management-access-control-adoption/SPEC.md` S10 colleague projection; kernel S10 = ACM-5 | `done` — `access-control.md` S10 colleague row; `ARCHITECTURE-SPINE.md` | `gap` — S10 colleague-narrowing negative not explicitly a platform test-design row → **Story 1.6**; deeper is UM-E7 (PM-FR-4 aliases) | 1.6 (test-design) |
| B9 | Risks cannot be closed — fixed severity order; "active" = any level above `low` (§4.6) | `done` — `prd.md:400,404` | `N/A` — owned by risk slice spec, not an access-control SPEC delta; RISK-E1 stories carry the fixed facts (`global-fr-epic-story-coverage.yaml:428-470`) | `done` — `dashboards.md:13` ("Active risk excludes `low`"); `ARCHITECTURE-SPINE.md:198` | `done` — `test-design-qa-platform.md` risk workflow READY NOW | — |
| B10 | Joining-interview feedback moves **S5 → S8** (§4.15, S5, S8) | `done` — `prd.md:522` | `N/A` — feedback slice (FB-E1); no access-control SPEC delta | `done` — implied by S8 matrix; `access-control.md` S8 row | `done` — `test-design-qa-platform.md:223` (TR-4.15-02) | — |
| B11 | Leave balances **removed** from the platform (§4.3) | `done` — `prd.md:534` (pull types/dates/status only; self-service link-out) | `N/A` | `N/A` | `done` — `test-design-*-platform` scope excludes leave balances (§10 exclusion list, `test-design-qa-platform.md:58`) | — |
| B12 | **No SSO, no Active Directory, no employee creation** — population is a seeded list (§4.17, §10) | `done` — `prd.md:615,679` (magic-link auth only, OQ-110 closed) | `gap` — `spec-user-management-test-cases` CAP-1 still mandates HTTP registration; retirement pointer owed → **Story 1.7** (out of Epic-1 core scope; recorded here); UM PRD FR text = **Story 1.2/1.3** where it still cites creation | `done` — `ARCHITECTURE-SPINE.md` AD-16; `api-conventions.md` (no `POST /users` — verified by **Story 1.8**, `done`) | `gap` — non-`-platform` UM test-design children "still contain pre-v1.5 registration/deactivation assumptions" (`test-design-qa-platform.md:31`) → **Story 1.6** (cite) / child follow-up | 1.7 (SPEC CAP-1), 1.6 (test-design) |
| B13 | **PeopleForce → good-to-have**, single prefill button; timetracker is the only required integration (§0, §5.2) | `done` — `prd.md:104,546-552` (FR-38 good-to-have) | `N/A` (no access-control SPEC delta) | `done` — `ARCHITECTURE-SPINE.md` addendum Pattern E context; ratification `evidence-matrix` AD-13 | `done` for `-platform` — `test-design-architecture-platform.md:18,79,156`; **`gap` for `addendum.md`** → **Story 1.2** (Pattern E line still reads "integrate timetracker + PeopleForce" without the required/good-to-have distinction, `addendum.md:11`) | 1.2 (PRD addendum) |

### 3.2 Roles and access (`...changelog...:31-42`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| Two role dimensions must both permit an operation (§2) | `done` — `prd.md:172-174` | `done` — `spec-access-control-test-cases/SPEC.md:34` (dual gate: `isAllowed` + section) | `done` — `access-control.md:281`; SPINE AD-7/AD-10 | `done` — `test-design-qa-platform.md:18` | — |
| HR Admin = configuration only (custom fields, dictionaries, departments, roles, permissions) (§2.2) | `done` — `prd.md:174,265` | `done` — `spec-access-control-test-cases/SPEC.md:60` | `done` — `access-control.md:260` | `done` | — |
| Full-profile access = separate grant: holder-only, no self-assignment, first holder seeded, last-holder-removal blocked, journaled (§2.4) | `done` — `prd.md:283-285` (FR-39) | `done` (boundary) — `spec-access-control-test-cases/SPEC.md:60,83`; `spec-user-management-access-control-adoption/SPEC.md:298-299` (out of scope, fail-closed) | `done` — `access-control.md:334-345` (PM/AD-28); ratification `blockers.yaml` CC-05 closed | `gap` — overlay evaluation is a deferred slice (`test-design-qa-platform.md:32`); PLAT-E7-S7.3 + PM-FR-39 deferred, not Epic 1 | — (grant lifecycle = PM-FR-39 deferred; `CC-07` P0) |
| "HR line" defined = the PP's own manager chain inside HR, recursive (§2.1) | `done` — `prd.md` §2.1 relation; term in glossary | `done` — `spec-access-control-test-cases/SPEC.md:84` | `done` — `ARCHITECTURE-SPINE.md:130` ("PP / HR line ... evaluated separately"); `access-control.md:273` | `gap` — PP HR-line propagation is a named deferred slice → PLAT-E5-S5.3 / `DEPARTMENT-EDGE`, not Epic 1 | — |
| Changing an organisational relationship is a distinct operation — four fields, dedicated permission + screen, no self-assignment, journaled (§2.1) | `done` — `prd.md:277,281` | `done` — `spec-user-management-domain` mutation contract; `spec-access-control-adoption` PP-mutation owned by UM | `done` — `access-control.md:346-356` (journal PM/AD-29); SPINE AD-19/AD-29 | `done` — PR-S-01/PR-S-02 packages `test-design-progress-platform.md:63-64` | — (journal *implementation* = `CC-07` P0) |
| Revocation timing split: platform relations = next request; project-derived = within 15 min (§2.1, §5.1) | `done` — `prd.md:281` (next request) | `done` — `spec-access-control-test-cases/SPEC.md:85` (15 min / 4 h fixed) | `done` — `access-control.md:360-365` (table: next request / 15 min / 4 h) | `gap` — freshness/withdrawal E2E is a deferred slice → PLAT-E4 / `TT-IDENTITY-01`, not Epic 1 | — |
| Permission list grown (approve/reject candidates, close resourcing, edit career timeline, create feedback, record departure, manage departments, manage custom fields, change org relationships); defaults drafted per team, PO-confirmed (§2.3) | `done` — `prd.md:265` (enumerated) | `partial` — `spec-functional-roles-catalog/SPEC.md` defines the catalog; `OQ-AC-EDIT` (`user-management:edit`, `mentorship:assign` keys absent) and `OQ-PERM-01` (default matrix unapproved) remain open | `done` — `ARCHITECTURE-SPINE.md:107` (`Permissions.key` catalog) | `unknown` → treat `gap` — not verified that platform test-design enumerates the new keys → **Story 1.6** | 1.6 (test-design); `OQ-PERM-01` / `OQ-AC-EDIT` for the keys themselves |
| Narrow journal exists (manager / PP / department / department-manager / full-access grants / shared-link accesses) (§3.4) | `done` — `prd.md:289` (FR-40) | `done` — `spec-mentorship-domain/SPEC.md` + adoption specs reference PM/AD-29 | `done` — `access-control.md:346-356`; SPINE AD-29 | `gap` — journal E2E deferred (`CC-07`) | — |
| Campaign-author colleague-whitelist exception: name + completion status, own campaign only, ends at campaign close (§3.3.7) | `done` — `prd.md:388` | `N/A` (engagement/campaign slice — ENG-E2-S2.3/S2.4) | `done` — implied; not a spine delta | `done` — `test-design-qa-platform.md` campaign activation/status READY NOW | — |
| Exactly two documented exceptions to "a manager sees everything": narrowed project line + PM flag-gated S7 read (§3.3) | `done` — `prd.md:288` area | `done` — `access-control.md:288` ("PM S7 is flag-gated read") | `done` — `access-control.md:288` | `gap` — negatives not enumerated in platform test-design → **Story 1.6** | 1.6 |

### 3.3 Departments (`...changelog...:44-50`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| New entity; every employee in exactly one department; departments nest (§4.17) | `done` — `prd.md` FR-42 area; glossary | `partial` — `spec-user-management-domain` covers UM-E4-S4.3; schema owned by PM/AD-35 (`DEPARTMENT-EDGE`, no table yet) | `done` (design) — `ARCHITECTURE-SPINE.md:143` (`UserDepartment`, AD-35); `database-schema.md` | `unknown` → `gap` → **Story 1.6** | 1.6 (test-design); `DEPARTMENT-EDGE` for schema |
| Managing a department grants Manager access to everyone in it and sub-departments (§2.1) | `done` — `prd.md:177,222` | `done` — `spec-access-control-test-cases/SPEC.md:84` | `done` — `ARCHITECTURE-SPINE.md:127`; `access-control.md:267,273` (phased, fail-closed until walk lands) | `gap` — department-walk positives are a named deferred slice → PLAT-E5, not Epic 1 | — |
| No separate "unit" entity; *Unit Manager* = role name for a department's manager; S1 says "department" (§2.2, §4.17) | `done` — `prd.md` glossary / §2.2 | `unknown` → `gap` → **Story 1.3** (confirm no "unit" entity in AC SPEC prose) | `done` — `database-schema.md` (no Unit entity) | `unknown` → `gap` → **Story 1.6** | 1.3, 1.6 |
| A resourcing request carries a department; routes to the responsible unit manager (§4.7) | `done` — `prd.md` §4.7 FR area (routing) | `N/A` (resourcing slice RS-E1) | `done` — `ARCHITECTURE-SPINE.md:198` ("department ... routes resourcing") | `gap` — routing E2E gated on `DEPARTMENT-EDGE`; RS-E1, not Epic 1 | — |
| Department change emits a career-timeline event; CDS skills-matrix keys off the department entity, not free text (§4.9, §4.10) | `done` — `prd.md:484` area | `N/A` (CDS slice CDS-E1) | `done` — `ARCHITECTURE-SPINE.md:198` ("department change writes a timeline event and CDS matrix lookup keys on department entity") | `gap` — CDS matrix story gated on `DEPARTMENT-EDGE`; CDS-E1, not Epic 1 | — |

### 3.4 Profile and sections (`...changelog...:52-57`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| S10 for colleagues: dates only, type hidden; Self / both manager lines / PP see type (§3.3.4) | `done` — `prd.md:188,238` | `done` — kernel S10 (ACM-5); adoption spec S10 projection | `done` — `access-control.md` S10 row | `gap` → **Story 1.6** (see B8) | 1.6 |
| Joining-interview feedback is a feedback record governed by *shared with employee*, not an always-readable document (§4.15) | `done` — `prd.md:522` | `N/A` (feedback slice) | `done` — implied | `done` — `test-design-qa-platform.md:223` | — |
| Leave balances dropped; self-service links to timetracker (§4.3) | `done` — `prd.md:534` | `N/A` | `N/A` | `done` — `test-design` exclusions | — |
| Employment status = time-bounded fact on the profile, values `active` / `dismissed` (§4.16) | `done` — `prd.md:181,558-564` (FR-41) | `done` — `spec-user-management-domain` employment-status; adoption spec | `done` — SPINE AD-16/AD-22; ratification `evidence-matrix` AD-16 | `gap` — effective-date executor evidence blocked (`CC-06`/`CC-08`); PR-B-09; UM-E5, not Epic 1 | — |

### 3.5 Risks (`...changelog...:59-65`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| Order: `low` < `need attention` < `medium` < `high` < `leaver` (§4.6) | `done` — `prd.md:400` | `N/A` (risk slice RISK-E1) | `done` — `dashboards.md:11-13` | `done` — `test-design-qa-platform.md` risk workflow | — |
| No resolved/terminal state; level moves any→any incl. down to `low` | `done` — `prd.md:400` | `N/A` | `done` — `dashboards.md`; `ARCHITECTURE-SPINE.md:198` | `done` | — |
| "Active" excludes `low`; dashboard counters ignore it | `done` — `prd.md:404` | `N/A` | `done` — `dashboards.md:13` | `done` | — |
| Trend arrow only when level differs from previous record; none on first/unchanged | `done` — `prd.md:400` | `N/A` | `gap` — not stated as a fixed fact in `dashboards.md` (only active-risk + Unassigned are listed) → **Story 1.5** | `gap` → **Story 1.6** (DoD/fixed facts cite) | 1.5 (architecture), 1.6 (test-design) |
| `leaver` is a prediction, not the fact of departure; never conflate with `dismissed` | `done` — `prd.md:400` | `N/A` | `gap` — not explicit in `dashboards.md` fixed facts → **Story 1.5** | `gap` → **Story 1.6** | 1.5, 1.6 |

### 3.6 Resourcing (`...changelog...:67-74`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| One vacancy entity, lives in the platform; no PeopleForce vacancies anywhere (§4.7) | `done` — `prd.md:410` | `N/A` (resourcing slice) | `done` — `ARCHITECTURE-SPINE.md:198` | `done` — `test-design-architecture-platform.md:80`; `test-design-qa-platform.md:200` (TR-4.7-01, "no PeopleForce vacancy") | — |
| Headcount field, default 1; approving a candidate fills a slot; only DM's explicit close ends a request (§4.4.2) | `done` — `prd.md:410` area | `N/A` | `done` — `dashboards.md` / spine fixed facts | `done` — `test-design-qa-platform.md` resourcing core READY NOW | — |
| Project reference optional; unattached request normal, in **Unassigned** bucket, in all-projects counters (§4.4.2) | `done` — `prd.md` §4.7 | `N/A` | `done` — `dashboards.md:14`; `ARCHITECTURE-SPINE.md:198` | `done` — `test-design-qa-platform.md:200` | — |
| Expected compensation stays on the request; visible to author + routed UM + reviewing DM; not PP; never on a profile / shared link / export (§4.4.2) | `done` — `prd.md:432` (S15 excludes expected comp) | `done` — `spec-access-control-test-cases` / RS SD-5 (excluded from S15) | `done` — `access-control.md` S15 area | `done` — `test-design-qa-platform.md:201` (TR-4.7-02 compensation negative E2E) | — |
| Shared link auto-generated on submission; names reviewing DM; lives until request decided; eval view = S1, S4, S11, S12, S5 (CV+certs), S6 optional; never S2/S3/S7/S8 | `done` — `prd.md:424,444` | `done` (as boundary) — RS-E1-S1.4 in coverage; link section policy = PLAT-E7-S7.1 port | `done` — `access-control.md` shared-link column | `gap` — request-bound link E2E depends on PM-FR-27 (uncovered); RS-E1, not Epic 1 | — |
| Store the PeopleForce candidate ID on every external candidate, integration or not | `done` — `prd.md:422,550,552` | `N/A` | `done` — addendum AD context | `done` — `test-design-qa-platform.md:237` (TR-5.2-01 READY NOW) | — |

### 3.7 Sharing (`...changelog...:77-82`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| Authenticated, explicitly named recipient (§4.8) | `done` — `prd.md:444,451` | `done` — `spec-access-control-test-cases/SPEC.md:55` (OQ2 decided) | `done` — `access-control.md:327` | `gap` — deferred slice | PM-FR-27 (PSH), not Epic 1 |
| All `cfg` off by default; only S1 on; never-share {S3, S7, S13, S14} | `done` — `prd.md:444` | `done` — `spec-access-control-test-cases/SPEC.md:78` | `done` — `access-control.md:328-330` | `gap` → **Story 1.6** (deferred slice, low) | 1.6 |
| Creator's access re-checked on every view — link dies with the relationship | `done` — `prd.md:451` | `done` — `access-control.md:327` (cross-ref) | `done` — `access-control.md:327` | `gap` — deferred slice | PM-FR-27 |
| Revocation + journal rights follow the current relationship holder, not the creator; full-access holders are the backstop; no un-revocable link | `done` — `prd.md:451` | `done` — `access-control.md:332` | `done` — `access-control.md:332` | `gap` — PSH-E2-S2.3 records the backstop as **unreachable** while PM-FR-39 deferred (`global-fr-epic-story-coverage.yaml:589-593`) — normative guarantee unmet, no owner; not an Epic 1 item | — (escalation: PM-FR-39 / `CC-07`) |
| Career timeline shareable but off by default | `done` — `prd.md:444` area | `done` — never-share / cfg-off default | `done` — `access-control.md:328` | `gap` — deferred slice | PM-FR-27 |

### 3.8 Mentorship and feedback (`...changelog...:84-90`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| Closing a pair requires a **closure note** — field on the pair record, not a feedback record; readable by manager lines + PP only (§4.11) | `done` — `prd.md:508` | `done` — `spec-mentorship-domain/SPEC.md` §5.3; `access-control.md:301` | `done` — `access-control.md:301`; SPINE AD-17 | `done` — `test-design-qa-platform.md` mentorship core | — (S13 facade support = `AC-S9-S13`) |
| Pool is company-wide; identity-card data + flag; exposes nobody's S13; mentee selection scoped to assigner's own people | `done` — `prd.md:512` | `done` — `spec-mentorship-domain/SPEC.md` | `done` — `access-control.md` S13 area | `done` — mentorship core | — |
| A person may clear open-to-mentoring while holding an active mentee; active pairs untouched | `done` — `prd.md:512` area | `done` — `spec-mentorship-domain/SPEC.md` | `N/A` | `done` | — |
| Requested feedback: campaign tracks responders; requester enters received feedback manually; campaign is the only distribution path (§4.12, §4.15) | `done` — `prd.md:522` | `N/A` (feedback slice FB-E2) | `done` — `ARCHITECTURE-SPINE.md:198` ("requested feedback uses campaigns as its only distribution path") | `done` — `test-design-qa-platform.md:223` | — |
| "Comparison between periods" removed; records chronological, period-filterable | `done` — `prd.md:522` | `N/A` | `N/A` | `done` — `test-design-qa-platform.md:223` (asserted negative) | — |

### 3.9 Lifecycle and population (`...changelog...:92-101`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| Creating employees out of scope — no provisioning flow, no AD (§4.17, §10) | `done` — `prd.md:615` | `gap` — `spec-user-management-test-cases` CAP-1 still mandates HTTP registration → **Story 1.7** | `done` — `api-conventions.md` (no `POST /users`) — verified by **Story 1.8** (`done`, sprint-status `1-8-...: done`) | `gap` — non-`-platform` UM children carry pre-v1.5 registration assumptions (`test-design-qa-platform.md:31`) → **Story 1.6** cite / child follow-up | 1.7 (SPEC), 1.6 (test-design) |
| Population is a seeded list, imported to the timetracker test environment, delivered 26 Aug | `done` — `prd.md:615,677` | `done` — `spec-user-management-domain` seed scenarios; `DEC-UM-009` load-bearing (Story 1.8 keeps) | `done` — SPINE AD-16; ratification AD-16 | `done` — `test-design-progress-platform.md:63` (seed-import follow-up scoped) | — (`um-seed-01..03` owned by UM Story 1.1, out of Epic 1) |
| No SSO; authentication is your own implementation over the seeded population | `done` — `prd.md:679` (magic-link only, OQ-110) | `done` — `spec-user-management-domain` magic-link | `done` — SPINE AD-15; `interim-session-resolver` = TD-02 / `SEC-AUTH-01` | `done` | — (`SEC-AUTH-01` P0 latent) |
| Do not import real employee data beyond the given list | `done` — `prd.md` §10 | `N/A` | `done` — SPINE data rules | `done` — `test-design` privacy audits | — |
| Departure recorded by HR with effective date + reason; on the date: profile read-only + out of default list but filterable; **only open Action Items assigned to the departing person** close as *cancelled — departed*; mentorship pairs auto-close w/ system note bypassing the closure-note gate; account deactivates; all access ends immediately (§4.16) | `done` — `prd.md:562-564`; matches `docs/project-requirements.md` CC-06 condition 6 | `done` — `spec-mentorship-domain/SPEC.md` (departure participant PM/AD-23); `spec-user-management-domain` | `done` — `database-schema.md` departure transaction must carry the phrase "only open Action Items assigned to the departing person" — verified by **Story 1.8** (`done`) | `gap` — departure operational/release evidence = PR-B-09 open; UM-E5, not Epic 1 | — (`CC-06`/`CC-08`/`CC-09` P0) |
| Departure blocked while the person still manages or partners anybody; prompt to re-parent | `done` — `prd.md:562` | `done` — `spec-user-management-domain` | `done` — SPINE AD-22/AD-23 | `gap` — E2E deferred (PR-B-09) | — |
| Leaving is not a career-timeline event — it is employment status (§4.9) | `done` — `prd.md:564` | `done` — `spec-user-management-domain` career-event boundary (AD-30) | `done` — `ARCHITECTURE-SPINE.md:143` (UserEvents), AD-30 | `done` | — |
| One definition of a departure — from employment status; analytics defines nothing of its own (§4.14) | `done` — `prd.md:558` | `N/A` | `done` — SPINE AD-16 | `done` — analytics is GOOD TO HAVE, `test-design` out of scope | — |

### 3.10 Integrations (`...changelog...:104-108`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| Timetracker is the only required integration; docs + test env linked in the spec (§5.1) | `done` — `prd.md:104,619,677` | `N/A` (timetracker slice TT-E1/TT-E2) | `done` — SPINE AD-13; ratification `evidence_caveat` (`timetracker-external-api.json` UNTRACKED at pin) | `done` — `test-design-architecture-platform.md:18,188` | — |
| Project assignment feeds the permission model → correctness is a security concern; establish events vs state-at-sync from the documentation | `done` — `prd.md:677` | `done` — `spec-access-control-test-cases/SPEC.md:85` (OQ4); `blockers.yaml` `TIMETRACKER-CONTRACT` note ("state-at-sync ... no event feed") | `done` — `ARCHITECTURE-SPINE.md:198` ("explicit events-vs-state-at-sync decision recorded") | `gap` — TT sync E2E gated on `TT-IDENTITY-01` / `TT-PMDM-01`; TT-E2, not Epic 1 | — (`TT-IDENTITY-01` P0, `TT-PMDM-01` P1) |
| Outage behaviour: serve last-known data behind a visible banner; withdraw project-derived access after 4 h of failed sync | `done` — `prd.md` §5.1 area | `done` — `spec-access-control-test-cases/SPEC.md:85` | `done` — `access-control.md:365` | `gap` — NFR-4 graceful-degradation E2E deferred (TT-E1/TT-E2), not Epic 1 | — |
| PeopleForce good-to-have, one button: prefill by candidate ID, per-field preview + confirmation, never silent overwrite; fixed non-prefillable field list (§5.2) | `done` — `prd.md:546-550` (FR-38) | `N/A` | `done` — addendum Pattern E | `done` — `test-design-qa-platform.md:238` (TR-5.2-02 OUT OF SCOPE / GOOD TO HAVE) | — |

### 3.11 Notifications and analytics (`...changelog...:110-113`)

Not in the AC bullet 2 theme list; both deltas are GOOD-TO-HAVE, recorded for completeness.

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| Notifications + analytics remain **good to have**, not required; if notifications are built, DoD = a per-type/per-audience negative-test metric (no notification carries a fact from a section closed to its recipient) (§4.13, §4.14) | `done` — `prd.md:593-594,607` | `N/A` | `done` — SPINE | `done` for scope (`test-design-qa-platform.md:27`); the negative-test-metric DoD row is a **Story 1.6** item only if notifications are promoted into scope | 1.6 (conditional) |

### 3.12 Process and Definition of Done (`...changelog...:116-119`)

| Delta | PRD | SPEC | architecture | test-design | Gap owner |
|---|---|---|---|---|---|
| BMAD for the start of the project; tool migration only as a recorded deliberate decision (§8.1) | `done` — `prd.md` process section | `N/A` | `done` — `ARCHITECTURE-SPINE.md` AD-1; `docs/architecture/README.md` (governance, `ARCH-GOV-01` closed) | `done` — `test-design-progress-platform.md:40` (planning-completion checkpoint) | — |
| Foundation phase is not a fixed set of streams — research + write down what is expensive to change before implementation (§8.4) | `done` — `prd.md` | `N/A` | `done` — SPINE Deferred list; ratification package | `done` — `test-design-architecture-platform.md` deferred-decisions register | — |
| DoD now also requires: negative tests for narrowed project-line cells; a new functional role creatable via UI without deploy; org-relationship changes journaled + not self-assignable; a shared link that works only for its named recipient and can always be revoked; timetracker integration running against the test env over the seeded population (§9) | `done` (as requirement) — `prd.md` §9 / FR-6, FR-40 | `partial` — dual-gate + journal in specs; runtime-creatable role = `spec-functional-roles-catalog` (`OQ-PERM-01`); shared-link revocation guarantee **unmet, no owner** (§3.7 row 4) | `done` — SPINE AD-7/AD-19/AD-29 | `gap` — platform test-design must carry the five DoD negatives explicitly + re-gate PR-B-04 → **Story 1.6** | 1.6 (test-design); shared-link revocation backstop = PM-FR-39 escalation |

---

## 4. Ratification-folder companion status (AC bullet 3)

Folder: `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/`
Ratified state: `ratified-with-transition-debt`; spine `approved-with-open-items`; **not release-ready**
(`ARCHITECTURE-RATIFICATION.md:3,65`).

| Companion file | Exists | Version / revision | Status | Evidence / notes |
|---|---|---|---|---|
| `ARCHITECTURE-RATIFICATION.md` | yes | `status: ratified-with-transition-debt` | `done` as a document; **one stale figure** — see §5 / §11-VG1 | `ARCHITECTURE-RATIFICATION.md:3,117` |
| `blockers.yaml` | yes | `version: 2`, `revision: 2026-09-03-section-matrix-gate-registration` | `current` — canonical ID + count source; 31 entries (§5) | `blockers.yaml:1-3` |
| `evidence-matrix.yaml` | yes | `version: 2`, `revision: 2026-09-02-reviewer-gate-correction` | `current` — AD-1..AD-35 + ACF/AD-1..4 + ACM-0..9 + dimensions; every AD `design: ratified` except AD-10 (`partial`); implementation `partial`/`transition-debt`/`absent` throughout; **no AD `conformant`** | `evidence-matrix.yaml:1-3,102-104` |
| `transition-debt.yaml` | yes | `version: 2`, `revision: 2026-09-02-reviewer-gate-correction` | `current` — TD-01..TD-13; TD-02/TD-04 rescoped to **P0**; TD-10 `status: retired` (`ARCH-GOV-01` closed) | `transition-debt.yaml:1-3,175-196` |
| `reviews/` | yes (subdir) | — | present; not a named companion in the Story 1.1 AC | folder listing |

**Companion-set verdict:** all three machine-readable companions named by the Story 1.1 AC
(`blockers.yaml`, `evidence-matrix.yaml`, `transition-debt.yaml`) exist, are version 2, and share the
2026-09-02 baseline. `blockers.yaml` alone carries a later revision (2026-09-03). The prose
`ARCHITECTURE-RATIFICATION.md` has **not** been re-synced to that revision (§11-VG1).

---

## 5. Blocker counts (AC bullet 4 — mechanical, from `blockers.yaml` rev 2026-09-03)

Counted mechanically: 31 `- id:` entries, 31 `status:` lines, one-to-one.

| Status | Count | IDs |
|---|---|---|
| **open** | **17** | CC-04, CC-06, CC-07, CONFLICT-UM-01, OQ-PERM-01, DEPARTMENT-EDGE, AC-S9-S13, AC-SECTION-MATRIX-01, SEC-AUTH-01, CC-08, CC-09, CC-10-MENTORSHIP, OPERATIONAL-ENVELOPE, TT-IDENTITY-01, TT-PMDM-01, ARCH-PROJ-WRITER-01, OQ-AC-EDIT |
| **closed** | **10** | CC-05, QUALITY-GATE-AC, QUALITY-GATE-AC-NFR, OQ-114, OQ-115, OQ-117, ARCH-GOV-01, OQ-116, OQ-105, ARCH-ENV-01 |
| **superseded** | **4** | TIMETRACKER-CONTRACT, CC-10, CC-11, OQ-118 |
| **total** | **31** | — |

**P0 open (6):** CC-07, SEC-AUTH-01, CC-08, CC-09, OPERATIONAL-ENVELOPE, TT-IDENTITY-01.
**P0 closed (1):** QUALITY-GATE-AC — closed in `blockers.yaml` on the P0 / ACM3-II-06 scope; the
cited `gate-decision.json` now reads `gate_status: FAIL` for an unrelated P1 mentorship breach
(§9 G10).

**Discrepancy (verification-gap, not an Epic 1 deliverable):** `ARCHITECTURE-RATIFICATION.md:117`
narrates "`blockers.yaml` holds **30** entries — **18** open, **8** closed, **4** superseded." That
figure predates (a) the 2026-09-03 registration of `AC-SECTION-MATRIX-01` and (b) the closures of
`QUALITY-GATE-AC` / `QUALITY-GATE-AC-NFR`. The file now mechanically reads **31 / 17 / 10 / 4**. The
prose count should be re-synced by the ratification-package owner. See §11-VG1.

---

## 6. Coverage `gates:` ID resolution (AC bullet 5)

Every live `gates:` list in `global-fr-epic-story-coverage.yaml` was extracted and each ID checked
against `blockers.yaml`.

**Distinct live gate IDs used (16):** `DEPARTMENT-EDGE`, `TT-IDENTITY-01`, `TT-PMDM-01`,
`ARCH-PROJ-WRITER-01`, `AC-S9-S13`, `AC-SECTION-MATRIX-01`, `OQ-PERM-01`, `CC-04`, `CC-07`,
`OQ-AC-EDIT`, `CC-10-MENTORSHIP`, `SEC-AUTH-01`, `CC-06`, `CC-08`, `CC-09`, `CONFLICT-UM-01`.

| Gate ID | Resolves in `blockers.yaml`? | Status there | Used by (FR rows) |
|---|---|---|---|
| DEPARTMENT-EDGE | yes | open (P1) | PM-FR-2, 7, 18, 22, 23, 30, 42 |
| TT-IDENTITY-01 | yes | open (P0) | PM-FR-2, 14, 16, 17, 22, 23, 37 |
| TT-PMDM-01 | yes | open (P1) | PM-FR-2, 14, 22, 37 |
| ARCH-PROJ-WRITER-01 | yes | open (P1) | PM-FR-2 |
| AC-S9-S13 | yes | open (P1) | PM-FR-3, 27, 29, 30, 31, 32, 33, 34 |
| AC-SECTION-MATRIX-01 | yes | open (P1) | PM-FR-3, 5, 8, 21, 22, 26, 35 |
| OQ-PERM-01 | yes | open (P1) | PM-FR-6, 8, 10, 11, 15, 18, 19, 20, 21, 22, 23, 24, 25, 30, 33, 34, 35 |
| CC-04 | yes | open (P2) | PM-FR-7 |
| CC-07 | yes | open (P0) | PM-FR-7, 27, 40, 42 |
| OQ-AC-EDIT | yes | open (P1) | PM-FR-9 |
| CC-10-MENTORSHIP | yes | open (P1) | PM-FR-14, 32, 33, 34 |
| SEC-AUTH-01 | yes | open (P0) | PM-FR-19, 20, 21, 22, 24, 26, 27, 30, 31 |
| CC-06 | yes | open (P1) | PM-FR-19, 33, 41 |
| CC-08 | yes | open (P0) | PM-FR-19 |
| CC-09 | yes | open (P0) | PM-FR-19, 28, 33 |
| CONFLICT-UM-01 | yes | open (P1) | PM-FR-12 (conflicts block), 20, 21, 27, 30, 31 |

**Result: PASS.** All 16 live `gates:` IDs resolve to a live (open) `blockers.yaml` entry. **No live
`gates:` ID resolves to a superseded historical ID.** Specifically:

- `TIMETRACKER-CONTRACT` — appears only in prose `notes:` fields (e.g. `:108`, `:324`, `:768`,
  `:783`), each explicitly saying "superseded historical only" and pointing at `TT-IDENTITY-01` /
  `TT-PMDM-01`. It is **not** in any `gates:` list.
- architecture `OQ-118` — not referenced anywhere in the coverage companion.
- architecture `CC-11` — not referenced anywhere in the coverage companion.
- `CC-10` (parent) — not in any `gates:` list; children use `CC-10-MENTORSHIP`.

---

## 7. `PLAT-E1-S1.x` resolution (AC bullet 6)

Sprint keys (from `sprint-status.yaml:41-57`), global IDs (from `epics.md` Story 1.9 AC and
`global-fr-epic-story-coverage.yaml:858-860`):

| Global ID | Sprint key | sprint-status | Resolves to a `global-fr-epic-story-coverage.yaml` entry? | Disposition |
|---|---|---|---|---|
| PLAT-E1-S1.1 | `1-1-changelog-traceability-matrix` | backlog | **No** | This matrix. Decision/gate-serving; no PM-FR owner. Referenced by `blockers.yaml` `AC-SECTION-MATRIX-01` note ("PLAT-E1-S1.1 forbids a coverage `gates:` ID that does not resolve here"). |
| PLAT-E1-S1.2 | `1-2-platform-prd-addendum-drift-close` | backlog | **No** | PRD/addendum/memlog doc-alignment; no PM-FR owner. |
| PLAT-E1-S1.3 | `1-3-access-control-spec-stage-1-suite-alignment` | backlog | **No** | `epics.md` FR Coverage Map assigns PM/AD-24 doc-alignment to S1.3/S1.4; coverage companion records PM/AD-24 runtime under **PM-FR-4 → UM-E0-S0.1 only**. Doc-alignment work, no PM-FR owner slot. |
| PLAT-E1-S1.3a | `1-3a-colleague-403-audience-set-ad1` | done | **No** | Split out 2026-09-07; done same day — E2E rework was already shipped (`services/backend` `da7d1fa`), only the three scenario docs lagged. Doc reconciliation, no coverage entry. |
| PLAT-E1-S1.4 | `1-4-architecture-binding-updates` | backlog | **No** | Architecture doc-alignment; no PM-FR owner. |
| PLAT-E1-S1.5 | `1-5-dashboards-4-4-v1-5-fixed-facts` | backlog | **No** | Architecture (`dashboards.md`) doc-alignment; no PM-FR owner. |
| PLAT-E1-S1.6 | `1-6-platform-test-design-refresh-v1-2-v1-5` | backlog | **No** | `epics.md` FR Coverage Map assigns PM-FR-36/37/38 + NFR-AC-2/3 to S1.6; coverage companion records PM-FR-36 → TT-E1, PM-FR-37 → TT-E2, PM-FR-38 → deferred. Test-design doc-alignment, no PM-FR owner slot. |
| PLAT-E1-S1.7 | `1-7-um-planning-residual-non-epic-2-4-scope` | **done** | **No** | UM planning residual (CAP-1 retirement). No PM-FR owner. |
| PLAT-E1-S1.8 | `1-8-doc-pass-create-path-removal-from-binding-docs` | **done** | **No** | Binding-doc verification pass. No PM-FR owner. |
| PLAT-E1-S1.9 | `1-9-register-epic-in-platform-sprint-status` | **done** | **No** | Sprint-status registration. No PM-FR owner. |

**Modelling gap — called out explicitly (AC bullet 6):** `global-fr-epic-story-coverage.yaml`
contains **no entry for any `PLAT-E1-S1.x` story** — not in any requirement's `stories:` list, not in
any `epics:` list, and not recorded anywhere as decision/gate-serving work with no PM-FR owner. The
only trace is `superseded_work: P-1..P-9` (`:858-860`) mapping the retired SCP alias scheme to
"`PLAT-E1-S1.1..S1.9` are canonical global aliases", plus an incidental mention at `:217`
("platform/epics.md's PLAT-E1-E7, which never claimed this requirement"). Epic 1 is a
documentation-alignment epic whose stories legitimately have **no PM-FR owner**, but the coverage
model does not represent that class of work at all. Recommended fix (owner: coverage-companion
maintainer, not a Story 1.2–1.6 deliverable): add a `decision_and_gate_serving_work:` section to the
companion listing `PLAT-E1-S1.1..S1.9` with `pm_fr_owner: none` and a one-line rationale each.

**Related unreconciled status (deferred to Story 1.1 by the source).** The two 2026-09-02 tracking
contradictions in `epics.md:39-44` are now half-resolved: `sprint-status.yaml:60-72` records
`epic-2: done` and `epic-3: done` (no longer `in-progress`), so only one mismatch remains —
`global-fr-epic-story-coverage.yaml:95` still records `PLAT-E2-S2.1` as `status: in-progress` while
`sprint-status.yaml:62` records `2-1-resolve-phase-0-audiences-acf-1: done`. The companion note
(`:121-123`) says this was left "pending Platform Story 1.1 reconciliation." **Recommendation:** flip
the companion `PLAT-E2-S2.1` entry to `status: implemented` to match `sprint-status.yaml` and the
ACF-1 evidence (owner: coverage-companion maintainer).

---

## 8. Superseded-ID mapping (AC bullet 7 — verbatim from the Story 1.1 AC)

| Superseded / historical ID | Replaced by | Source of the mapping |
|---|---|---|
| `TIMETRACKER-CONTRACT` | `TT-IDENTITY-01` **+** `TT-PMDM-01` | `blockers.yaml:120-138` (`superseded_by: [TT-IDENTITY-01, TT-PMDM-01]`); `:594-630` |
| architecture `CC-11` | `ARCH-PROJ-WRITER-01` | `blockers.yaml:632-665` (`superseded_by: [ARCH-PROJ-WRITER-01]`); `ARCHITECTURE-SPINE.md:293` |
| architecture `OQ-118` | `ARCH-ENV-01` | `blockers.yaml:714-752` (`superseded_by: [ARCH-ENV-01]`); `ARCHITECTURE-SPINE.md:311` |
| `CC-10` | `CC-10-MENTORSHIP` **+** `ARCH-GOV-01` | `blockers.yaml:512-522` (`superseded_by: [CC-10-MENTORSHIP, ARCH-GOV-01]`) |
| historical SCP alias `P-1 … P-9` | `PLAT-E1-S1.1 … S1.9` / sprint keys `1-1-…` … `1-9-…` | `global-fr-epic-story-coverage.yaml:858-860`; `epics.md` Story 1.9 AC. **Story 1.9 is `done`; its status predates the corrected AC oracle — record, do not re-key.** Do not rewrite `sprint-change-proposal-2026-08-27.md`. |

Historical PRD meanings preserved separately (not the same as the architecture-register IDs above):
PRD "CC-11 Option 1", PRD "OQ-118 / OQ-119", and PRD "CC-10" retain their meanings in the product
Decision Log (`blockers.yaml:642-645,724-728`).

---

## 9. Gap register + resolution (Stories 1.2–1.6, executed 2026-09-07)

Only `gap` rows whose owner is an Epic 1 story are listed. Rows owned by open blockers / downstream
epics (PLAT-E4–E7, TT-E*, PSH-E*, RISK-E*, CDS-E*, UM-E*) are noted inline in §3 and are **not**
Epic 1 work. Each Epic 1 gap was dispatched to its owning story; agents worked disjoint file sets,
cited the SoT per change, and ran `bmad-review` on their own diff. Not committed — edits are in the
working tree for human review. **Status: `closed` unless noted.**

| # | Gap | Owner | Resolution (2026-09-07) |
|---|---|---|---|
| G1 | `addendum.md` frames Departments as "confirmed pending v1.3" / "Architect + v1.3 spec" — obsolete (v1.5 closed it) | **1.2** | Deferred-topics "Department edge" row: dropped "Architect + v1.3 spec"; entity + manager-walk now stated `[NORMATIVE]` (§2.1, §4.17), only schema/edge open (`DEPARTMENT-EDGE`). Drift register gained a dated "v1.5 SoT reconciliation" column, history preserved verbatim. |
| G2 | `addendum.md` Pattern E line "integrate timetracker + PeopleForce" — no required / good-to-have distinction | **1.2** | Rewritten: timetracker = the one required integration (§5.1, §0); PeopleForce = good-to-have single prefill button (§5.2); no sync either direction (§4.7, §10). |
| G3 | `.memlog.md` still asserts scope = v1.2; "HR Admin full matrix access until OQ-104"; career-timeline "pending OQ-106" | **1.2** | Three stale lines struck-and-annotated (not rewritten) → v1.5 SoT; OQ-104 / OQ-106 both resolved (`prd.md:710`). Dated `(change)` entry added. |
| G4 | `spec-access-control-audience-foundation/SPEC.md:52` empty-audience→`403` with no PM/AD-24 superseded annotation | **1.3** | Annotation added at SPEC:52, `docs/test-cases/access-control-foundation/README.md`, the acf-au-05 / fc-01 / fc-02 blockquotes, a scoped note on `user-management/epics.md` FR-16/17, and `prd-user-management-2026-08-20/prd.md` FR-16. 2026-09-01 decision record untouched. |
| G5 | ACF-AU-05 / FC-01 / FC-02 HTTP `403` not reworked as resolver audience-set assertions | **1.3 → 1-3a (done)** | **Closed.** Split to `1-3a` on 2026-09-07, then found already shipped on the code side: `services/backend` `da7d1fa` (2026-09-06, in HEAD) makes the E2E assert resolver audience labels directly, resolver unchanged. The three scenario docs (still `expectedResult: 403`) were updated 2026-09-07 to match and their stacked blockquotes consolidated; the SPEC / README "pending 1-3a" notes corrected to "done". No gated dispatch needed. |
| G6 | Reporting-vs-Project split not in AC SPEC CAP intents / success criteria (S2/S3-absent, S5-narrowed) | **1.3** | Split + narrowed cells (no S2, no S3, S5 = CV+certs, rest incl. S6 identical — §3.3.2; deeper cells = PLAT-E6 / `AC-SECTION-MATRIX-01`) added to `spec-access-control-facade-audience-resolution` SPEC CAP-2 + `facade-contract.md`, and `spec-access-control-test-cases` SPEC CAP-2. |
| G7 | No confirmation in AC SPEC prose that there is **no "unit" entity** | **1.3** | `spec-access-control-test-cases/SPEC.md` assumptions now state it: *Unit Manager* is the role name for a department's manager; scenarios reference `Department`, never a "unit" object (§2.2, §4.17). |
| G8 | `dashboards.md` fixed-facts list covers only active-risk + Unassigned | **1.5** | AD-18 fixed-facts expanded: risk ascending order + trend-arrow rule, `leaver` ≠ `dismissed`, no-terminal-risk-state, departure-counts-from-status-only, Unassigned promoted to a subsection, DM/PM counter scope + project selector, explicit "engine/widget model — TBD". Every fact cited to v1.5. |
| G9 | Platform test-design cites a 171-file AC scenario inventory deleted 2026-09-04 | **1.6** | Replaced with current state ("no authored AC scenario inventory exists") across all five platform test-design files; the 202-file predecessor reference also corrected. |
| G10 | Platform test-design **QUALITY-GATE-AC** framing predates the 2026-09-02 closure | **1.6** | Current-state note added verbatim across the four non-handoff files: `gate-decision.json` (2026-09-04) `gate_status: FAIL` is a **P1 mentorship-coverage breach**; P0 access-control scope `MET` (128/128); `blockers.yaml:140-161` records the gate closed on the P0/ACM3-II-06 condition; debt open until a re-evaluated gate reads PASS / p0 MET / critical_open 0. QUALITY-GATE-AC-NFR tracked separately with ACM-9 baseline/final paths. |
| G11 | Five §9 DoD negatives not carried explicitly; PR-B-04 / OQ-117 still "Open" | **1.6** | Five DoD negatives carried as an explicit table with named gates; PR-B-04 / OQ-117 re-gated inline to DESIGN-CLOSED (PM/AD-34) / IMPLEMENTATION-DEBT. |
| G12 | §2.3 permission keys not verified as enumerated; `user-management:edit` / `mentorship:assign` absent from any catalog | **1.6** | **Partially closed / escalated.** Supplement flags `OQ-AC-EDIT` (P1) and `OQ-PERM-01` (P1) as the gates on DoD negative #2; the keys themselves are owned by those blockers, not this doc-alignment story. |
| G13 | Non-`-platform` UM test-design children + `spec-user-management-test-cases` CAP-1 carry pre-v1.5 registration assumptions | **1.6 + 1.7** | **Cross-referenced, not edited.** 1.6 carries it as a citation pointing at Platform Story 1.7 (CAP-1 retirement, `done`); the non-`-platform` child files are out of 1.6's edit scope and still carry the drift. |
| G14 | S10 colleague-narrowing + "two exceptions to a manager sees everything" negatives not enumerated | **1.6** | Noted in the platform test-design supplement (deeper S10 = UM-E7). |

### Gaps NOT owned by Epic 1 (recorded for completeness)

- Shared-link revocation backstop: §4.8 guarantees "there must never be a link nobody can revoke"
  with full-profile holders as the backstop, but PM-FR-39 is `deferred` with no stories and no owner
  and PLAT-E7-S7.3 creates no grant/revoke/seed path — **normative guarantee unmet, no owner**
  (`global-fr-epic-story-coverage.yaml:589-593`). Escalation, not an Epic 1 fix.
- All P0/P1 open blockers in §5 (implementation debt).

---

## 10. Acceptance criteria I could not fully satisfy

| AC bullet | Status | Why |
|---|---|---|
| 2 — every themed delta → PRD/SPEC/architecture/test-design status | **Substantially satisfied, with `unknown`→`gap` cells** | The PRD (`prd-people-management-2026-08-24`) and the architecture spine + `docs/architecture/*` were spot-verified against each delta and are largely v1.5-aligned (the ratification batch + kernel work closed most drift after `epics.md` was written 2026-09-02). SPEC and test-design were verified for the access-control and platform artifacts; **I did not exhaustively read every risk/CDS/feedback/resourcing slice spec or every non-`-platform` test-design child**, so a small number of cells are marked `unknown` → treated as `gap` (rows 3.2 "permission list grown", 3.3 "new entity" / "no unit entity"). These are conservative, not false `done`s. |
| 5 — gates ID resolution | **Fully satisfied** | All 16 live `gates:` IDs resolve to open `blockers.yaml` entries; no superseded ID is used as a live gate. |
| 6 — every `PLAT-E1-S1.x` resolves to a coverage entry OR is recorded as no-PM-FR-owner work | **Satisfied by reporting the negative** | None of S1.1–S1.9 (nor S1.3a) resolves to a coverage entry, and the coverage companion does **not** record them as decision/gate-serving work. This is the explicit modelling gap in §7. The AC is satisfied by calling it out; the companion edit itself is out of Story 1.1 scope (Story 1.1 creates only this file). |
| all | **Story 1.1 constraint honoured** | No file other than this matrix was created or edited. No `git add` / `git commit` run. |

Everything else in the Story 1.1 AC (SoT row, Breaking + themed deltas, ratification-folder row,
mechanical blocker counts, superseded-ID table) is satisfied above.

---

## 11. bmad-review — findings and where they landed

Lenses: verification-gap (adapted — this is a hand-authored document, so findings are
`gap_shape: other`: claims not backed by checkable evidence) and structure.

| # | Lens | Finding | Fold |
|---|---|---|---|
| VG1 | verification-gap | First draft repeated `ARCHITECTURE-RATIFICATION.md:117`'s "30 / 18 / 8 / 4" blocker figure | Re-counted mechanically → **31 / 17 / 10 / 4** (§5); prose flagged as stale, to be re-synced by the ratification-package owner |
| VG2 | verification-gap | First draft echoed the `epics.md` Story 1.6 AC that QUALITY-GATE-AC is `FAIL / NOT_MET / critical_open 1` | Verified `blockers.yaml` (`closed`) **and** `gate-decision.json` (2026-09-04, `FAIL` on P1/mentorship, `p0_status MET`); both states recorded (§5, §9 G10) |
| VG3 | verification-gap | First draft assumed `epics.md` FR Coverage Map (PLAT-E1 serves PM/AD-24, PM-FR-36/37/38) held in the coverage companion | Verified it does not — those FRs resolve to UM-E0 / TT-E1 / TT-E2 / deferred; corrected to the §7 modelling gap |
| VG4 | verification-gap | AC worry that a live `gates:` ID resolves to `TIMETRACKER-CONTRACT` / `OQ-118` / `CC-11` | grep confirms zero occurrences in any `gates:` list; stated as a positive result (§6) |
| VG5 | verification-gap | Several first-draft `done` cells rested on inference, not located text | Downgraded to `gap` / `unknown` (§3.2 permission-list, §3.3 department rows, §3.5 trend-arrow / `leaver`); citation-anchor convention added (§1) and mis-cite of OQ-105 in B4 removed |
| S1 | structure | Map each section to an AC bullet | §2–§8 numbered to AC bullets 1–7; §9 gap register; §10 shortfalls; "at a glance" summary front-loaded into §1 |
| S2 | structure | One mega-table is unscannable | Split into one table per changelog theme, same columns + "Gap owner", each with a `§`-ref to the changelog line range |
| S3 | structure | `N/A` vs `gap` vs `unknown` ambiguity | Conventions block added (§1) |
| S4 | structure | Next-wave planner could mistake blocker/downstream work for Epic 1 scope | "Gaps NOT owned by Epic 1" pulled into its own labelled subsection (§9) |
| S5 | structure | §11 restated body content | This section condensed to this table |

---

## 12. Carry-forward — items surfaced by the Epic 1 run, still not Epic 1 work

Per-gap resolution is in the §9 table. These are the residuals — each needs a decision or an
owner action, not a doc edit:

- **Coverage-model gap (§7):** no `PLAT-E1-S1.x` story is representable in `global-fr-epic-story-coverage.yaml`; it needs a `decision_and_gate_serving_work:` section — owned by the coverage-companion maintainer.
- **`PLAT-E2-S2.1` status mismatch:** `in-progress` in the coverage companion vs `done` in `sprint-status.yaml` — flip the companion (source deferred this to Story 1.1).
- **`ARCHITECTURE-RATIFICATION.md:117`** still narrates the stale "30 / 18 / 8 / 4" blocker figure (actual: 31 / 17 / 10 / 4) — ratification-package owner.
- **Shared-link revocation backstop** (§4.8 "never a link nobody can revoke") — normative guarantee unmet, no owner; PM-FR-39 deferred. Escalation.
- **PR-B blocker-table rows beyond PR-B-04** — a full re-gate is a `bmad-testarch-test-design` validate run, not Story 1.6.
- **`OQ-AC-EDIT` / `OQ-PERM-01`** (P1) — the §2.3 permission keys and default matrix approval themselves.
