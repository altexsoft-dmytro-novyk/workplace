# UM-REL-09 · Change an employee's People Partner (atomic replace + journal)

**Trace:** epics.md Story 4.2 (Change an Employee's People Partner) · PRD FR-10 · access-control.md §3.3 ("PP replacement is the fixed-cardinality atomic command from AD-19, not a generic policy attachment"), §3.4 (Relationship and access journal) · api-conventions.md shape 4 (`PUT /users/:id/relationships/people-partner {targetId, expectedCurrentTargetId}`) · [database-schema.md](../../../architecture/database-schema.md) §Relationship (`UNIQUE: one People Partner edge per userId`), §AccessJournal · PM/AD-19 · PM/AD-29 `AccessJournal` (design ratified 2026-09-02, closes CC-07) · [DEC-UM-010](../../../architecture/user-management-test-decisions.md) (concurrency)

> **Journal stage is first-class (2026-09-02); CC-04 no longer gates stage 1.**
> The 2026-09-02 architecture ratification records PM/AD-29 (`AccessJournal`) as
> `ratified` — *"Closes CC-07 design"* — and Story 4.1 built the table, the
> `AccessJournalKind` enum (includes `people_partner`), the same-transaction
> journal writer, and `GET /users/:id/access-journal`. `CC-04` is `P2`,
> *"Not a design blocker on PM/AD-19"* — its remaining work is the
> `PUT/DELETE .../people-partner` routes plus this AccessJournal enrolment. The
> older *"BLOCKED — CC-04 + CC-07; scenario prose only"* box that stood here is
> removed: the PP edge write **and** its `people_partner` journal row are
> first-class stage-2 assertions. What stays deferred is **transitive PP HR-line
> propagation above the directly assigned PP** (fail-closed to the direct PP
> until the Department contract binds the HR boundary — AD-19
> Department-boundary gate). Story 4.2 ships only the **direct assigned-PP
> edge**. `UserEvents` is **not** a journal substitute.

> **Scenario-stage decisions (for the human gate).**
> - **`PUT` is atomic create-or-replace** (contrast DEC-UM-005: the `direct`
>   edge needs explicit `DELETE` then `POST`; the PP edge does not — AD-19,
>   database-schema.md §Relationship rule "`people_partner` uses atomic
>   expected-current `PUT`/`DELETE` semantics").
> - **`expectedCurrentTargetId` is mandatory when a PP already exists.** Omitted
>   / `null` while `Relationship type='people_partner'` exists for the employee →
>   `409` (a replace must acknowledge what it replaces — see `um-rel-11`).
>   Omitted / `null` when the employee has **no** PP → creates the edge.
> - **Status is `200` for both create and replace** (the singular
>   `.../people-partner` sub-resource is always addressable; `PUT` sets its
>   value). `201`-on-create is the flagged alternative.
> - **Response body** is the bare relationship `{ id, userId, type:
>   'people_partner', reportsToUserId }` — same shape family as Story 4.1's
>   `POST /users/:id/relationships`.
> - **`idempotencyKey` derivation (interim, extends Story 4.1 / `um-rel-15`).**
>   `idempotencyKey = hash(actorUserId, subjectUserId, 'people_partner',
>   after.relationshipId ?? before.relationshipId, operation)` where
>   `operation ∈ {'create','replace','delete'}`. Flagged with the same expiry
>   trigger as `um-rel-15`.

## Scenario — Test A: atomic replace of an existing PP

**Given** Alice's assigned People Partner is Paula (`Relationship
type='people_partner'`, `userId: aliceId`, `reportsToUserId: paulaId`), and Root
holds the *change organisational relationships* permission.

**When** Root submits `PUT /users/<aliceId>/relationships/people-partner` with
`{ targetId: <ninaId>, expectedCurrentTargetId: <paulaId> }` from the dedicated
organisational-relationship screen.

**Then** the response is `200` and, **in one transaction**:

- the single `people_partner` `Relationship` row for Alice is atomically
  replaced — `reportsToUserId` becomes `ninaId` (the row is replaced, not
  updated in place: the old row is hard-deleted and a new row created, so its
  `id` changes); Paula's directly-assigned-PP access to Alice ends and Nina's
  begins **on the next request** (§2.1 revocation timing — platform-owned);
- **one `AccessJournal` row commits in the same transaction** (PM/AD-29, AD-19):
  `kind: 'people_partner'`, `actorUserId: <rootId>`, `subjectUserId: <aliceId>`,
  `before:` a complete snapshot of the removed edge
  (`{ relationshipId: <oldId>, userId: aliceId, type: 'people_partner', reportsToUserId: paulaId }`),
  `after:` a complete snapshot of the new edge
  (`{ relationshipId: <newId>, userId: aliceId, type: 'people_partner', reportsToUserId: ninaId }`),
  `occurredAt` set, `idempotencyKey` derived per the note above. The row is
  append-only (`um-rel-15`).

Transitive PP HR-line propagation above Nina stays fail-closed to the directly
assigned PP until the Department contract identifies the HR root (AD-19
Department-boundary gate) — out of scope here.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Paula
`people_partner` edge exists; Nina is an active `User`; Root holds *change
organisational relationships*.

### Test

- **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "targetId": "<ninaId>", "expectedCurrentTargetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `200`; body `{ id, userId: "<aliceId>", type: "people_partner", reportsToUserId: "<ninaId>" }`.
- **stateChange:** stage 2 asserts, in one committed transaction:
  - `Relationship`: exactly one `people_partner` row for `userId: aliceId`, `reportsToUserId: ninaId`; the pre-existing row `id` no longer exists.
  - `AccessJournal`: exactly one new row — `kind: 'people_partner'`, `actorUserId: rootId`, `subjectUserId: aliceId`, `before.reportsToUserId: paulaId`, `after.reportsToUserId: ninaId`, `occurredAt` non-null, `idempotencyKey` non-null and unique.

## Scenario — Test B: first assignment (employee has no PP)

**Given** Nina has **no** `people_partner` edge, and Root holds *change
organisational relationships*.

**When** Root submits `PUT /users/<ninaId>/relationships/people-partner` with
`{ targetId: <paulaId> }` — `expectedCurrentTargetId` omitted.

**Then** the response is `200` and, in one transaction: a `people_partner`
`Relationship` row is created (`userId: ninaId`, `reportsToUserId: paulaId`);
Paula's directly-assigned-PP access to Nina begins on the next request; **one
`AccessJournal` row** commits — `kind: 'people_partner'`, `before: null`,
`after:` the new-edge snapshot, `actorUserId: rootId`, `subjectUserId: ninaId`.

**Preconditions:** [fixture](../README.md#canonical-personas); Nina has no
`people_partner` edge; Paula is an active `User`; Root holds *change
organisational relationships*.

### Test

- **inputURL:** `PUT /users/<ninaId>/relationships/people-partner`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "targetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `200`; body `{ id, userId: "<ninaId>", type: "people_partner", reportsToUserId: "<paulaId>" }`.
- **stateChange:** one new `people_partner` `Relationship` row for Nina; exactly one new `AccessJournal` row, `kind: 'people_partner'`, `before: null`, `after.reportsToUserId: paulaId`, `subjectUserId: ninaId`, `occurredAt` non-null.
