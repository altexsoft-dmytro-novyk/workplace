# ACF-FC-04 · A cyclic reporting chain terminates instead of hanging

**Trace:** §7 · AD-11 · AD-12 · ACF-1

**U-19 normative coverage:** Robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive Reporting line) and meta-level support for `TR-7-01`. Reworked 2026-09-13 (`ACF-RW-04`) to the resolver audience-set assertion, retaining its termination/hang oracle. See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30 (original scenario, HTTP `403` expectation — superseded, see below)
**Reworked & approved:** Anna Pikula, 2026-09-13 (`ACF-RW-04`) — retro-anchor, the same pattern as `ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` on 2026-09-11. The resolver behavior and its test (`services/backend`, real-Postgres e2e already asserting `resolveAudiences(Colin, [CycleA])` equals exactly `{colleague}` via a `Promise.race` hang guard) predate this approval; this brings the scenario document into agreement with what already shipped and was already green, rather than re-running the scenario → red test → production order.

> **Expected result reworked — 2026-09-13 (superseded 2026-08-30).** The termination/hang oracle is unchanged and still load-bearing: the request must complete, not hang, on a cyclic reporting graph. But the `403` on `GET /users/:id` no longer holds, for the same 2026-09-01 UM contract answer that reworked `ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` — User Management now returns the S1 identity card (`200`) to any colleague, and Colin *is* a colleague to CycleA. This file now asserts `resolveAudiences(Colin, [CycleA])` yields exactly `{colleague}`, completing within the request budget instead of hanging on the cycle.

## Scenario

**Given** two employees form a cycle in the reporting graph — CycleA reports to CycleB and CycleB reports to CycleA — which the schema accepts today: the partial unique index allows each of them exactly one `direct` row, and the CHECK constraint only forbids pointing at yourself.

**When** an unrelated colleague resolves audiences for one of their profiles.

**Then** resolution completes and returns exactly `{colleague}`. Bad org data must degrade to *less* access, never to an unanswered request: the recursive walk terminates on its own through deduplication, and a hard ceiling on the query means that even a shape nobody anticipated fails the request rather than holding its database connection open. §7 gives the whole request two seconds; a resolution still running past that is not slow, it is wrong.

**Preconditions:** [fixture](../README.md#foundation-fixture); the CycleA ↔ CycleB pair exists in addition to the standard graph.

## Test

> **Facade-level case.** Asserted at the facade, not over HTTP — `GET /users/:id` now returns `200` for every audience in `{self, reporting, pp, colleague}`, so an HTTP status can no longer discriminate which audience resolved, nor whether the cycle stalled the request. The deviation from the `inputURL` skeleton in [../../README.md](../../README.md) is deliberate, matching `ACF-FC-02`/`ACF-FC-03`.

- **facadeCall:** `accessControl.resolveAudiences(<colin-id>, [<cycle-a-id>])`, raced against a 2s hang guard
- **expectedResult:** the audience set for `<cycle-a-id>` is exactly `{colleague}`, and the call resolves within the request budget rather than timing out. The audience call underlying it must return rather than hang; a run that stalls past the guard is a failure of this scenario even if no assertion reports it.
