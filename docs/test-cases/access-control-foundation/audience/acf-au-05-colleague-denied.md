# ACF-AU-05 · Unrelated colleague is denied

**Trace:** §3.2 Colleague · §3.3.4 · AD-10 · AD-11 · ACF-1

**U-19 normative coverage:** Weak candidate evidence for `TR-3.3-02` (v1.5 §3.3 — Colleague whitelist), but this file's own expected result is invalidated (2026-09-01, see this suite's README) and needs rework before it can count as evidence. See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30

> **Expected result superseded — 2026-09-01.** User Management answered contract-request Q3 the opposite way this file assumed: a colleague `GET /users/:id` returns the **S1 identity card** (`200`), not `403` (§3.2 S1 row is `R` for Colleague; [adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md)). The **resolver behaviour is unchanged** — Colin still resolves to `colleague` as the fallback, and that is still "the case that makes the other four meaningful." The rework: assert `resolveAudiences(Colin, [Alice])` yields `{colleague}` (non-empty, and *not* `self`/`reporting`/`pp`), the way `ACF-FC-04` asserts, instead of a `403` on the route. That is its own AD-1 pass and needs fresh approval. Do not translate the `403` below.

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
