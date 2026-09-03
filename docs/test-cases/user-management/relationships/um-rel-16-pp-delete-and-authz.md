# UM-REL-16 · Remove an employee's People Partner + PP-change authorization and audience

**Trace:** epics.md Story 4.2 (Change an Employee's People Partner) · PRD FR-10 · access-control.md §3.3 ("Every action requires the dedicated *change organisational relationships* permission, rejects self-assignment, and writes the §3.4 journal entry in the same transaction"), §3.4, §2.1 (assigned PP + HR line; revocation on next request) · api-conventions.md shape 4 (`DELETE /users/:id/relationships/people-partner`) · [database-schema.md](../../../architecture/database-schema.md) §Relationship (hard delete), §AccessJournal · [DEC-UM-002](../../../architecture/user-management-test-decisions.md) (no-target feature check through the facade) · PM/AD-19 · PM/AD-29 `AccessJournal`

> **Stage-2 status.** First-class stage-2 assertions. The `AccessJournal` table,
> the `people_partner` enum value, the same-transaction writer, and
> `GET /users/:id/access-journal` are Story 4.1 infrastructure (PM/AD-29 ratified
> 2026-09-02, "closes CC-07 design"). CC-04's remaining work is the
> `PUT/DELETE .../people-partner` routes + this enrolment — implementation, not a
> design blocker (ratification §7, `CC-04` `P2`). **Transitive PP HR-line
> propagation above the directly assigned PP is out of scope / deferred**
> (fail-closed to the direct PP until the Department contract binds the HR
> boundary — AD-19 Department-boundary gate).

> **Scenario-stage decision — `DELETE` optimistic-concurrency token (for the
> human gate).** api-conventions.md shape 4 currently says `DELETE` carries the
> expected current PP as `If-Match: "<pp-user-id>"`. An `If-Match` ETag flow
> needs an ETag source, and no route issues one for the PP edge. **Recommendation:
> `DELETE` takes `expectedCurrentTargetId` as an optional query parameter**
> (`DELETE /users/:employeeId/relationships/people-partner?expectedCurrentTargetId=<ppId>`)
> — same field name as the `PUT` body, so the contract is symmetric and
> testable. When supplied and it does not match the current PP → `409`; when
> omitted → the current PP (whatever it is) is removed. Unlike `PUT`, `DELETE`
> does **not** require the token (its intent is unambiguous — remove the single
> PP). **Flag:** api-conventions.md line for shape 4 says `If-Match`; the
> architect should reconcile the doc to the query-param form (or explicitly keep
> `If-Match` and accept the missing ETag source).

> **Response body.** `DELETE` → `200` with an empty body.

## Scenario — Test 1: DELETE removes an assigned PP

**Given** Alice's assigned People Partner is Paula (`Relationship
type='people_partner'`, `userId: aliceId`, `reportsToUserId: paulaId`), and Root
holds the *change organisational relationships* permission.

**When** Root submits `DELETE /users/<aliceId>/relationships/people-partner`.

**Then** the response is `200` and, **in one transaction**:

- the `people_partner` `Relationship` row is **hard-deleted**; Alice has no
  assigned PP on a subsequent read; Paula's directly-assigned-PP access to Alice
  ends on the next request (§2.1);
- **one `AccessJournal` row commits in the same transaction**: `kind:
  'people_partner'`, `actorUserId: <rootId>`, `subjectUserId: <aliceId>`,
  `before:` a complete snapshot of the removed edge
  (`{ relationshipId, userId: aliceId, type: 'people_partner', reportsToUserId: paulaId }`),
  `after: null`, `occurredAt` set, `idempotencyKey = hash(actorUserId,
  subjectUserId, 'people_partner', <removed relationshipId>, 'delete')`. Because
  the edge `DELETE` is a hard delete, the journal `before` snapshot is the only
  surviving record that the edge existed.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Paula
`people_partner` edge exists; Root holds *change organisational relationships*.

### Test

- **inputURL:** `DELETE /users/<aliceId>/relationships/people-partner`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; empty body; subsequent read shows Alice with no assigned PP.
- **stateChange:** stage 2 asserts, in one committed transaction: the `people_partner` `Relationship` row for Alice is gone; exactly one new `AccessJournal` row — `kind: 'people_partner'`, `before.reportsToUserId: paulaId`, `after: null`, `actorUserId: rootId`, `subjectUserId: aliceId`, `occurredAt` non-null.

## Scenario — Test 2: DELETE when no PP is assigned → 404

**Given** Nina has **no** `people_partner` edge, and Root holds *change
organisational relationships*.

**When** Root submits `DELETE /users/<ninaId>/relationships/people-partner`.

**Then** the response is `404` (there is no PP sub-resource to remove). No edge
change, no `AccessJournal` row.

**Preconditions:** [fixture](../README.md#canonical-personas); Nina has no
`people_partner` edge; Root holds *change organisational relationships*.

### Test

- **inputURL:** `DELETE /users/<ninaId>/relationships/people-partner`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `404`; leak-free body.
- **stateChange:** none; `AccessJournal` row count for `subjectUserId: ninaId` unchanged.

## Scenario — Test 3: actor without `org:relationships:write` → 403

**Given** Ida holds a custom functional role whose only permission is unrelated
(*create form campaigns*) and therefore does **not** hold the *change
organisational relationships* permission (DEC-UM-002 — a capability-negative, so
the persona is Ida, not a bare unrelated session). Alice's assigned PP is Paula.

**When** Ida submits either `PUT /users/<aliceId>/relationships/people-partner`
`{ targetId: <ninaId>, expectedCurrentTargetId: <paulaId> }` or
`DELETE /users/<aliceId>/relationships/people-partner`.

**Then** every such request is denied with `403` before any write — the gate is
the `isAllowed(viewer, 'change organisational relationships')` no-target feature
check through the real facade, **not** an `actor.position === 'HR Admin'` string
check (AD-4 / access-control.md prohibit that). No `Relationship` change, no
`AccessJournal` row, no career-event row.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Paula
`people_partner` edge exists; Ida does not hold *change organisational
relationships*.

### Test

- **Test 3a — PUT denied:**
  - **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Ida>" },
      "body": { "targetId": "<ninaId>", "expectedCurrentTargetId": "<paulaId>" }
    }
    ```
  - **expectedResult:** `403` — the no-target facade check fails before the transaction opens.
- **Test 3b — DELETE denied:**
  - **inputURL:** `DELETE /users/<aliceId>/relationships/people-partner`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Ida>" } }`
  - **expectedResult:** `403`.
- **stateChange:** none for either. Stage 2 asserts Alice's `people_partner` edge is unchanged (`reportsToUserId: paulaId`) and no new `AccessJournal` row with `subjectUserId: aliceId`.

## Scenario — Test 4: the new directly-assigned-PP audience resolves on the next request

**Given** the port is rebound; Alice, Paula, and Nina are active seeded `User`
rows; Alice's assigned PP is Paula (real `Relationship type='people_partner'`,
`userId: aliceId`, `reportsToUserId: paulaId`). Root holds *change organisational
relationships*.

**When** Root replaces Alice's PP with Nina
(`PUT /users/<aliceId>/relationships/people-partner
{ targetId: <ninaId>, expectedCurrentTargetId: <paulaId> }` → `200`), then Paula
and Nina each call `GET /users/<aliceId>`.

**Then** on the request **after** the replace commits:

- **Nina** — now Alice's directly assigned PP — gets `200` with the
  `{ data, canEdit }` S1 card; `resolveAudiences(nina, [alice])` contains `pp`,
  so `canAccessSection(nina, 'S1', alice) === 'write'` and `canEdit` is `true`
  (Variant A, `umac-03`).
- **Paula** — no longer Alice's PP and with no other edge to Alice — gets `403`
  (empty audience under the real facade), or, if Paula retains a colleague
  floor, `200` with `canEdit: false` and the colleague S1 whitelist only. The
  suite asserts whichever its fixture produces; the load-bearing assertion is
  that Paula's **PP-level** access (`canEdit` / journal read) is gone and Nina's
  is present.

**Note:** this asserts only the **directly assigned-PP edge**. HR-line
propagation above Nina (Nina's own `direct` manager chain gaining PP access to
Alice) is **deferred** — fail-closed to the direct PP until the Department
contract binds the HR boundary (AD-19 Department-boundary gate).

**Preconditions:** [fixture](../README.md#canonical-personas); because the
outcome depends on **real** Phase-0 audiences, stage 2 seeds real `User` +
`Relationship` rows and the header is `Bearer <token:<seeded-uuid>>` for Paula
and Nina (a persona literal resolves to a non-existent id → empty audience →
`403`). Root uses `Bearer <token:Root>`.

### Test

- **Test 4a — perform the replace:** `PUT /users/<aliceId>/relationships/people-partner` `{ "headers": { "authorization": "Bearer <token:Root>" }, "body": { "targetId": "<ninaId>", "expectedCurrentTargetId": "<paulaId>" } }` → `200`.
- **Test 4b — new PP can act:** `GET /users/<aliceId>` `{ "headers": { "authorization": "Bearer <token:<ninaId>>" } }` → `200`; `body.canEdit === true`. Also `GET /users/<aliceId>/access-journal` with the same header → `200` (assigned PP is a §3.4 reader).
- **Test 4c — former PP lost PP access:** `GET /users/<aliceId>` `{ "headers": { "authorization": "Bearer <token:<paulaId>>" } }` → `403` (or `200` with `canEdit === false` if a colleague floor applies); `GET /users/<aliceId>/access-journal` with the same header → `403` (no longer a §3.4 reader).
