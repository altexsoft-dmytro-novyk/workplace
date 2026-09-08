# S4.1c-SAG-01 · `GET /users/:id` read gate — any non-empty audience allows, `none` denies

**Trace:**

- [`docs/project-requirements.md` §3.2](../../../project-requirements.md) row **S1** (Identity card) — `Self: R (photo RW)` · `Reporting line: RW¹` · `PP: RW¹` · `Colleague: R`. Every one of those cells is at least `R`, so every resolved audience satisfies a `'read'` requirement.
- SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md` §2 D3](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) — one `@RequireSectionAccess('<key>', 'read' | 'write')` gate replaces the `READ_USER_FEATURE` routing-key branch in `isAllowedForTarget`.
- Story [`spec-4-1c-require-section-access-gate.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-1c-require-section-access-gate.md) — section→endpoint map: `GET /users/:id` (`data`) asks `hasSectionAccess(viewer, 'profile:identity', 'read', :id)`; a `'read'` requirement is **audience-only** — there is no feature half, because `DEFAULT_PERMISSIONS` holds no `:read` key.
- [`access-control.md`](../../../architecture/access-control.md) ACM-5 / [`acm5-sa-01`](../../access-control-kernel/section-access/acm5-sa-01-s1-self-or-colleague-read.md), [`acm5-sa-02`](../../access-control-kernel/section-access/acm5-sa-02-s1-reporting-or-pp-write.md), [`acm5-sa-08`](../../access-control-kernel/section-access/acm5-sa-08-empty-audiences-return-none.md) — the kernel side of the same three answers (`read` / `write` / `none`).
- SPEC-user-management-access-control-adoption CAP-2 (read) + CAP-3 (`{ data, canEdit }` envelope) — the response shape this gate fronts is unchanged by 4.1c; only the gate that decides it moves.
- [`umac-01`](./umac-01-self-read-s1-card.md) / [`umac-02`](./umac-02-reporting-line-viewer-read.md) / [`umac-03`](./umac-03-assigned-pp-read.md) / [`umac-04`](./umac-04-colleague-read-s1-card.md) — the per-audience read scenarios this file generalises. Their outcomes are unchanged; this file asserts that the **one** gate now produces all four.

## Scenario

**Given** the `ACCESS_CONTROL_PORT` is bound to the real
`AccessControlFacade`-backed adapter, and `GET /users/:id` declares
`@RequireSectionAccess('profile:identity', 'read')`.

**When** an active viewer V calls `GET /users/<T>` for an active target T.

**Then** the gate asks exactly one question —
`hasSectionAccess(V, 'profile:identity', 'read', <T>)` — which resolves
`canAccessSection(V, 'profile:identity', <T>)` and compares it against the
required level **by rank** (`none: 0 < read: 1 < write: 2`), not by equality.
Every §3.2 S1 cell is at least `R`, so **any** non-empty audience — `self`,
`colleague`, `reporting`, `pp` — reaches rank ≥ 1 and the response is `200`
with the `{ data, canEdit }` envelope. A `write` audience satisfies the
`'read'` requirement exactly as a `read` audience does; there is no separate
"is it exactly read" branch.

The requirement is **audience-only**. `isAllowed` is not called at all for a
`'read'` requirement: `DEFAULT_PERMISSIONS` holds no `profile:identity:read`
key, so a uniformly-derived `'<section>:<level>'` feature half would deny every
read in the system.

When V's audience set over T is empty — T is not an active `User` (deactivated
or unknown id) — `canAccessSection` returns `'none'`, rank `0` reaches neither
requirement, and the gate denies with `403` and a leak-free body. This is
byte-identical to today's empty-audience branch; the branch has moved, the
answer has not.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6). All rows are produced in-suite by
`access-control-adoption/fixtures.ts` and their ids threaded from the returned
records — never a hardcoded id:

- V and T: `fx.user('sag01-viewer')` / `fx.user('sag01-target')` — real active
  `User` rows.
- The reporting case: `fx.reportsTo(T.id, V.id)` writes a real
  `Relationship { userId: T, type: 'direct', reportsToUserId: V }`.
- The PP case: `fx.peoplePartnerOf(T.id, V.id)` writes a real
  `Relationship { userId: T, type: 'people_partner', reportsToUserId: V }`.
- The colleague case: **no** `Relationship` row is written either direction, and
  V ≠ T.
- The deny case: `fx.user('sag01-inactive-target', { isActive: false })` for the
  deactivated target, and a freshly generated `uuidv7()` that matches no row for
  the unknown-target case.

No `UserPolicies` / `Policies` / `PolicyPermissions` row is created for any case
in this file — the read gate must not depend on one.

## Test

- **Test 1 — self (§3.2 S1 Self = `R`) → 200**
  - **inputURL:** `GET /users/<V-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<V-uuid>>" } }`
  - **expectedResult:** `200`; body is the `{ data, canEdit }` envelope, `data`
    exactly the 12 S1-card keys, `canEdit: false` (self resolves `read`, which
    does not satisfy the `'write'` question the hint asks — see `s41c-sag-02`).
- **Test 2 — colleague, no `Relationship` edge (§3.2 S1 Colleague = `R`) → 200**
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `200`; the **same** `data` field set as Test 1;
    `canEdit: false`.
- **Test 3 — reporting-line manager (§3.2 S1 Reporting line = `RW¹`) → 200, `write` satisfies `'read'`**
  - **Preconditions:** real `Relationship` `T → V` `type='direct'`, written by
    `fx.reportsTo(T.id, V.id)`.
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `200`; same `data` field set; `canEdit: true`. The
    resolved level is `write` (rank 2) against a `'read'` requirement (rank 1) —
    the allow proves the comparison is by rank, not equality.
- **Test 4 — assigned People Partner (§3.2 S1 PP = `RW¹`) → 200**
  - **Preconditions:** real `Relationship` `T → V` `type='people_partner'`,
    written by `fx.peoplePartnerOf(T.id, V.id)`.
  - **expectedResult:** `200`; same `data` field set; `canEdit: true`.
- **Test 5 — deactivated target → 403**
  - **Preconditions:** T created with `isActive: false`; no edge to V.
  - **inputURL:** `GET /users/<inactive-T-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `403`. The body is leak-free — no S1 field name, no
    seeded value, no `id`, no `workEmail`, no `lastName`.
- **Test 6 — unknown target id → 403**
  - **inputURL:** `GET /users/<unseeded-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `403`, leak-free body. (The `403`-not-`404` denial
    oracle for this route is the 2026-09-01 human product decision recorded in
    [`umac-05`](./umac-05-unresolved-session-read-denied.md) and the area
    [README](README.md); 4.1c does not revisit it.)
