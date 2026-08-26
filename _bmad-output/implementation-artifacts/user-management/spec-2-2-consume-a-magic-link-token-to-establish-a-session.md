---
title: 'Story 2.2: Consume a Magic-Link Token to Establish a Session'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-2-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2.1 can mint and dispatch a magic-link token, but nothing yet turns that token into a usable session — without this story, an employee can request a link but never actually log in, and no other epic's protected endpoints have anything to authenticate against. This story is also the other half of Story 1.1's "registration does not auto-login" contract (AC3): creating an account and logging into it are separate acts, and this story is what proves the second one exists independently of the first.

**Approach:** `POST /auth/magic-link/consume` accepts a token value, looks it up against the entity Story 2.1 minted, and — if it's found, unexpired, and not already consumed — marks it consumed and returns a session/access token scoped to the owning user. Any other case (not found, expired, already consumed) returns `401` with no session token anywhere in the body; the three failure shapes need not be distinguished from each other in the response (single generic denial), only from the success case.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `docs/test-cases/user-management/auth/um-auth-03-consume-magic-link-success.md`, `um-auth-04-consume-expired-token-denied.md`, and `um-auth-05-consume-token-single-use.md` approved, then write/extend a failing E2E test, then implement to green — never code before a red E2E test exists.
- A consumed token is single-use: the same token value, submitted again by anyone, is denied — enforced by real persisted state (marking `consumedAt` or equivalent), not by an in-memory/session-local guard.
- The session token returned on success must actually authenticate on a genuine follow-up authenticated request (e.g. `GET /users/<id>`) — per `testing-strategy.md`, authentication is never faked in E2E, so this path must be real end to end, not stubbed for the test.
- No session/access token appears anywhere in the body on either failure path (expired, already-consumed).
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.

**Ask First:**
- Same open items as Story 2.1: bounded-context placement (`user-management` vs. a new `auth` context) and the token entity's exact schema shape, both flagged in `epic-2-context.md`'s Ask First section. Both stories share the same entity/service, so this only needs resolving once — coordinate with whoever picks it up first.
- The exact session/access-token mechanism (JWT vs. opaque + lookup, TTL, refresh) is not specified anywhere in the source material for this story — confirm the approach with the architect rather than inventing one; `epic-2-context.md` notes only that Story 1.1 deferred "real session issuance" to this epic, not what it should look like.

**Never:**
- Never let an expired or already-consumed token produce a `200` or leak a session token in a `401` body.
- Never implement token replay-prevention as a soft/advisory check (e.g. a TTL-only guard) — a consumed token must be rejected even while still inside its expiry window.
- Never touch Epic 1's `/users` files — this story owns its own resource, sharing only the `/auth` controller file with Story 2.1.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Success | Unauthenticated, valid unexpired token for Alice | `200`, body includes a session/access token scoped to Alice; a follow-up `GET /users/<aliceId>` with that token succeeds `200` | N/A |
| Expired token | Unauthenticated, token whose TTL has elapsed | N/A | `401`, no session token in body |
| Already-consumed token (replay) | Unauthenticated, token previously consumed once (by anyone) | N/A | `401`, no session token in body |

</frozen-after-approval>

## Code Map

- `services/backend/src/user-management/domain/entities/magic-link-token.entity.ts` -- SHARED with Story 2.1 (same entity: expiry check + `consume()` intention-revealing method live here, not as inline field mutation elsewhere)
- `services/backend/src/user-management/domain/interfaces/session-resolver.port.ts` -- EXISTS (Story 1.1, `{ resolve(authHeader): Session | null }`, currently faked only) — this story supplies the first real adapter behind it
- `services/backend/src/user-management/domain/services/consume-magic-link.service.ts` -- NEW: lookup + expiry/single-use invariant + session-token issuance
- `services/backend/src/user-management/application/dtos/consume-magic-link.dto.ts` -- NEW: `{ token }`
- `services/backend/src/user-management/application/controllers/auth.controller.ts` -- SHARED with Story 2.1: adds `POST /auth/magic-link/consume` alongside `POST /auth/magic-link`
- `services/backend/src/user-management/application/actions/consume-magic-link.action.ts` -- NEW
- `services/backend/src/user-management/infrastructure/magic-link-token.repository.ts` -- SHARED with Story 2.1 (mint in 2.1, mark-consumed lookup here)
- `services/backend/src/user-management/infrastructure/session.adapter.ts` -- NEW: real adapter for `session-resolver.port.ts` (mechanism itself is an Ask First item above)
- `services/backend/test/user-management/auth.e2e-spec.ts` -- **EXISTS on backend branch `user-management` (commit 865df5f) — reconcile/extend, do not recreate.** Covers `um-auth-03/04/05` for this story (`um-auth-01/02` belong to Story 2.1). Fixes needed for this story's three cases specifically (see `epic-2-context.md` Cross-Story Dependencies for full detail):
  - `createUser` helper calls `POST /users` instead of `prisma.user.create(...)` directly — same fix as Story 2.1, shared helper.
  - None of `um-auth-03/04/05` call `POST /auth/magic-link` to mint a real token for the user each block creates before consuming it — they submit a disconnected literal placeholder straight to `/consume`. Needs a real chained request plus a way to read the minted token's actual value back (via the email-adapter fake's captured call, or a direct `prisma` read on the token table — both patterns already exist elsewhere in this suite/`registration.e2e-spec.ts`).
  - `um-auth-04`'s scenario doc calls for an explicit **stateChange** step (backdating a real issued token's `expiresAt` directly via `prisma`, since no endpoint can represent the passage of time) — absent from the current test entirely; needs adding once a real token row exists to backdate.
  - `um-auth-05` reuses the exact same literal token string as `um-auth-03`; once real per-token persistence replaces the placeholder, each block needs its own distinct minted token to avoid one block's consumption interfering with another's "first consumption succeeds" baseline step.

## Tasks & Acceptance

**Execution:**
- [ ] Get `um-auth-03/04/05` re-approved if their wording changes as part of the architect's context/schema/session-mechanism decisions -- AD-1 stage 1 (already drafted, pending approval; don't self-approve — real human checkpoint)
- [ ] Fix and extend `test/user-management/auth.e2e-spec.ts` for `um-auth-03/04/05` per the Code Map fixes above -- AD-1 stage 2, committed red before any of the below
- [ ] `domain/**` -- consume service (expiry + single-use invariants on the shared token entity), session-resolver port real adapter
- [ ] `infrastructure/**` -- token repository consume-path methods, real session adapter
- [ ] `application/**` + module wiring -- `POST /auth/magic-link/consume` added to the shared auth controller, DTO, action
- [ ] Wire the new real `session-resolver.port.ts` adapter into module providers, replacing the Story-1.1-era fake as the default (test modules keep overriding as needed per AD-3)

**Acceptance Criteria:**
- Given `um-auth-03/04/05`, when `npm run test:e2e` runs, then all three pass with no real network calls and no dependency on test execution order
- Given a freshly consumed token, when the identical token value is submitted again, then the response is `401` with no session token in the body
- Given the session token returned by a successful consume, when it's used on `GET /users/<id>` for that same user, then the response is `200`

## Design Notes

Treat "expired" and "already consumed" as two branches of the same denial path in the service (both end in `401`, both omit any session token), but keep the underlying checks distinct and ordered deliberately (e.g. not-found/consumed before expiry, or whichever the architect confirms) rather than collapsing them into one combined boolean — a future story that needs to distinguish the two server-side (e.g. for a "your link expired, request a new one" UX message) shouldn't have to un-collapse this later. The HTTP-visible response, however, stays undifferentiated per the I/O matrix above.

## Verification

**Commands:**
- `npm run test:e2e` -- `user-management/auth` specs (`um-auth-03`, `um-auth-04`, `um-auth-05`) pass
- `npm run build` -- no TS errors
- `npm run lint` -- clean
