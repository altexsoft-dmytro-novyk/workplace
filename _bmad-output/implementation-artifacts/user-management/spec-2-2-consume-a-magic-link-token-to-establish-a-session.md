---
title: 'Story 2.2: Consume a Magic-Link Token to Establish a Session'
type: 'feature'
status: draft
created: 2026-08-24
regenerated: 2026-09-01
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-2-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — **NOT an AD-1 approval.** Pre-v1.5
> `<frozen-after-approval>` block re-opened. `baseline_commit` dropped.

## Intent

**Problem:** Story 2.1 can mint and dispatch a token but nothing turns it into a
usable session. This is also the other half of the "seed/import does not
auto-login" contract (FR-3): creation and login are separate acts.

**Approach:** `POST /auth/magic-link/consume` accepts a token, looks it up
against the entity Story 2.1 minted, and — if found, unexpired, unconsumed —
marks it consumed and returns a session/access token scoped to the owning user.
Any other case → `401`, no session token anywhere in the body. **This story
lands the real session-issuance/resolution adapter** behind
`session-resolver.port.ts`, retiring `interim-session-resolver.adapter.ts` in
the same cutover (AD-21).

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-auth-03`, `um-auth-04`, `um-auth-05`, `um-auth-06` scenario
  docs → red E2E → implementation.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- DEC-UM-004: single-use (replay → `401`), expired → `401`, no session token in
  any failure body.
- The success case's follow-up authenticated request (`GET /users/:id`) resolves
  through **real** access resolution (Epic 0's adapter / the real facade), not a
  fake (`testing-strategy.md`).
- **FR-6 interaction (`um-auth-06`):** after a departure effective date passes
  and the account is inactive, no usable session is established; a pre-departure
  token fails at consume; the request stays enumeration-safe.

**Never:**
- Don't distinguish the three failure shapes (not found / expired / consumed) in
  the response — one generic `401`.
- Don't retain the interim session resolver past this cutover.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Valid token | Alice holds a valid unexpired unconsumed token | `200` with a session token scoped to Alice; follow-up `GET /users/<aliceId>` → `200` (`um-auth-03`) |
| Expired | Token's `expiresAt` backdated | `401`, no session token (`um-auth-04`) |
| Replay | Token already consumed once | `401`, no session token (`um-auth-05`) |
| Departed | Colin's departure effective date passed | No usable session; pre-departure token fails at consume (`um-auth-06`) |

## v1.5 Cutover Notes

- Existing stage-2 E2E (`test/user-management/auth.e2e-spec.ts`, backend branch
  `user-management`) — reconcile/extend, don't recreate. Fix its `createUser`
  helper (drop the retired `POST /users` call → direct Prisma / import seed),
  and mint real tokens (`um-auth-03/04/05` currently submit a literal
  placeholder to `/consume`).
- The interim session resolver's `Bearer <token:<uuid>>` convention stays
  available for other epics' fixtures **until** this story's real adapter lands;
  Epic 0's fixtures use it deliberately in the meantime.

## Open Questions / Gates

- Session token format/TTL/refresh — architect (ties to the `/auth` context
  placement question).
