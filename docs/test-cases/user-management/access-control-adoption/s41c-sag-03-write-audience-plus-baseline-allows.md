# S4.1c-SAG-03 · A `write` audience plus the `profile:identity:write` baseline allows the edit

**Trace:**

- [`docs/project-requirements.md` §3.2](../../../project-requirements.md) row **S1** (Identity card) — `Reporting line: RW¹` and `PP: RW¹`. Footnote 1 keeps *manager*, *people partner* and *department* out of the writable set even for these audiences; that narrowing is asserted by [`umac-08`](./umac-08-write-rejects-org-fields.md) / [`um-edit-05`](../profile/um-edit-05-org-fields-in-body-rejected.md) and is unchanged here.
- SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md` §2 D1 + D2](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) — the dual gate, and its feature half held implicitly by every active employee through `DEFAULT_PERMISSIONS`.
- [`s41a-dp-01`](../../access-control-kernel/is-allowed/s41a-dp-01-active-user-baseline-key-allows.md) — `isAllowed(activeUser, 'profile:identity:write')` is `true` with **no** `UserPolicies` row, which is what makes this scenario's second half hold without any policy fixture.
- Story [`spec-4-1c-require-section-access-gate.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-1c-require-section-access-gate.md) — `PATCH /users/:id` and the `GET /users/:id` `canEdit` hint resolve through **one** code path, `hasSectionAccess(viewer, 'profile:identity', 'write', :id)`.
- [`acm5-sa-02`](../../access-control-kernel/section-access/acm5-sa-02-s1-reporting-or-pp-write.md) — the kernel answer this gate consumes (`reporting` / `pp` → `write`).
- [`umac-07`](./umac-07-write-dual-gate.md) Tests 1 and 2 — the same two allows through the pre-4.1c predicate; outcomes unchanged.

## Scenario

**Given** the port is bound to the real `AccessControlFacade`-backed adapter;
`PATCH /users/:id` declares `@RequireSectionAccess('profile:identity', 'write')`;
V and T are active seeded `User` rows; and there is a real `Relationship` row
making V either T's reporting-line manager (`type='direct'`, T → V) or T's
directly assigned People Partner (`type='people_partner'`, T → V).

**When** V submits `PATCH /users/<T>` with valid S1 scalar changes.

**Then** the response is `200` and the change persists. Both halves of the dual
gate hold and are checked in this order: `canAccessSection(V,
'profile:identity', <T>)` resolves to `'write'` (§3.2 S1 gives `RW` to the
Reporting line and to PP), rank `2 >= 2`; **then** `isAllowed(V,
'profile:identity:write')` returns `true` because V is an active user and the
key is in `DEFAULT_PERMISSIONS` — with **no** `Policies`, `PolicyPermissions`,
or `UserPolicies` row anywhere in the fixture. That absence is the point: the
allow is produced by the code-owned baseline (D2), not by a seeded grant.

A follow-up `GET /users/<T>` returns the `{ data, canEdit }` envelope carrying
the new values with `canEdit: true` — the hint asks the identical question
through the identical code path, so it cannot disagree with the `PATCH` gate.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6). Produced in-suite by
`access-control-adoption/fixtures.ts`, ids threaded from the returned rows —
never a hardcoded id:

- The reporting case: `const t = await fx.user('sag03-report', { position: 'Engineer', country: 'PL', city: 'Krakow' })`,
  `const v = await fx.user('sag03-manager')`, then
  `await fx.reportsTo(t.id, v.id)` — a real
  `Relationship { userId: t.id, type: 'direct', reportsToUserId: v.id }`.
- The PP case: `const t2 = await fx.user('sag03-employee', { city: 'Krakow' })`,
  `const v2 = await fx.user('sag03-pp')`, then
  `await fx.peoplePartnerOf(t2.id, v2.id)` — a real
  `Relationship { userId: t2.id, type: 'people_partner', reportsToUserId: v2.id }`.
- The transitive case: a second manager row `const m = await fx.user('sag03-mid-manager')`
  plus `await fx.reportsTo(t3.id, m.id)` and `await fx.reportsTo(m.id, v3.id)`,
  so V sits two hops up T's reporting chain.
- **No** `fx.grantFunctionalRole(...)` call anywhere in this file.

## Test

- **Test 1 — reporting-line manager → 200, the change persists**
  - **inputURL:** `PATCH /users/<T-uuid>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<V-uuid>>" },
      "body": { "position": "Senior Engineer", "country": "DE", "city": "Berlin", "workPhone": "+49 30 000000" }
    }
    ```
  - **expectedResult:** `200`; the `PATCH` body (the plain `toUserResponse`
    shape, not the read envelope) reflects the four new values.
- **Test 2 — observing the change, and the hint**
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `200`; body `{ data, canEdit }` with
    `data.position === "Senior Engineer"`, `data.country === "DE"`,
    `data.city === "Berlin"`, `data.workPhone === "+49 30 000000"`, and
    `canEdit: true`. `data` carries exactly the 12 S1-card keys.
- **Test 3 — assigned People Partner → 200, the change persists**
  - **Preconditions:** real `Relationship` `T → V` `type='people_partner'` from
    `fx.peoplePartnerOf`.
  - **inputURL:** `PATCH /users/<T2-uuid>` with `Bearer <token:<V2-uuid>>`,
    body `{ "city": "Berlin" }`
  - **expectedResult:** `200`; a follow-up `GET /users/<T2-uuid>` as V2 returns
    `{ data: { city: "Berlin" }, canEdit: true }`.
- **Test 4 — transitive reporting line (V is T's manager's manager) → 200**
  - **Preconditions:** the two-edge chain `T → M → V`, both `type='direct'`,
    written by two `fx.reportsTo` calls.
  - **inputURL:** `PATCH /users/<T3-uuid>` with `Bearer <token:<V3-uuid>>`,
    body `{ "city": "Berlin" }`
  - **expectedResult:** `200`; follow-up `GET` shows `canEdit: true`. The
    `reporting` audience is the transitive `direct` walk, so the gate allows a
    grand-manager exactly as it allows a direct one — no extra decorator, no
    extra branch.
