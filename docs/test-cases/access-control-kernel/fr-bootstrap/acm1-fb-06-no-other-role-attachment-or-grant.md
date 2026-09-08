# ACM1-FB-06 · No other role, attachment, or default grant exists after bootstrap

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
> **This file's numbers change:** `Permissions` `3` → **`6`** and `PolicyPermissions` `3` → **`6`**. `Policies`
> stays `1` and `UserPolicies` stays `1` — **this file's actual subject does not
> move.** The bootstrap still creates no second role, no AR policy, no
> non-root attachment and no grant outside the canonical pairs; the canonical
> set is simply larger.

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
through ACM1-FB-04 describe: six `Permissions`, one FR `Policies` row,
six `PolicyPermissions` grants, one `UserPolicies` attachment. No second
role of any `type`, no seventh permission, no attachment for any User other
than the root, and no grant beyond the six canonical pairs exists — the
seed creates no default AR policy, no default project/department grant, and
no attachment for any non-root User.

The six keys are the whole grant. Nothing here gives root or any other
`hr-admin` holder a **data audience**: no `Relationship` row is written, no
`UserPolicies` row for anyone but the root, and no §2.4 full-profile-access
overlay is created — that overlay has no storage representation in the schema
at all. A delegated `hr-admin` therefore still gets zero section access from
the role, with the single accepted exception AF-2 introduces
([`S4.2a-OP-05`](../../user-management/access-control-adoption/s42a-op-05-delegated-hr-admin-gets-no-data-access.md)
and [`S4.2a-OP-06`](../../user-management/access-control-adoption/s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md)).

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
  SELECT count(*) FROM "Permissions";        -- 6
  SELECT count(*) FROM "PolicyPermissions";  -- 6
  SELECT count(*) FROM "UserPolicies";       -- 1, and its userId is the root User's id
  ```
