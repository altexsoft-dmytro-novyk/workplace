# S4.1c-SAG-05 · A section absent from the matrix fails closed at the gate

**Trace:**

- SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md` §2 D3 + D4](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) — one section-parameterised gate; the section is a free-form key, so "the key is not in the matrix" is a real input the gate must answer safely.
- [`acm5-sa-06`](../../access-control-kernel/section-access/acm5-sa-06-unsupported-section-returns-none.md) — the kernel half already asserted: `canAccessSection` resolves **successfully** to `'none'` for any string other than `profile:identity` / `profile:leave` / `profile:projects`; it does not throw. This file asserts what User Management's gate does **with** that `'none'`.
- Story [`spec-4-1c-require-section-access-gate.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-1c-require-section-access-gate.md) I/O matrix, row "Section absent from the matrix" — `canAccessSection` → `none` → `403`; fail-closed, **no throw, no log-and-allow**.
- [`SECTION_ACCESS_MATRIX`](../../../../services/backend/src/access-control/domain/constants/section-access-matrix.ts) — the three mapped rows; "a new section is a new row here, never a new branch".
- [`access-control.md`](../../../architecture/access-control.md) — fail-closed is the standing default across the kernel (an AR policy with no live relationship row yields zero grant; an absent matrix cell denies silently).
- [`testing-strategy.md` § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — where a scenario's subject is a public method rather than a route, Stage 1 records the method call, typed input, typed result and absent members instead of inventing an endpoint.

## Scenario

**Given** an active viewer V and an active target T with a **genuine reporting
edge** between them — so `canAccessSection(V, 'profile:identity', T)` would
resolve to `'write'`, and any denial in this scenario is provably caused by the
section key and not by a thin audience.

**When** the gate is asked about a section key that has no row in
`SECTION_ACCESS_MATRIX` — `hasSectionAccess(V, '<unmapped key>', 'read', T)` and
`hasSectionAccess(V, '<unmapped key>', 'write', T)`. Representative keys: a
roadmapped-but-unmapped section such as `'profile:mentorship'`, and the retired
pre-4.1b identifier `'S1'`, which after the rename is just an unmatched string
like any other.

**Then** both calls resolve to `false`. `canAccessSection` returns `'none'`
(rank `0`), which satisfies neither requirement, so the gate denies and
`SectionAccessGuard` raises `ForbiddenException` → `403`. Three things must be
true of that denial:

1. **It does not throw anything else.** An unmapped section is a `'none'`
   answer, not an infrastructure error and not a `500`.
2. **It does not log-and-allow.** A `logger.warn` may be emitted, but the return
   value is `false`; there is no "unknown section, permit and move on" branch.
3. **The feature half is never consulted** — for the `'write'` call,
   `isAllowed` is not called at all, because the audience half returned first.
   Otherwise an unmapped section would be decided by whether the caller happened
   to hold `'<unmapped key>:write'`, which is precisely the widening
   `access-control.md` line 19 forbids.

**Stage-2 surface (read before translating).** 4.1c deliberately wires exactly
one section, `profile:identity`, because it is the only one with a live consumer
— so **no route declares an unmapped section, and there is no HTTP request that
can reach this branch.** Creating a test-only route to produce one is forbidden
(`testing-strategy.md`: no test-only, debug, or artificial HTTP endpoint), and
so is overriding a User Management provider. This scenario's Stage-2 evidence is
therefore the adapter unit spec
`services/backend/src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts`
named in the story's Code Map, driving a stubbed `AccessControlFacade` whose
`canAccessSection` returns `'none'` — plus the kernel-level `acm5-sa-06`, which
proves the real facade actually produces that `'none'` for an unmapped key. The
two together cover the branch end to end; neither alone does.

> **Flagged for the human gate.** The alternative — resolving the real
> UM-owned adapter from the booted `AppModule` container and calling
> `hasSectionAccess` directly against real Postgres, with the reporting edge
> written by `fx.reportsTo` — would give end-to-end evidence with real
> preconditions rather than a stub. It is not an invented endpoint and not a
> provider override, but `testing-strategy.md` scopes the approved
> headless-facade gate to the Access Control kernel (ACM-1..ACM-8), not to User
> Management. Extending that boundary to this one call is a decision above this
> stage; recorded here rather than assumed.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6).

- For the unit-spec surface: a stubbed `AccessControlFacade` whose
  `canAccessSection` resolves `'none'` and whose `isAllowed` is a spy asserted
  **not** to have been called. No database, no fixture rows.
- For the reporting edge described in **Given** — needed if and only if the
  human approves the headless variant flagged above: V and T from `fx.user(...)`
  and a real `Relationship { userId: T, type: 'direct', reportsToUserId: V }`
  written by `fx.reportsTo(t.id, v.id)`, ids threaded from the returned rows,
  never a hardcoded id.

## Test

- **Test 1 — unmapped section, `'read'` requirement**
  - **call:** `hasSectionAccess(<V-uuid>, 'profile:mentorship', 'read', <T-uuid>)`
  - **stubbed input:** `canAccessSection` resolves `'none'`
  - **expectedResult:** resolves `false` (no throw). `isAllowed` was not called.
- **Test 2 — unmapped section, `'write'` requirement**
  - **call:** `hasSectionAccess(<V-uuid>, 'profile:mentorship', 'write', <T-uuid>)`
  - **expectedResult:** resolves `false` (no throw). `isAllowed` was **not**
    called — the audience half short-circuits before the feature half, so no
    grant of `'profile:mentorship:write'` could rescue it.
- **Test 3 — the retired `'S1'` identifier is just an unmatched string**
  - **call:** `hasSectionAccess(<V-uuid>, 'S1', 'write', <T-uuid>)`
  - **expectedResult:** resolves `false`. Proof the 4.1b rename left no
    magic-string special case behind on the User Management side either
    (`acm5-sa-06` asserts the same on the kernel side).
- **Test 4 — the guard's translation of that `false`**
  - **call:** `SectionAccessGuard.canActivate` on a handler carrying
    `@RequireSectionAccess('profile:mentorship', 'read')` metadata, with the
    port stubbed to the `false` of Test 1
  - **expectedResult:** throws `ForbiddenException` (→ `403`). It does not
    return `true`, does not return `undefined`, and does not swallow the denial.
