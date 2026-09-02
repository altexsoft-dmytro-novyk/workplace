# UMAC-06 · No-target `isAllowed` delegates straight to the real facade — including against an `HR Admin` impostor

**Trace:** SPEC-user-management-access-control-adoption CAP-1 · `um-integration-contract-response.md` Q1 (the seam is the single `ACCESS_CONTROL_PORT` binding; one binding answers every `@RequireFeature` handler), Q2 §3 (the non-target `isAllowed` moves to the facade in the same cutover — the interim `actor.position === 'HR Admin'` check is deleted) · `access-control.md` §"Functional-role Kernel MVP" (the seeded FR catalog is exactly `user-management:create` / `:deactivate` / `:list`, granted to the one `hr-admin` policy on the root user; the evaluator "branches on no permission key and never compares `targetRole`, a role name, or `User.position`"; **`position === 'HR Admin'` is prohibited as an authorization rule or fallback**) · AD-4 (minimal functional-role kernel — authorization joins `User.isActive`, `UserPolicies`, `type='FR'` policies, grants, and the immutable permission key; nothing else) in `architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md` · AD-21 (`interim-access-control.adapter.ts` is deleted in the same change that binds the real adapter — no dual-running) in `architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` · ACM-2 (`AccessControlFacade.isAllowed(userId, permissionKey)`) · `nestjs-di-tokens.md` (the new adapter is an `infrastructure/` file, consumed only through `ACCESS_CONTROL_PORT` by `AccessControlGuard`) · DEC-UM-002 (holding *a* functional permission is not holding *this* one; use Ida / an unrelated session, never a role-name check)

## Scenario

**Given** the production `ACCESS_CONTROL_PORT` is rebound to the real
`AccessControlFacade`-backed adapter, whose `isAllowed(userId, feature)`
**delegates directly** to `AccessControlFacade.isAllowed(userId, feature)` with no
pre-filter and no role-name branch; the interim adapter's
`actor.position === 'HR Admin'` check and the whole
`interim-access-control.adapter.ts` file are **deleted in the same cutover**
(AD-21 — no dual-running, no compatibility alias).

The three no-target routes and their features
(`users.controller.ts`, `@RequireFeature`):

| Route | Feature | Success status |
| --- | --- | --- |
| `GET /users` | `user-management:list` | `200` |
| `POST /users/import` | `user-management:create` | `200` |
| `DELETE /users/:id` | `user-management:deactivate` | `200` |

> **Note (Story 1.1, AD-21):** `POST /users` was retired — the population is a
> seeded import (AD-16), not an operator create. `POST /users/import` is now the
> no-target `user-management:create` route; it reuses the same kernel permission
> key the retired `POST /users` required (no new `user-management:import` key).
> Its `@RequireFeature` guard runs **before** any multipart/CSV parsing, so an
> unauthorized caller is denied `403` regardless of file content, and an
> authorized caller uploading a well-formed minimal (header-only) CSV gets `200`
> with an all-zero import summary.

`DELETE /users/:id` is still present pre-Epic-1 (its retirement is an
AD-16/AD-21 UM Epic 1 concern, not this slice's); this slice must neither remove
it nor be blocked by it. These three keys are **exactly** the three permission
rows ACM-1 seeds and grants to the one `hr-admin` FR policy attached to the root
user.

**When** each of four sessions calls all three routes:

1. the seeded **HR-Admin root** `User` (holds the live `hr-admin` FR grant chain);
2. an **unrelated active** `User` with no FR policy attachment;
3. **Ida**, who holds a custom functional role whose only permission is unrelated
   (*create form campaigns*), not any `user-management:*` key;
4. an **impostor**: a seeded active `User` whose `position` column is literally
   `'HR Admin'` but who holds **no** `UserPolicies` attachment to any `type='FR'`
   policy granting these keys.

**Then**:

- the **root** session is **allowed** on all three (`200` / `200` / `200`) — the
  facade finds the live `User.isActive` → `UserPolicies` → `Policies type='FR'` →
  `PolicyPermissions` → `Permissions.key` chain;
- the **unrelated** session, **Ida**, and the **impostor** are each **denied**
  (`403`) on all three — an absent or non-matching FR grant denies, and the
  facade **never reads `User.position`, a role name, or `targetRole`**. The
  impostor case is the assertion that made this delegation *committed-red*: under
  the interim adapter it passed only because the `actor.position === 'HR Admin'`
  check let an `HR Admin`-titled row through, which `access-control.md` and AD-4
  prohibit. It is **green** once UMAC-1-production deletes that check and binds
  the real facade adapter.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); ACM-0 + ACM-1 completed (the root `User` holds the `hr-admin` FR policy with the three seeded grants); an unrelated active `User`, Ida (unrelated FR permission), and the impostor (`position: 'HR Admin'`, no FR attachment) all exist as active seeded rows; a disposable seeded `User` exists as the `DELETE` target; the port is rebound to the real facade adapter (`UMAC-1-production` — the interim `actor.position === 'HR Admin'` check is deleted, so the impostor and the unrelated/Ida sessions are all decided by the facade's FR-grant-chain check). Real-session cases use `Bearer <token:<seeded-uuid>>`, never `Bearer <token:Root>` (which the interim session resolver would resolve to whichever row holds `position: 'HR Admin'` — the impostor could shadow the real root).

## Test

- **Test 1 — seeded HR-Admin root → allowed on all three**
  - **inputURL / inputRequest:**
    - `GET /users` — `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
    - `POST /users/import` — `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "multipart": { "file": "<well-formed minimal semicolon CSV: the delivered header row, zero data rows>" } }`
    - `DELETE /users/<disposable-uuid>` — `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `200`, `200`, `200` respectively — the guard's `isAllowed` call returns `true` from the real facade for `user-management:list` / `:create` / `:deactivate`. The import returns an all-zero summary (`{ created: 0, ... }`).
- **Test 2 — unrelated active session → denied on all three**
  - **inputRequest header:** `{ "authorization": "Bearer <token:<unrelated-uuid>>" }` for `GET /users`, `POST /users/import` (any file — or none), `DELETE /users/<disposable-uuid>`
  - **expectedResult:** `403` on each — no `UserPolicies` attachment, so the facade denies; the `@RequireFeature` guard denies `POST /users/import` before any file/CSV parsing, and the action never runs.
- **Test 3 — Ida (unrelated FR permission, DEC-UM-002) → denied on all three**
  - **inputRequest header:** `{ "authorization": "Bearer <token:<ida-uuid>>" }` for the same three routes
  - **expectedResult:** `403` on each — holding *a* functional permission (*create form campaigns*) is not holding `user-management:list` / `:create` / `:deactivate`; the facade branches on the exact permission key.
- **Test 4 — `HR Admin` impostor (`User.position = 'HR Admin'`, no FR grant chain) → denied on all three**
  - **Preconditions:** the impostor is an active seeded `User` with `position: 'HR Admin'` and **zero** `UserPolicies` rows attaching an FR policy that grants these keys (static seeded state — no Prisma schema, migration, or `seed.ts` change; this is fixture row data).
  - **inputRequest header:** `{ "authorization": "Bearer <token:<impostor-uuid>>" }` for `GET /users`, `POST /users/import`, `DELETE /users/<disposable-uuid>`
  - **expectedResult:** `403` on each. The real `AccessControlFacade.isAllowed` never compares `User.position` or a role name (`access-control.md` §"Functional-role Kernel MVP", AD-4), so the `'HR Admin'` title grants nothing. This is the case the deleted interim `actor.position === 'HR Admin'` check would have wrongly allowed — now green under the real facade adapter.
