# User Management — `auth/` (Epic 2: Magic-Link Authentication)

Stage-1 scenario documents (AD-1) for **Epic 2 — Magic-Link Authentication**,
following the team-wide authoring pattern in [../../README.md](../../README.md):
**one test case per file**, each opening with a plain-language **Scenario**
(Given/When/Then) followed by the explicit request spec — `inputURL`,
`inputRequest`, `expectedResult` — traced to `docs/project-requirements.md` (§),
the [user-management PRD](../../../../_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md)
(FR-n), architecture decisions (AD-n), and
[user-management-test-decisions.md](../../../architecture/user-management-test-decisions.md)
(DEC-UM-n).

| Cluster | Story | Files | Asserts |
| --- | --- | --- | --- |
| `um-auth-01`, `um-auth-02`, `um-auth-02b` | 2.1 — Request a Magic Link by Work Email | `POST /auth/magic-link` — enumeration-safe request | a known active email → `200 { sent: true }`, **exactly one** dispatch, a `MagicLinkToken` row minted; an unknown **or** deactivated email → the **byte-identical** `200 { sent: true }`, **zero** dispatch, **no** token row |
| `um-auth-03`, `um-auth-04`, `um-auth-05`, `um-auth-06` | 2.2 — Consume a Magic-Link Token to Establish a Session | `POST /auth/magic-link/consume` — single-use, TTL, deactivation | a valid unexpired unconsumed token → `200` + a session usable on a real follow-up request; expired / replayed / pre-deactivation token → `401`, no session token |

## Status — UNAPPROVED DRAFT

**Story 2.1 scenarios (`um-auth-01`, `um-auth-02`, `um-auth-02b`) reconciled
2026-09-02** from the compiled spec
[`spec-2-1-request-a-magic-link-by-work-email.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-2-1-request-a-magic-link-by-work-email.md)
(`status: draft`) and
[`epic-2-context.md`](../../../../_bmad-output/implementation-artifacts/user-management/epic-2-context.md),
against DEC-UM-004 / DEC-UM-007 / DEC-UM-012. Pre-v1.5 wording removed: the
personas now come from the Story 1.1 seeded-population import (not the retired
`POST /users`); the response body is settled to exactly `{ sent: true }`; the
account-enumeration guard is stated as a **byte-identical body** requirement; and
the deactivated-email case is lifted out of `um-auth-06` into its own Story 2.1
file `um-auth-02b` (the request half is Story 2.1's; `um-auth-06` keeps only the
consume half). **Story 2.1 is pending only its Stage 2 (committed-red E2E) and
Stage 3 (production).**

**Story 2.2 scenarios (`um-auth-03`, `um-auth-04`, `um-auth-05`, `um-auth-06`)
reconciled 2026-09-02** from
[`spec-2-2-consume-a-magic-link-token-to-establish-a-session.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-2-2-consume-a-magic-link-token-to-establish-a-session.md)
+ [`epic-2-context.md`](../../../../_bmad-output/implementation-artifacts/user-management/epic-2-context.md),
against DEC-UM-004 and the AUTONOMOUS-RUN-LOG Story 2.2 design decision. Pre-v1.5
wording removed: the token is now minted **for real** (`POST /auth/magic-link`,
shipped by Story 2.1) and its raw value read out-of-band from the Stage-2
recording dispatcher — no literal `<magic-link-token:alice>` placeholder. The
success body shape, the session-token format/lifetime, and the
`SessionResolverPort` cutover (AD-21) are settled below as **in-scenario
proposals** and flagged for the architect. **Story 2.2 is pending its Stage 2
(committed-red E2E) and Stage 3 (production).**

Per-file human approval under the AD-1 stage-1 gate is required before any
stage-2 E2E; **no `_bmad-output/specs/*/approvals.yaml` records this set.** An
agent's review of its own output is never a substitute for human approval
([testing-strategy.md](../../../architecture/testing-strategy.md)). `author` must
differ from `approver`.

## Canonical personas

All personas are seeded **directly via Prisma** in the Stage-2 fixtures
(`RunFixtures.user()` — `test/user-management/epic-2/fixtures.ts`), run-namespaced
per DEC-UM-010. There is **no `POST /users`** in v1.5 (AD-14 / AD-16 / AD-21); the
seeded-population import (`seed/`) is the production writer, but these suites do
not run it — a direct row insert is the sanctioned real precondition
(`.claude/rules/nest-e2e.md`, "preconditions must be real").

| Persona | State | Used by |
| --- | --- | --- |
| **Alice** | active `User` (`isActive: true`, no current `dismissed` employment status), `workEmail` normalized | `um-auth-01`, `um-auth-03`, `um-auth-04`, `um-auth-05` |
| **Nobody** | no `User` row for the address at all | `um-auth-02` |
| **Colin** | `User` row exists, but `isActive: false` **and** a current `EmploymentStatus{status: 'dismissed'}` — the applied-departure convergence (`test/user-management/epic-5/apply-departure.e2e-spec.ts`); in production this state is an Epic 5 outcome (CC-06-blocked), seeded directly here | `um-auth-02b`, `um-auth-06` |

## Endpoint vocabulary

| Route (e2e, unprefixed) | Production route | Auth |
| --- | --- | --- |
| `POST /auth/magic-link` | `POST /api/v1/auth/magic-link` | **unauthenticated by design** (`authorization: ""`) |
| `POST /auth/magic-link/consume` | `POST /api/v1/auth/magic-link/consume` | **unauthenticated by design** (`authorization: ""`) |

Own `/auth` root — distinct token entity/service, **no shared files** with the
`/users` resource (`epic-2-context.md`; `domain-driven-design.md` bounded-context
placement of `/auth` is **still an architect call** — the file-path convention
points at `user-management`, which is not an architectural confirmation).

## Decisions made in-scenario (confirm at approval)

1. **Response body is exactly `{ "sent": true }`.** A single boolean field. No
   token, no link, no password, no `email` echo, no user-existence signal beyond
   the generic confirmation. Same body for a known, unknown, or deactivated
   address — the account-enumeration guard (DEC-UM-004 / DEC-UM-012) is asserted
   in Stage 2 as `unknownRes.text === knownRes.text` (**byte-identical**, not just
   same shape).

2. **`MagicLinkToken` entity — proposed shape, architect to ratify before Stage 3.**
   Not in `prisma/schema.prisma` or `database-schema.md` today. Proposed
   (audit-column discipline per `.claude/rules/nest-prisma.md` — no reflexive
   `updatedAt`/`updatedBy`):

   ```text
   MagicLinkToken {
     id         uuidv7 PK
     userId     FK -> User (ON DELETE CASCADE)
     tokenHash  string, unique      // SHA-256 of the raw token; the raw token
                                    // exists only inside the emailed link — the
                                    // DB stores a hash, never the usable secret
     expiresAt  timestamptz
     consumedAt timestamptz, nullable  // presence marks the token spent
                                       // (single-use — DEC-UM-004); one-way
     createdAt  timestamptz, default now()
   }
   ```

   - **Diverges from `epic-2-context.md`'s draft** (`token` unique) — this pass
     proposes `tokenHash` on the "store a hash, not the raw credential"
     principle. Needs the architect's call.
   - Table name proposed `magic_link_token` (`@@map`, matching
     `employment_status` / `department_membership`).
   - **Open (not asserted in Story 2.1):** a partial unique index "at most one
     unconsumed, unexpired token per user" — deferred to the architect.

3. **Token TTL = 15 minutes (proposed).** Configuration-owned
   (`MAGIC_LINK_TTL_MINUTES` env, Joi-validated at startup — DEC-UM-004); tests
   inject a deterministic TTL + controllable clock. The **15-minute** figure is
   this pass's proposal and needs product confirmation. Story 2.1 asserts only
   `expiresAt > now()` at mint; the exact TTL is Story 2.2's expiry test
   (`um-auth-04`).

4. **Normalized `workEmail` lookup (DEC-UM-007).** The handler applies
   `trim().toLowerCase()` to the request `email` before matching it against the
   stored `workEmail`. Identity is canonical **at write** (the seed/import writer
   stores the normalized value), so a plain equality match on the normalized
   input is correct. Stage 2 sends a differently-cased / whitespace-padded
   address for the known-email case to prove the normalization.

5. **Deactivated = `isActive: false` + current `EmploymentStatus{dismissed}`
   (DEC-UM-012, DRAFT).** Both signals are seeded together because that is the
   real applied-departure convergence. **Which signal `POST /auth/magic-link`
   keys on is a Stage 3 decision** — recommendation: `User.isActive` (the
   account-level flag), with "no current `dismissed` employment status" as a
   secondary guard. Either way the Stage-2 assertion (byte-identical `200`, zero
   dispatch, no token row) holds. DEC-UM-012 is **proposed / draft** — flag at
   approval.

6. **Dispatcher port signature widens in Story 2.1 Stage 3.**
   `MagicLinkDispatcherPort.dispatch(workEmail)` is incomplete — a real dispatch
   needs the token/link to build the email. Scenarios and the Stage-2 recording
   fake describe the intended `dispatch(workEmail, token)` form; Stage 3 changes
   the port signature and the production `MagicLinkDispatcherFake`.

7. **Malformed / missing `email` → `400`** (standing route-family rule, per
   [../../README.md](../../README.md) "Global 401 rule" analogue). `POST
   /auth/magic-link` with an empty body, a non-string `email`, or a
   non-email-format `email` is a `400` from the global `ValidationPipe` +
   request DTO (`@IsEmail()`), **nothing dispatched, no token row**. Applied in
   the Stage-2 suite; not a separately numbered scenario.

8. **Email-dispatch failure (NFR-3) is out of scope for Story 2.1 Stage 2** — no
   fault-injection seam exists yet. The rule (a delivery failure must not crash
   the request or leak an account-existence signal) is Story 2.1 Stage 3 /
   Story 2.2 territory.

## Story 2.2 — session-token decisions (confirm at approval)

These are **in-scenario proposals** for `um-auth-03..06`. Story 2.2 needs *a*
session mechanism to exist; the exact shape/format/TTL is flagged for the
architect + product (`spec-2-2` "Open Questions / Gates": "Session token
format/TTL/refresh — architect").

9. **`POST /auth/magic-link/consume` success body — proposed shape.**
   ```json
   { "sessionToken": "<string>", "tokenType": "Bearer", "expiresIn": 28800 }
   ```
   - `sessionToken` — the credential the caller puts in
     `Authorization: Bearer <sessionToken>` on subsequent requests.
   - `tokenType` — always `"Bearer"` (self-describing; lets a client build the
     header without out-of-band knowledge).
   - `expiresIn` — session lifetime in **seconds** (mirrors OAuth2 token
     responses).
   - **Alternative considered:** a bare `{ "sessionToken": "<string>" }`. The
     three-field form is proposed because it costs nothing and removes a
     client guess. **Whichever is chosen, every failure case
     (`um-auth-04/05/06`) returns none of `sessionToken` / `accessToken` /
     `token` / `session` and no `Set-Cookie` — DEC-UM-004.**
   - The Stage-2 helper `sessionTokenOf(body)` reads
     `accessToken ?? sessionToken ?? token`, and `expectNoSessionToken(body)`
     rejects all four keys — so the tests do not hard-code the winning name.

10. **Session-token format — propose a signed JWT (HS256), no new table.**
    - `sub = userId`, `iat`, `exp = iat + SESSION_TTL`; signed with a config
      secret (`SESSION_JWT_SECRET`, Joi-validated at startup, no default in
      prod). The real `SessionResolverPort` adapter verifies signature + `exp`
      and returns `{ userId: sub }`.
    - **Rationale:** lean spine — Story 2.2 has no logout / refresh / server-side
      revocation requirement, so a stateless token needs no `Session` model,
      no migration, and no per-request DB read. Consistent with "no speculative
      schema fields".
    - **Alternative for the architect:** an **opaque random token + a `Session`
      table** (`id`, `userId`, `tokenHash` SHA-256, `expiresAt`, `createdAt`,
      optional `revokedAt`). Pick this if a near-term story needs logout,
      "sign out everywhere", or admin session revocation — a JWT cannot be
      invalidated before `exp` without adding a denylist, at which point the
      table is back. **This choice is a Stage-3 + architect call; the
      `um-auth-03..06` scenarios and tests are written to be neutral to it**
      (they only assert "a session token is/ isn't present" and "it
      authenticates / doesn't").

11. **Session lifetime — 8 hours (proposed).** `SESSION_TTL_HOURS` env,
    Joi-validated (`expiresIn: 28800` in the body above). A single work-day
    session; magic-link re-request is the renewal path. Figure needs product
    confirmation — it is not asserted as an exact value by any scenario, only
    that `expiresIn` is present and positive and that an expired *magic-link*
    token (not session) is refused (`um-auth-04`).

12. **`SessionResolverPort` cutover (AD-21) — the real adapter folds in the
    interim shorthand behind a non-prod flag.** Story 2.2 lands the real
    session-issuance/resolution adapter behind `session-resolver.port.ts` and
    **retires `interim-session-resolver.adapter.ts`** in the same change. To
    keep the ~15 existing e2e suites that authenticate with
    `Authorization: Bearer <token:<seeded-uuid>>` working, the **real adapter
    also accepts that shorthand — but only when a non-production env flag is
    set** (e.g. `AUTH_ALLOW_DEV_BEARER_SHORTHAND=true`, refused when
    `NODE_ENV=production`). So AD-21's "one adapter, no dual-running" holds: the
    interim adapter's capability moves *into* the real one, it is not kept
    alongside it. `um-auth-03`'s follow-up `GET /users/:id` uses a **real**
    session token (the production path), not the shorthand.

13. **`POST /auth/magic-link/consume` request body — `{ token: string }`,
    malformed → `400`.** A missing, empty, or non-string `token` is a `400`
    from the global `ValidationPipe` + a `ConsumeMagicLinkDto`
    (`@IsString()` + `@IsNotEmpty()`), before any lookup. Applied in the
    Stage-2 suite as `um-auth-consume-malformed`; not a separately numbered
    scenario (standing route-family rule, mirrors decision 7).

14. **`consumedAt` is set on success, untouched on every denial.**
    `um-auth-03` asserts the row's `consumedAt` becomes non-null after a `200`;
    `um-auth-04` asserts it stays `null` after the expired-token `401` (expiry
    ≠ consumption). The single-use check and the mark-consumed write must be
    atomic (a partial index or a conditional `UPDATE ... WHERE consumedAt IS
    NULL` — Stage 3 / architect; `um-auth-05` only asserts the observable
    "second consume → 401").
