# S4.2d-DS-08 · The dev seed is absent from `prisma/seed.ts` and `scripts/bootstrap-access-control.ts`

> **New Stage-1 scenario (2026-09-13), closing `E4-C06` obligation (6).** The test plan names
> this obligation's own oracle as `git grep -n "seed-org\|dev-seed-org"` over both real
> deploy-time entrypoints and leaves it "Planned." This scenario automates that oracle as a
> static, DB-free regression test, so the check reruns on every `npm test` instead of depending
> on a human rerunning the grep by hand.

> **Scenario-id note.** `S4.2d-DS-06` and `S4.2d-DS-07` are already assigned elsewhere in this
> family: `S4.2d-DS-06` is
> `test/user-management/access-control-adoption/s42d-ds-root-resolves-over-seeded-population.e2e-spec.ts`
> (root's own read access over the seeded population — a different E4-C06-adjacent question, not
> this absence obligation), and `S4.2d-DS-07` is
> [`s42d-ds-07-seeded-edges-are-journaled.md`](s42d-ds-07-seeded-edges-are-journaled.md), reserved
> for obligation (7) on `feat/plat-e4-dev-seed-journal` (not yet merged at the time this scenario
> was written). `S4.2d-DS-08` is the next free id in the family.

**Trace:**

- Test plan: `_bmad-output/test-artifacts/test-design-epic-platform-4.md` `E4-C06`, obligation
  (6): "**absent** from `prisma/seed.ts` and `scripts/bootstrap-access-control.ts`." Planned
  oracle: `git grep -n "seed-org\|dev-seed-org"` over both entrypoints.
- Implementation: `services/backend/src/access-control/infrastructure/bootstrap/dev-seed-absence.spec.ts`.
- Entrypoints under test: `services/backend/prisma/seed.ts` (`npm run db:seed`) and
  `services/backend/scripts/bootstrap-access-control.ts` (`npm run db:bootstrap:access-control`).
- The module this scenario asserts is absent: `services/backend/scripts/dev-seed-org.ts`
  (`npm run db:dev:seed-org`), traced in
  [`s42d-ds-01-throws-under-node-env-production.md`](s42d-ds-01-throws-under-node-env-production.md)
  onward. `dev-seed-org.ts` has no exports — it is a standalone script whose `main()` runs as an
  import side effect — so the only way it could reach either entrypoint is a textual reference
  (the plan's own grep) or a bare `import` of the file itself, at any relative depth.

## Scenario

**Given** the two real deploy-time entrypoints, `prisma/seed.ts` and
`scripts/bootstrap-access-control.ts`, as they exist on disk.

**When** each entrypoint's source text is checked for the strings `seed-org` / `dev-seed-org`
(case-insensitive), and each entrypoint's own static `import`/`require` specifiers — plus one
level of the same resolution applied to whatever those specifiers resolve to — are checked for a
path that resolves to `scripts/dev-seed-org.ts`.

**Then** neither entrypoint's text matches the pattern, and neither entrypoint (directly, or one
level into whatever it imports) statically resolves to `scripts/dev-seed-org.ts`.

**Preconditions:** none beyond a checkout of `services/backend` — no database, no Nest boot, no
fixture data. Pure `node:fs` reads of files already on disk.

## Test 1 — `prisma/seed.ts` carries no textual or resolved-import reference to the dev seed

- **entrypoint:** none — static file read of `prisma/seed.ts`
- **preconditionState:** a checkout of `services/backend`
- **expectedDatabaseState:** not applicable; the file's text does not match `/seed-org|dev-seed-org/i`,
  and none of its relative `import`/`require` specifiers (direct or one level deep) resolve to
  `scripts/dev-seed-org.ts`

## Test 2 — `scripts/bootstrap-access-control.ts` carries no textual or resolved-import reference to the dev seed

- **entrypoint:** none — static file read of `scripts/bootstrap-access-control.ts`
- **preconditionState:** a checkout of `services/backend`
- **expectedDatabaseState:** not applicable; the file's text does not match `/seed-org|dev-seed-org/i`;
  its one relative import (`../src/access-control/infrastructure/bootstrap/access-control-bootstrap`)
  is resolved and read in turn, and neither it nor anything it further imports resolves to or
  mentions `scripts/dev-seed-org.ts`

## Test 3 — sanity: the resolver actually finds `scripts/dev-seed-org.ts` on disk

- **entrypoint:** none — static file read of `scripts/dev-seed-org.ts`
- **preconditionState:** a checkout of `services/backend`
- **expectedDatabaseState:** not applicable; guards against a silently-broken resolver producing a
  false negative in Tests 1-2 (a path bug that made the resolver miss every file would make this
  scenario vacuously green) — asserts the file exists and its own text matches the dev-seed
  pattern

## Out of scope

- Whether `dev-seed-org.ts`'s *logic* is duplicated inline in either entrypoint rather than
  imported. The obligation and its oracle are about wiring (a reference to the module/script),
  not about independently re-derived behaviour; that risk is not decided by this scenario.
- `create:root`'s own script chain not including `db:dev:seed-org` — that is
  [`S4.2d-DS-05`](s42d-ds-05-dev-grant-root-retired-and-create-root-repointed.md) Test 3's
  literal-string assertion on `package.json`, not this file's concern.
