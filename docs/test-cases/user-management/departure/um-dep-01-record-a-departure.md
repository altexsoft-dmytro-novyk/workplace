# UM-DEP-01 · Record a future departure without changing current status

**Trace:** PRD FR-6 · requirements §4.16 · epics.md Story 5.1 · api-conventions.md "Departure command and status (AD-20)"

> **BLOCKED — CC-06; scenario prose only.** Not translatable to stage-2 or
> production until CC-06 defines the scheduled-departure state and the
> effective-date executor. Employment status is a time-bounded business fact
> (`active` / `dismissed`), distinct from `User.isActive`.

## Scenario

**Given** Alice is an active employee who manages nobody, manages no
department/project, and is nobody's People Partner; and an actor holds the
*record a departure* permission.

**When** the actor submits `POST /users/<aliceId>/departures` with an
`Idempotency-Key` header and `{ effectiveDate: <future date>, reason: <text> }`.

**Then** the response is `201`; the scheduled departure is stored with its
effective date and reason; and Alice's **current** employment status stays
`active` and her account stays usable **until** that date — recording is a
schedule, not an immediate state change.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice manages/partners nobody; actor holds *record a departure*.

## Test

- **Test 1 — record**
  - **inputURL:** `POST /users/<aliceId>/departures`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>", "Idempotency-Key": "<key>" }, "body": { "effectiveDate": "2026-12-01", "reason": "relocation" } }`
  - **expectedResult:** `201`; body reflects the scheduled effective date and reason; no session/status side effects.
- **Test 2 — status unchanged before the date**
  - **inputURL:** `GET /users/<aliceId>/departures/<departureId>`
  - **expectedResult:** `200`; state is `scheduled`; a separate employment-status read still shows `active`; Alice still appears on the default employee list.
