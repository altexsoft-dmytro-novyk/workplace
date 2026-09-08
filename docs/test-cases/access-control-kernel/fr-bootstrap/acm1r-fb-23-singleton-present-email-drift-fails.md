# ACM1R-FB-23 · With the singleton present, a changed root email is conflicting drift — no transfer, no second attachment

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
> **This file's numbers change:** the pre-rerun and post-rerun `Permissions` `3` → **`6`** and
> `PolicyPermissions` `3` → **`6`**. The fail-before-writes contract is
> unchanged: every count is identical before and after. The *"singleton's three
> columns"* in this file means `normalizedRootEmail`/`rootUserId`/`policyId`
> and is unrelated to the key count.

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "Singleton-present — changed root email is conflicting drift: no transfer, no second attachment".
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "With the singleton **present**, a changed root email neither transfers nor adds an attachment."
- SPEC Constraints — "A normalized email change after bootstrap is conflicting drift; no attachment transfer or second root attachment is allowed."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "If normalized `ROOT_WORK_EMAIL` changes after bootstrap, the existing seed-owned attachment identifies conflicting bootstrap drift. ACM-1 rolls back with actionable diagnostics; it never transfers the attachment and never creates a second root attachment."
- FR-AMD-1 [Seed-owned drift disposition](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — `AccessControlBootstrap`/`normalizedRootEmail`: "fail as conflicting bootstrap drift".

## Scenario

**Given** a fully bootstrapped database: the singleton records
`normalizedRootEmail = 'root@company.com'` and `rootUserId = :rootId`, and the
one `UserPolicies` attachment belongs to that root. `ROOT_WORK_EMAIL` is then
changed to a **different** active User **Rita**, whose normalized `workEmail`
matches exactly one active row.

**When** `npm run db:bootstrap:access-control` runs again.

**Then** the run **fails before writes**, exits nonzero, and reports an
actionable diagnostic naming both the recorded `normalizedRootEmail` and the
newly configured one. The transaction rolls back. The original root's attachment
is neither transferred to Rita nor duplicated; Rita receives no attachment; the
singleton's three columns are unchanged; and the counts of `Permissions`,
`Policies`, `PolicyPermissions`, and `UserPolicies` are all exactly as before.

Rita is deliberately a **valid, unambiguous, active** root candidate. The run
must fail even though the new configuration is in every other respect
satisfiable — the failure is caused by the recorded provenance disagreeing, not
by anything wrong with Rita. Compare ACM1R-FB-22: identical configuration
change, opposite outcome, and the only difference is that a singleton exists.
That pair is the whole of the deliberate asymmetry, and neither half proves it
alone.

**Preconditions:** the database is fully bootstrapped with the singleton
recorded; Rita is active and the sole normalized match for the new
`ROOT_WORK_EMAIL`; all row counts and the singleton's three columns captured
before the rerun.

## Test — the recorded provenance refuses the new root

- **entrypoint:** `npm run db:bootstrap:access-control` with `ROOT_WORK_EMAIL`
  changed to Rita's email
- **preconditionState:**
  ```sql
  SELECT "normalizedRootEmail", "rootUserId", "policyId" FROM "AccessControlBootstrap";
  -- ('root@company.com', :rootId, :policyId)
  SELECT "userId" FROM "UserPolicies";  -- [:rootId]
  SELECT count(*) FROM "users" WHERE "workEmail" = :ritaNormalizedEmail AND "isActive"; -- 1
  ```
- **expectedDatabaseState:** the run exits nonzero with a diagnostic naming both
  emails, and afterwards
  ```sql
  SELECT "normalizedRootEmail", "rootUserId", "policyId" FROM "AccessControlBootstrap";
  -- unchanged: ('root@company.com', :rootId, :policyId)
  SELECT count(*) FROM "UserPolicies";                          -- 1
  SELECT "userId" FROM "UserPolicies";                          -- :rootId, not :ritaId
  SELECT count(*) FROM "UserPolicies" WHERE "userId" = :ritaId; -- 0
  SELECT count(*) FROM "Permissions";                           -- 6
  SELECT count(*) FROM "PolicyPermissions";                     -- 6
  ```
