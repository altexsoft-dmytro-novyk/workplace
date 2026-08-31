# ACM1R-FB-13 · An attachment to an unknown user or an unknown policy is rejected

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — invariant 11, recorded **Partial**: `ACM1-FB-09` case 3 covers the duplicate attachment; the bad-user and bad-policy halves are uncovered.
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 11: "attachment to an unknown user or policy rejected; duplicate attachment rejected".
- [database-schema.md § UserPolicies](../../../architecture/database-schema.md) — `userId FK -> User`, `policyId FK -> Policies`, `PRIMARY KEY: (userId, policyId)`.

## Scenario

**Given** a migrated database on which the bootstrap has already run, so
`UserPolicies` holds exactly the one root attachment.

**When** two direct inserts are attempted against `UserPolicies`, independent
of the bootstrap entrypoint:

1. a row whose `userId` is a freshly generated uuidv7 matching no `User` row,
   with the canonical FR policy's id;
2. a row whose `policyId` is a freshly generated uuidv7 matching no `Policies`
   row, with the root User's id.

**Then** both are rejected by their respective foreign key, and `UserPolicies`
still holds exactly the one root attachment. This is the referential half of
invariant 11; `ACM1-FB-09` case 3 already covers the primary-key half and is
not restated here.

**Preconditions:** migrated database; the bootstrap has run; the root User and
canonical FR policy exist; `UserPolicies` row count captured before each
attempt.

## Test — two referential rejections

- **entrypoint:** none — two direct SQL inserts against the migrated schema
- **preconditionState:** `SELECT count(*) FROM "UserPolicies"` → `1`
- **expectedDatabaseState:** each insert raises a foreign-key violation — the
  `userId` reference for 1, the `policyId` reference for 2 — and after both
  attempts `SELECT count(*) FROM "UserPolicies"` is still `1`, holding the
  original root row unchanged
