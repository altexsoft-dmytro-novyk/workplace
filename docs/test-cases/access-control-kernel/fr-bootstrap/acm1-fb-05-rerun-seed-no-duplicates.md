# ACM1-FB-05 · Running the seed again creates no duplicates

> **Amended 2026-09-06 — PLAT-E4-S4.2a.** The canonical ACM-1 `hr-admin` set
> grew from three keys to **six**: the three original `user-management:*` keys
> plus `org:relationships:write`, `employee:departure:record`, and
> `profile:timeline:write` — the last a **known, deliberately accepted deviation
> from a NORMATIVE invariant** (AF-2, Dmytro Novyk, Product Owner, 2026-09-06).
> The full record, the live consumer of every key, and the dated AF-4 note that
> the ratified architecture text still says *"exactly three"* and contradicts
> this file, are in
> [`ACM1-FB-01`](./acm1-fb-01-three-canonical-permissions-seeded.md).
>
> **This file's numbers change:** `Permissions` `3` → **`6`** and `PolicyPermissions` `3` → **`6`**, on both
> runs. `Policies`, `UserPolicies` and the singleton are unchanged at `1`. The
> **idempotence contract itself does not move**: a rerun over a database already
> bootstrapped at six keys still writes nothing and preserves every generated
> id. The separate case of a rerun over a database bootstrapped at the *old*
> three-key set is
> [`S4.2a-OP-02`](./s42a-op-02-rerun-over-a-three-key-database-adds-only-the-new-rows.md).

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Any conflicting drift, lock timeout, or failure rolls back the transaction, and later administrator attachments remain distinct."
- SPEC Constraints — "Reruns restore missing owned rows, fail before writes when an identity or authorization-bearing field differs, preserve descriptive fields and generated ids, and never delete or rewrite administrator-added rows, grants, or attachments ... Concurrent identical seeds must converge to one bootstrap set with no partial state."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "Reruns are non-destructive ensure operations over the bootstrap identities. They may insert missing bootstrap objects and verify their exact grants, but must fail before writes on conflicting seed-owned drift."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — "Reruns non-destructively ensure the bootstrap identities and exact bootstrap grants. Conflicting seed-owned drift fails before writes."

## Scenario

**Given** `npm run db:bootstrap:access-control` has already completed once
against this database, producing the canonical six `Permissions` rows, the
one `hr-admin` FR policy, its six `PolicyPermissions` grants, the one
`UserPolicies` root attachment, and the `AccessControlBootstrap` singleton —
with no drift since that run (root identity, policy fields, and grants all
still match what was recorded).

**When** `npm run db:bootstrap:access-control` runs a second time, unchanged
environment, against the same database.

**Then** the run completes without error and every count from the first run
is unchanged: exactly six `Permissions` rows with the same `id`s, exactly
one `hr-admin` `Policies` row with the same `id`, exactly six
`PolicyPermissions` grants, exactly one `UserPolicies` attachment, and the
`AccessControlBootstrap` singleton's `normalizedRootEmail`, `rootUserId`, and
`policyId` are byte-identical to before the second run. No row is inserted,
deleted, or reassigned a new id.

**Preconditions:** the ACM1-FB-01 through ACM1-FB-04 outcomes already hold
from a prior run; no administrator or drift has touched the canonical rows
since.

## Test — rerunning the bootstrap is a no-op ensure

- **entrypoint:** `npm run db:bootstrap:access-control` (first run, to
  establish the baseline), then `npm run db:bootstrap:access-control` again
- **preconditionState:** row ids and singleton column values captured after
  the first run — `Permissions.id ×6`, `Policies.id` for the FR row,
  `AccessControlBootstrap.{normalizedRootEmail, rootUserId, policyId}`
- **expectedDatabaseState:** after the second run —
  ```sql
  SELECT count(*) FROM "Permissions";                    -- 6
  SELECT count(*) FROM "Policies" WHERE type = 'FR';      -- 1
  SELECT count(*) FROM "PolicyPermissions";               -- 6
  SELECT count(*) FROM "UserPolicies";                    -- 1
  ```
  every captured id and the singleton's three columns are unchanged from the
  first-run snapshot
