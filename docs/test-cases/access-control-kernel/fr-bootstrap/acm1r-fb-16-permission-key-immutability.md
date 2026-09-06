# ACM1R-FB-16 · The seed restores an absent canonical key rather than renaming a drifted row back

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
> **This file's numbers change:** before the rerun `Permissions` `3` → **`6`** and `PolicyPermissions` `3` →
> **`6`**; after it `4` → **`7`** and `4` → **`7`**. The restore-vs-rename
> disposition is unchanged — one canonical key is renamed away, the seed
> restores it as a new row, and the administrator's `-v2` row and its grant
> survive.

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — invariant 5, recorded **Partial**: `ACM1-FB-09` case 1 covers duplicate-key rejection; the immutability half is uncovered.
- [database-schema.md § CAP-3 invariant coverage checklist](../../../architecture/database-schema.md) — row 5: "`Permissions.key` unique and immutable — duplicate key rejected; **in-place key update refused at the owned mutation boundary**".
- [database-schema.md § Permissions](../../../architecture/database-schema.md) — "Keys are append-only identities: no writer may update one in place or bypass the Access Control-owned catalog mutation boundary."
- FR-AMD-1 [OQ-7 — Canonical Feature Identifier](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "Permission keys are append-only identities. No writer may update a key in place."
- FR-AMD-1 [Seed-owned drift disposition](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — `Permissions`/`key`: **Absent** → "restore the row"; **Differs** → "identity: a canonical key is present or absent, never different". `Permissions`/`id`: "preserve — the seed matches on `key` and never rewrites a generated id". `PolicyPermissions`/non-canonical pairs: "preserve".

## Scenario

**Given** a migrated database on which the bootstrap has already run, and an
administrator has since renamed one canonical key in place —
`UPDATE "Permissions" SET key = 'user-management:create-v2'
WHERE key = 'user-management:create'` — leaving that row's `id` and its
existing `PolicyPermissions` grant intact.

**When** `npm run db:bootstrap:access-control` runs again.

**Then** the rerun **restores** `user-management:create` as a new row with a
newly generated id and grants it to the `hr-admin` policy. It does **not**
issue an `UPDATE` against any `Permissions.key`. The renamed row is preserved
exactly as the administrator left it — same id, same `user-management:create-v2`
key — and its grant is preserved as a non-canonical pair. The database ends with
seven permissions and seven grants: the six canonical rows plus the renamed
one.

The drift table governs this and the reasoning is worth stating, because the
opposite behavior looks superficially tidier. From the seed's side a renamed key
is **absent**, not **different**: `key` *is* the identity it matches on, so
there is no row it could recognize as "the canonical one, drifted". Renaming the
row back would be an in-place key update by the one writer that owns the
catalog — precisely what append-only forbids — and would silently destroy
whatever the administrator's `-v2` key was introduced for.

This holds for **any** of the six canonical keys, not only the
`user-management:create` used as the worked example. The three keys added by
PLAT-E4-S4.2a are ordinary members of the set and get no special disposition.

Immutability is therefore observable here as an **absence**: no key is ever
rewritten, by this writer or any other, because the Kernel MVP exposes no
permission-mutation surface at all. A test asserting that the rerun renames the
row back, or that it fails, contradicts the approved drift table and must fail
this contract.

**Preconditions:** the bootstrap has run once; exactly one canonical key has
been renamed in place; the renamed row's `id` and its grant pair are captured
before the rerun.

## Test — restore the canonical key, preserve the renamed row

- **entrypoint:** `npm run db:bootstrap:access-control` (after the direct
  `UPDATE`)
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Permissions";                                       -- 6
  SELECT count(*) FROM "Permissions" WHERE key = 'user-management:create';    -- 0
  SELECT id FROM "Permissions" WHERE key = 'user-management:create-v2';       -- captured as :renamedId
  SELECT count(*) FROM "PolicyPermissions";                                 -- 6
  ```
- **expectedDatabaseState:** the run exits zero, and afterwards
  ```sql
  SELECT count(*) FROM "Permissions";                                       -- 7
  SELECT count(*) FROM "Permissions" WHERE key = 'user-management:create';    -- 1, with an id != :renamedId
  SELECT id FROM "Permissions" WHERE key = 'user-management:create-v2';       -- still :renamedId, unchanged
  SELECT count(*) FROM "PolicyPermissions";                                 -- 7
  SELECT count(*) FROM "PolicyPermissions" WHERE "permissionId" = :renamedId; -- 1, preserved
  ```
  and no `UPDATE` against `"Permissions"."key"` is issued by the run
