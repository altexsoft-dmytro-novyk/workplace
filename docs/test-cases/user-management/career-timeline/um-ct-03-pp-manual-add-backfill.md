# UM-CT-03 · PP manually adds a backfill entry

**Trace:** requirements §4.9 · PRD FR-5, FR-12 · epics.md Story 3.2 (Authorized Actor Manually Adds a Backfill Entry) · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) (manual write = assigned PP + direct Unit Manager only) · [DEC-UM-011](../../../architecture/user-management-test-decisions.md) · access-control.md §2.2 dual gate + §3.3 (DEC-UM-001 S9 write exception)

> **The gate is the §2.2 dual gate.** The actor needs **both** the runtime *edit
> the career timeline* permission **and** the narrowed S9 write audience
> (assigned PP or the employee's direct Unit Manager — not "any manager", not a
> transitive or project-derived manager). Paula qualifies as the assigned PP.
>
> **Stage-2 partially AC-blocked.** `AccessControlFacade.canAccessSection`
> supports `'S1'`, `'S10'`, `'S11'` only today (ACM-5); **S9 section access is a
> pending Access Control increment**. Until it ships, the S9-write half of this
> dual gate has no facade call to make — stage-2 for `um-ct-03..08` and
> `um-ct-09..10` is partially blocked on that increment. Scenario prose proceeds.

## Scenario

**Given** Paula, Alice's assigned people partner.

**When** Paula manually adds a `mentorship_end` entry dated before the system existed, sourced from the legacy Excel record.

**Then** the entry is created with `source: "manual"` and appears in Alice's timeline.

This scenario proves the **manual backfill path only** (DEC-UM-011). It does not exercise Epic 4's automatic `mentorship_end` from relationship unpair — that is covered by `relationships/um-rel-05`.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **Test 1 — the write**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "type": "mentorship_end", "eventDate": "2024-03-15", "details": {} } }`
  - **expectedResult:** `201`; body reflects `source: "manual"`, `type: "mentorship_end"`.
- **Test 2 — observing it in the timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; list includes the entry from Test 1.
