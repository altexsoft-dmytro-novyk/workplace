---
id: SPEC-user-management-access-control-adoption
status: approved
implementation_status: stage-3-authorized
authorized_by: 'Dmytro Novyk (Product Owner / Architect) — 2026-09-01'
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
> Management adoption of the Access Control facade. The SPEC itself and its
> Open Decisions are approved (Dmytro Novyk, Product Owner / Architect,
> 2026-09-01 — see the alignment proposal §8): decision (i) = option (a),
> (iii) = dedicated Epic 0, (iv) = Epic 2 owns the session resolver, (v) =
> photo Self-only, (vi) = no separate photo permission. `UMAC-1` Stage 1
> (scenarios) and Stage 2 (red tests) are approved in this package's
> `approvals.yaml`. Stage 3 (`UMAC-1-production`) is the next authorized
> dispatch. `UMAC-2` remains blocked on the kernel seed for
> `user-management:edit`. Every remaining stage still runs the AD-1 gate with
> independent human approval.

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
puts `/users/:id` reads and writes behind the real fail-closed facade. It also
ships the **minimal S1 identity-card projection** for `GET /users/:id` in
Story 0.1 (every resolved audience — `self`, `reporting`, `pp`, **or
`colleague`** — over an active target gets `200` with the same S1 card); the
*further* field/record narrowing (S10 dates-only, S11 project-name-only, S16
per-field visibility, S7/S8 flags, S1 derived-field immutability) stays in the
separately tracked FR-17 Profile Projection story.

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
    audience over the **active** target resolves to **any** of `self`,
    `reporting`, `pp`, **or `colleague`** (§3.2: the S1 identity-card row is
    `R` for the Colleague column, and every active authenticated viewer is at
    least a Colleague). All four audiences get `200` with the **same
    `{ data, canEdit }` envelope** — identical `data` (the S1 card), and
    `canEdit` per the dual gate (see CAP-3). Denial (revised 2026-09-01 by
    human product decision — no "leak-free 404"; standard REST codes): a
    request whose session does not resolve to an active `User` is **`401`**
    (the session layer's responsibility — the Epic 2 magic-link middleware
    enforces this; the interim resolver is lax, so some such requests
    currently reach the facade and must be denied there too). A request from
    an authenticated **active** viewer whose audience over the target is
    empty — which on this read route means the target is not an active
    `User` — is **`403`**. There is no `404` authorization branch on this
    route. `401` also covers a missing/invalid token.
    For `PATCH /users/:id` (`EDIT_USER_FEATURE`) and
    `PUT /users/:id/photo` (`UPLOAD_PHOTO_FEATURE`) the adapter applies the
    §2.2 dual gate — `AccessControlFacade.isAllowed(viewer, <edit permission
    key>) === true` **and** `AccessControlFacade.canAccessSection(viewer,
    'S1', target) === 'write'` — plus the §3.2 fn 1 constraint (manager,
    people partner, department never writable through S1; rejected in
    `EditUserAction`/`UpdateUserDto`, tested) plus the photo narrower rule
    (photo write is Self-only per FR-9 / DEC unless Product widens it).

- **CAP-3 — Minimal S1 identity-card projection + capability envelope (shipped in Story 0.1)**
  - **intent:** `GET /users/:id` returns the S1 identity card wrapped in the
    standard read envelope `{ data, canEdit }` — the same shape and fields for
    every audience on this route — and no more.
  - **success:** the `GET /users/:id` handler
    (`users.controller.ts` `findOne`) today serializes through `toUserResponse`
    (`services/backend/src/user-management/application/dtos/user.response.ts:10`),
    which spreads the whole `User` row (`return { ...user, companyJoinDate:
    ... }`). Story 0.1's production change routes that one handler through a
    new **S1-card DTO** wrapped in an envelope:
    ```
    { "data": {
        "id", "firstName", "lastName", "photo", "position", "country",
        "city", "workEmail", "workPhone", "birthDay", "birthMonth",
        "companyJoinDate" },
      "canEdit": <boolean> }
    ```
    `data` is exactly those 12 fields and no more. It **drops** the non-S1
    technical fields: `ttId` (AD-13 external identity — not S1), `isActive`
    (PRD: internal account/row-retention flag, "not exposed"), `customFields`
    (S16 — per-field visibility, not S1), `createdAt` and `createdBy` (audit;
    same reasoning that dropped `updatedAt`/`updatedBy` for lack of a named
    consumer). This is a **real, minimal projection**, not the deferred
    "Profile Projection" story. The S1 derived display fields — manager,
    people partner, department, mentor, current project(s) — come from other
    contexts and are **out of scope for this route** until those land; the
    response omits them and that is noted.
  - **`canEdit` — the honest answer to "would `PATCH /users/:id` on the S1
    identity fields succeed for this viewer".** It is `true` **iff**
    `AccessControlFacade.isAllowed(viewer, EDIT_USER_FEATURE) === true`
    **and** `AccessControlFacade.canAccessSection(viewer, 'S1', target) ===
    'write'` — the §2.2 dual gate, read-only, computed on the GET. It is a UI
    hint; the real enforcement stays on `PATCH` (UMAC-2). Because
    `user-management:edit` is **not yet seeded** (Open Decision (i) = option
    (a), pending), `isAllowed` fails closed and **`canEdit` is `false` for
    every viewer today**. It becomes `true` for `self` / `reporting` /
    `pp` viewers once the kernel-seed sequence for `user-management:edit`
    reaches `stage-3-production`; a `colleague` viewer's `canEdit` is always
    `false` (`canAccessSection` → `'read'`). Story 0.1 wires the computation;
    UMAC-2 makes it non-trivially true.
  - **the `{ data, canEdit }` envelope is the API convention for
    section/detail reads going forward.** Each readable section/resource is
    its own endpoint returning `{ data, canEdit }` (a later photo endpoint,
    the relationship endpoints, `GET /users/:id/leaves`, etc. each get their
    own envelope with their own `canEdit`). This SPEC establishes the shape
    on `GET /users/:id`; rolling it onto the other routes and into
    `api-conventions.md` is tracked as its own planning item
    (`deferred-work.md`). Lists and writer-echo responses are **not**
    enveloped by this slice.
  - **what stays deferred (FR-17 Profile Projection,
    `_bmad-output/implementation-artifacts/access-control/deferred-work.md`):**
    the S10 dates-only colleague view (own route `GET /users/:id/leaves`),
    the S11 project-name-only colleague view, S16 per-field custom-field
    visibility, S7/S8 record flags, and S1 derived-field immutability
    enforcement. That story calls the facade, only narrows its base section
    result, and owns serialization; this SPEC cross-references it and does
    not duplicate or absorb it. It is **no longer the trigger for a
    colleague `GET /users/:id`** — that works from Story 0.1.
  - **scope — the `GET /users/:id` handler only.** Story 0.1 introduces a
    dedicated S1-card response mapper for the `findOne` handler; it does
    **not** rewrite the shared `toUserResponse` in place. The other five
    `toUserResponse` call sites in `users.controller.ts` — `GET /users` list
    items, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`,
    `PUT /users/:id/photo` — are **untouched by this slice** and keep
    returning what they return today. List-response projection is Epic 1
    Story 1.5 / FR-15; the writer-echo responses on `POST`/`PATCH`/`DELETE`/
    photo are out of scope here. A Stage-2 assertion for this slice checks
    the `GET /users/:id` body shape and does not assert the other five.

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
    S1 write, direct-PP read and S1 write, **colleague read → `200` with the
    `{ data, canEdit }` envelope** (asserting `data` is exactly the 12 S1
    fields — `ttId`/`customFields`/`createdBy`/`createdAt`/`isActive` absent —
    and `canEdit` is `false`), the same envelope for self / reporting / pp
    with `canEdit` reflecting the dual gate (`false` today, no
    `user-management:edit` seeded), an unresolved session
    → `401` and an authenticated active viewer with an empty audience →
    `403`, the dual-gate write denial when the functional
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
- **A colleague `GET /users/:id` returns the S1 identity card (`200`), not
  `403`.** §3.2's S1 row is `R` for the Colleague column, and the matrix
  legend defines Colleague as "any authenticated employee holding none of the
  above roles" — so every active authenticated viewer is at least a Colleague
  and is entitled to S1. Story 0.1 ships the S1-card projection, so the
  colleague read is a positive outcome from the start. There is no
  "two-state" rule and no `UMAC-3` flip. The only `GET /users/:id` denials
  are: an unresolved session → `401` (session layer); an authenticated
  active viewer with an empty audience over the target → `403`.
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
  `/users/:id` reads and writes are audience-gated through the real facade
  and the response is the minimal S1 card (CAP-3), but the further
  field/record narrowing (FR-17: S10 dates-only, S11 name-only, S16
  per-field, S7/S8 flags, S1 derived-field immutability),
  list/filter/export/search
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

- The *further* field/record narrowing beyond the S1 card (the separate
  FR-17 Profile Projection story: S10 dates-only, S11 name-only, S16
  per-field visibility, S7/S8 flags, S1 derived-field immutability), and all
  list/filter/export/search projection. The minimal S1 identity-card
  projection for `GET /users/:id` **is** in scope — it ships in Story 0.1
  (CAP-3), and it is the **only** response body this slice changes: the
  `GET /users` list, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`,
  and `PUT /users/:id/photo` response bodies are unchanged.
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
`200` with `{ data, canEdit }` — `data` the **S1 identity card** (`id`,
`firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`,
`workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` —
`ttId`/`isActive`/`customFields`/`createdAt`/`createdBy` absent), `canEdit` the
read-only dual-gate hint (`false` for all until `user-management:edit` is
seeded) — for any active viewer over an active target —
`self`, `reporting`, `pp`, **or `colleague`** — a `401` when the session
does not resolve to an active `User`, and a `403` when an authenticated
active viewer's audience over the target is empty; `PATCH /users/:id` and
`PUT /users/:id/photo` are refused unless both the functional permission and
`write` S1 section access hold (once the permission exists); the
real-consumer HTTP → router → session → AccessControl → PostgreSQL E2E passes
with no provider overrides; and every stage carries an independent human
approval in this package's `approvals.yaml`. The read leak
(`isAllowedForTarget` returning `Boolean(userId)`) is closed. The *further*
FR-17 field/record narrowing and the broader access program remain
explicitly deferred.

## Open decisions — TAKEN 2026-09-01 (Dmytro Novyk, Product Owner / Architect)

All five are decided; recorded here and in the alignment proposal §8.

1. **Missing edit/photo permission — RESOLVED: option (a).** Access Control
   adds `user-management:edit` to the bootstrap catalog and grant via a new
   three-stage AD-1 sequence in the kernel package; the adoption slice's write
   path (CAP-2 write / Story 0.2) blocks on that sequence reaching
   `stage-3-production`. The read path (Story 0.1) is unaffected and proceeds
   now.
2. **Photo permission — RESOLVED: not separate.** Photo is covered by
   `user-management:edit`; §2.3 catalog names no distinct photo permission and
   none is added.
3. **Manager-writable photo — RESOLVED: Self-only.** A reporting-line manager
   or PP may not replace a report's photo (FR-9).
4. **RESOLVED 2026-09-01 — colleague gets the S1 card in Story 0.1.** The
   colleague `GET /users/:id` read is `200` with the S1 identity card from
   Story 0.1 (§3.2 S1 = `R` for Colleague). The FR-17 Profile Projection story
   still owns the narrower colleague views: the S10 dates-only view (its own
   route `GET /users/:id/leaves`), the S11 project-name-only view, and S16
   per-field custom-field visibility — these remain FR-17's.
5. **Sequencing against UM Epic 1 / Epic 4 — RESOLVED.** Dedicated Epic 0,
   sequenced before Epic 1's write paths; its read path (Story 0.1) starts now.
   Story 1.2's authorization ACs are satisfied by Epic 0 (Story 1.2 asserts
   data correctness only). PP *read/resolution* is available now; the PP write
   path stays blocked by CC-07 (journal schema) per AD-19.
