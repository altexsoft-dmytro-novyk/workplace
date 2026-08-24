---
title: 'Story 2.1: Request a Magic Link by Work Email'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No login mechanism exists yet. Epic 1 can create a `User` row, but nothing lets that person start a session — and per FR-2, there is no password to check: a magic link sent to the person's `workEmail` is the entire login mechanism. `POST /auth/magic-link` is the first half of that: it accepts an email, and — without ever confirming or denying whether an account exists for it — dispatches a one-time link if one does.

**Approach:** New `/auth` root, own token entity/service, no shared files with Epic 1's `/users` resource (per `epic-2-context.md`). `POST /auth/magic-link` looks up the `User` by `workEmail`; on a match, mints a token (new entity — see `epic-2-context.md` Technical Decisions and its open Ask-First item on the exact schema) and dispatches it through an outbound port; on no match, does neither, but returns the exact same `200` body shape either way so the response itself carries no account-existence signal.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `docs/test-cases/user-management/auth/um-auth-01-request-magic-link-success.md` and `um-auth-02-request-magic-link-unknown-email.md` approved, then write/extend a failing E2E test, then implement to green — never code before a red E2E test exists.
- Identical `200` response body shape (e.g. `{ sent: true }`) for a matching and a non-matching email — no field, timing-observable branch, or status-code difference may reveal whether an account exists.
- No email is actually dispatched for a non-matching address — asserted against the email-adapter fake, not just inferred from the response body.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- No password/credential field anywhere in the request or response body.
- A dispatch failure (NFR-3) degrades gracefully — it must not crash the request or leak an account-existence signal through a differing status code or error body.

**Ask First:**
- The bounded-context placement question (`user-management` vs. a new `auth` context) and the token entity's exact schema shape are both open per `epic-2-context.md`'s Ask First section — confirm both with the architect before/at the start of this story's stage 1, don't decide either unilaterally.

**Never:**
- Never a different status code, body shape, or timing profile between "email matched" and "email did not match."
- Never touch Epic 1's `/users` files — this story owns its own resource.
- Never a live third-party email call in the E2E suite — the outbound dispatch port is rebound to a fixture-backed fake in the test module (AD-3).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Success — matching email | Unauthenticated, `email` matches an existing `User.workEmail` (e.g. Alice) | `200`, body confirms dispatch (e.g. `{ sent: true }`), no token/password field in body, dispatch port called once | N/A |
| Unknown email | Unauthenticated, `email` matches no `User.workEmail` | `200`, identical body shape to the success case | No email actually dispatched — dispatch port not called; asserted against the fake |

</frozen-after-approval>

## Code Map

- `services/backend/prisma/schema.prisma` -- add the new token model (exact shape pending architect confirmation, see Ask First / `epic-2-context.md`)
- `services/backend/prisma/migrations/` -- new migration for the token table
- `services/backend/src/user-management/domain/entities/magic-link-token.entity.ts` -- NEW (pending bounded-context confirmation — path assumes `user-management`, per the signal in `epic-2-context.md`; move if the architect says otherwise)
- `services/backend/src/user-management/domain/interfaces/magic-link-dispatcher.port.ts` -- EXISTS (Story 1.1, `{ dispatch(email): Promise<void> }`) — this story supplies the real adapter behind it; registration keeps using the same port for its own dispatch side effect
- `services/backend/src/user-management/domain/services/request-magic-link.service.ts` -- NEW: lookup-or-noop + token minting, account-enumeration-safe by construction (same code path either way, branching only on whether a dispatch happens)
- `services/backend/src/user-management/application/dtos/request-magic-link.dto.ts` -- NEW: `{ email }`
- `services/backend/src/user-management/application/controllers/auth.controller.ts` -- NEW: `POST /auth/magic-link` (shared with Story 2.2's `POST /auth/magic-link/consume`)
- `services/backend/src/user-management/application/actions/request-magic-link.action.ts` -- NEW
- `services/backend/src/user-management/infrastructure/magic-link-token.repository.ts` -- NEW: Prisma-backed
- `services/backend/src/user-management/infrastructure/email.adapter.ts` -- NEW: real adapter for `magic-link-dispatcher.port.ts`
- `services/backend/src/user-management/infrastructure/fakes/email.adapter.fake.ts` -- NEW: fixture-backed fake, bound only in the test module (AD-3), exposing dispatch call history so `um-auth-02`'s "not dispatched" assertion (and Story 2.2's token-capture, see its own Code Map) can read it
- `services/backend/test/user-management/auth.e2e-spec.ts` -- **EXISTS on backend branch `user-management` (commit 865df5f) — reconcile/extend, do not recreate.** Covers `um-auth-01` and `um-auth-02` for this story (`um-auth-03/04/05` belong to Story 2.2). Fixes needed for this story's two cases specifically:
  - `createUser` helper currently calls `POST /users` instead of seeding via `prisma.user.create(...)` directly — see `epic-2-context.md` Cross-Story Dependencies, point 1. Affects both `um-auth-01` and `um-auth-02`'s setup.
  - `um-auth-02`'s block asserts only `body.sent === true` — missing the required assertion against the email-adapter fake that zero dispatch calls occurred (`epic-2-context.md` Cross-Story Dependencies, point 2).

## Tasks & Acceptance

**Execution:**
- [ ] Get `um-auth-01`/`um-auth-02` re-approved if their wording changes as part of the architect's `/auth`-context and token-schema decisions -- AD-1 stage 1 (already drafted, pending approval; don't self-approve — real human checkpoint)
- [ ] Fix and extend `test/user-management/auth.e2e-spec.ts` for `um-auth-01`/`um-auth-02` per the Code Map fixes above -- AD-1 stage 2, committed red before any of the below
- [ ] `prisma/schema.prisma` + migration -- new token model, confirmed shape
- [ ] `domain/**` -- entity, service, dispatcher port real adapter
- [ ] `infrastructure/**` -- Prisma repository, real email adapter, fake email adapter
- [ ] `application/**` + module wiring -- controller (`POST /auth/magic-link`), DTO, action
- [ ] Confirm bounded-context placement with the architect and place files accordingly (may require moving files out of `user-management` if the answer is "new context")

**Acceptance Criteria:**
- Given `um-auth-01` and `um-auth-02`, when `npm run test:e2e` runs, then both pass with no real network calls
- Given a matching and a non-matching email submitted back to back, when their response bodies are diffed, then they are structurally identical
- Given a non-matching email, when the request completes, then the email-adapter fake recorded zero dispatch calls

## Design Notes

The account-enumeration guard is a construction property, not a runtime check to remember: the lookup-or-noop and the "what do I return" logic must be the same function/branch shape for both outcomes, so a future edit can't accidentally reintroduce a difference (e.g. an early-return on "not found" that skips a field the success path sets). Prefer "always build the same response object; only conditionally perform the side effect" over "branch on found/not-found and build two different responses."

## Verification

**Commands:**
- `npm run db:migrate` -- new token-table migration applies cleanly
- `npm run test:e2e` -- `user-management/auth` specs (`um-auth-01`, `um-auth-02`) pass
- `npm run build` -- no TS errors
- `npm run lint` -- clean
