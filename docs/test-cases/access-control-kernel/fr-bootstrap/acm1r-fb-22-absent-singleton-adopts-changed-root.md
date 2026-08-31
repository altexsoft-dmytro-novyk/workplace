# ACM1R-FB-22 · With no singleton, a changed configured root is adopted rather than rejected

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "Absent-singleton — a changed configured root is adopted, because nothing recorded provenance".
- FR-AMD-1 [Provenance when the singleton is absent](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "The configured root has changed → No recorded provenance exists, so there is no drift to detect. Adopt the currently configured normalized root."
- SPEC Constraints — "With **no** singleton recorded there is no provenance to contradict ... The asymmetry is deliberate — singleton absent permits adoption, singleton present forbids transfer."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — "A changed configured root in this state is adopted rather than rejected, because nothing recorded it before."

## Scenario

**Given** a migrated database with **no** `AccessControlBootstrap` row, an FR
`hr-admin` policy already present, an `hr-admin` attachment belonging to a
**previously** configured root **Olga** who is still active, and
`ROOT_WORK_EMAIL` now set to a different active User, **Rita**, whose normalized
`workEmail` matches exactly one active row.

**When** `npm run db:bootstrap:access-control` runs.

**Then** the bootstrap adopts **Rita** as the root. It creates Rita's own
attachment, writes the singleton naming Rita, and preserves Olga's attachment
untouched as non-bootstrap administrator state. It does not fail, and it does
not treat the change as drift.

This is the same mechanism as ACM1R-FB-21 Scenario B viewed from the
configuration side, and it is stated separately because the two look different
to a reader and identical to the code. The rule is not "the configured root may
change freely" — it is that **without a singleton there is nothing to
contradict**. The moment this run commits, the recorded provenance exists, and
ACM1R-FB-23 shows the very same email change becoming a hard failure. Nothing
about Rita's or Olga's rows changes between the two contracts; only the presence
of the singleton does.

**Preconditions:** migrated database; `AccessControlBootstrap` empty; an FR
`hr-admin` policy present; Olga active and attached; Rita active and the sole
normalized match for the current `ROOT_WORK_EMAIL`.

## Test — the new configured root is adopted, the old one preserved

- **entrypoint:** `npm run db:bootstrap:access-control` with
  `ROOT_WORK_EMAIL` set to Rita's normalized email
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "AccessControlBootstrap"; -- 0
  SELECT "userId" FROM "UserPolicies";           -- [:olgaId]
  SELECT count(*) FROM "users" WHERE "workEmail" = :ritaNormalizedEmail AND "isActive"; -- 1
  ```
- **expectedDatabaseState:** the run exits zero, and afterwards
  ```sql
  SELECT count(*) FROM "UserPolicies";                   -- 2
  SELECT "userId" FROM "UserPolicies" ORDER BY "userId"; -- :olgaId and :ritaId both present
  SELECT "rootUserId", "normalizedRootEmail" FROM "AccessControlBootstrap";
  -- (:ritaId, :ritaNormalizedEmail)
  ```
  and Olga's row is unchanged
