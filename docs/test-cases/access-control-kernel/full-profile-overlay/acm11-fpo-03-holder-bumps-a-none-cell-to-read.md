# ACM11-FPO-03 · A holder bumps a synthetic `'none'` cell to `'read'`; a non-holder does not

> **New Stage-1 scenario, PLAT-E4-S4.2c (2026-09-07). Rewritten from the
> architect's solution-design candidate (§7, `acm11-fpo-03-holder-reads-colleague-section-as-read.md`)
> per Ask First AF-6, which carries a 2026-09-07 PO ruling (Dmytro Novyk) —
> "unit-level proof only, ship it anyway."**
>
> **Why the rewrite, stated plainly.** The design's original wording proposed
> proving the overlay against a real, live section (`profile:leave`) where "an
> ordinary colleague would get the matrix's `colleague` cell." That does not
> discriminate: independently re-verified against
> `services/backend/src/access-control/domain/constants/section-access-matrix.ts:12-33`
> (read in full, HEAD `de508c9`), **every cell in all three shipped rows
> (`profile:identity`, `profile:leave`, `profile:projects`) is already `'read'`
> or `'write'` — none is `'none'`.** `AudienceResolverService.resolve`
> (`domain/services/audience-resolver.service.ts:91-102`) makes `'colleague'`
> an unconditional floor for any confirmed active target with no
> Reporting/PP relation, so `resolveSectionAccess`'s merge result is **never
> `'none'`** for any of today's three live sections, for any viewer, holder or
> not. A holder and a non-holder both already get `'read'` on `profile:leave`
> today — the original wording would pass identically whether the overlay
> branch exists or not, which is not a proof of anything.
>
> **What this scenario proves instead, honestly stated:** the overlay
> mechanism is correct at the component level, against a `jest.mock`'d
> `SECTION_ACCESS_MATRIX` module carrying one synthetic row with a `'none'`
> colleague cell — a shape no shipped section has today, but the exact shape
> `docs/project-requirements.md:169`'s S2 (Personal contacts) row already has
> in the normative requirements matrix (`Colleague: —`), and the shape any
> future section added to `SECTION_ACCESS_MATRIX` with a `'none'` cell will
> have. **This is not an HTTP-observable behavior change today.** No live
> route, and no section this codebase currently serves over HTTP, demonstrates
> a difference between a holder and a non-holder as of this dispatch. The
> mechanism becomes load-bearing the moment a future section (S2, S3, or any
> other `'—'`-cell row) is added to the live matrix — that addition is
> explicitly out of this increment's scope (Boundaries).

**Trace:**

- Spec [`spec-4-2c-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2c-full-profile-access-overlay.md) — Ask First AF-6 (the full analysis quoted above is drawn from this row, independently re-verified rather than copied on faith); Tasks & Acceptance, Stage-1 bullet for `acm11-fpo-03` ("rewritten from the design doc's version per AF-6"); I/O & Edge-Case Matrix, "Root reads an unrelated colleague's section (real section, per AF-1 reading 2, AF-6 caveat)" row.
- Solution design [`solution-design-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/access-control/solution-design-full-profile-access-overlay.md) §5.3 "Recommended integration point" — the exact overlay branch this scenario exercises: `if (best !== 'write') { const isHolder = await this.fullProfileOverlay.isHolder(viewerId); if (isHolder) { best = 'read'; } } return best;`, inserted after the existing best-of-audience loop.
- Solution design §5.4 "Open ambiguity this document will not silently resolve" — Open Question 1, resolved by the 2026-09-07 PO ruling recorded in this folder's [`../README.md`](../README.md): `best` is the merge's actual output (reading 2), not literally the `'self'` label.
- [access-control.md § Multi-audience merge](../../../architecture/access-control.md#multi-audience-merge) point 4 (`:284`) — "Full-profile is read-only: effective access is `max(Self, full-profile)` with write > read > none…" — the sentence AF-1's ruling disambiguates.
- `services/backend/src/access-control/application/access-control.facade.ts:22-25` — constructor takes `resolver` and `functionalRoles`; `fullProfileOverlay: FullProfileOverlayService` is the new, third dependency this scenario's harness must supply. `:73-76` unknown-section early return; `:78-83` audience resolution and empty-target early return (both prior to the overlay branch); `:85-93` the best-of-audience loop the overlay branch runs after.
- `services/backend/src/access-control/domain/constants/section-access-matrix.ts:12-33` — the real, unmocked matrix, exhaustively confirmed to have zero `'none'` cells across all three rows (the fact this scenario's own banner explains).

## Scenario

**Given** a component-level Nest test module wiring a real `AccessControlFacade`
with a real `AudienceResolverService` and `FunctionalRoleEvaluatorService`, a
real (not faked) `FullProfileOverlayService` backed by a `FullProfileAccessPort`
double answering `isActiveHolder(rootId) → true` and
`isActiveHolder(anyOtherId) → false`, and the `SECTION_ACCESS_MATRIX` module
`jest.mock`'d to export exactly one synthetic row —
`'fpo:synthetic-none-cell': { self: 'write', reporting: 'write', pp: 'write', colleague: 'none' }` —
instead of the real three-row matrix. Root and an unrelated active employee
(Nadia) are confirmed, active, and have no Reporting or PP relation to a
confirmed active target (Priya); Priya is neither Root nor Nadia.

**When** `AccessControlFacade.canAccessSection(rootId, 'fpo:synthetic-none-cell', priyaId)`
and `AccessControlFacade.canAccessSection(nadiaId, 'fpo:synthetic-none-cell', priyaId)`
are each called.

**Then** Root's (the holder's) call resolves `'read'` — the merge alone would
have produced `'none'` (Priya's only audience for Root is `colleague`, whose
cell on the synthetic row is `'none'`), and the overlay branch bumps it.
Nadia's (the non-holder's) call resolves `'none'`, unchanged — she is
resolved the same `colleague` audience, but `isActiveHolder(nadiaId)` is
`false`, so the overlay branch never fires for her.

**Preconditions:** migrated PostgreSQL; real `AccessControlModule` wiring for
`resolver` and `functionalRoles`; `SECTION_ACCESS_MATRIX` replaced via
`jest.mock('.../section-access-matrix', () => ({ SECTION_ACCESS_MATRIX: { 'fpo:synthetic-none-cell': {...} } }))`
for this suite file only — no production file is edited to add this row
(`git diff --stat -- .../section-access-matrix.ts` stays empty, per the spec's
own Verification table); Root, Nadia, and Priya are distinct, confirmed,
active Users with no Reporting or PP edge among them.

## Test 1 — a holder's `'none'`-cell resolution is bumped to `'read'`

- **facadeCall:** `accessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
- **input:**
  ```ts
  { viewerId: '<rootId>', section: 'fpo:synthetic-none-cell', targetEmployeeId: '<priyaId>' }
  ```
- **expectedResult:** `'read'`

## Test 2 — a non-holder's `'none'`-cell resolution is unchanged

- **facadeCall:** `accessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
- **input:**
  ```ts
  { viewerId: '<nadiaId>', section: 'fpo:synthetic-none-cell', targetEmployeeId: '<priyaId>' }
  ```
- **expectedResult:** `'none'`
