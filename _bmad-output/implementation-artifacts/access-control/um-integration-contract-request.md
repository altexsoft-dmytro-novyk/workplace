---
title: 'Access Control → User Management — integration contract request'
type: 'handoff'
created: '2026-08-30'
status: 'awaiting-user-management-owner'
blocks:
  - ACF-1 (Resolve Phase-0 Audiences)
  - spec-access-control-audience-foundation stage-1 and stage-2
  - spec-access-control-facade-audience-resolution (whole slice)
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md'
  - '{project-root}/docs/architecture/access-control.md'
---

# Integration contract request — `GET /users/:id`

**To:** the User Management owner. **From:** Access Control. **Decision recorded 2026-08-30:** Access Control waits for this contract rather than inventing one or shipping a documented AD-3 deviation. No Access Control production code starts until the six answers below exist.

## Why this is blocking

AD-2 gives User Management sole ownership of route shape, guards, adapters, and response projection. AD-3 forbids Access Control from inventing a route, a response shape, or resolver-only evidence. `GET /users/:id` is the narrowest existing consumer: it already carries `@RequireFeatureForTarget(READ_USER_FEATURE)` and calls `AccessControlPort.isAllowedForTarget`, but that port is bound to `InterimAccessControlAdapter`, whose target check is `Boolean(userId)`.

Two consequences follow, and both need this contract to resolve:

1. **Today every authenticated session reads every full profile.** `isAllowedForTarget` returns true for any non-empty user id, and `toUserResponse` spreads the whole `User` row. §7 names access-control correctness the primary quality attribute; that attribute is currently unenforced on the only target-scoped route that exists.
2. **Phase-0 audiences have no observable HTTP effect until the mapping below is chosen.** Colleague is the fallback for every authenticated viewer, so "an audience resolved" is always true. Without an owner-approved rule about *which* audiences may read a profile, an E2E test on this route proves nothing — which is why Access Control is not writing one.

## What Access Control asks for — six answers

Each row carries a suggested answer. Confirming a suggestion is a complete answer; changing it is equally complete. Nothing here is applied until the owner responds.

| # | Question | Suggested answer |
| --- | --- | --- |
| 1 | **Seam.** Is `GET /users/:id` the endpoint that adopts the facade first? | Yes — smallest existing target-scoped route; `PATCH /users/:id` and `PUT /users/:id/photo` follow in the same owner-run story. |
| 2 | **Port shape.** Does `AccessControlPort` keep `isAllowedForTarget(userId, feature, targetUserId)`, or move to the facade contract (`resolveAudiences` / `canAccessSection`)? | Keep the existing signature for the first adoption; Access Control implements it internally over `resolveAudiences`. No User Management call site changes. |
| 3 | **Feature → audience mapping.** Which resolved audiences satisfy `READ_USER_FEATURE` on a target? | Phase 0: `self`, `reporting`, `pp` allow; `colleague` denies at this route (the colleague whitelist is a projection concern, not a full-profile read). This is the one product-shaped decision Access Control cannot make. |
| 4 | **Denial convention.** `AccessControlGuard` currently throws `ForbiddenException` (403). The scenario suite specifies `404` leak-free for a `—` cell. Who changes it, and when? | User Management, in the same adoption story. Access Control's facade returns the decision; it never maps status codes. |
| 5 | **Projection.** `toUserResponse` returns the whole `User`. Does the adoption story also narrow the payload, or is that a later story? | Later, owner-run story — but until it lands, an allowed read still returns every field, so the adoption story should say so explicitly rather than imply the route is permission-safe. |
| 6 | **Wiring location.** Which branch/commit rebinds `ACCESS_CONTROL_PORT` in `user-management.module.ts` and deletes `interim-access-control.adapter.ts`? | A User Management branch, after Access Control publishes the facade module. Access Control opens no PR against `src/user-management/**`. |

## What Access Control commits to in return

- No file under `src/user-management/**`, no `*.module.ts` of User Management, and no frontend file is touched by ACF-1 — including the interim session resolver. E2E persona tokens use seeded UUIDs (`Bearer <token:<uuid>>`), which the existing resolver already accepts unchanged.
- The facade ships as `src/access-control/{domain,application,infrastructure}` exposing `resolveAudiences(viewerId, employeeIds)` for Phase 0: Self (exclusive), recursive `Relationship type='direct'` Reporting line, directly assigned `people_partner`, Colleague fallback. Project line, Department, PP HR-line, functional permissions, section matrix, and overlays stay fail-closed and out of the slice.
- Nothing derived is persisted or cached across requests.
- Once answers 1–3 exist, Access Control authors the Stage-1 scenarios against the agreed route and stops for independent human approval, then translates them to red E2E and stops again (AD-1, no self-certification).

## What stays parked until this arrives

| Artifact | State |
| --- | --- |
| ACF-1 | Not started. Blocked on answers 1–3. |
| `docs/test-cases/access-control-foundation/` | Not authored. The 8 foundation scenarios need the agreed route and denial convention to be HTTP-shaped. |
| `docs/test-cases/access-control/` (171 draft files) | Committed as draft, unapproved. 146 of them address 20+ section endpoints that do not exist; their AD-1 approval cannot proceed. |
| `spec-access-control-facade-audience-resolution` | Unchanged, gated behind its own Stage-1/Stage-2 sequence. |

## Answering

A reply on the six rows above is sufficient — no document is required from the owner. Access Control records the answers in `_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md` (AD-3) and in the foundation SPEC's Open Questions, then resumes at Stage 1.
