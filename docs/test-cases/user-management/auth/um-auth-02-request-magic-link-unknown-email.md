# UM-AUTH-02 · Request a magic link for an unregistered email

**Trace:** [DEC-UM-004](../../../architecture/user-management-test-decisions.md) (unknown email → same body, zero dispatch) · epics.md Story 2.1 (enumeration-safe unknown email) · PRD FR-2

## Scenario

**Given** an email address with **no matching `User` record** at all.

**When** a magic link is requested for that address, unauthenticated.

**Then** the response is **byte-identical** — same status, same body — to
`um-auth-01`'s success case, and **no email is dispatched** and **no token is
minted**. The endpoint must not reveal whether an account exists for a given
address (account enumeration).

**Preconditions:** [fixture](README.md#canonical-personas); the "Nobody" address
has no `User` row.

## Test

- **inputURL:** `POST /auth/magic-link`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "email": "nobody@company.example" }
  }
  ```
- **expectedResult:** `200` with body **exactly** `{ "sent": true }` — the raw
  response text is identical, character for character, to what the same suite
  gets for a known active email in the same run.
  - The outbound dispatcher recorded **zero** dispatches for this address
    (asserted at the AD-15 recording fake in Stage 2).
  - **No** `MagicLinkToken` row was created.

## Notes

> **v1.5 (2026-09-02).** No `POST /users` in v1.5 — the "known" comparison persona
> in the same Stage-2 test is seeded directly via Prisma. The byte-identical-body
> assertion is the machine-precise form of the enumeration guard; see
> [README.md](README.md#decisions-made-in-scenario-confirm-at-approval) decision 1.
