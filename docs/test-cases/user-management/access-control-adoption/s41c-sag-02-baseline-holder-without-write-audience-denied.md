# S4.1c-SAG-02 · Holding the `profile:identity:write` baseline is not enough — a `read` audience is denied

**Trace:**

- [`docs/project-requirements.md` §3.2](../../../project-requirements.md) row **S1** (Identity card) — `Self: R (photo RW)` and `Colleague: R`. Neither cell is `RW`, so neither audience may write an identity field. The photo is the one Self exception and travels on its own route.
- SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md` §2 D1](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) — the identity-card edit is a **dual gate**: the audience half (`canAccessSection(viewer, 'profile:identity', target) === 'write'`) **and** the feature half (`isAllowed(viewer, 'profile:identity:write')`). Both must hold; either alone is a deny.
- SCP §2 **D2** + [`s41a-dp-01`](../../access-control-kernel/is-allowed/s41a-dp-01-active-user-baseline-key-allows.md) — every **active** user holds `profile:identity:write` implicitly through the `DEFAULT_PERMISSIONS` code constant, with no `UserPolicies` row. The feature half is therefore satisfied for every viewer in this file; the audience half is the only thing deciding.
- Story [`spec-4-1c-require-section-access-gate.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-1c-require-section-access-gate.md) — `PATCH /users/:id` asks `hasSectionAccess(viewer, 'profile:identity', 'write', :id)`; the composition is **audience-first**, so a failed audience half short-circuits and `isAllowed` is never reached.
- [`access-control.md`](../../../architecture/access-control.md) NORMATIVE invariant (line 19) — "a new functional role never widens data access … feature permissions operate **within** the holder's resolved audiences only."
- [`umac-07`](./umac-07-write-dual-gate.md) Tests 3 and 4 — the same two denials asserted through the pre-4.1c predicate. Their outcomes are unchanged; this file is the same assertion against the one gate, and adds the `canEdit` half.
- [`umac-09`](./umac-09-photo-write-self-only.md) — the Self photo exception, a separate route (`PUT /users/:id/photo`), untouched here.

## Scenario

**Given** the port is bound to the real `AccessControlFacade`-backed adapter;
`PATCH /users/:id` declares `@RequireSectionAccess('profile:identity', 'write')`;
V and T are active seeded `User` rows; and V's audience over T is **only**
`colleague` (no `Relationship` edge either direction) or **only** `self`
(V is T).

**When** V submits `PATCH /users/<T>` with a valid S1 scalar change
(e.g. `{ "city": "Berlin" }`).

**Then** the response is `403`. V *does* hold the feature half — V is an active
user and `profile:identity:write` is in `DEFAULT_PERMISSIONS`, so
`isAllowed(V, 'profile:identity:write')` would return `true` — but the gate
never asks. It resolves `canAccessSection(V, 'profile:identity', <T>)` first,
gets `'read'` (§3.2 S1: `R` for Colleague, `R (photo RW)` for Self), finds rank
`1 < 2`, and returns `false` before the feature half is consulted. **Holding the
baseline is a necessary condition, never a sufficient one.** T's row is
unchanged — the denial is a rejected write, not a status code over an applied
one.

The `GET /users/<T>` `canEdit` hint answers the **same** question through the
same code path (`IdentityCardAccessService.canEdit` → `hasSectionAccess(V,
'profile:identity', 'write', <T>)`), so it reports `false` for exactly the
viewers `PATCH` denies. The read itself still succeeds (`s41c-sag-01`): a
colleague and a self viewer both read the card, neither writes it.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6). Produced in-suite by
`access-control-adoption/fixtures.ts`, ids threaded from the returned rows —
never a hardcoded id:

- V: `fx.user('sag02-viewer')`; T: `fx.user('sag02-target', { city: 'Krakow' })`
  — both active, both `isActive: true`, so both hold the `DEFAULT_PERMISSIONS`
  baseline by construction.
- **No** `Relationship` row is written between V and T in either direction (the
  colleague case), and **no** `fx.grantFunctionalRole(...)` call is made — this
  file must show the baseline alone failing, so no explicit grant chain may
  exist to confound it.
- The self case reuses V as its own target; no extra row is needed, because
  `self` is resolved from the id equality, not from a `Relationship`.

## Test

- **Test 1 — colleague holding the baseline `PATCH`es → 403, row unchanged**
  - **inputURL:** `PATCH /users/<T-uuid>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<V-uuid>>" },
      "body": { "city": "Berlin" }
    }
    ```
  - **expectedResult:** `403`. The persisted `User` row for T still has
    `city: "Krakow"` — asserted directly, not inferred from the status.
- **Test 2 — the same viewer's `canEdit` hint is `false`**
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `200`; body `{ data, canEdit }` with `canEdit: false`
    and `data.city === "Krakow"`. Same question as Test 1, answered on a route
    that is not gated by it.
- **Test 3 — self `PATCH`es a non-photo S1 field → 403**
  - **inputURL:** `PATCH /users/<V-uuid>` with `Bearer <token:<V-uuid>>`
  - **inputRequest body:** `{ "city": "Gdansk" }`
  - **expectedResult:** `403`; V's own row is unchanged. §3.2 S1 gives Self `R`
    with the photo as the only `RW` element, and the photo moves through
    `PUT /users/:id/photo` (`umac-09`), which this story does not touch.
- **Test 4 — self's own `canEdit` hint is `false`**
  - **inputURL:** `GET /users/<V-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `200`; `canEdit: false`. A person is never their own
    reporting-line manager or assigned People Partner, so this never flips.
