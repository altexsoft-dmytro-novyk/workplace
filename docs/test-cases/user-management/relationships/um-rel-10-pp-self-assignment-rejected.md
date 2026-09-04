# UM-REL-10 · Assigning yourself as an employee's People Partner is rejected

**Trace:** epics.md Story 4.2 · PRD FR-10 · access-control.md §3.3 ("Every action ... rejects self-assignment") · [database-schema.md](../../../architecture/database-schema.md) §Relationship (`CHECK: userId <> reportsToUserId`) · PM/AD-19 · PM/AD-29 `AccessJournal`

> **Stage-2 note.** CC-04's remaining work is implementation-only (the
> `PUT/DELETE .../people-partner` routes + AccessJournal enrolment); it is not a
> design blocker on PM/AD-19 (ratification §7, `CC-04` `P2`). The
> self-assignment rejection and the journal-absence assertion are first-class.
> The older *"BLOCKED — CC-04 + CC-07"* box is removed.

## Scenario

**Given** Alice's assigned People Partner is Paula, Root holds the *change
organisational relationships* permission, and Root is not currently Alice's
People Partner.

**When** Root submits `PUT /users/<aliceId>/relationships/people-partner` with
`{ targetId: <rootId>, expectedCurrentTargetId: <paulaId> }` — naming itself as
Alice's new PP.

**Then** the response is **`400`** (self-assignment is an app-level input
rejection detected before the transaction opens — the actor cannot be the
target; this is distinct from `409`, which signals a concurrent/stale-state
conflict). The status is **pinned to `400`** to match the self-assignment
rejection for every organisational fact (§3.3; the `userId <> reportsToUserId`
DB `CHECK` is the backstop, but the app rejects first with `400`, never surfacing
a raw constraint error). Alice's current PP assignment (Paula) is unchanged, and
**no `AccessJournal` row is written**. Self-assignment is refused regardless of
the actor's audience over the target (§3.3).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Paula
`people_partner` edge exists; Root holds *change organisational relationships*;
Root is not Alice's PP.

## Test

- **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "targetId": "<rootId>", "expectedCurrentTargetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `400`; a follow-up `PUT` read path / `GET /users/<aliceId>/access-journal` shows Alice's PP still resolves to Paula.
- **stateChange:** none. Stage 2 asserts the `people_partner` `Relationship` row for Alice is unchanged (`reportsToUserId: paulaId`) and the `AccessJournal` row count for `subjectUserId: aliceId` is unchanged from before the request (the denial short-circuits before the transaction opens).
