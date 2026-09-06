# UMAC-03 · Assigned People Partner reads an employee's profile → 200 with the S1 identity card

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) + CAP-3 + CAP-4 · `um-integration-contract-response.md` Q3 (`pp` → allow) · PRD FR-16 · access-control.md §3.2 (PP column), §2.1 (assigned PP + HR line) · Epic 0 constraint "CC-07 does not block Epic 0 — the facade *reads* `Relationship type='people_partner'`"

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

**Given** the port is rebound; V and T are active seeded `User` rows; and there is
a real `Relationship` row `T` → `V` of `type='people_partner'` (V is T's directly
assigned People Partner), produced in-suite.

**When** V calls `GET /users/<T>`.

**Then** the response is `200` with the **`{ data, canEdit }` envelope** — `data`
the same field set as `umac-01`, `umac-02`, `umac-04`. `resolveAudiences(V, [T])`
is non-empty (contains `pp`), which the adapter maps to allow for
`user-management:read`. Reading the `people_partner` edge to resolve the PP
audience is **not** blocked by CC-07; only the Epic 4 PP *write*/journal path is.
Transitive PP-HR-line propagation above V stays fail-closed to the directly
assigned PP (AD-19 Department-boundary gate) — out of scope for this read.

`canEdit` — **the `profile:identity` `'write'` dual gate (SCP 2026-09-04 D1),
audience half first.** An assigned PP has
`canAccessSection(V, 'profile:identity', T) === 'write'` (§3.2 row S1, PP =
`RW¹`), and holds the feature half `profile:identity:write` implicitly as an
active employee (`DEFAULT_PERMISSIONS`, D2) — so `canEdit` is **`true`**.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active; real `Relationship` `T → V` `type='people_partner'`; the port is rebound and the S1-card DTO is in place.

## Test

- **inputURL:** `GET /users/<T-uuid>`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<V-uuid>>" } }`
- **expectedResult:** `200`; body `{ data, canEdit }`. `data` contains exactly the 12 S1 fields (`id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`) and not `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`. `canEdit` is `true` (assigned PP → `canAccessSection` `'write'`, plus the `DEFAULT_PERMISSIONS` feature half).
