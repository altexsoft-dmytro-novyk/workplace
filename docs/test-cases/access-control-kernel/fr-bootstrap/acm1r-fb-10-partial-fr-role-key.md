# ACM1R-FB-10 · The FR role key is partial: a second FR `hr-admin` is rejected, an AR `hr-admin` is accepted

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — invariant 3, recorded **Partial**: `ACM1-FB-02` asserts `count = 1` after bootstrap and names the index in prose, but attempts neither observable outcome.
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 3: "a second FR `hr-admin` row is rejected; an AR row with the same `targetRole` is accepted".
- [database-schema.md § Policies (AD-7)](../../../architecture/database-schema.md) — `UNIQUE: targetRole WHERE type='FR'`.
- FR-AMD-1 [Cross-type `hr-admin` collision](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "FR role-key uniqueness is the **partial** index `UNIQUE targetRole WHERE type='FR'`, so an **AR** policy row carrying `targetRole='hr-admin'` is legal and is a different object."

## Scenario

**Given** a migrated database on which the bootstrap has already run, so
exactly one `type='FR'` row with `targetRole='hr-admin'` exists.

**When** two direct inserts are attempted against `Policies`, independent of
the bootstrap entrypoint:

1. a second `type='FR'` row with `targetRole='hr-admin'`, otherwise
   canonically shaped (`operator='=='`, `managedBy='admin'`, null
   `targetType`/`targetId`);
2. a `type='AR'` row also carrying `targetRole='hr-admin'`, with a non-null
   `targetType`/`targetId` pair so it satisfies the AR branch of the
   row-shape `CHECK`.

**Then** insert 1 is rejected by the partial unique index, and insert 2
**succeeds**. The partial predicate is the whole point: uniqueness is scoped to
`WHERE type='FR'`, so the AR row is a legal, distinct object rather than a
duplicate. A test that asserts both inserts fail would prove a **non-partial**
index and must fail this contract.

**Preconditions:** migrated database; the canonical FR `hr-admin` row exists;
`Policies` row count captured before each attempt.

## Test — one rejection and one acceptance, from the same `targetRole`

- **entrypoint:** none — two direct SQL inserts against the migrated schema
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Policies" WHERE type = 'FR' AND "targetRole" = 'hr-admin'; -- 1
  SELECT count(*) FROM "Policies" WHERE type = 'AR' AND "targetRole" = 'hr-admin'; -- 0
  ```
- **expectedDatabaseState:**
  - insert 1 raises a unique-violation on the partial FR index;
    `SELECT count(*) FROM "Policies" WHERE type='FR' AND "targetRole"='hr-admin'`
    is still `1`
  - insert 2 commits;
    `SELECT count(*) FROM "Policies" WHERE type='AR' AND "targetRole"='hr-admin'`
    is `1`
