# S4.2d-DS-04 · A department with zero active members is skipped, and an empty population seeds nothing — both are exit `0`, neither is an error

> **New Stage-1 scenario, PLAT-E4-S4.2d (2026-09-07).** Two related "nothing to
> do" shapes from the spec's I/O & Edge-Case Matrix, grouped in one file
> because both resolve to the same rule: **a department contributes an edge
> only if it has at least one currently active member**; zero such departments
> means zero edges, and that is success, not failure. **Expected RED at
> Stage 2** — the script does not exist yet.

**Trace:**

- Spec [`spec-4-2d-dev-seed-spine.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md) — Boundaries & Constraints, "Only active (`User.isActive: true`) users receive an edge. A department with zero active members is skipped entirely — no lead is synthesized for it, no error is raised."; I/O & Edge-Case Matrix rows "Fresh DB, no population imported" and "A department with zero active members (all dismissed / `isActive: false`)"; Tasks & Acceptance, fourth Acceptance Criterion.
- Spec Code Map: `population-import.repository.ts:73-96` — a newly created `User` row always gets `isActive: true` on import, **regardless of the source row's `IsDismissed` flag**; dismissal is tracked only through a separate `EmploymentStatus` row (`status: 'dismissed'`), never through `User.isActive` at import time. **This means the delivered import path can never by itself produce an inactive user** — the only way to make `User.isActive: false` true for a seeded-population test is the real deactivation route, `DELETE /users/:id` (`users.controller.ts:259-262`, `DeactivateUserAction`), which is HTTP-only and requires a Nest boot.
- **A resolved tension, stated plainly rather than glossed over.** Ask First **AF-1** declares this folder's scenarios DB-level, subprocess-only. `DELETE /users/:id` is not a subprocess. This file's precondition for "a department with zero active members" therefore uses the one remaining option that stays true to the spirit of "subprocess-only, no Nest boot for the behaviour under test": a **direct, minimal Prisma `user.update({ data: { isActive: false } })`** against one already-imported user, performed as fixture setup only — not as the behaviour this file is testing (that behaviour is `db:dev:seed-org`'s own read of `User.isActive`, which is unaffected by how the flag got set). This is a narrower use of direct-Prisma than Ask First **AF-3** authorizes for the spine's own writes; it is fixture plumbing for an input condition, exactly the same category of thing `resetBootstrapState()` and this suite family's own `deleteRunUsers` prefix sweep already do directly against the database rather than through an HTTP route.
- `prisma/schema.prisma` `model User` — `isActive` is a plain boolean column with no lifecycle trigger; a direct update is schema-legal and does not bypass any CHECK constraint this script depends on.

## Scenario

**Part A — a department with zero active members.**

**Given** a department imported with exactly one member, whose `User.isActive`
is then flipped to `false` by a direct fixture-setup Prisma update (not
through this script, and not through `DELETE /users/:id` — see the Trace
note above for why).

**When** `npm run db:dev:seed-org` runs.

**Then** that department is skipped entirely: no lead is synthesized for it,
no `Relationship` row is created for its one (inactive) member, and the run
still exits `0` with no error raised for that department — a department with
zero active members is a normal, expected shape, not a data-integrity
complaint.

**Part B — a fresh database with no population imported at all.**

**Given** the new `create:root` chain (`db:seed && db:bootstrap:access-control
&& db:dev:seed-org`) run against a freshly migrated, otherwise-empty database
— `db:import:population` deliberately **not** run, matching the spec's own
Code Map note that the repointed `create:root` does not include the importer,
exactly as the old chain never did either.

**When** `db:dev:seed-org` executes as the last step of that chain.

**Then** root exists (created by `db:seed`) and is the only `User` row in the
database; the script finds zero departments with any active member (there are
no departments at all), creates **zero** `Relationship` rows, and exits `0`
with a clear "nothing to seed" log line — this is success, not the error case
covered by [`S4.2d-DS-01`](s42d-ds-01-throws-under-node-env-production.md).

**Preconditions:** produced by real in-suite steps, no hardcoded ids:

1. **Part A:** the real deploy chain (`db:deploy` → `db:seed` →
   `db:bootstrap:access-control`), a suite-authored temporary CSV imported via
   `npm run db:import:population` producing one single-member department, then
   a direct `prisma.user.update` on that member's id (read back from `users`
   by this run's own workEmail, never hand-written) setting `isActive: false`,
   confirmed by a follow-up read before the script runs.
2. **Part B:** the real deploy chain (`db:deploy` → `db:seed` →
   `db:bootstrap:access-control`) only — `db:import:population` is skipped for
   this part on purpose, and the test asserts the `users` table holds exactly
   one row (root) before `db:dev:seed-org` runs, not merely "assumed empty."

## Test 1 — the all-inactive department is skipped without error

- **entrypoint:** `npm run db:dev:seed-org`
- **preconditionState:** one department, one member, that member's
  `User.isActive` confirmed `false` by a direct read before the run
- **expectedDatabaseState:** exit `0`; zero `relationships` rows exist for
  that member's id (neither as subject nor as `reportsToUserId` target); no
  other department's seeding is affected by this one department being skipped

## Test 2 — an empty database seeds nothing and reports success, not error

- **entrypoint:** `npm run create:root` (the full repointed chain) against a
  freshly migrated database with no prior `User` rows
- **preconditionState:** `SELECT count(*) FROM "users"` is `0` before
  `db:seed` runs
- **expectedDatabaseState:** after the full chain, `users` holds exactly one
  active row (root); `relationships` holds exactly `0` rows; the process
  exits `0` at every step, including the `db:dev:seed-org` step, whose own
  stdout names the zero-departments case explicitly rather than being silent
  about it
