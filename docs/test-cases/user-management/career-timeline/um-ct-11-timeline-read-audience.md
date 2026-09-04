# UM-CT-11 · `GET /users/:id/events` is gated by the career-timeline read audience

**Trace:** requirements §3.2 row S9 "Career timeline" (Self `R`; Reporting line / Project line / PP `RW`; **Colleague `—`**) · §3.3.1 (a `—` cell must not leak through any surface) · epics.md Story 3.1 (read route exists so writes are observable) · access-control.md §5.3 timeline-section interim precedent · deferred-work.md — pending `profile:timeline` `canAccessSection` increment

> **Interim gate (v1.5).** `AccessControlFacade.canAccessSection` answers the
> three legacy section strings only today, so Story 3.1 gates this route the same
> way mentorship gates its timeline section: `resolveAudiences(viewer, [target])`
> ∩ `{ self, reporting, pp }` ≠ ∅ → allowed. Project-line is fail-closed
> system-wide (the resolver does not emit it yet) and will start matching with
> no change here once Access Control ships it. Marked `// INTERIM` in code with
> the expiry trigger "replace with `canAccessSection('profile:timeline', …)`".
> This scenario's assertions hold identically under the interim rule and the
> real section call.

## Scenario

**Given** Alice, a seeded employee (reports to Bob; assigned PP Paula); Eve, an
authenticated seeded employee with no relationship edge to Alice; and at least
one event on Alice's timeline (the `joined_company` row from her seeding,
`um-ct-01`).

**When** each persona reads `GET /users/:id/events` for Alice's id.

**Then** access follows the §3.2 "Career timeline" read row (S9), and a `200`
returns the standard **`{ data, canEdit }` envelope** — `data` = the event list
(newest-relevant order, soft-deleted rows absent), `canEdit` = whether this
viewer may manually add/correct events (the Story 3.2/3.3 dual gate — `false` for
every viewer until Story 3.2 ships):

| Reader | Relationship to Alice | Result |
| --- | --- | --- |
| Alice | Self | `200` `{ data: [...], canEdit: false }` |
| Bob | Reporting line (direct manager) | `200` `{ data: [...], canEdit: false }` |
| Paula | Assigned PP | `200` `{ data: [...], canEdit: false }` |
| Eve | Colleague (no edge) | `403` — the career-timeline row is `—` for Colleague; not `200` with `{ data: [] }`, not `404` |
| — (no/)invalid token | unresolved session | `401` |

`403` (not `404`) for the authenticated-but-unentitled reader matches the
user-management suite's established denial choice (`access-control-adoption`,
Dmytro 2026-09-01: authenticated → `403`, unauthenticated → `401`).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice's seeded
`Relationship` Alice→Bob `type='direct'` and her assigned-PP edge to Paula exist;
Eve has none. Stage 2 resolves every id from the seeded fixture table.

## Test

- **Test 1 — Self:** `GET /users/:id/events` `{ "headers": { "authorization": "Bearer <token:Alice>" } }` → `200`; `body.data` includes the `joined_company` event; `body.canEdit === false`.
- **Test 2 — Reporting line:** same, `Bearer <token:Bob>` → `200`; `body.canEdit === false`.
- **Test 3 — Assigned PP:** same, `Bearer <token:Paula>` → `200`; `body.canEdit === false`.
- **Test 4 — Colleague denied:** same, `Bearer <token:Eve>` → `403`; body carries no timeline data.
- **Test 5 — Unresolved session:** same, no `Authorization` header → `401`.
