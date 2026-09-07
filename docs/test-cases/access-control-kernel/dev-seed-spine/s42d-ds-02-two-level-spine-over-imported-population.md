# S4.2d-DS-02 · A two-level `direct` reporting spine over a real, multi-department imported population

> **New Stage-1 scenario, PLAT-E4-S4.2d (2026-09-07).** This is the increment's
> central positive fact: over a population `db:import:population` actually
> produced, `db:dev:seed-org` writes exactly one synthesized-lead-to-root edge
> per department and one ordinary-member-to-lead edge per remaining active
> member, with root itself never becoming a `Relationship` subject. **Expected
> RED at Stage 2** against HEAD `8ec35fd` — `scripts/dev-seed-org.ts` and
> `db:dev:seed-org` do not exist; this is a real red-then-green story, not a
> lock over already-correct behaviour (unlike `S4.2b-TR-01`'s negative fact).

**Trace:**

- Spec [`spec-4-2d-dev-seed-spine.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md) — Boundaries & Constraints ("Two-level shape only, rooted at root", "Root is never a subject", "Only active (`User.isActive: true`) users receive an edge", "The lead-synthesis rule is deterministic and precisely stated"); I/O & Edge-Case Matrix row "Population imported, multiple departments" and row "A user holds two concurrent `DepartmentMembership` rows"; Design Notes § "The lead-synthesis rule, stated precisely, and why it has no `PositionName` half"; Ask First **AF-5** (resolved: lexicographically smallest `departmentId` tie-break).
- Spec Code Map § "`import-population.ts` and the real population source — the manager-synthesis ground truth": `import-population.ts:29-32` resolves `POPULATION_CSV_PATH` to the fixed absolute path `docs/Accounts_template.csv` — **not** overridable by any environment variable (confirmed by my own read of `import-population.ts` in full: the constant is a literal `path.resolve(__dirname, ...)` call, no `process.env` reference anywhere in the file); `population-import.service.ts:112-141` processes rows strictly sequentially (`for...of`, one `await writeRow` per row, never `Promise.all`); `population-import.repository.ts:73-96` a newly created `User` row always gets `isActive: true` on import regardless of the source row's dismissal flag.
- `prisma/schema.prisma:13` — `User.id String @id @default(uuid(7))`, time-ordered by construction.
- `prisma/schema.prisma:175-189` `model DepartmentMembership` — current membership is `validTo: null`; the unique constraint is `(userId, departmentId)` **WHERE `validTo` IS NULL**, not `(userId)` alone, per the comment at `:187` — a user can legally hold more than one concurrent membership.
- `prisma/migrations/20260830010000_access_control_relationships/migration.sql:33-36` `relationships_one_direct_per_user` — at most one `direct` row per subject (`userId`), the constraint the spine's per-user existence check must respect by construction.
- `docs/Accounts_template.csv` — the delivered fixture: `FirstName;LastName;Email;Birthday;PositionId;PositionName;RegistrationDate;DepartmentId;DepartmentName;DismissedDate;IsDismissed;EmployeeType;TimeZone;CountryId;CountryCode;CountryName;CountryStateId;CountryStateName`, semicolon-delimited, one department key per `(DepartmentId, DepartmentName)` pair.
- [`S4.2b-TR-01`](../tree-root-seed/s42b-tr-01-bootstrap-writes-no-relationship-row.md) — the sibling negative fact this file's positive fact complements: a fresh bootstrap alone writes zero `Relationship` rows; this file is where the first real ones appear.

## Scenario

**Given** root, provisioned by the real production chain
(`db:seed && db:bootstrap:access-control`), and a population imported through
the real `npm run db:import:population` entrypoint, producing **at least three
departments**: one with a single active member, one with several active
members, and (for the tie-break case below) one department reachable by a user
who also holds a second, concurrent `DepartmentMembership` row in a
lexicographically larger department.

**Because `POPULATION_CSV_PATH` is a hardcoded absolute path with no
environment override** (Code Map above), and the delivered
`docs/Accounts_template.csv` has exactly one data row in its entire recorded
git history (confirmed by the spec's own Code Map, `git show` at three
separate commits), this scenario's precondition cannot use the delivered file
as-is. The real entrypoint is still used, unmodified: the suite's own
provisioning step (a) reads and holds the delivered file's original bytes in
memory, (b) writes a suite-authored multi-row, multi-department CSV to that
same real path (`docs/Accounts_template.csv`), matching the delivered file's
exact header and column order, (c) runs `npm run db:import:population` once
against it — the genuine `PopulationImportService` / `PopulationImportRepository`
writer, not a raw `prisma.user.createMany` — and (d) restores the delivered
file's original bytes in `afterAll`, unconditionally, so no suite run leaves
the tracked fixture mutated. This is "a temporary CSV written and imported
through that same real entrypoint" exactly as the spec's Boundaries &
Constraints requires, adapted to the one fact about `import-population.ts`
the spec's own Code Map records but does not spell out as a file-swap
mechanism — flagged here because it is the one place this doc's authoring had
to resolve an implementation detail the spec left implicit.

**When** `npm run db:dev:seed-org` runs against that database.

**Then**, for every department with at least one active member:

- Its **synthesized lead** — the active member with the smallest `User.id`
  among that department's current (`validTo: null`) `DepartmentMembership`
  holders, filtered to `User.isActive: true` — gets exactly one `direct` edge:
  `{ userId: <lead>, type: 'direct', reportsToUserId: <root> }`.
- Every **other** active member of that department gets exactly one `direct`
  edge: `{ userId: <member>, type: 'direct', reportsToUserId: <lead> }`.
- The single-member department's one active member is simultaneously its own
  department's lead **and** an ordinary CSV row — it gets exactly one edge,
  straight to root, never to itself (`relationships_no_self_endpoint_check`
  makes a self-edge schema-illegal in any case).

**And** root's own row count in `relationships` — `direct` and
`people_partner` combined, `userId = root.id` — stays exactly `0`: root
receives edges from below, never writes one of its own, matching the
inherited "never a subject" rule from `S4.2b-TR-01`.

**And** the total `direct` row count for this run's namespace equals exactly
(number of departments with ≥1 active member) + (number of active members
across those departments who are not their department's lead) — no more, no
fewer; no three-level chain, no cross-department edge, no edge to any
department-tree or project-line construct.

**The lead-synthesis rule, stated precisely (must match the spec exactly, not
loosely):** for each department, take its current (`validTo: null`)
`DepartmentMembership` rows, join to `User`, filter to `isActive: true`, order
the result **ascending by `User.id`**, and take the first row's user as that
department's synthesized lead. There is no `PositionName` heuristic anywhere
in this rule — the spec's own exhaustive search of every `PositionName` value
in this repository's real and fixture data (`'Developer'`, `'Principal
Engineer'`) found zero manager-ish strings, so a pattern-match branch would be
untested-by-construction against data that cannot occur.

**The AF-5 tie-break, stated precisely:** if a user holds two or more
concurrent `DepartmentMembership` rows (schema-legal per
`prisma/schema.prisma:187`'s per-department-not-per-user uniqueness), the
script uses the membership whose `departmentId` is **lexicographically
smallest** to decide which department's active-member list that user appears
in for spine purposes; the user is treated as belonging to only that
department. `relationships_one_direct_per_user` permits at most one manager
edge per person regardless, so no shape decision is lost by this choice — the
user simply does not appear as a candidate lead or ordinary member of the
department(s) whose `departmentId` lost the tie-break.

**A note on this rule's Stage-2 testability, flagged rather than silently
resolved.** Producing a second concurrent `DepartmentMembership` row for one
user requires the real "plain add" write path,
`add-department-membership.action.ts`, which is reachable **only** through
`POST /users/:id/department-memberships` on `relationships.controller.ts` —
an HTTP route requiring a full Nest boot. This folder's scenarios are declared
DB-level, subprocess-only (Ask First **AF-1**), and the spec's own Stage 2 task
list for `test/access-control/s42d-ds-dev-seed-org.e2e-spec.ts` does not name
a dedicated AF-5 assertion among the things that subprocess-only suite is
asked to assert (shape, idempotence, empty-population, the `NODE_ENV` throw,
retirement facts). This scenario document states the AF-5 rule with full
precision, as the spec's own Ask First ruling requires, but whether Stage 2
also exercises it live — via a hybrid Nest-boot step inside this otherwise
subprocess-only suite, or left as a documented-but-unexercised rule pending a
human call — is left open for the Stage-2 gate to decide, not assumed here.

**Preconditions:** produced by real in-suite steps, no hardcoded ids:

1. `npm run db:deploy` → `npm run db:seed` (run-scoped `ROOT_WORK_EMAIL`) →
   `npm run db:bootstrap:access-control`, each exit `0`.
2. The delivered `docs/Accounts_template.csv`'s original bytes are captured in
   memory before any mutation.
3. A suite-authored CSV — several departments, one single-member department,
   every row active (`IsDismissed=0`) — is written to that same real path and
   imported via `npm run db:import:population`, exit `0`.
4. The delivered file's original bytes are restored to disk in `afterAll`,
   run unconditionally (including on assertion failure), so a failed run never
   leaves the tracked fixture in a mutated state for any other suite sharing
   the checkout.
5. Every created user's id and department are read back from `users` /
   `department_membership` by this run's own workEmail prefix, never
   hand-written.

## Test 1 — one edge per department lead, straight to root

- **entrypoint:** `npm run db:dev:seed-org` after the Preconditions above
- **preconditionState:** N departments with ≥1 active member each imported
  this run; zero `relationships` rows for any of this run's users
- **expectedDatabaseState:** for each department, exactly one row
  `{ userId: <lowest-id active member's id>, type: 'direct', reportsToUserId: <root's id> }`
  exists in `relationships`; no other row has `userId` equal to any
  synthesized lead's id

## Test 2 — one edge per ordinary member, to their own department's lead

- **entrypoint:** same run as Test 1 (one invocation produces both shapes)
- **preconditionState:** as above
- **expectedDatabaseState:** for every active member who is **not** their
  department's synthesized lead, exactly one row
  `{ userId: <member's id>, type: 'direct', reportsToUserId: <that department's lead id> }`
  exists; every such row's `reportsToUserId` resolves, within one more hop, to
  root — no three-level chain exists anywhere in this run's namespace

## Test 3 — root never becomes a subject

- **entrypoint:** same run
- **preconditionState:** as above
- **expectedDatabaseState:** `SELECT count(*) FROM "relationships" WHERE "userId" = :rootId` is `0`, unconditionally — root's identity never appears as the subject column of any row this script writes, matching the inherited Never rule from `spec-4-2b-tree-root-seed.md`

## Test 4 — the single-member department collapses lead and member into one edge

- **entrypoint:** same run
- **preconditionState:** one department imported with exactly one active
  member
- **expectedDatabaseState:** that one member has exactly one `direct` row,
  `reportsToUserId = root`, and there is no second row for that user pointing
  anywhere else — the "lead" and "ordinary member" cases are the same person
  and produce exactly one edge, not two or zero

## Test 5 — exact row-count accounting

- **entrypoint:** same run
- **preconditionState:** as above, department/member counts known from the
  suite's own CSV construction
- **expectedDatabaseState:** total `direct` row count for this run's namespace
  equals exactly (departments with ≥1 active member) + (active members who are
  not their department's lead) — asserted as an exact number derived from the
  suite's own fixture, not merely "greater than zero"
