# UMAC-04 · Colleague / unrelated active session reads a profile → 200 with the S1 identity card

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) + CAP-3 · `um-integration-contract-response.md` Q3 (`colleague` → allow, S1 card), Q5 (S1-card projection ships in Story 0.1) · PRD FR-16 · `docs/project-requirements.md` §3.2 (S1 Identity card row is `R` for the Colleague column; legend: Colleague = "any authenticated employee holding none of the above roles") · `access-control.md` §3.3.4 (colleague whitelist — exactly S1, S10 dates-only, S11 project name; the *further* S10/S11/S16 narrowing is FR-17 on its own surfaces, not this route) · AD-2 (User Management alone owns the route shape, guard, binding, adapter, and projection)

> **Amended 2026-09-05 (PLAT-E4-S4.1c).** The `canEdit` rationale below was
> written under the 2026-09-02 "Variant A" framing (identity card has no
> functional permission; the whole gate is `canAccessSection`). That framing is
> **superseded by SCP 2026-09-04 D1**: `canEdit` is the `profile:identity`
> `'write'` **dual gate** — the audience half
> (`canAccessSection(viewer, 'profile:identity', target) === 'write'`) resolved
> **first**, and only then the feature half
> (`isAllowed(viewer, 'profile:identity:write')`, held implicitly by every
> active employee via `DEFAULT_PERMISSIONS`, D2). Ordering is the invariant: the
> feature half can only subtract, never widen a resolved audience
> (`access-control.md` line 19). **The asserted value of `canEdit` in this file
> is unchanged** — every session holder is an active employee and therefore
> holds the baseline, so the audience half remains the deciding term. The
> section identifier is the human key `profile:identity` (D4); `S1` is a §3.2
> matrix-row citation only, never a string passed to the facade. From 4.1c both
> the `data` read gate and this hint are answered by one call,
> `hasSectionAccess(viewer, 'profile:identity', <level>, target)` — see
> [`s41c-sag-01`](./s41c-sag-01-read-gate-any-audience-allows-none-denies.md)
> and [`s41c-sag-02`](./s41c-sag-02-baseline-holder-without-write-audience-denied.md).

## Scenario

**Given** the port is rebound; V and T are active seeded `User` rows with **no**
`Relationship` edge between them and V is not T (V's Phase-0 audience over T is the
`colleague` floor only).

**When** V calls `GET /users/<T>`.

**Then** the response is **`200`** with the **`{ data, canEdit }` envelope** —
`data` is the **same fields every other audience gets** on this route. §3.2's S1
(Identity card) row is `R` for the Colleague column, and the matrix legend
defines Colleague as any authenticated employee holding none of the above roles
— so every active authenticated viewer is at least a Colleague and is entitled
to S1. This is a **positive** test: there is no "two-state" rule, no `403`, and
no deferred flip.

`canEdit` is **`false`**. **The hint is the `profile:identity` `'write'` dual
gate (SCP 2026-09-04 D1), audience half first.**
`canAccessSection(V, 'profile:identity', T)` returns `'read'` for a colleague
(§3.2 row S1, Colleague = `R`), rank `1 < 2`, so the gate denies **before** the
feature half is consulted — the colleague does hold `profile:identity:write`
via `DEFAULT_PERMISSIONS`, and it makes no difference (`s41c-sag-02`). A
colleague never gains identity-card write access, so it never flips.

> **The S1 card projection (CAP-3, Story 0.1).** `data` contains exactly `id`,
> `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`,
> `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`. It **does not**
> contain `ttId`, `isActive`, `customFields`, `createdAt`, or `createdBy`.
> Derived S1 display fields (manager, people partner, department, mentor,
> current projects) come from other contexts and are out of scope for this
> route until those land — `data` omits them. The *further* colleague
> narrowing — S10 dates-only (`GET /users/:id/leaves`), S11 project-name-only,
> S16 per-field visibility — is the deferred FR-17 Profile Projection story on
> those own surfaces, not this route.

A genuinely unrelated *field* route for a colleague (e.g. `GET
/users/:id/personal-contacts`, S2, absent from the colleague whitelist) is a
`404`/`—`-cell case owned by other slices and is out of this slice's scope.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active seeded rows; no `Relationship` edge either direction; V ≠ T; the port is rebound (this scenario's E2E is red until `UMAC-1-production` ships the S1-card DTO — under the interim adapter `toUserResponse` spreads the whole row, so the "technical fields absent" assertions fail).

## Test

- **inputURL:** `GET /users/<T-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<V-uuid>>" } }
  ```
- **expectedResult:** `200`. Body `{ data, canEdit }`. `data` **contains exactly** `id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` and **not** `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy` — identical `data` to `umac-01` / `umac-02` / `umac-03`. `canEdit` is `false` (colleague → `canAccessSection` `'read'`; the baseline feature half cannot widen it — never flips true).
