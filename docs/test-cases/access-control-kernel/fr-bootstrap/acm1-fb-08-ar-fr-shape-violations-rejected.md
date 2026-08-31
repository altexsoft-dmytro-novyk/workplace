# ACM1-FB-08 · Invalid AR-shaped and FR-shaped rows are rejected by the database CHECK constraint

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "the reviewed custom migration makes `Policies.type` non-null, restricts it to FR/AR, and enforces AD-4 row shapes."
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 1 "`Policies.type` non-null, restricted to `FR|AR`" → "insert with null or a third value is rejected"; row 2 "FR/AR row-shape `CHECK`" → "FR row with a target, or AR row without one, is rejected."
- FR-AMD-1 [OQ-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "PostgreSQL enforces the type-specific shape" via the `CHECK` below.

## Scenario

**Given** a migrated database with the `Policies` row-shape `CHECK` in
force:
```sql
CHECK (
  (type = 'FR' AND "targetRole" IS NOT NULL
               AND "targetType" IS NULL AND "targetId" IS NULL)
  OR
  (type = 'AR' AND "targetType" IS NOT NULL AND "targetId" IS NOT NULL)
)
```

**When** four different direct inserts are attempted against `Policies`,
independent of the bootstrap entrypoint:

1. `type='FR'` with a non-null `targetType`/`targetId` pair (an FR row
   carrying an AR-shaped target);
2. `type='AR'` with `targetType` and `targetId` both `NULL` (an AR row
   missing its target);
3. `type` is `NULL`;
4. `type='SOMETHING_ELSE'` (a third value outside `FR|AR`).

**Then** every one of the four inserts is rejected by the database — a
constraint violation, never a silently-accepted row and never an
application-level filter standing in for it. `Policies` gains no row from
any of the four attempts.

**Preconditions:** migrated database with the `Policies` table and its
`CHECK`/`NOT NULL` constraints in place; the table's row count is captured
before each insert.

## Test — four shape-invalid inserts, four rejections

- **entrypoint:** none — four direct SQL inserts against the migrated schema,
  outside the bootstrap script
- **preconditionState:** `SELECT count(*) FROM "Policies"` captured before
  each attempt
- **expectedDatabaseState:** each of the four inserts raises a
  constraint-violation error (`CHECK` for 1 and 2, `NOT NULL` for 3,
  `CHECK`/type-domain rejection for 4) and `SELECT count(*) FROM "Policies"`
  is unchanged after each attempt
