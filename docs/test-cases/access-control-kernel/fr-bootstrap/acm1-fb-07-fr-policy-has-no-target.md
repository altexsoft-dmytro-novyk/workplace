# ACM1-FB-07 · The seeded FR policy row carries no targetType or targetId

**Trace:**

- FR-AMD-1 [OQ-4 — Functional-Role Row Shape](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "`targetType` and `targetId` are nullable. PostgreSQL enforces the type-specific shape ... FR rows therefore use no sentinel target."
- [database-schema.md § Policies (AD-7)](../../../architecture/database-schema.md) —
  ```
  CHECK: (type='FR' AND targetRole IS NOT NULL
                    AND targetType IS NULL AND targetId IS NULL)
      OR (type='AR' AND targetType IS NOT NULL AND targetId IS NOT NULL)
  ```
- Architecture spine [local AD-4 — Minimal functional-role kernel](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — "FR rows require a non-null `targetRole` role key and carry `targetType=NULL` and `targetId=NULL`."

## Scenario

**Given** the ACM1-FB-02 outcome: the one seeded `hr-admin` FR `Policies` row
exists.

**When** that row is read directly from the migrated database.

**Then** its `targetType` and `targetId` columns are both `NULL`. Only
`targetRole` (`'hr-admin'`) identifies it; FR rows carry no target sentinel
of any kind, and the row satisfies the `type='FR' AND targetType IS NULL AND
targetId IS NULL` branch of the row-shape `CHECK`, never the AR branch.

**Preconditions:** the ACM1-FB-02 outcome holds — the seeded FR `hr-admin`
row exists in `Policies`.

## Test — the FR row's target columns are absent

- **entrypoint:** none — direct read against migrated PostgreSQL after
  bootstrap
- **preconditionState:** the `hr-admin` FR row exists (ACM1-FB-02)
- **expectedDatabaseState:**
  ```sql
  SELECT "targetType", "targetId" FROM "Policies"
  WHERE type = 'FR' AND "targetRole" = 'hr-admin';
  -- (NULL, NULL)
  ```
