# S4.2b-TR-04 · Nothing about reaching *into* root moved — an unrelated employee and a colleague inside root's own chain

> **New Stage-1 scenario, PLAT-E4-S4.2b (2026-09-06).** The negative control
> for [`s42b-tr-02`](./s42b-tr-02-root-resolves-reporting-write-two-levels-down.md).
> That file proves root's reach flows **up** a chain that terminates at it;
> this file proves the direction is exactly that one-way, and only that one
> — nobody the two-level chain touches, and nobody outside it, gains any new
> reach **into** root's own identity card. `Relationship` edges are directed
> (`userId` reports to `reportsToUserId`); an edge that lets root reach down to
> E2 grants E2, or E1, or anyone else, **nothing** back up. **Green before and
> after the implementation stage** — a red here would mean this increment
> widened someone's reach into root, and per the spec's own Boundaries &
> Constraints that stops the change for a human rather than being accepted as
> a finding.

**Trace:**

- Spec [`spec-4-2b-tree-root-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2b-tree-root-seed.md) — Intent § "Approach" step 4, "Confirms nothing about anyone *else's* reach into root moved"; I/O & Edge-Case Matrix rows "An ordinary colleague reads/writes root's own card" and "Root, unrelated third employee" (the latter re-affirmed as `s42a-op-04`'s own case, explicitly **not** re-tested here — this file covers the *reverse* direction, someone reaching **into** root, which `s42a-op-04` does not).
- [`access-control.md` line 19](../../../architecture/access-control.md) **NORMATIVE** — a functional role never widens data access; mirrored for the write-route feature keys already, and restated here for the *directionality* of a relationship edge.
- `src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:88-120` — the CTE ascends from a target's `userId` outward through `reportsToUserId`; there is no query path that lets a *subject* of a `direct` row resolve an audience over the *endpoint* it points at. An edge `{ userId: E1, reportsToUserId: root }` gives root reach over E1 — never the other way.
- [`s42a-op-04`](./s42a-op-04-root-data-reach-unchanged-by-the-operator-set.md) — the sibling negative control for root acting as **viewer** over an unrelated target; this file is its mirror for root as **target**.
- [`s42b-tr-02`](./s42b-tr-02-root-resolves-reporting-write-two-levels-down.md) — the shared production-only provisioning and two-level chain this file's preconditions extend, and the write route (`AssignManagerAction`) whose directionality is under test here.
- README [Fixture convention](README.md#fixture-convention-per-um-integration-contract-response-md-q6).

## Scenario

**Given** the same production-only provisioning as
[`s42b-tr-02`](./s42b-tr-02-root-resolves-reporting-write-two-levels-down.md) —
a real two-level chain `E2 → E1 → root` wired through the real write route —
plus one further active employee, **U**, imported in the same population and
left with **no** `Relationship` row at all, in either direction, with anyone.
Neither **E1** (who has a real `direct` edge, but one that points *toward*
root, not from it) nor **U** (who has no edge anywhere) has any audience over
root beyond Colleague. Resolving *E1 or U's* audience over root would require
an upward walk that starts at root's own id and ascends through a `direct`
row where `userId` = root — exactly the row
[`s42b-tr-01`](../../access-control-kernel/tree-root-seed/s42b-tr-01-bootstrap-writes-no-relationship-row.md)
and
[`s42b-tr-03`](./s42b-tr-03-root-has-no-upward-edge.md)
establish never exists. E1's own edge runs the opposite way — `{ userId: E1,
reportsToUserId: root }` lets **root** ascend to E1, never the reverse — and
U has no edge to ascend from at all.

**When** E1 attempts to edit and separately read root's own identity card, and
separately U — who shares no edge with root, E1, or E2 at all — attempts the
same two calls.

**Then** both are refused identically, and identically to how they would have
been refused before this increment: `PATCH /users/<root>` returns `403` for
both, root's row is unchanged, and `GET /users/<root>` returns `200` with
`canEdit: false` for both — the ordinary Colleague-only answer §3.2 gives for
`profile:identity`. The two-level chain `s42b-tr-02` wires does not change
either answer, because the chain's edges all point *toward* root, never *from*
it, and the upward-walk CTE only ever grants reach along the direction an edge
actually points.

**Preconditions:** steps 1-4 of
[`s42b-tr-02`](./s42b-tr-02-root-resolves-reporting-write-two-levels-down.md),
unchanged, plus:

1. **U** is a third active employee created by the same
   `POST /users/import` call `s42b-tr-02` Test 1 makes (a three-row CSV instead
   of two), or a second real `POST /users/import` call — either way, a real
   request, never a fixture insert. U's uuid is threaded from the persisted
   row.
2. The suite asserts **no** `Relationship` row exists anywhere involving U, in
   either direction, before the requests below.
3. The suite re-asserts (it does not merely assume) that E1's only edge is
   `{ userId: <E1-uuid>, type: 'direct', reportsToUserId: <root-uuid> }` —
   pointing *at* root, never received *from* root.

## Test 1 — E1, whose own edge points at root, still cannot edit root's card

- **inputURL:** `PATCH /users/<root-uuid>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<E1-uuid>>" },
    "body": { "city": "Berlin" }
  }
  ```
- **expectedResult:** `403`. Root's persisted row is unchanged — asserted
  against the database, not inferred from the status. Green before and after
  the implementation stage.

## Test 2 — E1 reads root's card: `canEdit: false`

- **inputURL:** `GET /users/<root-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<E1-uuid>>" } }
  ```
- **expectedResult:** `200`; `{ data, canEdit }` with `canEdit: false` and
  `data` reflecting root's unchanged row. The read and write gates agree,
  exactly as they must — they resolve the same audience.

## Test 3 — U, with no edge anywhere, cannot edit root's card either

- **inputURL:** `PATCH /users/<root-uuid>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<U-uuid>>" },
    "body": { "city": "Berlin" }
  }
  ```
- **expectedResult:** `403`, root's row unchanged. The same answer as Test 1,
  for a viewer with no edge in the chain at all — the two-level chain
  `s42b-tr-02` wires elsewhere in the database gives no incidental reach to
  anyone outside it.

## Test 4 — U reads root's card: `canEdit: false`

- **inputURL:** `GET /users/<root-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<U-uuid>>" } }
  ```
- **expectedResult:** `200`; `{ data, canEdit }` with `canEdit: false`,
  identical in shape to Test 2. E1 (inside the chain) and U (outside it)
  receive the same answer, which is the point: proximity to root's chain, in
  either direction, is irrelevant to reaching *into* root — only an edge
  naming root as a `reportsToUserId` **above** the viewer could do that, and
  this increment's own Never-list forbids ever creating one in production
  provisioning.
