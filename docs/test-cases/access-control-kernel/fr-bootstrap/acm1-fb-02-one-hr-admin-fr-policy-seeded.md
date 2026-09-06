# ACM1-FB-02 · A fresh database seeds exactly one hr-admin FR policy

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
> **This file's numbers change:** **none.** `Policies` (`type='FR'`) is still exactly `1`, and this file asserts
> no permission or grant count. Its **Trace** lines quote SPEC CAP-3 and
> FR-AMD-1 saying *"three permissions"* / *"granting exactly those three
> permissions"*. Those quotes are left **verbatim** because their sources are
> unedited (AF-4), and they are therefore stale against shipped behaviour from
> 2026-09-06. The FR policy row this file is actually about is unchanged.

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "the reviewed custom migration makes `Policies.type` non-null, restricts it to FR/AR, and enforces AD-4 row shapes ... ACM-1 ensures the three permissions, one FR policy, three grants, and one attachment."
- FR-AMD-1 [OQ-4 — Functional-Role Row Shape](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "the Kernel MVP seeds exactly one `targetRole='hr-admin'`. A partial unique index on `targetRole WHERE type='FR'` prevents duplicate FR role keys."
- FR-AMD-1 Fixed Kernel Inputs — "The kernel seeds exactly one role, `hr-admin`, granting exactly those three permissions."
- [database-schema.md § Policies (AD-7)](../../../architecture/database-schema.md) — row shape and `UNIQUE: targetRole WHERE type='FR'`.
- Architecture spine [local AD-4 — Minimal functional-role kernel](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — "FR rows require a non-null `targetRole` role key and carry `targetType=NULL` and `targetId=NULL` ... Reviewed custom PostgreSQL migration SQL enforces that type-specific shape and unique FR role keys."

## Scenario

**Given** a freshly migrated Access Control schema with an empty `Policies`
table, and the CAP-8 root User precondition satisfied.

**When** `npm run db:bootstrap:access-control` runs to completion.

**Then** `Policies` holds exactly one row with `type='FR'`. That row's
`targetRole` is `'hr-admin'`, `operator` is `'=='`, and `managedBy` is
`'admin'`. No other `type='FR'` row exists — the partial unique index
`targetRole WHERE type='FR'` allows no second one.

**Preconditions:** freshly migrated database; `Policies` empty (no FR and no
AR rows); CAP-8 root User exists and is active.

## Test — bootstrap seeds the FR role

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:** `SELECT count(*) FROM "Policies" WHERE type='FR'` → `0`
- **expectedDatabaseState:**
  ```sql
  SELECT "targetRole", operator, "managedBy"
  FROM "Policies" WHERE type = 'FR';
  -- ('hr-admin', '==', 'admin')   -- exactly one row
  SELECT count(*) FROM "Policies" WHERE type = 'FR'; -- 1
  ```
