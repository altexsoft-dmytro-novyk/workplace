# ACM1R-FB-11 · The grant table's type separation is a database boundary, not application validation

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — invariants 4, 7, and 8, all recorded **Missing**. Invariant 8 is bolded in the checklist and was named in `ACM-1-scenarios.invoke_dev_with` as "database rejection of AR-policy grants".
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 4 "Unique support key `Policies(id, type)` — present, and referenced by the composite foreign key below"; row 7 "`policyType` non-null, default `FR`, `CHECK (policyType = 'FR')` — any other value rejected"; row 8 "Restrictive composite FK `(policyId, policyType) → Policies(id, type)` — **AR-policy grant rejected at the database boundary**".
- [database-schema.md § PolicyPermissions](../../../architecture/database-schema.md) — "The stored discriminator plus composite foreign key makes an AR-policy grant impossible at the database boundary; application validation is not the integrity mechanism."
- FR-AMD-1 [OQ-3 — Role-to-Permission Storage](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "`policyType` is stored `NOT NULL DEFAULT 'FR'` and constrained by `CHECK (policyType = 'FR')`."

## Scenario

**Given** a migrated database on which the bootstrap has already run, so the FR
`hr-admin` policy, the three canonical permissions, and — from ACM1R-FB-10 — a
legal AR policy also carrying `targetRole='hr-admin'` all exist.

**When** the migrated schema is probed four ways, independent of the bootstrap
entrypoint:

1. `pg_constraint`/`pg_indexes` are queried for the unique support key on
   `Policies(id, type)` and for the composite foreign key
   `(policyId, policyType) → Policies(id, type)`;
2. a `PolicyPermissions` row is inserted with `policyType` omitted;
3. a `PolicyPermissions` row is inserted with `policyType='AR'`;
4. a `PolicyPermissions` row is inserted whose `policyId` is the **AR**
   policy's id, with `policyType='FR'` — the only discriminator value the
   `CHECK` permits.

**Then** probe 1 finds both objects present, and the foreign key's referenced
key is the `Policies(id, type)` unique support key rather than the primary key
alone. Insert 2 succeeds and stores `policyType='FR'` from the column default.
Insert 3 is rejected by `CHECK (policyType = 'FR')`. Insert 4 is rejected by
the composite foreign key: the pair `(<AR policy id>, 'FR')` does not exist in
`Policies(id, type)`, because that row's `type` is `'AR'`.

Attempt 4 is the load-bearing one. It is the only path by which an AR policy
could acquire a functional permission, and it must be closed **by PostgreSQL** —
a rejection produced by application code in the bootstrap script does not
satisfy this contract, because the grant table is reachable without that script.

**Preconditions:** migrated database; the canonical FR policy, the three
permissions, and one AR `hr-admin` policy exist; `PolicyPermissions` row count
captured before each attempt.

## Test — the support key, the discriminator default, and the AR-grant rejection

- **entrypoint:** none — catalog queries and three direct SQL inserts against
  the migrated schema
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "PolicyPermissions"; -- 3 (the canonical grants)
  SELECT id FROM "Policies" WHERE type = 'AR' AND "targetRole" = 'hr-admin'; -- one id
  ```
- **expectedDatabaseState:**
  ```sql
  -- 1: the support key exists and is what the composite FK references
  SELECT conname, contype FROM pg_constraint
  WHERE conrelid = '"Policies"'::regclass AND contype = 'u';
  -- a unique constraint over (id, type) is present
  SELECT confrelid::regclass, confkey FROM pg_constraint
  WHERE conrelid = '"PolicyPermissions"'::regclass AND contype = 'f'
    AND array_length(conkey, 1) = 2;
  -- references "Policies" on the (id, type) unique key
  ```
  - 2: row commits; `SELECT "policyType"` on it returns `'FR'`
  - 3: rejected by the `policyType` `CHECK`
  - 4: rejected by the composite foreign key
  - after all attempts, `SELECT count(*) FROM "PolicyPermissions"` equals the
    precondition count plus exactly one (the successful default-value insert
    from attempt 2), and no row references the AR policy
