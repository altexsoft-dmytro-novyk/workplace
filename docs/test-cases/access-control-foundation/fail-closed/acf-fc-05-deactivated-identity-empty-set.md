# ACF-FC-05 · A deactivated target or viewer yields an empty audience set

**Trace:** §3.2 · AD-10 · AD-20 · ACF-1

**U-19 normative coverage:** Explicit scenario evidence for the empty-set rule production commit `9e69682` already shipped; not previously stated by any approved scenario (`R-PLAT2-04`). Not the AD-20 dismissed-target read-only projection, which remains unimplemented pending a `Departure`/`EmploymentStatus` persistence seam. See `test-design-qa.md` § Normative coverage map.

**Approved:** — (P1 `ACF-FC-05`, added 2026-09-13 under the `PLAT-E2` test-design plan; AD-1 stage approval was retired 2026-09-04, so this document proceeds through ordinary PR review rather than a scenario-approval gate.)

## Scenario

**Given** a deactivated identity (`isActive = false`) participates in a resolution either as the target being read or as the viewer doing the reading.

**When** the facade resolves audiences for that pair.

**Then** the result is an **empty** audience set — never the Colleague floor, and never Self even where the ids would otherwise match. Identity confirmation runs before any audience is derived (CAP-1): a deactivated or missing identity is not "an employee with no qualifying relationship" (which is what Colleague means), it is not a confirmed party at all, so nothing is derived for it. This is a two-sided rule and both sides are asserted:

1. **Deactivated target.** An active, unrelated viewer resolves a deactivated target: the result is `{}`, not `{colleague}`.
2. **Deactivated viewer.** A deactivated viewer resolves an otherwise-unrelated active target: the result is `{}` for every requested target, not `{colleague}`.

**Preconditions:** [fixture](../README.md#foundation-fixture); `InactiveMgr` is seeded with `isActive = false` and is reused here as, in turn, the deactivated target and the deactivated viewer.

## Test

> **Facade-level case.** Asserted at the facade, not over HTTP — there is no route contract for a deactivated identity in this suite's scope (the genuinely-empty-audience `403`/leak-free `404` split is a UM controller concern). The deviation from the `inputURL` skeleton in [../../README.md](../../README.md) is deliberate, matching `ACF-FC-02`/`ACF-FC-03`/`ACF-FC-04`.

### Test 1 — deactivated target

- **facadeCall:** `accessControl.resolveAudiences(<colin-id>, [<inactivemgr-id>])`
- **expectedResult:** the audience set for `<inactivemgr-id>` is exactly `{}` — empty, not `{colleague}`.

### Test 2 — deactivated viewer

- **facadeCall:** `accessControl.resolveAudiences(<inactivemgr-id>, [<alice-id>])`
- **expectedResult:** the audience set for `<alice-id>` is exactly `{}` — empty, not `{colleague}`, even though Alice has no relationship to InactiveMgr that would otherwise resolve to anything but Colleague.
