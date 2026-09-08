# S4.2a-OP-02 · A rerun over a database bootstrapped at three keys adds the three new rows and nothing else

**Trace:**

- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "Reruns are non-destructive ensure operations over the bootstrap identities. They may insert missing bootstrap objects and verify their exact grants, but must fail before writes on conflicting seed-owned drift."
- FR-AMD-1 [Seed-owned drift disposition](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — `Permissions`/`key`: **Absent** → "restore the row"; `Permissions`/`id`: "preserve — the seed matches on `key` and never rewrites a generated id"; `Permissions`/`description`: preserve.
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — "Reruns non-destructively ensure the bootstrap identities and exact bootstrap grants." **Note (AF-4, 2026-09-06):** the same section still says the catalog contains *"exactly the three permission rows above"*. That sentence is a known, dated contradiction with this file, left unedited pending a separate architect pass — see [`ACM1-FB-01`](./acm1-fb-01-three-canonical-permissions-seeded.md).
- [`ACM1-FB-05`](./acm1-fb-05-rerun-seed-no-duplicates.md) — the *undrifted* rerun. This file is its **upgrade** sibling: same idempotence machinery, a starting state that predates the amendment.
- Spec [`spec-4-2a-root-operator-permission-set.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md) — I/O matrix row "Rerun over a **pre-change** database"; Boundaries, "Idempotence and adoption stay intact ... must be proven, not assumed."

## Scenario

**Given** a database that was bootstrapped **before** PLAT-E4-S4.2a — its
`Permissions` table holds the three original canonical keys
(`user-management:create`, `user-management:deactivate`,
`user-management:list`), the one `hr-admin` FR policy holds their three
`PolicyPermissions` grants, the root has its one `UserPolicies` attachment, and
the `AccessControlBootstrap` singleton records that policy and that root. No
drift has been introduced: the root identity, the policy fields and the three
grants all still match what was recorded.

**When** the amended bootstrap — the one whose canonical set is the six keys —
runs against that database as `npm run db:bootstrap:access-control`.

**Then** the run exits `0` and the three absent canonical keys are **restored**
exactly as the drift table dispositions an absent owned row:
`org:relationships:write`, `employee:departure:record` and
`profile:timeline:write` are inserted as new `Permissions` rows with freshly
generated uuidv7 ids and the descriptions the canonical set defines, and three
new `PolicyPermissions` grants join them to the **existing** `hr-admin` policy
with `policyType='FR'`. `Permissions` ends at six and `PolicyPermissions` at
six.

Everything that existed before the run is **byte-identical** afterwards: the
three pre-existing `Permissions` ids, their descriptions, the FR policy's id
and all four of its fields, the three pre-existing grant pairs, the root's
`UserPolicies` attachment, and the singleton's `normalizedRootEmail`,
`rootUserId` and `policyId`. No id is rewritten, no description is overwritten,
no attachment is moved, and no second policy is created.

This is the case that decides whether the amendment is deployable at all.
Growing a canonical set is only safe if the ensure step treats the new keys as
*absent owned rows* rather than as evidence that the catalog has drifted — the
alternative reading would fail every existing deployment on its first run after
the upgrade. The behaviour is already `ensurePermissions`' "reuse by `key`,
never rewrite an id" and `ensureGrants`' insert-on-conflict-do-nothing; this
scenario asserts it rather than assuming it.

**Preconditions:** produced by real in-suite steps, in this order, with no
hand-written ids anywhere:

1. `npm run db:seed` with a run-scoped `ROOT_WORK_EMAIL`; the root's id is read
   back from `users` by that normalized address.
2. `npm run db:bootstrap:access-control` **at the pre-amendment canonical set**
   — the three-key state. Where the amended code is already present, the
   equivalent starting state is produced by deleting the three added
   `Permissions` rows and their grants after a normal bootstrap, which is the
   same database state and exercises the same restore path.
3. Every id and field named above captured from the database after step 2.

## Test — the upgrade rerun restores three rows and preserves everything else

- **entrypoint:** `npm run db:bootstrap:access-control` (the amended bootstrap,
  against the state established in the preconditions)
- **preconditionState:**
  ```sql
  SELECT key, id, description FROM "Permissions" ORDER BY key;
  -- 3 rows: 'user-management:create', 'user-management:deactivate',
  --         'user-management:list'; ids captured as :createId, :deactivateId, :listId
  SELECT count(*) FROM "PolicyPermissions";                    -- 3
  SELECT id FROM "Policies" WHERE type = 'FR';                 -- captured as :policyId
  SELECT count(*) FROM "UserPolicies";                         -- 1
  SELECT "normalizedRootEmail", "rootUserId", "policyId" FROM "AccessControlBootstrap";
  -- captured
  ```
- **expectedDatabaseState:** the run exits `0`, and afterwards
  ```sql
  SELECT key FROM "Permissions" ORDER BY key;
  -- 'employee:departure:record'
  -- 'org:relationships:write'
  -- 'profile:timeline:write'
  -- 'user-management:create'
  -- 'user-management:deactivate'
  -- 'user-management:list'
  SELECT count(*) FROM "Permissions";                          -- 6
  SELECT count(*) FROM "PolicyPermissions";                    -- 6
  SELECT count(*) FROM "PolicyPermissions"
   WHERE "policyId" = :policyId AND "policyType" = 'FR';       -- 6
  SELECT id FROM "Policies" WHERE type = 'FR';                 -- still :policyId
  SELECT count(*) FROM "Policies";                             -- 1
  SELECT count(*) FROM "UserPolicies";                         -- 1
  ```
  and every captured value — `:createId`, `:deactivateId`, `:listId`, their
  three descriptions, `:policyId`, the FR row's `operator`/`managedBy`/null
  target pair, the root attachment, and the singleton's three columns — is
  identical to its pre-run value. The three new `Permissions` ids are **not**
  equal to any captured id.
