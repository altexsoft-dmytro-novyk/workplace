# ACM11-FPO-06 · Today's three live sections resolve byte-identically to pre-change behavior

> **New Stage-1 scenario, PLAT-E4-S4.2c (2026-09-07). A pass-already
> regression lock, not a red-then-green proof** — per the spec's own Stage-2
> gate declaration, this suite's expected posture is "already-passing … today's
> behavior is unchanged by a not-yet-built overlay," the same "no red state
> expected" framing
> [`S4.2b-TR-01`](../tree-root-seed/s42b-tr-01-bootstrap-writes-no-relationship-row.md)
> uses for its own absence-proof. **This is the direct, honest counterpart to
> `ACM11-FPO-03`'s finding (AF-6):** because every cell in all three live rows
> of `SECTION_ACCESS_MATRIX` is already `'read'` or `'write'` — confirmed by
> exhaustive read of
> `services/backend/src/access-control/domain/constants/section-access-matrix.ts:12-33`,
> HEAD `de508c9` — the overlay's `'none' → 'read'` bump is structurally a
> no-op against every real section this codebase serves today, for **every**
> viewer, holder or not. This file locks that no-op property for both viewer
> classes so a future Stage-3 implementation cannot regress it silently.

**Trace:**

- Spec [`spec-4-2c-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2c-full-profile-access-overlay.md) — Tasks & Acceptance, Stage-1 bullet for `acm11-fpo-06` ("an ordinary active employee (not a holder) resolves exactly today's three live matrix rows unchanged"); Tasks & Acceptance Acceptance Criteria, "Given the three real, live `SECTION_ACCESS_MATRIX` rows…, when any authenticated employee (holder or not) resolves any of them today, then the result is byte-identical to pre-change behavior."; I/O & Edge-Case Matrix, "Non-holder, ordinary employee" and "Root reads a real live section today" rows.
- Ask First AF-6 (spec, resolved 2026-09-07) — the independently re-verified finding this scenario locks: `resolveSectionAccess`'s `best` is never `'none'` for any of today's three live sections, for any confirmed active target, regardless of overlay.
- `services/backend/src/access-control/domain/constants/section-access-matrix.ts:12-33` — the real, unmocked matrix (`profile:identity`, `profile:leave`, `profile:projects`), read exhaustively, zero `'none'` cells across all twelve (3 rows × 4 audiences).
- `services/backend/src/access-control/domain/services/audience-resolver.service.ts:91-102` — the unconditional `'colleague'` floor for any confirmed active target with no Reporting/PP relation, confirmed by direct read.
- [`ACM5-SA-01`](../section-access/acm5-sa-01-s1-self-or-colleague-read.md) through [`ACM5-SA-05`](../section-access/acm5-sa-05-strongest-merged-audience-wins.md) — the pre-existing, already-approved-in-spirit `canAccessSection` scenarios this file re-proves are undisturbed, not a rewrite of them.
- Spec's Verification table — `npm run test:e2e -- acm11-full-profile-overlay-resolution` is described as "already-passing regression lock for `acm11-fpo-06`."
- **U-19 normative coverage:** Partial evidence for `TR-2.4-01` — regression lock over today's three live sections. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** a component-level Nest harness with a real `AccessControlFacade`
(real `resolver`, `functionalRoles`, and `fullProfileOverlay`) and the **real,
unmocked** `SECTION_ACCESS_MATRIX`. Root holds the overlay
(`isActiveHolder(rootId) → true`); Nadia is an ordinary active employee who
does not (`isActiveHolder(nadiaId) → false`). Neither has a Reporting or PP
relation to a confirmed active target, Priya.

**When** each of `AccessControlFacade.canAccessSection(rootId, section, priyaId)`
and `AccessControlFacade.canAccessSection(nadiaId, section, priyaId)` is
called once per section, for `section ∈ {'profile:identity', 'profile:leave', 'profile:projects'}`.

**Then** every call resolves to exactly the matrix's own `colleague` cell for
that section — `'read'` for all three rows — for **both** Root and Nadia.
Root's result is identical to Nadia's on every row: holding the overlay makes
no observable difference against any section this codebase serves today,
because the merge result is already at or above what the overlay could ever
contribute. No suite assertion anywhere in this file expects a `'none'` result
from either viewer against a real section.

**Preconditions:** migrated PostgreSQL; real `AccessControlModule` wiring; the
real, unmocked `SECTION_ACCESS_MATRIX` (no `jest.mock` in this file); Root,
Nadia, and Priya distinct, confirmed, active, with no Reporting or PP edge
among them.

## Test 1 — a non-holder's real-section results are unchanged

- **facadeCall:** `accessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
- **input:**
  ```ts
  [
    { viewerId: '<nadiaId>', section: 'profile:identity', targetEmployeeId: '<priyaId>' },
    { viewerId: '<nadiaId>', section: 'profile:leave',    targetEmployeeId: '<priyaId>' },
    { viewerId: '<nadiaId>', section: 'profile:projects', targetEmployeeId: '<priyaId>' },
  ]
  ```
- **expectedResult:** `'read'` for all three — the matrix's own `colleague`
  cell, unaffected by `isActiveHolder(nadiaId)` returning `false`.

## Test 2 — a holder's real-section results are identical to a non-holder's

- **facadeCall:** `accessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
- **input:**
  ```ts
  [
    { viewerId: '<rootId>', section: 'profile:identity', targetEmployeeId: '<priyaId>' },
    { viewerId: '<rootId>', section: 'profile:leave',    targetEmployeeId: '<priyaId>' },
    { viewerId: '<rootId>', section: 'profile:projects', targetEmployeeId: '<priyaId>' },
  ]
  ```
- **expectedResult:** `'read'` for all three — byte-identical to Test 1's
  results, even though Root holds the overlay.

  ~~The overlay branch runs (it is reached and returns `true`), but
  `maxRank('read', 'read')` leaves `best` unchanged — this is what "no
  HTTP-observable effect today" (AF-6) means concretely at the component
  level: the branch is exercised, not dead code, and still produces no
  different outcome.~~

  **CORRECTED 2026-09-07 (John, PM, code-review finding).** The shipped guard
  is `best === 'none'`, not the wider `best !== 'write'` this narrative
  originally described — `isActiveHolder` is **not** called for an
  already-`'read'` result; the branch is skipped entirely, since the overlay
  can provably never change a result that is already at or above `'read'`.
  This test's own assertion is unaffected by the correction: it checks only
  the resulting `SectionAccess` value, never a call count on
  `isActiveHolder`, so `'read'` for all three rows was, is, and remains the
  correct expectation either way. What "no HTTP-observable effect today"
  (AF-6) demonstrates here is unchanged too: a holder's real-section result
  is still byte-identical to a non-holder's — the regression lock this
  scenario exists to prove holds regardless of which guard produces it.
