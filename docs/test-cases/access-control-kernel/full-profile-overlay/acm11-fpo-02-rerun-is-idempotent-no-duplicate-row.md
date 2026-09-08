# ACM11-FPO-02 · Re-running the bootstrap over an already-seeded database inserts no second row

> **New Stage-1 scenario, PLAT-E4-S4.2c (2026-09-07).** Mirrors
> [`acm1-fb-05`](../fr-bootstrap/acm1-fb-05-rerun-seed-no-duplicates.md)'s
> rerun-is-a-no-op shape and
> [`acm1r-fb-20`](../fr-bootstrap/acm1r-fb-20-absent-singleton-adopts-existing-fr-policy.md)..[`22`](../fr-bootstrap/acm1r-fb-22-absent-singleton-adopts-changed-root.md)'s
> "singleton present → verify; singleton absent → create" precedent, applied to
> the `FullProfileGrant` singleton instead of the FR-policy singleton. This
> scenario is a **real red-then-green** proof, not a lock: the seeding logic it
> exercises does not exist until Stage 3.

**Trace:**

- Spec [`spec-4-2c-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2c-full-profile-access-overlay.md) — I/O & Edge-Case Matrix, "Rerun over an already-seeded DB" row; Always list, "The bootstrap seeding condition is 'zero `FullProfileGrant` rows exist anywhere,' not 'no row for root specifically.'"; Never list, "Never make the seed condition 'no row for root.'"
- Solution design [`solution-design-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/access-control/solution-design-full-profile-access-overlay.md) §4 — "`SELECT count(*) FROM full_profile_grants FOR UPDATE` (under the same lock) — zero rows means 'first run, seed root'; one or more rows means 'already bootstrapped or already administered, verify-or-no-op.'"
- Solution design §1.2 — the `FullProfileGrant` model's `UNIQUE (holderUserId) WHERE revokedAt IS NULL` partial-unique index: the backstop that makes a duplicate *live* row for the same holder unrepresentable even if the count-under-lock check were ever bypassed.
- `services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts:1-13` header comment — the script's re-runnable-by-design contract.
- `services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts:111-128` `acquireBootstrapLock` — the same advisory lock already serializing the FR-policy singleton check now also scopes the `full_profile_grants` count-under-lock read.

## Scenario

**Given** `npm run db:seed && npm run db:bootstrap:access-control` has already
completed once against this database, producing the one `full_profile_grants`
row from [`ACM11-FPO-01`](./acm11-fpo-01-bootstrap-seeds-root-as-first-holder.md)
(`holderUserId = root.id`, `grantedByUserId = NULL`, `revokedAt = NULL`) and its
paired `access_journal` row, with no drift since that run.

**When** `npm run db:bootstrap:access-control` runs a second time, unchanged
environment, against the same database.

**Then** the run completes without error, `full_profile_grants` still has
**exactly one** row with the same `id` as before the second run, and no second
`access_journal` row with `kind: 'full_profile_grant'` is inserted (still
exactly one, same `id`, same `actorUserId`/`subjectUserId`/`after` as before).
No drift error is raised — the count-under-lock check sees `count = 1`, takes
the verify-or-no-op branch, and never attempts an insert.

**Preconditions:** the `ACM11-FPO-01` outcome already holds from a prior run in
this same test file; no administrator or drift has touched
`full_profile_grants` since.

## Test — rerunning the bootstrap over a seeded `full_profile_grants` table is a no-op

- **entrypoint:** `npm run db:bootstrap:access-control` (second run; the first
  run establishing the baseline is `ACM11-FPO-01`'s own entrypoint)
- **preconditionState:** the single row's `id` and column values captured
  after the first run —
  ```sql
  SELECT "id", "holderUserId", "grantedByUserId", "revokedAt"
    FROM "full_profile_grants"; -- exactly 1 row, captured as the baseline
  SELECT "id" FROM "access_journal"
   WHERE "kind" = 'full_profile_grant'; -- exactly 1 row, captured as the baseline
  ```
- **expectedDatabaseState:** after the second run —
  ```sql
  SELECT count(*) FROM "full_profile_grants"; -- 1
  SELECT count(*) FROM "access_journal"
   WHERE "kind" = 'full_profile_grant';        -- 1
  ```
  the captured `full_profile_grants` row's `id` and every column, and the
  captured `access_journal` row's `id`, are byte-identical to the first-run
  snapshot. No row is inserted, deleted, or reassigned a new id.
