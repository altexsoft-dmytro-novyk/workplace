# ACM1-FB-04 · Exactly one existing root User receives the bootstrap attachment

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Exactly one bootstrap attachment is selected through `ROOT_WORK_EMAIL` normalized according to DEC-UM-007 ... CAP-8 has already ensured the normalized active root User."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "4. Exactly one `UserPolicies` attachment to the active user matching the normalized `ROOT_WORK_EMAIL`."
- FR-AMD-1 Seed Contract — "One Access Control-owned `AccessControlBootstrap` singleton keyed `root-hr-admin` persists `normalizedRootEmail`, `rootUserId`, and `policyId` with unique identity and restrictive references."
- [database-schema.md § AccessControlBootstrap](../../../architecture/database-schema.md) — `rootUserId FK -> User UNIQUE ON DELETE RESTRICT`, `policyId FK -> Policies UNIQUE ON DELETE RESTRICT`.
- Architecture spine [local AD-4 — Bootstrap rule](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — "One Access Control-owned `AccessControlBootstrap` singleton keyed `root-hr-admin` durably records `normalizedRootEmail`, `rootUserId`, and `policyId`."

## Scenario

**Given** the CAP-8 root User step has already created and validated exactly
one active User whose normalized `workEmail` equals normalized
`ROOT_WORK_EMAIL`, and no other User in the database shares that normalized
email.

**When** `npm run db:bootstrap:access-control` runs to completion.

**Then** `UserPolicies` holds exactly one row attaching that one root
`User.id` to the seeded `hr-admin` policy's id, and `AccessControlBootstrap`
holds exactly one singleton row (`key='root-hr-admin'`) whose `rootUserId`
equals that same `User.id` and whose `policyId` equals the `hr-admin`
policy's id. No other User is attached to the `hr-admin` policy.

**Preconditions:** freshly migrated database; the CAP-8 root User exists, is
active, and is the only User matching normalized `ROOT_WORK_EMAIL`;
`UserPolicies` and `AccessControlBootstrap` empty before the run.

## Test — bootstrap attaches the root User and records provenance

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "User"
  WHERE normalized("workEmail") = normalized(:ROOT_WORK_EMAIL) AND "isActive"; -- 1
  SELECT count(*) FROM "UserPolicies"; -- 0
  SELECT count(*) FROM "AccessControlBootstrap"; -- 0
  ```
- **expectedDatabaseState:**
  ```sql
  SELECT "userId", "policyId" FROM "UserPolicies";
  -- exactly one row: userId = <root user id>, policyId = <hr-admin policy id>
  SELECT "rootUserId", "policyId" FROM "AccessControlBootstrap" WHERE key = 'root-hr-admin';
  -- rootUserId = <root user id>, policyId = <hr-admin policy id> (same two ids as above)
  ```
