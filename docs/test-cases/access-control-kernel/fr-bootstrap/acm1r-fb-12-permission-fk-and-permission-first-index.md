# ACM1R-FB-12 · A grant to an unknown permission is rejected, and the permission-first index exists

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — invariants 9 and 10, both recorded **Missing**. The audit notes invariant 10's observation method was supplied by the checklist "so the story cannot stall on how to observe an index" and still went unused.
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 9 "Restrictive FK `permissionId → Permissions.id` — grant referencing an unknown permission rejected"; row 10 "Permission-first index `(permissionId, policyId)` — asserted by querying `pg_indexes` against the migrated database".
- [database-schema.md § PolicyPermissions](../../../architecture/database-schema.md) — `INDEX: (permissionId, policyId)`; "ON DELETE: RESTRICT for the Permissions foreign key in the Kernel MVP".
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "the permission-first index asserted via `pg_indexes`".

## Scenario

**Given** a migrated database on which the bootstrap has already run.

**When** the schema is probed two ways, independent of the bootstrap
entrypoint:

1. a `PolicyPermissions` row is inserted whose `policyId` is the canonical FR
   policy and whose `permissionId` is a freshly generated uuidv7 present in no
   `Permissions` row;
2. `pg_indexes` is queried for an index on `PolicyPermissions` whose column
   order is `(permissionId, policyId)`.

**Then** insert 1 is rejected by the restrictive foreign key to
`Permissions.id`, and `PolicyPermissions` gains no row. Probe 2 finds the
index, and its **column order is part of the assertion**: an index on
`(policyId, permissionId)` — which the composite primary key already provides —
does not satisfy this invariant. The permission-first order is what makes
ACM-2's evaluation, which enters from a permission key, an index seek rather
than a scan.

**Preconditions:** migrated database; the canonical FR policy and three
permissions exist; `PolicyPermissions` row count captured before the insert.

## Test — one rejection and one index assertion

- **entrypoint:** none — one direct SQL insert and one `pg_indexes` query
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "PolicyPermissions"; -- 3
  SELECT count(*) FROM "Permissions" WHERE id = :unknownPermissionId; -- 0
  ```
- **expectedDatabaseState:**
  - 1: raises a foreign-key violation naming the `permissionId` reference;
    `SELECT count(*) FROM "PolicyPermissions"` is unchanged at `3`
  - 2:
    ```sql
    SELECT indexdef FROM pg_indexes
    WHERE tablename = 'PolicyPermissions';
    -- one indexdef lists ("permissionId", "policyId") in that order
    ```
