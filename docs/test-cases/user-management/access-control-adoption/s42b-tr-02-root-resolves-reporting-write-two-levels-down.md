# S4.2b-TR-02 · Root resolves `reporting` write two levels down a real chain that terminates at it

> **New Stage-1 scenario, PLAT-E4-S4.2b (2026-09-06).** This is the positive
> half of the increment: once a real, two-level `reports-to` chain is wired so
> it terminates at root, `resolveAudiences` already grants root `reporting`
> write over the chain's bottom employee — **transitively**, through the
> unmodified upward-walk CTE, with **zero** change to
> `prisma-relationship-graph.adapter.ts`. No suite in this repository builds a
> chain this deep and resolves audience from its top today:
> [`s42a-op-03`](./s42a-op-03-root-operator-capability-after-production-bootstrap.md)
> Test 2 wires an ordinary one-hop pair with root as the *actor*, never the
> *terminus*, and
> [`s42a-op-04`](./s42a-op-04-root-data-reach-unchanged-by-the-operator-set.md)
> deliberately proves the opposite fact (root has no reach because nothing
> points at it). **This file's chain building steps (Tests 1-3) are expected
> to pass at the baseline commit** — the six-key canonical set 4.2a shipped
> already includes `org:relationships:write`; only the transitive-resolution
> claim in Tests 4-5 was previously unproven by any suite, and it is expected
> **green on first run**, not red-to-green — a regression lock over an
> already-correct property, exactly as the spec's Boundaries & Constraints
> requires this be stated at the Stage-2 gate.

**Trace:**

- Story [`story-4-2-default-org-relationship-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md) — the Recorded Decision, "top of the `reports-to` relationship tree → `reporting` audience over everyone, transitively."
- Spec [`spec-4-2b-tree-root-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2b-tree-root-seed.md) — Intent § "Approach" step 2; Boundaries & Constraints, "The proof chain must be at least two levels deep (`E2 → E1 → root`), not one" and "the chain built for the proof uses the real `POST /users/:id/relationships` write route ... never a raw `prisma.relationship.create` bypassing it"; I/O & Edge-Case Matrix rows "Root wires E1 to itself," "Root wires E2 to E1," "Root edits E2 (two levels down)," "Root reads E2."
- `src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:88-120` — the upward-walk CTE, seeded from the *targets* (`:98`), ascending via `JOIN "relationships" r ON r."userId" = c.node_id` (`:105-107`); termination is the absence of a further usable manager edge (`:76-82`), which is exactly how the walk stops at root without any special case.
- `src/user-management/application/actions/assign-manager.action.ts:1-59` — the only place a `direct` edge is created; no special handling for `subjectId` or `targetId` being root.
- `src/user-management/application/controllers/relationships.controller.ts:64` `@Post(':id/relationships')` — the real write route this file's chain-building steps drive; no fixture back door.
- `docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-06-repeat-before-viewer-proof.md:32-38` — "Each person carries at most one `direct` row ... an upward walk is a linked list, not a tree," confirming a zero-row node (root) is simply where the list ends.
- [`s42a-op-03`](./s42a-op-03-root-operator-capability-after-production-bootstrap.md) Test 1/Test 2 — the population-import and one-hop-wiring precedent this file's own preconditions extend to two hops.
- README [Fixture convention](README.md#fixture-convention-per-um-integration-contract-response-md-q6) — `Bearer <token:<seeded-uuid>>` sessions over real `User` rows.

## Scenario

**Given** root, provisioned by the production path alone (`db:deploy` →
`db:seed` → `db:bootstrap:access-control`, `db:dev:grant-root` **not** run),
imports a small population through the real `POST /users/import` route,
producing two active employees **E1** and **E2**. Root then wires two real
`direct` edges through the real write route: **E1 → root** (E1 reports to
root), then **E2 → E1** (E2 reports to E1) — a genuine two-level chain,
`E2 → E1 → root`, built entirely by requests a real functional-role grant
gates, never by a fixture insert.

**When** root calls `PATCH /users/E2` with a valid identity-card field.

**Then** the response is `200`, the change persists, and a follow-up
`GET /users/E2` returns the new value with `canEdit: true`. The upward walk
from `E2` ascends `E2 → E1 → root`, finds root at the top, and the chain
terminates cleanly there because root carries no further `direct` row of its
own — the ordinary "no further edge" termination every chain relies on, not a
case the CTE has to special-case for root.

**What this proves, precisely.** Not that root is "the organisation's boss" —
that would also require the §2.4 full-profile-access grant, which is a
separate, unstarted increment (`4.2c-overlay`, not this one). This file proves
only the write-side half of the Recorded Decision, and only through the
existing, unmodified CTE: a real multi-hop chain that happens to terminate at
root resolves exactly the same as a chain terminating at any other manager
with zero `direct` rows of their own.

**Preconditions:** produced by real in-suite steps, in this order, with no
hand-written id anywhere — the same production-only provisioning
[`s42a-op-03`](./s42a-op-03-root-operator-capability-after-production-bootstrap.md)
and
[`s42a-op-04`](./s42a-op-04-root-data-reach-unchanged-by-the-operator-set.md)
already establish, extended with this file's own two-hop chain:

1. `npm run db:deploy` → `npm run db:seed` (run-scoped `ROOT_WORK_EMAIL`) →
   `npm run db:bootstrap:access-control`, exit `0` each. `db:dev:grant-root` is
   **not** run.
2. Root's uuid is read back from `users` by the normalized run-scoped email.
3. E1 and E2's uuids are threaded from the persisted rows `POST /users/import`
   creates (Test 1 below) — never written literally.
4. Before any write in this file, the suite asserts there is **no**
   `Relationship` row anywhere involving E1, E2, or root — the absence is part
   of the fixture, not an assumption.

## Test 1 — root imports the population (E1 and E2 exist)

- **inputURL:** `POST /users/import`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<root-uuid>>" },
    "body": "multipart/form-data with a `file` part: a semicolon-delimited population CSV, two active rows — E1 and E2"
  }
  ```
- **expectedResult:** `200`; the import result names two created employees.
  Their uuids are read from the persisted `users` rows and threaded into every
  later request. A non-`200` here means the chain cannot be built, and the
  rest of this file is not meaningful.

## Test 2 — root wires E1 to itself (`E1 → root`, the first hop)

- **inputURL:** `POST /users/<E1-uuid>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<root-uuid>>" },
    "body": { "type": "direct", "targetId": "<root-uuid>" }
  }
  ```
- **expectedResult:** `201`; the created `direct` edge
  `{ userId: <E1-uuid>, type: 'direct', reportsToUserId: <root-uuid> }` is
  returned and persisted — asserted against the `Relationship` row, not
  inferred from the status. **This edge is the one this spec's Boundaries &
  Constraints singles out**: it is the terminus edge, and root itself never
  becomes a subject (`userId`) of any row in this file.

## Test 3 — root wires E2 to E1 (`E2 → E1`, the second hop — the chain now terminates at root)

- **inputURL:** `POST /users/<E2-uuid>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<root-uuid>>" },
    "body": { "type": "direct", "targetId": "<E1-uuid>" }
  }
  ```
- **expectedResult:** `201`; a second `direct` edge
  `{ userId: <E2-uuid>, type: 'direct', reportsToUserId: <E1-uuid> }` is
  persisted. The chain `E2 → E1 → root` now exists as two real rows, and only
  two: `SELECT count(*) FROM "relationships"` for this run's namespace is
  `2`, with **zero** rows where `userId` = root's id — root gains no row of
  its own from this or any prior step.

## Test 4 — root edits E2, two levels down, through the unmodified upward-walk CTE

- **inputURL:** `PATCH /users/<E2-uuid>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<root-uuid>>" },
    "body": { "city": "Berlin" }
  }
  ```
- **expectedResult:** `200`; E2's persisted `city` is `"Berlin"` — asserted
  against the database, not inferred from the status. **Expected green on
  first run**, not red-to-green: the CTE that ascends `E2 → E1 → root` is
  unmodified and already correct (spec Design Notes, "root becomes the
  terminus for free"); this test is the regression lock that proves it against
  a chain deep enough to matter, which no suite exercised before this
  increment.

## Test 5 — a follow-up read agrees: `canEdit: true`, two levels down

- **inputURL:** `GET /users/<E2-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<root-uuid>>" } }
  ```
- **expectedResult:** `200`; `{ data, canEdit }` with `canEdit: true` and
  `data.city === "Berlin"` — the same `hasSectionAccess` question the `PATCH`
  gate asked, now transitively satisfied two hops up an unmodified walk. The
  read and write gates cannot disagree because they resolve the same audience
  the same way.
