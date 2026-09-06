# UMAC-02 · Reporting-line viewer reads a report's profile → 200 with the S1 identity card

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) + CAP-3 + CAP-4 · `um-integration-contract-response.md` Q3 (`reporting` → allow) · PRD FR-16 · `access-control.md` §3.2 (Reporting line column), matrix exceptions §3.3 (§3.2 fn 1: manager/PP/department on S1 are read-only for every audience — read is unaffected here) · AD-3 (real-consumer HTTP E2E, no provider overrides) in `architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`

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

**Given** the port is rebound to the real facade adapter; V and T are active
seeded `User` rows; and there is a real `Relationship` row `T` → `V` of
`type='direct'` (T reports to V) — a genuine reporting edge, produced in-suite,
never a hardcoded id (E2E precondition rule).

**When** V calls `GET /users/<T>`.

**Then** the response is `200` with the **`{ data, canEdit }` envelope** — the
same `data` field set `umac-01` and `umac-04` return. The adapter obtains the
audience set from `AccessControlFacade.resolveAudiences(V, [T])`, sees it is
non-empty (contains `reporting`), and allows `user-management:read`. A transitive
reporting edge (V is T's manager's manager) resolves the same way — `reporting`
is the transitive `direct` walk.

`canEdit` — **the `profile:identity` `'write'` dual gate (SCP 2026-09-04 D1),
audience half first.** A reporting-line viewer has
`canAccessSection(V, 'profile:identity', T) === 'write'` (§3.2 row S1,
Reporting line = `RW¹`), and V, being an active employee, holds the feature half
`profile:identity:write` implicitly through `DEFAULT_PERMISSIONS` (D2) — so
`canEdit` is **`true`**.

> The `GET /users/:id` **`data` is the same S1 card** for every audience;
> `canEdit` is what differs.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active; real `Relationship` `T → V` `type='direct'`; the port is rebound and the S1-card DTO is in place.

## Test

- **Test 1 — direct report**
  - **inputURL:** `GET /users/<T-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<V-uuid>>" } }`
  - **expectedResult:** `200`; body `{ data, canEdit }`. `data` contains exactly the 12 S1 fields (`id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`) and not `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`. `canEdit` is `true` (reporting-line viewer → `canAccessSection` `'write'`, plus the `DEFAULT_PERMISSIONS` feature half).
- **Test 2 — transitive reporting line**
  - **Preconditions:** a real seeded `Relationship` chain `T → M → V` (both edges `type='direct'`), so V is two hops up T's reporting line; produced in-suite, never a hardcoded id. This is static seeded state, not a transition — no baseline/change/observe steps.
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `200`, same `{ data, canEdit }` assertions (`data` = the 12 S1 fields; `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy` absent; `canEdit` `true`) — `reporting` resolves through the transitive `direct` walk to chain termination without a repeated node.
