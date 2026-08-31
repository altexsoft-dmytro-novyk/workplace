# UM-DEP-02 · Recording a departure is blocked while responsibilities remain

**Trace:** PRD FR-6 · requirements §4.16 · epics.md Story 5.1 (second AC) · api-conventions.md "Departure command and status (AD-20)" · access-control.md §revocation-timing ("Recording is rejected while the person manages or partners anyone")

> **BLOCKED — CC-06; scenario prose only.** The authoritative blocker set,
> `expectedBlockerVersion` digest, and re-parent command are the CC-06 / AD-20
> contract. Not translatable to stage-2 or production until CC-06 is approved.

## Scenario

**Given** Alice still holds at least one v1.5 management relation — she is the
`direct` manager of Bob, or the assigned People Partner of Nina, or the manager of
a department — and an actor holds the *record a departure* permission.

**When** the actor submits `POST /users/<aliceId>/departures` with a future
effective date and reason.

**Then** the response is `409` **before any schedule is written**; the body
contains leak-safe summaries of the blocking relationships the caller may
administer, and — where available — Alice's own manager as a default re-parent
target; and no `departures` row is created.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice manages Bob (or is Nina's PP, or manages a department); actor holds *record a departure*.

## Test

- **inputURL:** `POST /users/<aliceId>/departures`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>", "Idempotency-Key": "<key>" }, "body": { "effectiveDate": "2026-12-01", "reason": "relocation" } }`
- **expectedResult:** `409`; body lists the blocking relationship identities/targets (leak-safe) and a default remediation target; a follow-up read shows no scheduled departure for Alice.
