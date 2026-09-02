---
title: 'Story 3.3: Authorized Actor Edits or Deletes an Event'
type: 'feature'
status: done
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-3-3-pp-manager-line-corrects-or-deletes-an-event.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-3-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — supersedes "PP/Manager-Line
> Corrects or Deletes an Event"; **NOT an AD-1 approval.**
>
> **Stage-1 scenario reconciliation 2026-09-03 (Dmytro).** Story 3.3 follows
> Story 3.2's split-gate shape exactly: it ships the soft-delete path
> (`DELETE /users/:id/events/:eventId`) gated on the `profile:timeline:write`
> **feature permission alone** (an HR-Admin correction action, no data-audience
> half); the DEC-UM-001 audience narrowing (assigned PP + direct Unit Manager)
> is a **deferred refinement** that activates when the FR-permission-matrix
> grants `profile:timeline:write` to non-HR-Admin roles. See the ⚠️-to-ratify
> note below and in
> [`career-timeline/README.md`](../../../docs/test-cases/user-management/career-timeline/README.md).

## Intent

**Problem:** Stories 3.1/3.2 write events; nothing lets an authorized actor
remove a wrongly-inferred or wrongly-added event. The domain rule is explicit: a
correction is **never** an in-place edit.

**Approach:** Add `DELETE /users/:id/events/:eventId` — **soft-delete only**: it
sets `deletedAt`, the row persists, and `deletedAt` is never exposed to any
caller. Gate it, at this stage, on the **`profile:timeline:write` feature
permission alone** — `isAllowed(actor, 'profile:timeline:write')`, a no-target
feature-action check through `ACCESS_CONTROL_PORT`, **no `canAccessSection`
call** — identical to Story 3.2's manual-add gate. `profile:timeline:write` is
seeded and granted to the **`hr-admin` role only** at this stage. Extend Story
3.1's `UserEventRepositoryPort` with a scoped `softDelete(userId, eventId)` and a
scoped lookup; `listForUser` already excludes `deletedAt IS NOT NULL`.

A **"correction"** is **two sequential client calls** — this `DELETE`, then Story
3.2's `POST /users/:id/events`. There is **no** separate "correct" endpoint and
**no** `PATCH` on a single event. Reuse Story 3.2's manual-add write path as-is
for the "append the corrected entry" step; 3.3 adds only the soft-delete path.

**Why feature-action-only, not the full §2.2 dual gate, at this stage:** the only
seeded `profile:timeline:write` holder is the `hr-admin` role, and **HR Admin
holds no S9 write audience at all** (§2.2 NORMATIVE — "HR Admin grants no data
access"). Requiring the audience half now would close the gate to *everyone*.
Same rationale as Story 3.2.

**Read-back — edit implies read.** Unchanged from Story 3.2:
`canReadTimeline(viewer, target)` is true when the S9 read audience matches
(`resolveAudiences ∩ {self, reporting, pp}`, the Story 3.1 interim) **OR**
`isAllowed(viewer, 'profile:timeline:write')` is true. So the HR-Admin actor can
`GET` the timeline back — `200 { data, canEdit: true }` — and observe that the
soft-deleted event is gone. `canEdit` in the envelope is unchanged:
`isAllowed(viewer, 'profile:timeline:write')`.

> **⚠️ To ratify (requirements tension — flag, do not resolve here).** DEC-UM-001
> as written scopes manual timeline mutation (add **and** delete) to the assigned
> PP + the direct Unit Manager **by data audience**. This stage ships it as an
> HR-Admin **feature action** with no audience half. The two must be reconciled
> by the PO when the FR-permission-matrix
> (`_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md`,
> §6 item 4) grants `profile:timeline:write` to the PP / Unit-Manager roles — at
> which point those grants must be **scoped** (a PP corrects only their own
> assignees; a UM only their own department's people, via the AC department-tree
> walk), reactivating `um-ct-05` / `um-ct-06` from `it.todo` to live.

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-ct-13` (HR-Admin delete + correction flow) + `um-ct-07`
  (soft-deleted event absent from the read) + `um-ct-08` (no `PATCH` route)
  scenario docs → red E2E → implementation. `um-ct-05` / `um-ct-06` are
  `it.todo` (deferred — see Open Questions).
- **Feature-permission gate (this stage):** `isAllowed(actor, 'profile:timeline:write')`
  through the `ACCESS_CONTROL_PORT` facade — a no-target check, never inline role
  logic, never a `User.position` check (AD-4 / DEC-UM-002). **No `canAccessSection`
  call** — the deferred DEC-UM-001 audience half is not wired yet.
- **Gate ordering:** the permission check runs first → `403` (which also covers a
  non-existent `:id` target — no `404` enumeration surface, matching
  `AddManualUserEventAction`). Only then does the action load the event scoped to
  `(:id, :eventId)` and answer `404` for a missing / already-soft-deleted /
  cross-timeline row.
- **Soft-delete only** — set `deletedAt` to a server timestamp; the row persists;
  `deletedAt` is never exposed to the caller ("absence is absence").
- `listForUser` continues to exclude `deletedAt IS NOT NULL` (Story 3.1 contract,
  reaffirmed here).
- The correction "append" step reuses Story 3.2's `POST /users/:id/events`
  unchanged.

**Never:**
- No `PATCH` on a single event; no in-place field mutation of a `UserEvents` row
  except `deletedAt` going `null` → timestamp.
- Don't invent a "correct" endpoint — a correction is `DELETE` + `POST`.
- Don't hard-delete or otherwise remove the row.
- Don't wire a `canAccessSection` / data-audience check at this stage (deferred —
  DEC-UM-001 narrowing, pending the FR-matrix grant).
- Don't grant `profile:timeline:write` to any role other than `hr-admin` at this
  stage.
- Don't return a body on the `DELETE` — `204 No Content` (see Open Questions).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| HR Admin soft-deletes an event | Root (holds `profile:timeline:write` via `hr-admin`), `DELETE /users/<aliceId>/events/<eventId>` on a live event | `204` No Content; row persists with `deletedAt` set; absent from subsequent reads (`um-ct-13` Test 1–2) |
| HR Admin runs the correction flow | Root: `DELETE` the wrong event, then `POST` the corrected one | Final `GET` shows only the corrected entry; the wrong id is gone (`um-ct-13` Test 3) |
| Soft-deleted event in a read | any admitted reader `GET /users/<aliceId>/events` | The deleted id is entirely absent from `data` — not `null`, no `deletedAt` key (`um-ct-07`, `um-ct-13` Test 2) |
| `DELETE` an unknown `eventId` | valid actor, syntactically-valid id that matches no row | `404` (`um-ct-13` Test 4) |
| `DELETE` an already-soft-deleted `eventId` | valid actor, id of a row already `deletedAt IS NOT NULL` | `404` — **not** an idempotent `204`; the row is absent from reads, so it "does not exist" from the caller's vantage (`um-ct-13` Test 4) |
| `DELETE` an event on a different user's timeline | `DELETE /users/<ninaId>/events/<aliceEventId>`, `aliceEventId.userId ≠ ninaId` | `404` — not on that user's timeline; scoped `(:id, :eventId)` lookup; nothing deleted (`um-ct-13` Test 6) |
| Direct `PATCH` on an event | `PATCH /users/<aliceId>/events/<eventId>` | `404` or `405` — no route bound; the event's fields are unchanged (`um-ct-08`) |
| Has audience, lacks permission | Bob (Alice's direct UM) but no `profile:timeline:write`, `DELETE` | `403`, event untouched — feature-permission gate alone denies him; the relationship is irrelevant at this stage (`um-ct-10`, `um-ct-13` Test 5) |
| No token | missing/invalid `Authorization` | `401` (`um-ct-13` Test 5) |
| PP / UM soft-deletes or corrects | Paula (assigned PP) / Bob (direct UM) | **Deferred** (`it.todo`) — needs the FR-matrix grant + DEC-UM-001 scoping; Bob's leg additionally needs the AC department-tree walk (`um-ct-05`, `um-ct-06`) |

## v1.5 Cutover Notes

- The pre-v1.5 spec framed the actor as "PP or Manager-Line (unit manager)".
  v1.5 keeps that as the **target end-state** (DEC-UM-001 + the
  `profile:timeline:write` permission) but sequences it: Story 3.3 ships only the
  HR-Admin feature-action path; the PP / UM audience-scoped paths reactivate with
  the FR-matrix grant (`um-ct-05` / `um-ct-06`).
- `um-ct-05`'s wrongly-inferred-entry precondition has no HTTP-observable way to
  manufacture — the E2E seeds an equivalent wrong entry through the manual-add
  endpoint with an in-file comment; preserve that. `um-ct-13` Test 3 uses the
  same mechanic with Root as the actor.
- Route through the **real** facade (Epic 0's adapter), not a fixture fake.
- Section keys use the human FR-matrix name `profile:timeline`; the `S9` label is
  the requirements §3.2 row id, cited for traceability only.
- An existing stage-2-only E2E file
  (`test/user-management/career-timeline.e2e-spec.ts`) predates this split and
  `404`s today — reconcile/extend, do not recreate.

## Open Questions / Gates

- **Scenario-stage decisions put up for the AD-1 Stage-1 gate (2026-09-03):**
  1. **`DELETE` returns `204 No Content`** with an empty body — a soft-delete
     carries no resource representation to return. (The closest sibling,
     `DELETE /users/:id` / deactivate, returns `200` *with* the updated `User`
     body; a soft-deleted event has no such representation, so `204` is the
     better fit. Fallback: `200` + empty body if the team wants uniformity with
     the deactivate route.)
  2. **Unknown `eventId` → `404`; already-soft-deleted `eventId` → `404`**
     (not an idempotent `204`). A soft-deleted row is absent from every read, so
     from the caller's vantage it does not exist; a second `DELETE` is a delete
     of a non-existent event.
  3. **Cross-timeline `DELETE` (`/users/<otherId>/events/<eventId>` where the
     event's `userId ≠ otherId`) → `404`** — the event is not on that user's
     timeline; the lookup is scoped `(:id, :eventId)`. Prevents cross-timeline
     deletion; does not confirm the id exists elsewhere.
  4. `um-ct-05` / `um-ct-06` are reframed as **deferred `it.todo`** (target
     end-state prose retained), unblock trigger = the FR-matrix grant of
     `profile:timeline:write` to PP / Unit-Manager roles + the DEC-UM-001
     audience scoping (`um-ct-06` additionally needs the AC department-tree walk
     for "direct UM").
- **⚠️ Requirements tension (needs a PO call, not resolved here):** DEC-UM-001's
  audience narrowing vs shipping this as an HR-Admin feature action — see the
  ⚠️-to-ratify note in Intent and `career-timeline/README.md`. Shared with
  Story 3.2.
- **`profile:timeline:write` seed** — shared with Story 3.2: this stage needs the
  key seeded and granted to the `hr-admin` role. E2E suites grant it in-test via
  `fx.grantFunctionalRole` until the default kernel seed widens the canonical set
  (the `spec-access-control-kernel-mvp` "exactly three" drift guard).
- **`profile:timeline` `canAccessSection`** remains a pending access-control
  increment; it is **not** on this story's critical path (the audience half is
  deferred), but it gates the reactivation of `um-ct-05` / `um-ct-06`.
