# ACM1-FB-06 · No other role, attachment, or default grant exists after bootstrap

**Trace:**

- SPEC [Non-goals](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md) — "`/roles` API/UI, runtime role or permission management, the complete §2.3 catalog, and any other default grant."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "There are no other seed-owned default grants."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — "There are no other seed-owned default grants."
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md) — "There are no other seed-owned default grants. On a fresh database those are the exact FR rows."

## Scenario

**Given** a freshly migrated database with the CAP-8 root User precondition
satisfied and nothing else pre-existing in `Policies`, `Permissions`,
`PolicyPermissions`, or `UserPolicies`.

**When** `npm run db:bootstrap:access-control` runs to completion.

**Then** the only rows in those four tables are exactly the ones ACM1-FB-01
through ACM1-FB-04 describe: three `Permissions`, one FR `Policies` row,
three `PolicyPermissions` grants, one `UserPolicies` attachment. No second
role of any `type`, no second permission, no attachment for any User other
than the root, and no grant beyond the three canonical pairs exists — the
seed creates no default AR policy, no default project/department grant, and
no attachment for any non-root User.

**Preconditions:** freshly migrated database; all four tables empty before
the run; CAP-8 root User exists and is active.

## Test — bootstrap output is exactly the canonical set, nothing more

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Policies";           -- 0
  SELECT count(*) FROM "Permissions";        -- 0
  SELECT count(*) FROM "PolicyPermissions";  -- 0
  SELECT count(*) FROM "UserPolicies";       -- 0
  ```
- **expectedDatabaseState:**
  ```sql
  SELECT count(*) FROM "Policies";           -- 1 (the one FR row; no AR row exists either)
  SELECT count(*) FROM "Permissions";        -- 3
  SELECT count(*) FROM "PolicyPermissions";  -- 3
  SELECT count(*) FROM "UserPolicies";       -- 1, and its userId is the root User's id
  ```
