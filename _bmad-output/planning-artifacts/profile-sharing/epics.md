---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - _bmad-output/planning-artifacts/platform/epics.md
  - _bmad-output/planning-artifacts/resourcing/epics.md
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md
  - docs/architecture/api-conventions.md
status: draft
slice: profile-sharing
id_namespace: PSH-E{epic}-S{story}
updated: 2026-09-03
---

# People Management — Profile Sharing — Epic Breakdown

## Overview

This document is a **new bounded-context slice** decomposing exactly **one canonical PRD requirement**: authenticated named-recipient profile sharing (`PM-FR-27`).

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) **§4.9 FR-27** and [docs/project-requirements.md](../../../docs/project-requirements.md) **§4.8**, with §3.2 (Shared link column), §3.4 (journal), §2.4 (full profile access) and §4.7 (resourcing evaluation links) binding.

**Why this slice exists.** `PM-FR-27` was the only requirement in the coverage model that was **epic-referenced and deliberately uncovered**. Its note states the reason precisely: `PLAT-E7-S7.1` / `S7.2` deliver the access-control §3.2 *Shared-link section-policy port* — which sections a link may expose — and that work is counted under `PM-FR-3` because the Shared-link column is a section-matrix column. Platform SD-5 says it outright: **a port is not the capability.** The capability itself — link creation, recipient authentication, the expiry clock, the revocation path, link storage, and journaling — had no owning slice, and `resourcing/epics.md` assigned it to a *"future profile-sharing context"* that did not exist. This is that context.

**Architecture authority:** [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md) — `ratified-with-transition-debt`. Design ratification is **not** implementation evidence. Nothing in this slice exists today.

**Blocker authority:** [blockers.yaml](../architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml).

### Cross-context boundaries

| Context | Responsibility in this slice |
|---|---|
| `profile-sharing` | The `SharedLink` record, its recipient binding, its expiry clock, its revocation path, and the open-a-link read route. **Pending PM/AD-5 confirmation** — see SD-9 |
| `access-control` | The §3.2 Shared-link **section policy** (`PLAT-E7-S7.1`, `S7.2`) and the `AccessJournal` (`PM/AD-29`, `CC-07`). This slice **consumes** both and re-derives neither |
| `user-management` | Profile assembly and the `data` / `canEdit` envelope the shared view renders through (PM/AD-34) |
| `resourcing` | `RS-E1-S1.4` — the request-bound evaluation link. A **consumer of this engine**, not a second engine (SD-7) |
| Every section-owning slice | `cds` (S12), `risk` (S6), `feedback` (S8), `mentorship` (S13, never-share) supply section content; none of them decides shareability |

### Identifier namespace

Stories in this slice use **`PSH-E{epic}-S{story}`**.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers (PRD §0.2) and are **never** reassigned by this slice. No story here claims one.

> **REGISTRATION:** `PSH-E*` is registered in `global-fr-epic-story-coverage.yaml` `namespace_rules` and `source_slices` as part of this run, and PRD §0.2 gains a Profile Sharing row. `PM-FR-27` moves `uncovered` → `specified`.

**Out of scope for this slice:** the §3.2 Shared-link **section policy** (`PLAT-E7-S7.1`/`S7.2`, `PM-FR-3`); the `AccessJournal` table and its enrolment contract (`CC-07`, `access-control`); the **full profile access** grant lifecycle (`PM-FR-39`, **deferred** — see *Recorded inconsistencies* #3); profile assembly (`user-management`, PM/AD-34); the resourcing request lifecycle that triggers an auto-generated link (`RS-E1`); section **content** for any shared section.

### Scope decisions (product owner, 2026-09-03)

Nine decisions. They bind epic and story design and are not re-opened downstream without a new decision.

- **SD-1 — The section policy is consumed, never recomputed.** `PLAT-E7-S7.1` returns the set of sections a given link may expose; `S7.2` enforces the never-share set and per-link re-enablement. This slice calls that port and applies its result. It builds **no second section matrix**, and where the port's decision proves insufficient that is a `PLAT-E7` defect raised against `access-control`, never patched locally. Two implementations of one matrix is how a shared link becomes a standing bypass.
- **SD-2 — A link is an authorization artifact, never a document.** No profile content is snapshotted, copied, cached, or frozen at creation. Every view re-resolves the subject's live data through the same assembly path the normal profile route uses. A snapshot would survive revocation, survive the creator losing access, and survive a section being switched off — defeating every lifecycle rule in §4.8 at once.
- **SD-3 — Revocation rights follow the relationship, not the creator** *(requirements §4.8, normative)*. Whoever **currently** holds Manager or People Partner access over the subject can revoke any link to that profile and see who opened it. The creator keeps nothing once their own access ends. **There must never be a link nobody can revoke** — which is why full-profile holders are named as the backstop, and why *Recorded inconsistencies* #3 matters.
- **SD-4 — Two lifetimes, one mechanism.** Default expiry is 24 hours and is configurable at creation; resourcing-generated links live until the request is decided (§4.7, §4.8). These are **two configurations of one `SharedLink`**, not two link types and not two tables. A request-bound link is one whose expiry is bound to a request outcome rather than a clock.
- **SD-5 — There is no anonymous mode, and none is ever added.** The recipient is named at creation and authenticated at open. "Anyone with the link" is not a degraded mode, a fallback, or a future option — requirements §4.8 marks the whole clause `[NORMATIVE]`. A story that would make the recipient optional is a defect, not a variant.
- **SD-6 — Creator liveness is verified, not re-implemented.** `PLAT-E7-S7.1` already evaluates creator liveness per request and yields no sections when the qualifying relationship has ended. This slice's story **asserts that end to end through the link route** and adds no second liveness check inside `profile-sharing`.
- **SD-7 — `RS-E1-S1.4` is a consumer, not a variant.** The resourcing evaluation link is this engine invoked with a preconfigured section set and a request-bound lifetime. Resourcing does not create links of its own kind, and this slice does not special-case resourcing anywhere except in accepting a request-bound expiry (SD-4).
- **SD-8 — Derived rules are marked, not smuggled.** Where the requirements and PRD are silent on a case a story must decide (whether a link may be re-configured after creation, whether a recipient may be changed, how many live links one subject may carry, what the configurable expiry's upper bound is), the story states the chosen rule inline and marks it `[DERIVED]`. Every `[DERIVED]` rule is a Product Owner confirmation item, listed in *Open follow-ups*.
- **SD-9 — `profile-sharing` bounded-context confirmation is a slice precondition, not a story.** PM/AD-5's context map has no `profile-sharing` context; `resourcing/epics.md` refers to a "future profile-sharing context" as an assumption. The context must be confirmed before Epic 1 enters a sprint. **No scaffolding story is created for it** — architecture confirmation is not user value.

### Slice-level preconditions

Not deliverables of any epic here. Every epic consumes them, so they are stated once, and no story below may reach production evidence while any of them is open.

| Precondition | Severity / status | Why it precedes every epic |
|---|---|---|
| `SEC-AUTH-01` | **P0 open** | A share link is the one path that grants profile access **outside** the relationship graph. While the production session resolver still provisions a privileged account on demand, "the authenticated named recipient" is not a trustworthy claim |
| `CC-07` | **P0 open** | No `AccessJournal` table exists. §4.8 makes journaling every link access normative, so this is a **release blocker for the whole slice**, not one story's gate — see SD-6 in *Validation findings* |
| `PLAT-E7-S7.1`, `S7.2` | `specified`, not built | The section policy this slice consumes. Without it there is no answer to "which sections may this link expose" |
| `AC-S9-S13` · `AC-SECTION-MATRIX-01` | **P1 open** (both) | Every section a link exposes beyond S1 needs its facade increment. The facade returns `none` for all but S1/S10/S11 |
| `PM-FR-39` full-profile grant lifecycle | **deferred, no stories** | The named backstop revoker class has no grant or revocation path — *Recorded inconsistencies* #3 |
| `OQ-PERM-01` | P1 open | No approved default assignment matrix. **Do not seed or infer grants** |
| `CONFLICT-UM-01` | P1 open (implementation stale) | PM/AD-24's hidden-target `404` rule binds the link route, which must not become an existence oracle for profiles the recipient cannot otherwise see |
| PM/AD-34 envelope | design ratified; implementation partial | The shared view renders through the same envelope; whole-row serialization would leak sections the link never enabled |

### Recorded inconsistencies in the input set

Findings, not stories. Each was verified against the cited file.

1. **S5 is simultaneously default-on and explicitly-re-enable-only.** §4.8 lists S5 among the sensitive sections that *"must be re-enabled **explicitly on every link**"*, while §4.7 makes S5 (limited to CV and certificates) one of the five sections **enabled by default** on the resourcing-generated evaluation link — as `RS-E1-S1.4` implements. One section, two normative rules that cannot both hold on the same link. **Disposition: recorded and escalated, not resolved here.** Story 1.2 implements §4.8's rule for creator-made links and defers the resourcing default set to `RS-E1-S1.4` as that story already specifies it, so neither rule is silently rewritten.
2. **`PM-FR-27` has no UX surface at all.** EXPERIENCE.md maps it to **"— No surface"** and lists it among the requirements with none. Neither link creation, nor the section picker, nor the revocation list, nor the shared view itself has a designed surface. Stories therefore bind to normative behaviour only and invent no chrome.
3. **The named backstop revoker has no lifecycle.** §4.8 makes holders of full profile access (§2.4) the backstop who guarantee *"there must never be a link nobody can revoke"*. But `PM-FR-39` — the full-profile grant lifecycle — is **`deferred` with no stories and no owner**, and platform SD-6 confirms `PLAT-E7-S7.3` creates no grant, revoke, or seed path. **The backstop class exists in the requirements and nowhere else.** Story 2.3 therefore delivers the relationship-derived revocation path in full and records the backstop as unreachable, rather than asserting a guarantee the platform cannot keep.
4. **The journal that §4.8 makes normative cannot be written.** *"Every access via a link is journaled per 3.4"* is unconditional, and PM/AD-29 fixes the kind as `shared_link_access`. `CC-07` is **P0 open** with no table. `PLAT-E7-S7.1` already records that it cannot produce closure evidence for enrolment. This slice inherits that gap and treats it as a release constraint (SD-6 in *Validation findings*).
5. **The route shape is already owned — and this slice initially missed it.** `share-links` is named explicitly in **AD-14**'s top-level cross-user list (*"`action-items`, `campaigns`, `resourcing/requests`, `share-links`, `mentorship-pairs`"*) and twice in `docs/architecture/api-conventions.md`, including *"authenticated recipient-bound share consumption"*. There is no `[DERIVED]` rule to make and no conventions row owed. Recorded because the first draft of this slice treated the shape as unowned, which would have re-decided a settled decision — the exact drift AD-14 exists to prevent.

## Requirements Inventory

### Functional Requirements

Exactly 1, verbatim-sourced from PRD §4.9 and requirements §4.8.

- **PM-FR-27** *[PRD §4.9 FR-27 / requirements §4.8]*: A manager generates a shareable view of an employee's profile for somebody who does not hold Manager or People Partner access over that person.
  - **Links are not anonymous [NORMATIVE]** — a link works only for an **authenticated** user, and the **recipient is explicitly named at creation**. There is no "anyone with the link" mode.
  - **Sections:** every `cfg` section is **off by default** and only **S1** is on by default; **S2, S5, S6, S8** must be re-enabled **explicitly on every link**; the **never-share set is {S3, S7, S13, S14}** and cannot be included under any configuration; **S9** is shareable but off by default, governed by the matrix alone.
  - **Lifecycle:** default expiry **24 hours**, configurable at creation; resourcing links live until the request is decided; the **creator's own access is re-checked on every view** and the link stops working immediately when that relationship ends — no background job; a recipient losing access mid-task is **intended**.
  - **Control:** revocation and journal rights follow the **relationship, not the creator**; full-profile holders are the backstop; **a shared link never grants write access**; **every access is journaled** per §3.4.

### NonFunctional Requirements

From PRD §8, filtered to what binds this slice.

- **NFR-1** *[PRD §8 NFR-1]*: Access-control correctness is the primary quality attribute; a leak in any section, API surface, export, search result, or notification path is a **critical defect**. This slice is an **access-granting** capability — it is where a leak is created rather than merely permitted.
- **NFR-2** *[PRD §8 NFR-2]*: Seeded test population only. Shared views render whole profile sections, so a fixture leak here exposes more than a single field.
- **NFR-4** *[PRD §8 NFR-4]*: External integration failure degrades gracefully. **Not engaged** — nothing here is externally sourced.
- **NFR-5, NFR-6** *[PRD §8 NFR-5, NFR-6]*: Responsive layout, accessibility, English UI for the surfaces this slice introduces.
- **NFR-7** *[PRD §8 NFR-7]*: Functional-permission revocation is **immediate**; platform-owned relationship changes apply on the **next request**. §4.8's creator-liveness rule is a *stricter* statement of the same principle — the link dies on the next view, not at expiry, and Story 2.2 asserts it server-side rather than from the TD-11 five-minute `staleTime`.

### Additional Requirements

**Architecture (binding)**

- **PM/AD-5 — Bounded-context map:** has **no** `profile-sharing` context. Confirmation is a slice precondition (SD-9).
- **PM/AD-14 — Router tree** *(ratified; implementation absent)*: **`share-links` is already named** in the top-level cross-user shape-2 list, alongside `action-items`, `campaigns`, `resourcing/requests` and `mentorship-pairs`. `api-conventions.md` additionally names *"authenticated recipient-bound share consumption"*. The route shape is settled and this slice consumes it rather than choosing one (*Recorded inconsistencies* #5).
- **PM/AD-28 / CC-05 — Full-profile overlay** *(design closed)*: the overlay is read-only and `max(Self, overlay)` with `write > read > none`. Relevant only because §2.4 holders are the revocation backstop; this slice creates no overlay path.
- **PM/AD-29 — `AccessJournal`** *(design ratified; no table — `CC-07` P0 open)*: shared-link access is kind `shared_link_access`, enrolled **in the same transaction** as the access it records.
- **PM/AD-34 / ARCH-ENV-01 — Profile assembly + envelope** *(design ratified; implementation partial)*: the shared view renders through the `user-management` envelope after AccessControl section decisions. `canEdit` is **always false** on this path (§4.8: a shared link never grants write).
- **PM/AD-24 — HTTP denial oracle:** `401` invalid or inactive session; `404` missing **or hidden-existence** target; `403` visible resource with a forbidden feature or action. Binds the link route directly — see Story 1.3.
- **PM/AD-25 — Frontend authorization and cache contract** *(transition debt TD-11)*: named in Story 2.2's immediacy criterion.
- **PM/AD-10 — Live audience and section resolution** *(design partial; implementation partial)*: only Reporting line and direct People Partner audiences exist. Project-line managers therefore cannot create links today — a real coverage cap on Epic 1, not a story.

**Fixed product facts (not re-decided here)**

- The never-share set is **{S3, S7, S13, S14}** and is closed. No configuration, role, permission, or link type opens it.
- Only **S1** is on by default; every other `cfg` section is off until deliberately selected.
- **S9** is shareable, off by default, and governed by the matrix alone — no other part of the platform may open or close it independently.
- A shared link **never** grants write access, regardless of the recipient's own audiences or the creator's permissions.
- A recipient losing access mid-task is **intended behaviour**, not a defect to soften.

### UX Design Requirements

**None mapped.** EXPERIENCE.md records `PM-FR-27` → *"— No surface"* (*Recorded inconsistencies* #2). What binds is the spine's cross-surface contract, referenced by token name only; values live in [DESIGN.md](../ux-designs/ux-people-management-2026-09-02/DESIGN.md).

- **PSH-DR1**: The shared view is the **existing profile layout with sections omitted** — not a second profile renderer. A separate read-only template would drift from the real profile and become a second place where section visibility is decided.
- **PSH-DR2**: Any new page carries the page header band `.pghd` (`{components.page-header-band}`) with a mono eyebrow in `{typography.page-eyebrow}` formatted `AREA / SCREEN`, title in `{typography.page-title}`, and a `{spacing.pghd-accent-width}` accent tick in `{colors.stretch-blue}`. `{colors.stretch-amber}` and `{colors.stretch-violet}` carry reserved meanings and must not be used decoratively.
- **PSH-DR3**: The shared view carries a `.prov` provenance tag (`{components.provenance-tag}`) in the **`ACCESS` variant** (`.prov.access`) stating that it is a shared view with a named recipient and an expiry — the reader must never mistake it for the full profile. Text label, never colour-only, never tooltip-only.
- **PSH-DR4** *(specific to this slice)*: **the section picker states what it cannot offer.** Never-share sections are absent from the picker rather than shown disabled — a greyed S13 row tells the creator that a mentorship section exists for that person, which is itself a disclosure. Sections the creator's own access does not reach are absent for the same reason.
- **PSH-DR5**: Expiry, creation date and last-access timestamps render in `{typography.data-stat}` (Geist Mono) — the spine's data voice.
- **PSH-DR6**: Empty conditions use `.emptyst` (`{components.empty-state}`). Three distinct empties exist and must read differently: **no links on this profile**, **this link has never been opened**, and **this link is no longer valid** — the third is not an error state and must not read as one.
- **PSH-DR7**: Loading uses a shadcn `Skeleton` matching the target layout, not a spinner.
- **PSH-DR8**: **WCAG 2.2 AA.** The section picker is a multi-select whose every control is keyboard-operable with a visible focus ring in `{colors.ring}`; `prefers-reduced-motion: reduce` disables all transitions.
- **PSH-DR9**: Responsive per the spine: `≥lg` full sidebar and multi-column; `md` icons and 2-column; `<md` sidebar becomes a `Sheet` and tables scroll horizontally.
- **PSH-DR10**: Microcopy is **direct and permission-literate**. An expired or revoked link says so plainly and does not imply the profile does not exist, does not invite a retry, and does not offer a request-access path this slice never built.
- **PSH-DR11**: **Banned, and testable as negatives**: client-side section hiding as a substitute for server omission; any "copy link" affordance that implies transferability; an expiry presented as a suggestion; a snapshot or print view that outlives the link (SD-2).

> **UX coverage gap recorded, not resolved.** No surface exists for any part of this FR. A `bmad-ux` run should precede implementation, and would change no acceptance criterion here.

### FR Coverage Map

| Requirement | Epic | Delivered outcome |
|---|---|---|
| `PM-FR-27` — Authenticated named-recipient profile sharing | **Epic 1** — `PSH-E1-S1.1`, `S1.2`, `S1.3` · **Epic 2** — `S2.1`, `S2.2`, `S2.3`, **`S2.4` (hard-gated)** | A manager shares a bounded, read-only view of a profile with one named authenticated person; the view carries only the sections deliberately enabled; and the link dies the moment the relationship that authorised it does. **Journaling is hard-gated on `CC-07`** and, because §4.8 makes it normative, the slice cannot reach production without it |
| NFR-1 | Epics 1, 2 | Per-section negative checks over the shared-view payload, plus the never-share set asserted as unreachable by **any** configuration |
| NFR-2 | Epics 1, 2 | Synthetic fixtures by construction — a shared view renders whole sections |
| NFR-5, NFR-6 | Epics 1, 2 | PSH-DR2–PSH-DR11; the section picker carries the accessibility criteria (PSH-DR8) |
| NFR-7 | Epic 2 | Creator-liveness and revocation both revalidated server-side against TD-11 |
| **NFR-3** | — | **Not claimed.** PRD §8/SM-4 scopes it to the All Employees list; nothing here is a 500-row surface |
| **NFR-4** | — | **Not engaged.** No external integration |
| **Slice-level preconditions (no epic)** | — | `SEC-AUTH-01`; `CC-07`; `PLAT-E7-S7.1`/`S7.2`; `AC-S9-S13` + `AC-SECTION-MATRIX-01`; `PM-FR-39` backstop (deferred); `OQ-PERM-01`; `CONFLICT-UM-01`; PM/AD-34 |
| **Not covered in this slice** | — | The §3.2 section policy (`PLAT-E7`, `PM-FR-3`); the `AccessJournal` table (`CC-07`); the full-profile grant lifecycle (`PM-FR-39`, deferred); the resourcing request lifecycle (`RS-E1`); section content for any shared section |

## Epic List

Two epics, split by failure mode rather than by CRUD. They were tested against consolidation — see the note below.

### Epic 1: The Shared Link — Creation, Section Configuration, and the Named-Recipient Read

A manager creates a link to somebody's profile naming exactly one authenticated recipient, chooses which sections it exposes from those the matrix permits, and that recipient — and nobody else — opens a read-only view containing exactly those sections.

**FRs covered:** `PM-FR-27` (creation and read clauses)
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6
**UX-DRs covered:** PSH-DR1–PSH-DR4, PSH-DR6–PSH-DR11

**Audience:** creators are holders of Manager or People Partner access over the subject; recipients are any authenticated active user named on a link. **The subject is not an audience of their own link** — §4.8 says nothing about the subject seeing links about them, and this slice does not invent that surface.

**Standalone:** yes **within this slice**, and it is the half that `RS-E1-S1.4` actually needs. It is **not** standalone in the product: it requires the `PLAT-E7` port for any section beyond S1, and profile assembly from `user-management`.

**Risk boundary:** this epic **creates access that the relationship graph does not imply**. Every other slice's risk is *may this viewer see this section*; here the answer is manufactured by a manager and must be bounded at creation and re-bounded at every read. The never-share set is the hard floor and Story 1.2 asserts it as unreachable by construction, not merely unselected.

**Scope cap (PM/AD-10):** only reporting-line and direct-PP audiences resolve today, so **project-line managers cannot create links** even though they are the §4.8 archetype ("*typically a DM evaluating a proposed candidate*"). `PM-FR-27` is delivered *capped* and no story claims otherwise.

**Implementation notes:** `share-links` is the top-level shape-2 collection AD-14 already fixed — never nested under `/users/:id`, because a link is not a property of the subject alone. No profile content is stored on the link (SD-2).

### Epic 2: Lifetime and Control — Expiry, Creator Liveness, Revocation, and the Journal

A link stops working when it should — at its expiry, the moment the creator's authority ends, or when anyone currently responsible for the subject revokes it — and every time it is opened, that access is recorded.

**FRs covered:** `PM-FR-27` (lifecycle and control clauses)
**NFRs engaged:** NFR-1, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** PSH-DR5, PSH-DR6, PSH-DR10, PSH-DR11

**Audience:** creators; **whoever currently holds** Manager or People Partner access over the subject (SD-3); full-profile holders as the nominal backstop.

**Standalone:** no. It governs Epic 1's links. **Depends on:** Epic 1.

**Risk boundary:** persistence of access past its authority — the opposite failure from Epic 1's. Epic 1 asks *what may this link expose*; Epic 2 asks *should this link still work at all*, and answers it on **every single view**, because §4.8 forbids a background job as the mechanism.

**Why the journal is not optional.** §4.8's *"Every access via a link is journaled per §3.4"* is unconditional, and §3.4 lists shared-link access among the six events that define the journal's entire scope. `CC-07` is P0 with no table. Story 2.4 is therefore **hard-gated and inside the release unit**: links must not exist in a live environment before their access journal does, because the journal is the only record that a person outside the relationship graph read a profile.

**Implementation notes:** one `SharedLink` with two expiry configurations, not two types (SD-4). Creator liveness is verified through the `PLAT-E7` port, not re-implemented (SD-6). Revocation authority is resolved live from the current relationship graph, never copied onto the link row at creation — a stored revoker list is how a link outlives everyone entitled to kill it.

---

**Why not one epic.** Both epics touch the same `SharedLink` row, which invites consolidation under the file-churn rule. They are kept separate because they fail differently — Epic 1's failure is *a link exposes a section it should not*, Epic 2's is *a link keeps working after its authority ended* — and because Epic 1 alone unblocks `RS-E1-S1.4`, which is waiting on link creation and not on the revocation surface. Merging them would bind the auto-generated evaluation link to `CC-07`, a P0 with no table and no owning story.

**Why not three.** Splitting the journal into its own epic was rejected: it is not a separable user outcome, and separating it would permit a sprint in which shared links exist before the record of who used them.

---

## Epic 1: The Shared Link — Creation, Section Configuration, and the Named-Recipient Read

**Build order:** 1.1 → 1.2 → 1.3. Story 1.3 is the first point at which any profile data leaves through a link, so it must not precede 1.2.

### Story 1.1: Create a link for one named, authenticated recipient

**ID:** `PSH-E1-S1.1` · **Sprint key:** `1-1-create-a-link-for-one-named-authenticated-recipient`

As a manager or People Partner,
I want to create a share link to somebody's profile naming exactly who may open it,
So that a person outside that employee's management line can review them without being granted standing access.

**Gates:** `SEC-AUTH-01`, `OQ-PERM-01`, `CONFLICT-UM-01`, `PLAT-E7-S7.1` (section policy port).

**Acceptance Criteria:**

**Given** I resolve to Reporting-line or People Partner access over Eve
**When** I create a share link naming Frank as recipient
**Then** the link is persisted with me as creator, Eve as subject, and **Frank as the sole recipient**

**Given** link creation
**When** the request is validated
**Then** a recipient is **mandatory** — there is no request shape that produces a link without one, no `null` recipient, and no "anyone with the link" flag anywhere in the schema, the API, or the UI (SD-5, §4.8 `[NORMATIVE]`)

**Given** I resolve to **Colleague** tier over Eve
**When** I attempt to create a link to her profile
**Then** the response is `404` per PM/AD-24 hidden-target precedence, evaluated **before** any permission check, and nothing is persisted — a link cannot be created by somebody who could not read the profile themselves

**Given** a named recipient who is not an active user
**When** the link is created
**Then** creation is refused — a link naming somebody who cannot authenticate is a link nobody can open, and creating it silently would look like sharing succeeded

**Given** the created link
**When** its stored representation is inspected
**Then** it holds **no profile content** — no section snapshot, no cached values, no rendered document (SD-2). It holds the subject, the creator, the recipient, the enabled-section configuration, and the expiry

**Given** the link resource
**When** it is routed
**Then** it is the **top-level `share-links` collection** already fixed by AD-14 and `api-conventions.md` — shape 2, cross-user, never nested under `/users/:id`, and not a route this slice gets to choose

**Given** any fixture used to exercise this story
**When** it is inspected
**Then** every subject, creator and recipient is synthetic — a shared view renders whole profile sections, so a fixture leak here is wider than a single field (NFR-2)

**[DERIVED]** The **recipient cannot be changed** after creation, and neither can the subject. Re-pointing a live link at a different person would silently transfer an access grant that was journaled against the original pair. Changing the **section configuration** or the **expiry** of a live link is permitted to anyone who could revoke it (SD-3). Confirmer: Product Owner.

**[DERIVED]** A subject may carry **any number** of concurrent live links; requirements §4.8 sets no bound, and the revocation surface (Story 2.3) is what makes many links manageable. Confirmer: Product Owner.

### Story 1.2: Configure which sections the link exposes

**ID:** `PSH-E1-S1.2` · **Sprint key:** `1-2-configure-which-sections-the-link-exposes`

As a link creator,
I want to choose deliberately which parts of the profile the recipient will see,
So that an evaluation link carries what the reviewer needs and nothing else.

**Gates:** `PLAT-E7-S7.1`, `PLAT-E7-S7.2`, `AC-S9-S13`, `AC-SECTION-MATRIX-01`, `SEC-AUTH-01`.
**Dependency:** Story 1.1.

**Acceptance Criteria:**

**Given** a newly created link with no explicit configuration
**When** its exposed sections resolve
**Then** the set is **S1 alone** — every `cfg` section is off by default (§4.8, `PLAT-E7-S7.1`)

**Given** any configuration a creator, an API client, or a crafted request can submit
**When** it names **S3, S7, S13, or S14**
**Then** the section is not exposed — the never-share set is unreachable **by construction**, not merely absent from the picker, and the assertion is made against the resolved payload rather than the request validator (§4.8)

**Given** the sensitive sections **S2, S5, S6, S8**
**When** a link is created or re-configured
**Then** each must be enabled **explicitly on that link**, and no prior link, template, default, or copied configuration carries the enablement forward (§4.8)

**Given** **S9**, the career timeline
**When** its shareability resolves
**Then** it is shareable and **off by default**, and the matrix is the only thing that governs it — no permission, role, or link setting opens or closes it independently (§4.8)

**Given** the section policy
**When** this slice applies it
**Then** it is the result of `PLAT-E7-S7.1` / `S7.2` and **no section entitlement is computed inside `profile-sharing`** (SD-1). Where the port's decision proves insufficient, that is a `PLAT-E7` defect raised against `access-control`

**Given** a creator whose own access does not reach a section
**When** the picker renders
**Then** that section is **absent**, not disabled — a greyed row discloses that the section has content for that person (PSH-DR4)

**Given** a never-share section
**When** the picker renders
**Then** it is likewise **absent** rather than shown as forbidden (PSH-DR4)

**Given** the section picker
**When** it is operated
**Then** every control is reachable and operable by keyboard alone with a visible focus ring in `{colors.ring}`, and `prefers-reduced-motion: reduce` disables all transitions (PSH-DR8, NFR-5)

**Given** *Recorded inconsistencies* #1 — S5 is both an explicit-re-enable section (§4.8) and a resourcing default-on section (§4.7)
**When** this story is implemented
**Then** it applies **§4.8's rule for creator-made links** and does not implement the resourcing default set, which `RS-E1-S1.4` already specifies. The contradiction is escalated, not resolved by either story silently

### Story 1.3: Open a link as the named recipient

**ID:** `PSH-E1-S1.3` · **Sprint key:** `1-3-open-a-link-as-the-named-recipient`

As the named recipient,
I want to open the link and read exactly the sections it carries,
So that I can evaluate somebody I have no standing access to, without gaining any other access to them.

**Gates:** `PLAT-E7-S7.1`, `SEC-AUTH-01`, `CONFLICT-UM-01`, PM/AD-34 envelope.
**Dependency:** Stories 1.1, 1.2. **Waiting consumer:** `RS-E1-S1.4`.

**Acceptance Criteria:**

**Given** I am Frank, the named recipient, authenticated and active
**When** I open the link
**Then** I read a view containing **exactly** the sections the link enables, assembled through the PM/AD-34 envelope

**Given** an **unauthenticated** caller
**When** the link is opened
**Then** the response is `401` — there is no anonymous read path (§4.8 `[NORMATIVE]`, PM/AD-24)

**Given** an authenticated user who is **not** the named recipient
**When** they open the link
**Then** the response is `404`, not `403` — a `403` would confirm that a link to that person exists, and hidden-existence precedence binds this route as it binds every other (PM/AD-24, `CONFLICT-UM-01`)

**Given** the shared view
**When** `canEdit` is projected anywhere in the payload
**Then** it is **false for every section**, regardless of the recipient's own relationship-derived audiences or the creator's permissions — a shared link never grants write (§4.8)

**Given** a recipient who **independently** holds Reporting line over the subject
**When** they open the link versus the normal profile route
**Then** the two decisions stay separate: their own audiences are not merged into the link result, and the link neither widens nor narrows what the profile route gives them (`PLAT-E7-S7.1`)

**Given** a section the link does not enable
**When** the shared-view payload is inspected
**Then** the section is **absent from the payload**, not present-and-hidden — no client-side omission substitutes for server omission (PSH-DR11, §3.3 rule 5)

**Given** the shared view
**When** it renders
**Then** it is the **existing profile layout with sections omitted**, carrying a `.prov.access` provenance tag stating it is a shared view with a named recipient and an expiry (PSH-DR1, PSH-DR3)

**Given** the subject's live data changes between two views of the same link
**When** the link is opened the second time
**Then** the current data is rendered — the link resolves live and holds no snapshot (SD-2)

## Epic 2: Lifetime and Control — Expiry, Creator Liveness, Revocation, and the Journal

**Release unit:** Stories 2.2 and 2.4 ship with Epic 1. A link that outlives its creator's authority, or that is opened without a record, must not exist in a live environment.

### Story 2.1: The expiry clock

**ID:** `PSH-E2-S2.1` · **Sprint key:** `2-1-the-expiry-clock-default-24h-and-request-bound`

As a link creator,
I want the link to stop working on its own,
So that a review window does not quietly become permanent access.

**Gates:** `SEC-AUTH-01`.
**Dependency:** Story 1.1.

**Acceptance Criteria:**

**Given** a link created with no explicit expiry
**When** it is persisted
**Then** its expiry is **24 hours** from creation (§4.8)

**Given** a creator setting an expiry at creation
**When** the link is persisted
**Then** the configured value is used — expiry is configurable at creation (§4.8)

**Given** a link whose expiry has passed
**When** the named recipient opens it
**Then** it does not work, and the response carries no profile data — expiry is evaluated **per request**, never by a sweeper that might not have run

**Given** a resourcing-generated link (`RS-E1-S1.4`)
**When** its lifetime resolves
**Then** it lives **until the request is decided** rather than on a clock — the same `SharedLink` with a request-bound expiry, not a second link type (SD-4, SD-7)

**Given** an expired link
**When** the recipient sees the result
**Then** the copy states plainly that the link is no longer valid, does not imply the profile does not exist, does not invite a retry, and offers no request-access path this slice never built (PSH-DR10, PSH-DR6)

**Given** expiry and creation timestamps
**When** they render
**Then** they use `{typography.data-stat}` (PSH-DR5)

**[DERIVED]** The configurable expiry has **no upper bound** in requirements §4.8, and none is invented here. The creator-liveness rule (Story 2.2) is the real bound — a long expiry cannot outlive the relationship that authorised it. Confirmer: Product Owner. **Recorded risk:** without a cap, a long-lived link plus a long-lived relationship is a standing grant that no rule in §4.8 forbids.

### Story 2.2: Creator liveness re-checked on every view

**ID:** `PSH-E2-S2.2` · **Sprint key:** `2-2-creator-liveness-re-checked-on-every-view`

As the platform,
I want a link to die the moment the relationship that authorised it ends,
So that access granted on somebody's authority does not survive that authority.

**Gates:** `PLAT-E7-S7.1`, `SEC-AUTH-01`, `AC-S9-S13`, `AC-SECTION-MATRIX-01`.
**Dependency:** Story 1.3. **Release unit:** ships with Epic 1.

**Acceptance Criteria:**

**Given** a live link whose creator's qualifying relationship to the subject has ended
**When** the named recipient opens it
**Then** it yields nothing **on that request** — the link dies immediately rather than at its expiry, with **no background job and no cleanup task** (§4.8)

**Given** creator liveness
**When** it is evaluated
**Then** it is resolved through `PLAT-E7-S7.1` per request and **never cached across requests**, and `profile-sharing` implements no second liveness check of its own (SD-6, SD-1)

**Given** a recipient who is mid-review when the creator's relationship ends
**When** they make their next request
**Then** access stops — **this is intended behaviour, not a defect** (§4.8), and no grace period, warning window, or in-flight exemption is added

**Given** the frontend
**When** liveness is enforced
**Then** it is revalidated **server-side** and never satisfied from the TD-11 five-minute `staleTime` (NFR-7, PM/AD-25)

**Given** an inactive subject, an inactive creator, or an inactive recipient
**When** the link is opened
**Then** it yields nothing (`PLAT-E7-S7.1`)

### Story 2.3: Revocation and access visibility follow the relationship

**ID:** `PSH-E2-S2.3` · **Sprint key:** `2-3-revocation-and-access-visibility-follow-the-relationship`

As whoever is currently responsible for this employee,
I want to revoke any link to their profile and see who opened it,
So that responsibility for their data sits with whoever holds it now, not with whoever happened to create a link.

**Gates:** `SEC-AUTH-01`, `OQ-PERM-01`, `CONFLICT-UM-01`.
**Dependency:** Story 1.1.

**Acceptance Criteria:**

**Given** I **currently** hold Manager or People Partner access over Eve
**When** I list links to Eve's profile
**Then** I see every live link regardless of who created it, and I can revoke any of them (§4.8, SD-3)

**Given** a creator whose own access to the subject has ended
**When** they attempt to revoke or inspect a link they created
**Then** they can do neither — **the creator keeps nothing once their access ends** (§4.8)

**Given** revocation authority
**When** it is resolved
**Then** it is read **live from the current relationship graph** and is never copied onto the link row at creation — a stored revoker list is how a link outlives everyone entitled to kill it (SD-3)

**Given** a revoked link
**When** the named recipient opens it
**Then** it yields nothing, on that request, with no delay

**Given** the same holders
**When** they inspect a link
**Then** they see **who opened it and when** — §4.8 grants journal rights on the same footing as revocation rights

**Given** §4.8's guarantee that *"there must never be a link nobody can revoke"*
**When** the backstop is exercised
**Then** it **cannot be** — `PM-FR-39`, the full-profile grant lifecycle, is `deferred` with no stories and no owner, and `PLAT-E7-S7.3` creates no grant, revoke, or seed path (*Recorded inconsistencies* #3). This story delivers the relationship-derived path in full and **records the backstop as unreachable rather than asserting a guarantee the platform cannot keep**

**Given** a subject with no links
**When** the list renders
**Then** the *no links on this profile* empty state renders, and it reads distinctly from *this link has never been opened* and *this link is no longer valid* (PSH-DR6)

### Story 2.4: Journal every access through a link

**ID:** `PSH-E2-S2.4` · **Sprint key:** `2-4-journal-every-access-through-a-link`

As whoever is responsible for this employee,
I want every opening of a shared link recorded,
So that a read by somebody outside the management line leaves a trace.

**Gates:** **`CC-07` (hard — P0, no `AccessJournal` table exists)**, `SEC-AUTH-01`.
**Dependency:** Story 1.3. **Release unit:** ships with Epic 1 — see below.

**Acceptance Criteria:**

**Given** the named recipient opens a link
**When** the access is recorded
**Then** an `AccessJournal` entry of kind **`shared_link_access`** is written **in the same transaction** as the access it records (PM/AD-29, §3.4)

**Given** the journal entry
**When** it is inspected
**Then** it holds the actor, the subject, and the timestamp per §3.4, and is readable by holders of full profile access and by the **current** manager and people partner of the subject

**Given** §4.8's rule that *"every access via a link is journaled"*
**When** the journal is unavailable
**Then** the access does **not** proceed — the record is not best-effort, and a link read that cannot be journaled is a link read that must not happen. Enrolment in the same transaction is what makes this enforceable rather than aspirational

**Given** `CC-07` is P0 open with no table
**When** this story is scheduled
**Then** it **cannot produce closure evidence**, exactly as `PLAT-E7-S7.1` already records for the same reason. This is an inherited gap, not a new one

**Given** the journal's scope (§3.4 — six event kinds)
**When** this story is implemented
**Then** it adds **only** `shared_link_access` and does not widen the journal into a general audit log (PM/AD-29)

## Story Coverage Summary

| FR | Epic | Stories | Story coverage |
|---|---|---|---|
| `PM-FR-27` | 1 | 1.1, 1.2, 1.3 | Named-recipient creation with no anonymous path, section configuration bounded by the never-share set and per-link re-enablement, and the read route with its `404` hidden-existence oracle. **Capped** by PM/AD-10 — project-line managers, the §4.8 archetype, cannot create links |
| `PM-FR-27` | 2 | 2.1, 2.2, 2.3, **2.4 (hard-gated)** | Expiry, immediate creator-liveness death, relationship-derived revocation, and the access journal. **Journal clause gated** on `CC-07` (P0), which §4.8 makes non-optional |

**Totals:** 2 epics · 7 stories · 1 story hard-gated (2.4) · 1 release unit (Epic 1 + 2.2 + 2.4) · 0 stories dependent on a later story · 4 `[DERIVED]` rules awaiting confirmation.

## Step 4 Validation Results

Seven checks. **Four pass, three fail.** All three failures rest on work owned outside this slice and are recorded rather than resolved.

| Check | Result | Detail |
|---|---|---|
| 1. FR coverage | ✅ Pass, qualified | `PM-FR-27` carries 7 stories across both clauses. Delivered **capped** by PM/AD-10 and its journal clause hard-gated on `CC-07` |
| 2. Architecture implementation | ❌ **FAIL** — precondition | PM/AD-5's context map has **no** `profile-sharing` context; `resourcing/epics.md` assumed a "future" one. Per SD-9 no scaffolding story was created. **The context must be confirmed before Epic 1 enters a sprint.** The route shape, by contrast, is already settled by AD-14 (*Recorded inconsistencies* #5) |
| 3. Story quality | ✅ Pass | 5–9 criteria per story; every story names its FR, its gates, and testable Given/When/Then criteria. Four `[DERIVED]` rules are marked with a named confirmer rather than presented as requirements (SD-8) |
| 4. Epic structure / file churn | ✅ Pass with rationale | Consolidation into one epic, and a three-way split isolating the journal, were both considered and rejected on record. The two-epic split is what lets `RS-E1-S1.4` unblock on Epic 1 without waiting for `CC-07` |
| 5. Dependency validation | ✅ Pass on ordering · ❌ **FAIL** on completeness | Ordering is clean: no story depends on a later story, and Epic 2 depends only on Epic 1. **The slice cannot deliver COMPLETE `PM-FR-27`** while Story 2.4 is gated on `CC-07`, and §4.8 makes journaling normative — so this is a release blocker, not a deferrable clause |
| 6. Placeholders and formatting | ✅ Pass | No unresolved template placeholders; every PSH-DR is covered by ≥1 story criterion |
| 7. Normative guarantee deliverable | ❌ **FAIL** — no owner | §4.8 guarantees *"there must never be a link nobody can revoke"* and names full-profile holders as the backstop. **`PM-FR-39` is `deferred` with no stories and no owner**, so the backstop class has no grant or revocation path. Story 2.3 delivers the relationship-derived path and records the guarantee as unmet rather than asserting it |

### Validation findings carried forward

**The section matrix must be consumed, never rebuilt.** `PLAT-E7-S7.1`/`S7.2` own the Shared-link column. Story 1.2 applies their result and raises insufficiencies as `access-control` defects. Two implementations of one matrix is precisely how a shared link becomes a standing bypass — each side assuming the other holds the never-share set.

**The journal is inside the release unit, not beside it.** A share link is the only path in this product that grants profile access outside the relationship graph. Shipping links without `shared_link_access` journaling would create the one access class nobody can audit, and §4.8's wording is unconditional. `CC-07` is therefore a blocker on the **slice**, not on one story.

**Creator liveness is stricter than NFR-7 and must not be relaxed to match it.** NFR-7 says platform-owned relationship changes apply on the next request; §4.8 says the link *"stops working immediately"*. These agree today, but any future caching optimisation that satisfies NFR-7 by a five-minute window would silently violate §4.8. Story 2.2 asserts server-side revalidation explicitly for that reason.

**A recipient losing access mid-task is specified behaviour.** It reads like a bug in every usability review, and the requirement pre-empts that reading. It is stated in the story so that a future "grace period" is recognised as a scope change rather than a fix.

**S5 cannot obey both of its rules.** §4.8 requires explicit per-link re-enablement; §4.7 makes it default-on for evaluation links. Both are normative. This slice implements §4.8 for creator-made links and leaves the resourcing set to `RS-E1-S1.4`, so the contradiction stays visible at the point where somebody can decide it.

**Expiry has no upper bound, and the missing bound is load-bearing.** Creator liveness is the only thing preventing a long-lived link from being a standing grant. If PM/AD-10 later widens who can create links, the absence of a cap becomes materially riskier.

**Manual testing remains required for:** the never-share set asserted against resolved payloads across every section-owning slice, where the risk is a section added later by a slice that never read §4.8; the `404`-versus-`403` distinction on the link route, which requires comparing responses rather than asserting a status code; and the three empty states, whose distinctness is a judgement.

**Automation candidates:** the never-share negative matrix over resolved shared-view payloads; a `canEdit === false` assertion across every section of every shared view; the recipient-mismatch `404` check; a creator-liveness revocation test that flips a relationship between two requests; and a check that the shared view's section set equals the link configuration exactly, with no extras and no omissions.

### Open follow-ups (not stories)

Four `[DERIVED]` rules await confirmation before the stories carrying them are scheduled:

| Rule | Story | Confirmer |
|---|---|---|
| Recipient and subject are immutable after creation; sections and expiry are editable by anyone who could revoke | 1.1 | Product Owner |
| A subject may carry any number of concurrent live links | 1.1 | Product Owner |
| The configurable expiry has no upper bound | 2.1 | Product Owner |
| §4.8's S5 rule governs creator-made links; §4.7's governs resourcing links | 1.2 | Product Owner |

Escalations that are not `[DERIVED]` rules: the `profile-sharing` PM/AD-5 context confirmation (SD-9); the S5 normative contradiction between §4.7 and §4.8; the unreachable full-profile backstop (`PM-FR-39` deferred); `CC-07` as a slice-level release blocker; and the absent UX surfaces for every part of this FR.
