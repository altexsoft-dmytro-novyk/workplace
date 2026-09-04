# UMAC-07 · PATCH /users/:id identity-card edit is gated by S1 write-access (Variant A)

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (write) · `um-integration-contract-response.md` Q3 (EDIT_USER_FEATURE) · access-control.md ACM-5 (`canAccessSection(v, 'S1', t)` → `write` for reporting/pp, `read` for self/colleague, `none` for an empty set) · PRD FR-9 refinement · **product decision 2026-09-02 (Dmytro Novyk) — "Variant A"**

> **Variant A (product decision 2026-09-02).** The employee identity card (S1)
> has **no separate functional permission**. The whole gate on `PATCH /users/:id`
> is `canAccessSection(viewer, 'S1', target) === 'write'` — the target's
> reporting-line manager or assigned People Partner may edit; self / colleague
> may not. §2.2's functional-permission half is **not applied to this section**.
> The string `user-management:edit` survives only as the adapter's internal
> routing key for the PATCH-gate branch. This scenario no longer depends on a
> `user-management:edit` kernel seed — the earlier CONDITIONAL block is
> withdrawn. A narrower FR grant on this section can be introduced later through
> the roles admin screen if finer control is ever needed.

## Scenario

**Given** the port is rebound to the real `AccessControlFacade`-backed adapter;
V and T are active seeded `User` rows.

**When** V submits `PATCH /users/<T>` with a valid S1 scalar field change (e.g.
`{ position: "Senior Engineer" }`, or `position` / `country` / `city` /
`workPhone` together).

**Then** the response is `200` **iff** `AccessControlFacade.canAccessSection(V,
'S1', <T>) === 'write'` — i.e. V's audience over T is `reporting` or `pp`. The
change persists: a follow-up `GET /users/<T>` returns the `{ data, canEdit }`
envelope with the new values in `data` and `canEdit: true`.

`403` otherwise:

- V is only `self` or `colleague` over T (`canAccessSection` returns
  `read`) → `403`. A person cannot self-edit their own scalar identity fields;
  the photo is the Story 1.3 exception (`umac-09`).
- V is unrelated to T (empty audience, `canAccessSection` returns `none`) →
  `403`.
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
  - **expectedResult:** `403` — S1 for `self` is `read`, not `write`. (Self writes only the photo — `umac-09`.)
- **Test 5 — unresolved session (`Bearer <token:Bob>`) → 403**
  - **expectedResult:** `403` under the interim session resolver (empty audience → `canAccessSection` returns `none` → denied). Target end state once the real magic-link middleware lands: `401` (`umac-05` / PM/AD-24).
