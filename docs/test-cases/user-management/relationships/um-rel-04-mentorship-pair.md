# UM-REL-04 · HR Admin pairs mentorship and fires mentorship_start

> **SUPERSEDED / RETIRED (v1.5, 2026-09-01).** Mentorship pair lifecycle has left
> User Management (AD-17). The dedicated **Mentorship** bounded context — now
> planned at `_bmad-output/planning-artifacts/mentorship/epics.md` +
> `prd-mentorship-2026-09-01/`, with scenarios at **`docs/test-cases/mentorship/`**
> — owns the durable willing pool, scoped mentee selection, pair lifecycle,
> closure notes, availability, and departure auto-close. `mentorship_start` /
> `mentorship_end` reach User Management **only** as career events, appended via
> an approved cross-context application boundary (Epic 3 Story 3.1, third AC).
> This file is retained as history only — do not translate to stage-2, do not
> cite, do not approve. v1.5 Epic 4 Story 4.2 is now **Change an Employee's
> People Partner** (`um-rel-09..11`).

**Trace (historical):** epics.md (pre-v1.5) Story 4.2 · FR-14 · AD-11

## Scenario

**Given** Alice has no active mentorship edge.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'mentorship', targetId: <paulaId> }`.

**Then** the response is `201`, a `Relationship` row is created (Alice mentee, Paula mentor), and a system `UserEvents` row with `type: "mentorship_start"` is written in the same transaction chain as the mutation.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test 1 — create mentorship edge

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "type": "mentorship", "targetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `201`.

## Test 2 — system event

- **inputURL:** `GET /users/<aliceId>/events`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `200`; list includes `type: "mentorship_start"`, `source: "system"`.

**Distinct from** `um-ct-03`, which proves manual backfill only (DEC-UM-011).
