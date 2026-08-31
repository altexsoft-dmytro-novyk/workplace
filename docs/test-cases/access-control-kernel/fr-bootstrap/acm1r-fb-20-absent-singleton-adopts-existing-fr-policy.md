# ACM1R-FB-20 · With no singleton, an existing FR `hr-admin` policy is adopted by natural key — and verified

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "Absent-singleton adoption — FR `hr-admin` policy by natural key after verifying `operator`, `managedBy`, null targets", named in `ACM-1-scenarios.invoke_dev_with` under "COVER THE ABSENT-SINGLETON CASES EXPLICITLY".
- FR-AMD-1 [Provenance when the singleton is absent](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "An FR `hr-admin` policy already exists → **Adopt** it by natural key (`targetRole='hr-admin' AND type='FR'`) and record its id. Verify `operator='=='`, `managedBy='admin'`, and null `targetType`/`targetId`; fail on drift. Never create a second FR policy — the partial unique index forbids it."
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "With the singleton **absent**, ACM-1 adopts an existing FR `hr-admin` policy by natural key."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — same rule, with the deliberate asymmetry: "singleton absent permits adoption; singleton present forbids transfer."

## Scenario A — adoption

**Given** a migrated database with the CAP-8 root User active, **no**
`AccessControlBootstrap` row, and a pre-existing canonically shaped FR policy —
`type='FR'`, `targetRole='hr-admin'`, `operator='=='`, `managedBy='admin'`,
`targetType` and `targetId` both `NULL` — created outside the bootstrap and
carrying its own id.

**When** `npm run db:bootstrap:access-control` runs.

**Then** the bootstrap **adopts** that row: it creates no second FR policy, it
leaves the existing row's id unchanged, and it writes the singleton with
`policyId` equal to that pre-existing id. The three canonical grants are
created against it, and the root attachment points at it.

## Scenario B — refused adoption on field drift

**Given** the same state, except the pre-existing FR `hr-admin` row carries
`managedBy='sync'` instead of `admin`.

**When** `npm run db:bootstrap:access-control` runs.

**Then** the bootstrap **fails before writes** with an actionable diagnostic
naming `managedBy`, and the transaction rolls back: no grant, no attachment, no
singleton, and the pre-existing row is left exactly as it stands. Adoption is
conditional on verification, and `sync` provenance is reserved to the
timetracker integration — adopting it would let the seed take ownership of a row
another system writes.

Scenario B is what makes A safe. Adoption by natural key alone would mean the
bootstrap inherits whatever an existing `hr-admin` row happens to say, including
an `operator` the MVP does not support or a target pair that the row-shape
`CHECK` would not even permit. The verification is the difference between
adopting a row and trusting one.

**Preconditions:** migrated database; CAP-8 root User active;
`AccessControlBootstrap` empty; exactly one pre-existing FR `hr-admin` policy
whose id is captured before the run; `UserPolicies`, `PolicyPermissions` empty.

## Test — adopt the canonical row, refuse the drifted one

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "AccessControlBootstrap";                       -- 0
  SELECT id FROM "Policies" WHERE type='FR' AND "targetRole"='hr-admin'; -- captured as :existingPolicyId
  SELECT count(*) FROM "PolicyPermissions";                            -- 0
  ```
- **expectedDatabaseState:**
  - **A:** run exits zero;
    ```sql
    SELECT count(*) FROM "Policies" WHERE type='FR';        -- still 1
    SELECT id FROM "Policies" WHERE type='FR';              -- still :existingPolicyId
    SELECT "policyId" FROM "AccessControlBootstrap";        -- :existingPolicyId
    SELECT count(*) FROM "PolicyPermissions" WHERE "policyId" = :existingPolicyId; -- 3
    SELECT "policyId" FROM "UserPolicies";                  -- :existingPolicyId
    ```
  - **B:** run exits nonzero with a diagnostic naming `managedBy`;
    ```sql
    SELECT "managedBy" FROM "Policies" WHERE type='FR';  -- still 'sync', unmutated
    SELECT count(*) FROM "PolicyPermissions";            -- 0
    SELECT count(*) FROM "UserPolicies";                 -- 0
    SELECT count(*) FROM "AccessControlBootstrap";       -- 0
    ```
