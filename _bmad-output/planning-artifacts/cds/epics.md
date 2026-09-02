---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md
  - _bmad-output/planning-artifacts/platform/epics.md
  - _bmad-output/planning-artifacts/platform-capabilities/epics.md
status: draft
slice: cds
id_namespace: CDS-E{epic}-S{story}
updated: 2026-09-03
---

# People Management — CDS (Career Development System) — Epic Breakdown

## Overview

This document is a **new bounded-context slice** decomposing exactly **2 canonical PRD requirements**: the CDS registry content on profile section S12 (`PM-FR-30`) and CDS filtering from the All Employees directory (`PM-FR-31`).

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) **§4.11** (FR-30, FR-31) and [docs/project-requirements.md](../../../docs/project-requirements.md) **§4.10**, with §3.2 S12, §3.3, §2.3, §4.1, §4.8 and §4.17 binding.

> **§-numbering note.** The requirements document numbers CDS **§4.10**. The PRD **body** numbers it **§4.11** (PRD §4.10 is Career Timeline, FR-28/29), while the PRD's own §-to-FR traceability table records `§4.10 | PM-FR-30–31 | CDS`. The coverage model's `normative_refs` for both FRs is `§4.10`, which is correct against the requirements document. This slice cites **requirements §4.10** and **PRD §4.11 (body)**, and records the PRD-internal contradiction below rather than propagating it.

**Scope boundary, stated before anything else** — because it is the single fact that shapes every story here. Requirements §4.10 opens with it: *assessments happen outside the system*. The platform does not implement the assessment, does not host the competency matrix, and does not compute scores. **It is a registry and a hub.** The matrix changes shape frequently and must never be encoded in the schema. Every story below is therefore about links, dates, text, and one checkbox — and every story that could drift into modelling an assessment is explicitly fenced.

**Selection rule:** `PM-FR-30` and `PM-FR-31` are the two remaining `coverage_status: uncovered` requirements with `stories: []` that form a single bounded context in [global-fr-epic-story-coverage.yaml](../global-coverage/global-fr-epic-story-coverage.yaml). They are also mutually dependent in one direction only: FR-31 filters on data FR-30 creates, and FR-30 needs nothing from FR-31.

**Architecture authority:** [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md) — `ratified-with-transition-debt`. Design ratification is **not** implementation evidence. Ratification §4.2 lists **CDS** by name among *Confirmed absent or incomplete*, alongside "most profile sections". Nothing in this slice exists today.

**Blocker authority:** [blockers.yaml](../architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml).

### Cross-context boundaries

| Context | Responsibility in this slice |
|---|---|
| `cds` | The skills-matrix dictionary, the assessment log, IDP records, and the S12 read model. **Pending PM/AD-5 confirmation** — see SD-9 |
| `access-control` | The S12 section decision (`RW` / `R` / `—` / `cfg`), owned and specified by `PLAT-E6-S6.5`. This slice **consumes** it and never re-derives it |
| `user-management` | Profile HTTP assembly and the `data` / `canEdit` envelope S12 lands in (PM/AD-34); the `Department` entity and `UserDepartment` membership the matrix key resolves against (PM/AD-35) |
| Platform capabilities (`PMC-E*`) | The All Employees filter engine `PM-FR-31` runs on — `PMC-E1-S1.1` (shared projection), `PMC-E1-S1.3` (filters), `PMC-E1-S1.6` (saved views), `PMC-E1-S1.7` (export) |
| Future profile-sharing context | Link creation and lifetime. This slice states only that S12 is `cfg` and is in the resourcing evaluation view |

### Identifier namespace

Stories in this slice use **`CDS-E{epic}-S{story}`**.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers (PRD §0.2) and are **never** reassigned by this slice. No story here claims one.

> **REGISTRATION (corrected 2026-09-03).** The decomposition below was absent when this file was first written, and the registration claim made here was false at that time — `CDS-E*` appeared in neither `namespace_rules` nor `source_slices`. With Epics 1 and 2 now written, `CDS-E*` **is** registered in `global-fr-epic-story-coverage.yaml` under both keys, with `role: draft-bounded-context-slice` matching this file's `status: draft`, and PRD §0.2 carries a live CDS row. `PM-FR-30` and `PM-FR-31` move from `uncovered` with `stories: []` to `specified`.

**Out of scope for this slice:** the S12 **section decision** itself (`PLAT-E6-S6.5`, `PM-FR-3`); the directory filter **engine** (`PMC-E1`, `PM-FR-8`/`PM-FR-10`); the `Department` entity, its nesting, and `UserDepartment` (`PM/AD-35` / `DEPARTMENT-EDGE` — owned by `access-control` / `user-management`); the share-link engine (`PM-FR-27`, uncovered); career-timeline events (`PM-FR-28`/`29` — a CDS assessment is **not** a tracked timeline event, requirements §4.9); the "upcoming CDS assessments" and "IDPs approaching their deadline" dashboard widget ideas (§4.5 **[DESIGN FREEDOM]**, `PMC-E2`); notifications for IDP deadlines (§4.13, GOOD TO HAVE).

### Scope decisions (product owner, 2026-09-02)

Nine decisions. They bind epic and story design and are not re-opened downstream without a new decision.

- **SD-1 — Registry, never an engine; every external artifact is a link the platform never fetches.** Requirements §4.10's opening paragraph is normative, not framing. No story models competencies, levels, scores, or matrix rows. The skills-matrix file, the assessment result file, and the IDP file are **stored URLs**. The platform never fetches, parses, validates, or mirrors any of them, and an unreachable destination never blocks a create, an edit, or a completion (NFR-4). This is the same rule `ENG-E2-S2.1` applies to a campaign's external form URL, and it is applied here for the same reason.
- **SD-2 — The matrix link is a dictionary lookup on `(department entity, position)` resolved at read time, never a string stored per profile.** Requirements §4.10 states the reason explicitly: *"When the matrix file is updated centrally, every profile pointing at it reflects the change — which is why the key is the entity and not a free-text string."* Storing a resolved URL on the profile would satisfy the visible acceptance criterion and violate the requirement's whole purpose. **Because no `Department` table exists, this is hard-gated on `DEPARTMENT-EDGE`** and is the only part of `PM-FR-30` that is.
- **SD-3 — The S12 section decision is consumed, not re-derived.** `PLAT-E6-S6.5` already specifies S12 as `RW` for Reporting line, Project line and PP; `—` for Colleague; `R` for Self **with own-IDP completion as a named consumer command rule**; `cfg` for a shared link. This slice implements that consumer command rule and asserts the matrix, but it creates no second access matrix and no client-side section logic (PM/AD-34, requirements §3.3 rule 5).
- **SD-4 — Every CDS write is dual-gated, with exactly one deliberate exception.** Requirements §2 ("Both dimensions must permit an operation"): a CDS write needs applicable **S12 write access** *and* the **`maintain CDS records`** functional permission. The single exception is the employee ticking **their own** IDP complete — available at S12 `R`, with no functional permission, and **only** on their own record. This is the same dual-gate shape as `PM-FR-29`, and the exception is the same shape as S14's mark-complete. **A functional role never widens access** (§2.3): holding `maintain CDS records` with Colleague tier over a person yields nothing.
- **SD-5 — *Never assessed* is a first-class filter value, and it is the primary case.** Requirements §4.10 is unusually explicit: *"the practical use is finding people not assessed for a long time, so assessed before is the primary case, and never assessed must be selectable as a distinct option rather than being lost as an empty value."* A `NULL` last-assessment date is therefore a **selectable value**, never an empty result, never silently excluded by a date comparison, and never conflated with *assessed before <date>*.
- **SD-6 — The two CDS filters are the slice's principal leak surface, and are treated as one.** S12 is `—` for Colleague. A viewer's entitled directory row set contains people they hold **Colleague** tier over. Filtering that row set on *has an open IDP* or *date of last assessment* would let the viewer infer S12 state for people whose S12 is not returned to them at all — a per-target inference channel of exactly the shape requirements §3.3 rule 6 forbids for custom fields, applied here to a **section**. **Decision: CDS filter predicates evaluate only over rows for which the viewer's S12 decision is not `—`; rows outside that set are unaffected by the predicate and their membership never changes with it.** This is asserted by comparing result sets and counts, not by inspecting code.
- **SD-7 — An IDP is *open* if and only if it has no completion date.** Requirements §4.10: *"An IDP with no completion date is open."* There is no status field, no close, no cancel, no reopen semantics invented, and no second definition of openness anywhere — the `has an open IDP` filter (FR-31) reads the same derivation the profile renders (FR-30). Divergence between the two is a defect.
- **SD-8 — Derived rules are marked, not smuggled.** Where the requirements and PRD are silent on a case a story must decide (the type of the `assessor` field, whether a completed IDP can be un-ticked, how the `between` bound endpoints behave, how many IDPs a person may hold at once), the story states the chosen rule inline and marks it `[DERIVED]`. Every `[DERIVED]` rule is a Product Owner confirmation item, listed in *Open follow-ups*.
- **SD-9 — `cds` bounded-context confirmation is a slice precondition, not a story.** PM/AD-5 lists `cds` among contexts *"pending confirmation"*, unlike `action-items` and `mentorship`, which were confirmed by named amendments. The context must be confirmed before Epic 1 enters a sprint. **No scaffolding story is created for it** — architecture confirmation is not user value, and the layout it would create is already fixed by PM/AD-2.

### Slice-level preconditions

Not deliverables of any epic here. Every epic consumes them, so they are stated once, and no story below may reach production evidence while any of them is open.

| Precondition | Severity / status | Why it precedes every epic |
|---|---|---|
| `SEC-AUTH-01` | **P0 open** | `isAllowedForTarget` returns `Boolean(userId)`, permitting **every** operation on **every** target, and the interim session resolver self-provisions a privileged `position: 'HR Admin'` account. Every CDS read and write inherits both holes |
| `AC-S9-S13` | **P1 open** | S12 sits inside this blocker's declared range and closure condition, and since 2026-09-03 inside its `blocks:` list as well. The `AccessControlFacade` returns `none` for every section other than S1/S10/S11, so **S12 does not resolve at all today**. See *Recorded inconsistencies* #2 and #3 |
| `PM/AD-5` `cds` confirmation | **unregistered (SD-9)** | The context is "pending confirmation". `assessments` and `idps` already have an approved route shape (PM/AD-14) — the routes are ahead of the context |
| `OQ-PERM-01` | P1 open | `maintain CDS records` is an FR-6 grant with no approved default assignment. **Do not seed or infer grants** |
| Audience-safe response projection | PM/AD-34 `partial`; ratification §4.2 `absent` | Whole-row `User` serialization can expose non-S1 fields. S12 is assembled through that envelope |
| `CONFLICT-UM-01` | P1 open (implementation stale) | PM/AD-24's list-omission and hidden-target-`404` rules bind every CDS list and filter; the runtime still diverges, so denial tests run against the runtime and not only the contract |
| `PM/AD-25` / `TD-11` | transition debt | The global five-minute frontend `staleTime` can satisfy an NFR-7 immediacy criterion from cache. Every immediacy criterion here names it explicitly and requires server-side revalidation |

Owner for the S12 section increment and the permission catalog: `access-control`. Owner for `Department` / `UserDepartment`: `user-management` per PM/AD-35.

### Recorded inconsistencies in the input set

Findings, not stories. Each was verified mechanically against the cited file.

1. **The PRD contradicts itself on CDS's section number.** The PRD body heads the section `### 4.11 CDS (Career Development System)` and heads Career Timeline `### 4.10`, while the PRD's own §-to-FR traceability table records `§4.10 | PM-FR-30–31 | CDS`. The requirements document — the normative source — numbers CDS §4.10. **Disposition: the requirements numbering is authoritative; the PRD body heading is the outlier and its traceability table is accidentally right.** No renumbering is performed here.
2. **`AC-S9-S13`'s `blocks:` field omitted CDS — corrected 2026-09-03.** The blocker's `id`, and its `closure_condition` (*"an approved AD-1 increment for S9-S13"*), both cover S12, while its `blocks:` list read only *"Career timeline writes, Mentorship profile projection and closure-note visibility"* — S9 and S13. This slice used `AC-S9-S13` on the strength of the ID and the closure condition and recorded that the `blocks:` list was owed a CDS entry. **`access-control` resolved it in this slice's favour: `blocks:` now names *CDS registry and CDS directory filters (S12)* explicitly.** No new gate ID was invented here.
3. **Two slices gated the same section on two different IDs, one of them unregistered — resolved 2026-09-03.** [platform/epics.md](../platform/epics.md) Story 6.5 gated S12 on **`AC-SECTION-MATRIX-01` (then unregistered)**; the coverage model gated the S9–S13 range on **`AC-S9-S13`**; and `platform`'s own Gate binding table listed S12 in **no row at all**. This slice used the registered ID. **`access-control` resolved the divergence in favour of `AC-S9-S13`**, which is what its `id` and `closure_condition` already said: S12 was added to that entry's `blocks:`, `AC-SECTION-MATRIX-01` was registered for S2–S8 and S14–S16, and `PLAT-E6-S6.5` — which spans S12, S14 and S15 — now carries **both** gates. **No acceptance criterion in this slice changed.**
4. **The route contract is ahead of the context confirmation.** PM/AD-14 shape (2) already enumerates `assessments` and `idps` as owned collections under `/users/:id/`, while PM/AD-5 still lists `cds` as *pending confirmation*. The endpoints for a context that has not been approved are already fixed. Recorded so that confirming the context is understood as ratifying an existing route decision, not opening one.
5. **Half of the matrix dictionary key is entity-typed and half is not.** Requirements §4.10 insists the **department** side of the key be the entity *"and not a free-text string"*, and gives the reason. It says nothing about the **position** side, and no `Position` entity exists in the requirements or in PM/AD-35. A position rename would therefore silently break the lookup for everyone holding it — the exact failure the department half of the rule was written to prevent. **Recorded for escalation; Story 1.1 states a `[DERIVED]` rule rather than inventing an entity.**
6. **`PM-FR-30` has no production surface, only an HR-Admin inspection tool.** EXPERIENCE.md maps `PM-FR-30` to *"Access preview (S12 section) — Section slice only"*. Access preview is `Administration → Access preview`, **HR Admin only**, and its purpose is inspecting access resolution. There is no designed surface on which an ordinary employee ticks their IDP complete or a People Partner records an assessment — the two central interactions of the FR. See *UX coverage gaps* below.

## Requirements Inventory

### Functional Requirements

Exactly 2, verbatim-sourced from PRD §4.11 and requirements §4.10.

- **PM-FR-30** *[PRD §4.11 FR-30 / requirements §4.10]*: The profile CDS section (S12) contains:
  - a **link to the current skills matrix file** for that person's department and position — the mapping keys off the **department entity** (§4.17) and the position, is maintained as a dictionary, and the profile **resolves and displays the correct current link** so that a central file update reflects on every profile pointing at it;
  - an **assessment log** — each completed CDS assessment with date, assessor, a link to the result file, and a **final conclusion entered as text in the system**;
  - an **IDP** — one record per plan, with a short description, a deadline, a link to the external IDP file, and a single **complete** checkbox; when the employee ticks it the **completion date is recorded and displayed alongside the deadline**, and an IDP with no completion date is *open*.
  - Holders of **`maintain CDS records`** create assessment records, edit conclusions, and create or update IDPs. **The employee can read the section and mark their own IDP complete.**
  - Consequence *(§4.10 opening)*: assessments happen outside the system; no assessment implementation, no hosted competency matrix, no computed scores, and the matrix shape is never encoded in the schema.
  - Consequence *(§3.2 S12)*: `R (+ complete own IDP)` for Self · `RW` for Reporting line, Project line and PP · `—` for Colleague · `cfg` for a shared link.
  - Consequence *(§4.7)*: S12 is one of the five sections **enabled by default** on the resourcing-generated evaluation link — a candidate's skills matrix and assessment history are precisely what a reviewing DM is evaluating.
- **PM-FR-31** *[PRD §4.11 FR-31 / requirements §4.10, §4.1]*: All Employees supports two CDS filters:
  - **Date of last assessment** — a date comparison offering *assessed before* a given date, *assessed after* a given date, and *between* two dates, with **never assessed** selectable as a **distinct option** rather than being lost as an empty value;
  - **Has an open IDP** — yes or no.
  - Consequence *(§4.10)*: *assessed before* is the primary case, because the practical use is finding people not assessed for a long time.
  - Consequence *(§4.1)*: both are ordinary filters on the single All Employees list page, subject to the same entitlement rules as every other filter and column.

### NonFunctional Requirements

From PRD §8, filtered to what binds this slice.

- **NFR-1** *[PRD §8 NFR-1]*: Access-control correctness is the primary quality attribute; a leak in any section, API surface, export, search result, or notification path is a **critical defect**. S12 is `—` for Colleague, and Epic 2 adds two predicates that run over row sets containing colleague-tier people (SD-6).
- **NFR-2** *[PRD §8 NFR-2]*: Seeded test population only. No real PII in fixtures, logs, screenshots, or agent contexts. **Final conclusion** text and IDP descriptions are free-text fields about a named person's development and are among the most sensitive free text in the product — fixtures are synthetic by construction.
- **NFR-3** *[PRD §8 NFR-3]*: ≤2 seconds at 500+ rows with permission resolution on the All Employees list. **This slice is inside the NFR-3 boundary**, unlike the engagement risk dashboard: Epic 2 adds two predicates — one over an aggregate (latest assessment date per person, including its `NULL` case) and one over a derived boolean — to the one surface PRD §8 names.
- **NFR-4** *[PRD §8 NFR-4]*: External integration failure degrades gracefully. Three link fields here point outside the platform; none is ever fetched, and an unreachable destination breaks nothing (SD-1).
- **NFR-5** *[PRD §8 NFR-5]*: Responsive layout and accessibility for the profile section and the list surfaces introduced here.
- **NFR-6** *[PRD §8 NFR-6]*: English UI only.
- **NFR-7** *[PRD §8 NFR-7]*: Functional-permission revocation is **immediate**; platform-owned relationship changes apply on the **next request**. Binds three separate criteria here: losing `maintain CDS records`; a department change moving a person to a different matrix entry; and losing S12 access through a relationship change.

### Additional Requirements

**Architecture (binding)**

- **PM/AD-5 — Bounded-context map:** `cds` is listed among contexts **pending confirmation** (with `resourcing`, `risk`, `feedback`, `campaigns`). Confirmation is a slice precondition (SD-9), and the context uses the standard `application/domain/infrastructure` layout.
- **PM/AD-14 — Router tree** *(ratified; implementation absent)*: shape (2), owned collections with real row identity, **already names `assessments` and `idps`** — `/users/:id/assessments[/:itemId]` and `/users/:id/idps[/:itemId]`. These are *owned* collections, not top-level ones, because a CDS record has no meaning apart from the person it is about — the opposite of `action-items`. **No fifth route shape is invented**, and **section addressing uses human-readable names, never `sNN` ids** — there is no `/users/:id/s12`. The skills-matrix dictionary is administrative and cross-user, so it is top-level, not nested under `/users`.
- **PM/AD-35 / `DEPARTMENT-EDGE` — Nested Department schema** *(design resolved-approved 2026-09-02; **a table landed 2026-09-02 that diverges from the decision — see below**)*: `Department {id, name, parentId, isHr}` with `UserDepartment {userId PK, departmentId}` — exactly one department per employee. AD-35's `Binds:` list names **"CDS key"** explicitly. **A `Department` table now exists** (migration `20260902001941_story_1_1_import_population`), but it **diverges from AD-35 and from requirements §4.17**, and the divergence binds this slice's matrix key. Membership is `DepartmentMembership`, **temporal and multi-valued** — its partial unique index is on `(userId, departmentId)`, so the schema permits an employee to hold several current memberships, while §4.17 and AD-35's `UserDepartment {userId PK}` both fix **exactly one**. There is also **no `isHr` column** and **no index on `parentId`** (the FK constraint alone does not create one in PostgreSQL). `DEPARTMENT-EDGE` names `UserDepartment`, the `parentId` index and the isHr-bounded PP HR-line in its closure condition, and stays open on all three. **SD-2 is unchanged**: the key resolves against the employee's single department per the requirement. Building the lookup against the shipped multi-membership schema would encode a cardinality the normative source does not authorise.
- **PM/AD-13 — Deferred-architecture fixed facts** *(binding input)*: among the v1.5 fixed facts, *"department change writes a timeline event and CDS matrix lookup keys on department entity."* The timeline half belongs to `PM-FR-28` (`UM-E3`); the CDS half is SD-2.
- **PM/AD-34 / ARCH-ENV-01 — Profile assembly + envelope** *(design ratified; implementation partial)*: S12 is assembled into the `user-management`-owned `data` / `canEdit` envelope from this context's application read export, after AccessControl section decisions. `canEdit` is a read-only projection of the **same dual gate** SD-4 describes — which makes S12 a direct test of the envelope's `canEdit` contract, since Self is `R` yet holds exactly one write command.
- **PM/AD-24 — HTTP denial oracle:** `401` invalid or inactive session; `404` missing **or hidden-existence** target; `403` visible resource with a forbidden feature or action. **List endpoints omit invisible rows.** Hidden-target `404` precedes mutation permission checks.
- **PM/AD-29 — `AccessJournal`** *(design ratified; no table — `CC-07` P0 open)*: **nothing in this slice is a journal event.** Recording an assessment, editing a conclusion, or completing an IDP does not change who can see what. Stated so the journal is not widened into a general audit log.
- **PM/AD-30 — `UserEvents`** *(design ratified; no model — `CC-09` P0 open)*: **a CDS assessment is not a career-timeline event.** Requirements §4.9 fixes the tracked list — join, grade, position, department, FTE/subcontractor, extended leave, mentorship start/end — and it contains no CDS event. Stated as an explicit negative because "completed assessment" is a plausible-looking timeline entry that the requirements do not authorise.
- **PM/AD-32 — Custom-field EAV** *(design ratified; TD-12 jsonb transition debt)*: reached indirectly. Epic 2's filters coexist with custom-field filters in one filter engine; Story 2.3's non-inference property and `PMC-E1-S1.8`'s are the same property over different field sources and must not be closed independently.
- **PM/AD-25 — Frontend authorization and cache contract** *(transition debt TD-11)*: named in every NFR-7 immediacy criterion here.
- **PM/AD-10 — Live audience and section resolution** *(design partial; implementation partial)*: only Reporting line and direct People Partner Phase-0 audiences exist. Project-line and department traversal are absent, which caps who can reach S12 as `RW` today — a real coverage limit on Epic 1, not a story.

**Fixed product facts (not re-decided here)**

- S12 is `cfg` on a shared link — off by default, requiring explicit enabling per link (requirements §4.8) — **except** on the resourcing-generated evaluation link, where it is one of the five sections enabled by default (requirements §4.7, `RS-E1-S1.4`).
- Every employee belongs to **exactly one** department, and departments nest (requirements §4.17, PM/AD-35).
- Functional roles are data, not code; `maintain CDS records` is one of the granular permissions §2.3 requires to be independently grantable; removing a permission takes effect **immediately** for everyone holding it (§2.3, NFR-7).
- A functional role **never** widens what data its holders can see about a person (§2.3).
- The `manage departments` permission owns department mutation; changing a person's department is an access switch with its own screen, permission and journal entry (§2.1, §4.17) — this slice only *reads* the resulting membership.

### UX Design Requirements

**Thin, and honestly so.** EXPERIENCE.md's PM-FR → surface mapping records `PM-FR-30` → *"Access preview (S12 section) — **Section slice only**"* and `PM-FR-31` → *"— **No surface**"*. `PM-FR-31` is one of the 19 PM-FRs EXPERIENCE.md lists as having no UX surface; `PM-FR-30` is on its **partial-only** list, needing future surfaces.

What binds is the spine's cross-surface contract. Extracted below and referenced by token name only; values live in [DESIGN.md](../ux-designs/ux-people-management-2026-09-02/DESIGN.md).

- **CDS-DR1**: S12 renders as a profile section inside the existing profile assembly, not as a new page. This slice **adds no sidebar entry** — unlike risks, campaigns and feedback, CDS has no top-level navigation target in EXPERIENCE.md's Information Architecture, and inventing one is outside a `bmad-ux` decision. The **skills-matrix dictionary admin surface** is the one exception: it is administrative and cross-user, and belongs in the `Administration` sidebar group alongside roles, custom fields and departments.
- **CDS-DR2**: Any new page carries the page header band `.pghd` (`{components.page-header-band}`): mono eyebrow in `{typography.page-eyebrow}` formatted `AREA / SCREEN`, title in `{typography.page-title}`, one-line lead in `{typography.page-lead}`, and a `{spacing.pghd-accent-width}` accent tick in `{colors.stretch-blue}`. **`{colors.stretch-amber}` (timetracker-synced) and `{colors.stretch-violet}` (access-inspection) carry reserved meanings** and must not be used decoratively here.
- **CDS-DR3**: The S12 section header carries a `.prov` provenance tag (`{components.provenance-tag}`) in the **`ACCESS` variant** (`.prov.access`), because the section resolves per request. It carries a text label, is never colour-only, and is never tooltip-only.
- **CDS-DR4** *(specific to this slice)*: **the skills-matrix link is resolved, not stored, and the UI says so.** The matrix row displays the department and position it resolved through, so a reader can tell a stale-looking link from a wrong dictionary entry. A resolution that finds no dictionary entry renders an explicit "no matrix configured for this department and position" state — never a broken link and never a blank row (CDS-DR6, CDS-DR10).
- **CDS-DR5**: Dates and stat values render in `{typography.data-stat}` (Geist Mono) — assessment dates, deadlines and completion dates are data, and the mono voice is the spine's data voice.
- **CDS-DR6**: Empty conditions use the empty state `.emptyst` (`{components.empty-state}`): icon, bold line, direction, action. Three distinct empties exist here and must read differently: **no assessments yet**, **no IDP yet**, and **no matrix configured** — the first two are normal, the third is a configuration gap.
- **CDS-DR7**: Loading uses a shadcn `Skeleton` matching the target list or card layout, not a spinner or blank region.
- **CDS-DR8**: **WCAG 2.2 AA.** The IDP **complete** checkbox is the employee's only write in the whole section and must be reachable and operable by keyboard alone with a visible focus ring in `{colors.ring}`; `prefers-reduced-motion: reduce` disables **all** transitions and animations.
- **CDS-DR9**: Responsive per the spine: `≥lg` full sidebar and multi-column layout; `md` sidebar collapsed to icons and a 2-column grid; `<md` sidebar becomes a `Sheet` and tables scroll horizontally.
- **CDS-DR10**: Microcopy is **direct, honest, permission-literate**. Motivational HR phrasing is forbidden — this is a section about somebody's assessed competence and their development plan, and it is the place in the product where encouraging copy would read worst. Gaps are stated, never hidden.
- **CDS-DR11**: **Banned, and testable as negatives**: client-side section hiding as a substitute for server omission; a functional role used to widen data access; inferring hidden values through filter side channels. The third is a **live** risk here and is SD-6 / Story 2.3.
- **CDS-DR12** *(derived — records an existing contract)*: any dashboard treatment of CDS ("upcoming CDS assessments", "IDPs approaching their deadline") is **[DESIGN FREEDOM]** under requirements §4.5 and belongs to `PMC-E2`. This slice supplies the source data and **designs no widget**.

> **UX coverage gaps recorded, not resolved.** The only mapped surface for `PM-FR-30` is **Access preview**, an HR-Admin-only access-inspection tool. Neither of the FR's two central interactions — an employee ticking their own IDP complete, and a People Partner recording an assessment with a conclusion — has a designed surface, and `PM-FR-31` has none at all. Stories therefore bind to normative behaviour and to **already-named** component patterns in the UX spine; they invent no new chrome. A `bmad-ux` run should precede implementation, and would change no acceptance criterion here.

### FR Coverage Map

| Requirement | Epic | Delivered outcome |
|---|---|---|
| `PM-FR-30` — CDS registry content on S12 | **Epic 1** — `CDS-E1-S1.1` **(gated)**, `S1.2`, `S1.3`, `S1.4` | A People Partner or manager records assessments and IDPs against a person, the person reads their own section and ticks their own IDP complete, and the skills-matrix link resolves centrally. The **matrix story is hard-gated** on `DEPARTMENT-EDGE` — the rest of the epic is not |
| `PM-FR-31` — CDS directory filtering | **Epic 2** — `CDS-E2-S2.1`, `S2.2`, `S2.3` | Two ordinary All Employees filters — last-assessment date with *never assessed* as a distinct value, and *has an open IDP* — that cannot be used to infer S12 state for people whose S12 the viewer never receives |
| NFR-1 | Epics 1, 2 | Per-audience negative checks over every S12-bearing payload (Story 1.4's endpoint inventory) **and** the filter-differencing checks in Story 2.3 — two distinct leak shapes, checked separately |
| NFR-2 | Epics 1, 2 | Synthetic fixtures by construction — **final conclusion** text and IDP descriptions are the most sensitive free text in this slice |
| **NFR-3** | **Epic 2** | **Claimed, unlike the risk dashboard.** Epic 2 adds two predicates to the one surface PRD §8 names: an aggregate with a `NULL` case, and a derived boolean. Story 2.1 carries the ≤2s/500-row budget explicitly |
| **NFR-4** | Epic 1 | Three stored URLs — matrix file, assessment result file, IDP file. None is ever fetched; an unreachable destination never blocks a create, an edit, or a completion (SD-1) |
| NFR-5, NFR-6 | Epics 1, 2 | CDS-DR2, CDS-DR5–CDS-DR10; the IDP **complete** checkbox carries the keyboard and focus criteria (CDS-DR8) because it is the employee's only write in the section |
| NFR-7 | Epics 1, 2 | Three separate immediacy criteria: losing *maintain CDS records*; a department change moving a person to a different matrix entry; and losing S12 through a relationship change — each revalidated server-side against TD-11 |
| **Slice-level preconditions (no epic)** | — | `SEC-AUTH-01` (P0); S12 facade support (`AC-S9-S13` — see *Recorded inconsistencies* #2); `PM/AD-5` `cds` context confirmation (unregistered, SD-9); `OQ-PERM-01`; PM/AD-34 envelope; `CONFLICT-UM-01`; TD-11 |
| **Not covered in this slice** | — | The S12 **section decision** (`PLAT-E6-S6.5`, `PM-FR-3`); the directory filter **engine** (`PMC-E1`, `PM-FR-8`/`PM-FR-10`); `Department` / `UserDepartment` (`PM/AD-35`, `DEPARTMENT-EDGE`); the share-link engine (`PM-FR-27`); career-timeline events (`PM-FR-28`/`29`); CDS dashboard widgets (`PMC-E2`, **[DESIGN FREEDOM]**); IDP deadline notifications (§4.13, GOOD TO HAVE) |

## Epic List

Two epics, one per FR. They were tested against consolidation and kept separate — see the note below.

### Epic 1: The S12 Registry — Matrix Link, Assessment Log, IDP, and the S12 Wall

A People Partner or manager records completed assessments and development plans against a person; the person reads their own section and ticks their own IDP complete; the skills-matrix link resolves centrally from a dictionary so a single file update reflects on every profile pointing at it; and a colleague-tier viewer never learns the section exists.

**FRs covered:** `PM-FR-30`
**NFRs engaged:** NFR-1, NFR-2, NFR-4, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** CDS-DR1, CDS-DR3–CDS-DR11

**Audience:** Reporting line, Project line and People Partners at `RW`, holding *maintain CDS records*; **Self at `R` with exactly one write command**; Colleague at `—`. A shared link resolves `cfg`.

**Standalone:** yes **within this slice**. It is **not** standalone in the product: rendering S12 requires the `PM-FR-12` section-based profile host (`in-progress`) and an S12 facade increment that does not exist.

**Gate asymmetry — this is the epic's most useful property.** SD-2 hard-gates **only** Story 1.1 on `DEPARTMENT-EDGE`, because only the matrix key resolves against the `Department` entity. The assessment log, the IDP, and the S12 wall need no department at all. **Story 1.1 can be deferred wholesale without touching the other three**, and the epic is ordered so that it is not the first thing built.

**Risk boundary:** confidentiality, and the `canEdit` contract. S12 is `—` for Colleague, so §3.3 rule 1 extends absence to the API, exports, search results, notifications and error messages. Separately, Self is `R` yet holds exactly one write — which makes this epic **the direct test of the PM/AD-34 `data` / `canEdit` envelope**, since a naive `canEdit = (tier === 'RW')` projection is correct everywhere else in the product and wrong here.

**Boundary with `PLAT-E6-S6.5` — one wall, not two.** The S12 section decision is owned by `access-control`. Story 1.4 **verifies** it across every endpoint that names an employee; it does not define the audience rule and adds no second filtering layer inside `cds`. Where verification finds the facade's decision insufficient, that is a `PLAT-E6-S6.5` defect reported against `access-control`, never patched locally (SD-3).

**Release unit:** Stories 1.2, 1.3 and 1.4 ship together. Assessment conclusions and IDP records must not exist in a live environment before the projection that hides them from colleague-tier viewers is verified.

**Scope cap (PM/AD-10).** Only reporting-line and direct-PP audiences resolve today. **Project-line managers are entitled to S12 `RW` by §3.2 and can reach nothing**, exactly as in the risk slice. `PM-FR-30` is delivered *capped*, and no story here claims otherwise.

**Implementation notes:** `assessments` and `idps` are PM/AD-14 shape-(2) owned collections under `/users/:id/`; the skills-matrix dictionary is administrative and cross-user and is therefore **top-level, never nested under `/users`**. Section addressing uses human-readable names — there is no `/users/:id/s12`. Nothing in this epic is an `AccessJournal` event (PM/AD-29) or a `UserEvents` career-timeline event (PM/AD-30); both are asserted as explicit negatives.

### Epic 2: The Two CDS Filters on All Employees

A viewer narrows the All Employees list to people not assessed for a long time — including people never assessed at all — or to people with an open development plan, without that filter ever revealing CDS state for somebody whose CDS section they are not entitled to see.

**FRs covered:** `PM-FR-31`
**NFRs engaged:** NFR-1, NFR-2, **NFR-3**, NFR-5, NFR-6
**UX-DRs covered:** CDS-DR5, CDS-DR6, CDS-DR9, CDS-DR10, CDS-DR11

**Audience:** every viewer of All Employees, subject to the same entitlement rules as every other filter and column (§4.1).

**Standalone:** no. It is a read model over Epic 1's data and runs on the `PMC-E1` filter engine. **Depends on:** Epic 1 (Stories 1.2 and 1.3 specifically — not 1.1, which the filters never read), and `PMC-E1-S1.1` / `PMC-E1-S1.3` outside this slice.

**Risk boundary:** inference, not access — a different failure mode from Epic 1's. Epic 1 asks *may this viewer see this person's S12*. Epic 2 asks *may this viewer learn something about S12 from a row set that includes people whose S12 is `—` for them*. SD-6 answers it: **CDS filter predicates evaluate only over rows for which the viewer's S12 decision is not `—`; rows outside that set are unaffected by the predicate and their membership never changes with it.**

**This is the slice's principal leak surface, and it is one property, not three.** The filter, the saved view (`PMC-E1-S1.6`) and the XLSX export (`PMC-E1-S1.7`) are three doors onto the same predicate. Story 2.3 asserts the property across all three by **comparing result sets and counts**, not by inspecting code — a code review cannot prove a negative about a query planner.

**NFR-3 is claimed here, deliberately.** Unlike the risk dashboard, which PRD §8/SM-4 scopes out, both predicates land on the single All Employees list the NFR names. One is an aggregate — latest assessment date per person, `NULL` included — and one is a derived boolean. Story 2.1 carries the ≤2s at 500+ rows budget with permission resolution in place.

**Implementation notes:** no second filter engine, no CDS-specific list page, and no sidebar entry (CDS-DR1). *Never assessed* is a selectable value, never an empty result and never conflated with *assessed before <date>* (SD-5). *Open* is defined once — no completion date — and read from the same derivation Story 1.3 renders (SD-7).

---

**Why not one epic.** Both epics touch the same two aggregates, which invites consolidation under the file-churn rule. They are kept separate because they fail differently — Epic 1's failure is *a colleague reads a conclusion*, Epic 2's is *a viewer infers an assessment date for somebody whose section they never receive* — and because Epic 2 depends on the `PMC-E1` filter engine, which Epic 1 does not touch at all. Merging them would bind the profile registry to a capability owned by another slice.

**Why not three.** Splitting the matrix dictionary into its own epic was considered, because it is the only `DEPARTMENT-EDGE`-gated work here and it has its own administrative surface. It was rejected: it is not a separable user outcome — a matrix link with no assessment log is not a CDS section — and isolating it as **Story 1.1 within Epic 1** already buys the whole scheduling benefit without a one-story epic.

---

## Epic 1: The S12 Registry — Matrix Link, Assessment Log, IDP, and the S12 Wall

**Build order:** 1.2 → 1.3 → 1.4 as one release unit; 1.1 whenever `DEPARTMENT-EDGE` closes. Story 1.1 is listed first because it is the FR's first clause, **not** because it is scheduled first.

### Story 1.1: The skills-matrix dictionary and the resolved matrix link

**ID:** `CDS-E1-S1.1` · **Sprint key:** `1-1-skills-matrix-dictionary-and-resolved-matrix-link`

As a holder of *maintain CDS records*,
I want the skills matrix for a department and position maintained once in a dictionary and resolved onto every matching profile,
So that updating the file centrally reflects everywhere instead of being re-pasted per person.

**Gates:** **`DEPARTMENT-EDGE` (hard — no `Department` table exists, SD-2)**, `AC-S9-S13` (S12 facade), `SEC-AUTH-01`, `OQ-PERM-01`.
**Blocked by:** nothing in this slice. **Deferrable without** Stories 1.2, 1.3, 1.4.

**Acceptance Criteria:**

**Given** a dictionary entry keyed on a `Department` **entity** and a position
**When** a profile whose holder resolves to that department and position renders S12
**Then** the matrix link is resolved **at read time** through the key, and no resolved URL is ever stored on the profile (SD-2, requirements §4.10)

**Given** the dictionary entry's URL is updated centrally
**When** any profile keyed to that entry is next read
**Then** it displays the new URL, with no per-profile write and no migration — this is the requirement's stated reason for entity-keying and is asserted directly, not inferred from the schema

**Given** a person's department membership changes
**When** S12 is next requested
**Then** the matrix resolves through the new department entity on that request, server-side, and not from the TD-11 five-minute `staleTime` (NFR-7, PM/AD-25)

**Given** no dictionary entry exists for a person's (department, position)
**When** S12 renders
**Then** an explicit *no matrix configured for this department and position* state renders — never a broken link, never a blank row, and never a silent fallback to a parent department's entry (CDS-DR4, CDS-DR6, CDS-DR10)

**Given** the matrix row on S12
**When** it renders
**Then** it displays the department and position it resolved **through**, so a reader can distinguish a stale-looking link from a wrong dictionary entry (CDS-DR4)

**Given** any stored matrix URL
**When** the platform handles it
**Then** it is never fetched, parsed, validated, or mirrored, and an unreachable destination blocks no read, create, or edit (SD-1, NFR-4)

**Given** the schema of this story
**When** it is inspected
**Then** no competency, level, score, or matrix row is modelled — the matrix shape is never encoded (SD-1, requirements §4.10 opening)

**Given** the dictionary admin surface
**When** it is routed
**Then** it is a **top-level** administrative collection, never nested under `/users/:id/`, and it appears in the `Administration` sidebar group alongside roles, custom fields and departments (PM/AD-14, CDS-DR1)

**[DERIVED]** The **position** half of the key is a free-text string matched against the profile's position field, because no `Position` entity exists in the requirements or in PM/AD-35. **Consequence, stated rather than hidden: a position rename silently breaks the lookup for everyone holding it** — the exact failure the department half of the rule was written to prevent (*Recorded inconsistencies* #5). Confirmer: Product Owner + Architect. This story does not invent a `Position` entity.

**[DERIVED]** Dictionary maintenance is governed by *maintain CDS records*, not by a separate key, because §2.3 requires granular permissions to be independently grantable but names no dictionary permission. Confirmer: `access-control` (`OQ-PERM-01`).

### Story 1.2: The assessment log — date, assessor, result link, and the final conclusion

**ID:** `CDS-E1-S1.2` · **Sprint key:** `1-2-assessment-log-with-date-assessor-result-link-and-conclusion`

As a People Partner or manager holding *maintain CDS records*,
I want each completed assessment recorded with its date, its assessor, a link to the result file, and the conclusion written down in the system,
So that a person's assessment history is readable in the platform even though the assessment itself happened outside it.

**Gates:** `AC-S9-S13` (S12 facade), `SEC-AUTH-01`, `OQ-PERM-01`, `CONFLICT-UM-01`.
**Release unit:** ships with 1.3 and 1.4.

**Acceptance Criteria:**

**Given** I resolve to Reporting-line, Project-line, or People Partner access over Dana **and** hold *maintain CDS records*
**When** I record an assessment with a date, an assessor, a result-file link, and a final conclusion
**Then** it is persisted and appears in Dana's S12 assessment log

**Given** the final conclusion
**When** it is stored
**Then** it is **text entered in the system**, not a link and not a file reference — requirements §4.10 is explicit, and this is the one CDS field the platform owns rather than points at

**Given** the result-file link
**When** the platform handles it
**Then** it is a stored URL that is never fetched, parsed, or validated, and an unreachable destination blocks no create or edit (SD-1, NFR-4)

**Given** I hold S12 `RW` over Dana but **not** *maintain CDS records*
**When** I attempt to record an assessment
**Then** the response is `403` — section access alone is insufficient (§2, SD-4)

**Given** I hold *maintain CDS records* but resolve to **Colleague** tier over Dana
**When** I attempt to record an assessment for her
**Then** the response is `404` per PM/AD-24 hidden-target precedence, evaluated **before** the permission check, and nothing is persisted — **a functional role never widens access** (§2.3, SD-4)

**Given** an assessment is recorded, or a conclusion edited
**When** `UserEvents` is inspected
**Then** **no career-timeline event is written** — requirements §4.9 fixes the tracked list and it contains no CDS event (PM/AD-30). Asserted as an explicit negative because "completed assessment" is a plausible-looking timeline entry the requirements do not authorise

**Given** an assessment is recorded
**When** `AccessJournal` is inspected
**Then** **no journal event is written** — recording an assessment does not change who can see what, and the journal is not widened into a general audit log (PM/AD-29)

**Given** my *maintain CDS records* permission is revoked
**When** I attempt the next write
**Then** it is refused on that request, server-side, with no grace period and no cached grant (NFR-7, TD-11)

**Given** any fixture used to exercise this story
**When** it is inspected
**Then** every conclusion value is synthetic — a written judgement about a named person's competence is the most sensitive free text in this slice (NFR-2)

**Given** S12 has no assessments yet
**When** it renders
**Then** the *no assessments yet* empty state renders, and it reads distinctly from *no IDP yet* and from *no matrix configured* — the first two are normal, the third is a configuration gap (CDS-DR6, CDS-DR10)

**[DERIVED]** The `assessor` field is a **user reference** where the assessor is a platform user and free text otherwise, because requirements §4.10 names the field without typing it and assessments happen outside the system (SD-8). Confirmer: Product Owner.

### Story 1.3: The IDP record and the employee's own completion tick

**ID:** `CDS-E1-S1.3` · **Sprint key:** `1-3-idp-record-and-the-employee-s-own-completion-tick`

As an employee,
I want to tick my own development plan complete, and as a People Partner to create and update those plans,
So that the plan's state is maintained by the person doing the work without handing them any other write on the section.

**Gates:** `AC-S9-S13` (S12 facade), `SEC-AUTH-01`, `OQ-PERM-01`.
**Release unit:** ships with 1.2 and 1.4.

**Acceptance Criteria:**

**Given** I hold S12 `RW` over Dana **and** *maintain CDS records*
**When** I create an IDP with a short description, a deadline, and a link to the external IDP file
**Then** it is persisted with no completion date and is therefore **open** (SD-7)

**Given** Dana views her **own** S12 at `R`
**When** she ticks her own IDP complete
**Then** the completion date is recorded and displayed **alongside the deadline**, and this succeeds with **no functional permission** — the single deliberate exception to the SD-4 dual gate

**Given** Dana at S12 `R` on her own profile
**When** she attempts any other S12 write — creating an IDP, editing a conclusion, recording an assessment, editing her own IDP's description or deadline
**Then** the response is `403`. The exception is **exactly one command on exactly her own record**, not a general Self write capability

**Given** Dana resolves Self only on her own profile
**When** she attempts to tick **somebody else's** IDP complete
**Then** the response is `404` or `403` per PM/AD-24 by whether that person's S12 is visible to her at all — the own-record constraint is enforced server-side, never by hiding the checkbox

**Given** the IDP schema and route surface
**When** they are inspected
**Then** there is **no status field, no close, no cancel, and no reopen route** — *open* is derived as "has no completion date" and exists in exactly one place (SD-7)

**Given** the PM/AD-34 profile envelope for Dana's own profile
**When** S12's `canEdit` is projected
**Then** it reflects the **dual gate**, not the tier: Self is `R` yet `canEdit` is true for this one command and false for every other S12 write. A `canEdit = (tier === 'RW')` projection fails here and is correct nowhere else in the section

**Given** Dana loses S12 access through a relationship change
**When** she next requests the section
**Then** it is refused on that request (platform-owned relationship changes apply on the next request, NFR-7) and not served from the TD-11 cache

**Given** the completion checkbox
**When** it is operated
**Then** it is reachable and operable **by keyboard alone** with a visible focus ring in `{colors.ring}`, and `prefers-reduced-motion: reduce` disables all transitions — it is the employee's only write in the whole section (CDS-DR8, NFR-5)

**Given** dates rendered on S12
**When** they are styled
**Then** deadline, completion date, and assessment dates render in `{typography.data-stat}` — they are data, and the mono voice is the spine's data voice (CDS-DR5)

**[DERIVED]** A completed IDP **can** be un-ticked by a holder of *maintain CDS records* but **not** by the employee, because requirements §4.10 gives the employee "mark complete" and nothing else (SD-8). Confirmer: Product Owner.

**[DERIVED]** A person may hold **more than one** IDP; requirements §4.10 says "one record per plan" and does not bound concurrency (SD-8). Consequence: *has an open IDP* (Story 2.2) is an **any** predicate, not a single-record lookup. Confirmer: Product Owner.

### Story 1.4: The S12 wall — colleague absence and the shared-link default

**ID:** `CDS-E1-S1.4` · **Sprint key:** `1-4-verify-the-s12-wall-across-every-employee-naming-endpoint`

As the platform,
I want a colleague-tier viewer to find no trace of somebody's CDS section anywhere,
So that a written judgement about a person's competence is not reachable by the peers they work beside.

**Gates:** `AC-S9-S13` (S12 facade), `SEC-AUTH-01`, `CONFLICT-UM-01`.
**Release unit:** ships with 1.2 and 1.3, and **not after them**.

**Acceptance Criteria:**

**Given** I resolve to **Colleague** tier over Dana
**When** S12 is requested through any surface
**Then** it is absent from the **UI, the API payload, exports, search results, error messages, and notifications** — `—` is a stronger claim than "not rendered" (PM-FR-3, PM-FR-4, §3.3 rule 1)

**Given** every endpoint that accepts or returns an employee identifier
**When** the S12 negative matrix is run
**Then** it is run over a **versioned endpoint inventory** committed as this story's artifact, and **any new endpoint accepting or returning an employee identifier extends that matrix** — a sweep that passes today is stale on the next merge

**Given** the S12 section decision
**When** this slice reads it
**Then** it is consumed from `AccessControlFacade` as delivered by `PLAT-E6-S6.5`, and **no second audience rule is implemented inside `cds`**. Insufficiency in the facade's decision is a `PLAT-E6-S6.5` defect raised against `access-control`, never patched locally (SD-3)

**Given** a shared profile link
**When** its section configuration is resolved
**Then** S12 is **off by default** and requires explicit enabling per link (§4.8) — **except** on the resourcing-generated evaluation link, where it is one of the five sections enabled by default (§4.7, `RS-E1-S1.4`)

**Given** the client
**When** it handles a section the viewer may not see
**Then** it performs **no client-side hiding as a substitute for server omission** — the field is absent from the payload, not present-and-hidden (CDS-DR11, §3.3 rule 5)

**Given** Dana views her own profile
**When** S12 renders
**Then** she reads the section — Self is `R`, **not** `—`. This story's wall is about Colleague tier, and conflating the two would hide the section from the one person entitled to tick their own IDP

**Given** the facade returns `none` for S12 today (`AC-S9-S13`)
**When** this story runs before that increment lands
**Then** it fails closed — the section resolves to absent for **every** audience including Self, which is safe but is **not** evidence that the wall works. Production evidence requires the S12 increment

## Epic 2: The Two CDS Filters on All Employees

### Story 2.1: Date of last assessment, with *never assessed* as a distinct value

**ID:** `CDS-E2-S2.1` · **Sprint key:** `2-1-date-of-last-assessment-filter-with-never-assessed`

As a People Partner,
I want to find the people who have not been assessed in a long time, including the ones never assessed at all,
So that the gap I am looking for is the one the filter actually returns.

**Gates:** `AC-S9-S13`, `SEC-AUTH-01`, `CONFLICT-UM-01`.
**Depends on:** Story 1.2; `PMC-E1-S1.1` and `PMC-E1-S1.3` outside this slice.

**Acceptance Criteria:**

**Given** the All Employees filter set
**When** the last-assessment filter is opened
**Then** it offers *assessed before* a date, *assessed after* a date, and *between* two dates, with **never assessed** as a **distinct selectable option** (requirements §4.10, SD-5)

**Given** a person with no assessment records
**When** *never assessed* is selected
**Then** they are returned — a `NULL` latest-assessment date is a **value**, never an empty result and never a filter that returns nothing (SD-5)

**Given** a person with no assessment records
**When** *assessed before <date>* is selected
**Then** they are **not** silently included by a `NULL`-permissive comparison and **not** presented as if the option covered them — they are reachable only through *never assessed*, which is why it exists as a distinct option

**Given** *assessed before* is the primary case (requirements §4.10)
**When** the filter renders
**Then** it is ordered and labelled so that finding people not assessed for a long time is the path of least resistance, without removing the other three options

**Given** 500+ rows with permission resolution in place
**When** the list is filtered on latest assessment date
**Then** it returns within **2 seconds**, with the per-person latest-assessment aggregate and its `NULL` case measured as part of that budget (NFR-3 — this slice is inside the boundary PRD §8 names)

**Given** this filter
**When** it is implemented
**Then** it runs on the **`PMC-E1` filter engine** as an ordinary filter subject to the same entitlement rules as every other filter and column, with no CDS-specific list page and no second engine (§4.1, CDS-DR1)

**Given** filtered dates in the result table
**When** they render
**Then** they use `{typography.data-stat}` (CDS-DR5), and an empty result uses `.emptyst` with a direction, not a blank region (CDS-DR6)

**[DERIVED]** *between* is **inclusive of both endpoints**, because requirements §4.10 does not specify and an inclusive range is the reading a user of a date filter expects (SD-8). Confirmer: Product Owner.

### Story 2.2: Has an open IDP

**ID:** `CDS-E2-S2.2` · **Sprint key:** `2-2-has-an-open-idp-filter`

As a People Partner,
I want to filter the directory by whether somebody has an open development plan,
So that I can see who is mid-plan without opening profiles one at a time.

**Gates:** `AC-S9-S13`, `SEC-AUTH-01`, `CONFLICT-UM-01`.
**Depends on:** Story 1.3; `PMC-E1-S1.3`.

**Acceptance Criteria:**

**Given** the All Employees filter set
**When** the open-IDP filter is opened
**Then** it offers exactly **yes** and **no** (requirements §4.10)

**Given** a person holding at least one IDP with no completion date
**When** *has an open IDP — yes* is selected
**Then** they are returned; per Story 1.3's `[DERIVED]` concurrency rule this is an **any** predicate across their IDPs, not a single-record lookup

**Given** the definition of *open*
**When** this filter's predicate and Story 1.3's profile rendering are compared
**Then** they read the **same derivation** — "no completion date", in one place. **Divergence between the filter and the profile is a defect**, not a tolerable approximation (SD-7)

**Given** a person holding no IDP at all
**When** *has an open IDP — no* is selected
**Then** they are returned — "no open IDP" covers both "has none" and "all completed", and neither is lost

**Given** 500+ rows with permission resolution
**When** the list is filtered on the derived boolean
**Then** it returns within the shared NFR-3 budget measured in Story 2.1, with both predicates applied together and not only in isolation

**Given** this filter combined with a saved view (`PMC-E1-S1.6`) and an XLSX export (`PMC-E1-S1.7`)
**When** each is exercised
**Then** the predicate behaves identically in all three — they are three doors onto one filter, not three implementations

### Story 2.3: The CDS filters cannot be used to infer S12 state

**ID:** `CDS-E2-S2.3` · **Sprint key:** `2-3-cds-filter-non-inference-over-colleague-tier-rows`

As the platform,
I want a CDS filter to tell a viewer nothing about people whose CDS section they never receive,
So that the section's `—` cell is not undone by the list page that sits next to it.

**Gates:** `AC-S9-S13`, `SEC-AUTH-01`, `CONFLICT-UM-01`.
**Depends on:** Stories 2.1 and 2.2. **Paired with:** `PMC-E1-S1.8`.

**Acceptance Criteria:**

**Given** a viewer whose entitled All Employees row set contains people they hold **Colleague** tier over
**When** either CDS filter is applied
**Then** rows whose S12 decision is `—` for that viewer are **unaffected by the predicate**, and their membership in the result set **never changes** with it (SD-6)

**Given** the same viewer and the same row set
**When** the filtered and unfiltered results are compared
**Then** the property is asserted by **comparing result sets and row counts**, not by inspecting code — a code review cannot prove a negative about what a query planner returns (SD-6)

**Given** the filters' **option lists** and any count badges
**When** they are populated
**Then** they are derived only from rows the viewer's S12 decision permits, and reveal no date, no boolean, and no existence fact for anybody outside that set (CDS-DR11)

**Given** a saved view (`PMC-E1-S1.6`) and an XLSX export (`PMC-E1-S1.7`) carrying a CDS filter
**When** each is executed
**Then** the same non-inference property holds — the export is the door most easily forgotten, and the row set it writes is the one a viewer keeps

**Given** `PMC-E1-S1.8`'s custom-field non-inference property
**When** either is closed
**Then** **neither is closed independently** — they are the same property over different field sources, coexisting in one filter engine (PM/AD-32, SD-6). Closing one while the other is open leaves the channel open

**Given** requirements §3.3 rule 6, which forbids this inference channel for **custom fields**
**When** it is applied here
**Then** it binds a **section** rather than a field, which is the extension SD-6 makes explicit rather than assuming — a section carries more than a custom field does

## Story Coverage Summary

| FR | Epic | Stories | Story coverage |
|---|---|---|---|
| `PM-FR-30` | 1 | **1.1 (hard-gated)**, 1.2, 1.3, 1.4 | Matrix resolution, assessment log with in-system conclusion, IDP with the employee's single write, and the colleague wall. **Capped** by PM/AD-10 — project-line managers reach nothing. **Matrix clause gated** on `DEPARTMENT-EDGE` |
| `PM-FR-31` | 2 | 2.1, 2.2, 2.3 | Both filters, *never assessed* as a distinct value, one definition of *open*, and the non-inference property across filter, saved view and export |

**Totals:** 2 epics · 7 stories · 1 story hard-gated (1.1) · 1 release unit (1.2 + 1.3 + 1.4) · 0 stories dependent on a later story · 6 `[DERIVED]` rules awaiting confirmation.

## Step 4 Validation Results

Seven checks. **Four pass, three fail.** All three failures rest on work owned outside this slice and are recorded rather than resolved.

| Check | Result | Detail |
|---|---|---|
| 1. FR coverage | ✅ Pass, qualified | Both FRs carry ≥1 story. `PM-FR-30` is **capped** by PM/AD-10 and its matrix clause is hard-gated on `DEPARTMENT-EDGE`. No FR is epic-assigned and story-uncovered |
| 2. Architecture implementation | ❌ **FAIL** — precondition | `cds` is listed **pending confirmation** in the PM/AD-5 context map (SD-9). Per SD-9 no scaffolding story was created — architecture confirmation is not user value. **The context must be confirmed before Epic 1 enters a sprint.** Note that PM/AD-14 already fixes the routes (*Recorded inconsistencies* #4), so confirming ratifies an existing decision rather than opening one |
| 3. Story quality | ✅ Pass | 6–11 criteria per story; every story names its FR, its gates, and testable Given/When/Then criteria. Six `[DERIVED]` rules are marked with a named confirmer rather than presented as requirements (SD-8) |
| 4. Epic structure / file churn | ✅ Pass with rationale | Consolidation into one epic, and a split into three, were both considered and rejected on record. Isolating the `DEPARTMENT-EDGE` dependency into Story 1.1 buys the scheduling benefit without a one-story epic |
| 5. Dependency validation | ✅ Pass on ordering · ❌ **FAIL** on completeness | Ordering is clean: no story depends on a later story, and Epic 2 depends only on Epic 1 plus `PMC-E1` outside this slice. **Epic 1 cannot deliver COMPLETE `PM-FR-30`** while Story 1.1 is gated on `DEPARTMENT-EDGE`, and neither epic delivers its FR's full audience while PM/AD-10 lacks project-line traversal |
| 6. Placeholders and formatting | ✅ Pass | No unresolved template placeholders remain; every CDS-DR is covered by ≥1 story criterion |
| 7. UX surface existence | ❌ **FAIL** — no owner | EXPERIENCE.md maps `PM-FR-30` to **Access preview** (HR-Admin-only access inspection) and `PM-FR-31` to **no surface**. Neither of `PM-FR-30`'s two central interactions — an employee ticking their IDP, a People Partner recording a conclusion — has a designed surface. A `bmad-ux` run should precede implementation and **would change no acceptance criterion here**, since every criterion binds to normative behaviour and already-named spine components |

### Validation findings carried forward

**The S12 wall must be verified, never rebuilt.** `PLAT-E6-S6.5` owns the section decision; Story 1.4 verifies it across a versioned endpoint inventory and raises insufficiencies as `access-control` defects. Two implementations of one audience rule is how the leak gets built — each side assuming the other holds the wall.

**Stories 1.2, 1.3 and 1.4 must ship in the same release.** A window in which assessment conclusions exist without the colleague projection verified is an NFR-1 critical defect against free text describing a named person's competence.

**`canEdit` is where Self at `R` breaks the obvious implementation.** Every other section in the product projects `canEdit` from the tier. S12 does not: Self is `R` and holds exactly one write. Story 1.3 asserts this against the PM/AD-34 envelope specifically, because the naive projection passes every other section's tests.

**This slice's gate for S12 was contested between two artifacts, and is no longer.** Resolved by `access-control` on 2026-09-03 in favour of `AC-S9-S13` — the ID this slice already used. S12 is now named in that entry's `blocks:` list, `AC-SECTION-MATRIX-01` was registered for S2–S8 and S14–S16, and `platform`'s Gate binding table gained the S12 row it was missing. **Closing `AC-S9-S13` unblocks S9, S12 and S13 only** — which now includes this slice, so the reverse hazard applies: it must not be read as unblocking risk (S6), feedback (S8), action items (S14) or request history (S15).

**The matrix key is half-typed, and the untyped half is a silent failure.** The department side is an entity by explicit requirement; the position side has no entity to be (*Recorded inconsistencies* #5). Story 1.1 states the `[DERIVED]` rule and escalates rather than inventing a `Position` entity — but a position rename breaking every affected lookup is a real consequence, not a theoretical one.

**Manual testing remains required for:** the S12 endpoint enumeration, where the risk is an endpoint nobody thought to enumerate; the three empty states, which must read differently from each other and whose distinctness is a judgement; and free-text fixture content, where NFR-2 depends on human judgement rather than a schema rule.

**Automation candidates:** the per-audience negative matrix over S12; the versioned endpoint inventory as a drift check; the filter-differencing checks in Story 2.3 across filter, saved view and export; the `canEdit` projection assertion in Story 1.3; and a check that the assessment write path touches neither `UserEvents` nor `AccessJournal`.

### Open follow-ups (not stories)

Six `[DERIVED]` rules await confirmation before the stories carrying them are scheduled:

| Rule | Story | Confirmer |
|---|---|---|
| Position half of the matrix key is free text; a rename breaks the lookup | 1.1 | Product Owner + Architect |
| Dictionary maintenance is governed by *maintain CDS records* | 1.1 | `access-control` (`OQ-PERM-01`) |
| `assessor` is a user reference where possible, free text otherwise | 1.2 | Product Owner |
| A completed IDP may be un-ticked by a records holder, never by the employee | 1.3 | Product Owner |
| A person may hold more than one IDP; *open* is an **any** predicate | 1.3 | Product Owner |
| *between* is inclusive of both endpoints | 2.1 | Product Owner |

Escalations that are not `[DERIVED]` rules: the `cds` PM/AD-5 context confirmation (SD-9); and the absent UX surfaces for both of `PM-FR-30`'s central interactions. *(The S12 gate divergence between `AC-S9-S13` and `AC-SECTION-MATRIX-01` was escalated and **closed 2026-09-03** in favour of `AC-S9-S13` — see* Recorded inconsistencies *#2, #3.)*
