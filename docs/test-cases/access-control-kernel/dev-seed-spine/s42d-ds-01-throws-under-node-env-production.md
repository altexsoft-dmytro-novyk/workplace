# S4.2d-DS-01 · `db:dev:seed-org` throws under `NODE_ENV=production`, before any database connection

> **New Stage-1 scenario, PLAT-E4-S4.2d (2026-09-07).** This is the one
> behaviour in this increment that must be a **genuine improvement** over the
> file it retires, not merely a port: `dev-grant-root.ts`'s own header records
> that its `NODE_ENV` guard was *"deliberately reverted"* on 2026-09-04 so it
> could double as a production stopgap (`dev-grant-root.ts:1-6`). `db:dev:seed-org`
> carries no such stopgap role — 4.2a already closed the production half of the
> gap `dev-grant-root.ts` was covering — so this script's guard is written the
> opposite way from day one, not reverted later. **Expected RED at Stage 2**
> against `services/backend` HEAD `8ec35fd`: `scripts/dev-seed-org.ts` and the
> `db:dev:seed-org` npm alias do not exist yet, so there is no guard to trip —
> the whole command fails with npm's own "Missing script" text, not this
> script's diagnostic, until Stage 3 lands.

**Trace:**

- Spec [`spec-4-2d-dev-seed-spine.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md) — Boundaries & Constraints, "Throws under `NODE_ENV=production`, before any database connection is opened. The guard is the first statement `main()` executes — no `DATABASE_URL`/`PrismaClient` construction happens first."; I/O & Edge-Case Matrix row `NODE_ENV=production`; Tasks & Acceptance first Acceptance Criterion; Design Notes are silent here because the guard is Boundaries-level, not an algorithmic choice.
- Spec Code Map § `src/config/env.validation.ts` — the `NODE_ENV` idiom, and why it does not apply directly: `env.validation.ts:27-29` recognises exactly three values (`development`, `production`, `test`); the one existing `.when('NODE_ENV', {is:'production', ...})` conditional (`ALLOW_TEST_SESSION_TOKENS`, `:108-112`) is Joi schema validation reached through Nest's `ConfigModule` at app boot, which this script never does. The idiom this script actually copies is the **direct env-var read** already used by `dev-grant-root.ts`, `bootstrap-access-control.ts` and `import-population.ts` for `ROOT_WORK_EMAIL`/`DATABASE_URL` — `if (process.env.NODE_ENV === 'production') { throw ...; }` as the first statement in `main()`.
- `dev-grant-root.ts:1-6` — read in full; the header line quoted above is the concrete evidence this guard was consciously absent from the file this increment retires, not merely forgotten.
- `services/backend/package.json:11-38` — the current `scripts` block; `db:dev:seed-org` does not exist at this spec's own baseline (`8ec35fd`).

## Scenario

**Given** a checked-out `services/backend` at a commit where `scripts/dev-seed-org.ts`
exists and `package.json` declares `db:dev:seed-org`, and a `DATABASE_URL`
pointing at a real, reachable, migrated Postgres database.

**When** `npm run db:dev:seed-org` is invoked with `NODE_ENV=production` set in
the child process's environment.

**Then** the process throws and exits nonzero **before** a `PrismaClient` (or
`PrismaPg` adapter) is ever constructed and before any statement reaches the
database — no `Relationship`, `User`, or any other table row is read or
written, and the database's full row-count snapshot (every table the script
could plausibly touch) is byte-identical before and after the invocation. The
diagnostic names the refusal reason (analogous to `dev-grant-root.ts:83-88`'s
and `access-control-bootstrap.ts:299-305`'s own missing-env-var diagnostics),
not a generic stack trace, and `process.exitCode` is `1`.

**This is the opposite of `dev-grant-root.ts`'s current behaviour** — that
file has no `NODE_ENV` check anywhere (confirmed by the Code Map's full read)
and would run to completion under `NODE_ENV=production` today. This scenario
is therefore a genuine new capability, not a regression lock over something
already true.

**Note on adjacent I/O Matrix rows not given their own scenario file.** The
spec's I/O & Edge-Case Matrix also lists `ROOT_WORK_EMAIL` unset/blank and
"root not found, or ambiguous" as rows, both explicitly modelled on
`dev-grant-root.ts:83-88` / `:104-111`'s own existing diagnostics. The spec's
own Tasks & Acceptance list names exactly five files for this folder and does
not request a dedicated scenario for either row, so none is authored here —
both are the same idiom this script's root-resolution step copies verbatim
from a script this repository already ships, and the only new, discriminating
behaviour this increment introduces is the guard this file covers. They remain
cited here so a reader of this folder is not left wondering whether they were
overlooked.

**Preconditions:** produced by real in-suite steps, no hardcoded ids:

1. A migrated database (`npm run db:deploy`), reachable via `DATABASE_URL`.
2. `npm run db:seed` has been run once (run-scoped `ROOT_WORK_EMAIL`) so a real
   root `User` row exists — the guard must still fire even when everything
   downstream of it would otherwise succeed; a database with nothing to seed
   is not what discriminates this scenario.
3. A full pre-invocation row count is taken across every table `db:dev:seed-org`
   could touch (`users`, `department_membership`, `relationships` at minimum)
   for this run's namespace, so the "unchanged" assertion is a real delta
   check, not an assumption of an empty table — the same discipline
   `S4.2b-TR-01` uses for the sibling "writes nothing" claim.

## Test 1 — the guard fires and exits nonzero

- **entrypoint:** `npm run db:dev:seed-org`, `NODE_ENV=production` set in the
  child environment, `DATABASE_URL` and `ROOT_WORK_EMAIL` both valid and
  pointing at the precondition database above
- **preconditionState:** database reachable, root `User` row present, no
  `direct` `Relationship` rows written by this script yet
- **expectedDatabaseState:** the process exits nonzero (`process.exitCode = 1`
  per this script's own `main().catch()` idiom, matching `dev-grant-root.ts:170-173`);
  stderr/stdout carries a diagnostic naming `NODE_ENV=production` as the
  refusal reason, not a generic unhandled-rejection stack

## Test 2 — no database connection is attempted

- **entrypoint:** same invocation as Test 1
- **preconditionState:** the full per-table row-count snapshot from
  Preconditions step 3
- **expectedDatabaseState:** the same snapshot, taken again after the process
  exits, is byte-identical — zero new, deleted, or modified rows in `users`,
  `department_membership`, or `relationships`. A database driver connection
  attempt that itself fails (e.g. a deliberately wrong `DATABASE_URL` supplied
  alongside `NODE_ENV=production`) still exits nonzero with the **guard's**
  diagnostic, not a connection-refused error — proving the guard runs before
  the `PrismaPg` adapter is even constructed, not merely before the first
  query.
