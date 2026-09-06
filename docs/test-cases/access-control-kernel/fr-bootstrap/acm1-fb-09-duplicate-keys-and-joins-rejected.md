# ACM1-FB-09 · Duplicate permission keys and duplicate joins are rejected by database constraints

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
> **This file's numbers change:** the post-bootstrap baseline `Permissions` `3` → **`6`** and
> `PolicyPermissions` `3` → **`6`**, before and after the three rejected
> inserts. `UserPolicies` stays `1`. The uniqueness contract is unchanged.

**Trace:**

- FR-AMD-1 [OQ-7 — Canonical Feature Identifier](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "Permission keys are append-only identities. No writer may update a key in place or bypass the Access Control-owned catalog mutation boundary."
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 5 "`Permissions.key` unique and immutable" → "duplicate key rejected"; row 6 "`PolicyPermissions` PK `(policyId, permissionId)`" → "duplicate grant rejected"; row 11 "`UserPolicies` integrity — PK `(userId, policyId)` ..." → "duplicate attachment rejected."
- [database-schema.md § Permissions](../../../architecture/database-schema.md) — `key string UNIQUE`.
- [database-schema.md § UserPolicies](../../../architecture/database-schema.md) — `PRIMARY KEY: (userId, policyId)`.

## Scenario

**Given** the bootstrap seed has already run once, so `Permissions` holds
the six canonical keys, `PolicyPermissions` holds the six canonical
`(policyId, permissionId)` pairs, and `UserPolicies` holds the one root
attachment.

**When** three different direct inserts are attempted against the migrated
schema, independent of the bootstrap entrypoint:

1. a new `Permissions` row reusing an already-seeded `key` (e.g. a second
   `user-management:create`);
2. a new `PolicyPermissions` row reusing an already-granted `(policyId,
   permissionId)` pair;
3. a new `UserPolicies` row reusing the already-attached `(userId,
   policyId)` pair (the root User to the `hr-admin` policy, again).

**Then** every one of the three inserts is rejected by the database's
uniqueness constraint — `Permissions.key UNIQUE` for 1, the
`PolicyPermissions` composite primary key `(policyId, permissionId)` for 2,
the `UserPolicies` composite primary key `(userId, policyId)` for 3 — and
none of the three tables gains a row from any attempt.

**Preconditions:** the ACM1-FB-01 through ACM1-FB-04 outcomes already hold
(post-bootstrap state); the row count of each affected table is captured
before each insert.

## Test — three duplicate-shaped inserts, three rejections

- **entrypoint:** none — three direct SQL inserts against the migrated
  schema, outside the bootstrap script
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Permissions";        -- 6
  SELECT count(*) FROM "PolicyPermissions";  -- 6
  SELECT count(*) FROM "UserPolicies";       -- 1
  ```
- **expectedDatabaseState:** each insert raises a unique-constraint
  violation; after all three attempts:
  ```sql
  SELECT count(*) FROM "Permissions";        -- 6 (unchanged)
  SELECT count(*) FROM "PolicyPermissions";  -- 6 (unchanged)
  SELECT count(*) FROM "UserPolicies";       -- 1 (unchanged)
  ```
