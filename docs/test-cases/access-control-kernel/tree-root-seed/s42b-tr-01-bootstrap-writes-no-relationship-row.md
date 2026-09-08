# S4.2b-TR-01 · A fresh production bootstrap writes zero `Relationship` rows

> **New Stage-1 scenario, PLAT-E4-S4.2b (2026-09-06).** This is a
> **verification**, not new seed logic — the same shape Story 4.2 scope item 1
> turned out to be. Root sitting at the top of the `reports-to` tree is not a
> row anyone writes; it is the **absence** of one. No suite in this repository
> today asserts that absence at runtime — the Code Map in
> [`spec-4-2b-tree-root-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2b-tree-root-seed.md)
> establishes it by `grep -in "relationship"` over three files, each returning
> **zero matches**. This file is the runtime oracle behind that grep table: it
> proves the negative fact against a live database the real deploy chain
> produced, not only against the source text. **No red state is expected.**
> This is a regression lock over an already-correct property, exactly like
> [`s42a-op-02`](../fr-bootstrap/s42a-op-02-rerun-over-a-three-key-database-adds-only-the-new-rows.md)'s
> upgrade-rerun lock.

> **CORRECTED 2026-09-06 (John, PM, on PO ruling) — the precondition below does
> not hold outside a genuinely pristine database.** Stage 2 found `relationships`
> is **not** one of the five bootstrap-owned tables `resetBootstrapState()`
> resets (`AccessControlBootstrap`, `UserPolicies`, `PolicyPermissions`,
> `Permissions`, `Policies`), and nothing in this file's own preconditions
> clears it either. On a database with any prior activity — precisely what a
> developer's persistent local Postgres looks like — the "whole table empty"
> Given is false through no fault of the code under test, and this file cannot
> distinguish that from a real defect. CI's per-run `docker compose up --wait`
> + `-v` teardown happens to make the Given true there, which is why this went
> undetected until Stage 2 ran it against a long-lived local database.
>
> **The scenario is renegotiated from an absolute-state check to a
> before/after delta check** — the fact this increment actually needs to prove
> is "bootstrap changes the count by zero," not "the count is zero." That
> holds in any environment, dirty or clean, and is exactly what a manual
> verification run confirmed by hand against a populated local database on
> 2026-09-06 (delta was zero in both directions). The **Scenario** and **Test**
> sections below are amended accordingly; the original absolute-zero text is
> struck, not deleted.

**Trace:**

- Story [`story-4-2-default-org-relationship-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md), Sequencing table — `4.2b`, "Tree-root seed — verification that root needs no `Relationship` row to sit at the top of the `reports-to` chain."
- Spec [`spec-4-2b-tree-root-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2b-tree-root-seed.md) — Intent, "there is no point in this system's lifecycle ... at which any code writes a `Relationship` row where `userId` is root's id"; Boundaries & Constraints, "The only durable fact this increment is responsible for is negative"; Tasks & Acceptance, first Acceptance Criterion.
- `services/backend` HEAD `4ce8bd8`, read in full by the spec's Code Map: `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts:1-430` (`grep -in "relationship"` → zero matches; the file touches only `Permissions`, `Policies`, `PolicyPermissions`, `UserPolicies`, `AccessControlBootstrap`); `prisma/seed.ts:1-6` (creates exactly one `User` row, `grep -in "relationship"` → zero matches); `scripts/import-population.ts:3-4` (binding deploy order `db:deploy → db:seed → db:bootstrap:access-control → db:import:population`; `grep -in "relationship"` → zero matches — not exercised by this file, cited for completeness of the deploy-chain claim).
- `prisma/schema.prisma:292-314` `model Relationship` — a row is written per subject (`userId`); there is no column or row shape that represents "is the tree root."
- `prisma/migrations/20260830010000_access_control_relationships/migration.sql:33-36` — `relationships_one_direct_per_user`, keyed on `userId` (the subject), never on `reportsToUserId` (the manager); nothing caps how many other rows may point *at* root.
- `test/access-control/acm1r-fr-foundation.e2e-spec.ts:47-159, 260-270, 310-319` — the subprocess-only pattern (`runScript`/`runSeed`/`runBootstrap` over `npm run <script>`, run-scoped `emailFor`, `resetBootstrapState`, `deleteRunUsers`) this file's own Stage-2 e2e reuses verbatim, per the spec's Code Map § "Precedent harnesses this spec's e2e reuses, not reinvents."
- [`s42a-op-01`](../fr-bootstrap/s42a-op-01-bootstrap-entrypoint-npm-alias.md) / [`s42a-op-02`](../fr-bootstrap/s42a-op-02-rerun-over-a-three-key-database-adds-only-the-new-rows.md) — the sibling DB-level, subprocess-only scenarios this file's Test format mirrors.

## Scenario

**Given** ~~a migrated, empty database with no bootstrap-owned rows and no
`User` row in this run's namespace — the same starting state
`acm1r-fr-foundation.e2e-spec.ts`'s `resetBootstrapState()` and prefix sweep
produce before every provisioning run.~~

**CORRECTED — Given** a database with the five bootstrap-owned tables reset
and no run-scoped `User` row (exactly what `resetBootstrapState()` and the
prefix sweep guarantee), and **whatever pre-existing `relationships` rows the
shared database happens to hold** — record that count, call it `N`, before
either command runs.

**When** `npm run db:seed` runs with a run-scoped `ROOT_WORK_EMAIL` (creating
the one root `User` row and nothing else), and then `npm run
db:bootstrap:access-control` runs against that same database (seeding the
canonical `hr-admin` functional-role state — `Permissions`, `Policies`,
`PolicyPermissions`, `UserPolicies`, `AccessControlBootstrap` — per
[`ACM1-FB-01`](../fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md)
through
[`ACM1-FB-04`](../fr-bootstrap/acm1-fb-04-exactly-one-root-attachment.md)).

**Then** ~~both commands exit `0`, and the `relationships` table has **zero**
rows in the whole database — not merely zero rows where `userId` is root's
id, but zero rows, period, because root is the only `User` that exists at
this point and nothing in either script ever reaches the `Relationship`
model.~~

**CORRECTED — Then** both commands exit `0`, and the `relationships` table's
total row count is **still `N`** — unchanged by either command, because
nothing in either script ever reaches the `Relationship` model. Root's own
count of `direct` / `people_partner` rows (`userId` = root's id) is **zero**,
which does not depend on `N` at all: it is a `WHERE userId = :rootId` scan
over a table row nobody has written for this specific, freshly-created user,
regardless of what else the table holds.

This is the increment's one durable, negative fact, asserted against a live
database rather than inferred from reading source. It is not new behaviour:
`access-control-bootstrap.ts` and `prisma/seed.ts` already do this today, at
the baseline commit, with no code change pending in any later stage of this
increment (Stage 3 may add documentation-only comments to these two files per
a separate Ask-First ruling, but no statement they execute changes).

**Preconditions:** produced by real in-suite steps, no hand-written ids
anywhere, following the `s42a-op-01`/`s42a-op-02` precedent exactly:

1. `resetBootstrapState()` deletes the five bootstrap-owned tables
   (`AccessControlBootstrap`, `UserPolicies`, `PolicyPermissions`,
   `Permissions`, `Policies`) in RESTRICT-safe order, tolerating "relation does
   not exist," before the run.
2. A prefix sweep (`deleteRunUsers`, matched on this suite's own run-scoped
   `users.workEmail` prefix, not a single run id, so a run that dies before
   teardown does not leak into the shared development database) removes any
   stray `User` row from a previous failed run of this file.
3. The `relationships` table is asserted empty for this run's namespace before
   the commands run — not assumed.
4. The same reset runs again after the suite, in `afterAll`, mirroring
   `acm1r-fr-foundation.e2e-spec.ts`'s own cleanup so this file leaves no
   singleton global state (root identity, the one `hr-admin` FR policy) behind
   for any other suite sharing the one `--runInBand` database.

## Test — a fresh `db:seed && db:bootstrap:access-control` writes zero `Relationship` rows

- **entrypoint:** `npm run db:seed` with a run-scoped `ROOT_WORK_EMAIL`,
  followed by `npm run db:bootstrap:access-control` with the same email
- **preconditionState (CORRECTED 2026-09-06 — delta-based, see banner above):**
  ```sql
  SELECT count(*) FROM "relationships";  -- record as N, whatever it is —
                                          -- NOT asserted to be 0
  SELECT count(*) FROM "users"
   WHERE "workEmail" = :runScopedEmail;  -- 0 (no prior run-scoped root)
  ```
- **expectedDatabaseState (CORRECTED 2026-09-06):** both commands exit `0`;
  `db:seed` produces exactly one active `User` row (root), readable back by
  the normalized run-scoped email; `db:bootstrap:access-control` produces the
  canonical `hr-admin` state and prints its own success line. After both:
  ```sql
  SELECT count(*) FROM "relationships";  -- still N — unchanged, not asserted
                                          -- to be 0
  SELECT count(*) FROM "relationships"
   WHERE "userId" = :rootId;             -- 0 — this IS an absolute assertion,
                                          -- and remains valid regardless of N:
                                          -- rootId is freshly created this run,
                                          -- so no pre-existing row can reference it
  SELECT count(*) FROM "relationships"
   WHERE "reportsToUserId" = :rootId;    -- 0 — same reasoning; nothing in the
                                          -- pre-existing N rows can point at an
                                          -- id that did not exist until this run
  ```
  A nonzero **delta** on the first query, or a nonzero count on either of the
  `:rootId`-scoped queries, is not merely a test failure — per the spec's
  Boundaries & Constraints, it is evidence of a defect to be reported in a
  different story; this spec's own Never list forbids adding a guard here to
  make the count zero again.
