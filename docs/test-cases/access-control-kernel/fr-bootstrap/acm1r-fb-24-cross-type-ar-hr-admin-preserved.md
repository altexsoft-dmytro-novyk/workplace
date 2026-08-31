# ACM1R-FB-24 · An AR policy carrying `targetRole='hr-admin'` is invisible to the bootstrap

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "Cross-type collision — an AR policy carrying `targetRole='hr-admin'` is never adopted, mutated, counted, or reported as drift", named in `ACM-1-scenarios.invoke_dev_with` under "COVER CROSS-TYPE COLLISION".
- FR-AMD-1 [Cross-type `hr-admin` collision](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "ACM-1's lookup and ACM-2's evaluation always filter `type='FR'` ... The AR row is never adopted, mutated, counted toward cardinality, or reported as drift, and it is preserved."
- SPEC Constraints — "an AR policy carrying `targetRole='hr-admin'` is legal and is a different object ... that row is never adopted, mutated, counted, or reported as drift, is preserved, can hold no grant, and a `UserPolicies` row attaching to it is never bootstrap state."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — same rule.

## Scenario

**Given** a migrated database with the CAP-8 root User active, **no**
`AccessControlBootstrap` row, and one pre-existing **AR** policy carrying
`targetRole='hr-admin'` with a non-null `targetType`/`targetId` pair — legal
under the partial FR unique index — to which an administrator has already
attached an unrelated active User, **Piotr**, via `UserPolicies`. No FR
`hr-admin` policy exists.

**When** `npm run db:bootstrap:access-control` runs.

**Then** the bootstrap behaves exactly as it would on a database where that AR
row did not exist. It **creates** its own FR `hr-admin` policy — it does not
adopt the AR row, because its natural-key lookup filters `type='FR'` — grants
the three permissions to the FR row, attaches the root to the FR row, and writes
the singleton naming the FR row's id. The AR row is byte-identical afterwards:
same id, same `operator`, same `managedBy`, same target pair. Piotr's
attachment to the AR policy survives untouched and is not counted as a root
attachment, not reported as drift, and not recorded in the singleton.

Four distinct failure modes are ruled out by one fixture, which is why they are
tested together: **adoption** (treating the AR row as the role, so the seed
never creates the FR row at all), **mutation** (rewriting its `type` to `FR` to
"fix" it), **miscounting** (reading two `hr-admin` rows as a duplicate-role
violation and failing), and **false drift** (reporting Piotr's attachment as a
conflicting root attachment). All four come from matching on `targetRole` alone
rather than on the `(targetRole, type)` pair the partial index actually scopes.

**Preconditions:** migrated database; CAP-8 root User active;
`AccessControlBootstrap` empty; no FR `hr-admin` policy; exactly one AR
`hr-admin` policy with its id, fields, and Piotr's attachment captured before
the run.

## Test — the AR row is neither adopted nor disturbed

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Policies" WHERE type='FR';                       -- 0
  SELECT id FROM "Policies" WHERE type='AR' AND "targetRole"='hr-admin'; -- :arPolicyId
  SELECT "userId" FROM "UserPolicies" WHERE "policyId" = :arPolicyId;    -- [:piotrId]
  SELECT count(*) FROM "AccessControlBootstrap";                         -- 0
  ```
- **expectedDatabaseState:** the run exits zero, and afterwards
  ```sql
  SELECT count(*) FROM "Policies" WHERE type='FR' AND "targetRole"='hr-admin'; -- 1, newly created
  SELECT id, type, operator, "managedBy", "targetType", "targetId"
  FROM "Policies" WHERE id = :arPolicyId;   -- every column unchanged, type still 'AR'
  SELECT "policyId" FROM "AccessControlBootstrap"; -- the FR policy's id, never :arPolicyId
  SELECT count(*) FROM "PolicyPermissions" WHERE "policyId" = :arPolicyId; -- 0
  SELECT "userId" FROM "UserPolicies" WHERE "policyId" = :arPolicyId;      -- still [:piotrId]
  SELECT count(*) FROM "UserPolicies" WHERE "policyId" = (SELECT id FROM "Policies" WHERE type='FR'); -- 1, the root
  ```
