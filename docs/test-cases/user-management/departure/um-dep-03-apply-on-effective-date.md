# UM-DEP-03 · Applying a departure on its effective date

**Trace:** PRD FR-6 · requirements §4.16 · epics.md Story 5.2 · access-control.md §revocation-timing ("From `00:00` effective date ... request-time auth denies the actor ... overrides the project 15-minute window") · AD-20 · AD-22 · AD-23

> **STALE IN PART — 2026-09-02 PM/AD-5 / PM/AD-23.** Scenario prose remains
> useful for employment, mentorship auto-close, and request-time cutoff.
> The clause "open action items owned by/assigned to Alice" is **stale**.
> Live rule: cancel only open items **assigned to** the departing user;
> items Alice authored for active assignees remain active. Persist cancelled
> status, fixed system reason, cancelledAt, and sourceDepartureId.
> Do not silently rewrite the expectedResult below. Regeneration is AD-1.
> Implementation remains blocked on CC-06 (executor) even though the participant
> contract is now approved.

> **Previously:** BLOCKED — CC-06; scenario prose only.

## Scenario

**Given** Alice has a recorded departure whose effective date has just been
reached (test drives a controllable clock — DEC-UM-004 pattern).

**When** the approved CC-06 executor processes it.

**Then** all of, in one idempotent application: employment status becomes
`dismissed`; her profile becomes read-only and drops off the default employee list
while remaining findable through an authorized employment-status filter
(`list/um-list-05`); open action items become `cancelled — departed`; active
mentorship pairs auto-close with a system note; her `User` account deactivates
(`isActive: false`); **every access Alice held ends immediately** at request time,
overriding the normal project-line 15-minute window; and **no** departure /
left-company event is added to her career timeline (employment status is the sole
source — FR-5 / Epic 3 Story 3.1).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has a `scheduled` departure; controllable clock; Alice holds some project-line access and has open action items and an active mentorship pair to prove each outcome.

## Test

- **stateChange:** the clock advances to `00:00` of the effective date; the CC-06 executor runs.
- **expectedResult:**
  - employment status read → `dismissed`; `GET /users/<aliceId>` (as an entitled actor) → read-only; Alice absent from `GET /users` default page, present under `?employmentStatus=dismissed`.
  - a request Alice previously could make (e.g. a read she held via project line) → denied at request time, immediately.
  - open action items owned by/assigned to Alice → status `cancelled — departed`.
  - Alice's active mentorship pairs → closed, each with a system closure note.
  - `GET /users/<aliceId>/events` → contains **no** departure/left-company event.
