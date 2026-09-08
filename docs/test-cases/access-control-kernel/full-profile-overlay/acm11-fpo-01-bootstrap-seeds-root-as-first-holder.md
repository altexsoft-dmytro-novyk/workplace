# ACM11-FPO-01 · A fresh bootstrap seeds root as the first full-profile-access holder

> **New Stage-1 scenario, PLAT-E4-S4.2c (2026-09-07).** This is a **real
> red-then-green increment, not a lock**: at HEAD `de508c9`, `prisma/schema.prisma`
> has no `FullProfileGrant` model and no `full_profile_grants` table — the
> `full_profile_grants` table this scenario queries does not exist yet. Stage 2
> lands the migration; Stage 3 lands the bootstrap-seeding logic this scenario
> pins. **AF-1 and AF-6 both carry a 2026-09-07 PO ruling** (Dmytro Novyk) —
> see this folder's entry in
> [`../README.md`](../README.md) for the recorded text; this specific scenario
> does not depend on either ruling (it only proves a table row and a journal
> row exist, not any resolver behavior), but is authored under the same
> now-unblocked Stage-1 dispatch.

**Trace:**

- Spec [`spec-4-2c-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2c-full-profile-access-overlay.md) — I/O & Edge-Case Matrix, "Fresh production bootstrap" row; Tasks & Acceptance, first Acceptance Criterion.
- Solution design [`solution-design-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/access-control/solution-design-full-profile-access-overlay.md) §4 "Bootstrap-time seeding" — the "singleton absent → insert one row" branch, and the journal self-reference rationale.
- [access-control.md § Full-profile access overlay (§2.4)](../../../architecture/access-control.md#full-profile-access-overlay-24) — "First holder seeded at deployment." · "Every grant and revocation is journaled (§3.4)."
- `docs/project-requirements.md` §2.4 "Full profile access" — "The first holder is seeded at deployment."
- Story [`story-4-2-default-org-relationship-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md), Recorded Decision table — root holds "clean read of every section, including the ones the reporting line cannot" as "first holder of the §2.4 full-profile-access grant."
- `services/backend/prisma/schema.prisma:88-96` `enum AccessJournalKind` — `full_profile_grant` at `:93`, `full_profile_revoke` at `:94`, confirmed unused by any writer at HEAD `de508c9` (`grep -rn "full_profile_grant" src/` → zero hits outside the enum).
- `services/backend/prisma/schema.prisma:101` `AccessJournal.actorUserId` — `String`, **not** nullable, confirmed by direct read. This is why the bootstrap-seeded journal row self-references root as its actor (below), mirroring `prisma/seed.ts:149`'s `createdBy: rootId`.
- `services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts:111-128` `acquireBootstrapLock`, called at `:310`; `:308-423` the locked `$transaction` this scenario's new seeding step joins, not a second transaction; `:326` `root` bound and revalidated.
- `services/backend/src/user-management/infrastructure/org-relationship.repository.ts:60-104` `assignManager` — the fact-row-plus-journal-row-in-one-transaction pattern the bootstrap-seed write mirrors (generate the id up front, write both rows in one `$transaction`, `skipDuplicates: true` on the journal insert).

## Scenario

**Given** a freshly migrated, empty database: `full_profile_grants` has zero
rows (the table did not exist before Stage 2's migration; after it, no row has
been inserted for this run), and no `User` row exists yet in this run's
namespace.

**When** `npm run db:seed` runs with a run-scoped `ROOT_WORK_EMAIL` (creating
the one active root `User` row), and then `npm run db:bootstrap:access-control`
runs against that same database.

**Then** `full_profile_grants` gains **exactly one** row:
`holderUserId = root.id`, `grantedByUserId = NULL`, `revokedByUserId = NULL`,
`revokedAt = NULL`. `access_journal` gains **exactly one** new row:
`kind = 'full_profile_grant'`, `actorUserId = root.id`,
`subjectUserId = root.id`, `after` carrying the created grant's own id and
`holderUserId`. Both commands exit `0`.

**Preconditions:** produced by real in-suite steps, no hand-written ids,
following the `acm1-fb-04` / `s42b-tr-01` precedent exactly:

1. The five existing bootstrap-owned tables are reset by `resetBootstrapState()`
   before the run, and `full_profile_grants` is reset alongside them (a Stage-2
   harness extension named explicitly in the spec's Tasks & Acceptance for the
   `acm11-full-profile-overlay-bootstrap.e2e-spec.ts` suite).
2. A prefix sweep removes any stray run-scoped `User` row from a previous
   failed run of this file.
3. `db:seed` creates the one root `User` row this scenario's precondition
   needs — not a hardcoded id.

## Test — a fresh `db:seed && db:bootstrap:access-control` seeds root as first holder

- **entrypoint:** `npm run db:seed` with a run-scoped `ROOT_WORK_EMAIL`,
  followed by `npm run db:bootstrap:access-control` with the same email
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "full_profile_grants"; -- 0
  SELECT count(*) FROM "users"
   WHERE "workEmail" = :runScopedEmail;        -- 0 (no prior run-scoped root)
  ```
- **expectedDatabaseState:**
  ```sql
  SELECT "holderUserId", "grantedByUserId", "revokedByUserId", "revokedAt"
    FROM "full_profile_grants";
  -- exactly one row: holderUserId = <rootId>, grantedByUserId IS NULL,
  --                  revokedByUserId IS NULL, revokedAt IS NULL

  SELECT "actorUserId", "subjectUserId", "kind", "after"
    FROM "access_journal"
   WHERE "kind" = 'full_profile_grant';
  -- exactly one row: actorUserId = <rootId>, subjectUserId = <rootId>,
  --                  kind = 'full_profile_grant',
  --                  after ->> 'holderUserId' = <rootId>
  ```
  Both commands exit `0`.
