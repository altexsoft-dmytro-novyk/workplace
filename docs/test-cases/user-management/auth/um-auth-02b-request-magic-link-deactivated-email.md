# UM-AUTH-02b · Request a magic link for a deactivated user's email

**Trace:** [DEC-UM-012](../../../architecture/user-management-test-decisions.md) (**proposed / draft** — pending confirmation; extends DEC-UM-004) · epics.md Story 2.1 · PRD FR-2 · FR-6 (departure interaction)

## Scenario

**Given** Colin, whose `User` row exists but who has been **deactivated** —
`isActive: false` **and** a current `EmploymentStatus{status: 'dismissed'}` (the
applied-departure convergence; in production an Epic 5 outcome, seeded directly
here).

**When** a magic link is requested for Colin's `workEmail`, unauthenticated.

**Then** the response is treated **exactly like an unknown email** (`um-auth-02`):
**byte-identical** `200 { sent: true }`, **zero** dispatch, **no** token minted.
The endpoint must not reveal deactivation status any more than it reveals account
existence — a caller who already knows the address is registered still learns
nothing about whether it is active (DEC-UM-012).

**Preconditions:** [fixture](README.md#canonical-personas); Colin seeded with
`isActive: false` and a current `dismissed` employment status.

## Test

- **inputURL:** `POST /auth/magic-link`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "email": "colin@company.example" }
  }
  ```
- **expectedResult:** `200` with body **exactly** `{ "sent": true }`, byte-identical
  to the known-active and unknown cases in the same run.
  - The outbound dispatcher recorded **zero** dispatches for Colin's address.
  - **No** `MagicLinkToken` row was created for Colin.

## Notes

> **DEC-UM-012 is proposed / draft** (TEA per-file review 2026-08-25, not part of
> the 2026-08-25 product approval that settled DEC-UM-001..011) — flag at
> approval.
>
> **Split from `um-auth-06` (2026-09-02).** The request half (this file) is
> Story 2.1's; `um-auth-06` keeps only the consume half (a token issued *before*
> deactivation must not yield a session — Story 2.2, independent of DEC-UM-012).
>
> **Which deactivation signal the handler keys on is a Stage 3 decision** — see
> [README.md](README.md#decisions-made-in-scenario-confirm-at-approval) decision 5
> (recommendation: `User.isActive`, with "no current `dismissed` status" as a
> secondary guard). Both are seeded so the assertion holds either way.
