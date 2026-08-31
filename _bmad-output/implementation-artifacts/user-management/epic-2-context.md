# Epic 2 Context: Magic-Link Authentication

<!-- Regenerated 2026-09-01 from epics.md v1.5 — supersedes the pre-v1.5 version; NOT an AD-1 approval. -->
<!-- Compiled planning context for a future story-authoring / dev pass. NOT an AD-1 stage-1 scenario doc. -->

## Goal

Any active employee in the imported population can request a magic link sent to
their `workEmail` and consume it to establish the session every other epic's
protected endpoints rely on. Own resource — `/auth` root, distinct token
entity/service, no file overlap with Epic 1's `/users` resource. Epic 1 and
Epic 2 build in parallel: Epic 2's flow needs a `User` row to exist, seeded
directly via Prisma or the import script (AD-3), not Epic 1's HTTP surface.

**New in v1.5 scope:** Epic 2 also **owns retiring the interim session
resolver** (`interim-session-resolver.adapter.ts`) — it supplies the real
session issuance/resolution adapter behind `session-resolver.port.ts`. Epic 0
(Access Control adoption) keeps the interim resolver and uses its
`Bearer <token:<seeded-uuid>>` convention for fixtures; AD-21's clause about the
interim adapter authorizing target access refers to the *access-control*
adapter, retired by Epic 0 — not the session resolver.

## Stories

- Story 2.1: Request a Magic Link by Work Email
- Story 2.2: Consume a Magic-Link Token to Establish a Session

## Requirements & Constraints

- No password is ever requested, stored, or returned (FR-2) — the magic link is
  the sole login mechanism. No SSO, no AD (§4.17, §10).
- `POST /auth/magic-link` returns the identical `200` body shape (e.g.
  `{ sent: true }`) whether or not the email matches a `User` — account-
  enumeration guard. For a non-matching email, **zero** dispatch, asserted
  against the email-adapter fake at stage 2 (DEC-UM-004).
- **DEC-UM-012 (proposed, treat as draft):** a deactivated user's `workEmail` is
  treated identically to an unknown email — `200`, same shape, zero dispatch.
- `POST /auth/magic-link/consume`: a valid, unexpired, unconsumed token → `200`
  with a session token scoped to the user, and that session succeeds on a real
  follow-up authenticated request (`GET /users/:id`, resolved through **real**
  access resolution — Epic 0's adapter — not a fake). Expired or
  already-consumed token → `401`, no session token in the body (DEC-UM-004,
  single-use).
- **Departure interaction (FR-6):** once a departure effective date has passed
  and the account is inactive, no usable session is established — the request
  stays enumeration-safe and a pre-departure token fails at consume
  (`um-auth-06`).
- First login uses the same magic-link flow (FR-3) — completing seed/import does
  **not** establish a session, and there is no separate invite/registration
  path.
- Domain code imports nothing from Prisma, NestJS transport, or HTTP (AD-2/AD-5).
- Every entitlement check goes through the `AccessControl` facade; the two
  `/auth` endpoints are unauthenticated-by-design, so this mostly binds the
  follow-up authenticated request in `um-auth-03`.
- NFR-1 pseudonymised data only; NFR-3 email-dispatch failure must not crash the
  request or leak an account-existence signal.

## Technical Decisions

- Router: own `/auth` root — `POST /auth/magic-link`,
  `POST /auth/magic-link/consume`. No shared files with `/users`.
- **A distinct token entity/service, not yet in the schema.** No
  `MagicLinkToken`-shaped model exists in `prisma/schema.prisma` or
  `database-schema.md`. Proposed shape (audit-column discipline): `id`
  (uuidv7 PK), `userId` (FK → `User`), `token` (unique), `expiresAt`,
  `consumedAt` (nullable — presence marks the token spent), `createdAt`.
  **Ask First:** confirm/add this shape to `database-schema.md` before Story
  2.1's stage 1 (its own rule: deviations go through the architect).
- Email dispatch goes through an outbound port (`magic-link-dispatcher.port.ts`,
  defined by Story 1.1's era but now owned here for the real adapter — AD-15:
  email delivery is a legitimately-faked *external* integration in E2E, but the
  **real adapter is Epic 2's own deliverable**, pointed at real local infra via
  env, not a dev-infra container).
- Session issuance: the real adapter behind `session-resolver.port.ts` lands
  here, replacing `interim-session-resolver.adapter.ts` in the same cutover
  (AD-21).

## Ask First

- **Bounded-context placement of `/auth` code is unresolved.**
  `domain-driven-design.md` names no `auth` context. File-path convention
  (`test/user-management/auth.e2e-spec.ts`,
  `docs/test-cases/user-management/auth/`) points toward `user-management`, but
  that is not an architectural confirmation. Confirm with the architect before
  Story 2.1's stage 1 and update `domain-driven-design.md` either way.
- Token entity shape — confirm/add to `database-schema.md`.

## Cross-Story Dependencies

- Story 2.2 depends on Story 2.1 only in that a token must be minted before it
  can be consumed.
- Story 2.2's `um-auth-03` is the other half of Story 1.1's "seed/import does not
  auto-login" contract.
- An existing stage-2-only E2E file (`test/user-management/auth.e2e-spec.ts`,
  audited at submodule branch `dn-um-2` HEAD `e9d80ec` — see
  `_bmad-output/test-artifacts/e2e-actual-state-audit-2026-09-01.md`) covers
  `um-auth-01..06` but **404s today** because the `POST /auth/magic-link`
  routes are not built. It should be **reconciled/extended, not recreated**.
  Known fixes to make while doing so: (1) its `createUser` helper chains a real
  `POST /users` (a now-retired route) — replace with a direct `prisma.user.create`
  / import-script seed; (2) `um-auth-02` is missing the zero-dispatch assertion
  against the email-adapter fake; (3) `um-auth-03/04/05` never mint a real token
  — they must
  call `POST /auth/magic-link` (or read the minted row via the injected
  `prisma` handle), and `um-auth-04` needs an explicit backdate of `expiresAt`.
