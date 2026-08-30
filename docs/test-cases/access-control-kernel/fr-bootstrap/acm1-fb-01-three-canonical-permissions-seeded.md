# ACM1-FB-01 · A fresh database seeds exactly three canonical permission rows

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "the three permissions" is item 1 of the seed contract: "ACM-1 ensures the three permissions, one FR policy, three grants, and one attachment."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "seed atomically and idempotently: 1. Exactly the three permission keys above."
- FR-AMD-1 Fixed Kernel Inputs — "The kernel seeds exactly three canonical permission keys: `user-management:create`, `user-management:deactivate`, and `user-management:list`."
- [database-schema.md § Permissions](../../../architecture/database-schema.md) — "**MVP reduction:** the deploy-time permission catalog is seed/migration-owned, has no HTTP mutation surface, and contains exactly" the three keys above.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — "ACM-0 sits inside the same boundary but has no facade call to make: its subject is the deploy-time root User step, so its Stage-2 evidence runs against migrated PostgreSQL directly." ACM-1's bootstrap step is the same shape: no facade call, direct database evidence.

## Scenario

**Given** a freshly migrated Access Control schema with an empty `Permissions`
table, and the deploy-time root User step (CAP-8/ACM-0) has already created
and validated exactly one active User whose normalized `workEmail` equals
normalized `ROOT_WORK_EMAIL`.

**When** `npm run db:bootstrap:access-control` runs to completion.

**Then** `Permissions` holds exactly three rows, and their `key` values are
exactly `{user-management:create, user-management:deactivate,
user-management:list}` — no more, no fewer, no other key. Each row's `id` is a
freshly assigned uuidv7; no permission id is hardcoded by the seed.

**Preconditions:** freshly migrated database (post-`db:deploy`); `Permissions`
empty; the CAP-8 root User exists and is active. This story treats the CAP-8
root User as an already-satisfied precondition, not as ACM-1 work.

## Test — bootstrap seeds the permission catalog

- **entrypoint:** `npm run db:bootstrap:access-control` (invokes
  `access-control-bootstrap.ts`)
- **preconditionState:** `SELECT count(*) FROM "Permissions"` → `0`
- **expectedDatabaseState:**
  ```sql
  SELECT key FROM "Permissions" ORDER BY key;
  -- 'user-management:create'
  -- 'user-management:deactivate'
  -- 'user-management:list'
  SELECT count(*) FROM "Permissions"; -- 3
  ```
  No fourth row, no missing row, no key outside the canonical three.
