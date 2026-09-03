# UM-REL-01 · HR Admin assigns reports-to

**Trace:** epics.md Story 4.1 (Change an Employee's Manager) · PRD FR-10 · [DEC-UM-005](../../../architecture/user-management-test-decisions.md) · AD-11 · access-control.md §3.4 (Relationship and access journal) · PM/AD-29 `AccessJournal` (design ratified 2026-09-02, closes CC-07) · [database-schema.md](../../../architecture/database-schema.md) §AccessJournal

## Scenario

**Given** Alice has no active reports-to edge, and Root holds the *change
organisational relationships* permission.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'direct', targetId: <bobId> }` from the dedicated organisational-relationship screen.

**Then** the response is `201` and, **in one transaction**:

- a `Relationship` row is created (`type: 'direct'`, Alice reports to Bob); Alice's Reporting-line access resolves through Bob on the next request;
- **one `AccessJournal` row commits in the same transaction** (PM/AD-29, AD-11): `kind: 'manager'`, `actorUserId: <rootId>`, `subjectUserId: <aliceId>`, `before: null`, `after:` a complete snapshot of the new `direct` edge (`{ relationshipId, userId: aliceId, type: 'direct', reportsToUserId: bobId }`), `occurredAt` set, `idempotencyKey` derived per the file-wide note below. The row is append-only — nothing updates or deletes it afterwards (`um-rel-15`).

> **Journal stage is first-class (2026-09-02).** The 2026-09-02 architecture
> ratification records PM/AD-29 (`AccessJournal`) as `ratified` — *"Closes CC-07
> design"*. The immutable schema, snapshot payload, reader authorization, and
> same-transaction enrolment are defined (`database-schema.md` §AccessJournal;
> access-control.md §3.4). The older *"Stage-2 blocked on CC-07"* box that stood
> here is removed: the journal Then-clause is a first-class stage-2 assertion,
> not deferred. `UserEvents` is **not** a journal substitute (different owner,
> no before/after, different reader authorization). The table/writer/read
> endpoint remain implementation-absent — this is a stage-1 scenario, not a
> completion claim.

> **`idempotencyKey` derivation (scenario-stage decision, Story 4.1).** Interim
> for this story: `idempotencyKey = hash(actorUserId, subjectUserId, kind,
> relationshipId, operation)` where `operation ∈ {'create','delete'}` and
> `relationshipId` is the row created (here) or deleted (`um-rel-02`). A `direct`
> edge row id (uuidv7) is created once and deleted once, so the key is naturally
> unique per fact transition without a client-supplied token. Whether the
> `relationships` endpoints should *also* accept an `Idempotency-Key` request
> header (as `POST /users/:id/departures` does) is flagged for the gate —
> recommended deferred until an at-least-once writer needs it.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has no `direct` edge; Root holds *change organisational relationships*.

## Test

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "type": "direct", "targetId": "<bobId>" }
  }
  ```
- **expectedResult:** `201`; body reflects the new relationship id and `type: "direct"`.
- **stateChange:** stage 2 asserts, in one committed transaction:
  - `Relationship`: `userId: aliceId`, `type: 'direct'`, `reportsToUserId: bobId`.
  - `AccessJournal`: exactly one new row — `kind: 'manager'`, `actorUserId: rootId`, `subjectUserId: aliceId`, `before: null`, `after` a JSON snapshot of the new edge, `occurredAt` non-null, `idempotencyKey` non-null and unique.
