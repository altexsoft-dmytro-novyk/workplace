# UM-AUTH-01 · Request a magic link for a registered active email

**Trace:** PRD FR-2 ("a magic link sent to `workEmail` is the sole login mechanism") · [DEC-UM-004](../../../architecture/user-management-test-decisions.md) (known email → exactly one dispatch) · [DEC-UM-007](../../../architecture/user-management-test-decisions.md) (normalized `workEmail` lookup) · epics.md Story 2.1

## Scenario

**Given** Alice, an existing **active** user (`isActive: true`, no current
`dismissed` employment status), whose `workEmail` is stored normalized by the
seeded-population import.

**When** Alice submits her email to `POST /auth/magic-link`, unauthenticated (she
has no session yet) — and she submits it **differently cased / whitespace-padded**
relative to the stored value, to prove the lookup normalizes.

**Then** the request succeeds with the generic confirmation body, and the system
mints exactly one one-time token for Alice and dispatches exactly one magic link
to her address. No password is ever requested, stored, or returned; no token,
link, or account-existence signal appears in the response body.

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded as an
active `User` with a normalized `workEmail`.

## Test

- **inputURL:** `POST /auth/magic-link`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "email": "  Alice@Company.Example  " }
  }
  ```
- **expectedResult:** `200` with body **exactly** `{ "sent": true }` — no `token`,
  `link`, `password`, `accessToken`, `sessionToken`, or `email` field, and no
  other user-existence signal.
  - The outbound magic-link dispatcher (AD-15 fake, rebound to a recording
    variant in Stage 2) recorded **exactly one** dispatch, and it targeted
    Alice's normalized `workEmail` and no other address.
  - A `MagicLinkToken` row now exists for Alice: `consumedAt` is `null` and
    `expiresAt` is in the future (`> now()`). The raw token value is **not**
    HTTP-observable — it is delivered only through the emailed link (Story 2.2
    consumes it).

## Notes

> **v1.5 (2026-09-02).** Alice comes from the Story 1.1 seeded-population import
> (`seed/`), not `POST /users` — that route is retired (AD-14 / AD-16 / AD-21).
> Stage 2 seeds the `User` row directly via Prisma (sanctioned real precondition,
> `.claude/rules/nest-e2e.md`).
>
> **Response shape, `MagicLinkToken` shape, and the 15-minute TTL are settled
> in-scenario** — see [README.md](README.md#decisions-made-in-scenario-confirm-at-approval).
> The `MagicLinkToken` entity is **not yet in `database-schema.md`**; the proposed
> shape there needs the architect's ratification before Stage 3.
