# ACF-AU-05 · Unrelated colleague resolves to Colleague only

**Trace:** §3.2 Colleague · §3.3.4 · AD-10 · AD-11 · ACF-1

**U-19 normative coverage:** Weak candidate evidence for `TR-3.3-02` (v1.5 §3.3 — Colleague whitelist). Reworked 2026-09-11 to the resolver audience-set assertion; still weak evidence for `TR-3.3-02` because this file proves only that Colin resolves to `colleague`, not the whitelist's field-level consequence. See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30 (original scenario, HTTP `403` expectation — superseded, see below)
**Reworked & approved:** Anna Pikula, 2026-09-11 — retro-anchor. The resolver behavior and its test (`services/backend` commit `da7d1fa`, 2026-09-03) predate this approval; this is the fresh AD-1 pass the 2026-09-01 note said was still needed, approving the rewrite below rather than a scenario-first change.

> **Expected result reworked — 2026-09-11 (superseded 2026-09-01).** User Management answered contract-request Q3 the opposite way this file originally assumed: a colleague `GET /users/:id` returns the **S1 identity card** (`200`), not `403` (§3.2 S1 row is `R` for Colleague; [adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md)). The **resolver behaviour is unchanged** — Colin still resolves to `colleague` as the fallback, and that is still "the case that makes the other four meaningful." This file now asserts `resolveAudiences(Colin, [Alice])` yields `{colleague}` — non-empty, and *not* `self`/`reporting`/`pp` — the way `ACF-FC-04` does, instead of a `403` on the route. The route-level `200` this case now produces is User Management's contract, not this suite's.

## Scenario

**Given** Colin is an authenticated employee who is not Alice, does not manage her directly or transitively, and is not her People Partner.

**When** the facade resolves Colin's audiences for Alice.

**Then** the resolved set is `{colleague}` and nothing else — Colleague is the fallback for anyone with no qualifying relationship. This is the case that makes the other four meaningful: without it, every viewer would resolve to every audience.

**Preconditions:** [fixture](../README.md#foundation-fixture); no relationship row connects Colin and Alice in either direction.

## Test

> **Facade-level case.** Asserted at the facade, not over HTTP — `GET /users/:id` now returns `200` for every audience in `{self, reporting, pp, colleague}`, so an HTTP status can no longer discriminate which audience resolved. The deviation from the `inputURL` skeleton in [../../README.md](../../README.md) is deliberate, matching `ACF-FC-03`.

- **facadeCall:** `accessControl.resolveAudiences(<colin-id>, [<alice-id>])`
- **expectedResult:** the audience set for `<alice-id>` is exactly `{colleague}` — present, and not `self`, `reporting`, or `pp`.
