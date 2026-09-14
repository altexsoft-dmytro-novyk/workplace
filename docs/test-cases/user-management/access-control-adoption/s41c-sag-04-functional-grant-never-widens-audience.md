# S4.1c-SAG-04 · A live functional-role grant never widens a resolved audience

> **Test 5 status code SUPERSEDED FOR THE LIVE ORACLE 2026-09-12 — [`umac-11`](umac-11-hidden-target-denial-oracle.md).**
> The target in Test 5 is inactive, so it is a hidden target. It is now denied `404` before any
> section or feature check (PM/AD-24, `CONFLICT-UM-01`). The claim itself is unchanged: the grant
> never opens the target, and the row stays unchanged. The lines below are historical evidence.

**Trace:**

- [`access-control.md` line 19](../../../architecture/access-control.md) **NORMATIVE** — "A new functional role never widens data access (§2.3): FR grants features; what data those features can touch is bounded by the holder's computed access audiences. Feature permissions operate **within** the holder's resolved audiences only." Mirrored in [`docs/project-requirements.md` §2](../../../project-requirements.md).
- [`docs/project-requirements.md` §3.2](../../../project-requirements.md) row **S1** — `Colleague: R`, `Self: R (photo RW)`. A grant does not repaint those cells.
- SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md` §1 + §2 D1/D6](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) — the 2026-09-03 review found exactly this violation in `canEditS1`'s `isAllowed('user-management:edit')` **OR** clause; D1 replaces it with an audience-first **AND**.
- Story [`spec-4-1c-require-section-access-gate.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-1c-require-section-access-gate.md) — "Ordering is the invariant, not a preference": the audience half resolves first and returns `false` before `isAllowed` is reached; `isAllowed` can only subtract.
- [`umac-10`](./umac-10-write-fr-grant-override.md) — **superseded by this file (2026-09-05).** `umac-10` ratified the interim OR-override; this scenario asserts its opposite deliberately. `umac-10`'s third case (a `'none'` target stays closed to a grant holder) survives unchanged and is re-asserted here as Test 5.
- [`s41a-dp-01`](../../access-control-kernel/is-allowed/s41a-dp-01-active-user-baseline-key-allows.md) — the baseline the grant holder already has; the grant adds nothing the audience half will honour.

## Scenario

**Given** the port is bound to the real `AccessControlFacade`-backed adapter;
`PATCH /users/:id` declares `@RequireSectionAccess('profile:identity', 'write')`;
and an active editor E holds a **live functional-role grant chain** — a real
`Policy(type='FR')` → `PolicyPermission` → `Permission` → `UserPolicy` chain,
resolved by `isAllowed` the way any grant is, never by a role-name or
`User.position` check. E's audience over the active target T is **only**
`colleague` (no `Relationship` edge either direction), or E is the target
(`self`).

**When** E submits `PATCH /users/<T>` with an S1 scalar change.

**Then** the response is `403` and T's row is unchanged. The gate resolves
`canAccessSection(E, 'profile:identity', <T>)` to `'read'` first, finds rank
`1 < 2`, and denies — the functional half is **never consulted**, so there is no
code path in which a grant produces an allow the audience half refused. This
holds whichever key the grant carries:

- `user-management:edit` is not the feature half of this gate at all — the
  feature half is `'<section>:write'`, i.e. `profile:identity:write` — so the
  grant is doubly irrelevant;
- and even an explicit grant of `profile:identity:write` itself, the exact key
  the dual gate consults, changes nothing: the audience half has already
  returned `false`, and the feature half can only ever turn an allow into a
  deny.

The `GET /users/<T>` `canEdit` hint reports `false` for the same viewer, because
it is the same call.

This scenario asserts the **opposite** of `umac-10`, on purpose.
`umac-10` documented the interim OR-override that let a
`user-management:edit` holder edit any card whose section access already
resolved to `read` — the widening the 2026-09-03 review flagged. From 4.1c the
override is unreachable, and `umac-10` is superseded by this file.

> **Note for Stage 2.** This is the case expected to be **red** before the
> implementation stage: today's `canEditS1` OR clause allows Tests 1–3. Test 5
> is expected green before and after — a `'none'` target was already closed to
> the override.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6). Produced in-suite by
`access-control-adoption/fixtures.ts`, ids threaded from the returned rows —
never a hardcoded id:

- E: `fx.user('sag04-editor')`; T: `fx.user('sag04-target', { city: 'Krakow' })`;
  both active, **no** `Relationship` row between them.
- The grant: `await fx.grantFunctionalRole(e.id, ['user-management:edit'])` —
  which creates (or reuses the already-seeded) `Permission` row for the key, a
  real `Policy { type: 'FR' }`, its `PolicyPermission`, and the `UserPolicy`
  attachment for E. This is a real chain, identical in shape to the one
  `acm2-is-allowed` exercises, not a stubbed `isAllowed`.
- The exact-key case: a second editor `fx.user('sag04-key-editor')` with
  `await fx.grantFunctionalRole(e2.id, ['profile:identity:write'])`, over its own
  colleague-only target.
- The deactivated-target case:
  `fx.user('sag04-inactive-target', { city: 'Krakow', isActive: false })`.

## Test

- **Test 1 — grant holder, colleague audience, active target → 403, row unchanged**
  - **inputURL:** `PATCH /users/<T-uuid>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<E-uuid>>" },
      "body": { "city": "Berlin" }
    }
    ```
  - **expectedResult:** `403`. T's persisted row still has `city: "Krakow"` —
    asserted against the database, not inferred from the status.
- **Test 2 — the same grant holder's `canEdit` hint is `false`**
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<E-uuid>>`
  - **expectedResult:** `200`; `{ data, canEdit }` with `canEdit: false` and
    `data.city === "Krakow"`. The grant does not make the hint disagree with the
    gate, because both are the same call.
- **Test 3 — grant holder edits their OWN card → 403**
  - **inputURL:** `PATCH /users/<E-uuid>` with `Bearer <token:<E-uuid>>`,
    body `{ "city": "Gdansk" }`
  - **expectedResult:** `403`; E's own row unchanged. §3.2 S1 gives Self `R`; a
    functional grant does not turn that cell into `RW`. (Under the interim
    override this returned `200` — `umac-10` Test 2.)
- **Test 4 — a grant of the dual gate's OWN feature key still does not widen**
  - **Preconditions:** E2 holds an explicit FR grant of `profile:identity:write`
    and has only a colleague audience over its target.
  - **inputURL:** `PATCH /users/<T2-uuid>` with `Bearer <token:<E2-uuid>>`,
    body `{ "city": "Berlin" }`
  - **expectedResult:** `403`; row unchanged. The strongest form of the
    invariant: holding the feature half **explicitly**, on top of holding it
    implicitly through `DEFAULT_PERMISSIONS`, is still not an audience.
- **Test 5 — a `'none'` target stays closed (carried over from `umac-10` Test 3)**
  - **Preconditions:** a deactivated target, `isActive: false`; E holds the
    `user-management:edit` grant.
  - **inputURL:** `PATCH /users/<inactive-T-uuid>` with `Bearer <token:<E-uuid>>`,
    body `{ "city": "Berlin" }`
  - **expectedResult:** `403`; the target row is unchanged (`city` still
    `"Krakow"`). `canAccessSection` returns `'none'` for an empty audience set,
    and `'none'` reaches no requirement.
