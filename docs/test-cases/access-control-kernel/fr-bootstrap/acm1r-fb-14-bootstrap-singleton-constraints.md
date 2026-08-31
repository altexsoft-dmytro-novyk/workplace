# ACM1R-FB-14 · The `AccessControlBootstrap` row is a constrained singleton, not a convention

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — invariant 12, recorded **Missing**: `ACM1-FB-04` asserts the singleton's contents after a successful bootstrap but attempts no constraint violation.
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 12: "a second singleton, a wrong key, or a duplicate reference is rejected".
- [database-schema.md § AccessControlBootstrap](../../../architecture/database-schema.md) — `key string PK`, `CHECK: key = 'root-hr-admin'`, `normalizedRootEmail string UNIQUE`, `rootUserId FK -> User UNIQUE ON DELETE RESTRICT`, `policyId FK -> Policies UNIQUE ON DELETE RESTRICT`.
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "One Access Control-owned `AccessControlBootstrap` singleton keyed `root-hr-admin` persists `normalizedRootEmail`, `rootUserId`, and `policyId` with unique identity and restrictive references."

## Scenario

**Given** a migrated database on which the bootstrap has already run, so
exactly one `AccessControlBootstrap` row exists with `key='root-hr-admin'`, and
a second active User exists who is not the root.

**When** four direct inserts are attempted against `AccessControlBootstrap`,
independent of the bootstrap entrypoint:

1. a second row with `key='root-hr-admin'`;
2. a row with `key='another-bootstrap'`, otherwise valid;
3. a row reusing the recorded `rootUserId`, under a different `key`;
4. a row reusing the recorded `policyId`, under a different `key`.

**Then** insert 1 is rejected by the primary key, insert 2 by
`CHECK (key = 'root-hr-admin')`, and inserts 3 and 4 by the unique constraints
on `rootUserId` and `policyId` respectively. `AccessControlBootstrap` still
holds exactly one row.

Attempt 2 matters independently of attempt 1: without the `CHECK`, the primary
key alone would permit an unbounded family of bootstrap rows under other keys,
and "singleton" would be a naming convention rather than an invariant. The
constraint is what lets ACM-1 treat the row's absence as "no provenance
recorded" instead of "no provenance found under the key I happened to query".

**Preconditions:** migrated database; the bootstrap has run; one non-root
active User exists to supply a distinct `rootUserId` candidate;
`AccessControlBootstrap` row count captured before each attempt.

## Test — four singleton violations, four rejections

- **entrypoint:** none — four direct SQL inserts against the migrated schema
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "AccessControlBootstrap"; -- 1
  SELECT key FROM "AccessControlBootstrap";      -- 'root-hr-admin'
  ```
- **expectedDatabaseState:** each of the four inserts raises a constraint
  violation — primary key for 1, `CHECK` for 2, unique `rootUserId` for 3,
  unique `policyId` for 4 — and after all four attempts
  `SELECT count(*) FROM "AccessControlBootstrap"` is still `1` with its three
  recorded columns unchanged
