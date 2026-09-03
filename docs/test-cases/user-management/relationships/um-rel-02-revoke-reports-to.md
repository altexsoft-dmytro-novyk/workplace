# UM-REL-02 · HR Admin revokes reports-to (hard delete)

**Trace:** epics.md Story 4.1 (Change an Employee's Manager) · PRD FR-10 · [DEC-UM-005](../../../architecture/user-management-test-decisions.md) · AD-11 · access-control.md §3.4 · PM/AD-29 `AccessJournal`

> **Stage-2 note.** DEC-UM-005 reassignment is explicit `DELETE` then `POST`; a
> second `POST` while a `direct` edge exists is `409` (`um-rel-03`), never an
> implicit replace. The §3.4 before/after journal entry for the revoke is a
> **first-class assertion** (PM/AD-29 design ratified 2026-09-02; the older
> "Stage-2 blocked on CC-07" note is removed). `Relationship` `DELETE` is a hard
> delete, so the journal `before` snapshot is the only surviving record of the
> edge that existed.

## Scenario

**Given** Alice has an active reports-to edge to Bob (`um-rel-01`).

**When** Root submits `DELETE /users/<aliceId>/relationships/<relationshipId>`.

**Then** the response is `200` and, **in one transaction**:

- the `Relationship` row is hard-deleted; Alice has no manager on a subsequent read;
- **one `AccessJournal` row commits in the same transaction**: `kind: 'manager'`, `actorUserId: <rootId>`, `subjectUserId: <aliceId>`, `before:` a complete snapshot of the edge being removed (`{ relationshipId, userId: aliceId, type: 'direct', reportsToUserId: bobId }`), `after: null`, `occurredAt` set, `idempotencyKey = hash(actorUserId, subjectUserId, 'manager', relationshipId, 'delete')`.

**Preconditions:** [fixture](../README.md#canonical-personas); active direct edge from Alice to Bob created via `um-rel-01`, whose response `id` is `<relationshipId>` here.

## Test

- **inputURL:** `DELETE /users/<aliceId>/relationships/<relationshipId>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; subsequent read shows Alice with no active `direct` edge.
- **stateChange:** stage 2 asserts, in one committed transaction: the `Relationship` row is gone; exactly one new `AccessJournal` row with `kind: 'manager'`, `before` = the edge snapshot, `after: null`, `actorUserId: rootId`, `subjectUserId: aliceId`, `occurredAt` non-null.
