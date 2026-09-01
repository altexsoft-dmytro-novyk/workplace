# UMAC-07 · PATCH /users/:id is behind the §2.2 dual gate — CONDITIONAL

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (write) · `um-integration-contract-response.md` Q3 (EDIT_USER_FEATURE dual gate + CRITICAL FLAG) · access-control.md §2.2 (dual-dimension gate), ACM-5 (`canAccessSection(v, 'S1', t)` → `write` for reporting/pp) · PRD FR-9 refinement · consolidated proposal §7 Open Decision (i)

> **CONDITIONAL — blocked on Open Decision (i): the missing `user-management:edit`
> permission.** The seeded FR catalog is exactly `user-management:create` /
> `:deactivate` / `:list` (ACM-1). There is **no** `user-management:edit` and no
> photo permission, so step 1 of the dual gate (`isAllowed(v,
> 'user-management:edit')`) returns `false` for everyone under the real facade.
> This scenario is **not translatable to a stage-2 E2E or production** until:
> **option (a)** a new three-stage AD-1 seed sequence in the Access Control
> kernel package adds `user-management:edit` + grant; or **option (b)** Story 0.2
> ships a narrow `// INTERIM` adapter rule with a recorded expiry trigger. Under
> (b) this scenario records the interim rule explicitly *as interim* with the
> trigger "replace with the dual gate when `user-management:edit` is seeded".

## Scenario

**Given** the port is rebound; V and T are active seeded `User` rows; `user-management:edit`
exists as a real permission (option (a)) or an interim rule stands in (option (b)).

**When** V submits `PATCH /users/<T>` with a valid S1 field change (e.g.
`{ position: "Senior Engineer" }`).

**Then** the response is `200` **only when both** halves hold:

1. **Functional half** — `AccessControlFacade.isAllowed(V, <edit permission key>) === true`.
2. **Section half** — `AccessControlFacade.canAccessSection(V, 'S1', <T>) === 'write'`
   (i.e. V's audience over T is `reporting` or `pp` — ACM-5: S1 is `write` for
   reporting/pp, `read` for self/colleague, `none` for an empty set).

`403` when **either** half fails: V lacks the edit permission (functional half
fails) → `403`; V holds the permission but is only `self` or `colleague` over T
(section half returns `read`/`none`) → `403`; V is unrelated (empty set) → `403`.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); the edit permission exists (a) or an interim rule stands in (b); real `Relationship` rows for the reporting/pp cases; the port is rebound.

## Test

- **Test 1 — both halves hold → 200**
  - real `Relationship` `T → V` `type='direct'`; V holds `user-management:edit`.
  - **inputURL:** `PATCH /users/<T-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<V-uuid>>" }, "body": { "position": "Senior Engineer" } }`
  - **expectedResult:** `200`; body reflects the change.
- **Test 2 — functional half fails → 403**
  - real `Relationship` `T → V` `type='direct'`; V does **not** hold `user-management:edit`.
  - **expectedResult:** `403`; a follow-up read shows T's `position` unchanged.
- **Test 3 — section half fails (colleague) → 403**
  - V holds `user-management:edit`; **no** `Relationship` edge between V and T.
  - **expectedResult:** `403` (`canAccessSection` returns `read`); T unchanged.
- **Test 4 — section half fails (self) → 403**
  - V holds `user-management:edit`; V calls `PATCH /users/<V>` (self).
  - **expectedResult:** `403` — S1 for `self` is `read`, not `write`; a manager-line/PP audience is required to write S1. (Self writes only the photo — `umac-09`.)
