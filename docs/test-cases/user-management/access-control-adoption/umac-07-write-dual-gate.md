# UMAC-07 · `PATCH /users/:id` identity-card edit is gated by the `profile:identity` write dual gate

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (write) · `um-integration-contract-response.md` Q3 · access-control.md ACM-5 (`canAccessSection(v, 'profile:identity', t)` → `write` for reporting/pp, `read` for self/colleague, `none` for an empty set) · [`docs/project-requirements.md` §3.2](../../../project-requirements.md) row **S1** (Identity card: `Self: R (photo RW)` · `Reporting line: RW¹` · `PP: RW¹` · `Colleague: R`) · PRD FR-9 refinement · SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md`](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) **D1** (dual gate) + **D2** (`DEFAULT_PERMISSIONS` baseline) + **D3** (one section-parameterised gate) · [`access-control.md`](../../../architecture/access-control.md) line 19 (NORMATIVE — a functional role never widens data access)

> **Amended 2026-09-05 (PLAT-E4-S4.1c). The file name is finally accurate: the
> gate is a dual gate again.** The 2026-09-02 "Variant A" framing — the identity
> card has *no* functional permission, the whole gate is `canAccessSection`
> alone — is **superseded by SCP 2026-09-04 D1**. `PATCH /users/:id` (and the
> `GET /users/:id` `canEdit` hint, which is the same question) now requires
> **both** halves, evaluated in this order:
>
> 1. **the audience half** — `canAccessSection(viewer, 'profile:identity',
>    target)` must already resolve to `write`, i.e. the viewer is the target's
>    reporting-line manager or assigned People Partner (§3.2 row S1: `RW` for
>    Reporting line and PP, `R` for Self and Colleague);
> 2. **then the feature half** — `isAllowed(viewer, 'profile:identity:write')`,
>    which every **active** employee holds implicitly through the
>    `DEFAULT_PERMISSIONS` code constant (D2 / `s41a-dp-01`), with no
>    `Policies` / `PolicyPermissions` / `UserPolicies` row.
>
> Ordering is the invariant, not a preference: the audience half short-circuits,
> so the feature half can only ever turn an allow into a deny and never widens a
> resolved audience (`access-control.md` line 19). Because the baseline is held
> by every active session holder, **the observable outcomes of every test below
> are unchanged** — the composition changed, the answers did not. The
> `user-management:edit` string is no longer any part of this gate; its
> OR-override is superseded ([`umac-10`](./umac-10-write-fr-grant-override.md) →
> [`s41c-sag-04`](./s41c-sag-04-functional-grant-never-widens-audience.md)).
> The section identifier is the human key `profile:identity` (D4); `S1` below is
> a §3.2 matrix-row citation only, never a string passed to the facade.
>
> 4.1c generalises this file's assertions into
> [`s41c-sag-01`](./s41c-sag-01-read-gate-any-audience-allows-none-denies.md) /
> [`s41c-sag-02`](./s41c-sag-02-baseline-holder-without-write-audience-denied.md) /
> [`s41c-sag-03`](./s41c-sag-03-write-audience-plus-baseline-allows.md), which
> assert the same outcomes through the one `@RequireSectionAccess` gate. This
> file stays as the Story 0.2 route-level record.

## Scenario

**Given** the port is rebound to the real `AccessControlFacade`-backed adapter;
V and T are active seeded `User` rows.

**When** V submits `PATCH /users/<T>` with a valid S1 scalar field change (e.g.
`{ position: "Senior Engineer" }`, or `position` / `country` / `city` /
`workPhone` together).

**Then** the response is `200` **iff both** halves of the dual gate hold —
`AccessControlFacade.canAccessSection(V, 'profile:identity', <T>) === 'write'`
(V's audience over T is `reporting` or `pp`) **and**
`isAllowed(V, 'profile:identity:write')`, which V holds as an active employee
through `DEFAULT_PERMISSIONS`. The change persists: a follow-up
`GET /users/<T>` returns the `{ data, canEdit }` envelope with the new values in
`data` and `canEdit: true`.

`403` otherwise:

- V is only `self` or `colleague` over T (`canAccessSection` returns
  `read`) → `403`, decided by the audience half before the feature half is
  consulted at all — holding the baseline is necessary, never sufficient. A
  person cannot self-edit their own scalar identity fields; the photo is the
  Story 1.3 exception (`umac-09`).
- V is unrelated to T, or T is not an active `User` (empty audience,
  `canAccessSection` returns `none`) → `403`.
- V's session does not resolve to an active `User` → per `umac-05` / PM/AD-24:
  target end state `401` once the real magic-link middleware lands; **`403`**
  under the current lax interim session resolver (the request reaches the guard,
  resolves to an empty audience, and is denied).

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); real `Relationship` rows for the reporting / pp cases (`type='direct'` / `type='people_partner'`), produced in-suite, never a hardcoded id; the port is rebound.

## Test

- **Test 1 — reporting-line manager → 200, change persists**
  - real `Relationship` `T → V` `type='direct'`.
  - **inputURL:** `PATCH /users/<T-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<V-uuid>>" }, "body": { "position": "Senior Engineer", "country": "DE", "city": "Berlin", "workPhone": "+49 30 000000" } }`
  - **expectedResult:** `200`; the `PATCH` body (plain `toUserResponse` shape) reflects the four new values. A follow-up `GET /users/<T-uuid>` returns `{ data, canEdit }` with `data.position === "Senior Engineer"`, `data.country === "DE"`, `data.city === "Berlin"`, `data.workPhone === "+49 30 000000"`, and `canEdit: true`.
- **Test 2 — assigned People Partner → 200, change persists**
  - real `Relationship` `T → V` `type='people_partner'`.
  - **expectedResult:** `200`; the change persists; a follow-up `GET` shows it in `data` with `canEdit: true`.
- **Test 3 — colleague (no reporting/PP edge) → 403**
  - **no** `Relationship` edge between V and T.
  - **expectedResult:** `403` (`canAccessSection` returns `read`); a follow-up `GET /users/<T>` shows `data.position` unchanged.
- **Test 4 — Self → 403**
  - V calls `PATCH /users/<V>` (self).
  - **expectedResult:** `403` — §3.2 row S1 gives Self `R (photo RW)`, so `canAccessSection` resolves `read`, not `write`, and the audience half denies before the feature half is reached. (Self writes only the photo — `umac-09`.)
- **Test 5 — unresolved session (`Bearer <token:Bob>`) → 403**
  - **expectedResult:** `403` under the interim session resolver (empty audience → `canAccessSection` returns `none` → denied). Target end state once the real magic-link middleware lands: `401` (`umac-05` / PM/AD-24).
- **Test 6 — deactivated caller (`isActive: false`) → 401** *(added 2026-09-13, PLAT-E4-C03b(1) / PM-AD-24)*
  - V is a real `User` row with `isActive: false`. T is an ordinary active target, not a missing one — [`umac-11`](./umac-11-hidden-target-denial-oracle.md) Test 6 already covers the deactivated-caller shape against a *missing* target id; this test is the same caller shape against a normal one, completing the `401` half of the E4-C03b(1) oracle for `PATCH`.
  - **expectedResult:** `401`, before any audience/section question — the real session resolver returns no session for a caller who is not an active `User`, exactly as `read-denial.e2e-spec.ts` UMAC-05 Test 2 does for `GET`. T's row is unchanged.
