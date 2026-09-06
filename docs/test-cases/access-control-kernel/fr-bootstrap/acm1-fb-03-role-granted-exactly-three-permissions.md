# ACM1-FB-03 · The seeded hr-admin role is connected to exactly six permissions

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
> **This file's numbers change:** `PolicyPermissions` after a fresh bootstrap `3` → **`6`**.

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "ACM-1 ensures the three permissions, one FR policy, three grants, and one attachment."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "3. Exactly three `PolicyPermissions` grants from that role to those rows."
- FR-AMD-1 [OQ-3 — Role-to-Permission Storage](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "`PRIMARY KEY (policyId, permissionId)` is the uniqueness rule and prevents duplicate grants ... `policyType` is stored `NOT NULL DEFAULT 'FR'` and constrained by `CHECK (policyType = 'FR')`."
- [database-schema.md § PolicyPermissions](../../../architecture/database-schema.md) — `PRIMARY KEY: (policyId, permissionId)`.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md) — "`PolicyPermissions(policyId, permissionId, policyType)` stores the role's permission set and rejects duplicate pairs."

## Scenario

**Given** the ACM1-FB-01 and ACM1-FB-02 outcomes: the six canonical
`Permissions` rows and the one `hr-admin` FR `Policies` row exist.

**When** `npm run db:bootstrap:access-control` runs to completion — the same
run that produces ACM1-FB-01 and ACM1-FB-02.

**Then** `PolicyPermissions` holds exactly six rows whose `policyId` is the
`hr-admin` policy's id, each with `policyType='FR'`, and whose six
`permissionId` values are exactly the six seeded `Permissions` ids — one
grant per canonical key, none missing, none extra, none duplicated.

One grant per key is what makes the operator half real: the permission row
alone allows nobody, so a set that seeded six `Permissions` and five grants
would leave a live route gate closed with no visible defect in the catalog.

**Preconditions:** freshly migrated database; CAP-8 root User exists and is
active; `PolicyPermissions` empty before the run.

## Test — bootstrap grants the six permissions to the role

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:** `SELECT count(*) FROM "PolicyPermissions"` → `0`
- **expectedDatabaseState:**
  ```sql
  SELECT "permissionId", "policyType"
  FROM "PolicyPermissions"
  WHERE "policyId" = :hrAdminPolicyId;
  -- exactly the 6 ids present in Permissions, one row each, policyType = 'FR' on every row
  SELECT count(*) FROM "PolicyPermissions"; -- 6
  ```
