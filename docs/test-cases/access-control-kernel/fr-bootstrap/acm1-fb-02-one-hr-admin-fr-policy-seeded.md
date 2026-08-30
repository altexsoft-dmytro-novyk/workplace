# ACM1-FB-02 · A fresh database seeds exactly one hr-admin FR policy

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "the reviewed custom migration makes `Policies.type` non-null, restricts it to FR/AR, and enforces AD-4 row shapes ... ACM-1 ensures the three permissions, one FR policy, three grants, and one attachment."
- FR-AMD-1 [OQ-4 — Functional-Role Row Shape](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "the Kernel MVP seeds exactly one `targetRole='hr-admin'`. A partial unique index on `targetRole WHERE type='FR'` prevents duplicate FR role keys."
- FR-AMD-1 Fixed Kernel Inputs — "The kernel seeds exactly one role, `hr-admin`, granting exactly those three permissions."
- [database-schema.md § Policies (AD-7)](../../../architecture/database-schema.md) — row shape and `UNIQUE: targetRole WHERE type='FR'`.
- Architecture spine [local AD-4 — Minimal functional-role kernel](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — "FR rows require a non-null `targetRole` role key and carry `targetType=NULL` and `targetId=NULL` ... Reviewed custom PostgreSQL migration SQL enforces that type-specific shape and unique FR role keys."

## Scenario

**Given** a freshly migrated Access Control schema with an empty `Policies`
table, and the CAP-8 root User precondition satisfied.

**When** `npm run db:bootstrap:access-control` runs to completion.

**Then** `Policies` holds exactly one row with `type='FR'`. That row's
`targetRole` is `'hr-admin'`, `operator` is `'=='`, and `managedBy` is
`'admin'`. No other `type='FR'` row exists — the partial unique index
`targetRole WHERE type='FR'` allows no second one.

**Preconditions:** freshly migrated database; `Policies` empty (no FR and no
AR rows); CAP-8 root User exists and is active.

## Test — bootstrap seeds the FR role

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:** `SELECT count(*) FROM "Policies" WHERE type='FR'` → `0`
- **expectedDatabaseState:**
  ```sql
  SELECT "targetRole", operator, "managedBy"
  FROM "Policies" WHERE type = 'FR';
  -- ('hr-admin', '==', 'admin')   -- exactly one row
  SELECT count(*) FROM "Policies" WHERE type = 'FR'; -- 1
  ```
