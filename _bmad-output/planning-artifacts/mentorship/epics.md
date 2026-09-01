---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-mentorship-2026-09-01/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - docs/architecture/api-conventions.md
  - docs/architecture/access-control.md
  - docs/architecture/domain-driven-design.md
  - docs/project-requirements.md
status: draft
---

# mentorship — Epic Breakdown

> **Nothing here is approved.** This file decomposes
> [`prd-mentorship-2026-09-01`](../prds/prd-mentorship-2026-09-01/prd.md) into
> implementable stories. It replaces the "Mentorship Handoff" placeholder in
> [`user-management/epics.md`](../user-management/epics.md). No UX design contract
> exists (no `bmad-ux` run). Scenario prose (AD-1 stage 1) may proceed for every
> story; several stories' stage-2 E2E and production stages are **gated** — see
> per-story gates and Epic Sequencing.

Derives from **People Management PRD FR-32 / FR-33 / FR-34** (`prd-people-management-2026-08-24` §4.12) + **`docs/project-requirements.md` §4.11** (with §3.2 S1/S13, §4.9, §4.16, §4.1). Architecture: **AD-5, AD-11, AD-14, AD-17, AD-18, AD-20**.

## Overview

The `mentorship` bounded context owns the willing-mentor pool, the
open-to-mentoring availability fact, the durable `MentorshipPair` record (active
and ended), pair creation and mandatory-note closure, the S13 read surface, the
profile-header mentor field, and departure auto-close. It emits `mentorship_start`
/ `mentorship_end` to `user-management`'s career timeline through an approved
cross-context `application/` boundary in the same transaction as the pair
mutation (AD-11); it never writes `UserEvents` and never participates in access
audience resolution (AD-17). Entitlement (who may read/write S13, the
closure-note restricted projection) is `access-control`'s — this context calls
the facade and only narrows its result (AD-9).

## Requirements Inventory

### Functional Requirements (from `prd-mentorship-2026-09-01`)

| FR | Summary | Source |
|---|---|---|
| FR-M1 | Self set / clear own open-to-mentoring flag; pool membership follows | §4.11 self-service · §3.2 S13 Self RW own flag · FR-32 |
| FR-M2 | Self view of own mentor and own mentee(s) | §4.11 self-service · §3.2 S13 Self R pairs · FR-32 |
| FR-M3 | Clear the flag while holding an active mentee — pool exit, active pairs untouched, status stays `mentor` | §4.11 "Un-flagging" · AD-17 · FR-32 |
| FR-M4 | Company-wide willing-mentor pool: S1 identity + flag only, never any S13, *assign and end mentorships* gated | §4.11 · §2.3 · roles table line ~119 · FR-34 |
| FR-M5 | Scoped mentee selection — mentee within the assigner's AccessControl access scope | §4.11 · FR-33 · AD-9/AD-10 |
| FR-M6 | Create a pair; first active pair flips status `open to mentoring` → `mentor` | §4.11 · FR-33 |
| FR-M7 | `mentorship_start` career event in the same transaction as the pair write, via UM application boundary | §4.9 · AD-11 · AD-17 · FR-28 |
| FR-M8 | All-pairs view (active + ended) with start date, end date, status | §4.11 · §3.2 S13 · FR-34 · AD-14 |
| FR-M9 | End a pair explicitly; closure note **required** and stored **on the pair** (not S8) | §4.11 · §3.2 S13 · AD-17 · FR-33 |
| FR-M10 | Closure-note restricted visibility — reporting line + project line + PP only; not mentor/mentee/colleague | §4.11 · FR-33 · `access-control.md` §3.3 exceptions |
| FR-M11 | `mentorship_end` career event in the same transaction as the pair mutation | §4.9 · §4.11 · AD-11 · FR-28 |
| FR-M12 | Ended pairs stay in history on **both** profiles | §4.11 · AD-17 · FR-33 |
| FR-M13 | Status returns to `open to mentoring` when no active mentee remains — **unless the flag was cleared** | §4.11 · FR-33 |
| FR-M14 | Departure auto-close: system-generated closure note **bypasses** the mandatory-note gate; AD-20 executor-driven | §4.16 · AD-16 · AD-17 · AD-20 · FR-41 |
| FR-M15 | Mentorship status is a filterable field / column on All Employees (directory is platform scope) | §4.11 · §4.1 · FR-34 |
| FR-M16 | Mentor shown in the profile header (S1); S1 `mentor` field served from mentorship | §4.11 · §4.2 · §3.2 S1 · FR-12/FR-14 |
| FR-M17 | S13 inline mentorship summary on `GET /users/:id` | §3.2 S13 · AD-14 · FR-34 |

### NonFunctional Requirements (binding on this context)

- **NFR-M1** *[§7 personal data]*: seeded test population only; no real PII in agent contexts, logs, or the repo.
- **NFR-M2** *[§7 access-control correctness]*: every mentorship read surface (S13 inline, `/mentorship-pairs`, the pool, the directory field) is audience-projected through the AccessControl facade — never a direct policy-table read (AD-9). The closure-note narrowing is a projection contract that only *narrows* the facade result.
- **NFR-M3** *[§3.3.1 / §4.1]*: the mentorship-status directory field must not leak a value a viewer cannot see; filter side-channels respect the same rule.

### Additional constraints (spine)

- **AD-5:** `mentorship` is a bounded context "pending context-boundary confirmation" — the architect confirms it as `src/mentorship/` with the standard `application/domain/infrastructure` layout.
- **AD-11 / AD-17:** the `MentorshipPair` is a durable record; pair start/end writes the career event in the **same transaction** via an explicit call to `user-management`'s application boundary — no event bus, no table-change listener. Hard-deleted `Relationship` rows are a *different* thing; mentorship never uses them.
- **AD-14:** `mentorship-pairs` is a top-level collection route (`GET/POST /mentorship-pairs`, `GET /mentorship-pairs/:id`); closure is "a pair action carrying the required note", exact route per the approved AD-1 scenario. The flag endpoint and the pool route are **unresolved** (spine Deferred + `api-conventions.md`).
- **AD-20:** the departure executor is a `user-management` application orchestrator; it calls this context's exported `applyDepartureEffects({departureId, leaseToken, tx})`-shaped operation under one shared PostgreSQL transaction and never reaches into its domain/infrastructure.
- **AD-9 / access-control.md:** `resolveAudiences` is consumed for mentee-selection scoping (FR-M5) and for the closure-note visibility projection (FR-M10). Pairs never feed audience resolution (AD-17).

### UX Design Requirements

N/A — no `bmad-ux` run. The mentorship hub, the assignment flow, and the S13
profile section have no UX contract yet; recorded for later.

## FR Coverage Map

| FR | Story |
|---|---|
| FR-M1, FR-M3 | Story 1.1 — Open-to-mentoring flag |
| FR-M4 | Story 1.2 — The willing-mentor pool |
| FR-M5, FR-M6, FR-M7 | Story 1.3 — Create a mentorship pair |
| FR-M9, FR-M10, FR-M11, FR-M12, FR-M13 | Story 1.4 — End a mentorship pair |
| FR-M2, FR-M8, FR-M15, FR-M16, FR-M17 | Story 1.5 — S13 projection, profile-header mentor, directory filter |
| FR-M14 | Story 1.6 — Departure auto-close |

## Epic List

### Epic 1: Mentorship Hub

The whole `mentorship` context: the availability flag and pool, the durable pair
lifecycle with mandatory-note closure and restricted note visibility, the S13
read surface, the profile-header mentor field, the directory status field, and
departure auto-close. One epic; six stories split by capability.

**FRs covered:** FR-M1 … FR-M17.

**Epic-wide gates:**

- **G-CTX (all stories):** AD-5 context confirmation + the architect hand-offs in
  `architect-handoff.md` (`MentorshipPair` schema; the availability-flag owning
  aggregate and endpoint — spine Deferred; status stored vs computed; the S1/S13
  read-export shape). No endpoint contract exists until these land — scenario
  prose proceeds, stage-2 does not.
- **G-PERM (1.2, 1.3, 1.4):** the *assign and end mentorships* FR permission is
  **not seeded** (kernel MVP seeds only `user-management:create/deactivate/list`).
  Future catalog work — same shape as the `user-management:edit` gap
  (alignment proposal §7 (i)). The feature half of the §2.2 dual gate cannot pass
  under the real facade until it exists.
- **G-S13 (1.4, 1.5):** `AccessControlFacade.canAccessSection` supports
  `S1` / `S10` / `S11` only (ACM-5). **S13 is a pending Access Control
  increment** — the closure-note restricted projection (FR-M10) and the
  audience-narrowed S13 inline summary (FR-M17) have no facade call to make yet.
  Same stage-2 gate as the career-timeline S9 gap.
- **G-CT (1.3, 1.4):** FR-M7 / FR-M11 need `user-management` Epic 3 Story 3.1's
  career-event application boundary to exist (its third AC already names
  mentorship as a caller).
- **G-DEP (1.6):** AD-20 departure executor + CC-06. Blocked until the durable
  `Departure` aggregate and executor are approved and this context exposes the
  shared-unit-of-work operation.

### Story 1.1: Open-to-mentoring flag

As an employee,
I want to set or clear my own *open to mentoring* flag,
So that I control whether I appear in the willing-mentor pool without asking HR.

**FRs:** FR-M1, FR-M3. **Gates:** G-CTX (the flag's owning aggregate and endpoint
are the spine Deferred open question — scenario prose uses a provisional endpoint,
flagged; stage-2 blocked until the architect resolves it). No *assign and end
mentorships* permission needed — this is Self-service (§3.2 S13 Self `RW (own
flag)`).

**Acceptance Criteria:**

**Given** employee Mona with the flag unset
**When** Mona sets her own *open to mentoring* flag
**Then** the response succeeds and Mona now appears in the willing-mentor pool
(observed via Story 1.2's pool read by a permission-holder)

**Given** Mona has the flag set and no active pair
**When** Mona clears her own flag
**Then** the response succeeds and Mona no longer appears in the pool

**Given** an actor who is not Mona
**When** they attempt to set or clear Mona's flag
**Then** the request is denied (§3.2 S13 — only Self writes the own flag) and the
flag is unchanged

**Given** Mona is a `mentor` with one active mentee (Story 1.3) and the flag set
**When** Mona clears her own flag
**Then** the flag clears, **the active pair is untouched**, and Mona's mentorship
status **stays `mentor`** while the pair is active (FR-M3; AD-17); Mona is absent
from the pool for future assignments

### Story 1.2: The willing-mentor pool

As a holder of the *assign and end mentorships* permission,
I want a company-wide list of everyone open to mentoring,
So that I can pick a mentor from anywhere in the organisation.

**FRs:** FR-M4. **Gates:** G-CTX, G-PERM. Provisional pool route
(`GET /willing-mentors` — architect's / the approved scenario's call, `api-conventions.md`).

**Acceptance Criteria:**

**Given** willing mentors exist in several departments and a viewer holding
*assign and end mentorships*
**When** the viewer reads the willing-mentor pool
**Then** the response is `200` and lists **every** flagged employee regardless of
department (the pool is company-wide, §4.11)
**And** each row carries **S1 identity-card fields plus the availability flag
only** — no assigned-mentee list, no ended pairs, no closure note, nothing else
from S13 (FR-M4)

**Given** a viewer who does **not** hold *assign and end mentorships*
**When** they request the willing-mentor pool
**Then** the response is `403` (the no-target `isAllowed` gate — never a
role-name or `User.position` check)

### Story 1.3: Create a mentorship pair

As a holder of the *assign and end mentorships* permission,
I want to pair a willing mentor with a mentee inside my access scope,
So that a durable mentorship record exists and the career timeline reflects it.

**FRs:** FR-M5, FR-M6, FR-M7. **Gates:** G-CTX, G-PERM, G-CT. Consumes
`access-control`'s `resolveAudiences` for the mentee scope check (shipped, ACM-4R).

**Acceptance Criteria:**

**Given** willing mentor Mona, mentee Alice within assigner Bob's access scope,
and Bob holds *assign and end mentorships*
**When** Bob creates a pair (Mona → Alice)
**Then** the response is `201`, a durable `MentorshipPair` exists with status
active, start date recorded, end date null, closure note absent (FR-M6, FR-M8)

**Given** Bob attempts to pair Mona with Eve, who is **outside** Bob's
AccessControl access scope
**When** the request is submitted
**Then** it is **rejected** and no pair is created (FR-M5)

**Given** Mona had status `open to mentoring` and no active pair
**When** the first pair for Mona is created
**Then** Mona's mentorship status transitions to **`mentor`** (FR-M6)

**Given** a pair is created
**When** the transaction commits
**Then** a `mentorship_start` career event has been appended for the pair's
profile(s) **in the same transaction**, through `user-management`'s application
boundary — not by mentorship writing `UserEvents` directly (FR-M7; AD-11)

**Given** an actor without the *assign and end mentorships* permission
**When** they attempt to create a pair
**Then** the response is `403`

### Story 1.4: End a mentorship pair

As a manager (reporting line) or People Partner,
I want to end a pair with a required closure note,
So that the pairing is closed with a durable, appropriately-restricted record.

**FRs:** FR-M9, FR-M10, FR-M11, FR-M12, FR-M13. **Gates:** G-CTX, G-PERM, G-S13
(the closure-note restricted projection needs `canAccessSection('S13', …)`, which
does not exist yet), G-CT.

**Acceptance Criteria:**

**Given** an active pair (Mona → Alice) and Paula (Alice's PP)
**When** Paula ends the pair **with** a closure note
**Then** the response succeeds, the end date is recorded, status is ended, and the
note is stored **on the pair record** (FR-M9)

**Given** an active pair
**When** an actor attempts to end it **without** a closure note
**Then** the request is **rejected** and the pair stays active — a pair cannot be
ended without a note (FR-M9)

**Given** an ended pair with a closure note
**When** the note is read by a **reporting-line** manager, a **project-line**
manager, or the **PP**
**Then** the note is returned (FR-M10)

**Given** an ended pair with a closure note
**When** the note is read by the **mentor**, the **mentee**, or a **colleague**
**Then** the note is **not** returned — narrower than the S13 `RW` cell (FR-M10)

**Given** an ended pair
**When** the mentor's remaining active mentees are counted
**Then** if zero **and the mentor's flag was not cleared**, the mentor's status
returns to **`open to mentoring`**; if the mentor had cleared the flag, they are
not returned to the pool and status is not `mentor` (FR-M13)

**Given** a pair ends
**When** the transaction commits
**Then** a `mentorship_end` career event has been appended in the same
transaction via the application boundary (FR-M11), and the ended pair remains in
history on **both** the mentor's and the mentee's profile (FR-M12)

### Story 1.5: S13 projection, profile-header mentor, directory filter

As a viewer of a profile / the directory,
I want the mentorship read surfaces,
So that I see the mentor, the pairs, and can filter employees by mentorship status.

**FRs:** FR-M2, FR-M8, FR-M15, FR-M16, FR-M17. **Gates:** G-CTX, G-S13 (S13 inline
audience narrowing). The All Employees directory is **platform scope** — this
story delivers only the mentorship-status **field** the directory consumes, plus
the mentorship-owned read exports.

**Acceptance Criteria:**

**Given** Alice has an assigned mentor and no mentees
**When** Alice reads her own profile
**Then** the S13 inline summary shows her mentor and (empty) mentee list, and her
own flag (FR-M2, FR-M17; §3.2 S13 Self `R (pairs)`)

**Given** active and ended pairs exist
**When** an entitled viewer reads `GET /mentorship-pairs`
**Then** the response lists both, each with start date, end date, and status
(FR-M8)

**Given** Alice's mentor is Mona
**When** any entitled viewer reads Alice's profile
**Then** the profile header shows Mona as the mentor, alongside the manager and
the people partner (FR-M16; §3.2 S1)

**Given** employees with varying mentorship status
**When** the All Employees directory filters/columns on mentorship status
**Then** the field resolves `open to mentoring` / `mentor` (or neither) per
employee and does not leak a value a viewer cannot see (FR-M15; NFR-M3) — the
directory engine itself is not built here

### Story 1.6: Departure auto-close

As the platform,
I want a departing person's active pairs auto-closed with a system note,
So that offboarding leaves no open mentorship and no missing closure note.

**FRs:** FR-M14. **Gates:** G-CTX, **G-DEP (blocked on the AD-20 executor /
CC-06)** — scenario prose only until then.

**Acceptance Criteria:**

**Given** a departing employee (mentor and/or mentee) with active pairs and a
departure that reaches its effective date
**When** the AD-20 executor processes the departure and calls this context's
exported `applyDepartureEffects` operation under the shared transaction
**Then** every active pair the person is in is closed, with a
**system-generated** closure note, and a `mentorship_end` career event per pair
in the same transaction (FR-M14; AD-20)

**Given** the auto-close path
**When** a pair is system-closed on departure
**Then** the mandatory-closure-note gate in Story 1.4 is **bypassed** — no
human-supplied note is required, and the pair carries the system-closed marker
(FR-M14; §4.16)

**Given** the executor retries after a partial or uncertain failure
**When** processing resumes
**Then** the outcome is idempotent — no duplicate closure, note, or career event
(AD-20)

## Epic Sequencing / Parallelization

Per `docs/project-requirements.md` §8.2 (NORMATIVE, graded): no one waits for
another. The build-time dependencies here are:

- **Story 1.1** can have scenario prose now; **stage-2 is blocked on G-CTX** —
  the availability-flag owning aggregate and endpoint are the spine Deferred open
  question. It is not a `Relationship` patch.
- **Story 1.2** scenario prose now; stage-2 blocked on **G-CTX + G-PERM** (the
  missing *assign and end mentorships* permission).
- **Story 1.3** scenario prose now; stage-2 blocked on **G-CTX + G-PERM + G-CT**
  (UM Epic 3 Story 3.1's career-event boundary). The `resolveAudiences` call it
  needs for FR-M5 already ships.
- **Story 1.4** scenario prose now; stage-2 blocked on **G-CTX + G-PERM + G-S13 +
  G-CT**. G-S13 (the S13 `canAccessSection` increment) is the same class of gate
  as the career-timeline S9 gap — Access Control owns closing it.
- **Story 1.5** scenario prose now; stage-2 partially blocked on **G-CTX + G-S13**
  for the audience-narrowed S13 inline summary; the profile-header mentor field
  and the directory field need the architect's read-export shape (G-CTX). The
  All Employees directory is a separate platform deliverable.
- **Story 1.6** scenario prose only; **stage-2 and production blocked on G-DEP**
  (AD-20 executor / CC-06).

Net: all six stories' AD-1 stage-1 scenario work is parallel and can start now.
Stage-2 for 1.1 needs the architect's endpoint/aggregate decision; 1.2–1.4 need
the *assign and end mentorships* permission; 1.4/1.5 need the S13 Access Control
increment; 1.3/1.4 need UM Epic 3 Story 3.1; 1.6 needs CC-06.
