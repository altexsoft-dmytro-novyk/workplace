---
title: "Story 4.1: Change an Employee's Manager"
type: 'feature'
status: done
created: 2026-09-01
updated: 2026-09-03
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-4-1-hr-admin-assigns-or-revokes-reports-to.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-4-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — supersedes "HR Admin Assigns or
> Revokes Reports-To". **Reconciled 2026-09-03** to the 2026-09-02 architecture
> ratification (PM/AD-29 `AccessJournal` ratified — "Closes CC-07 design"): the
> journal-writing stages are no longer design-blocked. **NOT an AD-1 approval.**

## Intent

**Problem:** No mechanism records or queries who reports to whom. `User` carries
no manager pointer (Epic 1); the org-structure fact access-control's Reporting
line and dashboards need has nowhere to live, and no external system supplies it.
There is also no record of *who changed* a manager, *when*, or *from whom to
whom* — `Relationship` `DELETE` is a hard delete, so a reassignment destroys the
prior fact.

**Approach:** Story 4.1 stands up, for the whole epic:

- ~~The `Relationship` Prisma model~~ — **already shipped in Epic 0 migration
  `20260830010000_access_control_relationships`**: the `relationships` table, the
  `RelationshipType` enum, the partial `UNIQUE` indexes
  (`relationships_one_direct_per_user`, `relationships_one_people_partner_per_user`),
  the multi-armed `relationships_shape_check`, and `relationships_no_self_endpoint_check`
  all exist. Story 4.1 does **not** re-create them — it reads/writes through the
  existing `prisma.relationship` client. (Corrected 2026-09-03 at Stage 2.)
- The **`AccessJournal`** model + migration (PM/AD-29) — append-only;
  `before`/`after` jsonb snapshots; unique `idempotencyKey`; `kind` enum with
  all seven §3.4 values (`manager`, `people_partner`, `department_membership`,
  `department_manager`, `full_profile_grant`, `full_profile_revoke`,
  `shared_link_access`). Story 4.1 only ever **writes** `manager`.
- The **journal writer** — one `AccessJournal` INSERT in the **same transaction**
  as the `Relationship` write (AD-11 explicit call, no event bus / AD-11
  cross-context transaction rule).
- `POST /users/:id/relationships` (`type: 'direct'` only this story) +
  `DELETE /users/:id/relationships/:relationshipId` (AD-14 shape 4), invoked
  only from the dedicated organisational-relationship screen.
- `GET /users/:id/access-journal` — the §3.4 read endpoint, with the reader-authz
  gate.

4.2/4.3 reuse the `Relationship` model + migration and the journal writer/enum.

## Boundaries & Constraints — GATES

- **PM/AD-29 `AccessJournal` — design ratified 2026-09-02 (closes CC-07
  design).** The immutable schema, snapshot payload, reader authorization, and
  same-transaction enrolment contract are defined
  (`docs/architecture/database-schema.md` §AccessJournal;
  `docs/architecture/access-control.md` §3.4). The journal-writing stage-2 E2E
  and production stages **proceed** — they are no longer design-blocked. The
  table, writer, and read endpoint are implementation-absent (that is what this
  story builds). `UserEvents` is **not** a journal substitute — different owner
  (career timeline, PM/AD-30), no before/after columns, different reader
  authorization.
- **The `relationships/` scenario folder EXISTS** —
  `docs/test-cases/user-management/relationships/` with `um-rel-01..15` (Story
  4.1: `um-rel-01`, `-02`, `-03`, `-07`, `-08`, `-15`). The pre-v1.5 "blank
  page" / "confirm the folder + naming" gate is closed. Per-file human approval
  under AD-1 stage-1 is still required.
- **Interim journal-read gate.** `AccessControlFacade` has no `full` audience and
  no journal section today. The read route gates like the S9 timeline read
  (`um-ct-11`): `resolveAudiences(viewer,[subject]) ∩ {reporting, pp} ≠ ∅`.
  Self and HR-Admin-by-FR are **not** readers. `// INTERIM`, expiry trigger =
  the §2.4 `full`-audience resolver (`deferred-work.md`).

## Boundaries & Constraints — behaviour

**Always:**
- AD-1 gate: draft → per-file approval → red E2E → implementation.
- The write requires the dedicated **`change organisational relationships`**
  permission (no-target `isAllowed` through the facade — not "HR Admin", not
  inline role logic; DEC-UM-002), **rejects self-assignment**
  (`userId <> reportsToUserId` DB `CHECK` + app guard), and affects
  Reporting-line access on the **next request**.
- One `AccessJournal` row (`kind: 'manager'`) commits in the **same transaction**
  as every `Relationship` create and delete: `create` → `before: null`,
  `after` = edge snapshot; `delete` → `before` = edge snapshot, `after: null`.
- `Relationship` rows are **hard-deleted** — no `deletedAt`/`isActive`.
- At most one active `direct` edge per employee, enforced by the DB partial
  `UNIQUE` (`type='direct'`), not an app-level pre-check.
- **DEC-UM-005:** reassignment is explicit `DELETE` then `POST`; a second `POST`
  while a `direct` edge exists → `409` (accepted residual: a failed `POST` after
  a successful `DELETE` can briefly leave the employee manager-less). On the
  `409` the whole transaction rolls back — **no** journal row is written.
- `AccessJournal` is append-only: no `PATCH`/`PUT`/`DELETE` route exists.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.

**Never:**
- No bespoke `/users/:id/manager` endpoint — use the generic `relationships`
  endpoint.
- No `type: 'project'`/`type: 'people_partner'` handling here (`project` is
  sync-only PM/AD-31; `people_partner` is 4.2's scope).
- No `manager_change` `UserEvents` type — no named consumer (AD-11); the manager
  change is journaled, not timelined.
- `AccessJournal` is **not** an access-control mechanism — it is never read on
  the audience-resolution path (`database-schema.md` §AccessJournal).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Scenario |
|---|---|---|---|
| Assign | Alice has no edge; Root holds the permission; `POST {type:'direct', targetId: bob}` | `201`; `Relationship` row created; **one `AccessJournal` row** `kind:'manager'`, `before:null`, `after:` edge snapshot, committed in the same tx; Reporting-line access resolves through Bob next request | `um-rel-01` |
| Revoke | Alice → Bob edge exists; `DELETE .../:relationshipId` | `200`; row hard-deleted; **one `AccessJournal` row** `before:` edge snapshot, `after:null`, same tx | `um-rel-02` |
| Reassign without revoke | Alice has a `direct` edge; second `POST` different target | `409` (DB partial `UNIQUE`, DEC-UM-005); existing edge unchanged; **transaction rolls back — no journal row** | `um-rel-03` |
| Self-assignment | Actor targets themselves (`userId == reportsToUserId`) | Rejected; no `Relationship` row, no `AccessJournal` row | `um-rel-03`-adjacent / DB `CHECK` |
| Unauthorized | Actor lacks `change organisational relationships` (Ida) | `403` before the transaction opens; no `Relationship`, no `AccessJournal` | `um-rel-07` |
| Concurrent assign | Two parallel `POST`s, different targets | Exactly one `201` + one journal row; the other `409` + no journal row; one final edge | `um-rel-08` |
| Journal append-only | Existing `manager` journal row | No route mutates it; later unrelated mutations only append new rows | `um-rel-15` T1 |
| Journal idempotency | Same fact transition reached twice | `idempotencyKey` unique constraint / `ON CONFLICT DO NOTHING` → exactly one row | `um-rel-15` T2 |
| Journal read | `GET /users/:id/access-journal` | Reporting-line manager → `200 {data}`; assigned PP → `200`; Self → `403`; colleague → `403`; HR Admin by FR alone → `403`; no token → `401` | `um-rel-15` T3 |

## v1.5 Cutover Notes

- **AD-11 schema hazard:** `AccessJournal`'s unique `idempotencyKey` is plain,
  but if any partial index is needed it has no `schema.prisma` representation in
  Prisma 7.x — hand-author as raw SQL in the migration (`--create-only` then edit
  `migration.sql`), matching the repo's established raw-SQL constraint pattern.
  Story 4.1 owns the `AccessJournal` migration for the epic. The `Relationship`
  table + all its constraints already shipped in Epic 0 migration
  `20260830010000_access_control_relationships` — **not re-authored here.**
  **Do NOT run bare `prisma migrate dev`** — it spuriously drops the
  access-control raw-SQL FKs (known footgun); use `--create-only` + hand-edit,
  additive only, and re-verify `acm1r-fr-foundation` after.
- v1.5 `Relationship.type` is `'direct' | 'project' | 'people_partner'` — the
  pre-v1.5 `'mentorship'` arm is replaced (AD-17).
- `AccessJournal` PK is `uuidv7`; `occurredAt` is `timestamptz`.

## Open Questions / Gates

- **`idempotencyKey` derivation.** Proposed interim (Story 4.1):
  `hash(actorUserId, subjectUserId, kind, relationshipId, operation)` with
  `operation ∈ {'create','delete'}` — naturally unique per fact transition, no
  client token needed. Open: should the `relationships` endpoints also accept an
  `Idempotency-Key` **header** (as departures do)? Recommended deferred.
- **Journal read response shape.** Proposed `{ data: AccessJournalRow[] }`
  envelope (house convention), **no `canEdit`** (append-only). Confirm bare-array
  vs `{ data }` at the gate.
- **`DELETE` route shape.** `DELETE /users/:id/relationships/:relationshipId`
  (AD-14 shape 4, path param — matches `um-rel-02`). Not a body-carrying
  `DELETE /users/:id/relationships` (that `If-Match` shape is the PP edge's,
  4.2). Confirm.
- **`kind` enum spelling.** `database-schema.md` uses `manager` /
  `people_partner` / `department_membership`; `epic-4-context.md` prose uses
  `manager_change` etc. Ratified schema wins — flag the context doc for the
  PO/architect to reconcile.
- **§2.4 full-profile-overlay journal reader leg** — deferred behind the
  `full`-audience resolver (`deferred-work.md`); the interim gate is
  `∩ {reporting, pp}`.
- **Under-specified in the ratified AD-29 design (flag for PO/architect):**
  (a) no stated retention / purge policy for `AccessJournal` rows (append-only
  forever?); (b) `shared_link_access` is a *view event* with no `before`/`after`
  fact — the `before`/`after` semantics for non-state `kind`s are unstated;
  (c) whether the read endpoint paginates (§7 NFR is explicitly *not* applied to
  the journal, but an unbounded `GET` on a long-lived subject still needs a
  page contract); (d) exact `before`/`after` snapshot schema per `kind` (which
  fields of the edge/grant are captured) is left to each writing story.
