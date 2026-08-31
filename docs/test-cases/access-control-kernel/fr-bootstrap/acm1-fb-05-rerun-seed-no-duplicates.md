# ACM1-FB-05 · Running the seed again creates no duplicates

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Any conflicting drift, lock timeout, or failure rolls back the transaction, and later administrator attachments remain distinct."
- SPEC Constraints — "Reruns restore missing owned rows, fail before writes when an identity or authorization-bearing field differs, preserve descriptive fields and generated ids, and never delete or rewrite administrator-added rows, grants, or attachments ... Concurrent identical seeds must converge to one bootstrap set with no partial state."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "Reruns are non-destructive ensure operations over the bootstrap identities. They may insert missing bootstrap objects and verify their exact grants, but must fail before writes on conflicting seed-owned drift."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — "Reruns non-destructively ensure the bootstrap identities and exact bootstrap grants. Conflicting seed-owned drift fails before writes."

## Scenario

**Given** `npm run db:bootstrap:access-control` has already completed once
against this database, producing the canonical three `Permissions` rows, the
one `hr-admin` FR policy, its three `PolicyPermissions` grants, the one
`UserPolicies` root attachment, and the `AccessControlBootstrap` singleton —
with no drift since that run (root identity, policy fields, and grants all
still match what was recorded).

**When** `npm run db:bootstrap:access-control` runs a second time, unchanged
environment, against the same database.

**Then** the run completes without error and every count from the first run
is unchanged: exactly three `Permissions` rows with the same `id`s, exactly
one `hr-admin` `Policies` row with the same `id`, exactly three
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
  the first run — `Permissions.id ×3`, `Policies.id` for the FR row,
  `AccessControlBootstrap.{normalizedRootEmail, rootUserId, policyId}`
- **expectedDatabaseState:** after the second run —
  ```sql
  SELECT count(*) FROM "Permissions";                    -- 3
  SELECT count(*) FROM "Policies" WHERE type = 'FR';      -- 1
  SELECT count(*) FROM "PolicyPermissions";               -- 3
  SELECT count(*) FROM "UserPolicies";                    -- 1
  ```
  every captured id and the singleton's three columns are unchanged from the
  first-run snapshot
