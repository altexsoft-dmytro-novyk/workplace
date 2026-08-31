# ACM1R-FB-17 · The root lookup normalizes `ROOT_WORK_EMAIL` under DEC-UM-007

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "DEC-UM-007 normalization of `ROOT_WORK_EMAIL` at lookup", recorded as required by CAP-3 success and by `ACM-1-scenarios.invoke_dev_with`, with no approved scenario.
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "ACM-1 normalizes `ROOT_WORK_EMAIL`, begins one transaction, acquires the common bootstrap advisory lock".
- SPEC Constraints — "CAP-8 runs before ACM-1 and normalizes `ROOT_WORK_EMAIL` under DEC-UM-007. Identity is canonical **at write**: ACM-0 stores the normalized value."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — "It normalizes `ROOT_WORK_EMAIL` according to DEC-UM-007, **stores the normalized value** so storage is canonical."

## Scenario

**Given** ACM-0 has run and stored the root User's `workEmail` in canonical
normalized form — `root@company.com` — and `ROOT_WORK_EMAIL` is subsequently
presented to the bootstrap in a non-canonical but equivalent form,
`"  Root@Company.COM  "` (leading and trailing whitespace, mixed case).

**When** `npm run db:bootstrap:access-control` runs.

**Then** the bootstrap trims and lowercases the configured value before
matching, locates the same single active root User, and completes normally: one
attachment to that User and a singleton whose `normalizedRootEmail` is the
normalized `root@company.com`, never the raw configured string. It does not
create a second User, does not rewrite the stored `workEmail`, and does not
fail as unmatched.

Two directions are asserted, because only the pair proves normalization rather
than luck: the **configured** value is normalized before comparison, and the
value **persisted** into the singleton is the normalized form. Storing the raw
string would make the later drift comparison in ACM1R-FB-20 whitespace- and
case-sensitive, so a benign reformatting of the environment variable would read
as conflicting bootstrap drift.

**Preconditions:** ACM-0 has run; exactly one active User with normalized
`workEmail = 'root@company.com'`; `ROOT_WORK_EMAIL` set to the non-canonical
equivalent; `AccessControlBootstrap` empty.

## Test — a non-canonical configured value resolves to the canonical root

- **entrypoint:** `npm run db:bootstrap:access-control` with
  `ROOT_WORK_EMAIL="  Root@Company.COM  "`
- **preconditionState:**
  ```sql
  SELECT id, "workEmail" FROM "users" WHERE "workEmail" = 'root@company.com' AND "isActive"; -- one row, captured as :rootId
  SELECT count(*) FROM "users";                  -- unchanged population count, captured
  SELECT count(*) FROM "AccessControlBootstrap"; -- 0
  ```
- **expectedDatabaseState:** the run exits zero, and afterwards
  ```sql
  SELECT "normalizedRootEmail", "rootUserId" FROM "AccessControlBootstrap";
  -- ('root@company.com', :rootId)   -- normalized, not '  Root@Company.COM  '
  SELECT "userId" FROM "UserPolicies";  -- exactly one row, :rootId
  SELECT count(*) FROM "users";         -- unchanged: no second User created
  SELECT "workEmail" FROM "users" WHERE id = :rootId; -- still 'root@company.com', not rewritten
  ```
