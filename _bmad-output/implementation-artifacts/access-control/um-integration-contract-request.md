---
title: 'Access Control → User Management — integration contract request'
type: 'handoff'
created: '2026-08-30'
updated: '2026-08-30'
revision: 2
status: 'awaiting-user-management-owner'
blocks:
  - ACF-1 gate (FAIL — see https://github.com/altexsoft-dmytro-novyk/workplace/blob/c342138/_bmad-output/test-artifacts/gate-decision.json at c342138)
  - spec-access-control-facade-audience-resolution (whole slice)
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md'
  - '{project-root}/docs/architecture/access-control.md'
---

# Integration contract request — adopting the Access Control facade

**To:** the User Management owner. **From:** Access Control.

> **Answered — see `um-integration-contract-response.md` (Revised 2026-09-01).** This is the *request*; the authoritative answers are in the response doc. In particular, the "colleague answer has a shelf life" / "two-state rule" framing in §3 and §4 below was **not** taken: a colleague `GET /users/:id` returns the S1 identity card (`200`) from adoption Story 0.1 (§3.2 S1 = `R` for Colleague), empty audience → `403`, unresolved session → `401` (no leak-free `404`), and `UMAC-3` does not exist. Read §3/§4/§6 below as the original suggestion, not the contract.

**Revision 2 (2026-08-30).** The Phase-0 resolver now exists and is green, and building it corrected two of the questions this document originally asked. Question 1 was framed around a route when the real seam is a provider binding that serves three routes at once, and question 3 asked for one answer when it needs one per feature. Both are rewritten below. The practical effect is that the ask got **narrower and cheaper**: exactly one feature changes behaviour, two keep theirs, and your existing test suite keeps passing.

## What already exists on the Access Control side

`services/backend/src/access-control/` — a hexagonal context exposing `AccessControlFacade.resolveAudiences(viewerId, employeeIds)`. It resolves the Phase-0 columns live from `Relationship` rows: Self (evaluated first, exclusive), Reporting line (recursive walk over `direct` edges), the directly assigned People Partner, and Colleague as the floor. Nothing derived is stored or cached.

Evidence, on real PostgreSQL: 9/9 HTTP E2E, 13/13 unit, migration applies from scratch, and each of the six database constraints was proven to reject its violation. Mutation checks confirm the negatives bite — flipping `colleague` to `reporting` fails exactly the three denial scenarios; dropping the `isActive` join fails exactly the broken-edge one.

Two things it deliberately is **not**: it is not wired into `AppModule`, so production behaviour is unchanged; and its story gate is **FAIL**, on three counts — no human AD-1 approval, the provisional mapping in question 3 below, and that dormant wiring. The first is ours to fix. The other two are what this document asks you to resolve.

## Why this is blocking

AD-2 gives User Management sole ownership of route shape, guards, adapters, and response projection. AD-3 forbids Access Control from inventing a route, a response shape, or resolver-only evidence. Meanwhile `InterimAccessControlAdapter.isAllowedForTarget` returns `Boolean(userId)`, so **every authenticated session currently reads every full profile**, and `toUserResponse` spreads the whole `User` row. §7 names access-control correctness the primary quality attribute.

## What Access Control asks for — six answers

Each row carries a suggested answer. Confirming a suggestion is a complete answer; changing it is equally complete. Nothing here is applied until you respond.

### 1. The seam is a binding, not a route

`ACCESS_CONTROL_PORT` is bound once in `user-management.module.ts`, and `AccessControlGuard` routes **three** target-scoped handlers through it:

| Route | Feature |
| --- | --- |
| `GET /users/:id` | `READ_USER_FEATURE` |
| `PATCH /users/:id` | `EDIT_USER_FEATURE` |
| `PUT /users/:id/photo` | `UPLOAD_PHOTO_FEATURE` |

There is no way to adopt "just the read": whatever is bound answers for all three. **Suggested answer:** treat the binding as the seam and decide behaviour per feature (question 3), rather than nominating one endpoint.

### 2. Port shape — keep it, and own the adapter

**Suggested answer:** keep `isAllowedForTarget(userId, feature, targetUserId)` unchanged. It is already proven to work over the facade — the E2E suite wraps `resolveAudiences` behind exactly this signature — so no User Management call site changes.

**One ownership note:** the adapter should live in **your** context, not ours. An adapter written by Access Control would have to import `AccessControlPort` from `src/user-management/**`, a dependency pointing backwards across the boundary. That is why the E2E declares its adapter inside the test file rather than in `src/`. `AccessControlModule` is `@Global`, so on your side it is an import plus a two-line provider change.

### 3. Feature → audience mapping — three answers, not one

This is the one product-shaped decision Access Control cannot make for you, and it must be made **per feature**. An adapter that ignores its `feature` argument would hand every reporting-line manager and People Partner the right to `PATCH` a profile and replace its photo — a write path that §3.2 gates behind a dual check Phase 0 does not implement.

| Feature | Suggested answer | Reasoning |
| --- | --- | --- |
| `READ_USER_FEATURE` | `self`, `reporting`, `pp` → allow; `colleague` → deny | The only decision Phase 0 has grounds to make. |
| `EDIT_USER_FEATURE` | **keep the current interim behaviour**, with a comment saying so | A write needs a functional-role permission **and** a section write cell. Neither exists yet. |
| `UPLOAD_PHOTO_FEATURE` | same as edit | Same reason. |

**The colleague answer has a shelf life.** §3.3.4 says a colleague legitimately sees S1, dates only from S10, and the project name from S11. `colleague → deny` is correct *only while* `toUserResponse` returns the whole row, because allowing it would mean handing over every field. The durable answer is `colleague → allow, narrowed to the whitelist`. Please record it as a two-state rule with an explicit trigger — **deny until profile projection lands, then allow with the whitelist** — so the temporary state is not mistaken for the final one.

### 4. Denial convention — 403 stays, as a symptom

`AccessControlGuard` maps refusal to `ForbiddenException`. The Phase-1 suite's `404` leak-free convention covers a `—` cell or a hidden field; refusing a **whole profile** is not actually a documented case, because a colleague is not meant to be refused — they are meant to be narrowed.

**Suggested answer:** keep `403`, and record it as a temporary consequence of question 5 rather than as a settled convention, so it is not later hardened into tests as the intended behaviour.

### 5. Projection — later story, but say so out loud

**Suggested answer:** narrowing the payload is a separate, owner-run story. Until it lands, the adoption story should state explicitly that **an allowed read still returns every field — the route is audience-gated, not field-gated.** Without that sentence, the next reader will reasonably conclude the endpoint is permission-safe.

### 6. Wiring location — and a warning about your suite

**Suggested answer:** a User Management branch rebinds `ACCESS_CONTROL_PORT` and deletes `interim-access-control.adapter.ts`. Access Control opens no PR against `src/user-management/**`.

**Warning worth having before CI turns red:** the rebinding will break `test/user-management/profile.e2e-spec.ts` if the write path moves with it. That suite uses literal persona placeholders — its own comment says so — so `Bearer <token:Bob>` resolves to the string `'Bob'`, a user that does not exist. `Boolean('Bob')` is true, which is why `PATCH` returns 200 today. Under the real facade `'Bob'` has no relationship edge, resolves to `colleague`, and those tests get 403 where they expect 200.

Keeping `EDIT` and `UPLOAD` on interim behaviour (question 3) avoids this entirely for now. When the write path does move, those fixtures need real seeded users with real relationship rows.

## What Access Control commits to in return

- No file under `src/user-management/**`, no User Management module, and no frontend file is touched by us — including the interim session resolver. E2E persona tokens use seeded UUIDs (`Bearer <token:<uuid>>`), which the existing resolver already accepts unchanged.
- The facade stays Phase 0: Self, recursive Reporting, directly assigned PP, Colleague. Project line, Department, PP HR-line, functional permissions, the section matrix and overlays remain fail-closed and out of slice.
- Nothing derived is persisted or cached across requests.
- Once answers 1–3 exist, the provisional mapping in the scenario suite is replaced with the agreed one, and the ACF-1 gate is re-evaluated.

## What stays parked until this arrives

| Artifact | State |
| --- | --- |
| ACF-1 | Code-complete, green, gate **FAIL** on the three counts above. |
| `docs/test-cases/access-control-foundation/` | 8 scenarios, agent-authored, awaiting human AD-1 approval. |
| `docs/test-cases/access-control/` (171 draft files) | Committed as draft. 146 address section endpoints that do not exist; their approval cannot proceed. |
| `spec-access-control-facade-audience-resolution` | Unchanged, gated behind its own Stage-1/Stage-2 sequence. |

## Answering

A reply on the six items above is sufficient — no document is required from you. Access Control records the answers in the architecture spine (AD-3) and the foundation SPEC's Open Questions, then re-runs the gate.
