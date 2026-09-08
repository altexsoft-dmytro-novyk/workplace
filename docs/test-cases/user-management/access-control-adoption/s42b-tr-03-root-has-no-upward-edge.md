# S4.2b-TR-03 · Root's own upward walk is empty, over the real endpoint

> **New Stage-1 scenario, PLAT-E4-S4.2b (2026-09-06).** This file re-proves
> [`s42b-tr-01`](../../access-control-kernel/tree-root-seed/s42b-tr-01-bootstrap-writes-no-relationship-row.md)'s
> negative fact through the real HTTP surface a viewer actually calls, rather
> than a raw query — the same escalation
> [`s42a-op-04`](./s42a-op-04-root-data-reach-unchanged-by-the-operator-set.md)
> makes for "root has no reach over an unrelated employee." **Expected green
> on first run.** Nothing about `GetRelationshipsAction` changes in this
> increment; this is a regression lock over an already-correct property.

**Trace:**

- Spec [`spec-4-2b-tree-root-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2b-tree-root-seed.md) — I/O & Edge-Case Matrix row "Root reads its own relationships"; Acceptance Criteria, "root calls `GET /users/<root>/relationships` ... the response is `200` with `data: []` — root's own upward walk is empty, over the real endpoint, not inferred from a raw query alone."
- `src/user-management/application/controllers/relationships.controller.ts:81` `@Get(':id/relationships')` — no `@RequireFeature`; the read gate is `{reporting, pp}` audience **OR** `isAllowed('org:relationships:write')`, enforced inside the action.
- `src/user-management/application/actions/get-relationships.action.ts:14-51` `GetRelationshipsAction` — target existence/activity resolved first (`:33-36`), then the reader gate `canRead` (`:38-41`), then `data: []` when the target has neither a `direct` nor a `people_partner` edge (`:48-49`).
- `src/user-management/application/dtos/relationships-view.response.ts:19-21` `RelationshipsEnvelope { data: CurrentEdgeView[] }` — the exact shape this file's assertion reads.
- [`s42b-tr-02`](./s42b-tr-02-root-resolves-reporting-write-two-levels-down.md) — the shared production-only provisioning this file's own preconditions extend without repeating.
- [`s42b-tr-01`](../../access-control-kernel/tree-root-seed/s42b-tr-01-bootstrap-writes-no-relationship-row.md) — the same negative fact, asserted there against a raw `PrismaClient` right after bootstrap; this file asserts it again later, after real edges exist elsewhere in the database, through the live endpoint.

## Scenario

**Given** the same production-only provisioning as
[`s42b-tr-02`](./s42b-tr-02-root-resolves-reporting-write-two-levels-down.md) —
root holds the canonical six-key `hr-admin` role via
`org:relationships:write`, and a real two-level chain `E2 → E1 → root` now
exists in the database. Root itself still carries **zero** `direct` and
**zero** `people_partner` rows where it is the subject (`userId`) — nothing in
this file or `s42b-tr-02` ever assigns root a manager.

**When** root calls `GET /users/<root>/relationships`, targeting **itself**.

**Then** the response is `200` with `{ data: [] }`. Root reaches this route at
all only because it holds `isAllowed('org:relationships:write')` — the second
disjunct of Gate B — since `{reporting, pp}` never includes Self: a person is
never their own manager or their own People Partner. The empty array is not a
degenerate or error case; it is the same "no further edge" fact `s42b-tr-01`
observed at the database level, now confirmed through the endpoint a real
viewer calls, with two other people's edges already sitting in the same table
to rule out an oracle that would pass on an entirely empty table for the wrong
reason.

**Preconditions:** steps 1-4 of
[`s42b-tr-02`](./s42b-tr-02-root-resolves-reporting-write-two-levels-down.md),
unchanged — production-only provisioning, E1 and E2 imported, the two-level
chain `E2 → E1 → root` wired through the real write route — plus:

- The suite asserts `SELECT count(*) FROM "relationships" WHERE "userId" =
  <root-uuid>` is `0` immediately before this file's own request, so the
  empty response cannot be attributed to a row this file itself removed.

## Test — root reads its own relationship list

- **inputURL:** `GET /users/<root-uuid>/relationships`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<root-uuid>>" } }
  ```
- **expectedResult:** `200`; body is exactly `{ "data": [] }` — `Object.keys`
  is exactly `['data']`, and `data` is an empty array, not `undefined` and not
  a non-empty list. Asserted against the live response, not inferred from the
  `s42b-tr-01` database-level result.
