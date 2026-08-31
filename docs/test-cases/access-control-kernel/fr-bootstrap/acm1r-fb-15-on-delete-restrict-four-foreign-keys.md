# ACM1R-FB-15 · Deleting a referenced functional-role row is rejected on all four foreign keys

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — invariant 13, recorded **Missing**.
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 13: "`ON DELETE RESTRICT` on all four functional-role-side foreign keys — deleting a granted permission, a granted policy, an attached user, or a singleton-referenced row is rejected".
- [database-schema.md § PolicyPermissions](../../../architecture/database-schema.md) — `FOREIGN KEY: (policyId, policyType) -> Policies(id, type) ON DELETE RESTRICT`; "ON DELETE: RESTRICT for the Permissions foreign key in the Kernel MVP"; "Restricting deletes avoids silently deciding the later role and permission deletion contract."
- [database-schema.md § AccessControlBootstrap](../../../architecture/database-schema.md) — `rootUserId FK -> User UNIQUE ON DELETE RESTRICT`, `policyId FK -> Policies UNIQUE ON DELETE RESTRICT`.
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "`ON DELETE RESTRICT` delete behavior".

## Scenario

**Given** a migrated database on which the bootstrap has already run, so all
four referencing rows exist: three grants, one root attachment, and the
singleton.

**When** four deletes are attempted, independent of the bootstrap entrypoint:

1. `DELETE` a granted `Permissions` row;
2. `DELETE` the granted FR `Policies` row;
3. `DELETE` the attached root `User` row;
4. `DELETE` the `Policies` row referenced by the singleton's `policyId`
   (distinguished from 2 only when the grants have been removed first; assert
   it against the singleton reference specifically).

**Then** every delete is rejected by a restrict violation and every row
survives. No cascade fires, and nothing is silently orphaned. This is the
database-side counterpart of a constraint the SPEC relies on in prose: "Restrictive
foreign keys make physically orphaned FR grant rows unreachable in supported
operation." That claim is load-bearing for CAP-4 — ACM-2's acceptance covers
wrong-type and nonmatching joins but explicitly *not* corruption states — so it
must be proven, not assumed.

**Preconditions:** migrated database; the bootstrap has run; the three grants,
the root attachment, and the singleton all exist; row counts for
`Permissions`, `Policies`, `User`, and `AccessControlBootstrap` captured
before each attempt.

## Test — four restricted deletes, four rejections

- **entrypoint:** none — four direct SQL deletes against the migrated schema
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Permissions";              -- 3
  SELECT count(*) FROM "Policies" WHERE type='FR'; -- 1
  SELECT count(*) FROM "UserPolicies";             -- 1
  SELECT count(*) FROM "AccessControlBootstrap";   -- 1
  ```
- **expectedDatabaseState:** each delete raises a foreign-key restrict
  violation, and after all four attempts every count above is unchanged and the
  root `User` row is still present and still `isActive`
