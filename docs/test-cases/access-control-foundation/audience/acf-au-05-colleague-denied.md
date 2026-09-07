# ACF-AU-05 · Unrelated colleague resolves to Colleague and nothing more

**Trace:** §3.2 Colleague · §3.3.4 · AD-10 · AD-11 · ACF-1

**Approved:** Anna Pikula, 2026-08-30 · **Reworked:** 2026-09-07 (`1-3a`), resolver oracle unchanged

> **Supersession history.** Authored 2026-08-30 as a `403` on `GET /users/:id`. The
> 2026-09-01 User Management contract decision returns the S1 identity card (`200`) to any
> colleague ([adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md);
> §3.2 S1 row is `R` for Colleague), so HTTP status stopped being the resolver oracle here.
> The scenario now asserts the resolver audience set directly, matching the `ACF-FC-04`
> shape. **The resolver behaviour never changed** — Colin still resolves to `colleague` as
> the fallback. The E2E rework shipped in `services/backend` `da7d1fa`
> (`test/access-control/audience-resolution.e2e-spec.ts`); this scenario doc is brought in
> line with it. The genuinely-empty-audience denial (viewer or target not an active `User`)
> follows PM/AD-24 (`401` / `404` / `403`) and is a UM controller concern, out of scope
> here. The 2026-08-30 / 2026-09-01 approval records are preserved above; only the observed
> oracle changed.

## Scenario

**Given** Colin is an authenticated employee who is not Alice, does not manage her directly or transitively, and is not her People Partner.

**When** Colin's audience over Alice is resolved.

**Then** the resolver returns exactly `{colleague}` — Colleague is the fallback for anyone with no qualifying relationship, and it carries none of `self` / `reporting` / `pp`. This is the case that makes the other four meaningful: without it, every authenticated session would resolve an elevated audience. (At the route, a colleague `GET /users/:id` now returns the S1 identity card per the 2026-09-01 UM contract; the section-matrix decision on that card is a separate concern.)

**Preconditions:** [fixture](../README.md#foundation-fixture); no relationship row connects Colin and Alice in either direction.

## Test

- **subject:** `AccessControlFacade.resolveAudiences(<colin-id>, [<alice-id>])`
- **expectedResult:** the audience set for `<alice-id>` is exactly `['colleague']` — non-empty, and it does not contain `self`, `reporting`, or `pp`. Asserted with the shared `expectAudienceLabels` helper (`test/access-control/audience-resolution.e2e-spec.ts`, `ACF-AU-05` block).
