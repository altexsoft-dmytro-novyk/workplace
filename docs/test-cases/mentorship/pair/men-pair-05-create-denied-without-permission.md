# MEN-PAIR-05 · Pair creation denied without *assign and end mentorships*

**Trace:** §4.11 · §2.3 · §2.2 dual gate · access-control.md denial conventions · PRD FR-M5 · epics.md Story 1.3

> **PROVISIONAL** body shape. Stage-2 blocked on G-CTX + G-PERM.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.
> Negative case, first-class.

## Scenario

**Given** Ida holds a custom functional role without *assign and end
mentorships*.

**When** Ida attempts to create a mentorship pair.

**Then** the response is `403` — the no-target `isAllowed` gate fails; no pair is
created.

**Preconditions:** [fixture](../README.md#canonical-personas); Ida holds no *assign and end mentorships* permission.

## Test

- **inputURL:** `POST /mentorship-pairs`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Ida>" }, "body": { "mentorId": "<monaId>", "menteeId": "<aliceId>" } }`
- **expectedResult:** `403`; leak-free body; no pair created.
