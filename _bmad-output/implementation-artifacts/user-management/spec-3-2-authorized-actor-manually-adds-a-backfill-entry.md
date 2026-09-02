---
title: 'Story 3.2: Authorized Actor Manually Adds a Backfill Entry'
type: 'feature'
status: done
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-3-2-pp-manager-line-manually-adds-a-backfill-entry.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-3-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — supersedes "PP/Manager-Line
> Manually Adds a Backfill Entry"; **NOT an AD-1 approval.**
>
> **Stage-1 scenario reconciliation 2026-09-02 (Dmytro).** The dual gate is
> **split in time**: Story 3.2 ships the manual-add path gated on the
> `profile:timeline:write` **feature permission alone** (an HR-Admin backfill
> action, no data-audience half); the DEC-UM-001 audience narrowing (assigned PP
> + direct Unit Manager) is a **deferred refinement** that activates when the
> FR-permission-matrix grants `profile:timeline:write` to non-HR-Admin roles. See
> the ⚠️-to-ratify note below and in
> [`career-timeline/README.md`](../../../docs/test-cases/user-management/career-timeline/README.md).

## Intent

**Problem:** Story 3.1 auto-writes events, but nothing lets an authorized actor
backfill history that predates the system (the legacy Excel headcount record —
requirements §4.9 manual override).

**Approach:** Add `POST /users/:id/events`, gated at this stage on the
**`profile:timeline:write` feature permission alone** —
`isAllowed(actor, 'profile:timeline:write')`, a no-target feature-action check
through `ACCESS_CONTROL_PORT`, **no `canAccessSection` call**. `profile:timeline:write`
is seeded and granted to the **`hr-admin` role only** at this stage. Add a
`CreateUserEventDto` and a domain `add-manual-user-event.service.ts` that stamps
`source: "manual"` server-side and persists via Story 3.1's repository. The
`201` response is the **bare `UserEventResponse`**
(`{ id, type, eventDate, details, source, createdAt }`), not the
`{ data, canEdit }` envelope — matching how `PATCH /users/:id` returns the bare
user.

**Why feature-action-only, not the full §2.2 dual gate, at this stage:** the only
seeded `profile:timeline:write` holder is the `hr-admin` role, and **HR Admin
holds no S9 write audience at all** (§2.2 NORMATIVE — "HR Admin grants no data
access"). Requiring the audience half now would close the gate to *everyone*. The
FR-permission-matrix treats bulk-migration actions (`directory:import`,
`org:relationships:write`) as feature actions; HR-Admin backfill of the legacy
Excel headcount record is that same shape.

**Read-back — edit implies read (Dmytro, 2026-09-02).** Story 3.2 also widens the
Story 3.1 `GET /users/:id/events` read gate: `canReadTimeline(viewer, target)` is
true when the S9 read audience matches (`resolveAudiences ∩ {self, reporting, pp}`,
the Story 3.1 interim) **OR** `isAllowed(viewer, 'profile:timeline:write')` is
true. So the HR-Admin backfill actor can `GET` the timeline back — `200 {data,
canEdit: true}` — even with no S9 read audience. This is the **timeline-scoped
interim** of the §2.4 *Full profile access* grant ("HR Admin can do and see
everything"); resolver-level `full`-audience support is a deferred Access Control
item (`_bmad-output/implementation-artifacts/access-control/deferred-work.md`).
`canEdit` in the envelope is unchanged: `isAllowed(viewer, 'profile:timeline:write')`.

> **⚠️ To ratify (requirements tension — flag, do not resolve here).** DEC-UM-001
> as written scopes manual timeline mutation to the assigned PP + the direct Unit
> Manager **by data audience**. This stage ships it as an HR-Admin **feature
> action** with no audience half. The two must be reconciled by the PO when the
> FR-permission-matrix (`_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md`,
> §6 item 4) grants `profile:timeline:write` to the PP / Unit-Manager roles — at
> which point those grants must be **scoped** (a PP backfills only their own
> assignees; a UM only their own department's people), reactivating `um-ct-03` /
> `um-ct-04` / `um-ct-09`.

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-ct-12` (HR-Admin add) + `um-ct-10` (audience without permission
  → denied) scenario docs → red E2E → implementation. `um-ct-03` / `um-ct-04` /
  `um-ct-09` are `it.todo` (deferred — see Open Questions).
- **Feature-permission gate (this stage):** `isAllowed(actor,
  'profile:timeline:write')` through the `ACCESS_CONTROL_PORT` facade — a
  no-target check, never inline role logic, never a `User.position` check
  (AD-4 / DEC-UM-002). **No `canAccessSection` call** — the deferred DEC-UM-001
  audience half is not wired yet.
- **Read gate widening (`GET /users/:id/events`):** admit a
  `profile:timeline:write` holder in addition to the S9 read audience —
  `canReadTimeline = <S9 read audience> || isAllowed(viewer, 'profile:timeline:write')`.
  Update Story 3.1's `// INTERIM` timeline-read rule in place; keep the same
  expiry trigger. Timeline-scoped interim of §2.4 full-profile access.
- Every manual entry is stamped `source: "manual"` server-side.
- Reuse Story 3.1's `UserEventRepositoryPort` and model as-is — no schema change.
- A new row is always created active (`deletedAt: null`); this endpoint never
  touches an existing row.
- `createdBy` = the authenticated actor's id, server-set.

**Never:**
- Don't accept `id`, `deletedAt`, `source`, or `createdBy` in the request body —
  `whitelist` strips unknown/forbidden keys **silently** (no `400`), consistent
  with the rest of UM's DTOs; `source` is always server-stamped `"manual"`.
- Don't wire a `canAccessSection` / data-audience check at this stage (deferred —
  DEC-UM-001 narrowing, pending the FR-matrix grant).
- Don't grant `profile:timeline:write` to any role other than `hr-admin` at this
  stage.
- Don't modify or soft-delete an existing row — that's Story 3.3.
- Don't return the `{ data, canEdit }` envelope on `POST` — bare resource only.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| HR Admin adds backfill | Root (holds `profile:timeline:write` via `hr-admin`), `POST /users/<aliceId>/events` with `{ type, eventDate, details }`, `eventDate` pre-dating the system | `201`, bare `UserEventResponse`, `source: "manual"` server-stamped, `deletedAt: null` (`um-ct-12`) |
| HR Admin reads the timeline back | Root `GET /users/<aliceId>/events` (no S9 read audience, holds `profile:timeline:write`) | `200 { data, canEdit: true }` — edit implies read; the backfilled event is in `data` (`um-ct-12` Test 2) |
| Body carries server-owned fields | `id` / `deletedAt` / `source` / `createdBy` present in the body | `201`; keys stripped silently by `whitelist`; server values used (`um-ct-12` Test 3) |
| Missing/invalid `type` | `type` absent or not a non-empty string | `400`, nothing written (`um-ct-12` Test 4) |
| Missing/invalid `eventDate` | `eventDate` absent or not a valid date | `400`, nothing written (`um-ct-12` Test 5) |
| Has audience, lacks permission | Bob (Alice's direct UM) but no `profile:timeline:write` | `403`, no event written — feature-permission gate alone denies him; the relationship is irrelevant at this stage (`um-ct-10`) |
| Unrelated feature permission only | Ida (DEC-UM-002 probe) | `403`, no event written (`um-ct-12` Test 6); missing/invalid token → `401` |
| PP / UM adds backfill | Paula (assigned PP) / Bob (direct UM) | **Deferred** (`it.todo`) — needs the FR-matrix grant + DEC-UM-001 scoping (`um-ct-03`, `um-ct-04`) |
| Holds permission, not assigned PP / direct UM | non-scoped holder of `profile:timeline:write` | **Deferred** (`it.todo`) — the denial does not hold until the DEC-UM-001 narrowing lands; today such a holder would be allowed (`um-ct-09`) |

## v1.5 Cutover Notes

- The pre-v1.5 spec framed the actor as "PP or Manager-line (unit manager)".
  v1.5 keeps that as the **target end-state** (DEC-UM-001 + the
  `profile:timeline:write` permission) but sequences it: Story 3.2 ships only the
  HR-Admin feature-action path; the PP / UM audience-scoped paths reactivate with
  the FR-matrix grant. Routed through the **real** facade (Epic 0's adapter), not
  a fixture fake.
- Section keys use the human FR-matrix name `profile:timeline`; the `S9` label is
  the requirements §3.2 row id, cited for traceability only.

## Open Questions / Gates

- **Scenario-stage decisions put up for the AD-1 Stage-1 gate (2026-09-02):**
  1. `POST` `201` returns the **bare `UserEventResponse`**
     (`{ id, type, eventDate, details, source, createdAt }`), not the
     `{ data, canEdit }` envelope — matches `PATCH /users/:id` returning the bare
     user; the envelope is a read convention (Story 3.1's `GET`).
  2. `CreateUserEventDto` **silently strips** `id` / `deletedAt` / `source` /
     `createdBy` via `whitelist` (no `400`), consistent with the rest of UM;
     `source` is always server-stamped `"manual"`.
  3. `um-ct-03` / `um-ct-04` / `um-ct-09` are reframed as **deferred `it.todo`**
     (target end-state prose retained), unblock trigger = the FR-matrix grant of
     `profile:timeline:write` to PP / Unit-Manager roles + the DEC-UM-001
     audience scoping.
- **⚠️ Requirements tension (needs a PO call, not resolved here):** DEC-UM-001's
  audience narrowing vs shipping this as an HR-Admin feature action — see the
  ⚠️-to-ratify note in Intent and `career-timeline/README.md`. **Separate from
  the resolved read-back rule below.**
- **`profile:timeline:write` seed** — this stage needs the key seeded and granted
  to the `hr-admin` role (a kernel/ACM seed change, like the
  `user-management:edit` sequence the FR-matrix §8 tracks). Confirm the seed
  path with Access Control.
- **RESOLVED 2026-09-02 (Dmytro) — timeline read-back for the write holder.**
  "Edit implies read": `canReadTimeline = <S9 read audience> || isAllowed(viewer,
  'profile:timeline:write')`. HR Admin reads the timeline it may write; `canEdit:
  true` is observable via `GET`. The general "HR Admin sees everything" is the
  §2.4 Full-profile-access grant — a **deferred Access Control item** (resolver
  `full`-audience / bypass support), logged in
  `_bmad-output/implementation-artifacts/access-control/deferred-work.md`; do not
  spec it here.
- S9 `canAccessSection` support remains a pending access-control increment; it is
  **not** on this story's critical path any more (the audience half is deferred),
  but it gates the reactivation of `um-ct-03` / `um-ct-04` / `um-ct-09`.
