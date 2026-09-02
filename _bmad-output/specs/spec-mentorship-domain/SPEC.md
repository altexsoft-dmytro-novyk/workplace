---
id: SPEC-mentorship-domain
title: Mentorship Domain Specification
status: canonical-domain
created: 2026-09-02
updated: 2026-09-02
implementation_status: specified-blocked
parent_requirements:
  - PM-FR-32
  - PM-FR-33
  - PM-FR-34
architecture_refs:
  - PM/AD-5
  - PM/AD-17
  - PM/AD-23
  - PM/AD-30
binding_companion: ../../../docs/architecture/mentorship.md
historical_source:
  - ../../planning-artifacts/prds/prd-mentorship-2026-09-01/prd.md
companions:
  - ../../planning-artifacts/mentorship/epics.md
  - ../../planning-artifacts/mentorship/architecture-notes.md
  - ../../planning-artifacts/mentorship/architect-handoff.md
  - ../../implementation-artifacts/mentorship/sprint-status.yaml
  - ../../../docs/architecture/mentorship.md
  - ../../../docs/test-cases/mentorship/
---

# Mentorship Domain Specification

## 1. Purpose and authority

This specification is the canonical bounded-context decomposition of PM-FR-32, PM-FR-33, and PM-FR-34. It converts, but does not delete or rewrite, the historical Mentorship PRD dated 2026-09-01.

Authority order:

1. `docs/project-requirements.md` v1.5 — normative behavior.
2. `prd-people-management-2026-08-24/prd.md` — canonical product requirements.
3. People Management architecture spine (`PM/AD-*`), especially PM/AD-5, PM/AD-17, PM/AD-23, and binding companion `docs/architecture/mentorship.md`.
4. This document — canonical Mentorship domain behavior within those approved boundaries.
5. Draft epics, scenarios, red tests, and sprint status — delivery evidence only.

This SPEC **must not** license a design contrary to the ratified spine. Where a draft epic or scenario conflicts with PM/AD-5, PM/AD-17, PM/AD-23, or `mentorship.md`, the spine and companion win.

Historical `M-FR-*` aliases remain traceability references. This spec does not promote draft stories or scenarios to approved implementation contracts.

## 2. Domain boundary

Mentorship owns:

- The employee's open-to-mentoring availability fact (`MentorshipAvailability`).
- **Derived** mentorship status (never independently persisted).
- Durable active and ended mentor–mentee pairs (`MentorshipPair`).
- Manual and departure-driven pair closure.
- Closure notes stored on pairs.
- Company-wide willing-mentor pool and pair read surfaces.
- Application exports for S1 mentor and S13 summaries.
- Calls to the User Management career-event boundary for pair start/end.
- `applyDepartureEffects` participant matching PM/AD-23.

Mentorship does not own:

- Relationships or audience resolution; pairs are never `Relationship` rows or access edges.
- S13 access decisions or functional-permission evaluation.
- UserEvents persistence (PM/AD-30).
- All Employees filter engine.
- Employment departure scheduling/execution.
- Timetracker data.
- Goals, sessions, progress tracking, or notifications.

## 3. Core invariants

### 3.1 Availability and status

- Employees set or clear only their own open-to-mentoring flag via `MentorshipAvailability`.
- Availability is independent of pair state and is not a Relationship.
- Clearing the flag removes a mentor from future assignment without changing active pairs.
- Mentorship status (`open to mentoring` / `mentor`) is **derived** from availability plus active-pair-as-mentor count and is **never independently persisted** (PM/AD-17).
- Status is `mentor` while at least one active mentee exists.
- When the last pair ends, derived status returns to open-to-mentoring only if availability remains set.
- Effective departure sets availability to false in the same unit of work that auto-closes pairs (PM/AD-17, PM/AD-23).
- Dismissed people are excluded from the willing pool even if a leftover flag exists.
- Return to `active` employment does not restore availability; the person must opt in again.

### 3.2 Pair creation

- The assigner must hold the *assign and end mentorships* functional permission.
- Mentor selection comes from the company-wide willing pool.
- Mentee selection is restricted to people within the assigner's Access Control scope.
- Creating the first active pair changes derived mentor status.
- Pair creation appends the required `mentorship_start` event through the User Management application boundary in the same transaction (PM/AD-30).

### 3.3 Pair closure

- Manual closure records an end date and requires a non-empty closure note.
- The closure note is a pair field, not Feedback.
- Ended pairs are retained and queryable on both profiles.
- Closure appends `mentorship_end` through the User Management boundary in the same transaction.
- Departure auto-closes active pairs with a system-generated note and bypasses the manual-note requirement via `applyDepartureEffects` (PM/AD-23).

### 3.4 Visibility

- The willing pool includes only `active` employment plus set availability; it shows S1 identity data plus availability only and never exposes S13 pair detail.
- Self can read own mentor, mentees, and pair history subject to the normative matrix.
- Closure notes are visible only to Reporting line, Project line, and People Partner audiences.
- Mentor, mentee, Self, and Colleague views never receive closure-note content merely because they can see pair history.
- Access Control provides the base S13 decision; Mentorship may only narrow the result.

## 4. Approved aggregates and residual implementation detail

**Approved aggregate boundaries (PM/AD-5, PM/AD-17, `mentorship.md`):**

- `MentorshipPair` — durable pair with mentor, mentee, lifecycle `status ('active'|'ended')`, dates, closure note, and `endedByDepartureId` (nullable uuid, no DB FK) as the system-closed marker.
- `MentorshipAvailability` — `{userId PK, openToMentoring bool}`, one row per user, in `src/mentorship/`.

**Still implementation-level (not design reopeners):** exact Prisma column types beyond the approved fields, secondary indexes beyond those named in `mentorship.md`, and concrete DTO field names for read exports. Those are AD-1 delivery decisions and must not invent a second status store or alternate route tree.

Also required:

- Efficient active-pairs-by-mentor and active-pairs-by-employee lookup.
- Active and ended pair history lookup.
- Departure application operation `applyDepartureEffects({departureId, leaseToken, departingUserId, effectiveDate, tx})` (PM/AD-23).
- Career-event application operation exported by User Management accepting the shared transaction (PM/AD-30).
- Read exports for S1 mentor and S13 summaries without cross-context domain access.

## 5. Capabilities and traceability

| Capability | Canonical parent | Historical aliases | Story slice | Current state |
|---|---|---|---|---|
| Set/clear own availability | PM-FR-32 | M-FR-1, M-FR-3 | M-E1-S1.1 | specified; blocked |
| Self pair summary | PM-FR-32, PM-FR-34 | M-FR-2, M-FR-17 | M-E1-S1.5 | specified; blocked |
| Willing-mentor pool | PM-FR-34 | M-FR-4 | M-E1-S1.2 | specified; blocked |
| Scoped pair creation | PM-FR-33 | M-FR-5–7 | M-E1-S1.3 | specified; blocked |
| All-pairs view | PM-FR-34 | M-FR-8, M-FR-12 | M-E1-S1.5 | specified; blocked |
| Manual close and visibility | PM-FR-33 | M-FR-9–13 | M-E1-S1.4 | specified; blocked |
| Departure auto-close | PM-FR-33, PM-FR-41 | M-FR-14 | M-E1-S1.6 | specified; blocked |
| Directory status field | PM-FR-34 | M-FR-15 | M-E1-S1.2 | specified; platform dependency |
| S1 mentor field | PM-FR-12, PM-FR-34 | M-FR-16 | M-E1-S1.5 | specified; blocked |

## 6. API surface (approved)

Binding routes (PM/AD-5 / PM/AD-14 / `mentorship.md`):

- `GET /mentorship-pairs`
- `POST /mentorship-pairs`
- `GET /mentorship-pairs/:id`
- `POST /mentorship-pairs/:id/end`
- `GET /mentorship-pool`
- `GET /users/:id/mentorship-availability`
- `PATCH /users/:id/mentorship-availability` (Self-only)

Scenario names are provisional and do not create alternate route authority. Request/response DTO field detail remains AD-1 per feature.

## 7. Blocker register (canonical IDs only)

Local aliases `G-CTX` / `G-PERM` / `G-S13` / `G-CT` / `G-DEP` and `OQ-M1`–`OQ-M7` are **not** global blockers. Design resolved by PM/AD-5, PM/AD-17, PM/AD-23, PM/AD-30, and PM/AD-34 is not re-listed as open design. Live residuals map only to `blockers.yaml` IDs:

| Blocker | Impact |
|---|---|
| CC-10-MENTORSHIP | Design approved (PM/AD-5 / PM/AD-17). Source context, Prisma models, and production routes are **absent**. Residual: indexes/DTO shapes only — not aggregate/route redesign. |
| OQ-PERM-01 | Permission key delivery and default role assignments for assign/end are not confirmed. |
| AC-S9-S13 | Access Control facade lacks S13 base decisions and closure-note narrowing support. |
| OQ-AC-EDIT | Edit-permission / `canEdit` delivery gaps that still block dual-gate completion where Mentorship consumes them. |
| CC-09 | User Management career-event boundary is designed (PM/AD-30) and not implemented. |
| CC-06 | Departure participant contract is approved (PM/AD-23). Executor and participant implementation remain blocked; this spec does not close the gate. |

No gate is closed by publishing this domain spec. Aggregate boundaries, derived status, and the route list above are **not** open design questions.

## 8. Implementation evidence snapshot

As of 2026-09-02:

- No `services/backend/src/mentorship/` context exists.
- No Mentorship Prisma models or migrations exist.
- Draft architecture, one draft epic with six stories, 27 scenario documents, and committed-red E2E suites exist.
- All Mentorship sprint stories are backlog/blocked.
- User Management's former Relationship-based mentorship story and scenarios are retired and must not be revived.
- No frontend Mentorship UI exists.

The correct delivery state is `specified-blocked`, not implemented or in progress.

## 9. Quality and manual validation

Automation candidates:

- Availability and active-pair state transitions.
- Permission plus audience dual-gate checks.
- Closure-note required and restricted projection.
- Same-transaction pair/event behavior.
- Departure idempotency and automatic closure via PM/AD-23.
- History retention on both profiles.
- Derived status never written as a stored column.

Manual validation remains required for:

- Cross-context end-to-end journeys.
- Pool usability and assignment scoping.
- Closure-note visibility across real persona combinations.
- Failure recovery around departure and shared transactions.

## 10. Success criteria

Mentorship conforms when its context, schema, routes, permissions, S13 access increment, User Management event boundary, and departure integration have independently passed their gates; active and ended pairs behave as specified; status remains derived; and no pair or availability fact affects Access Control audience resolution.
