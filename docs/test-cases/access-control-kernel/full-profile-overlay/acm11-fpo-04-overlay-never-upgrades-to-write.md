# ACM11-FPO-04 · The overlay's own contribution is capped at `'read'`, never `'write'`

> **New Stage-1 scenario, PLAT-E4-S4.2c (2026-09-07). Component-level, unit-level
> proof per AF-6 — same synthetic fixture and same honesty caveat as
> [`ACM11-FPO-03`](./acm11-fpo-03-holder-bumps-a-none-cell-to-read.md), not
> repeated in full here.** This scenario guards a different failure mode than
> `ACM11-FPO-03`: not "does the bump happen at all," but "is the bump's
> ceiling really `'read'`" — a plausible implementation bug is writing the
> overlay branch as `best = isHolder ? 'write' : best` (or reusing the wrong
> rank constant) instead of `best = isHolder ? max(best, 'read') : best`. The
> synthetic row this scenario reuses deliberately carries `'write'` cells for
> `self`/`reporting`/`pp` specifically so a bug that let the overlay leak
> *any* cell value from the row — rather than the fixed literal `'read'` —
> would be caught: the holder here is resolved only as `colleague` (no
> Reporting/PP relation to the target), so a correct implementation can never
> see a `'write'` cell for the audience the holder actually has.

**Trace:**

- Spec [`spec-4-2c-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2c-full-profile-access-overlay.md) — Always list, "The overlay can only ever move `'none' → 'read'`. It must never upgrade an existing `'write'`…"; Tasks & Acceptance Acceptance Criteria — "Given the same synthetic row, when a holder resolves it over a target they have no `'write'`-granting relation to, then the result is never `'write'`."; I/O & Edge-Case Matrix, "Overlay never upgrades to write" row.
- Solution design [`solution-design-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/access-control/solution-design-full-profile-access-overlay.md) §5.3 — the recommended overlay literal, `best = 'read'` (never any other rank), guarded by `if (best !== 'write')` so an existing write is also never touched (the complementary half of this same ceiling property).
- [access-control.md § Multi-audience merge](../../../architecture/access-control.md#multi-audience-merge) point 4 (`:284`) — "the overlay never supplies write and never bypasses functional permissions, command rules, field/record restrictions."

## Scenario

**Given** the same component-level harness as `ACM11-FPO-03`: a real
`AccessControlFacade` with a real `FullProfileOverlayService`, a
`FullProfileAccessPort` double answering `isActiveHolder(rootId) → true`, and
`SECTION_ACCESS_MATRIX` `jest.mock`'d to the one synthetic row
`'fpo:synthetic-none-cell': { self: 'write', reporting: 'write', pp: 'write', colleague: 'none' }`.
Root (the holder) has no Reporting or PP relation to a confirmed active target
(Priya) — Priya's only audience for Root is `colleague`.

**When** `AccessControlFacade.canAccessSection(rootId, 'fpo:synthetic-none-cell', priyaId)`
is called.

**Then** the result is `'read'` — never `'write'`, even though the same row
carries `'write'` for `self`/`reporting`/`pp`. The overlay's own contribution
is the fixed value `'read'`; it is not "whatever the strongest cell on the
row happens to be."

**Preconditions:** identical to `ACM11-FPO-03`'s Preconditions — migrated
PostgreSQL, real `AccessControlModule` wiring, the same `jest.mock`'d matrix,
Root and Priya distinct, confirmed, active, with no Reporting or PP edge
between them.

## Test — a holder with no write-granting relation to the target never receives `'write'`

- **facadeCall:** `accessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
- **input:**
  ```ts
  { viewerId: '<rootId>', section: 'fpo:synthetic-none-cell', targetEmployeeId: '<priyaId>' }
  ```
- **expectedResult:** `'read'` (explicitly asserted `!== 'write'`, not merely truthy)
