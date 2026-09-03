---
title: "Story 4.2: Change an Employee's People Partner"
type: 'feature'
status: done
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
supersedes: ./spec-4-2-hr-admin-pairs-or-unpairs-a-mentor-and-mentee.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-4-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5. The pre-v1.5 Story 4.2 ("HR Admin
> Pairs or Unpairs a Mentor and Mentee") is retired — mentorship is handed to a
> future dedicated Mentorship context (AD-17). This slot is reused for the v1.5
> People Partner operation. **NOT an AD-1 approval.**
>
> **Reconciled 2026-09-03** to the 2026-09-02 architecture ratification: CC-07 /
> PM/AD-29 (`AccessJournal`) is done via Story 4.1; CC-04 is design-resolved
> (`P2`, "Not a design blocker on PM/AD-19"). The prior "blocked on CC-04 AND
> CC-07 — scenario prose only" gate is removed for the **direct assigned-PP
> edge**, which now proceeds to stage 2 / 3. Only **HR-line propagation above
> the directly assigned PP** stays deferred (fail-closed) pending the Department
> contract (PM/AD-35). `status:` stays `draft` — per-file human approval still
> required.

## Intent

**Problem:** People Partner assignment drives the PP audience and the HR-line
chain, but there is no mechanism to set or replace it. PP is **not** a `User`
column and **not** a policy — it is the organisational fact
`Relationship type='people_partner'` (AD-19), with the directly assigned PP in
`reportsToUserId` and a partial `UNIQUE` (`type='people_partner'`) enforcing
zero-or-one per employee.

**Approach:** Implement the atomic fixed-cardinality command
`PUT /users/:employeeId/relationships/people-partner {targetId,
expectedCurrentTargetId}` (create-or-replace) and
`DELETE /users/:employeeId/relationships/people-partner` (remove), invoked from
the dedicated organisational-relationship screen. Each write goes through the
dedicated *change organisational relationships* permission
(`@RequireFeature('org:relationships:write')`), rejects self-assignment, and
writes one `AccessJournal` row `kind: 'people_partner'` (`before`/`after` = the
PP-edge snapshot) in the **same transaction** as the edge write — reusing Story
4.1's `AccessJournal` table, `AccessJournalKind` enum, and same-transaction
journal writer. Each employee has zero or one PP; one PP may partner many
employees. PP audience changes on the next request. **Only the direct
assigned-PP edge ships** — HR-line propagation above the direct PP is deferred
(fail-closed).

## Boundaries & Constraints — GATES

- **CC-07 / PM/AD-29 — DONE (via Story 4.1).** The 2026-09-02 architecture
  ratification records PM/AD-29 (`AccessJournal`) as `ratified` — *"Closes CC-07
  design"*. Story 4.1 built the `AccessJournal` table, the `AccessJournalKind`
  enum (includes `people_partner`), the same-transaction journal writer, and
  `GET /users/:id/access-journal` with the interim reader gate (migration
  `20260903011657_story_4_1_access_journal`). The journal is **no longer a
  blocker** for 4.2 — 4.2 reuses this infrastructure. `UserEvents` is not a
  substitute.
- **CC-04 — design-resolved (PM/AD-19); `P2`, "Not a design blocker on
  PM/AD-19" (ratification §7).** Remaining work is the
  `PUT/DELETE .../people-partner` routes + AccessJournal enrolment —
  implementation, not design. **Stage-2 and production for the direct
  assigned-PP edge proceed.**
- **AD-19 Department-boundary gate — STILL DEFERRED.** The direct assigned-PP
  edge resolves the direct PP audience immediately, but **transitive HR-line
  propagation (the HR chain above the directly assigned PP) stays fail-closed to
  the directly assigned PP** until the Department contract binds the HR boundary
  (PM/AD-35 Department schema). Stage 2 for HR-line inheritance is blocked on
  that contract and its boundary-negative scenarios; Story 4.2 does **not** ship
  it.

Story 4.2 is **unblocked** for the direct assigned-PP edge. Scenario prose
(AD-1 stage 1) is complete pending the human gate; stage 2 / stage 3 for the
direct edge proceed on approval. Only HR-line propagation remains deferred.

## Boundaries & Constraints — behaviour

**Always:**
- The write requires the `change organisational relationships` permission
  (`org:relationships:write`, through the facade — a no-target `isAllowed`
  check, never a role-name check), **rejects self-assignment with `400`**, and
  PP access changes on the **next request**.
- `PUT` creates or **atomically replaces** the edge (no explicit `DELETE`-then-
  `POST`, unlike the `direct` edge — DEC-UM-005); an existing-row replace
  predicates on `(userId, type='people_partner', reportsToUserId =
  expectedCurrentTargetId)`; concurrent absent-row creation is serialized by the
  partial unique index. A stale predicate, an omitted `expectedCurrentTargetId`
  while a PP exists, or a losing unique conflict → `409`. `DELETE` on an
  assigned PP → `200` + journal old→`null` atomically; `DELETE` with no PP
  assigned → `404`.
- Every edge mutation writes exactly one `AccessJournal` row `kind:
  'people_partner'` in the **same transaction** (Story 4.1 writer). A
  rolled-back edge write writes no journal row.
- `Relationship` rows are hard-deleted — the journal `before` snapshot is the
  only surviving record of a removed edge.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP; Actions
  never `@Inject` a port (only `domain/services/` may).

**Never:**
- No PP column on `User`, no PP-as-policy modelling.
- No mentorship handling (retired to the Mentorship context).
- Don't traverse an unrestricted `direct` chain and call it "inside HR" (AD-19).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Trace |
|---|---|---|---|
| Replace | Alice assigned to Paula; authorized actor `PUT {targetId: Nina, expectedCurrentTargetId: Paula}` | `200`, bare relationship `{ id, userId, type: 'people_partner', reportsToUserId: Nina }`; Paula's direct-PP access to Alice ends and Nina's begins on the next request; **one** `AccessJournal` row `kind: 'people_partner'`, `before.reportsToUserId: Paula`, `after.reportsToUserId: Nina`, same transaction | `um-rel-09` A |
| First assignment | Alice has no PP; `PUT {targetId: Paula}` (no `expectedCurrentTargetId`) | `200`; edge created; journal `before: null`, `after` = new-edge snapshot | `um-rel-09` B |
| Remove | Alice assigned to Paula; authorized actor `DELETE` | `200` empty body; edge hard-deleted; **one** journal row `before` = removed-edge snapshot, `after: null`, same transaction | `um-rel-16` T1 |
| Remove — none assigned | Alice has no PP; `DELETE` | `404`; no edge change, no journal row | `um-rel-16` T2 |
| Self-assignment | Actor `PUT {targetId: <self>}` | `400` (app-level pre-check; `userId <> reportsToUserId` CHECK is backstop); current assignment remains; no journal row | `um-rel-10` |
| Stale expected target | `expectedCurrentTargetId` no longer matches current PP | `409`; state unchanged; no journal row | `um-rel-11` T1 |
| Omitted token, PP exists | `PUT {targetId: Nina}` while Alice already has a PP | `409` (a replace must acknowledge what it replaces) | `um-rel-11` T3 |
| Concurrent replace | two parallel `PUT` from one baseline | exactly one `200` + one journal row; the other `409` + none | `um-rel-11` T2 |
| Unauthorized | Actor lacks `org:relationships:write` (Ida) | `403` before any write; no edge change, no journal row | `um-rel-16` T3, `um-rel-07` T2 |
| New PP audience | after a `200` replace | new direct PP's `canEdit`/journal-read over the employee resolves on the next request; former PP's PP-level access is gone | `um-rel-16` T4 |
| HR-line propagation above the direct PP | any | **deferred** — fail-closed to the directly assigned PP (AD-19 Department-boundary gate) | — |

## v1.5 Cutover Notes

- The `relationships_one_people_partner_per_user` partial `UNIQUE`
  (`type='people_partner'`) **already exists** — Epic 0 migration
  `20260830010000_access_control_relationships`. No new migration for the index.
- The `AccessJournal` table + `AccessJournalKind` enum (`people_partner`
  included) + same-transaction writer + `GET /users/:id/access-journal` already
  exist — Story 4.1 migration `20260903011657_story_4_1_access_journal`. Story
  4.2 adds no schema; it adds the two routes and the `people_partner` journal
  enrolment.
- Build on the `relationships` area of `user-management`:
  `relationships.controller.ts`, `org-relationship.repository.ts` (the
  `$transaction` edge+journal co-write pattern), `access-journal-access-facade.
  adapter.ts`, the `idempotencyKey` util, `GetAccessJournalAction`.
- `Relationship.type` v1.5 value set includes `people_partner`; `reportsToUserId`
  is the directional PP pointer for this edge.

## Open Questions / Gates

- **CC-07 / PM/AD-29** — **RESOLVED.** Journal table/enum/writer/read endpoint
  built by Story 4.1. Not a blocker.
- **CC-04** — **design-resolved (PM/AD-19); `P2`.** Remaining work is
  implementation of the two routes + AccessJournal enrolment. Not a design
  blocker. Direct assigned-PP edge proceeds to stage 2 / 3.
- **Department contract (PM/AD-35)** — still blocks **HR-line inheritance stage
  2** only (the HR chain above the directly assigned PP). Story 4.2 ships the
  direct edge without it; fail-closed until it lands.

### Scenario-stage decisions carried to the human gate

1. **`DELETE` optimistic-concurrency token.** api-conventions.md shape 4 says
   `If-Match: "<pp-user-id>"`; there is no ETag source. **Recommend:** `DELETE`
   takes `expectedCurrentTargetId` as an **optional query parameter** (same
   field name as the `PUT` body). Supplied + mismatched → `409`; omitted →
   removes the current PP. `DELETE` does not require the token (`um-rel-16`).
   Architect to reconcile the `If-Match` wording in api-conventions.md.
2. **`PUT` with no `expectedCurrentTargetId` when a PP already exists.**
   **Recommend `409`** — a replace must acknowledge what it replaces
   (`um-rel-11` T3). Blind replace is not allowed.
3. **PP eligibility.** **Recommend:** the target must be an **active `User`**;
   **no** functional-role requirement on the PP (the PP audience is edge-derived,
   not role-derived). Unknown `targetId` → `404` (leak-free); known but inactive
   → `422` (well-formed request, ineligible target). Flag — the `404`/`422`
   split for the target is a proposal, not sourced.
4. **Response body shape.** **Recommend:** `PUT` → `200` with the bare
   relationship `{ id, userId, type: 'people_partner', reportsToUserId }` (Story
   4.1 `POST /users/:id/relationships` family); `DELETE` → `200` empty body.
   `PUT` returns `200` for both create and replace (`201`-on-create is the
   flagged alternative).
5. **`idempotencyKey` derivation** extends Story 4.1's interim scheme
   (`um-rel-15`): `hash(actorUserId, subjectUserId, 'people_partner',
   after.relationshipId ?? before.relationshipId, operation)`,
   `operation ∈ {'create','replace','delete'}`. Same expiry trigger.
