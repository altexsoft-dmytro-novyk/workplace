---
title: 'User Management → Access Control — integration contract response'
type: 'handoff-response'
created: '2026-08-31'
responds_to: _bmad-output/implementation-artifacts/access-control/um-integration-contract-request.md
responds_to_revision: 2
status: 'answered-pending-human-approval'
author: 'Winston (System Architect)'
companions:
  - ../../specs/spec-user-management-access-control-adoption/SPEC.md
  - ../../specs/spec-user-management-access-control-adoption/stories.yaml
  - ./architect-handoff-phase-b.md
context:
  - '{project-root}/_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md'
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/api-conventions.md'
  - '{project-root}/docs/architecture/domain-driven-design.md'
  - '{project-root}/docs/architecture/nestjs-di-tokens.md'
  - '{project-root}/docs/architecture/testing-strategy.md'
---

# Integration contract response — adopting the Access Control facade

**To:** Access Control. **From:** the User Management owner (Winston, acting).

**Nothing in this document is an AD-1 approval.** It is a planning-stage
answer to the six questions in `um-integration-contract-request.md` rev 2,
re-checked against the kernel as it stands on 2026-08-31 — after ACM-2
(`isAllowed`) and ACM-5 (`canAccessSection` for S1/S10/S11) shipped with
`stage-3-production` records in
`_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml`, and after
ACM-8 imported `AccessControlModule` into `AppModule`
(`services/backend/src/app.module.ts`, approval 2026-08-31T10:25:00Z). The
adoption work itself is scoped as a new package:
`_bmad-output/specs/spec-user-management-access-control-adoption/`.

## What changed since rev 2 was written

Rev 2's answers to Q2 and Q3 were written when the facade could only
`resolveAudiences`. Two facade methods now exist that change the trade-off:

- **`AccessControlFacade.isAllowed(userId, permissionKey)`** (ACM-2,
  `services/backend/src/access-control/application/access-control.facade.ts:25`)
  — a live, type-separated FR decision reading only `type='FR'` policy data.
- **`AccessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`**
  (ACM-5, same file `:47`) — returns `'none' | 'read' | 'write'` for
  `section` values `'S1'`, `'S10'`, `'S11'` only; `'none'` for every other
  string. For S1 it returns `write` for `reporting`/`pp`, `read` for
  `self`/`colleague`, `none` for an empty audience set.

The practical effect on the ask is unchanged from rev 2's framing —
`READ_USER_FEATURE` can adopt now; `EDIT`/`UPLOAD_PHOTO` cannot be fully
dual-gated until a functional permission for them exists — but the *reason*
is now precise, and the dual gate is now expressible in facade calls rather
than deferred wholesale.

---

## Q1 — The seam is a binding, not a route. **Confirmed.**

**Decision.** The adoption seam is the single `ACCESS_CONTROL_PORT` provider
binding in
`services/backend/src/user-management/user-management.module.ts:36`
(`{ provide: ACCESS_CONTROL_PORT, useClass: InterimAccessControlAdapter }`).
`AccessControlGuard`
(`services/backend/src/user-management/application/guards/access-control.guard.ts`)
routes every `@RequireFeatureForTarget` handler through
`isAllowedForTarget(session.userId, feature, params.id)` and every
`@RequireFeature` handler through `isAllowed(session.userId, feature)`.
Whatever is bound answers for all of them at once; there is no per-route
adoption.

**Behaviour is therefore decided per feature string**, inside the real
adapter, by branching on its `feature` argument. The three target-scoped
features and their controller constants
(`services/backend/src/user-management/application/controllers/users.controller.ts:39-44`):

| Route | Decorator | Feature constant |
| --- | --- | --- |
| `GET /users/:id` | `@RequireFeatureForTarget` | `READ_USER_FEATURE` = `user-management:read` |
| `PATCH /users/:id` | `@RequireFeatureForTarget` | `EDIT_USER_FEATURE` = `user-management:edit` |
| `PUT /users/:id/photo` | `@RequireFeatureForTarget` | `UPLOAD_PHOTO_FEATURE` = `user-management:upload-photo` |

**Reasoning.** AD-2
(`architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md:84`) makes
route shape, guards, adapters and projection User Management's sole property;
the binding is the one place all three routes' authorization is chosen, so it
is the correct unit of the contract. `nestjs-di-tokens.md` sanctions
`application/guards/` injecting a port directly, so the guard needs no
change.

---

## Q2 — Keep the port shape; own the adapter. **Confirmed, with one addition.**

**Decision.**

1. `AccessControlPort`
   (`services/backend/src/user-management/domain/interfaces/access-control.port.ts`)
   keeps both signatures unchanged:
   `isAllowed(userId, feature)` and
   `isAllowedForTarget(userId, feature, targetUserId)`.
2. The real adapter lives in
   `services/backend/src/user-management/infrastructure/` (proposed name
   `access-control-facade.adapter.ts`), is `@Injectable()`, injects
   `AccessControlFacade` (exported by the `@Global` `AccessControlModule`),
   and **replaces `interim-access-control.adapter.ts` wholesale** — the
   interim file is deleted in the same cutover (AD-21: no dual-running,
   `architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md:196`).
3. **The non-target `isAllowed` moves to the facade in the same cutover.**
   The interim adapter currently answers `isAllowed` with an
   `actor.position === 'HR Admin'` string check
   (`interim-access-control.adapter.ts:21-28`) — explicitly prohibited as an
   authorization rule by `access-control.md:49` and AD-4
   (`architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md:115`).
   The real adapter delegates `isAllowed(userId, feature)` straight to
   `AccessControlFacade.isAllowed(userId, feature)`. This is a clean win: the
   three no-target features actually in use — `user-management:create`,
   `user-management:deactivate`, `user-management:list`
   (`users.controller.ts:39,43,44`) — are **exactly** the three permission
   keys ACM-1 seeds (`access-control.md:55-58`), granted to the one seeded
   `hr-admin` FR policy attached to the `ROOT_WORK_EMAIL` root user. So
   `POST /users`, `DELETE /users/:id` and `GET /users` keep working for the
   root/HR-Admin session and fail closed for everyone else — which is the
   behaviour the interim `position` check approximated.

**Reasoning.** Rev 2's ownership argument still holds: an Access
Control-authored adapter would have to `import` `AccessControlPort` /
`ACCESS_CONTROL_PORT` from `src/user-management/**`, a dependency pointing
backwards across the boundary that `domain-driven-design.md:42` forbids
("never into another context's `domain/` ... even to import just a type or a
DI token symbol"). `deferred-work.md` (open finding, 2026-08-31) records the
same seam observed from the test side and confirms it "resolves only when
User Management rebinds `ACCESS_CONTROL_PORT` to a real facade-backed
adapter." The adapter is a UM infrastructure file; it imports the AC facade
forwards, which AD-2 permits.

**Boundary note for the code stage.** `nestjs-di-tokens.md:61` and
`domain-driven-design.md:38` bar `application/actions/` and even
`application/` from injecting a port. The new adapter is `infrastructure/`
and is consumed only through the `ACCESS_CONTROL_PORT` token by
`application/guards/AccessControlGuard` — the one sanctioned exception. No
action, no domain service, and no controller may inject
`AccessControlFacade` directly.

---

## Q3 — Feature → audience / section mapping. **The product-shaped answer.**

This is the decision Access Control cannot make. It is made per feature.

### `READ_USER_FEATURE` (`GET /users/:id`) — adopt now, two-state colleague rule

**Decision.** `isAllowedForTarget(viewer, 'user-management:read', target)`
resolves as:

| Phase-0 audience over target | Decision now | Decision once Profile Projection lands |
| --- | --- | --- |
| `self` | allow | allow |
| `reporting` | allow | allow |
| `pp` | allow | allow |
| `colleague` (floor, none of the above) | **deny** | **allow, response narrowed to the §3.3.4 whitelist** |
| empty set (inactive/missing viewer or target) | deny | deny |

The adapter obtains the set from
`AccessControlFacade.resolveAudiences(viewer, [target])` and inspects
membership. (`canAccessSection(viewer, 'S1', target)` alone cannot express
this rule — it returns `'read'` for both `self` and `colleague`, so the
adapter must see the audience set to distinguish them. Reading the set to
gate a route is not widening the facade result; it is the route decision AD-2
gives User Management.)

**Explicit two-state trigger — record this so the temporary state is not
mistaken for the final one:**

> `colleague → deny` holds **only while `GET /users/:id` returns the whole
> `User` row.** The durable rule is `colleague → allow, narrowed`. The
> trigger that flips it is: the **Profile Projection story**
> (`deferred-work.md`, "Profile Projection" entry) reaches
> `stage-3-production` and `toUserResponse` no longer spreads the whole row.
> On that event, and not before, the adoption adapter's `READ` branch
> changes `colleague` from deny to allow, and the projection narrows the body
> to §3.3.4: S1 identity-card fields, S10 dates-only (own route
> `GET /users/:id/leaves`), S11 project name only (inline on
> `GET /users/:id`).

**Reasoning.** §3.3.4 (`access-control.md:197,236`) says a colleague
legitimately sees S1, S10 dates, and S11 project name — they are meant to be
*narrowed*, not refused (rev 2 Q4). But narrowing is a serialization
decision, and `canAccessSection` "does not serialize fields"
(`access-control.md:156`, ACM-5 SPEC constraint). Until a projection exists,
allowing a colleague through the route hands them every field of the row —
`birthDay`, `workPhone`, `ttId`, `customFields`, `createdBy` — which §7 names
the primary quality attribute against. Fail-closed is the sanctioned interim
default (`deferred-work.md` resolutions, 2026-08-31).

### `EDIT_USER_FEATURE` and `UPLOAD_PHOTO_FEATURE` — dual gate, blocked on a missing permission

**Decision (target state).** `isAllowedForTarget(viewer, <edit feature>,
target)` returns `true` only when **all** of:

1. **Functional half (§2.2 dual gate, `access-control.md:163`):**
   `AccessControlFacade.isAllowed(viewer, <edit permission key>) === true`.
2. **Section half:**
   `AccessControlFacade.canAccessSection(viewer, 'S1', target) === 'write'`
   — i.e. the viewer resolves `reporting` or `pp` over the target (ACM-5).
3. **§3.2 fn 1 constraint (`access-control.md:235`):** manager, people
   partner and department are **read-only for every audience** on S1 — they
   change only through the Epic 4 organisational-relationship screen, never
   `PATCH /users/:id`. This is enforced in `EditUserAction` / `UpdateUserDto`
   (reject those fields), not in the guard. `users.controller.ts` /
   `edit-user.action.ts` must be checked for this at the code stage; the
   current `UpdateUserDto` does not obviously carry manager/PP/department
   fields, but the rejection must be explicit and tested (FR-9,
   `epics.md` Story 1.2 third AC).
4. **`UPLOAD_PHOTO_FEATURE` narrower command rule:** FR-9 / §3.2 —
   *"Self can directly write only the photo"*, and the S1 photo cell is
   RW for Self. Treat photo upload as **Self-only** (`self` audience over
   the target) unless Product confirms managers may replace a report's
   photo. This is narrower than the S1 `write` cell, so it is an additional
   check, not a substitute for the dual gate.

### CRITICAL FLAG — the dual gate cannot be completed today

**The seeded FR catalog is exactly three keys** — `user-management:create`,
`user-management:deactivate`, `user-management:list` (`access-control.md:55-58`,
AD-4 MVP-reduction `architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md:121`,
ACM-1 `stage-3-production` approval). **There is no `user-management:edit`
and no photo permission.** The controller constants `EDIT_USER_FEATURE` and
`UPLOAD_PHOTO_FEATURE` reference keys that do not exist in any policy, seed
or migration. Today `PATCH /users/:id` and `PUT /users/:id/photo` "succeed"
only because `InterimAccessControlAdapter.isAllowedForTarget` ignores its
`feature` argument and returns `Boolean(userId)`
(`interim-access-control.adapter.ts:37-39`). Under the real facade,
`isAllowed(viewer, 'user-management:edit')` returns `false` for everyone —
step 1 of the dual gate can never pass.

Two options. **Recommendation: (a). Final call is the human's.**

**Option (a) — add the permissions Access-Control-side, via a separate AD-1
sequence in the kernel package.**

- Access Control adds `user-management:edit` (and, if photo is not folded
  into edit, a photo permission key) to the seed/bootstrap catalog, grants
  them to the `hr-admin` FR policy, through a **new kernel seed story** run
  as its own three-stage AD-1 dispatch under
  `spec-access-control-kernel-mvp` (or a small successor spec). It is a seed
  change, so it follows the ACM-0/ACM-1 deploy-time-entrypoint rule
  (`testing-strategy.md:140`, AD-3 production-entrypoint rule).
- The adoption slice then *consumes* the new keys; no interim behaviour
  survives for writes.
- Cost: one extra kernel AD-1 sequence (scenario / red-tests / production)
  and one migration/seed touch before the adoption slice's write path can
  go green.
- Benefit: `PATCH`/`PUT photo` are correctly dual-gated on first adoption;
  no second cutover; AD-21 satisfied in one pass.
- Open sub-question for Product: is photo a distinct permission or covered
  by `user-management:edit`? The §2.3 catalog (changelog line 39) lists
  broad permissions; it does not name a photo permission. Recommend photo
  is **not** a separate permission — it is Self-only by FR-9, so the
  functional half is satisfied by "the viewer is editing their own row"
  and the section half by the Self S1 photo cell. If so, option (a) only
  needs `user-management:edit`.

**Option (b) — adopt `READ` now, keep `EDIT`/`UPLOAD_PHOTO` on interim
behaviour with a recorded expiry trigger.**

- The real adapter delegates `read` to the facade and, for `edit` /
  `upload-photo`, retains a narrow interim rule (e.g. `canAccessSection(...)
  === 'write'` for edit, `self` for photo) with a `// INTERIM` comment and
  an explicit trigger: *"replace with the dual gate when
  `user-management:edit` is seeded."*
- Cost: a second cutover later; AD-21's "no dual-running / do not mark
  profile work done while the interim adapter can authorize target access"
  is only *partly* satisfied — the interim *file* is gone but interim
  *logic* for writes remains in the real adapter.
- Benefit: the read leak (every session reads every full profile) closes
  immediately without waiting on a kernel seed story.

Recommendation (a): the read leak is real but the write path is equally a
privacy boundary (§7), and a half-adopted adapter with `// INTERIM`
branches is exactly the shape AD-21 was written to prevent. The extra
kernel sequence is small and bounded. **But this is a product/sequencing
call — the human decides.**

---

## Q4 — Denial convention: `403` stays, as a symptom. **Confirmed.**

**Decision.** `AccessControlGuard` maps a denied `isAllowedForTarget` to
`ForbiddenException` → `403` (`access-control.guard.ts:52`). For a denied
whole-profile read that stays `403` **and is recorded as a temporary
consequence of Q5/Q3, not a settled convention.**

**Reasoning.** `access-control.md:179` fixes the leak-free conventions:
`401` no token, `403` "valid token without feature permission or write to a
readable section", `404` "valid token touching a `—` cell or hidden field".
Refusing a *whole profile* to a colleague is none of these cleanly — a
colleague is meant to be *narrowed to the whitelist*, not refused. The
correct end state is: colleague gets `200` with a narrowed body once Profile
Projection lands. So the adoption scenarios must **not** harden a
colleague-gets-`403`-on-`GET /users/:id` assertion as intended behaviour;
they should assert it as the explicitly-temporary consequence of the
two-state rule, with a comment pointing at the projection trigger. A
genuinely unrelated *field* (e.g. a colleague hitting `GET
/users/:id/personal-contacts`, S2, absent from the whitelist) is the real
`404` case and is out of this slice's scope.

---

## Q5 — Projection is a separate story. **Say it out loud. Confirmed.**

**Decision, stated for the record in the adoption SPEC and every adoption
scenario:**

> Until the Profile Projection story lands, an **allowed** `GET /users/:id`
> still returns **every `User` field**. The route is **audience-gated, not
> field-gated.** `toUserResponse`
> (`services/backend/src/user-management/application/dtos/user.response.ts:10`)
> spreads the whole row (`return { ...user, companyJoinDate: ... }`). A
> reviewer who sees the adoption slice merged must not conclude the endpoint
> is permission-safe for field-level exposure — it is not.

**Reasoning.** `canAccessSection` returns only `none/read/write` and "cannot
decide an endpoint's field or record shape" (`deferred-work.md`, Profile
Projection entry; `access-control.md:156`). Narrowing the payload —
S1-derived-field immutability, colleague S10/S11 subsets, S16 visibility — is
a distinct UM-owned deliverable that "calls the facade rather than reading
policies or deriving audiences, and may only narrow its base section
result." The adoption slice **references** that entry (`deferred-work.md`)
and does **not** duplicate or absorb it.

---

## Q6 — Wiring location, and the suite warning. **Confirmed.**

**Decision.** The rebind of `ACCESS_CONTROL_PORT` and the deletion of
`interim-access-control.adapter.ts` are a **User Management branch** in
`services/backend`. Access Control opens no PR against `src/user-management/**`.
`AccessControlModule` is already `@Global` and already imported by `AppModule`
(ACM-8), so on the UM side the change is: one import, one provider line
swapped in `user-management.module.ts`, one new `infrastructure/` file, one
deleted file.

**Suite warning — real, and it bites the moment the write path moves.**
`services/backend/test/user-management/profile.e2e-spec.ts` uses literal
persona placeholders by design — its own header comment says so, and
`.claude/rules/nest-e2e.md` ("Session/authorization stays out of scope for
this suite") sanctions it. `Bearer <token:Bob>` resolves through
`InterimSessionResolverAdapter` to `{ userId: 'Bob' }` — the string `'Bob'`,
a user id that does not exist
(`interim-session-resolver.adapter.ts:48`). Today `Boolean('Bob')` is
`true`, so `PATCH /users/:id` and `PUT /users/:id/photo` return `200`. Under
the real facade, `'Bob'` fails `IdentityPort.findActiveUserIds` (no row),
`resolveAudiences` returns an empty set, `canAccessSection` returns `none`,
and `um-pf-01` / `um-pf-02` get `403` where they expect `200`.

`um-pf-03` and `um-pf-04` (the `409` duplicate-key cases) also currently
reach the action only because the guard lets `'Bob'` through; under the real
adapter they `403` before the `409` logic runs.

**Consequence for the adoption slice.** Its own Stage-2 E2E must seed **real
users with real `Relationship` rows** — a viewer with a `direct` edge to the
target for the manager-write cases, a `people_partner` edge for the PP cases,
the viewer id equal to the target id for Self, and an unrelated active user
for the colleague-deny case — and issue `Bearer <token:<uuid>>` with seeded
UUIDs, which `InterimSessionResolverAdapter` already accepts unchanged
(`interim-session-resolver.adapter.ts:48`, `{ userId: persona }`). The
existing `profile.e2e-spec.ts` is **not** rewritten by the adoption slice
beyond what is necessary to keep it green; whether those four cases move to
real personas or the suite's scope note is tightened is a call for the
adoption slice's scenario stage. Either way, the adoption E2E is the
real-consumer HTTP → router → session → AccessControl → PostgreSQL gate AD-3
requires (`architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md:96`),
with no provider overrides.

---

## What changes on the Access Control side

1. **`spec-access-control-audience-foundation/SPEC.md` Open Questions** — the
   single open question ("Which User Management-owned endpoint and exact
   response contract will consume the facade?") gets a resolved-pointer to
   this response and to
   `spec-user-management-access-control-adoption/SPEC.md`. The foundation
   moves from "design-ready, awaiting owner" to "answered; adoption owned by
   the new package."
2. **`spec-access-control-facade-audience-resolution/SPEC.md`** — the
   constraint that it "needs an explicit User Management-owned HTTP consumer
   and response contract before Stage-1/Stage-2" gets a resolved-pointer;
   the slice stays gated behind its own scenario suite but is no longer
   blocked on an *unanswered* contract.
3. **`architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`
   Decision Register** — the row "User Management consumer contract and HTTP
   mapping → Defer to the separate User Management-owned integration story"
   is repointed at `spec-user-management-access-control-adoption`. No other
   change to that spine.
4. **`docs/architecture/access-control.md`** — a short subsection near the
   denial conventions describes the adoption seam (the port binding) and
   points at the per-route mapping in the adoption SPEC. The existing
   "consumer contract" deferral language stays accurate — it is now pointed,
   not open-ended.
5. **Whether a new kernel seed story is triggered** — **yes, if the human
   picks Q3 option (a).** Access Control adds `user-management:edit` (and
   possibly a photo permission) to the bootstrap catalog through a new
   three-stage AD-1 sequence in the kernel package before the adoption
   slice's write path can be dual-gated. If the human picks option (b), no
   kernel change; the adoption slice adopts `READ` only and records the
   write-path expiry trigger.
6. **No Access Control code, test, or seed changes are authorized by this
   document.** The kernel's `approvals.yaml` is untouched. This is a
   planning answer; every stage still needs its own human approval.
