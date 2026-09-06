# S4.2a-OP-01 · The production bootstrap entrypoint is wired as an npm script

> **Precondition repair, not the subject of this increment.** This file exists
> so the two red states PLAT-E4-S4.2a produces are separable at the Stage-2
> gate. **Red state 1** is *this* file: at `services/backend` HEAD `ef03c88`
> there is no `db:bootstrap:access-control` entry in `package.json`, so
> `npm run db:bootstrap:access-control` exits nonzero before the bootstrap runs
> a single statement — and **every** scenario in this folder therefore fails,
> for a reason that has nothing to do with the canonical set. **Red state 2** is
> the discriminating one: with this alias in place the suite executes, every
> shape / lock / adoption / drift / concurrency invariant passes, and the only
> failures left are the cardinality and key-list assertions the six-key set
> moves (`3 !== 6`, `4 !== 7`, and the key-list equality in
> [`ACM1-FB-01`](./acm1-fb-01-three-canonical-permissions-seeded.md)).
>
> Ruled in scope for 4.2a as **AF-1** (option (a), John, PM, 2026-09-06):
> the alias is one line, it adds no behaviour — `scripts/bootstrap-access-control.ts`
> has existed since 2026-09-04 — and it is the entrypoint of the exact thing
> this increment amends. Without it Stage 2 has no oracle that can tell "the
> canonical set is three" apart from "the entrypoint does not exist".

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — ACM-1 is a deploy-time step; the SPEC Constraints require that "Deploy-time stories invoke their exact named production entrypoint", which presupposes the entrypoint resolves.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md) and [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — the binding deploy order `db:deploy` → `db:seed` → `db:bootstrap:access-control` → `start:prod`.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — Stage-1 prose precedes the Stage-2 red and any code; this file is the Stage-1 record for a repair Stage 2 must be allowed to make.
- Spec [`spec-4-2a-root-operator-permission-set.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md) — **AF-1**, and § "Why the missing npm alias is this increment's problem".
- Every artifact in this repository that already names the alias as the deploy step: `access-control-bootstrap.ts:5`, `scripts/bootstrap-access-control.ts:3,24`, `scripts/dev-grant-root.ts:13,24`, `scripts/import-population.ts:4`, `test/user-management/epic-1/fixtures.ts:19,49`, and all 28 `fr-bootstrap` scenario documents in this folder. **The alias makes the documentation true**; it does not introduce a capability.

## Scenario

**Given** a checkout of `services/backend` in which
`scripts/bootstrap-access-control.ts` exists — the deploy-time wrapper that
imports `bootstrapAccessControl` and `createBootstrapPrismaClient` and sets
`process.exitCode = 1` on any failure.

**When** the `scripts` block of `package.json` is read, and separately when
`npm run db:bootstrap:access-control` is invoked against a migrated database
whose CAP-8 root User step has already run.

**Then** the `scripts` block contains the key `db:bootstrap:access-control`,
mapped to an invocation of `scripts/bootstrap-access-control.ts` in the same
form the neighbouring script aliases use; and the invocation resolves and runs
that wrapper, exiting `0` on success and nonzero on any bootstrap failure.

The failure this catches is specific and has already happened. `npm run` on an
undefined script exits nonzero **before** the wrapper is reached. Every
scenario in this folder asserts `exitCode` `0` on a success path, or asserts a
**specific** bootstrap diagnostic on a failure path. A missing alias turns the
first group red for the wrong reason and — but for the deliberately specific
diagnostics — could have turned the second group green for the wrong reason. A
suite in that state cannot discriminate anything, which is precisely why this
scenario is written as its own file rather than folded into
[`ACM1-FB-01`](./acm1-fb-01-three-canonical-permissions-seeded.md).

**No behaviour is added and no default is decided here.** The alias changes no
row, no key, no policy and no gate; it makes an already-shipped script
reachable by the name five other files already give it.

**Preconditions:** a checkout at the increment's baseline;
`scripts/bootstrap-access-control.ts` present and unmodified; a migrated
database and a completed `npm run db:seed` for the second half only.

## Test 1 — the alias is declared

- **entrypoint:** none — read `package.json` from the backend root
- **preconditionState:** `scripts/bootstrap-access-control.ts` exists on disk
- **expectedDatabaseState:** not applicable. The assertion is on the manifest:
  `Object.keys(pkg.scripts)` contains `db:bootstrap:access-control`, and its
  value invokes `scripts/bootstrap-access-control.ts`.

## Test 2 — the alias resolves and runs the wrapper

- **entrypoint:** `npm run db:bootstrap:access-control`, with `ROOT_WORK_EMAIL`
  set to the run-scoped root address the preceding `npm run db:seed` used
- **preconditionState:** `npm run db:seed` has exited `0` for that address and
  the matching active `users` row is readable; the five bootstrap-owned tables
  are empty
- **expectedDatabaseState:** the run exits `0`, prints the wrapper's own success
  line, and leaves the canonical state
  [`ACM1-FB-01`](./acm1-fb-01-three-canonical-permissions-seeded.md) through
  [`ACM1-FB-04`](./acm1-fb-04-exactly-one-root-attachment.md) describe. A
  nonzero exit whose output is npm's *"Missing script"* text, rather than a
  bootstrap diagnostic, fails this scenario.
