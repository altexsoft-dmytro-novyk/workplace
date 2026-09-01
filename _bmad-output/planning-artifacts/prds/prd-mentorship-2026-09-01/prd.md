---
title: Mentorship — PRD
status: draft
created: 2026-09-01
updated: 2026-09-01
---

# Mentorship — PRD

> **Nothing in this document is approved.** `status: draft`. It decomposes
> People Management PRD **FR-32 / FR-33 / FR-34** (`prd-people-management-2026-08-24`
> §4.12) and `docs/project-requirements.md` **§4.11 (Mentorship Hub)** into the
> `mentorship` bounded context. It mirrors the shape of
> `prd-user-management-2026-08-20/prd.md`. The technical context design — the
> `MentorshipPair` aggregate, the availability-flag owning aggregate and
> endpoint, migrations — is a **separate architect pass** (see
> `_bmad-output/planning-artifacts/mentorship/architect-handoff.md`); this PRD
> describes behaviour and the data the feature needs, and lists the schema /
> aggregate / endpoint questions as explicit hand-offs.

## Why this context exists separately

Mentorship is fully in v1.5 requirements (§4.11 Mentorship Hub; §3.2 S13; §3.2 S1
"mentor" identity-card field; §4.9 mentorship pair start/end are tracked career
events; §4.16 departure auto-closes pairs bypassing the note gate; §4.1
mentorship status is a directory filter) and in the parent PRD (FR-32/33/34,
§4.12). The approved 2026-08-29 Correct Course and architecture spine **AD-17**
moved it **out of `user-management`**: a mentorship pair is a durable workflow
record in its **own** bounded context — **never** a `Relationship` row, **never**
an access edge, **never** an audience-resolution input. User Management's former
Story 4.2 ("HR Admin pairs a mentor and mentee" via
`POST /users/:id/relationships {type:'mentorship'}`) is **retired** — that model
is wrong (`docs/test-cases/user-management/relationships/um-rel-04..06`, RETIRED).

## Scope

Covers the `mentorship` bounded context:

- **The willing-mentor pool** — the company-wide set of employees who have
  flagged themselves *open to mentoring* (§4.11).
- **The open-to-mentoring availability fact** — set/cleared by the employee
  (self-service), independent of any pair (AD-17: clearing it never mutates an
  active pair).
- **Derived mentorship status** — `open to mentoring` → `mentor` on the first
  active pair; back to `open to mentoring` when no active mentee remains *unless
  the flag was cleared* (§4.11).
- **Pair lifecycle** — create a pair (scoped mentee selection); end a pair with a
  mandatory closure note stored **on the pair record** (§4.11; AD-17).
- **The S13 inline mentorship summary** on the profile and the all-pairs
  (active + ended) view (§3.2 S13; AD-14).
- **Career-event emission** — `mentorship_start` / `mentorship_end` supplied to
  User Management's career timeline (§4.9) in the **same transaction** as the
  pair mutation, through an approved cross-context `application/` boundary
  (AD-11, AD-17). Mentorship never writes `UserEvents` directly.
- **Departure auto-close** — active pairs closed with a **system-generated**
  closure note that **bypasses** the mandatory-note gate, driven by the AD-20
  departure executor calling this context's exported application service
  (§4.16; AD-20).

**Explicitly out of scope:**

- **Mentoring goals, session logs, progress tracking** (§4.11 "Not in scope for
  this iteration"; parent PRD Non-Goal). There is exactly one mentorship-hub
  spec (§4.11); this context builds no notification / goal / session-log surface.
- **The S13 access-matrix enforcement** — who is *entitled* to read/write S13 and
  the closure-note restricted projection is owned by `access-control` (§3.2
  matrix, `docs/architecture/access-control.md`). This context calls the facade
  and only *narrows* its result; it never reads policy tables or derives
  audiences (AD-9).
- **The career-timeline store** — `UserEvents` is owned by `user-management`
  (§4.9). Mentorship supplies the two event types via the application boundary
  only.
- **The All Employees directory engine** — platform scope (§4.1). Mentorship
  contributes `mentorship status` as a filterable/column field; the directory
  itself is not built here.
- **Timetracker / project-line resolution** — separate context (§5.1).
- **Notifications** (§4.13, GOOD TO HAVE) — "mentorship pair created or ended"
  notification is out of MVP; if ever built it follows the §5.1 projection rule.

## Data Model — what the feature needs

Behavioural, not a schema. The concrete aggregate / columns / indexes are the
**architect's** call (hand-offs below).

**A durable pair record.** For each mentor–mentee pairing the feature needs:
mentor identity, mentee identity, start date, end date (null while active),
status (active / ended), the closure note, and a marker of whether the pair was
**system-closed on departure** (§4.16) rather than manually ended. Ended pairs
are **retained** and remain queryable on both profiles (§4.11; AD-17 "Ended pairs
remain queryable" — no hard delete, unlike the retired `Relationship` model).

**The open-to-mentoring availability fact.** A per-employee boolean-shaped fact,
**independent of any pair** (AD-17). It can be true with zero pairs (a willing
mentor nobody has been assigned to yet) and false with an active pair (a mentor
who un-flagged — §4.11 "Un-flagging"). It is **not** a `MentorshipPair` field and
**not** a `Relationship` row (spine Deferred: "Do not infer it as a relationship
patch").

**Derived mentorship status.** `open to mentoring` vs `mentor`, a function of
(availability fact, count of active pairs where the person is mentor). Whether
this is stored or computed on read is an architect decision.

**Architect hand-offs (this PRD does not decide these):**

1. The exact `MentorshipPair` aggregate — columns, the mentor/mentee foreign
   keys, status representation (a `status` field vs `endDate` presence), the
   system-closed marker, and the indexes needed for the all-pairs view, the
   "active pairs for mentor X" status query, and the departure-executor lookup.
2. **The availability flag's owning aggregate and endpoint** — the spine Deferred
   open question ("S13 mentorship self-visibility flag's exact endpoint … its
   owning aggregate and endpoint remain unresolved. Do not infer it as a
   relationship patch."). Including whether it lives with a
   `MentorshipAvailability` aggregate in this context, and how S13's "own flag
   RW" cell maps to it.
3. Whether mentorship status is **stored or computed**, and how the All Employees
   directory (platform scope) reads it as a filter/column without a cross-context
   domain reach.
4. How the S13 inline **"mentor" field** on `GET /users/:id` (S1 identity card,
   §3.2) and the S13 inline summary are served without `user-management` reaching
   into `mentorship`'s domain — i.e. the shape of the `application/` read export
   `user-management` (or a profile assembler) consumes (AD-2 entry-point rule).

## Functional Requirements

Each FR traces to §4.11 / §3.2 / §4.9 / §4.16 / a parent-PRD FR-n / an AD-n.
"Sourced" = stated in the cited source. "Inferred" = a decomposition step not
literally in §4.11; flagged as such.

### FR-M1 — Self-service: set / clear own open-to-mentoring flag

An employee sets or clears their own *open to mentoring* flag from their profile,
without HR. Setting it adds them to the willing-mentor pool; clearing it removes
them from the pool **for future assignments**.
*Sourced:* §4.11 self-service ("Mark themselves as open to mentoring"); §3.2 S13
Self `RW (own flag)`; §4.3 ("see and manage their mentorship status"); FR-32.

### FR-M2 — Self view of own mentor and own mentee(s)

An employee sees, on their own profile, their assigned mentor (if any) and their
assigned mentee(s) (if any), active and ended.
*Sourced:* §4.11 self-service; §3.2 S13 Self `R (pairs)`; FR-32.

### FR-M3 — Clear the flag while holding an active mentee

An employee may clear the flag while an active pair exists. Doing so removes them
from the pool for future assignments, **does not touch any active pair**, and
their mentorship status **stays `mentor`** while any pair is active.
*Sourced:* §4.11 "Un-flagging"; AD-17 ("clearing it never mutates an active
pair"); FR-32.

### FR-M4 — The company-wide willing-mentor pool

A holder of the *assign and end mentorships* permission sees a list of every
employee who has flagged *open to mentoring*. The pool is **company-wide** (a
mentor for someone in one department frequently sits in another). Each row shows
**S1 identity-card data plus the availability flag only** — it **never** exposes
anyone's S13 section (assigned mentees, ended pairs, closure notes).
*Sourced:* §4.11 "For the manager line and PP" (first bullet); §2.3 permission
list ("assign and end mentorships"); roles table (`docs/project-requirements.md`
line ~119); FR-34.

### FR-M5 — Scoped mentee selection

When a permission-holder opens the assignment flow for a willing mentor, the
mentee they may pick is **scoped to people they hold AccessControl access over**.
A mentee outside the assigner's access scope is rejected.
*Sourced:* §4.11 "Mentee selection is scoped to people the assigner holds access
over"; FR-33. Consumes `access-control`'s `resolveAudiences(viewerId,
employeeIds)` (AD-9, AD-10) — mentorship never resolves audiences itself, and
pairs never feed audience resolution (AD-17).

### FR-M6 — Create a pair; first-pair status transition

A permission-holder creates a mentor–mentee pair. On the mentor's **first active
pair**, their mentorship status transitions **`open to mentoring` → `mentor`**.
*Sourced:* §4.11 "On creation of the first pair, the person's mentorship status
changes from open to mentoring to mentor"; FR-33.

### FR-M7 — `mentorship_start` career event, same transaction

Creating a pair appends a `mentorship_start` career-timeline event for the
relevant profile(s) **in the same transaction as the pair write**, through
`user-management`'s approved application boundary. Mentorship does not write
`UserEvents` directly.
*Sourced:* §4.9 ("mentorship pair start and end" are tracked events); AD-11
(same-transaction, explicit call, no event bus); AD-17; parent PRD FR-28.

### FR-M8 — All-pairs view (active + ended)

A view lists all mentor–mentee pairs — **active and ended** — with start date,
end date, and status. Available on the profile (S13) and as the
`GET /mentorship-pairs` collection (AD-14).
*Sourced:* §4.11 "A view of all mentor–mentee pairs, active and ended, with start
date, end date and status"; §3.2 S13 contents; FR-34; AD-14.

### FR-M9 — End a pair; mandatory closure note on the pair

A manager (reporting line) or PP ends a pair explicitly. The end date is
recorded. **A closure note is required — a pair cannot be ended without one.**
The note is a **field on the pair record, not an S8 feedback record** (S8 has a
single subject; this note is about a pairing).
*Sourced:* §4.11 "Ending a mentorship"; §3.2 S13 contents ("closure notes");
AD-17 ("Normal closure requires a note stored on the pair"); FR-33.

### FR-M10 — Closure-note restricted visibility

A stored closure note is readable by the **reporting line, the project line, and
PP** — **not** the mentor, **not** the mentee, **not** colleagues. This is a
matrix exception (the DEC-UM-001 pattern): **narrower** than the S13 `RW` cell,
which would otherwise let Self/mentee read it.
*Sourced:* §4.11 "It is readable by the reporting line, the project line and PP;
not by the mentor, not by the mentee, not by colleagues"; parent PRD FR-33
("never exposed to mentor, mentee, or colleagues"); `access-control.md` matrix
exceptions (§3.3, DEC-UM-001).

### FR-M11 — `mentorship_end` career event, same transaction

Ending a pair (manual or system) appends a `mentorship_end` career-timeline event
in the same transaction as the pair mutation, via the application boundary.
*Sourced:* §4.9; §4.11 ("an end event is written to the career timeline"); AD-11;
AD-17; parent PRD FR-28.

### FR-M12 — Ended pairs stay in history on both profiles

An ended pair remains visible in the pair history on **both** the mentor's and
the mentee's profile.
*Sourced:* §4.11 "Ended pairs remain visible in history on both profiles"; AD-17
("Ended pairs remain queryable"); FR-33.

### FR-M13 — Status roll-back when no active mentee remains

When a pair ends and the mentor has **no other active mentee**, their mentorship
status returns to **`open to mentoring`** — **unless the flag was cleared**
(FR-M3), in which case they are not returned to the pool and status is not
`mentor`.
*Sourced:* §4.11 "If the mentor has no other active mentees, their status returns
to open to mentoring"; §4.11 "Un-flagging" (status stays `mentor` only *while*
a pair is active; the cleared flag governs the post-close state); FR-33.
*Inferred (decomposition):* the interaction of "return to open to mentoring" with
a previously cleared flag — §4.11 states both rules; this FR states their
combination. Flagged for PO confirmation if the reading is disputed.

### FR-M14 — Departure auto-close with a system note that bypasses the gate

When a departure takes effect (§4.16), the departing person's active pairs
**auto-close** with a **system-generated** closure note that **bypasses the
mandatory-closure-note gate** in FR-M9 — a departed person cannot supply one.
This is driven by the **AD-20 departure executor** calling this context's
exported `application/` service under the shared cross-context transaction; the
executor never reaches into mentorship's domain/infrastructure.
*Sourced:* §4.16 ("active mentorship pairs end automatically with a
system-generated closure note, bypassing the mandatory-closure-note gate in
4.11"); AD-16; AD-17; AD-20 ("system-closes mentorship pairs"); parent PRD FR-41.

### FR-M15 — Mentorship status is a directory filter / column

Mentorship status (`open to mentoring` / `mentor`) is exposed as a filterable
field and column on the All Employees directory. The directory engine is platform
scope; this context supplies the field.
*Sourced:* §4.11 "This status is a filterable field on All Employees"; §4.1
("mentorship status" in the filter list; example view "all people open to
mentoring"); FR-34.

### FR-M16 — Mentor in the profile header (S1)

On any profile, the mentor is displayed in the header alongside the manager and
the people partner. The S1 identity-card `mentor` field on `GET /users/:id` is
served from mentorship data.
*Sourced:* §4.11 "On any profile: the mentor is displayed alongside the manager
and the people partner in the profile header"; §4.2; §3.2 S1 contents ("… manager,
people partner, mentor …"); parent PRD FR-12/FR-14.
*Architect hand-off:* how this field reaches `GET /users/:id` without a
cross-context domain reach (Data Model hand-off 4).

### FR-M17 — S13 inline mentorship summary on the profile

`GET /users/:id` carries an inline S13 mentorship summary (own flag; assigned
mentor; assigned mentees; ended pairs), assembled from this context, subject to
the caller's resolved S13 access and the FR-M10 closure-note narrowing.
*Sourced:* §3.2 S13 ("Open-to-mentor flag, assigned mentor, assigned mentees,
ended pairs, closure notes"); AD-14 (`GET /users/:id` inline summary +
`GET /mentorship-pairs`); FR-34.

## Open Questions

| # | Question | Blocks | Owner |
|---|----------|--------|-------|
| **OQ-M1** | **The *assign and end mentorships* FR permission is not in the seeded catalog.** The Access Control Kernel MVP seeds exactly `user-management:create` / `:deactivate` / `:list` (`access-control.md`, ACM-1). There is no `mentorship:assign` (or equivalent). Same shape as the missing `user-management:edit` gap — see the alignment proposal §7 decision (i). Options: (a) Access Control adds the permission via a new three-stage AD-1 kernel seed sequence, this context consumes it; (b) an interim `// INTERIM` rule with a recorded expiry trigger. | FR-M4, FR-M5, FR-M6, FR-M9 stage-2 (the feature half of the §2.2 dual gate) | Product Owner + Architect + Access Control |
| **OQ-M2** | **Who may assign mentors** — `docs/project-requirements.md` line ~131 lists this as a PO-confirm item ("this document does not settle … who may assign mentors"). §4.11 says the pool is visible to *assign and end mentorships* holders and mentee selection is scoped to the assigner's access; the *default role assignment* of the permission is unconfirmed. | The seeded default for the permission (not the code path) | Product Owner |
| **OQ-M3** | **S13 `canAccessSection` is a pending Access Control increment.** `AccessControlFacade.canAccessSection` supports **`S1` / `S10` / `S11` only** today (ACM-5). S13 section access — and the FR-M10 closure-note restricted projection that narrows it — has no facade call to make yet. Stage-2 gate, exactly like the career-timeline S9 gap (`docs/test-cases/user-management/career-timeline/` note). | FR-M10, FR-M17 stage-2 | Access Control |
| **OQ-M4** | **AD-20 departure executor / CC-06.** FR-M14 depends on the durable `Departure` aggregate, the executor, and this context exposing an `applyDepartureEffects({departureId, leaseToken, tx})`-shaped operation under the shared unit of work (`domain-driven-design.md`). CC-06 is unresolved. | FR-M14 stage-2 and production | Product Owner + Architect |
| **OQ-M5** | **AD-11 career-event boundary.** FR-M7 / FR-M11 need `user-management` to expose an application-boundary operation that appends a `mentorship_start` / `mentorship_end` event in a caller-supplied transaction. UM Epic 3 Story 3.1 ("System Auto-Generates Career Timeline Events") owns building that boundary; its third AC already names mentorship as a caller. | FR-M7, FR-M11 stage-2 | User Management (Epic 3 Story 3.1) |
| **OQ-M6** | Architect hand-offs 1–4 in Data Model — `MentorshipPair` aggregate/schema/indexes; the availability-flag owning aggregate and endpoint (spine Deferred); status stored vs computed and the directory read path; the S1 `mentor` / S13 inline read export shape. | All stage-2 (no endpoint contracts exist) | Architect (see `architect-handoff.md`) |
| **OQ-M7** | **Closure route and pool route names.** `api-conventions.md` fixes `GET/POST /mentorship-pairs` and `GET /mentorship-pairs/:id`, and says closure is "a pair action carrying the required note — exact action route follows its approved AD-1 scenario". The willing-pool route is unnamed. Scenario docs use provisional names, flagged as the architect's / the approved-scenario's call. | Endpoint-exact stage-2 | Architect + the approved AD-1 scenario |

## Traceability

Derives from **People Management PRD FR-32 / FR-33 / FR-34** (`prd-people-management-2026-08-24` §4.12) and **`docs/project-requirements.md` §4.11** (plus §3.2 S1/S13, §4.9, §4.16, §4.1). Architecture: **AD-5, AD-11, AD-14, AD-17, AD-18, AD-20** and the spine Deferred entries for the S13 flag endpoint and the mentorship context boundary. Epics: `_bmad-output/planning-artifacts/mentorship/epics.md`. Scenarios: `docs/test-cases/mentorship/`.
