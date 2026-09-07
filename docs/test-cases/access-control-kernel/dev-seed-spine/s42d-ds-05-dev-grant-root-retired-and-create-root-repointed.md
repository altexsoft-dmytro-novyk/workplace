# S4.2d-DS-05 · `dev-grant-root.ts` is deleted in full, and `create:root` is repointed to the production chain plus the new dev script

> **New Stage-1 scenario, PLAT-E4-S4.2d (2026-09-07).** Two manifest-level
> facts that are the file-retirement half of this increment's coupling
> (Intent, "three things share one increment because they are coupled by the
> same file's retirement"): the file and its npm alias stop existing, with no
> shim and no deprecation warning, and `create:root` — deliberately left
> pointing at the old script by 4.2a's own **AF-5** deferral — is repointed
> here, the increment 4.2a named as the one that would do it. **Expected RED
> at Stage 2** — at HEAD `8ec35fd`, `scripts/dev-grant-root.ts` still exists
> and `create:root` still points at it.

> **CORRECTED 2026-09-07 (Dmytro Novyk, PO, after a Stage-3 code review) —
> `create:root` does NOT get `db:dev:seed-org` appended.** Every reference
> below to `create:root` being repointed to
> `"npm run db:seed && npm run db:bootstrap:access-control && npm run
> db:dev:seed-org"` is superseded; the correct, shipped value is `"npm run
> db:seed && npm run db:bootstrap:access-control"` — unchanged from what
> `create:root` did for root-creation and root-permission purposes before
> this increment.
>
> **Why:** `db:dev:seed-org` reads `DepartmentMembership` rows, which only
> `db:import:population` creates. Neither `create:root` nor its predecessor
> ever ran the importer, and the real dev workflow is
> `create:root` → sign in → **import** — so a `db:dev:seed-org` step bundled
> into `create:root` always ran against zero memberships. It didn't fail; it
> silently logged `"nothing to seed"` and exited `0`. The org-spine feature
> this whole increment exists to deliver therefore never actually fired in
> the intended workflow, with no error and no documented extra step to make
> it fire — a real ordering defect, not a style choice. `db:dev:seed-org`
> remains fully built and fully tested; it is a standalone script now, run by
> hand any time after import.
>
> This does not touch the rest of the file's substance: `dev-grant-root.ts`'s
> deletion, the `db:dev:grant-root` alias's removal, and the AF-2 orphaned-key
> ruling are all unaffected and unchanged.

**Trace:**

- Spec [`spec-4-2d-dev-seed-spine.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md) — Boundaries & Constraints, "`scripts/dev-grant-root.ts` is deleted in full, including its `db:dev:grant-root` npm script entry. No shim, no deprecation warning left behind" and "`create:root` is repointed to `db:seed && db:bootstrap:access-control && db:dev:seed-org`"; I/O & Edge-Case Matrix row "`dev-grant-root.ts` invoked after retirement"; Tasks & Acceptance, fifth and sixth Acceptance Criteria; Ask First **AF-2** (resolved: leave the orphaned `user-management:edit` key alone, no cleanup); Never list, "Never repair, migrate, or backfill an existing dev database's `dev-grant-root.ts`-granted rows."
- Spec Code Map § "`scripts/dev-grant-root.ts` — read in full, what it actually does": `dev-grant-root.ts:8-14` — *"SUPERSEDED BY Platform Epic 4 Story 4.2 ... Delete this file when 4.2 lands."* — the file's own header names its retirement condition.
- Spec Code Map § "Compared against the canonical six — the one real gap": `dev-grant-root.ts:48-77` `ROOT_PERMISSIONS` grants **seven** keys; `access-control-bootstrap.ts:22-70` `CANONICAL_PERMISSIONS` (post-4.2a) grants **six**; the one key in the first set not in the second is `user-management:edit`, confirmed **inert** — zero executable hits in `src/` (story's own scope-item-1 verification table, re-confirmed by this dispatch's own re-run of the same grep, 2026-09-07: `git grep -n "user-management:edit" -- src/` returns four hits, all comments or a negative test assertion `expect(isAllowed).not.toHaveBeenCalledWith(VIEWER, 'user-management:edit')` — none executable).
- Spec Code Map § "`package.json` — the current script block and the repoint": `package.json:11-38`, line 20 `db:dev:grant-root`, line 21 `create:root": "npm run db:seed && npm run db:dev:grant-root"` at the pre-increment baseline — re-confirmed by my own read of `services/backend/package.json`.
- Spec Code Map § "`access-control-bootstrap.ts` — the idempotence idiom to match": `access-control-bootstrap.ts:7-13` header, *"A rerun that pruned back to the canonical set would revoke approved access on every deployment"* — the reasoning Ask First AF-2 extends to leaving the orphaned key alone rather than writing a cleanup migration.

## Scenario

**Part A — the file and its alias are gone, with no shim.**

**Given** this increment has landed.

**When** the filesystem is checked for `scripts/dev-grant-root.ts`, and
`npm run db:dev:grant-root` is invoked.

**Then** the file does not exist, `package.json`'s `scripts` block carries no
`db:dev:grant-root` key at all (not a key that logs a deprecation notice and
does nothing — a true absence), and `npm run db:dev:grant-root` fails with
npm's own `Missing script: "db:dev:grant-root"` text — the nonzero exit npm
itself produces for an undefined script, not a diagnostic this project's own
code emits.

**Part B — `create:root` is repointed to the production chain plus the new dev script.**

**Given** this increment has landed.

**When** `package.json`'s `create:root` entry is read.

**Then** its value is exactly `"npm run db:seed && npm run
db:bootstrap:access-control && npm run db:dev:seed-org"` — verified as a
literal string match, not merely "runs some scripts" — and a real invocation
of `npm run create:root` against a freshly migrated database exits `0` and
leaves root provisioned, the canonical six-key `hr-admin` FR policy attached,
and (given no population imported) zero `Relationship` rows, matching
[`S4.2d-DS-04`](s42d-ds-04-department-with-no-active-members-is-skipped.md)
Part B.

**Part C — the one orphaned permission key is left alone, not migrated (AF-2).**

**Given** a pre-existing dev database on which `dev-grant-root.ts` was run at
some point **before** this increment landed, carrying a `Permissions` row for
`user-management:edit` and its `PolicyPermission` grant to the `hr-admin`
policy.

**When** this increment's code is deployed and `db:bootstrap:access-control`
(now part of the repointed `create:root` chain) runs against that same
database.

**Then** the orphaned `user-management:edit` `Permissions` row and its grant
are **still present**, byte-identical to before — `access-control-bootstrap.ts`'s
own `ensurePermissions`/`ensureGrants` restore missing canonical rows but
never prune a row outside the canonical set (Code Map), and this increment
adds no separate cleanup step. **This is not a gap left by omission — it is
the explicit, dated Ask First AF-2 ruling**: the key is confirmed inert (no
gate in `src/` consults it, re-verified above), and pruning
administrator-writable state on a rerun is exactly the failure mode
`access-control-bootstrap.ts`'s own header comment warns against, even though
this particular row happens to be harmless. A reader of this file should
understand precisely **why** no data migration accompanies this retirement:
retiring the script that used to grant the key is a complete closure of "this
script's known debt clause" (the spec's own Design Notes distinguish this from
the *separate*, pre-existing `acm1r-fr-foundation.e2e-spec.ts` cardinality
drift, which this increment does not touch or fix — Ask First **AF-7**/**AF-8**).

**Preconditions:** produced by real in-suite steps, no hardcoded ids:

1. Part A/B: a checkout of `services/backend` at this increment's landed
   commit; no fixture beyond the filesystem and `package.json` itself for
   Part A; a freshly migrated database for the Part B invocation.
2. Part C: a **separate** database (or a database reset to a pre-increment
   snapshot) on which the **old**, pre-retirement `dev-grant-root.ts` is run
   first — this can only be exercised meaningfully in a Stage-2 harness that
   checks out the pre-increment script before this increment's own deletion
   commit, or by seeding the equivalent `Permissions`/`PolicyPermissions` rows
   directly to simulate "a database that already ran the old script" without
   running deleted code. Which of these two approaches Stage 2 takes is left
   to that stage's own gate, not decided here — both produce the same
   database fact this scenario asserts against.

## Test 1 — the file no longer exists on disk

- **entrypoint:** none — filesystem check
- **preconditionState:** a checkout at this increment's landed commit
- **expectedDatabaseState:** not applicable; `test -f
  scripts/dev-grant-root.ts` fails (exit nonzero, file absent)

## Test 2 — the npm alias is gone, not merely disabled

- **entrypoint:** `npm run db:dev:grant-root`
- **preconditionState:** as above
- **expectedDatabaseState:** not applicable; the invocation fails with npm's
  own `Missing script: "db:dev:grant-root"` text before any script code runs

## Test 3 — `create:root`'s value is the exact repointed chain

- **entrypoint:** none — manifest read (`require('./package.json').scripts['create:root']`)
- **preconditionState:** a checkout at this increment's landed commit
- **expectedDatabaseState:** not applicable; the string equals `"npm run
  db:seed && npm run db:bootstrap:access-control && npm run db:dev:seed-org"`
  exactly

## Test 4 — `create:root` actually runs the repointed chain end to end

- **entrypoint:** `npm run create:root`
- **preconditionState:** a freshly migrated, otherwise-empty database
- **expectedDatabaseState:** exit `0`; exactly one active `User` row (root);
  the canonical six-key `hr-admin` FR policy attached to root; `relationships`
  holds `0` rows (no population imported in this test)

## Test 5 — a database carrying the pre-existing orphaned key is left untouched (AF-2)

- **entrypoint:** `npm run db:bootstrap:access-control` (as part of the
  repointed chain, or standalone) against the Preconditions-2 database
- **preconditionState:** a `Permissions` row for `user-management:edit` and
  its `PolicyPermission` grant to the `hr-admin` policy already present,
  confirmed by a read before this run
- **expectedDatabaseState:** the same row and grant are present afterward,
  same `id`, same `description` — neither deleted nor rewritten; the canonical
  six keys are also present (restored if missing); no seventh-key-specific
  error or warning is raised by the bootstrap for the extra row's mere
  existence
