# UM-REL-11 · A stale `expectedCurrentTargetId` on the PP replace returns 409

**Trace:** epics.md Story 4.2 · PRD FR-10 · api-conventions.md shape 4 ("Stale expected state or a losing concurrent absent-row insert returns `409`; the edge and one `AccessJournal` before/after record commit together", AD-19, PM/AD-29) · [database-schema.md](../../../architecture/database-schema.md) §Relationship (`UNIQUE: one People Partner edge per userId`) · [DEC-UM-010](../../../architecture/user-management-test-decisions.md) · PM/AD-19 · PM/AD-29 `AccessJournal`

> **Stage-2 note.** The optimistic-concurrency token semantics and the atomic
> edge+journal commit are first-class stage-2 assertions — CC-04 is
> implementation-only and not a design blocker on PM/AD-19 (ratification §7).
> The older *"BLOCKED — CC-04 + CC-07"* box is removed.

> **Scenario-stage decisions (for the human gate).**
> - **A stale `expectedCurrentTargetId` → `409`**, not `404`/`412`: the request
>   is well-formed and the sub-resource exists; the supplied expected state no
>   longer matches. The existing-row replace predicates on
>   `(userId, type='people_partner', reportsToUserId = expectedCurrentTargetId)`;
>   a losing concurrent absent-row insert is serialized by the partial `UNIQUE`
>   and also returns `409` (api-conventions.md shape 4).
> - **Omitting `expectedCurrentTargetId` when a PP already exists → `409`** too
>   (Test 3): a replace must acknowledge what it replaces.

## Scenario — Test 1: stale token

**Given** Alice's assigned People Partner has already been changed from Paula to
Nina by a prior request, so the current PP is Nina.

**When** Root submits `PUT /users/<aliceId>/relationships/people-partner` with a
now-stale `{ targetId: <miraId>, expectedCurrentTargetId: <paulaId> }` — the
`expectedCurrentTargetId` still names Paula.

**Then** the response is `409` (stale expected state), the PP assignment remains
Nina, and **no `AccessJournal` row is written** — the journal INSERT is part of
the same aborted transaction as the failed edge replace, so there is no partial
commit.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice's PP is
currently Nina (changed from Paula via `um-rel-09` Test A); Mira is an active
`User`; Root holds *change organisational relationships*.

### Test

- **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "targetId": "<miraId>", "expectedCurrentTargetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `409`; Alice's PP still resolves to Nina.
- **stateChange:** none. Stage 2 asserts the `people_partner` `Relationship` row for Alice is unchanged (`reportsToUserId: ninaId`) and the `AccessJournal` row count for `subjectUserId: aliceId` is unchanged.

## Scenario — Test 2: `@concurrency` — two parallel replaces from one baseline

**Tag:** `@concurrency`

**Given** Alice's PP is currently Nina, and two clients each hold that baseline.

**When** two `PUT /users/<aliceId>/relationships/people-partner` requests run in
parallel inside one isolated test, both with `expectedCurrentTargetId: <ninaId>`
and different `targetId` (`<miraId>` and `<paulaId>`).

**Then** exactly one request commits — `200`, one replaced `people_partner`
edge, and **exactly one new `AccessJournal` row** (`kind: 'people_partner'`,
`before.reportsToUserId: ninaId`, `after` the winning edge) in that same
transaction. The other request receives `409` (its replace predicate no longer
matches once the winner has committed) and its transaction rolls back whole — no
edge write, no journal row. Final state: a single `people_partner` edge for
Alice and exactly one new `people_partner` journal row for this transition.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice's PP is
Nina; run with parallel HTTP (`Promise.all`) inside one test; one Playwright
worker (DEC-UM-010).

### Test

- **inputURL:** `PUT /users/<aliceId>/relationships/people-partner` (two parallel requests)
- **inputRequest:** two bodies, both `{ "headers": { "authorization": "Bearer <token:Root>" }, "body": { "targetId": "<miraId|paulaId>", "expectedCurrentTargetId": "<ninaId>" } }`.
- **expectedResult:** one `200`, one `409`.
- **stateChange:** final state has exactly one `people_partner` `Relationship` row for Alice, and exactly one new `AccessJournal` row with `subjectUserId: aliceId`, `kind: 'people_partner'` whose `after` snapshot matches the surviving edge.

## Scenario — Test 3: omitted token while a PP exists

**Given** Alice's assigned PP is Paula.

**When** Root submits `PUT /users/<aliceId>/relationships/people-partner` with
`{ targetId: <ninaId> }` — `expectedCurrentTargetId` omitted.

**Then** the response is `409` (a blind replace of an existing PP is refused —
the request must name the PP it expects to replace). Alice's PP remains Paula;
no journal row.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Paula
`people_partner` edge exists; Root holds *change organisational relationships*.

### Test

- **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "targetId": "<ninaId>" }
  }
  ```
- **expectedResult:** `409`; Alice's PP still resolves to Paula.
- **stateChange:** none; `AccessJournal` row count for `subjectUserId: aliceId` unchanged.
