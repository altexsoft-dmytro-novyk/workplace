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
| `POST /users` | `user-management:create` | `201` |
| `DELETE /users/:id` | `user-management:deactivate` | `200` |

`POST /users` and `DELETE /users/:id` are still present pre-Epic-1 (their
retirement is an AD-16/AD-21 UM Epic 1 concern, not this slice's); this slice
must neither remove them nor be blocked by them. These three keys are **exactly**
the three permission rows ACM-1 seeds and grants to the one `hr-admin` FR policy
attached to the root user.

**When** each of four sessions calls all three routes:

1. the seeded **HR-Admin root** `User` (holds the live `hr-admin` FR grant chain);
2. an **unrelated active** `User` with no FR policy attachment;
3. **Ida**, who holds a custom functional role whose only permission is unrelated
   (*create form campaigns*), not any `user-management:*` key;
4. an **impostor**: a seeded active `User` whose `position` column is literally
   `'HR Admin'` but who holds **no** `UserPolicies` attachment to any `type='FR'`
   policy granting these keys.

**Then**:

- the **root** session is **allowed** on all three (`200` / `201` / `200`) — the
  facade finds the live `User.isActive` → `UserPolicies` → `Policies type='FR'` →
  `PolicyPermissions` → `Permissions.key` chain;
- the **unrelated** session, **Ida**, and the **impostor** are each **denied**
  (`403`) on all three — an absent or non-matching FR grant denies, and the
  facade **never reads `User.position`, a role name, or `targetRole`**. The
  impostor case is the assertion that makes this delegation *committed-red*: it
  passes today only because the interim adapter's `actor.position === 'HR Admin'`
  check lets an `HR Admin`-titled row through, which `access-control.md` and AD-4
  prohibit.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); ACM-0 + ACM-1 completed (the root `User` holds the `hr-admin` FR policy with the three seeded grants); an unrelated active `User`, Ida (unrelated FR permission), and the impostor (`position: 'HR Admin'`, no FR attachment) all exist as active seeded rows; a disposable seeded `User` exists as the `DELETE` target; the port is rebound (this scenario's E2E is red until `UMAC-1-production` lands — under the interim adapter the impostor is wrongly allowed and the unrelated/Ida sessions are decided by the `position` check, not the facade). Real-session cases use `Bearer <token:<seeded-uuid>>`, never `Bearer <token:Root>` (which the interim session resolver would resolve to whichever row holds `position: 'HR Admin'` — the impostor could shadow the real root).

## Test

- **Test 1 — seeded HR-Admin root → allowed on all three**
  - **inputURL / inputRequest:**
    - `GET /users` — `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
    - `POST /users` — `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { <valid CreateUserDto> } }`
    - `DELETE /users/<disposable-uuid>` — `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `200`, `201`, `200` respectively — the guard's `isAllowed` call returns `true` from the real facade for `user-management:list` / `:create` / `:deactivate`.
- **Test 2 — unrelated active session → denied on all three**
  - **inputRequest header:** `{ "authorization": "Bearer <token:<unrelated-uuid>>" }` for `GET /users`, `POST /users`, `DELETE /users/<disposable-uuid>`
  - **expectedResult:** `403` on each — no `UserPolicies` attachment, so the facade denies; the action never runs.
- **Test 3 — Ida (unrelated FR permission, DEC-UM-002) → denied on all three**
  - **inputRequest header:** `{ "authorization": "Bearer <token:<ida-uuid>>" }` for the same three routes
  - **expectedResult:** `403` on each — holding *a* functional permission (*create form campaigns*) is not holding `user-management:list` / `:create` / `:deactivate`; the facade branches on the exact permission key.
- **Test 4 — `HR Admin` impostor (`User.position = 'HR Admin'`, no FR grant chain) → denied on all three**
  - **Preconditions:** the impostor is an active seeded `User` with `position: 'HR Admin'` and **zero** `UserPolicies` rows attaching an FR policy that grants these keys (static seeded state — no Prisma schema, migration, or `seed.ts` change; this is fixture row data).
  - **inputRequest header:** `{ "authorization": "Bearer <token:<impostor-uuid>>" }` for `GET /users`, `POST /users`, `DELETE /users/<disposable-uuid>`
  - **expectedResult:** `403` on each. The real `AccessControlFacade.isAllowed` never compares `User.position` or a role name (`access-control.md` §"Functional-role Kernel MVP", AD-4), so the `'HR Admin'` title grants nothing. This is the case the deleted interim `actor.position === 'HR Admin'` check would have wrongly allowed.
