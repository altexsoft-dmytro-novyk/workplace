# User Management — `career-timeline/` (Epic 3: Career Timeline)

AD-1 **Stage-1** scenario documents for **Epic 3 — Career Timeline**, following
the team-wide authoring pattern in [../../README.md](../../README.md): one test
case per file, each opening with a plain-language **Scenario** (Given/When/Then)
followed by the explicit request spec (`inputURL`, `inputRequest`,
`expectedResult`), traced to `docs/project-requirements.md` (§), the
[epics.md](../../../../_bmad-output/planning-artifacts/user-management/epics.md)
Epic 3 stories, PRD FR-5 / FR-11 / FR-12 / FR-13, and
[user-management-test-decisions.md](../../../architecture/user-management-test-decisions.md)
(DEC-UM-001, DEC-UM-011).

Contracts: [`spec-3-1-system-auto-generates-career-timeline-events.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-3-1-system-auto-generates-career-timeline-events.md)
(`status: done`) · [`spec-3-2-authorized-actor-manually-adds-a-backfill-entry.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-3-2-authorized-actor-manually-adds-a-backfill-entry.md)
(`status: draft`) · [`spec-3-3-authorized-actor-edits-or-deletes-an-event.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-3-3-authorized-actor-edits-or-deletes-an-event.md)
(`status: draft`).

## Status — UNAPPROVED DRAFT

- **Story 3.1** (`um-ct-01`, `um-ct-02`, `um-ct-11`) — spec `done`; scenarios stable.
- **Story 3.2** (`um-ct-03`, `um-ct-04`, `um-ct-09`, `um-ct-10`, `um-ct-12`) —
  **reconciled 2026-09-02** to the split-gate decision below. Pending its AD-1
  Stage-1 human approval, then Stage 2 (committed-red E2E) and Stage 3.
- **Story 3.3** (`um-ct-05`, `um-ct-06`, `um-ct-07`, `um-ct-08`, `um-ct-13`) —
  **reconciled 2026-09-03** to the same split-gate shape (see the Story 3.3
  section below): `um-ct-13` is the LIVE HR-Admin soft-delete + correction happy
  path; `um-ct-07` / `um-ct-08` stay LIVE (actor-agnostic, retargeted to Root);
  `um-ct-05` / `um-ct-06` become deferred `it.todo`. Pending its AD-1 Stage-1
  human approval, then Stage 2 and Stage 3.

No `_bmad-output/specs/*/approvals.yaml` records any of this. An agent's review
of its own output is never a substitute for human approval
([testing-strategy.md](../../../architecture/testing-strategy.md)).

## Section-name convention

Section identifiers use the human FR-matrix name — `profile:timeline`, never
`S9` as a code identifier. "requirements §3.2 row S9" is cited for traceability
only (the `S9` label is the requirements matrix's internal row id).

## Story 3.2 — the manual-add gate (Dmytro, 2026-09-02)

`profile:timeline:write` **is** a real functional permission (requirements §2.3
line 122 "edit the career timeline"; §4.9 manual override; the §132 default
holder is explicitly unsettled and left to the PO). It is **not** the
identity-card "Variant A" — the timeline keeps its functional permission.

**At this stage:**

| Aspect | This stage ships | Target end-state (deferred) |
| --- | --- | --- |
| `profile:timeline:write` grant | `hr-admin` role **only** (seeded) | + People Partner + Unit Manager, per the FR-permission-matrix |
| Manual-write gate | `isAllowed(actor, 'profile:timeline:write')` **alone** — a feature action, **no** `canAccessSection` / data-audience half | §2.2 dual gate: the permission **and** `canAccessSection('profile:timeline', target) === 'write'`, narrowed by DEC-UM-001 to assigned PP + direct Unit Manager, scoped so a PP touches only their own assignees |
| `GET /users/:id/events` read gate | `<S9 read audience>` **OR** `isAllowed(viewer, 'profile:timeline:write')` — "edit implies read" (widens Story 3.1's `// INTERIM` rule; same expiry trigger). Timeline-scoped interim of §2.4 full-profile access. | resolver-level `full` audience / bypass so a §2.4 holder reads every section — deferred AC item |
| `canEdit` in the `GET` envelope | `isAllowed(viewer, 'profile:timeline:write')` → `true` for HR Admin, `false` otherwise | unchanged |
| `POST` `201` body | bare `UserEventResponse` `{ id, type, eventDate, details, source, createdAt }` (matches bare-user `PATCH /users/:id`) | unchanged |
| `CreateUserEventDto` | `whitelist` **silently strips** `id` / `deletedAt` / `source` / `createdBy`; `source` always server-stamped `"manual"` | unchanged |

**Why feature-action-only now:** the only seeded holder is `hr-admin`, and HR
Admin holds **no** S9 write audience at all (§2.2 NORMATIVE — "HR Admin grants no
data access"). Requiring the audience half now closes the gate to everyone. The
FR-permission-matrix treats bulk-migration actions (`directory:import`,
`org:relationships:write`) as feature actions; HR-Admin backfill of the legacy
Excel headcount record is that shape.

> ### ⚠️ To ratify (requirements tension — flagged, not resolved)
>
> **DEC-UM-001** scopes manual timeline mutation to the assigned PP + the direct
> Unit Manager **by data audience**. **Story 3.2 as shipped** treats it as an
> HR-Admin **feature action** with no audience half. These must be reconciled by
> the PO when
> [`fr-permission-matrix-draft-2026-09-02.md`](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md)
> (§6 item 4) grants `profile:timeline:write` to the PP / Unit-Manager roles. At
> that point:
> - the grants must be **scoped** (PP → own assignees only; UM → own department
>   only) — a holder must not become a global timeline editor;
> - `um-ct-03` / `um-ct-04` / `um-ct-09` reactivate from `it.todo` to live;
> - DEC-UM-001 stays as written — it is the target scoping for non-HR-Admin
>   holders, pending the matrix grant. Do not delete it.
>
> **Edit implies read (Dmytro, 2026-09-02).** HR Admin *can* read the timeline
> back. Story 3.2 widens the Story 3.1 `GET /users/:id/events` gate:
> `canReadTimeline(viewer, target)` is true when the S9 read audience matches
> (`resolveAudiences ∩ {self, reporting, pp}`, the Story 3.1 interim) **OR**
> `isAllowed(viewer, 'profile:timeline:write')` is true. Anyone authorized to
> write the timeline can read it, so HR Admin `GET`s `200 { data, canEdit: true }`
> (`um-ct-12` Test 2) and `canEdit: true` is observable. Update Story 3.1's
> `// INTERIM` timeline-read rule in place; same expiry trigger.
>
> This is the **timeline-scoped interim** of the §2.4 *Full profile access* grant
> ("HR Admin can do and see everything"). Resolver-level support for a `full`
> audience / bypass — so a §2.4 holder reads *every* section, not just the
> timeline — is a **deferred Access Control item**
> (`_bmad-output/implementation-artifacts/access-control/deferred-work.md`). Not
> specced here.

## Story 3.3 — the soft-delete / correction gate (Dmytro, 2026-09-03)

Story 3.3 adds `DELETE /users/:id/events/:eventId` — **soft-delete only**
(`deletedAt` set, row persists, never exposed). It follows Story 3.2's shape
**exactly**:

| Aspect | This stage ships | Target end-state (deferred) |
| --- | --- | --- |
| Delete gate | `isAllowed(actor, 'profile:timeline:write')` **alone** — a feature action, no data-audience half; permission check first (`403`, also covers a non-existent `:id`), then a `(:id, :eventId)`-scoped lookup | §2.2 dual gate narrowed by DEC-UM-001 to assigned PP + direct Unit Manager, scoped so a PP touches only their own assignees / a UM only their own department |
| `DELETE` success status | **`204 No Content`**, empty body (scenario-stage decision — a soft-delete has no resource representation; the deactivate route returns `200` only because it echoes the updated `User`) | unchanged |
| Unknown / already-soft-deleted `eventId` | **`404`** (not idempotent `204`) — absent from reads means "does not exist" to the caller | unchanged |
| Cross-timeline `DELETE` (`/users/<otherId>/events/<eventId>`, event's `userId ≠ otherId`) | **`404`** — not on that user's timeline; scoped lookup; nothing deleted | unchanged |
| "Correction" | two client calls — `DELETE` then Story 3.2's `POST`. **No** "correct" endpoint, **no** `PATCH` on a single event | unchanged |
| `listForUser` | already excludes `deletedAt IS NOT NULL` (Story 3.1) — reaffirmed | unchanged |

The **⚠️-to-ratify tension is the same one** as Story 3.2: DEC-UM-001 scopes
manual timeline mutation (add **and** delete) to the assigned PP + direct UM by
data audience; this stage ships delete as an HR-Admin feature action. Reconciled
by the PO on the FR-permission-matrix grant (§6 item 4) — at which point
`um-ct-05` / `um-ct-06` reactivate from `it.todo` to live (`um-ct-06` also needs
the AC department-tree walk for "direct UM").

## Files

| File | actor → request → outcome | State |
|---|---|---|
| `um-ct-01-system-generates-joined-company-on-create.md` | import writes Nina's `User` → `joined_company` `source: "system"` event, same transaction (AD-11) | Story 3.1 — stable |
| `um-ct-02-system-generates-position-change-on-edit.md` | Bob `PATCH`es Alice's `position` → `position_change` `source: "system"`, new value only; no-op edit writes nothing | Story 3.1 — stable |
| `um-ct-03-pp-manual-add-backfill.md` | Paula (assigned PP) `POST .../events` → `201` `source: "manual"` | Story 3.2 — **`it.todo` deferred**; unblock: FR-matrix grants `profile:timeline:write` to PP + DEC-UM-001 assignee scoping |
| `um-ct-04-um-manual-add-backfill.md` | Bob (direct UM) `POST .../events` → `201` `source: "manual"` | Story 3.2 — **`it.todo` deferred**; unblock: FR-matrix grants the UM role + the AC department-tree walk for DEC-UM-001 "direct" |
| `um-ct-09-permission-without-s9-write-denied.md` | holds `profile:timeline:write` but not assigned PP / direct UM → `403` | Story 3.2 — **`it.todo` deferred**; the denial does not hold until the DEC-UM-001 narrowing lands |
| `um-ct-10-s9-write-without-permission-denied.md` | Bob (direct UM, no permission) `POST .../events` → `403` | Story 3.2 — **LIVE**; feature-permission gate alone denies him, relationship irrelevant |
| `um-ct-11-timeline-read-audience.md` | `GET .../events` gated by the §3.2 S9 read row; `{ data, canEdit }` envelope | Story 3.1 — stable |
| `um-ct-12-hr-admin-manual-add.md` | Root (holds `profile:timeline:write` via `hr-admin`) `POST .../events` pre-system-dated → `201` bare `UserEventResponse`, `source: "manual"`; DTO strips server-owned fields; `400` on bad `type` / `eventDate` | Story 3.2 — **LIVE** (the one manual-add path 3.2 ships) |
| `um-ct-05-pp-correct-event-soft-delete-and-append.md` | Paula (assigned PP) corrects: `DELETE` the wrong event + `POST` the corrected one | Story 3.3 — **`it.todo` deferred**; unblock: FR-matrix grants `profile:timeline:write` to PP + DEC-UM-001 assignee scoping |
| `um-ct-06-um-delete-event.md` | Bob (direct UM) `DELETE .../events/:eventId` → `204` soft-delete | Story 3.3 — **`it.todo` deferred**; unblock: FR-matrix grants the UM role + the AC department-tree walk for DEC-UM-001 "direct" |
| `um-ct-07-deleted-event-excluded-from-read.md` | Root seeds + soft-deletes; a follow-up `GET` shows the event entirely absent (not `null`, no `deletedAt`) | Story 3.3 — **LIVE** (actor-agnostic data-correctness property; retargeted to Root) |
| `um-ct-08-direct-edit-rejected.md` | Root seeds via `POST`, then `PATCH .../events/:eventId` → `404`/`405` (no route); `GET` shows fields unchanged | Story 3.3 — **LIVE** (actor-agnostic; retargeted to Root) |
| `um-ct-13-hr-admin-deletes-and-corrects.md` | Root: `DELETE` → `204`; read shows it gone; full `DELETE`+`POST` correction flow; unknown/re-delete/cross-timeline → `404`; Bob → `403`, no token → `401` | Story 3.3 — **LIVE** (the one soft-delete / correction path 3.3 ships) |

## Personas

From [../README.md](../README.md#canonical-personas). **Root** = the seeded
bootstrap HR Admin; for Stories 3.2 / 3.3 the `hr-admin` role additionally holds
the seeded `profile:timeline:write` permission — Root is the LIVE actor for the
manual add (`um-ct-12`), the soft-delete + correction flow (`um-ct-13`), and the
actor-agnostic properties (`um-ct-07` / `um-ct-08`). **Alice** — timeline subject (reports
to Bob; assigned PP Paula). **Bob** — Alice's direct Unit Manager; holds **no**
`profile:timeline:write`. **Paula** — Alice's assigned PP; holds **no**
`profile:timeline:write` at this stage. **Ida** — unrelated functional
permission only; the `403` capability-denial probe (DEC-UM-002). Unauthenticated
→ `401`.

## What blocks Stage-2

| Blocker | Blocks |
| --- | --- |
| FR-permission-matrix grant of `profile:timeline:write` to the **People Partner** role (`fr-permission-matrix-draft-2026-09-02.md` §6 item 4, `?`) + DEC-UM-001 assignee scoping | `um-ct-03` (add) and `um-ct-05` (correct) reactivation |
| The above for the **Unit Manager** role **and** the AC **department-tree walk** increment (`targetType:'department'` + recursion) for DEC-UM-001 "direct UM" | `um-ct-04` (add) and `um-ct-06` (delete) reactivation |
| The DEC-UM-001 audience narrowing being wired at all (`canAccessSection('profile:timeline', …) === 'write'`) | `um-ct-09` reactivation |
| `profile:timeline:write` in the **default** kernel/ACM seed granted to `hr-admin` — still pending after Stage-3 (adding a 4th canonical permission/grant pair collides with the `spec-access-control-kernel-mvp` "exactly three" drift guard + tests `ACM1-FB-01/03`). The Story 3.2 / 3.3 routes + gate ship without it; E2E suites grant it in-test via `fx.grantFunctionalRole`, and `um-ct-12`'s default-seed `it.todo` stays todo until the kernel package widens the canonical set. | `um-ct-12` default-seed `it.todo` |

Story 3.3's LIVE paths (`um-ct-07`, `um-ct-08`, `um-ct-13`) are **not** blocked —
the delete gate at this stage is `isAllowed(actor, 'profile:timeline:write')`
alone, a no-target facade call available once Epic 0 rebinds the port, with no
dependency on the pending `canAccessSection` increment.
