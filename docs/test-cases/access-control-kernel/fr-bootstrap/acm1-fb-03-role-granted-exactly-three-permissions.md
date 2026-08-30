# ACM1-FB-03 · The seeded hr-admin role is connected to exactly three permissions

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "ACM-1 ensures the three permissions, one FR policy, three grants, and one attachment."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "3. Exactly three `PolicyPermissions` grants from that role to those rows."
- FR-AMD-1 [OQ-3 — Role-to-Permission Storage](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "`PRIMARY KEY (policyId, permissionId)` is the uniqueness rule and prevents duplicate grants ... `policyType` is stored `NOT NULL DEFAULT 'FR'` and constrained by `CHECK (policyType = 'FR')`."
- [database-schema.md § PolicyPermissions](../../../architecture/database-schema.md) — `PRIMARY KEY: (policyId, permissionId)`.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md) — "`PolicyPermissions(policyId, permissionId, policyType)` stores the role's permission set and rejects duplicate pairs."

## Scenario

**Given** the ACM1-FB-01 and ACM1-FB-02 outcomes: the three canonical
`Permissions` rows and the one `hr-admin` FR `Policies` row exist.

**When** `npm run db:bootstrap:access-control` runs to completion — the same
run that produces ACM1-FB-01 and ACM1-FB-02.

**Then** `PolicyPermissions` holds exactly three rows whose `policyId` is the
`hr-admin` policy's id, each with `policyType='FR'`, and whose three
`permissionId` values are exactly the three seeded `Permissions` ids — one
grant per canonical key, none missing, none extra, none duplicated.

**Preconditions:** freshly migrated database; CAP-8 root User exists and is
active; `PolicyPermissions` empty before the run.

## Test — bootstrap grants the three permissions to the role

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:** `SELECT count(*) FROM "PolicyPermissions"` → `0`
- **expectedDatabaseState:**
  ```sql
  SELECT "permissionId", "policyType"
  FROM "PolicyPermissions"
  WHERE "policyId" = :hrAdminPolicyId;
  -- exactly the 3 ids present in Permissions, one row each, policyType = 'FR' on every row
  SELECT count(*) FROM "PolicyPermissions"; -- 3
  ```
