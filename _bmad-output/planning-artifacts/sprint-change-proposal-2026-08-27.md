# Sprint Change Proposal — Spec v1.2 → v1.5 Alignment

**Date:** 2026-08-27  
**Project:** people management  
**Mode:** Incremental (approved)  
**Workflow:** bmad-correct-course  
**Scope of this proposal:** Planning artifacts only — **no application code edits in this workflow**

---

## 1. Issue Summary

**Trigger:** Spec baseline moved from v1.2 to v1.5 after team research was merged to main. This is not a single-story bug fix; it is validation and gap closure across PRDs, specs, epics, architecture, and test design before the weekend build.

**Why it matters:** Breaking v1.5 changes can make existing PRDs, specs, epics, and test cases wrong (access matrix Reporting vs Project line, HR Admin role model, departments, shared links, org-relationship changes, risks, resourcing, integrations). Commit `7ed0de3` partially aligned requirements/PRDs; residual conflicts remain — especially **HTTP employee creation (CAP-1)** vs **seeded population only**.

**Evidence:**

| Source | Finding |
|--------|---------|
| `docs/requirements-changelog-v1.2-to-v1.5.md` | Primary delta index |
| `docs/project-requirements.md` | Normative SoT (updated in `7ed0de3`) |
| UM Epic 1 Story 1.1 | Title = seed import; ACs = `POST /users` / `um-reg-*` |
| `sprint-status.yaml` | Key still `1-1-hr-admin-registers-a-new-hire` |
| Backend `c42de7d` | `POST /users` + `register-user.action` present |
| AC SPEC / `access-control.md` | Still single “Manager line”; HR Admin full-access OQs |
| Platform test-design | Still cites PRD **v1.2**; PF vacancies as required |

**Problem statement:** Planning artifacts are inconsistently aligned to v1.5. Cross-cutting updates must live in a separate **Platform Spec v1.5 Alignment** epic — not folded into user-management feature epics 2–4.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|------|--------|
| **UM Epic 1** | **Must change** — Story 1.1 rewrite to real seed import; retire CAP-1 ACs |
| **UM Epics 2–4** | **Scope unchanged** — wording-only SSO/registration leaks (Proposal 3b) |
| **NEW: Platform Spec v1.5 Alignment** | Owns all cross-cutting v1.5 artifact gaps (matrix, HR Admin, shared links, risks, PF, departments, architecture, dashboards, platform test-design) |

**Primary epic conflict:** v1.5 “no employee creation / seeded population” vs CAP-1 registration (Story 1.1 ACs, um-reg suite, impl story, backend `POST /users`).

### Story impact

| Story / suite | Action |
|---------------|--------|
| Story 1.1 | Replace CAP-1 ACs with seed-import ACs; rename sprint key |
| um-reg-01..15 | **Retire / supersede** |
| um-seed-01..03 | **New** — owned by UM Story 1.1 (not Platform epic) |
| Epics 2–4 stories | No scope change; FR inventory / coverage wording only |

### Artifact conflicts

| Artifact | Status |
|----------|--------|
| `prd-people-management-2026-08-24` | Mostly aligned; addendum/memlog drift |
| `prd-user-management-2026-08-20` | Scope OK; FR-2/3/4 contradict |
| `user-management/epics.md` | Half-aligned (labels vs ACs) |
| `spec-access-control-test-cases` | Pre-split Manager line; OQ3/OQ6 etc. |
| `spec-user-management-test-cases` | CAP-1 registration |
| `ARCHITECTURE-SPINE` / `access-control.md` | Single Manager-line walk |
| `dashboards.md` | Engine TBD; v1.5 fixed facts need capture |
| Platform test-design_* | v1.2 + PF vacancies SoT |
| `api-conventions.md` | Still lists `POST /users` (create) |
| `user-management-test-decisions.md` | DEC-UM create-path decisions |

### Technical impact (handoff only — not this workflow)

- Backend still implements `POST /users` (`c42de7d` / current tree).
- Registration E2E and stage-1 um-reg suite encode obsolete create-path.
- Code retirement is **post-proposal implementation handoff**.

---

## 3. Recommended Approach

**Selected:** **Direct Adjustment** (Option 1) + **scoped weekend MVP deferral**

| Path | Verdict |
|------|---------|
| Direct Adjustment | **Recommended** — artifact updates + Story 1.1 rewrite + new Platform epic |
| Potential Rollback | Not viable as primary — would discard valid Epic 1 non-create work |
| Full MVP rewrite | Not needed — weekend MVP narrowed instead |

**Weekend MVP (in):** UM on **seeded population** (no HTTP create); magic-link and remaining UM stories as already scoped.

**Deferred until Platform epic stories agreed:** platform-wide Reporting/Project matrix engine work; dashboard engine implementation.

**Effort:** Medium (many artifacts; clear edits)  
**Risk:** Low if Platform epic owns cross-cutting work and UM 2–4 stay scoped  
**Timeline:** Supports weekend build once Story 1.1 contract flips to seed

---

## 4. Detailed Change Proposals (approved Incremental)

### Proposal 1 — Story 1.1 + sprint key + um-reg disposition — **Approved**

**Artifact:** `_bmad-output/planning-artifacts/user-management/epics.md`  
**Also:** `_bmad-output/implementation-artifacts/user-management/sprint-status.yaml`

**OLD → NEW (summary):**

- Keep title **Import Seeded Population**.
- Replace all `POST /users` / `um-reg-*` ACs with seed/import ACs (population from seeded list; unique `workEmail`/`ttId`; `joined_company` at import; bootstrap HR Admin via seed; **no** HTTP create).
- FR inventory: FR-4/FR-5 → FR-4a/FR-5a seed; FR-6 uniqueness = edit + seed integrity (not registration); FR-1 drop “registration flow below”.
- Sprint key: `1-1-hr-admin-registers-a-new-hire` → `1-1-import-seeded-population`; status → `ready-for-dev`.
- **um-reg-01..15 → RETIRE / SUPERSEDE**; README/archive pointer under `docs/test-cases/user-management/registration/`.
- **um-seed-01..03** = Story 1.1 stage-1 sub-deliverables (owner: UM, not Platform).

### Proposal 2 — Platform Spec v1.5 Alignment epic — **Approved** (+ path amendments)

**Canonical epic file:** `_bmad-output/planning-artifacts/platform/epics.md` (**new file** — not a 5th UM epic)

**P-9 tracker:** Create `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` (preferred mirror of UM layout). Alternative: `planning-artifacts/platform/sprint-status.yaml` if tracking stays planning-only until first impl story.

| ID | Story |
|----|--------|
| **P-1** | Changelog traceability matrix — each changelog row → artifact status; **must include `docs/project-requirements.md` as SoT row** |
| **P-2** | Platform PRD + addendum drift close |
| **P-3** | Access-control SPEC + stage-1 suite alignment (Reporting/Project, HR Admin, never-share, etc.) |
| **P-4** | Architecture binding updates (spine AD-10, `access-control.md`) |
| **P-5** | Dashboards + §4.4 v1.5 fixed facts (no engine invent) |
| **P-6** | Platform test-design refresh (v1.2 → v1.5; PF optional prefill; no PF vacancies SoT) |
| **P-7** | UM planning residual (SPEC/README CAP-1 retirement confirmation; not Epic 2–4 scope) |
| **P-8** | Doc pass — remove create-path from `api-conventions.md` + rewrite/retire DEC-UM-003/006/008/009 in `user-management-test-decisions.md` |
| **P-9** | Register epic + stories in platform sprint-status tracker |

**Out of Platform epic:** um-seed-01..03 (UM Story 1.1); application code.

### Proposal 3 — UM PRD FR-2 / FR-3 / FR-4 — **Approved**

**Artifact:** `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md`

- FR-2: magic-link sole login; **no SSO / no AD** (drop “ahead of SSO”).
- FR-3: first/subsequent login = magic-link; seed does not establish session (drop registration form).
- FR-4: population = seed import only; HTTP/UI create out of scope; keep `isActive` soft-delete note.
- FR-1: bootstrap via seed/import; no registration flow.
- Open Question #1: seed import; HTTP registration retired.

### Proposal 3b — Epic FR inventory / coverage wording — **Approved** (optional, applied)

**Artifact:** `user-management/epics.md`  
**Scope:** Wording-only after Proposal 1 lands.

| Location | Change |
|----------|--------|
| FR-2 line | Drop “temporary, ahead of SSO” → seeded population; no SSO |
| FR-3 line | Drop “registration form” → magic-link first/subsequent login; import does not establish session |
| FR-4 line | Covered by Proposal 1 (FR-4a seed) — ensure no residual “registration form” |
| Coverage map FR-3 | “no registration auto-login” → “import does not establish a session” |
| Epic 2 story ACs | Already largely clean (line ~335 already seed-framed); only touch if residual “registration”/“SSO” remains after Proposal 1 |

If any Epic 2 story text is already clean after Proposal 1 → no further edit; residual SPEC cleanup stays **P-7**.

---

## 5. Implementation Handoff

### Scope classification: **Moderate**

Backlog reorganization + multi-artifact planning edits; code retirement is a follow-on Developer task after planning approval — not part of Correct Course document edits alone.

### Handoff recipients

| Role | Responsibility |
|------|----------------|
| **PO / Dev (planning)** | Apply Proposals 1–3b to epics/PRD; create `platform/epics.md` + platform sprint-status (P-9); execute P-1…P-8 as Platform stories |
| **Developer (code — after planning)** | Retire `POST /users` create-path; wire seed/import; update E2E |
| **Architect** | P-4 / P-5 binding decisions (matrix walk split; dashboard fixed facts) |
| **PM** | Confirm weekend MVP gate vs Platform epic sequencing |

### Implementation handoff table (code + binding docs)

| Item | Action | When | Owner |
|------|--------|------|-------|
| `services/backend` `POST /users` | Remove/disable `@Post()`, `register-user.action`, `CreateUserDto`, registration e2e | After Story 1.1 planning lands | Developer |
| Seed/import script | Implement population import + bootstrap HR Admin; e2e vs um-seed-* | Same | Developer |
| `spec-1-1-hr-admin-registers-a-new-hire.md` | Rename/replace to import-seeded-population story | With Story 1.1 rewrite | Developer / PO |
| `docs/architecture/api-conventions.md` | Remove `POST /users` (create) from User resource shape | Platform **P-8** | Platform epic |
| `docs/architecture/user-management-test-decisions.md` | Retire/rewrite DEC-UM-003/006/008/009 (+ um-reg traces); keep 001/002/004/005/007 as applicable | Platform **P-8** | Platform epic |
| `docs/test-cases/user-management/registration/*` | Mark archived/retired; pointer to um-seed | Story 1.1 | UM |
| New `um-seed-01..03` | Author stage-1 scenarios | Story 1.1 sub-deliverables | UM |
| Platform matrix / AC suite / test-design / dashboards | Per P-1…P-6 | Before matrix/dashboard engine build | Platform epic |

### Success criteria

1. Story 1.1 ACs describe seed import only; sprint key renamed; um-reg retired.
2. `platform/epics.md` exists with P-1…P-9; tracker created; P-1 matrix includes **`docs/project-requirements.md` as SoT**.
3. UM PRD FR-2/3/4 match Scope (no SSO, no registration create).
4. Weekend build proceeds on seeded population; matrix engine + dashboard engine wait for agreed Platform stories.
5. `POST /users` code retirement tracked as explicit handoff item (not silently skipped).

### Explicit non-goals of this Correct Course run

- No edits to `services/backend` or `services/frontend` in this workflow.
- No folding of matrix/HR Admin/shared-link/dashboard/PF work into UM Epics 2–4.

---

## Approval

**Checklist §§1–4:** Approved (Incremental).  
**Proposals 1, 2 (+path), 3, 3b:** Approved.

**Awaiting explicit approval to implement artifact edits and/or close workflow:**

- [x] Approve this Sprint Change Proposal for implementation (yes — planning artifacts only, 2026-08-27)
