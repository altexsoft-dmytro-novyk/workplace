# Epic 0 Context: Access Control Adoption

<!-- Regenerated 2026-09-01 from epics.md v1.5 — NEW epic; NOT an AD-1 approval. -->

> **This epic is contracted elsewhere.** The authoritative, binding contract for
> Epic 0 is the SPEC package
> `_bmad-output/specs/spec-user-management-access-control-adoption/` — `SPEC.md`
> (capabilities CAP-1..CAP-4, constraints, open decisions), `stories.yaml`
> (the AD-1 three-stage dispatch entries `UMAC-1`, `UMAC-2`; `UMAC-3` removed
> 2026-09-01), and
> `.memlog.md`. No separate compiled per-story spec is generated for Epic 0 —
> that would fork the contract. This file is a pointer plus the epic-level
> summary the sprint tracker and the other epic contexts cross-reference.

## Goal

The Access Control Kernel MVP is built and headless: `AppModule` resolves
`AccessControlFacade` (ACM-8), but `user-management.module.ts` still binds
`ACCESS_CONTROL_PORT` to `InterimAccessControlAdapter`, which authorizes
`isAllowedForTarget` as `Boolean(userId)` — every authenticated session reads
every full `User` profile — and authorizes the no-target `isAllowed` by an
`actor.position === 'HR Admin'` string check that `access-control.md` and AD-4
prohibit. Epic 0 rebinds the port to a real facade-backed adapter in
`src/user-management/infrastructure/`, deletes the interim adapter in the same
cutover (AD-21, no dual-running), and puts `GET /users/:id`, `PATCH /users/:id`,
and `PUT /users/:id/photo` behind the real fail-closed facade.

It is a **dedicated small epic**, not a story under Epic 1, because it is a
cross-cutting port-rebind cutover touching the same controller as Epic 1
Story 1.2 and needs its own real-consumer HTTP → router → session →
AccessControl → PostgreSQL E2E with no provider overrides (AD-3).

## Stories (mirror `stories.yaml`)

- **Story 0.1 — Adopt the Read Path, Rebind the Port, Ship the S1-card DTO
  (UMAC-1).** CAP-1 + the read half of CAP-2 + CAP-3 (the minimal S1
  identity-card projection) + the CAP-4 read E2E. `GET /users/:id` → `200` with
  the **S1 identity card** for **any non-empty audience** (`self` / `reporting` /
  `pp` / `colleague` — §3.2's S1 row is `R` for the Colleague column, and every
  active authenticated viewer is at least a Colleague); the only denial is an
  **empty audience set** → leak-free `404`. Story 0.1 routes `GET /users/:id`
  through an S1-card DTO — a dedicated mapper on that handler only, **not** a
  rewrite of the shared `toUserResponse` (the list / `POST` / `PATCH` /
  `DELETE` / photo response bodies are unchanged) — returning `id`, `firstName`,
  `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`,
  `birthDay`, `birthMonth`, `companyJoinDate`; drops `ttId`, `isActive`, `customFields`,
  `createdAt`, `createdBy`). **Can start now** — ACM-8 made the facade
  DI-resolvable, so this is a UM-module-only change.
- **Story 0.2 — Adopt the Write Path Dual Gate (UMAC-2). CONDITIONAL.** The §2.2
  dual gate for `PATCH`/`PUT photo`: `isAllowed(viewer, <edit permission key>)`
  **and** `canAccessSection(viewer, 'S1', target) === 'write'`, plus the §3.2
  fn 1 rejection of manager/PP/department fields, plus photo Self-only.
  **Blocked** on Open Decision 1 — no `user-management:edit` (and no photo)
  permission is seeded. Option (a): a new three-stage AD-1 seed sequence in the
  Access Control kernel package adds it first. Option (b): a narrow `// INTERIM`
  rule in the real adapter with a recorded expiry trigger.
- **Story 0.3 — REMOVED (2026-09-01, human product decision).** There is nothing
  to flip: §3.2's S1 row is `R` for the Colleague column, so a colleague reads
  the S1 identity card from Story 0.1. The deferred FR-17 Profile Projection
  story owns only the S10 dates-only / S11 name-only / S16 per-field colleague
  views on their own surfaces (plus S7/S8 flags and S1 derived-field
  immutability) and is decoupled from `GET /users/:id`.

## Requirements & Constraints (epic-level; full set in `SPEC.md`)

- **AD-2 ownership.** Access Control provides the facade only. User Management
  owns the route shape, the guards, the `ACCESS_CONTROL_PORT` binding, the
  adapter, and the response projection. Access Control opens no PR into
  `src/user-management/**`; the new adapter imports `AccessControlFacade`
  forwards across the boundary.
- **Actions never inject ports (AD-2 amended, `nestjs-di-tokens.md`).** Only
  `application/guards/AccessControlGuard` consumes `ACCESS_CONTROL_PORT`. No
  action, domain service, or controller injects `AccessControlFacade` directly.
  The new adapter is an `infrastructure/` file bound by the token in module
  wiring.
- **AD-21 cutover.** `interim-access-control.adapter.ts` is deleted in the same
  change that binds the real adapter — no dual-running, no compatibility alias.
- **A colleague `GET /users/:id` returns the S1 identity card (`200`).** §3.2's
  S1 row is `R` for the Colleague column and every active authenticated viewer is
  at least a Colleague. Story 0.1 ships the S1-card projection, so the colleague
  read is a positive outcome from the start — there is no "two-state" rule and no
  `UMAC-3` flip. Denial convention: the **only** `GET /users/:id` denial is an
  empty audience set → leak-free `404`
  (`um-integration-contract-response.md` Q4). `AccessControlGuard` maps
  `isAllowedForTarget` denials to `403`, so the `404` needs a controller-level
  decision (treat an empty audience / missing target as `NotFound`) — surface
  for the human at the scenario stage if it cannot be expressed without a guard
  change.
- **CC-07 does not block Epic 0.** The facade *reads* `Relationship
  type='people_partner'` to resolve the PP audience; reading is fine. CC-07
  blocks Epic 4's PP/journal write path, not this slice.
- **Interim *session* resolver is out of scope** — retired by Epic 2. Epic 0
  keeps it and uses the `Bearer <token:<seeded-uuid>>` convention for fixtures.
- **`services/backend` only at code stages.** No `prisma/schema.prisma`,
  migration, or `seed.ts` change belongs to Epic 0 — any FR-permission seed
  change is the Access Control kernel package's (option (a)).

## Cross-epic dependencies

- **ACM-8 done → Story 0.1 unblocked** (facade DI-resolvable from `AppModule`).
- **Story 0.2 → missing-`user-management:edit`-permission decision → (option a)
  a new Access Control kernel seed AD-1 sequence.**
- **Story 0.3 removed 2026-09-01** — no dependency on the deferred Profile
  Projection story; the colleague read is Story 0.1's S1 card.
- Epic 0 satisfies **Epic 1 Story 1.2's authorization ACs** (Story 1.2 asserts
  data correctness; Epic 0 asserts entitlement).
- The existing `profile.e2e-spec.ts` `Bearer <token:Bob>` literal placeholders
  break under the real facade (`'Bob'` → non-existent user → empty audience →
  leak-free `404`); whether `um-pf-01..04` move to real personas or the suite's scope note
  tightens is a call for Story 0.1's scenario stage — surfaced for the human,
  not silently rewritten.

## AD-1 gate

Three distinct dispatches per story — scenario prose (human-approved), then
committed-red real-consumer HTTP E2E (human-approved), then production — each
`author != approver`, each recorded in this package's `approvals.yaml` (created
on the first approval; it does not exist yet). The validation-only evidence
exception does **not** apply — every capability changes production code.
Scenario docs live under `docs/test-cases/user-management/access-control-adoption/`.
