# UM-REL-05 · HR Admin unpairs mentorship and fires mentorship_end

> **SUPERSEDED / RETIRED (v1.5, 2026-09-01).** Mentorship pair lifecycle has left
> User Management (AD-17) — see `um-rel-04`'s header. Now planned in the
> `mentorship` context; scenarios at `docs/test-cases/mentorship/` (see
> `end/men-end-*` for pair closure and `mentorship_end`). Retained as history only.

**Trace (historical):** epics.md (pre-v1.5) Story 4.2 · FR-14 · AD-11

## Scenario

**Given** Alice has an active mentorship edge to Paula (`um-rel-04`).

**When** Root submits `DELETE /users/<aliceId>/relationships/<relationshipId>`.

**Then** the response is `200`, the relationship row is hard-deleted, and a system `UserEvents` row with `type: "mentorship_end"` is written.

**Preconditions:** [fixture](../README.md#canonical-personas); active mentorship edge exists.

## Test 1 — revoke edge

- **inputURL:** `DELETE /users/<aliceId>/relationships/<relationshipId>`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `200`.

## Test 2 — system event

- **inputURL:** `GET /users/<aliceId>/events`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `200`; list includes `type: "mentorship_end"`, `source: "system"`.
