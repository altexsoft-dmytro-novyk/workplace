# ACF-AU-05 · Unrelated colleague is denied

**Trace:** §3.2 Colleague · §3.3.4 · AD-10 · AD-11 · ACF-1

**Approved:** Anna Pikula, 2026-08-30

## Scenario

**Given** Colin is an authenticated employee who is not Alice, does not manage her directly or transitively, and is not her People Partner.

**When** Colin reads Alice's profile.

**Then** the read is denied — Colleague is the fallback for anyone with no qualifying relationship, and under the provisional mapping it does not open the full profile. This is the case that makes the other four meaningful: without it, every authenticated session would pass.

**Preconditions:** [fixture](../README.md#foundation-fixture); no relationship row connects Colin and Alice in either direction.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<colin-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no profile fields are returned. The denial status follows the existing guard, which maps refusal to `ForbiddenException` — the `404` leak-free convention needs a User Management change and is out of scope here.
