# Final Current-Technology and Brownfield-Reality Review

**Reviewing:** updated `ARCHITECTURE-SPINE.md` and synchronized Access Control
architecture/specification artifacts  
**Reviewer date:** 2026-08-30  
**Scope:** FR-only database enforcement, root bootstrap concurrency and
provenance, `Policies.type`, Departure/composition reality, and ACM-9
measurement feasibility

## Verdict

**Approved for the reviewed scope — no remaining Critical or High findings.**

The revised architecture is feasible on the repository's PostgreSQL 18,
Prisma 7.10, and NestJS 11 stack. The common transaction-scoped advisory lock
closes the absent-row race identified in the previous review. The durable
`AccessControlBootstrap` singleton supplies unambiguous bootstrap provenance,
and `Policies.type NOT NULL` closes the remaining nullable-discriminator shape
gap. The detailed `ACM9-MVP-v1` protocol is implementable and materially
improves repeatability and auditability.

This is an architecture-feasibility verdict, not implementation evidence. The
FR schema, singleton, migration, and bootstrap transaction do not yet exist in
the live backend and still require the specified red PostgreSQL integration
tests and migration review.

## Critical and High findings

**None remaining.**

## Verification

### 1. FR-only `PolicyPermissions` enforcement is feasible and complete

The updated design combines:

- `Policies.type NOT NULL`, restricted to `FR|AR`;
- a row-shape `CHECK` requiring a non-null FR `targetRole` and null FR targets;
- `PolicyPermissions.policyType NOT NULL DEFAULT 'FR'`;
- `CHECK (policyType = 'FR')`;
- non-deferrable `UNIQUE (Policies.id, Policies.type)`;
- composite foreign key `(policyId, policyType)` to `(Policies.id, type)`;
- restrictive foreign keys to `Policies` and `Permissions`;
- pair uniqueness and a permission-first index.

PostgreSQL 18 supports all of these constraints. With both discriminator
columns non-null and type-compatible, a `PolicyPermissions` row must carry
`FR` and can reference only a `Policies` row whose type is `FR`; an AR-policy
grant is structurally rejected.

The repository's established implementation route is appropriate: reviewed
custom migration SQL already owns PostgreSQL `CHECK` constraints and partial
unique indexes that are not represented by the Prisma schema alone:
`services/backend/prisma/migrations/20260830010000_access_control_relationships/migration.sql:1-52`.

Confirmed sources:

- `ARCHITECTURE-SPINE.md:101-106`
- `docs/architecture/database-schema.md:191-270`
- `services/backend/docker-compose.yml:31`
- `services/backend/package.json:40-42,66`
- [PostgreSQL 18 constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)
- [PostgreSQL 18 `CREATE TABLE`](https://www.postgresql.org/docs/18/sql-createtable.html)

Implementation obligation: use the same PostgreSQL discriminator type on both
sides of the composite foreign key and verify the applied catalog, not only
`schema.prisma`.

### 2. Root bootstrap concurrency repair is feasible and closes the High race

Every ACM-1 transaction now acquires one common transaction-scoped advisory
lock derived from `access-control:bootstrap:root-hr-admin` before inspecting
bootstrap state. PostgreSQL advisory locks operate on application-defined keys
and do not require a row to exist, so this serializes:

- simultaneous first runs with no singleton or attachment;
- identical concurrent seeds;
- concurrent seeds configured with different normalized root emails; and
- reruns racing bootstrap-state inspection.

`pg_advisory_xact_lock` is released automatically on commit or rollback and is
safe to invoke through parameterized raw SQL inside a Prisma interactive
transaction. The live backend already demonstrates that interactive Prisma
transactions, raw PostgreSQL statements, and explicit transaction options work
with the current driver adapter:
`services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:25-102`.

The lock is common across root identities, so two differently configured
transactions cannot lock different User rows and both create bootstrap state.
After the first transaction commits, the second sees the durable singleton and
fails on configuration drift. The specified lock timeout prevents indefinite
deployment blocking and converts contention failure into an atomic,
diagnosable result.

Confirmed sources:

- `ARCHITECTURE-SPINE.md:106`
- `docs/architecture/database-schema.md:285-324`
- `_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md:60-72,150-161`
- `_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml:97-127`
- [PostgreSQL 18 advisory lock functions](https://www.postgresql.org/docs/18/functions-admin.html)
- [Prisma transactions and raw queries](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions)

Implementation obligations:

- define one deterministic numeric advisory-lock key derivation and use it in
  every ACM-1 entry point;
- set the lock timeout transaction-locally before acquisition;
- keep all bootstrap inspection and writes inside the same interactive
  transaction;
- fail closed on timeout or transaction error; and
- test the first-run, identical-root, and different-root races against real
  PostgreSQL.

These are implementation details already testable under the updated contract,
not unresolved architecture blockers.

### 3. Durable singleton resolves provenance ambiguity

`AccessControlBootstrap` has a single allowed key, `root-hr-admin`, and records
the normalized root email, root User id, and policy id with unique identity and
restrictive references:
`docs/architecture/database-schema.md:285-298`.

This is sufficient to distinguish the seed-owned attachment from later
administrator-created `hr-admin` attachments. The architecture therefore no
longer needs to infer bootstrap ownership from the role name or treat every
holder of the shareable role as seed state. It can reject changed-root drift
without transferring the bootstrap attachment or deleting legitimate later
attachments.

The singleton is durable provenance rather than an authorization shortcut:
`isAllowed` still joins live `UserPolicies`/FR grants and does not grant from
the singleton itself.

No Critical/High integrity gap remains. A composite foreign key from
`(rootUserId, policyId)` to the corresponding `UserPolicies` pair could make
the recorded attachment relationship structural, but it would also constrain
the documented future ordinary revocation path. Keeping attachment existence
under transactional validation is acceptable for this seed-owned workflow.

### 4. Departure and composition claims still match the brownfield repository

The live Prisma schema contains only `User`, `Relationship`, and `Project`;
there is no `Departure` model or applied Departure migration:
`services/backend/prisma/schema.prisma:12-84`. Documentation of a future model
is not a current persistence seam. Deferring ACM-1/ACM-2 due/departure
evaluation while retaining `User.isActive` is therefore an accurate scoped
statement, not evidence that the future effective-date cutoff already exists.

`AppModule` still does not import `AccessControlModule`, and User Management
still explicitly binds `ACCESS_CONTROL_PORT` to
`InterimAccessControlAdapter`:

- `services/backend/src/app.module.ts:1-21`
- `services/backend/src/user-management/user-management.module.ts:20-38`

The ACM-8 repair target remains the entire stale current-state comment block in
`services/backend/src/access-control/access-control.module.ts:7-14`. Importing
the module does not rebind the User Management port. The spine's diagram
correctly labels the edge as the `ACM-8 target state`.

### 5. `ACM9-MVP-v1` is feasible and sufficiently deterministic

The protocol now fixes:

- exactly 500 requested active targets;
- separate Reporting, direct PP, Colleague, and mixed fixture gates;
- balanced depth 5 followed by depths 25, 50, 100, 200, 300, 400, and 499;
- five discarded warm-ups and twenty measured facade calls per gate;
- nearest-rank p50/p95 and worst case;
- public-facade end-to-end timing, including transaction and result mapping;
- `EXPLAIN (ANALYZE, BUFFERS)` outside timed samples;
- immediate failure on warm p95/worst case above two seconds or statement
  timeout;
- append-only `PASS|FAIL|INCOMPLETE` artifacts for every started run; and
- protocol/fixture identity checks before final-to-baseline comparison.

This is implementable with the current Jest/Prisma/PostgreSQL measurement
harness and addresses the prior risks of incomparable fixtures, overwritten
evidence, undocumented sampling, and plans contaminating latency samples:
`docs/architecture/testing-strategy.md:78-112`.

Twenty samples provide a deterministic MVP gate rather than a statistically
strong production SLO estimate. That limitation is acceptable because the
architecture explicitly scopes ACM-9 to the resolver workload and does not
claim the complete `/users` NFR.

Implementation obligation: interpret “stop immediately” per measured call for
a worst-case breach or statement timeout; do not finish the remaining samples
or later shapes after the failure is observable.

## Required validation

### Automation candidates

- Migration tests reject null/invalid policy types, malformed FR/AR shapes,
  duplicate FR keys, duplicate grant pairs, and FR-discriminator links to AR
  policies.
- Catalog assertions verify the actual PostgreSQL `CHECK`, unique support key,
  composite foreign key, restrictive actions, and indexes.
- Concurrent ACM-1 tests cover no-row first creation, identical root,
  different roots, timeout, rollback, changed configuration, inactive User,
  attachment drift, and preservation of later administrator attachments.
- Singleton tests prove that authorization never reads it as a grant.
- Measurement-harness tests prove nearest-rank calculation, immutable artifact
  creation on setup/partial failure, first-breach stopping, and baseline/final
  comparability rejection.
- ACM-8 container tests prove `AccessControlFacade` resolves while User
  Management retains `InterimAccessControlAdapter`.

### Manual validation

- Review custom migration SQL and inspect `pg_constraint`/`pg_indexes` after
  applying it to PostgreSQL 18.
- Review the exact advisory key, lock timeout, lock order, and transaction
  boundaries before ACM-1 production approval.
- Inspect one baseline and one final ACM-9 artifact, fixture manifest, and plan
  reference before accepting performance evidence.
- Verify ACM-8 changes only root composition and the stale Access Control
  comment, with no User Management behavior or binding change.

## Final conclusion

The prior High absent-attachment race is repaired. The updated constraints,
common transaction advisory lock, durable provenance singleton, and versioned
measurement protocol are technically coherent and feasible on the current
stack. No Critical or High architecture issue remains in the requested review
scope.
