# UM-REL-15 · Access journal — append-only, idempotent write, reader-authorized read

**Trace:** epics.md Story 4.1 (Change an Employee's Manager) · PRD FR-10 · requirements §3.4 (Relationship and access journal) · access-control.md §3.4 ("readers via AccessControl … HR Admin by functional role is not a journal reader") · PM/AD-29 `AccessJournal` (design ratified 2026-09-02, closes CC-07) · [database-schema.md](../../../architecture/database-schema.md) §AccessJournal · deferred-work.md (§2.4 `full`-audience resolver — deferred reader leg)

This scenario covers the `AccessJournal` itself — the table Story 4.1 stands up
alongside `Relationship`. Story 4.1 only ever **writes** `kind: 'manager'`
(`um-rel-01`, `um-rel-02`, `um-rel-08`); this file pins the table's own
invariants and the read endpoint.

## Scenario-stage decisions (for the human gate)

- **`kind` enum values.** From `database-schema.md` §AccessJournal:
  `manager`, `people_partner`, `department_membership`, `department_manager`,
  `full_profile_grant`, `full_profile_revoke`, `shared_link_access`. The
  migration lands the full enum; Story 4.1 writes only `manager`. (Note: the
  Epic 4 context prose uses `_change`-suffixed spellings — `manager_change`
  etc. — `database-schema.md` is the ratified binding shape and wins; flag the
  spelling drift for the PO/architect to reconcile in the context doc.)
- **`idempotencyKey` derivation (interim, Story 4.1).**
  `idempotencyKey = hash(actorUserId, subjectUserId, kind, relationshipId, operation)`,
  `operation ∈ {'create','delete'}`. A `direct` edge row id (uuidv7) is created
  once and deleted once, so a retried mutation that reaches the same fact
  transition produces the same key and the unique constraint (or an
  `ON CONFLICT DO NOTHING` upsert-guard) prevents a second row. No
  client-supplied request id is required for this story. Flagged: whether the
  `relationships` endpoints should also accept an `Idempotency-Key` **header**
  (as `POST /users/:id/departures` does) — recommended deferred until an
  at-least-once writer exists.
- **Read endpoint + response shape.** `GET /users/:id/access-journal` returns
  `{ data: AccessJournalRow[] }` — a `{ data }` envelope (house convention),
  **no `canEdit`** (the resource is append-only; nobody edits a journal row).
  Each row: `{ id, occurredAt, actorUserId, subjectUserId, kind, before, after }`.
  Newest-first order.
- **Interim read-authz gate.** `AccessControlFacade` has no `full` audience and
  no journal-specific section today, so this route gates the same sanctioned way
  the S9 timeline read gate does (`um-ct-11`):
  `resolveAudiences(viewer, [subject]) ∩ { reporting, pp } ≠ ∅ → 200`, else
  `403`. **Self is not in the set** — §3.4 lists the subject's *current
  Reporting-line manager*, *assigned PP*, and *full-profile-overlay holder* as
  readers; the subject themselves is not a listed reader. **HR Admin by
  functional role alone is not a reader** — no `isAllowed` leg here (unlike the
  timeline's "edit implies read"). Marked `// INTERIM` in code with the expiry
  trigger *"replace with the §2.4 `full`-audience resolver + a journal reader
  predicate when that increment reaches stage-3-production"* — `deferred-work.md`
  tracks the `full`-audience resolver item and now names this reader leg.

## Test 1 — append-only: no endpoint mutates a journal row

**Given** Alice → Bob `direct` edge and its `manager` journal row exist
(`um-rel-01`).

**When** any client attempts to change or remove that journal row.

**Then** there is no route that does it: `AccessJournal` has no `PATCH`, no
`PUT`, no `DELETE` surface anywhere in the router tree (api-conventions.md — the
only journal route is `GET /users/:id/access-journal`). Stage 2 asserts the
row's `id`, `occurredAt`, `before`, `after`, `actorUserId`, `subjectUserId`,
`kind` are byte-identical before and after a subsequent unrelated mutation on
Alice's edge (`um-rel-02` then `um-rel-01` again) — the earlier row is never
touched, only new rows are appended.

## Test 2 — idempotent write: a retried mutation does not double-write

**Given** Root has just assigned Alice → Bob; the transaction committed the
`Relationship` row and one `manager` `AccessJournal` row, but the client did not
observe the response.

**When** the same logical create is retried (same actor, subject, target).

**Then** the retry hits the DB partial `UNIQUE` on `Relationship (type='direct')`
and returns `409` (DEC-UM-005) — the fact write does not happen a second time,
so the journal write does not either. Stage 2 asserts exactly **one** `manager`
journal row for `subjectUserId: aliceId` after the retry. *(Where a writer
instead reaches the same fact transition without the `409` — e.g. an internal
at-least-once retry of the delete in `um-rel-02` — the `idempotencyKey` unique
constraint / `ON CONFLICT DO NOTHING` guard is what prevents the second row;
stage 2 seeds that path by invoking the journal writer twice with the same
derived key and asserts one row.)*

## Test 3 — read + reader authorization

**Given** Alice (subject) has: a current `direct` edge to Bob (Reporting line),
a current `people_partner` edge to Paula (assigned PP), and at least one
`manager` journal row from `um-rel-01`. Eve is an authenticated employee with no
edge to Alice. Root holds the `hr-admin` FR policy and no relationship edge to
Alice.

**When** each persona calls `GET /users/<aliceId>/access-journal`.

**Then:**

| Reader | Relationship to Alice | Result |
| --- | --- | --- |
| Bob | current Reporting-line manager | `200` `{ data: [ { kind: 'manager', before, after, actorUserId, subjectUserId, occurredAt } ] }` |
| Paula | assigned People Partner | `200` `{ data: [...] }` |
| Alice | Self (not a §3.4 reader) | `403` — leak-free body |
| Eve | colleague / unrelated session | `403` |
| Root | HR Admin by functional role **only** | `403` — explicitly not a journal reader (access-control.md §3.4) |
| — | no / invalid token | `401` |

The §2.4 full-profile-overlay holder is **also** a reader, but that overlay's
resolver support is deferred (`deferred-work.md` — no `full` audience today), so
that leg is not asserted at this stage. When the `full`-audience resolver ships,
the interim `∩ { reporting, pp }` gate is replaced with
`∩ { reporting, pp, full }` (or an explicit journal-reader predicate) with no
change to the assertions above.

**Preconditions:** [fixture](../README.md#canonical-personas). Because the
outcome depends on **real** Phase-0 audiences, stage 2 seeds real `User` +
`Relationship` rows and the header is `Bearer <token:<seeded-uuid>>` for Bob,
Paula, Alice, and Eve (per the suite convention — a persona literal resolves to
a non-existent id → empty audience → `403`). Root uses `Bearer <token:Root>`.

## Test

- **Test 3a — Reporting line reads:** `GET /users/<aliceId>/access-journal` `{ "headers": { "authorization": "Bearer <token:<bobId>>" } }` → `200`; `body.data` is a non-empty array; each row has `kind`, `before`, `after`, `actorUserId`, `subjectUserId`, `occurredAt`; no `canEdit` key.
- **Test 3b — assigned PP reads:** same, `Bearer <token:<paulaId>>` → `200`.
- **Test 3c — Self denied:** same, `Bearer <token:<aliceId>>` → `403`; body carries no journal data.
- **Test 3d — colleague denied:** same, `Bearer <token:<eveId>>` → `403`.
- **Test 3e — HR Admin (FR only) denied:** same, `Bearer <token:Root>` → `403`.
- **Test 3f — unresolved session:** same, no `Authorization` header → `401`.
