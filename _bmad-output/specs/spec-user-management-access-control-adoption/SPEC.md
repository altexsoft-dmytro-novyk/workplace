---
id: SPEC-user-management-access-control-adoption
status: draft
implementation_status: not-authorized
companions:
  - stories.yaml
  - .memlog.md
  - ../../implementation-artifacts/access-control/um-integration-contract-response.md
  - ../../implementation-artifacts/access-control/um-integration-contract-request.md
  - ../../implementation-artifacts/access-control/deferred-work.md
  - ../../planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md
  - ../../planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - ../spec-access-control-kernel-mvp/SPEC.md
  - ../spec-access-control-facade-audience-resolution/SPEC.md
  - ../spec-access-control-audience-foundation/SPEC.md
  - ../../../docs/architecture/access-control.md
  - ../../../docs/architecture/api-conventions.md
  - ../../../docs/architecture/domain-driven-design.md
  - ../../../docs/architecture/nestjs-di-tokens.md
  - ../../../docs/architecture/testing-strategy.md
  - ../../../docs/architecture/user-management-test-decisions.md
sources:
  - ../../implementation-artifacts/access-control/um-integration-contract-request.md
  - ../../implementation-artifacts/access-control/um-integration-contract-response.md
---

> **Canonical contract.** This SPEC and its companions define the User
> Management adoption of the Access Control facade. It authorizes no
> scenario, test, or production code: every capability below still runs the
> full AD-1 three-stage gate with independent human approval, recorded in
> this package's own `approvals.yaml` when it exists. Nothing here is
> approved.

# User Management — Access Control Adoption

## Why

The Access Control Kernel MVP is built and headless: `AppModule` resolves
`AccessControlFacade` (ACM-8), but
`services/backend/src/user-management/user-management.module.ts:36` still
binds `ACCESS_CONTROL_PORT` to `InterimAccessControlAdapter`. That adapter
authorizes `isAllowedForTarget` as `Boolean(userId)`
(`services/backend/src/user-management/infrastructure/interim-access-control.adapter.ts:37`),
so **every authenticated session reads every full `User` profile**, and it
authorizes `isAllowed` by `actor.position === 'HR Admin'` — a role-name
check `access-control.md:49` prohibits. The Kernel SPEC's non-goals
explicitly park this: *"A later User Management-owned package must define the
consumer contract, production port rebinding, projection, route mapping, and
real-consumer HTTP E2E."* This is that package. It closes the read leak and
puts `/users/:id` reads and writes behind the real fail-closed facade, while
leaving field-level projection to its own separately tracked story.

## Capabilities

- **CAP-1 — Production `ACCESS_CONTROL_PORT` rebind (AD-21 cutover)**
  - **intent:** The production `AppModule` container authorizes
    `/users/:id` target-scoped access through a real facade-backed adapter
    owned by User Management, with the interim adapter gone.
  - **success:** `user-management.module.ts` binds `ACCESS_CONTROL_PORT` to a
    new `@Injectable()` adapter under
    `services/backend/src/user-management/infrastructure/` that injects
    `AccessControlFacade` (exported by the `@Global` `AccessControlModule`)
    and implements both `AccessControlPort` methods.
    `interim-access-control.adapter.ts` is **deleted in the same change** —
    no dual-running, no compatibility alias (AD-21). `isAllowed(userId,
    feature)` delegates directly to `AccessControlFacade.isAllowed`; the
    three no-target features in use (`user-management:create`,
    `user-management:deactivate`, `user-management:list`) are exactly the
    keys ACM-1 seeds, so `POST /users`, `DELETE /users/:id`, and
    `GET /users` keep working for the seeded HR-Admin session and fail
    closed otherwise. No `AccessControlPort` signature changes; no
    `AccessControlGuard` change; Access Control opens no PR into
    `src/user-management/**`.

- **CAP-2 — Per-route feature → audience/section mapping**
  - **intent:** Each target-scoped `/users/:id` route enforces the feature
    behaviour agreed in `um-integration-contract-response.md` Q3, through the
    existing `AccessControlGuard` and the new adapter's `feature` branch.
  - **success:** For `GET /users/:id` (`READ_USER_FEATURE` =
    `user-management:read`) the adapter allows a viewer whose Phase-0
    audience over the target is `self`, `reporting`, or `pp`; denies
    `colleague` **until the Profile Projection story lands, then allows
    `colleague` with the response narrowed to the §3.3.4 whitelist** (the
    two-state rule, with the explicit projection trigger recorded); denies an
    empty audience set. For `PATCH /users/:id` (`EDIT_USER_FEATURE`) and
    `PUT /users/:id/photo` (`UPLOAD_PHOTO_FEATURE`) the adapter applies the
    §2.2 dual gate — `AccessControlFacade.isAllowed(viewer, <edit permission
    key>) === true` **and** `AccessControlFacade.canAccessSection(viewer,
    'S1', target) === 'write'` — plus the §3.2 fn 1 constraint (manager,
    people partner, department never writable through S1; rejected in
    `EditUserAction`/`UpdateUserDto`, tested) plus the photo narrower rule
    (photo write is Self-only per FR-9 / DEC unless Product widens it). A
    denied whole-profile read maps to `403`, recorded as a temporary
    consequence of CAP-3, not a settled convention.

- **CAP-3 — Profile projection boundary (reference only, not built here)**
  - **intent:** The reader knows exactly what this slice does **not** do:
    narrow the response body.
  - **success:** The SPEC and every CAP-2 scenario state that an *allowed*
    `GET /users/:id` returns **every `User` field** —
    `toUserResponse`
    (`services/backend/src/user-management/application/dtos/user.response.ts:10`)
    spreads the whole row — because the route is audience-gated, not
    field-gated. Field/record narrowing (S1 derived-field immutability,
    colleague S10/S11 subsets, S7/S8 flags, S16 visibility) is the separate
    UM-owned **Profile Projection** deliverable already split out in
    `_bmad-output/implementation-artifacts/access-control/deferred-work.md`.
    That story calls the facade, only narrows its base section result, and
    owns serialization; this SPEC cross-references it and does not duplicate
    or absorb it. Flipping the CAP-2 `colleague` decision from deny to
    allow-narrowed is the one coupling point, and it is triggered by that
    story reaching `stage-3-production`.

- **CAP-4 — Real-consumer HTTP E2E (AD-3 consumer rule)**
  - **intent:** The adoption is proven end to end the way AD-3 requires of a
    production consumer, not as kernel integration evidence.
  - **success:** A Stage-2 suite under
    `services/backend/test/user-management/` exercises real HTTP →
    NestJS router → `SessionGuard` → `AccessControlGuard` → real
    `AccessControlFacade` → real Prisma adapters → migrated PostgreSQL, with
    **no provider overrides** on the database, repositories, router,
    session, or the facade. Fixtures seed real `User` rows and real
    `Relationship` rows (`direct`, `people_partner`) and issue
    `Bearer <token:<seeded-uuid>>`, which `InterimSessionResolverAdapter`
    accepts unchanged. It covers: Self read/write, reporting-line read and
    S1 write, direct-PP read and S1 write, colleague read denied (temporary),
    empty-audience denied, the dual-gate write denial when the functional
    permission is absent, and the §3.2 fn 1 rejection of manager/PP/
    department fields through `PATCH`. Kernel Stage-2 evidence never
    substitutes for this gate.

## Constraints

- **AD-2 ownership.** Access Control provides the domain/application facade
  only. User Management alone owns the route shape, the guards, the
  `ACCESS_CONTROL_PORT` binding, the adapter, and the response projection.
  Access Control opens no PR into `src/user-management/**` and no frontend
  file is touched. The new adapter imports `AccessControlFacade` forwards
  across the boundary; Access Control never imports from
  `src/user-management/**`.
- **Actions never inject ports.** `application/actions/`,
  `application/controllers/`, and `domain/services/` must not `@Inject`
  `AccessControlFacade` or `ACCESS_CONTROL_PORT`. The only consumer of the
  token is `application/guards/AccessControlGuard` — the one sanctioned
  exception in `nestjs-di-tokens.md:63` / `domain-driven-design.md`. The new
  adapter is an `infrastructure/` file bound by the token in module wiring.
- **The dual gate is mandatory for every mutation** (§2.2,
  `access-control.md:163`): live FR permission **and** `write` section
  access, plus any narrower command rule. A read must not call `isAllowed`
  merely to convert a data-access denial into a feature denial
  (`facade-contract.md`).
- **The two-state colleague rule is a rule, not a bug.** `colleague → deny`
  on `GET /users/:id` is correct only while the response is the whole row.
  The scenario and test artifacts record the deny state as explicitly
  temporary, name the Profile Projection story as the trigger, and must not
  harden `colleague`-gets-`403` as intended end-state behaviour. The durable
  outcome is `200` with a §3.3.4-narrowed body.
- **Missing-edit-permission dependency (open — see Open decisions).** The
  seeded FR catalog is exactly `user-management:create`,
  `user-management:deactivate`, `user-management:list`
  (`access-control.md:55-58`, AD-4). There is no `user-management:edit` and
  no photo permission. The CAP-2 dual gate for `PATCH`/`PUT photo` cannot be
  completed until that permission exists. This SPEC does **not** pick a
  default: it records two options and defers to the human. Under option (a)
  the write-path capabilities of this SPEC are blocked on a new Access
  Control kernel seed AD-1 sequence; under option (b) this SPEC adopts
  `READ` only and records the write-path expiry trigger.
- **Interim *session* resolver replacement is explicitly out of scope and
  tracked separately.** `InterimSessionResolverAdapter`
  (`services/backend/src/user-management/infrastructure/interim-session-resolver.adapter.ts`)
  is retired by **UM Epic 2 (Magic-Link Authentication)**, not by this
  slice. This SPEC keeps the interim session resolver; its Stage-2 fixtures
  use the `Bearer <token:<uuid>>` seeded-UUID convention the interim
  resolver already supports. AD-21's "do not mark PP/departure/profile work
  done while the interim adapter can authorize target access" is about the
  **access-control** interim adapter (retired by CAP-1), not the session
  resolver.
- **This SPEC does not close the product gate by itself.** After it lands,
  `/users/:id` reads and writes are audience-gated through the real facade,
  but field-level projection (CAP-3 reference), list/filter/export/search
  projection (`deferred-work.md`), Project line, Department, PP HR-line,
  shared links, and full-profile overlay all remain out of scope and
  fail-closed. The `access-control.md` "Open product decisions" (full-profile
  column mapping, Self precedence) are untouched.
- **AD-1 unchanged.** Scenario prose (independently human-approved) → red
  Stage-2 E2E (independently human-approved, committed red) → production, one
  dispatch per stage, `author != approver`, recorded in this package's
  `approvals.yaml`. The validation-only evidence exception does not apply —
  every capability here changes production code.
- **`services/backend` only for code stages.** All test and production code
  lands in the `services/backend` submodule. `prisma/schema.prisma`,
  migrations, and `prisma/seed.ts` are **not** touched by this package —
  any FR-permission seed change belongs to the Access Control kernel package
  (option (a)).
- **AD-14 route shapes bind.** `GET /users/:id`, `PATCH /users/:id`,
  `PUT /users/:id/photo` are the only routes in scope, exactly as declared
  in `users.controller.ts`. No route is added, renamed, or removed. (The
  still-present `POST /users` and `DELETE /users/:id` are an AD-16/AD-21
  UM Epic 1 concern, not this slice's; this slice must not be blocked by
  them and must not remove them.)

## Non-goals

- Field/record projection for the profile response (the separate Profile
  Projection story), and all list/filter/export/search projection.
- Any change to `AccessControlPort`'s signatures, to `AccessControlGuard`,
  or to any Access Control file, test, seed, migration, or schema.
- Adding `user-management:edit` or a photo permission (Access Control kernel
  package owns any seed change — option (a)).
- Retiring `InterimSessionResolverAdapter` (UM Epic 2).
- Retiring `POST /users` / `DELETE /users/:id` (UM Epic 1 / AD-16 / AD-21).
- Project line, Department, PP HR-line, shared-link, or full-profile overlay
  audiences; AD-20 due/departure evaluation; the full-profile column-mapping
  decision.
- Frontend changes.

## Success signal

`user-management.module.ts` binds `ACCESS_CONTROL_PORT` to a real
facade-backed adapter in `src/user-management/infrastructure/`;
`interim-access-control.adapter.ts` is deleted; `GET /users/:id` returns
`200` (whole row) for Self / reporting / PP viewers and `403` for a
colleague or an unrelated session; `PATCH /users/:id` and
`PUT /users/:id/photo` are refused unless both the functional permission and
`write` S1 section access hold (once the permission exists); the
real-consumer HTTP → router → session → AccessControl → PostgreSQL E2E passes
with no provider overrides; and every stage carries an independent human
approval in this package's `approvals.yaml`. The read leak
(`isAllowedForTarget` returning `Boolean(userId)`) is closed. Field-level
projection and the broader access program remain explicitly deferred.

## Open decisions (for the human / Product Manager — not defaulted here)

1. **Missing edit/photo permission — option (a) or (b).**
   (a) Access Control adds `user-management:edit` (± a photo permission) to
   the bootstrap catalog and grant, via a new three-stage AD-1 sequence in
   the kernel package; the adoption slice's write path then blocks on it.
   (b) Adopt `READ` now; keep `EDIT`/`UPLOAD_PHOTO` on a narrow interim rule
   in the real adapter with a `// INTERIM` comment and an explicit expiry
   trigger. Response doc recommends (a); the call is the human's.
2. **Is photo a distinct permission or covered by `user-management:edit`?**
   §2.3 catalog does not name a photo permission. Recommendation: not
   separate — photo is Self-only by FR-9, so the functional half is "editing
   your own row." Confirm.
3. **May a manager (reporting / PP) replace a report's photo, or is photo
   strictly Self-only?** FR-9 says "Self can directly write only the photo."
   Recommendation: Self-only. Confirm before the CAP-2 photo scenario is
   authored.
4. **Colleague-narrowed read whitelist scope on `GET /users/:id`.** §3.3.4
   is S1 + S10 dates-only + S11 project-name-only; `GET /users/:id` carries
   S1 and inline S11 (S10 is its own route). Confirm the whitelist the
   Profile Projection story implements for this route.
5. **Sequencing against UM Epic 1 / Epic 4.** This slice touches the same
   controller as Story 1.2 (`PATCH /users/:id`) and depends on `Relationship`
   `direct` / `people_partner` rows existing as fixtures — the PP write path
   is blocked by CC-07 (journal schema) per AD-19, but PP *read/resolution*
   is not. Confirm where the adoption epic sequences relative to Epic 1
   Story 1.2 and Epic 4.
