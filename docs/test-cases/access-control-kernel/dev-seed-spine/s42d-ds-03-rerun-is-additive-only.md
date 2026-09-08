# S4.2d-DS-03 · A rerun of `db:dev:seed-org` is additive-only — never overwritten, moved, or deleted

> **New Stage-1 scenario, PLAT-E4-S4.2d (2026-09-07).** Idempotence here means
> something narrower than "recomputes and confirms the same answer": a rerun
> creates a `direct` `Relationship` row only for a user who does not already
> hold one **of any kind** — it does not ask whether an existing edge still
> points where today's lead-synthesis snapshot would point it. This is the
> same "ensure presence, never prune or rewrite" philosophy
> `access-control-bootstrap.ts` already applies to its own tables, deliberately
> copied here for `Relationship` rows. **Expected RED at Stage 2** — the script
> does not exist yet, so there is nothing to rerun.

**Trace:**

- Spec [`spec-4-2d-dev-seed-spine.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md) — Boundaries & Constraints, "Idempotent, additive-only. A rerun over an already-seeded org creates edges only for a user (lead or member) who does not yet hold a `direct` `Relationship` row of any kind. An existing edge ... is never overwritten, moved, or deleted."; I/O & Edge-Case Matrix rows "Rerun over an already-seeded org" and "Rerun after a new population-import batch"; Ask First **AF-4** (resolved: no auto-repair when a synthesized lead deactivates — documented limitation, not a defect); Design Notes § "Idempotence — the exact rule and its edge case".
- Spec Code Map § "`bootstrap-access-control.ts` — the idempotence idiom to match": `access-control-bootstrap.ts:243-264` `ensurePermissions` restores missing canonical keys but never rewrites an id/description for one that already exists; `access-control-bootstrap.ts:266-281` `ensureGrants`'s own comment, *"Ensures the six canonical pairs are PRESENT — not that they are the only ones."*; `access-control-bootstrap.ts:7-13` header, *"A rerun that pruned back to the canonical set would revoke approved access on every deployment."*; `dev-grant-root.ts:27`, *"Idempotent: every row is reused when present."*
- `prisma/migrations/20260830010000_access_control_relationships/migration.sql:33-36` `relationships_one_direct_per_user` — the constraint a correct "skip if already present" check must respect: at most one `direct` row per subject.
- `relationships.controller.ts:64` `@Post(':id/relationships')` — the real write route an administrator could also use to add an edge between two seed-org runs; this scenario's second run must not disturb a row written this way either.

## Scenario

**Given** a database already seeded by one successful `npm run db:dev:seed-org`
run over a multi-department imported population (the state
[`S4.2d-DS-02`](s42d-ds-02-two-level-spine-over-imported-population.md)
produces).

**When** `npm run db:dev:seed-org` runs a **second** time, with no new
population import in between.

**Then** the run exits `0`, and **zero new `Relationship` rows** are created —
every candidate lead and every candidate ordinary member from the first run
already holds a `direct` row, so the per-user existence check finds nothing
left to do. The full `relationships` table row count for this run's namespace
is identical before and after the second invocation, and every existing row's
`id`, `userId`, `type`, and `reportsToUserId` are byte-identical — not merely
"the same count," but the same rows, unmoved.

**And, separately:** **when** an administrator wires one additional real edge
through `POST /users/:id/relationships` for a user this script had not yet
reached — for example, a manually-created third department manager — **and
then** `npm run db:dev:seed-org` runs again, **then** that administrator-written
row survives untouched (the script's own existence check treats "any `direct`
row present" as done, regardless of who wrote it or what it points to), and
the script still fills in any edges for users who hold no `direct` row at all.

**And, separately again — the documented, accepted non-repair (Ask First
AF-4):** **given** a department's synthesized lead is later deactivated
(`User.isActive: false`) through the real deactivation route, **when**
`db:dev:seed-org` reruns, **then** the department's other members still hold
their original edge to the now-inactive former lead — nothing promotes a
replacement, because the natural replacement (the next-lowest-id active
member) already holds a `direct` row to the old lead and is therefore already
"present" by this script's own rule. **This is accepted, documented behaviour,
not a defect to fix in this increment or asserted as a bug here** — an HR
Admin's ordinary `POST /users/:id/relationships` write remains the real fix
for an individual edge, exactly as the spec's Ask First ruling states.

**Preconditions:** produced by real in-suite steps, no hardcoded ids:

1. The full seeded-population state from
   [`S4.2d-DS-02`](s42d-ds-02-two-level-spine-over-imported-population.md)'s
   own Preconditions (real deploy chain, real temporary-CSV import, one
   completed `db:dev:seed-org` run).
2. A full snapshot of every `relationships` row for this run's namespace
   (`id`, `userId`, `type`, `reportsToUserId`) taken immediately after that
   first run, before the second run is invoked.
3. For the administrator-write sub-scenario, a genuine
   `POST /users/:id/relationships` call against one of this run's own
   still-unwired users (a Nest boot is required for this one step; the rest of
   this file's assertions stay subprocess-only against the database).
4. For the AF-4 sub-scenario, a genuine deactivation of one synthesized lead
   through the real route, its own `User.isActive` value read back and
   confirmed `false` before the rerun.

## Test 1 — a rerun with no new population creates zero new rows

- **entrypoint:** `npm run db:dev:seed-org`, invoked a second time
- **preconditionState:** the Test-2 snapshot above, taken after run 1
- **expectedDatabaseState:** exit `0`; `relationships` row count for this run's
  namespace unchanged; every row's `id`/`userId`/`type`/`reportsToUserId`
  identical to the pre-rerun snapshot — no row moved, no row's `id` reused for
  a different subject

## Test 2 — a rerun after a new import batch only fills the new gaps

- **entrypoint:** `npm run db:import:population` swapped to a second
  suite-authored temporary CSV adding one new department (and, for the
  existing departments, new active members with no prior `direct` row), then
  `npm run db:dev:seed-org` again
- **preconditionState:** the state after run 1, plus the freshly imported
  department/members, none holding a `direct` row yet
- **expectedDatabaseState:** new `direct` rows exist only for the new
  department's lead/members and for the pre-existing departments' newly-added
  active members; every row from run 1 is untouched, matching the snapshot
  taken before this run

## Test 3 — an administrator-written edge survives a rerun

- **entrypoint:** `POST /users/<id>/relationships` (`{ "type": "direct",
  "targetId": "<manager-id>" }`) against a user this script had not yet
  reached, then `npm run db:dev:seed-org`
- **preconditionState:** that user held no `direct` row before the `POST`
- **expectedDatabaseState:** after the rerun, that user's row is exactly the
  one the `POST` created — same `reportsToUserId` as the administrator chose,
  not overwritten to point at the script's own synthesized lead

## Test 4 — a deactivated lead's department is not auto-repaired (AF-4, documented)

- **entrypoint:** a real deactivation of one department's synthesized lead,
  then `npm run db:dev:seed-org`
- **preconditionState:** that lead's `User.isActive` is `false`; the
  department's other active members still hold their original `direct` row to
  that now-inactive lead
- **expectedDatabaseState:** exit `0`; no new row is created for that
  department; every existing member's `reportsToUserId` still names the
  deactivated former lead — asserted as the expected, accepted outcome, not
  reported as a failure
