# S4.2d-DS-06 · Root resolves `reporting` write over every seeded member of a real, multi-department spine

> **New Stage-1 scenario, PLAT-E4-S4.2d (2026-09-07).** This is the HTTP-level
> half of the increment (Ask First **AF-1**): where
> [`S4.2d-DS-02`](../../access-control-kernel/dev-seed-spine/s42d-ds-02-two-level-spine-over-imported-population.md)
> proves the `Relationship` rows exist with the right shape, this file proves
> the point of building them — root's audience resolves `reporting` write over
> the **real, script-produced** population, not a hand-wired two-employee
> chain the way [`S4.2b-TR-02`](s42b-tr-02-root-resolves-reporting-write-two-levels-down.md)
> built its own `E2 → E1 → root` fixture through direct `POST` calls. Every
> edge this file reads was written by `db:dev:seed-org`, never by this suite's
> own request. **Expected RED at Stage 2** — the script and its npm alias do
> not exist at HEAD `8ec35fd`, so there is no spine to resolve over yet.

**Trace:**

- Story [`story-4-2-default-org-relationship-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md) — the Recorded Decision, "top of the `reports-to` relationship tree → `reporting` audience over everyone, transitively"; scope item 5's own acceptance criterion, restated verbatim in the spec's Tasks & Acceptance last-but-one bullet.
- Spec [`spec-4-2d-dev-seed-spine.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md) — Ask First **AF-1** (resolved: this file's folder and scope); I/O & Edge-Case Matrix row "Root reads any seeded member's identity card"; Tasks & Acceptance Stage-2 bullet for `test/user-management/access-control-adoption/s42d-ds-root-reach-over-seeded-population.e2e-spec.ts` — "hybrid harness ... boots Nest, and drives `GET /users/:id` for a sample of seeded members (a lead, an ordinary member, a member of a single-person department) asserting `canEdit: true` for root on each."
- `src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:88-120` — the upward-walk CTE this file exercises **unmodified**: this increment's Never list forbids touching this file, `audience-resolver.service.ts`, or anything under `src/access-control/**`; the spine's edges are ordinary data the same walk already ascends.
- [`s42a-op-03`](s42a-op-03-root-operator-capability-after-production-bootstrap.md) / [`S4.2b-TR-02`](s42b-tr-02-root-resolves-reporting-write-two-levels-down.md) — the production-only provisioning and dual-gate (`hasSectionAccess` audience-first, then `isAllowed('profile:identity:write')` satisfied by every active employee's `DEFAULT_PERMISSIONS`) this file's own read gate inherits unchanged; this file adds no new gate behaviour, only a richer population to resolve it over.
- README [Fixture convention](README.md#fixture-convention-per-um-integration-contract-response-md-q6) — `Bearer <token:<seeded-uuid>>` sessions over real `User` rows, never a literal persona placeholder.

## Scenario

**Given** root, provisioned by the real production chain
(`db:seed && db:bootstrap:access-control`), a population imported via the real
`npm run db:import:population` entrypoint (a suite-authored temporary CSV
swapped into the fixed `docs/Accounts_template.csv` path and restored
afterward — see
[`S4.2d-DS-02`](../../access-control-kernel/dev-seed-spine/s42d-ds-02-two-level-spine-over-imported-population.md)'s
Preconditions for why the real entrypoint needs this precise mechanism), and
the spine itself seeded by `npm run db:dev:seed-org` — no `POST
/users/:id/relationships` call anywhere in this file's own setup. The imported
population includes: a department with several active members (giving both a
synthesized lead and an ordinary member to sample), and a department with
exactly one active member (whose one edge goes straight to root, per
[`S4.2d-DS-02`](../../access-control-kernel/dev-seed-spine/s42d-ds-02-two-level-spine-over-imported-population.md)
Test 4).

**When** root calls `GET /users/:id` for each of three sampled seeded members:
a department lead (one hop from root), an ordinary member of a multi-person
department (two hops from root, through their lead), and the sole member of a
single-person department (one hop from root, being simultaneously "the lead"
and "the only member").

**Then** each response is `200` with `{ data, canEdit: true }` — the audience
resolves `reporting` for root over every one of them, through the unmodified
upward-walk CTE, exactly as the story's own scope-item-5 acceptance criterion
states. The two-hop member's resolution matters most: it proves the walk does
not stop after one hop, and it is the one shape
[`S4.2b-TR-02`](s42b-tr-02-root-resolves-reporting-write-two-levels-down.md)
already proved with a hand-wired pair — this file proves the same mechanism
holds when the chain comes from the real seeding script instead.

**What this proves, precisely — and does not.** It proves root's `reporting`
audience resolves write over the script-produced population, through the same
mechanism `S4.2b-TR-02` already exercised. It does **not** prove root is "the
organisation's boss" in any broader sense — the §2.4 full-profile-access
first-holder grant is `4.2c`, separately blocked on an architect decision and
not a dependency here, exactly as the spec's own Boundaries table records.

**Preconditions:** produced by real in-suite steps, no hardcoded ids,
following the `s42a-op-03`/`S4.2b-TR-02` precedent of production-only
provisioning:

1. `npm run db:deploy` → `npm run db:seed` (run-scoped `ROOT_WORK_EMAIL`) →
   `npm run db:bootstrap:access-control`, exit `0` each.
2. A suite-authored temporary CSV (several departments, as described in
   Scenario above) written to `docs/Accounts_template.csv`'s real resolved
   path, imported via `npm run db:import:population`, then the delivered
   file's original bytes restored in `afterAll` — never left mutated.
3. `npm run db:dev:seed-org`, exit `0`.
4. Root's uuid, and the three sampled members' uuids and department roles
   (lead / ordinary member / single-member-department), are all read back
   from `users` / `department_membership` / `relationships` by this run's own
   workEmail prefix and edge shape — never written literally.
5. Before any `GET` in this file, the suite confirms (by direct read) that
   each sampled member's `direct` edge exists exactly where
   [`S4.2d-DS-02`](../../access-control-kernel/dev-seed-spine/s42d-ds-02-two-level-spine-over-imported-population.md)
   says it should — the fixture is verified, not assumed.

## Test 1 — provision and seed the population (setup, not itself an assertion of the audience claim)

- **inputURL:** `npm run db:import:population` (subprocess, not HTTP) followed
  by `npm run db:dev:seed-org` (subprocess)
- **inputRequest:** N/A — subprocess invocations, not HTTP
- **expectedResult:** both exit `0`; the resulting `users` /
  `department_membership` / `relationships` state matches
  [`S4.2d-DS-02`](../../access-control-kernel/dev-seed-spine/s42d-ds-02-two-level-spine-over-imported-population.md)'s
  own shape assertions. A non-zero exit here means the rest of this file is
  not meaningful and the suite fails fast.

## Test 2 — root reads a department lead (one hop)

- **inputURL:** `GET /users/<lead-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<root-uuid>>" } }
  ```
- **expectedResult:** `200`; `{ data, canEdit: true }` — the lead's `direct`
  edge points straight at root, one hop, the shallowest case this spine
  produces

## Test 3 — root reads an ordinary member (two hops, through their lead)

- **inputURL:** `GET /users/<member-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<root-uuid>>" } }
  ```
- **expectedResult:** `200`; `{ data, canEdit: true }` — the upward walk
  ascends `<member> → <lead> → root`, exactly two hops, through the same
  unmodified CTE `S4.2b-TR-02` already exercised with a hand-wired chain; this
  is the discriminating case for "the spine is actually two levels deep," not
  one collapsed level

## Test 4 — root reads the sole member of a single-person department

- **inputURL:** `GET /users/<sole-member-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<root-uuid>>" } }
  ```
- **expectedResult:** `200`; `{ data, canEdit: true }` — this person is their
  own department's synthesized lead by construction
  ([`S4.2d-DS-02`](../../access-control-kernel/dev-seed-spine/s42d-ds-02-two-level-spine-over-imported-population.md)
  Test 4) and holds exactly one edge, straight to root; the one-hop case
  proven again, this time for a department the shape logic treats specially
  (lead and member are the same row)

## Test 5 — root reads its own card

*(added 2026-09-13, E4-C04a — `test-design-epic-platform-4.md`.)* The
dev-spine counterpart of the production-shaped
[`s42a-op-04`](./s42a-op-04-root-data-reach-unchanged-by-the-operator-set.md)
Test 4. `db:dev:seed-org` writes an edge FOR every seeded member ONTO root; it
never writes a `Relationship` row where root is the subject (asserted in Test
1 above — "Root itself never becomes a subject"), so root's own audience over
its own card resolves `self`, not `reporting`.

- **inputURL:** `GET /users/<root-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<root-uuid>>" } }
  ```
- **expectedResult:** `200`; `{ data, canEdit: false }` — §3.2 row S1 gives
  Self `R`, not `RW`.
